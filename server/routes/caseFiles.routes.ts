import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const caseFilesRouter = Router();

function formatCaseFile(row: any) {
  if (!row) return null;

  // Timeline events
  const timelineRows = db.prepare(`
    SELECT * FROM case_timeline_events
    WHERE case_file_id = ?
    ORDER BY date ASC, sort_order ASC
  `).all(row.id) as any[];

  const timeline = timelineRows.map((t) => ({
    id: t.id,
    date: t.date,
    time: t.time || undefined,
    headline: t.headline,
    description: t.description,
    verificationStatus: t.verification_status,
  }));

  // Attached articles
  const articleRows = db.prepare(`
    SELECT a.id, a.title, a.slug, a.category_slug, a.published_at, a.hero_image, a.excerpt
    FROM articles a
    JOIN case_file_articles cfa ON a.id = cfa.article_id
    WHERE cfa.case_file_id = ?
    ORDER BY a.published_at DESC
  `).all(row.id) as any[];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    location: JSON.parse(row.location || '{}'),
    status: row.status,
    category: row.category,
    incidentType: row.incident_type,
    leadImage: row.lead_image,
    whatIsConfirmed: JSON.parse(row.what_is_confirmed || '[]'),
    whatIsAlleged: JSON.parse(row.what_is_alleged || '[]'),
    keyParties: JSON.parse(row.key_parties || '[]'),
    primaryDocuments: JSON.parse(row.primary_documents || '[]'),
    timeline,
    attachedArticles: articleRows,
    lastUpdated: row.last_updated,
    createdAt: row.created_at,
  };
}

// GET /api/case-files - List with search and status
caseFilesRouter.get('/', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM case_files';
  const where: string[] = [];
  const params: any[] = [];

  if (status && status !== 'All') {
    where.push('status = ?');
    params.push(status);
  }

  if (search) {
    const q = `%${(search as string).toLowerCase()}%`;
    where.push('(LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(id) LIKE ?)');
    params.push(q, q, q);
  }

  if (where.length > 0) {
    query += ' WHERE ' + where.join(' AND ');
  }

  query += ' ORDER BY last_updated DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(formatCaseFile));
});

// GET /api/case-files/:id
caseFilesRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM case_files WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!row) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }
  res.json(formatCaseFile(row));
});

// POST /api/case-files (Admin / Editor)
caseFilesRouter.post('/', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const {
    id,
    title,
    summary,
    location,
    status = 'Investigating',
    category = 'Temple & Heritage',
    incidentType = 'General Case',
    leadImage,
    whatIsConfirmed = [],
    whatIsAlleged = [],
    keyParties = [],
    primaryDocuments = [],
    timeline = [],
    attachedArticleIds = [],
  } = req.body;

  if (!title || !summary) {
    res.status(400).json({ error: 'Title and summary are required.' });
    return;
  }

  const caseId = id ? id.trim().toLowerCase() : `dw-case-${Date.now().toString(36)}`;
  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO case_files (
      id, title, slug, summary, location, status, category, incident_type,
      lead_image, what_is_confirmed, what_is_alleged, key_parties, primary_documents,
      last_updated, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    caseId,
    title.trim(),
    slug,
    summary.trim(),
    JSON.stringify(location || { country: 'India' }),
    status,
    category,
    incidentType,
    leadImage || null,
    JSON.stringify(whatIsConfirmed),
    JSON.stringify(whatIsAlleged),
    JSON.stringify(keyParties),
    JSON.stringify(primaryDocuments),
    now.slice(0, 10),
    now
  );

  // Timeline Events
  if (Array.isArray(timeline)) {
    const insertTimeline = db.prepare(`
      INSERT INTO case_timeline_events (id, case_file_id, date, time, headline, description, verification_status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    timeline.forEach((evt: any, idx: number) => {
      insertTimeline.run(
        evt.id || `evt-${caseId}-${idx}`,
        caseId,
        evt.date || now.slice(0, 10),
        evt.time || null,
        evt.headline || 'Update',
        evt.description || '',
        evt.verificationStatus || 'Verified',
        idx
      );
    });
  }

  // Attached Articles
  if (Array.isArray(attachedArticleIds)) {
    const linkArticle = db.prepare('INSERT OR IGNORE INTO case_file_articles (case_file_id, article_id) VALUES (?, ?)');
    attachedArticleIds.forEach((artId: string) => {
      linkArticle.run(caseId, artId);
    });
  }

  logAuditEvent(req, {
    action: 'CASE_FILE_CREATED',
    targetType: 'case_file',
    targetId: caseId,
    targetTitle: title,
    details: `Created new investigative case file [${caseId}]`,
  });

  const created = db.prepare('SELECT * FROM case_files WHERE id = ?').get(caseId);
  res.status(201).json(formatCaseFile(created));
});

// PUT /api/case-files/:id
caseFilesRouter.put('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const caseId = req.params.id;
  const existing = db.prepare('SELECT * FROM case_files WHERE id = ?').get(caseId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }

  const {
    title,
    summary,
    location,
    status,
    category,
    incidentType,
    leadImage,
    whatIsConfirmed,
    whatIsAlleged,
    keyParties,
    primaryDocuments,
    timeline,
    attachedArticleIds,
  } = req.body;

  const now = new Date().toISOString();
  const slug = req.body.slug !== undefined
    ? req.body.slug.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
    : (title ? title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') : existing.slug);

  db.prepare(`
    UPDATE case_files SET
      title = ?,
      slug = ?,
      summary = ?,
      location = ?,
      status = ?,
      category = ?,
      incident_type = ?,
      lead_image = ?,
      what_is_confirmed = ?,
      what_is_alleged = ?,
      key_parties = ?,
      primary_documents = ?,
      last_updated = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : existing.title,
    slug,
    summary !== undefined ? summary.trim() : existing.summary,
    JSON.stringify(location !== undefined ? location : JSON.parse(existing.location || '{}')),
    status || existing.status,
    category || existing.category,
    incidentType || existing.incident_type,
    leadImage !== undefined ? leadImage : existing.lead_image,
    JSON.stringify(whatIsConfirmed !== undefined ? whatIsConfirmed : JSON.parse(existing.what_is_confirmed || '[]')),
    JSON.stringify(whatIsAlleged !== undefined ? whatIsAlleged : JSON.parse(existing.what_is_alleged || '[]')),
    JSON.stringify(keyParties !== undefined ? keyParties : JSON.parse(existing.key_parties || '[]')),
    JSON.stringify(primaryDocuments !== undefined ? primaryDocuments : JSON.parse(existing.primary_documents || '[]')),
    now.slice(0, 10),
    caseId
  );

  if (Array.isArray(timeline)) {
    db.prepare('DELETE FROM case_timeline_events WHERE case_file_id = ?').run(caseId);
    const insertTimeline = db.prepare(`
      INSERT INTO case_timeline_events (id, case_file_id, date, time, headline, description, verification_status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    timeline.forEach((evt: any, idx: number) => {
      insertTimeline.run(
        evt.id || `evt-${caseId}-${idx}`,
        caseId,
        evt.date,
        evt.time || null,
        evt.headline,
        evt.description,
        evt.verificationStatus,
        idx
      );
    });
  }

  if (Array.isArray(attachedArticleIds)) {
    db.prepare('DELETE FROM case_file_articles WHERE case_file_id = ?').run(caseId);
    const linkArticle = db.prepare('INSERT OR IGNORE INTO case_file_articles (case_file_id, article_id) VALUES (?, ?)');
    attachedArticleIds.forEach((artId: string) => {
      linkArticle.run(caseId, artId);
    });
  }

  logAuditEvent(req, {
    action: 'CASE_FILE_UPDATED',
    targetType: 'case_file',
    targetId: caseId,
    targetTitle: title || existing.title,
    details: 'Updated case file details and timeline',
  });

  const updated = db.prepare('SELECT * FROM case_files WHERE id = ?').get(caseId);
  res.json(formatCaseFile(updated));
});

// DELETE /api/case-files/:id
caseFilesRouter.delete('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM case_files WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }

  db.prepare('DELETE FROM case_timeline_events WHERE case_file_id = ?').run(req.params.id);
  db.prepare('DELETE FROM case_file_articles WHERE case_file_id = ?').run(req.params.id);
  db.prepare('DELETE FROM case_files WHERE id = ?').run(req.params.id);

  logAuditEvent(req, {
    action: 'CASE_FILE_DELETED',
    targetType: 'case_file',
    targetId: req.params.id,
    targetTitle: existing.title,
    details: 'Permanently deleted case file dossier',
  });

  res.json({ success: true, message: 'Case file deleted.' });
});
