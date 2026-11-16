import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

export const auditRouter = Router();

// GET /api/audit-log - Protected append-only record
auditRouter.get('/', authenticateToken, requireRole(['admin', 'editor']), (req, res) => {
  const { search, action, limit = '50', offset = '0' } = req.query;

  let query = 'SELECT * FROM audit_logs';
  const where: string[] = [];
  const params: any[] = [];

  if (action && action !== 'ALL') {
    where.push('action = ?');
    params.push(action);
  }

  if (search) {
    const q = `%${(search as string).toLowerCase()}%`;
    where.push('(LOWER(user_name) LIKE ? OR LOWER(target_title) LIKE ? OR LOWER(action) LIKE ? OR LOWER(details) LIKE ?)');
    params.push(q, q, q, q);
  }

  if (where.length > 0) {
    query += ' WHERE ' + where.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const total = (db.prepare(countQuery).get(...params) as { count: number }).count;

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

  const items = db.prepare(query).all(...params);

  res.json({
    data: items,
    total,
    page: Math.floor(parseInt(offset as string, 10) / parseInt(limit as string, 10)) + 1,
  });
});
