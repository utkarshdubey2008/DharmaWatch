import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const correctionsRouter = Router();

// GET /api/corrections - Public & Admin
correctionsRouter.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, a.title as article_title, a.slug as article_slug, a.category
    FROM corrections c
    LEFT JOIN articles a ON c.article_id = a.id
    ORDER BY c.correction_date DESC
  `).all() as any[];

  const formatted = rows.map((r) => ({
    id: r.id,
    articleId: r.article_id,
    articleTitle: r.article_title || 'Published Article',
    articleSlug: r.article_slug || '',
    category: r.category || 'News',
    correctionDate: r.correction_date,
    originalPublicationDate: r.original_publication_date,
    whatWasChanged: r.what_was_changed,
    reasonForCorrection: r.reason,
    createdBy: r.created_by,
  }));

  res.json(formatted);
});

// POST /api/corrections - Issue new correction (Admin / Editor)
correctionsRouter.post('/', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const { articleId, whatWasChanged, reason, correctionDate } = req.body;
  if (!articleId || !whatWasChanged || !reason) {
    res.status(400).json({ error: 'Article ID, change summary, and editorial reason are required.' });
    return;
  }

  const article = db.prepare('SELECT id, title, published_at FROM articles WHERE id = ?').get(articleId) as any;
  if (!article) {
    res.status(404).json({ error: 'Referenced article not found.' });
    return;
  }

  const now = new Date().toISOString();
  const corrId = `corr-${Date.now().toString(36)}`;

  db.prepare(`
    INSERT INTO corrections (id, article_id, correction_date, original_publication_date, what_was_changed, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    corrId,
    article.id,
    correctionDate || now,
    article.published_at,
    whatWasChanged.trim(),
    reason.trim(),
    req.user!.id,
    now
  );

  // Update article's updated_at timestamp & status to 'corrected'
  db.prepare(`
    UPDATE articles SET updated_at = ?, status = 'corrected' WHERE id = ?
  `).run(now, article.id);

  logAuditEvent(req, {
    action: 'CORRECTION_ISSUED',
    targetType: 'correction',
    targetId: corrId,
    targetTitle: article.title,
    details: `Issued formal correction: ${whatWasChanged.slice(0, 100)}...`,
  });

  res.status(201).json({ success: true, correctionId: corrId });
});

// DELETE /api/corrections/:id (Admin only)
correctionsRouter.delete('/:id', authenticateToken, requireRole(['admin']), (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM corrections WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Correction not found.' });
    return;
  }

  db.prepare('DELETE FROM corrections WHERE id = ?').run(req.params.id);

  logAuditEvent(req, {
    action: 'CORRECTION_DELETED',
    targetType: 'correction',
    targetId: req.params.id,
    targetTitle: 'Correction Entry',
    details: 'Removed correction record',
  });

  res.json({ success: true, message: 'Correction removed.' });
});
