import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dharmawatch-super-secret-key-2026-prod';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'reporter' | 'contributor';
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: { id: string; username: string; email: string; role: string; full_name: string }): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const tokenFromCookie = req.cookies ? req.cookies['dw_auth_token'] : null;
  const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : null;

  const token = tokenFromHeader || tokenFromCookie || tokenFromQuery;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in to DharmaWatch Admin.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Check if user is still active in database
    const userRow = db.prepare('SELECT is_active FROM users WHERE id = ?').get(decoded.id) as { is_active: number } | undefined;
    if (!userRow || userRow.is_active !== 1) {
      res.status(403).json({ error: 'Account has been deactivated or removed.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireRole(allowedRoles: ('admin' | 'editor' | 'reporter' | 'contributor')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Action requires one of: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}

export function logAuditEvent(
  req: AuthRequest,
  params: {
    action: string;
    targetType: string;
    targetId: string;
    targetTitle: string;
    details?: string;
  }
) {
  try {
    const userId = req?.user ? req.user.id : 'system';
    const userName = req?.user ? req.user.fullName : 'System';
    const ipAddress = req?.ip || (req?.headers ? (req.headers['x-forwarded-for'] as string) : '127.0.0.1') || '127.0.0.1';
    const logId = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, target_type, target_id, target_title, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      userId,
      userName,
      params.action,
      params.targetType,
      params.targetId,
      params.targetTitle,
      params.details || null,
      ipAddress,
      now
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
