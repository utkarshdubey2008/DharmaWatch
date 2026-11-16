import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

export const subscribersRouter = Router();

// POST /api/subscribers - Public subscription
subscribersRouter.post('/', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const subId = `sub-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO subscribers (id, email, source, status, created_at)
      VALUES (?, ?, 'homepage_footer', 'active', ?)
    `).run(subId, cleanEmail, now);
    res.status(201).json({ success: true, message: 'Successfully subscribed to DharmaWatch Dispatch.' });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      res.json({ success: true, message: 'You are already subscribed to DharmaWatch Dispatch.' });
    } else {
      res.status(500).json({ error: 'Failed to record subscription.' });
    }
  }
});

// GET /api/subscribers - Admin list
subscribersRouter.get('/', authenticateToken, requireRole(['admin', 'editor']), (req, res) => {
  const { limit = '50', offset = '0' } = req.query;

  const total = (db.prepare('SELECT COUNT(*) as c FROM subscribers').get() as { c: number }).c;
  const active = (db.prepare("SELECT COUNT(*) as c FROM subscribers WHERE status = 'active'").get() as { c: number }).c;

  const list = db.prepare(`
    SELECT id, email, source, status, created_at
    FROM subscribers
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(parseInt(limit as string, 10), parseInt(offset as string, 10));

  res.json({
    data: list,
    total,
    active,
    unsubscribed: total - active,
  });
});

// GET /api/subscribers/export - Export CSV
subscribersRouter.get('/export', authenticateToken, requireRole(['admin', 'editor']), (req, res) => {
  const rows = db.prepare('SELECT email, status, created_at FROM subscribers ORDER BY created_at DESC').all() as any[];
  let csv = 'Email,Status,SubscribedDate\n';
  rows.forEach((r) => {
    csv += `"${r.email}","${r.status}","${r.created_at}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="dharmawatch_subscribers.csv"');
  res.send(csv);
});
