import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateToken, AuthRequest, logAuditEvent } from '../auth.js';

export const authRouter = Router();

// Rate limiting map for brute force prevention
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

authRouter.post('/login', (req, res) => {
  const identifier = (req.body.identifier || req.body.username || req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  const ip = req.ip || '127.0.0.1';

  // Brute force protection check
  const attempt = loginAttempts.get(ip);
  if (attempt && attempt.count >= 5 && Date.now() - attempt.lastAttempt < 15 * 60 * 1000) {
    res.status(429).json({ error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' });
    return;
  }

  if (!identifier || !password) {
    res.status(400).json({ error: 'Username or email and password are required.' });
    return;
  }

  const user = db.prepare(`
    SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1
  `).get(identifier, identifier) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    // Record failed attempt
    const current = attempt ? attempt.count + 1 : 1;
    loginAttempts.set(ip, { count: current, lastAttempt: Date.now() });
    res.status(401).json({ error: 'Invalid credentials or account is inactive.' });
    return;
  }

  // Clear failed attempts on success
  loginAttempts.delete(ip);

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });

  // Set secure HTTP-only cookie
  res.cookie('dw_auth_token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  logAuditEvent({ user: { id: user.id, fullName: user.full_name } } as any, {
    action: 'USER_LOGIN',
    targetType: 'user',
    targetId: user.id,
    targetTitle: user.username,
    details: `Successful newsroom login from ${ip}`,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      avatar: user.avatar,
    },
  });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('dw_auth_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

authRouter.get('/me', authenticateToken, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, username, email, role, full_name, avatar, is_active FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      avatar: user.avatar,
    },
  });
});

authRouter.put('/profile', authenticateToken, (req: AuthRequest, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      res.status(400).json({ error: 'Current password does not match.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, new Date().toISOString(), userId);
  }

  const updatedName = fullName ? fullName.trim() : user.full_name;
  const updatedEmail = email ? email.trim().toLowerCase() : user.email;

  db.prepare(`
    UPDATE users SET full_name = ?, email = ?, updated_at = ? WHERE id = ?
  `).run(updatedName, updatedEmail, new Date().toISOString(), userId);

  logAuditEvent(req, {
    action: 'PROFILE_UPDATED',
    targetType: 'user',
    targetId: userId,
    targetTitle: user.username,
    details: 'User updated personal profile details',
  });

  res.json({ success: true, message: 'Profile updated successfully.' });
});
