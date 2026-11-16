import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const homepageRouter = Router();

// GET /api/homepage - Returns assigned slots with populated items
homepageRouter.get('/', (req, res) => {
  const slots = db.prepare('SELECT * FROM homepage_slots').all() as any[];
  const result: Record<string, any> = {};

  for (const slot of slots) {
    if (slot.reference_type === 'article') {
      const art = db.prepare('SELECT * FROM articles WHERE id = ?').get(slot.reference_id) as any;
      if (art) {
        result[slot.slot_name] = {
          slotName: slot.slot_name,
          referenceId: slot.reference_id,
          referenceType: 'article',
          item: {
            id: art.id,
            title: art.title,
            slug: art.slug,
            deck: art.deck,
            category: art.category,
            categorySlug: art.category_slug,
            heroImage: art.hero_image,
            excerpt: art.excerpt,
            publishedAt: art.published_at,
            isLead: Boolean(art.is_lead),
            isBreaking: Boolean(art.is_breaking),
            isOpinion: Boolean(art.is_opinion),
            isInvestigation: Boolean(art.is_investigation),
          },
        };
      }
    } else if (slot.reference_type === 'case_file') {
      const cf = db.prepare('SELECT * FROM case_files WHERE id = ?').get(slot.reference_id) as any;
      if (cf) {
        result[slot.slot_name] = {
          slotName: slot.slot_name,
          referenceId: slot.reference_id,
          referenceType: 'case_file',
          item: {
            id: cf.id,
            title: cf.title,
            slug: cf.slug,
            summary: cf.summary,
            status: cf.status,
            category: cf.category,
            leadImage: cf.lead_image,
            lastUpdated: cf.last_updated,
          },
        };
      }
    }
  }

  res.json({ slots: result });
});

// GET /api/homepage/lead - Returns lead story article directly
homepageRouter.get('/lead', (req, res) => {
  try {
    const slot = db.prepare("SELECT * FROM homepage_slots WHERE slot_name = 'lead_story'").get() as any;
    let art: any = null;
    if (slot && slot.reference_id) {
      art = db.prepare("SELECT * FROM articles WHERE id = ?").get(slot.reference_id);
    }
    if (!art) {
      art = db.prepare("SELECT * FROM articles WHERE is_lead = 1 AND status = 'published' ORDER BY published_at DESC LIMIT 1").get()
        || db.prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 1").get();
    }
    if (!art) {
      res.status(404).json({ error: 'No lead article found' });
      return;
    }

    const authorRow = db.prepare('SELECT * FROM authors WHERE id = ?').get(art.author_id) as any;
    const author = authorRow
      ? {
          id: authorRow.id,
          name: authorRow.name,
          slug: authorRow.slug,
          role: authorRow.role,
          bio: authorRow.bio,
          avatar: authorRow.avatar,
        }
      : {
          id: art.author_id || 'editorial-desk',
          name: 'Dharma Watch Staff',
          slug: 'dharma-watch-staff',
          role: 'Investigative Newsroom',
          avatar: '',
        };

    const sources = db.prepare(`
      SELECT s.* FROM sources s
      JOIN article_sources ast ON s.id = ast.source_id
      WHERE ast.article_id = ?
      ORDER BY ast.sort_order ASC
    `).all(art.id) as any[];

    res.json({
      ...art,
      author,
      sources,
      categorySlug: art.category_slug,
      heroImage: art.hero_image,
      publishedAt: art.published_at,
      updatedAt: art.updated_at,
      isLead: Boolean(art.is_lead),
      isBreaking: Boolean(art.is_breaking),
      isOpinion: Boolean(art.is_opinion),
      isInvestigation: Boolean(art.is_investigation),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/homepage/slots - Update assignments for slots (Admin / Editor)
homepageRouter.post('/slots', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const { slots } = req.body; // Array of { slotName, referenceId, referenceType }
  if (!Array.isArray(slots)) {
    res.status(400).json({ error: 'slots must be an array of slot assignments.' });
    return;
  }

  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slot_name) DO UPDATE SET
      reference_id = excluded.reference_id,
      reference_type = excluded.reference_type,
      updated_at = excluded.updated_at
  `);

  for (const s of slots) {
    if (s.slotName && s.referenceId) {
      upsert.run(
        `slot-${s.slotName}`,
        s.slotName,
        s.referenceId,
        s.referenceType || 'article',
        now
      );

      // If assigning lead story, also set is_lead on that article
      if (s.slotName === 'lead_story') {
        db.prepare('UPDATE articles SET is_lead = 0').run();
        db.prepare('UPDATE articles SET is_lead = 1 WHERE id = ?').run(s.referenceId);
      }
      if (s.slotName === 'breaking') {
        db.prepare('UPDATE articles SET is_breaking = 0').run();
        db.prepare('UPDATE articles SET is_breaking = 1 WHERE id = ?').run(s.referenceId);
      }
    } else if (s.slotName && !s.referenceId) {
      // Clear slot assignment
      db.prepare('DELETE FROM homepage_slots WHERE slot_name = ?').run(s.slotName);
      if (s.slotName === 'lead_story') {
        db.prepare('UPDATE articles SET is_lead = 0').run();
      }
      if (s.slotName === 'breaking') {
        db.prepare('UPDATE articles SET is_breaking = 0').run();
      }
    }
  }

  logAuditEvent(req, {
    action: 'HOMEPAGE_UPDATED',
    targetType: 'homepage',
    targetId: 'layout',
    targetTitle: 'Homepage Curated Desk Slots',
    details: `Updated ${slots.length} curated slots`,
  });

  res.json({ success: true, message: 'Homepage slots updated successfully.' });
});
