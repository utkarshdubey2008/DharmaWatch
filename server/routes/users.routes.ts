import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const usersRouter = Router();

// All routes here require ADMIN role
usersRouter.use(authenticateToken, requireRole(['admin']));

// GET /api/users
usersRouter.get('/', (req, res) => {
  const users = db.prepare(`
    SELECT id, username, email, role, full_name, avatar, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at ASC
  `).all();
  res.json(users);
});

// POST /api/users
usersRouter.post('/', (req: AuthRequest, res) => {
  const { username, email, password, role = 'reporter', fullName, avatar } = req.body;
  if (!username || !email || !password || !fullName) {
    res.status(400).json({ error: 'Username, email, password, and full name are required.' });
    return;
  }

  if (!['admin', 'editor', 'reporter', 'contributor'].includes(role)) {
    res.status(400).json({ error: 'Invalid role. Must be admin, editor, reporter, or contributor.' });
    return;
  }

  // Check unique username & email
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username.trim().toLowerCase(), email.trim().toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'Username or email already in use.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, full_name, avatar, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    userId,
    username.trim().toLowerCase(),
    email.trim().toLowerCase(),
    passwordHash,
    role,
    fullName.trim(),
    avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    now,
    now
  );

  logAuditEvent(req, {
    action: 'USER_CREATED',
    targetType: 'user',
    targetId: userId,
    targetTitle: username,
    details: `Created newsroom user [Role: ${role.toUpperCase()}]`,
  });

  const created = db.prepare('SELECT id, username, email, role, full_name, avatar, is_active FROM users WHERE id = ?').get(userId);
  res.status(201).json(created);
});

// PUT /api/users/:id
usersRouter.put('/:id', (req: AuthRequest, res) => {
  const { role, fullName, email, isActive, password } = req.body;
  const targetId = req.params.id;

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const now = new Date().toISOString();

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(password, salt);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, targetId);
  }

  db.prepare(`
    UPDATE users SET
      role = ?,
      full_name = ?,
      email = ?,
      is_active = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    role || existing.role,
    fullName ? fullName.trim() : existing.full_name,
    email ? email.trim().toLowerCase() : existing.email,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    now,
    targetId
  );

  logAuditEvent(req, {
    action: 'USER_UPDATED',
    targetType: 'user',
    targetId,
    targetTitle: existing.username,
    details: `Updated user permissions/status [Role: ${role || existing.role}, Active: ${isActive}]`,
  });

  const updated = db.prepare('SELECT id, username, email, role, full_name, avatar, is_active FROM users WHERE id = ?').get(targetId);
  res.json(updated);
});

// DELETE /api/users/:id
usersRouter.delete('/:id', (req: AuthRequest, res) => {
  const targetId = req.params.id;
  if (targetId === req.user!.id) {
    res.status(400).json({ error: 'Cannot delete your own administrative account.' });
    return;
  }

  const existing = db.prepare('SELECT username FROM users WHERE id = ?').get(targetId) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

  logAuditEvent(req, {
    action: 'USER_DELETED',
    targetType: 'user',
    targetId,
    targetTitle: existing.username,
    details: 'Permanently deleted user account',
  });

  res.json({ success: true, message: 'User deleted.' });
});
