import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticateToken);

// GET /api/notifications
notificationsRouter.get('/', (req: AuthRequest, res) => {
  const notifs = db.prepare(`
    SELECT * FROM notifications
    ORDER BY created_at DESC
    LIMIT 20
  `).all();
  res.json(notifs);
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PUT /api/notifications/read-all
notificationsRouter.put('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ success: true });
});
