import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const mediaRouter = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^\w-]/g, '_');
    const unique = `${cleanName}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

// File filter: images, videos, audio, and PDF documents
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedPrefixes = ['image/', 'video/', 'audio/'];
  const allowedTypes = ['application/pdf'];
  const isAllowed = allowedPrefixes.some(p => file.mimetype.startsWith(p)) || allowedTypes.includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only Images, Videos, Audio, and PDF documents are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max size
  },
});

// GET /api/media - Central media library list
mediaRouter.get('/', authenticateToken, (req, res) => {
  const { search, type, limit = '24', offset = '0' } = req.query;
  let query = 'SELECT * FROM media';
  const where: string[] = [];
  const params: any[] = [];

  if (search) {
    const q = `%${(search as string).toLowerCase()}%`;
    where.push('(LOWER(filename) LIKE ? OR LOWER(original_name) LIKE ? OR LOWER(alt_text) LIKE ?)');
    params.push(q, q, q);
  }

  if (type === 'images') {
    where.push("mime_type LIKE 'image/%'");
  } else if (type === 'videos') {
    where.push("mime_type LIKE 'video/%'");
  } else if (type === 'documents') {
    where.push("mime_type = 'application/pdf'");
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
    media: items,
    total,
    page: Math.floor(parseInt(offset as string, 10) / parseInt(limit as string, 10)) + 1,
  });
});

// POST /api/media/upload - Upload new media file
mediaRouter.post('/upload', authenticateToken, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or file failed validation.' });
    return;
  }

  const user = req.user!;
  const altText = req.body.altText || req.body.alt_text || req.file.originalname;
  const caption = req.body.caption || '';
  const fileId = `med-${Date.now().toString(36)}`;
  const fileUrl = `/uploads/${req.file.filename}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO media (id, filename, original_name, url, mime_type, file_size, dimensions, uploaded_by, alt_text, caption, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    fileId,
    req.file.filename,
    req.file.originalname,
    fileUrl,
    req.file.mimetype,
    req.file.size,
    req.body.dimensions || null,
    user.fullName,
    altText.trim() || req.file.originalname,
    caption.trim() || null,
    now
  );

  logAuditEvent(req, {
    action: 'MEDIA_UPLOADED',
    targetType: 'media',
    targetId: fileId,
    targetTitle: req.file.originalname,
    details: `Uploaded ${req.file.mimetype} (${Math.round(req.file.size / 1024)} KB)`,
  });

  const created = db.prepare('SELECT * FROM media WHERE id = ?').get(fileId);
  res.status(201).json(created);
});

// PUT /api/media/:id - Update alt text or caption
mediaRouter.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { altText, caption } = req.body;
  const existing = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Media not found.' });
    return;
  }

  db.prepare(`
    UPDATE media SET alt_text = ?, caption = ? WHERE id = ?
  `).run(altText !== undefined ? altText : existing.alt_text, caption !== undefined ? caption : existing.caption, req.params.id);

  res.json({ success: true, message: 'Media metadata updated.' });
});

// DELETE /api/media/:id
mediaRouter.delete('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const existing = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Media not found.' });
    return;
  }

  // Delete physical file if exists
  const filePath = path.join(uploadsDir, existing.filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Failed to unlink file:', e);
    }
  }

  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);

  logAuditEvent(req, {
    action: 'MEDIA_DELETED',
    targetType: 'media',
    targetId: req.params.id,
    targetTitle: existing.original_name,
    details: 'Permanently deleted media file',
  });

  res.json({ success: true, message: 'Media deleted.' });
});
