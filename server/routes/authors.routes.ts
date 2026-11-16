import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const authorsRouter = Router();

// GET /api/authors
authorsRouter.get('/', (req, res) => {
  const authors = db.prepare('SELECT * FROM authors WHERE is_active = 1 ORDER BY name ASC').all() as any[];
  const formatted = authors.map((a) => {
    // Count published articles
    const count = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE author_id = ? AND status IN ('published', 'updated', 'correction')").get(a.id) as { c: number }).c;
    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      role: a.role,
      bio: a.bio,
      avatar: a.avatar,
      email: a.email,
      pgpKeyFingerprint: a.pgp_key,
      areasOfCoverage: JSON.parse(a.areas_of_coverage || '[]'),
      articleCount: count,
      createdAt: a.created_at,
    };
  });
  res.json(formatted);
});

// GET /api/authors/:id (or /slug/:slug)
authorsRouter.get('/:id', (req, res) => {
  const a = db.prepare('SELECT * FROM authors WHERE id = ? OR slug = ?').get(req.params.id, req.params.id) as any;
  if (!a) {
    res.status(404).json({ error: 'Author not found.' });
    return;
  }
  const count = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE author_id = ? AND status IN ('published', 'updated', 'correction')").get(a.id) as { c: number }).c;
  res.json({
    id: a.id,
    name: a.name,
    slug: a.slug,
    role: a.role,
    bio: a.bio,
    avatar: a.avatar,
    email: a.email,
    pgpKeyFingerprint: a.pgp_key,
    areasOfCoverage: JSON.parse(a.areas_of_coverage || '[]'),
    articleCount: count,
    createdAt: a.created_at,
  });
});

// POST /api/authors (Admin / Editor)
authorsRouter.post('/', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const { name, role, bio, avatar, email, pgpKey, areasOfCoverage = [] } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: 'Name and role are required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const id = `au-${slug}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO authors (id, name, slug, role, bio, avatar, email, pgp_key, areas_of_coverage, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    id,
    name.trim(),
    slug,
    role.trim(),
    bio ? bio.trim() : '',
    avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email || null,
    pgpKey || null,
    JSON.stringify(areasOfCoverage),
    now,
    now
  );

  logAuditEvent(req, {
    action: 'AUTHOR_CREATED',
    targetType: 'author',
    targetId: id,
    targetTitle: name,
    details: `Added new newsroom author profile: ${role}`,
  });

  const created = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
  res.status(201).json(created);
});

// PUT /api/authors/:id (Admin / Editor)
authorsRouter.put('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const { name, role, bio, avatar, email, pgpKey, areasOfCoverage } = req.body;
  const existing = db.prepare('SELECT * FROM authors WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Author not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE authors SET
      name = ?,
      role = ?,
      bio = ?,
      avatar = ?,
      email = ?,
      pgp_key = ?,
      areas_of_coverage = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name.trim() : existing.name,
    role !== undefined ? role.trim() : existing.role,
    bio !== undefined ? bio.trim() : existing.bio,
    avatar !== undefined ? avatar : existing.avatar,
    email !== undefined ? email : existing.email,
    pgpKey !== undefined ? pgpKey : existing.pgp_key,
    areasOfCoverage !== undefined ? JSON.stringify(areasOfCoverage) : existing.areas_of_coverage,
    now,
    req.params.id
  );

  logAuditEvent(req, {
    action: 'AUTHOR_UPDATED',
    targetType: 'author',
    targetId: req.params.id,
    targetTitle: name || existing.name,
    details: 'Updated author profile metadata',
  });

  const updated = db.prepare('SELECT * FROM authors WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/authors/:id (Admin only)
authorsRouter.delete('/:id', authenticateToken, requireRole(['admin']), (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM authors WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Author not found.' });
    return;
  }

  // Deactivate author
  db.prepare('UPDATE authors SET is_active = 0 WHERE id = ?').run(req.params.id);

  logAuditEvent(req, {
    action: 'AUTHOR_DEACTIVATED',
    targetType: 'author',
    targetId: req.params.id,
    targetTitle: existing.name,
    details: 'Deactivated newsroom author profile',
  });

  res.json({ success: true, message: 'Author deactivated.' });
});
