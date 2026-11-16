import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
  const map: Record<string, string> = {};
  rows.forEach((r) => {
    map[r.key] = r.value;
  });
  res.json(map);
});

// PUT /api/settings (Admin only)
settingsRouter.put('/', authenticateToken, requireRole(['admin']), (req: AuthRequest, res) => {
  const updates = req.body; // Record<string, string>
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

  for (const [key, value] of Object.entries(updates)) {
    upsert.run(key, String(value), now);
  }

  logAuditEvent(req, {
    action: 'SETTINGS_UPDATED',
    targetType: 'settings',
    targetId: 'global',
    targetTitle: 'Publication Configuration',
    details: `Updated keys: ${Object.keys(updates).join(', ')}`,
  });

  res.json({ success: true, message: 'Settings updated successfully.' });
});
