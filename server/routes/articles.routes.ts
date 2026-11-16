import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const articlesRouter = Router();

const PUBLIC_DOMAIN = (process.env.PUBLIC_DOMAIN || 'https://thedharmawatch.in').replace(/\/$/, '');

// Helper to format an article row from the database into the full domain model
function formatArticle(row: any) {
  if (!row) return null;

  // Load Author
  const authorRow = db.prepare('SELECT * FROM authors WHERE id = ?').get(row.author_id) as any;
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
        id: row.author_id,
        name: 'DharmaWatch Editorial Desk',
        slug: 'editorial-desk',
        role: 'Newsroom Staff',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

  // Load Sources
  const sourceRows = db.prepare(`
    SELECT DISTINCT s.* FROM sources s
    JOIN article_sources ast ON s.id = ast.source_id
    WHERE ast.article_id = ?
    ORDER BY ast.sort_order ASC
  `).all(row.id) as any[];

  const uniqueSourceRows = Array.from(new Map(sourceRows.map((s: any) => [s.id, s])).values());

  const sources = uniqueSourceRows.map((s: any) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher,
    sourceType: s.source_type,
    classification: s.classification,
    publicationDate: s.publication_date,
    url: s.url,
    documentNumber: s.document_number,
    notes: s.notes,
  }));

  // Load Corrections
  const corrRows = db.prepare('SELECT * FROM corrections WHERE article_id = ? ORDER BY correction_date DESC').all(row.id) as any[];
  const corrections = corrRows.map((c) => ({
    id: c.id,
    date: c.correction_date,
    originalDate: c.original_publication_date,
    whatWasChanged: c.what_was_changed,
    reason: c.reason,
  }));

  let content: string[] = [];
  try {
    content = JSON.parse(row.content || '[]');
  } catch (e) {
    content = [row.content || ''];
  }

  let pullQuotes: string[] = [];
  try {
    pullQuotes = JSON.parse(row.pull_quotes || '[]');
  } catch (e) {}

  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || '[]');
  } catch (e) {}

  let location = { country: 'India' };
  try {
    location = JSON.parse(row.location || '{}');
  } catch (e) {}

  let evidenceSummary = undefined;
  try {
    if (row.evidence_summary) {
      evidenceSummary = JSON.parse(row.evidence_summary);
    }
  } catch (e) {}

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    deck: row.deck || '',
    category: row.category,
    categorySlug: row.category_slug,
    subcategory: row.subcategory || undefined,
    author,
    publishedAt: row.published_at,
    updatedAt: row.updated_at || undefined,
    scheduledAt: row.scheduled_at || undefined,
    excerpt: row.excerpt || '',
    heroImage: row.hero_image,
    imageCaption: row.image_caption || '',
    content,
    pullQuotes,
    tags,
    sources,
    status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
    rawStatus: row.status,
    articleType: row.article_type,
    location,
    isInvestigation: Boolean(row.is_investigation),
    isLead: Boolean(row.is_lead),
    isBreaking: Boolean(row.is_breaking),
    isOpinion: Boolean(row.is_opinion),
    isFactCheck: Boolean(row.is_fact_check),
    readTimeMinutes: row.read_time_minutes || 4,
    evidenceSummary,
    corrections,
    seoTitle: row.seo_title,
    meta_title: row.seo_title,
    seoMetaDescription: row.seo_meta_description,
    meta_description: row.seo_meta_description,
    subtitle: row.deck || '',
    category_slug: row.category_slug,
    article_type: row.article_type,
    author_id: row.author_id,
    featured_image: row.hero_image,
    image_caption: row.image_caption || '',
    is_breaking: row.is_breaking,
    canonicalUrl: row.canonical_url,
    viewsCount: row.views_count || 0,
    createdBy: row.created_by,
    publishedBy: row.published_by,
    createdAt: row.created_at,
  };
}

// 1. GET /api/articles - Public & Admin with query filters
articlesRouter.get('/', (req, res) => {
  const {
    category,
    status,
    type,
    authorSlug,
    tag,
    search,
    isLead,
    isBreaking,
    isInvestigation,
    isOpinion,
    isFactCheck,
    limit = '10',
    offset = '0',
    sort = 'newest',
  } = req.query;

  let query = `SELECT a.* FROM articles a`;
  const whereClauses: string[] = [];
  const params: any[] = [];

  // Status filter: Public default sees published, updated, and correction unless explicitly requested
  if (status && status !== 'all') {
    whereClauses.push(`a.status = ?`);
    params.push((status as string).toLowerCase());
  } else if (!status) {
    // Default public: published, updated, or correction
    whereClauses.push(`a.status IN ('published', 'updated', 'correction')`);
  }

  // Category filter with smart handling
  if (category && category !== 'all' && category !== 'latest') {
    const cat = (category as string).toLowerCase();
    if (cat === 'national' || cat === 'india') {
      whereClauses.push(`(LOWER(a.category_slug) IN ('national', 'india'))`);
    } else if (cat === 'world') {
      whereClauses.push(`(LOWER(a.category_slug) = 'world')`);
    } else if (cat === 'fact-check') {
      whereClauses.push(`(LOWER(a.category_slug) = 'fact-check' OR a.is_fact_check = 1)`);
    } else if (cat === 'opinions') {
      whereClauses.push(`(LOWER(a.category_slug) = 'opinions' OR a.is_opinion = 1)`);
    } else if (cat === 'investigations') {
      whereClauses.push(`(LOWER(a.category_slug) = 'investigations' OR a.is_investigation = 1)`);
    } else {
      whereClauses.push(`LOWER(a.category_slug) = ?`);
      params.push(cat);
    }
  }

  if (type && type !== 'all') {
    whereClauses.push(`a.article_type = ?`);
    params.push((type as string).toLowerCase());
  }

  const rawIsLead = isLead !== undefined ? isLead : req.query.is_lead;
  if (rawIsLead !== undefined) {
    whereClauses.push(`a.is_lead = ?`);
    params.push(rawIsLead === 'true' || rawIsLead === '1' ? 1 : 0);
  }

  const rawIsBreaking = isBreaking !== undefined ? isBreaking : req.query.is_breaking;
  if (rawIsBreaking !== undefined) {
    whereClauses.push(`a.is_breaking = ?`);
    params.push(rawIsBreaking === 'true' || rawIsBreaking === '1' ? 1 : 0);
  }

  const rawIsInvestigation = isInvestigation !== undefined ? isInvestigation : req.query.is_investigation;
  if (rawIsInvestigation !== undefined) {
    whereClauses.push(`a.is_investigation = ?`);
    params.push(rawIsInvestigation === 'true' || rawIsInvestigation === '1' ? 1 : 0);
  }

  const rawIsOpinion = isOpinion !== undefined ? isOpinion : req.query.is_opinion;
  if (rawIsOpinion !== undefined) {
    whereClauses.push(`a.is_opinion = ?`);
    params.push(rawIsOpinion === 'true' || rawIsOpinion === '1' ? 1 : 0);
  }

  const rawIsFactCheck = isFactCheck !== undefined ? isFactCheck : req.query.is_fact_check;
  if (rawIsFactCheck !== undefined) {
    whereClauses.push(`a.is_fact_check = ?`);
    params.push(rawIsFactCheck === 'true' || rawIsFactCheck === '1' ? 1 : 0);
  }

  if (tag) {
    whereClauses.push(`a.tags LIKE ?`);
    params.push(`%"${tag}"%`);
  }

  const searchTerm = search || req.query.q;
  if (searchTerm) {
    const q = `%${(searchTerm as string).toLowerCase()}%`;
    whereClauses.push(`(
      LOWER(a.title) LIKE ? OR
      LOWER(a.deck) LIKE ? OR
      LOWER(a.excerpt) LIKE ? OR
      LOWER(a.content) LIKE ? OR
      LOWER(a.tags) LIKE ?
    )`);
    params.push(q, q, q, q, q);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  // Count total matching
  const countQuery = query.replace('SELECT a.*', 'SELECT COUNT(*) as count');
  const totalCount = (db.prepare(countQuery).get(...params) as { count: number }).count;

  // Sorting
  query += ` ORDER BY a.published_at DESC`;

  // Pagination
  query += ` LIMIT ? OFFSET ?`;
  const numLimit = parseInt(limit as string, 10) || 10;
  const numOffset = parseInt(offset as string, 10) || 0;
  params.push(numLimit, numOffset);

  const rows = db.prepare(query).all(...params);
  const articles = rows.map(formatArticle);

  res.json({
    data: articles,
    articles: articles,
    total: totalCount,
    page: Math.floor(numOffset / numLimit) + 1,
    pageSize: numLimit,
    totalPages: Math.ceil(totalCount / numLimit) || 1,
  });
});

const SLUG_ALIASES: Record<string, string> = {
  'ratlam-16-year-old-hindu-girl-abducted-rescued-dhodhar-station': '16-year-old-hindu-girl-abducted-by-3-muslim-men-rescued-by-bajrang-dal',
  'hyderabad-dilsukhnagar-santoshi-mata-temple-desecration-mohammed-ansari-arrested': 'a-muslim-man-tried-to-vandalise-idol-of-deity-with-sticks-in-hyderabad',
  'maihar-mp-tribal-man-murdered-dumped-well-three-arrested-community-fear': 'muslims-chopped-my-son-like-a-vegetable-maihar-murder-dumped-in-well',
  'temple-premises-alms-recipient-makeshift-mazar-encroachment-foiled': 'sufi-shia-muslim-trying-to-turn-hindu-temple-into-islamic-mazar',
  'selective-secularism-religious-attire-uniform-dress-code-debate': 'gmc-doda-burqa-controversy-clinical-safety-vs-religious-demands',
};

// 2. GET /api/articles/:id (or /slug/:slug)
articlesRouter.get('/slug/:slug', (req, res) => {
  const targetSlug = SLUG_ALIASES[req.params.slug] || req.params.slug;
  const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(targetSlug);
  if (!row) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  res.json(formatArticle(row));
});

articlesRouter.get('/:id', (req, res) => {
  const target = SLUG_ALIASES[req.params.id] || req.params.id;
  const row = db.prepare('SELECT * FROM articles WHERE id = ? OR slug = ?').get(target, target);
  if (!row) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  res.json(formatArticle(row));
});

// 2b. POST /api/articles/quick-post - Instant Editorial Publishing Endpoint
articlesRouter.post('/quick-post', (req, res) => {
  try {
    const {
      title,
      deck,
      category,
      categorySlug,
      subcategory,
      authorId,
      authorName,
      authorRole,
      excerpt,
      heroImage,
      imageCaption,
      content,
      pullQuotes,
      tags,
      status = 'published',
      articleType = 'news',
      location,
      sources = [],
      isLead = false,
      isBreaking = false,
      isInvestigation = false,
      isOpinion = false,
      isFactCheck = false,
      readTimeMinutes,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Headline (title) is required.' });
      return;
    }
    if (!content) {
      res.status(400).json({ error: 'Article story body (content) is required.' });
      return;
    }

    const CATEGORY_NAMES: Record<string, string> = {
      'national': 'National',
      'economy': 'Economy & Markets',
      'world': 'World',
      'opinions': 'Opinion',
      'investigations': 'Investigations',
      'society-culture': 'Society & Culture',
      'fact-check': 'Fact Check',
      'violence': 'Violence & Public Safety',
      'india': 'National',
    };

    const finalCategorySlug = (categorySlug || req.body.category_slug || category || 'national')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const finalCategory = category || CATEGORY_NAMES[finalCategorySlug] || (finalCategorySlug.charAt(0).toUpperCase() + finalCategorySlug.slice(1));
    const finalSubtitle = deck || req.body.subtitle || '';
    const finalHeroImage = heroImage || req.body.featured_image || req.body.featuredImage || req.body.hero_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';
    
    const now = new Date().toISOString();

    // Author Resolution
    let finalAuthorId = authorId || req.body.author_id || 'aarav-mehta';
    if (authorName && authorName.trim()) {
      const generatedAuthorSlug = authorName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const existingAuthor = db.prepare('SELECT id FROM authors WHERE id = ? OR slug = ?').get(generatedAuthorSlug, generatedAuthorSlug) as any;
      if (existingAuthor) {
        finalAuthorId = existingAuthor.id;
      } else {
        finalAuthorId = generatedAuthorSlug;
        db.prepare(`
          INSERT INTO authors (id, name, slug, role, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, 1, ?, ?)
        `).run(finalAuthorId, authorName.trim(), generatedAuthorSlug, authorRole || 'Staff Reporter', now, now);
      }
    }

    // Slug generation
    const baseSlug = (req.body.slug || title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const existingSlug = db.prepare('SELECT id FROM articles WHERE slug = ?').get(baseSlug);
    const slug = existingSlug ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug;
    const uniqueId = `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Parse Content into Paragraphs
    let contentArray: string[] = [];
    if (Array.isArray(content)) {
      contentArray = content.filter((p) => typeof p === 'string' && p.trim().length > 0);
    } else if (typeof content === 'string') {
      contentArray = content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
    if (contentArray.length === 0 && typeof content === 'string') {
      contentArray = [content.trim()];
    }

    const wordCount = contentArray.join(' ').split(/\s+/).filter(Boolean).length;
    const calculatedReadTime = readTimeMinutes || Math.max(1, Math.ceil(wordCount / 200));

    // Flags
    const leadFlag = isLead || req.body.is_lead ? 1 : 0;
    const breakingFlag = isBreaking || articleType === 'breaking' || req.body.is_breaking ? 1 : 0;
    const opinionFlag = isOpinion || articleType === 'opinion' || finalCategorySlug === 'opinions' || req.body.is_opinion ? 1 : 0;
    const factCheckFlag = isFactCheck || finalCategorySlug === 'fact-check' || req.body.is_fact_check ? 1 : 0;
    const investigationFlag = isInvestigation || articleType === 'investigation' || finalCategorySlug === 'investigations' || req.body.is_investigation ? 1 : 0;

    if (leadFlag === 1) {
      db.prepare('UPDATE articles SET is_lead = 0').run();
    }

    const insertStmt = db.prepare(`
      INSERT INTO articles (
        id, title, slug, deck, category, category_slug, subcategory, author_id,
        published_at, updated_at, scheduled_at, excerpt, hero_image, image_caption,
        content, pull_quotes, tags, status, article_type, location, is_investigation,
        is_lead, is_breaking, is_opinion, is_fact_check, read_time_minutes,
        evidence_summary, seo_title, seo_meta_description, canonical_url,
        views_count, created_by, published_by, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        0, ?, ?, ?
      )
    `);

    insertStmt.run(
      uniqueId,
      title.trim(),
      slug,
      finalSubtitle.trim(),
      finalCategory,
      finalCategorySlug,
      subcategory || null,
      finalAuthorId,
      now,
      null,
      null,
      excerpt ? excerpt.trim() : (contentArray[0] ? contentArray[0].substring(0, 180) + '...' : ''),
      finalHeroImage,
      imageCaption || '',
      JSON.stringify(contentArray),
      JSON.stringify(pullQuotes || []),
      JSON.stringify(tags || []),
      'published',
      articleType,
      JSON.stringify(location || { country: 'India' }),
      investigationFlag,
      leadFlag,
      breakingFlag,
      opinionFlag,
      factCheckFlag,
      calculatedReadTime,
      JSON.stringify({}),
      title.trim(),
      excerpt || finalSubtitle || '',
      `${PUBLIC_DOMAIN}/${finalCategorySlug}/${slug}`,
      'usr-admin-1',
      'usr-admin-1',
      now
    );

    if (leadFlag === 1) {
      db.prepare(`
        INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
        VALUES ('slot-lead_story', 'lead_story', ?, 'article', ?)
        ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
      `).run(uniqueId, now);
    }
    if (breakingFlag === 1) {
      db.prepare(`
        INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
        VALUES ('slot-breaking', 'breaking', ?, 'article', ?)
        ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
      `).run(uniqueId, now);
    }

    // Insert any sources
    if (Array.isArray(sources) && sources.length > 0) {
      const insertSrc = db.prepare(`
        INSERT OR REPLACE INTO sources (id, title, publisher, source_type, classification, publication_date, url, document_number, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const linkSrc = db.prepare(`
        INSERT OR IGNORE INTO article_sources (article_id, source_id, sort_order)
        VALUES (?, ?, ?)
      `);

      sources.forEach((s: any, idx: number) => {
        if (!s.title) return;
        const srcId = s.id || `src-${Date.now()}-${idx}`;
        insertSrc.run(
          srcId,
          s.title,
          s.publisher || 'Public Record',
          s.sourceType || s.source_type || 'official_filing',
          s.classification || 'Primary Public Record',
          s.publicationDate || s.published_date || now.split('T')[0],
          s.url || '',
          s.documentNumber || s.document_number || '',
          s.notes || '',
          now
        );
        linkSrc.run(uniqueId, srcId, idx + 1);
      });
    }

    const createdRow = db.prepare('SELECT * FROM articles WHERE id = ?').get(uniqueId);
    res.status(201).json({
      success: true,
      article: formatArticle(createdRow),
      url: `/${finalCategorySlug}/${slug}`,
    });
  } catch (error: any) {
    console.error('Error quick-posting article:', error);
    res.status(500).json({ error: error.message || 'Failed to post article.' });
  }
});

// 3. POST /api/articles - Create Article (Newsroom Staff)
articlesRouter.post('/', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const {
    title,
    deck,
    category,
    categorySlug,
    subcategory,
    authorId,
    excerpt,
    heroImage,
    imageCaption,
    content,
    pullQuotes,
    tags,
    status = 'draft',
    articleType = 'news',
    location,
    evidenceSummary,
    sources = [],
    isLead = false,
    isBreaking = false,
    seoTitle,
    seoMetaDescription,
    canonicalUrl,
    scheduledAt,
  } = req.body;

  const rawCat = category || categorySlug || req.body.category_slug;
  if (!title || !rawCat || !content) {
    res.status(400).json({ error: 'Title, category, and article content are required.' });
    return;
  }

  const finalCategory = category || (rawCat.charAt(0).toUpperCase() + rawCat.slice(1));
  const finalCategorySlug = categorySlug || req.body.category_slug || finalCategory.toLowerCase().replace(/\s+/g, '-');
  const finalSubtitle = deck || req.body.subtitle || '';
  const finalHeroImage = heroImage || req.body.featured_image || req.body.featuredImage || req.body.hero_image || '';
  const finalAuthorId = authorId || req.body.author_id || 'aarav-mehta';

  // Role check on status: Only admin & editor can directly publish or schedule
  let finalStatus = status.toLowerCase();
  if (['published', 'approved', 'scheduled'].includes(finalStatus)) {
    if (!['admin', 'editor'].includes(user.role)) {
      finalStatus = 'in_review'; // Force in_review for reporters & contributors
    }
  }

  // Slug generation
  const baseSlug = (req.body.slug || title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const uniqueId = `art-${Date.now().toString(36)}`;
  const slug = req.body.slug || `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Content type enforcement
  const isOpinion = articleType === 'opinion' || req.body.isOpinion || req.body.is_opinion ? 1 : 0;
  const isFactCheck = finalCategorySlug === 'fact-check' || req.body.isFactCheck ? 1 : 0;
  const isInvestigation = articleType === 'investigation' || req.body.isInvestigation || req.body.is_investigation ? 1 : 0;
  const breakingFlag = isBreaking || articleType === 'breaking' || req.body.is_breaking ? 1 : 0;
  const leadFlag = req.body.isLead || req.body.is_lead ? 1 : 0;

  if (leadFlag === 1) {
    db.prepare('UPDATE articles SET is_lead = 0').run();
  }

  const contentArray = Array.isArray(content) ? content : [content];
  const readTime = Math.max(1, Math.ceil(contentArray.join(' ').split(/\s+/).length / 200));

  const insertStmt = db.prepare(`
    INSERT INTO articles (
      id, title, slug, deck, category, category_slug, subcategory, author_id,
      published_at, updated_at, scheduled_at, excerpt, hero_image, image_caption,
      content, pull_quotes, tags, status, article_type, location, is_investigation,
      is_lead, is_breaking, is_opinion, is_fact_check, read_time_minutes,
      evidence_summary, seo_title, seo_meta_description, canonical_url,
      views_count, created_by, published_by, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      0, ?, ?, ?
    )
  `);

  insertStmt.run(
    uniqueId,
    title.trim(),
    slug,
    finalSubtitle.trim(),
    finalCategory,
    finalCategorySlug,
    subcategory || null,
    finalAuthorId,
    finalStatus === 'published' ? now : (scheduledAt || now),
    null,
    scheduledAt || null,
    excerpt ? excerpt.trim() : (contentArray[0] ? contentArray[0].substring(0, 180) + '...' : ''),
    finalHeroImage,
    imageCaption || '',
    JSON.stringify(contentArray),
    JSON.stringify(pullQuotes || []),
    JSON.stringify(tags || []),
    finalStatus,
    articleType,
    JSON.stringify(location || { country: 'India' }),
    isInvestigation,
    leadFlag,
    breakingFlag,
    isOpinion,
    isFactCheck,
    readTime,
    JSON.stringify(evidenceSummary || {}),
    seoTitle || title,
    seoMetaDescription || excerpt || '',
    canonicalUrl || `${PUBLIC_DOMAIN}/${categorySlug}/${slug}`,
    user.id,
    finalStatus === 'published' ? user.id : null,
    now
  );

  if (leadFlag === 1) {
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-lead_story', 'lead_story', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(uniqueId, now);
  }
  if (breakingFlag === 1) {
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-breaking', 'breaking', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(uniqueId, now);
  }

  // Insert Sources
  if (Array.isArray(sources) && sources.length > 0) {
    const insertSrc = db.prepare(`
      INSERT OR REPLACE INTO sources (id, title, publisher, source_type, classification, publication_date, url, document_number, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const linkSrc = db.prepare(`
      INSERT INTO article_sources (id, article_id, source_id, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    sources.forEach((s: any, idx: number) => {
      const srcId = s.id || `src-${Date.now()}-${idx}`;
      const classification = (s.classification && String(s.classification).toLowerCase() === 'secondary') ? 'Secondary' : 'Primary';
      const sourceType = s.sourceType || s.source_type || 'Police statement';
      insertSrc.run(
        srcId,
        s.title || 'Official Document',
        s.publisher || 'Official Record',
        sourceType,
        classification,
        s.publicationDate || s.published_date || now.slice(0, 10),
        s.url || null,
        s.documentNumber || s.document_number || null,
        s.notes || null,
        now
      );
      linkSrc.run(`as-${uniqueId}-${idx}`, uniqueId, srcId, idx);
    });
  }

  // Audit Log
  logAuditEvent(req, {
    action: finalStatus === 'published' ? 'ARTICLE_PUBLISHED' : 'ARTICLE_CREATED',
    targetType: 'article',
    targetId: uniqueId,
    targetTitle: title,
    details: `Created as ${finalStatus.toUpperCase()} [${articleType.toUpperCase()}] by ${user.fullName}`,
  });

  // Notification for editors if submitted for review
  if (finalStatus === 'in_review') {
    db.prepare(`
      INSERT INTO notifications (id, title, message, type, reference_url, is_read, user_id, created_at)
      VALUES (?, ?, ?, 'review_request', ?, 0, 'usr-admin-1', ?)
    `).run(
      `notif-${Date.now()}`,
      'New Article In Review',
      `"${title}" was submitted for editorial review by ${user.fullName}`,
      `/admin/articles/edit/${uniqueId}`,
      now
    );
  }

  const createdRow = db.prepare('SELECT * FROM articles WHERE id = ?').get(uniqueId);
  res.status(201).json(formatArticle(createdRow));
});

// 4. PUT /api/articles/:id - Update Article
articlesRouter.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const articleId = req.params.id;

  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  // Permissions: Reporter can only edit own articles; Contributor cannot edit after review
  if (user.role === 'reporter' && existing.created_by !== user.id) {
    res.status(403).json({ error: 'Reporters may only edit their own articles.' });
    return;
  }

  const {
    title,
    slug,
    deck,
    subtitle,
    category,
    categorySlug,
    category_slug,
    subcategory,
    authorId,
    author_id,
    excerpt,
    heroImage,
    featured_image,
    featuredImage,
    imageCaption,
    image_caption,
    content,
    pullQuotes,
    tags,
    status,
    articleType,
    article_type,
    location,
    evidenceSummary,
    sources,
    isLead,
    isBreaking,
    is_breaking,
    seoTitle,
    meta_title,
    seoMetaDescription,
    meta_description,
    canonicalUrl,
    scheduledAt,
  } = req.body;

  let finalStatus = status ? status.toLowerCase() : existing.status;
  if (['published', 'approved', 'scheduled'].includes(finalStatus) && !['admin', 'editor'].includes(user.role)) {
    finalStatus = existing.status; // Prevent unauthorized publishing
  }

  const now = new Date().toISOString();

  let contentArray = JSON.parse(existing.content || '[]');
  if (content !== undefined) {
    if (Array.isArray(content)) {
      contentArray = content;
    } else if (typeof content === 'string') {
      contentArray = content.split(/\n{2,}/).map((p: string) => p.trim()).filter(Boolean);
    }
  }
  const readTime = Math.max(1, Math.ceil(contentArray.join(' ').split(/\s+/).length / 200));

  const isOpinion = articleType === 'opinion' || req.body.isOpinion !== undefined || req.body.is_opinion !== undefined
    ? ((req.body.isOpinion || req.body.is_opinion) ? 1 : 0)
    : existing.is_opinion;
  const isBreakingVal = isBreaking !== undefined || is_breaking !== undefined
    ? ((isBreaking || is_breaking) ? 1 : 0)
    : existing.is_breaking;

  let finalLocation = existing.location ? JSON.parse(existing.location) : { country: 'India' };
  if (location !== undefined) {
    if (typeof location === 'string') {
      try {
        finalLocation = JSON.parse(location);
      } catch {
        finalLocation = { country: 'India', city: location };
      }
    } else if (typeof location === 'object' && location !== null) {
      finalLocation = location;
    }
  }

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalSlug = slug !== undefined ? slug.trim() : existing.slug;
  const finalDeck = (deck !== undefined ? deck : (subtitle !== undefined ? subtitle : existing.deck))?.trim() || '';
  const finalCategory = category || existing.category;
  const finalCategorySlug = categorySlug || category_slug || existing.category_slug;
  const finalSubcategory = subcategory !== undefined ? subcategory : existing.subcategory;
  const finalAuthorId = authorId || author_id || existing.author_id;
  const finalExcerpt = (excerpt !== undefined ? excerpt : existing.excerpt)?.trim() || '';
  const finalHeroImage = heroImage !== undefined ? heroImage : (featured_image !== undefined ? featured_image : (featuredImage !== undefined ? featuredImage : existing.hero_image));
  const finalImageCaption = imageCaption !== undefined ? imageCaption : (image_caption !== undefined ? image_caption : existing.image_caption);
  const finalArticleType = articleType || article_type || existing.article_type;
  const finalSeoTitle = seoTitle !== undefined ? seoTitle : (meta_title !== undefined ? meta_title : existing.seo_title);
  const finalSeoMetaDescription = seoMetaDescription !== undefined ? seoMetaDescription : (meta_description !== undefined ? meta_description : existing.seo_meta_description);

  db.prepare(`
    UPDATE articles SET
      title = ?,
      slug = ?,
      deck = ?,
      category = ?,
      category_slug = ?,
      subcategory = ?,
      author_id = ?,
      excerpt = ?,
      hero_image = ?,
      image_caption = ?,
      content = ?,
      pull_quotes = ?,
      tags = ?,
      status = ?,
      article_type = ?,
      location = ?,
      is_investigation = ?,
      is_lead = ?,
      is_breaking = ?,
      is_opinion = ?,
      read_time_minutes = ?,
      evidence_summary = ?,
      seo_title = ?,
      seo_meta_description = ?,
      canonical_url = ?,
      scheduled_at = ?,
      updated_at = ?,
      published_at = CASE WHEN status != 'published' AND ? = 'published' THEN ? ELSE published_at END
    WHERE id = ?
  `).run(
    finalTitle,
    finalSlug,
    finalDeck,
    finalCategory,
    finalCategorySlug,
    finalSubcategory,
    finalAuthorId,
    finalExcerpt,
    finalHeroImage,
    finalImageCaption,
    JSON.stringify(contentArray),
    JSON.stringify(pullQuotes !== undefined ? pullQuotes : JSON.parse(existing.pull_quotes || '[]')),
    JSON.stringify(tags !== undefined ? (Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean)) : JSON.parse(existing.tags || '[]')),
    finalStatus,
    finalArticleType,
    JSON.stringify(finalLocation),
    req.body.isInvestigation !== undefined ? (req.body.isInvestigation ? 1 : 0) : existing.is_investigation,
    (isLead !== undefined ? (isLead ? 1 : 0) : (req.body.is_lead !== undefined ? (req.body.is_lead ? 1 : 0) : existing.is_lead)),
    isBreakingVal,
    isOpinion,
    readTime,
    JSON.stringify(evidenceSummary !== undefined ? evidenceSummary : JSON.parse(existing.evidence_summary || '{}')),
    finalSeoTitle,
    finalSeoMetaDescription,
    canonicalUrl !== undefined ? canonicalUrl : existing.canonical_url,
    scheduledAt !== undefined ? scheduledAt : existing.scheduled_at,
    now,
    finalStatus,
    now,
    articleId
  );

  const updatedIsLead = isLead !== undefined ? (isLead ? 1 : 0) : (req.body.is_lead !== undefined ? (req.body.is_lead ? 1 : 0) : existing.is_lead);
  if (updatedIsLead === 1) {
    db.prepare('UPDATE articles SET is_lead = 0 WHERE id != ?').run(articleId);
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-lead_story', 'lead_story', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(articleId, now);
  }
  if (isBreakingVal === 1) {
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-breaking', 'breaking', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(articleId, now);
  }

  // Sync Sources if provided
  if (Array.isArray(sources)) {
    db.prepare('DELETE FROM article_sources WHERE article_id = ?').run(articleId);

    const insertSrc = db.prepare(`
      INSERT OR REPLACE INTO sources (id, title, publisher, source_type, classification, publication_date, url, document_number, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const linkSrc = db.prepare(`
      INSERT INTO article_sources (id, article_id, source_id, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    sources.forEach((s: any, idx: number) => {
      const srcId = s.id || `src-${Date.now()}-${idx}`;
      const classification = (s.classification && String(s.classification).toLowerCase() === 'secondary') ? 'Secondary' : 'Primary';
      const sourceType = s.sourceType || s.source_type || 'Police statement';
      insertSrc.run(
        srcId,
        s.title || 'Official Document',
        s.publisher || 'Primary Registry',
        sourceType,
        classification,
        s.publicationDate || s.published_date || now.slice(0, 10),
        s.url || null,
        s.documentNumber || s.document_number || null,
        s.notes || null,
        now
      );
      linkSrc.run(`as-${articleId}-${idx}`, articleId, srcId, idx);
    });
  }

  logAuditEvent(req, {
    action: 'ARTICLE_UPDATED',
    targetType: 'article',
    targetId: articleId,
    targetTitle: title || existing.title,
    details: `Updated by ${user.fullName} [Status: ${finalStatus}]`,
  });

  const updatedRow = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  res.json(formatArticle(updatedRow));
});

// 5. POST /api/articles/:id/status - Workflow state transition
articlesRouter.post('/:id/status', authenticateToken, (req: AuthRequest, res) => {
  const user = req.user!;
  const { action } = req.body; // 'submit_for_review' | 'approve' | 'publish' | 'archive' | 'draft'
  const articleId = req.params.id;

  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId) as any;
  if (!article) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  let nextStatus = article.status;
  const now = new Date().toISOString();

  if (action === 'submit_for_review') {
    nextStatus = 'in_review';
  } else if (action === 'approve') {
    if (!['admin', 'editor'].includes(user.role)) {
      res.status(403).json({ error: 'Only Editors and Admins may approve articles.' });
      return;
    }
    nextStatus = 'approved';
  } else if (action === 'publish') {
    if (!['admin', 'editor'].includes(user.role)) {
      res.status(403).json({ error: 'Only Editors and Admins may publish articles.' });
      return;
    }
    nextStatus = 'published';
  } else if (action === 'archive') {
    if (!['admin', 'editor'].includes(user.role)) {
      res.status(403).json({ error: 'Only Editors and Admins may archive articles.' });
      return;
    }
    nextStatus = 'archived';
  } else if (action === 'draft') {
    nextStatus = 'draft';
  } else {
    res.status(400).json({ error: 'Invalid workflow action.' });
    return;
  }

  db.prepare(`
    UPDATE articles SET
      status = ?,
      updated_at = ?,
      published_at = CASE WHEN ? = 'published' THEN ? ELSE published_at END,
      published_by = CASE WHEN ? = 'published' THEN ? ELSE published_by END
    WHERE id = ?
  `).run(nextStatus, now, nextStatus, now, nextStatus, user.id, articleId);

  logAuditEvent(req, {
    action: `ARTICLE_${action.toUpperCase()}`,
    targetType: 'article',
    targetId: articleId,
    targetTitle: article.title,
    details: `Transitioned status from ${article.status} to ${nextStatus}`,
  });

  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  res.json(formatArticle(updated));
});

// 6. DELETE /api/articles/:id (Admin / Editor)
articlesRouter.delete('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as any;
  if (!article) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }

  db.prepare('DELETE FROM article_sources WHERE article_id = ?').run(req.params.id);
  db.prepare('DELETE FROM corrections WHERE article_id = ?').run(req.params.id);
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);

  logAuditEvent(req, {
    action: 'ARTICLE_DELETED',
    targetType: 'article',
    targetId: req.params.id,
    targetTitle: article.title,
    details: 'Permanently deleted by editorial command',
  });

  res.json({ success: true, message: 'Article permanently deleted.' });
});
