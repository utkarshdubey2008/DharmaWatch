import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { CATEGORIES } from '../src/data/categories.js';
import { AUTHORS } from '../src/data/authors.js';
import { ARTICLES } from '../src/data/articles.js';
import { CASE_FILES } from '../src/data/caseFiles.js';
import { PUBLIC_CORRECTIONS } from '../src/data/corrections.js';
import { SOURCES_CATALOG } from '../src/data/sources.js';

const dataDir = process.env.DATA_DIR || path.resolve(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dharmawatch.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'reporter', 'contributor')),
      full_name TEXT NOT NULL,
      avatar TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      avatar TEXT,
      email TEXT,
      pgp_key TEXT,
      areas_of_coverage TEXT, -- JSON array
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      subcategories TEXT, -- JSON array
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      deck TEXT,
      category TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      subcategory TEXT,
      author_id TEXT NOT NULL,
      published_at TEXT NOT NULL,
      updated_at TEXT,
      scheduled_at TEXT,
      excerpt TEXT,
      hero_image TEXT,
      image_caption TEXT,
      content TEXT NOT NULL, -- JSON array of paragraphs
      pull_quotes TEXT, -- JSON array
      tags TEXT, -- JSON array
      status TEXT NOT NULL CHECK(status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'updated', 'corrected', 'archived')),
      article_type TEXT NOT NULL CHECK(article_type IN ('news', 'breaking', 'opinion', 'analysis', 'investigation', 'case_file_update')),
      location TEXT, -- JSON object
      is_investigation INTEGER NOT NULL DEFAULT 0,
      is_lead INTEGER NOT NULL DEFAULT 0,
      is_breaking INTEGER NOT NULL DEFAULT 0,
      is_opinion INTEGER NOT NULL DEFAULT 0,
      is_fact_check INTEGER NOT NULL DEFAULT 0,
      read_time_minutes INTEGER NOT NULL DEFAULT 4,
      evidence_summary TEXT, -- JSON object
      seo_title TEXT,
      seo_meta_description TEXT,
      canonical_url TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_by TEXT,
      reviewed_by TEXT,
      published_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      publisher TEXT NOT NULL,
      source_type TEXT NOT NULL,
      classification TEXT NOT NULL CHECK(classification IN ('Primary', 'Secondary')),
      publication_date TEXT,
      url TEXT,
      document_number TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS article_sources (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_files (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      location TEXT, -- JSON object
      status TEXT NOT NULL,
      category TEXT NOT NULL,
      incident_type TEXT NOT NULL,
      lead_image TEXT,
      what_is_confirmed TEXT, -- JSON array
      what_is_alleged TEXT, -- JSON array
      key_parties TEXT, -- JSON array
      primary_documents TEXT, -- JSON array
      last_updated TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS case_timeline_events (
      id TEXT PRIMARY KEY,
      case_file_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      headline TEXT NOT NULL,
      description TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(case_file_id) REFERENCES case_files(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_file_articles (
      case_file_id TEXT NOT NULL,
      article_id TEXT NOT NULL,
      PRIMARY KEY (case_file_id, article_id),
      FOREIGN KEY(case_file_id) REFERENCES case_files(id) ON DELETE CASCADE,
      FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS corrections (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      correction_date TEXT NOT NULL,
      original_publication_date TEXT NOT NULL,
      what_was_changed TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      dimensions TEXT,
      uploaded_by TEXT,
      alt_text TEXT,
      caption TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homepage_slots (
      id TEXT PRIMARY KEY,
      slot_name TEXT UNIQUE NOT NULL,
      reference_id TEXT NOT NULL,
      reference_type TEXT NOT NULL, -- 'article' | 'case_file'
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      article_id TEXT,
      category TEXT,
      path TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      device_type TEXT,
      country TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      reference_url TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      user_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      target_title TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS compliance_reports (
      id TEXT PRIMARY KEY,
      month_year TEXT UNIQUE NOT NULL,
      total_received INTEGER NOT NULL DEFAULT 0,
      resolved INTEGER NOT NULL DEFAULT 0,
      pending INTEGER NOT NULL DEFAULT 0,
      summary TEXT NOT NULL DEFAULT 'No grievances were received during this period.',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;

  for (const statement of schema.split(';')) {
    const trimmed = statement.trim();
    if (trimmed) {
      db.exec(trimmed + ';');
    }
  }

  seedInitialData();
}

function seedInitialData() {
  const now = new Date().toISOString();

  // 1. Seed Users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('bZz!S9&WA5T&p9bKxu', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, full_name, avatar, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    insertUser.run(
      'usr-admin-1',
      'editor',
      'admin@thedharmawatch.in',
      passwordHash,
      'admin',
      'The Dharma Watch Team',
      null,
      now,
      now
    );

    insertUser.run(
      'usr-reporter-1',
      'reporter',
      'newsroom@thedharmawatch.in',
      passwordHash,
      'reporter',
      'Senior Correspondent',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      now,
      now
    );

    insertUser.run(
      'usr-contributor-1',
      'contributor',
      'submissions@thedharmawatch.in',
      passwordHash,
      'contributor',
      'Legal Contributor',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      now,
      now
    );
  }

  // 2. Seed Authors
  const authorCount = db.prepare('SELECT COUNT(*) as count FROM authors').get() as { count: number };
  if (authorCount.count === 0) {
    const insertAuthor = db.prepare(`
      INSERT INTO authors (id, name, slug, role, bio, avatar, email, pgp_key, areas_of_coverage, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    for (const au of Object.values(AUTHORS)) {
      insertAuthor.run(
        au.id,
        au.name,
        au.slug,
        au.role,
        au.bio,
        au.avatar,
        au.email || null,
        au.pgpKeyFingerprint || null,
        JSON.stringify(au.areasOfCoverage || []),
        now,
        now
      );
    }
  }

  // 3. Seed Categories
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, subcategories, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    CATEGORIES.forEach((cat, index) => {
      insertCat.run(
        cat.id,
        cat.name,
        cat.slug,
        cat.description,
        JSON.stringify(cat.subcategories || []),
        index,
        now
      );
    });
  }

  // 4. Seed Sources from SOURCES_CATALOG
  const insertSource = db.prepare(`
    INSERT OR IGNORE INTO sources (
      id, title, publisher, source_type, classification,
      publication_date, url, document_number, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const src of Object.values(SOURCES_CATALOG)) {
    insertSource.run(
      src.id,
      src.title,
      src.publisher,
      src.sourceType || 'Document',
      src.classification || 'Primary',
      src.publicationDate || null,
      src.url || null,
      src.documentNumber || null,
      src.notes || null,
      now
    );
  }

  // 5. Seed Articles from ARTICLES (only if empty)
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (articleCount.count === 0) {
    const insertArticle = db.prepare(`
      INSERT OR IGNORE INTO articles (
        id, title, slug, deck, category, category_slug, subcategory,
        author_id, published_at, updated_at, scheduled_at, excerpt,
        hero_image, image_caption, content, pull_quotes, tags, status,
        article_type, location, is_investigation, is_lead, is_breaking,
        is_opinion, is_fact_check, read_time_minutes, evidence_summary,
        seo_title, seo_meta_description, views_count, created_by, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, NULL, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 0, 'admin', ?
      )
    `);

    const insertArticleSource = db.prepare(`
      INSERT OR IGNORE INTO article_sources (
        id, article_id, source_id, sort_order
      ) VALUES (?, ?, ?, ?)
    `);

    for (const art of ARTICLES) {
      const contentStr = Array.isArray(art.content) ? JSON.stringify(art.content) : JSON.stringify([art.content || '']);
      const pullQuotesStr = Array.isArray(art.pullQuotes) ? JSON.stringify(art.pullQuotes) : JSON.stringify([]);
      const tagsStr = Array.isArray(art.tags) ? JSON.stringify(art.tags) : JSON.stringify([]);
      const locStr = typeof art.location === 'object' ? JSON.stringify(art.location) : JSON.stringify({ country: 'India' });
      const evStr = art.evidenceSummary ? JSON.stringify(art.evidenceSummary) : null;
      const authorId = art.author?.id || 'usr-reporter-1';
      const artType = art.isInvestigation ? 'investigation' : (art.isBreaking ? 'breaking' : (art.isOpinion || art.categorySlug === 'opinions' ? 'opinion' : 'news'));
      const pubAt = art.publishedAt || now;

      insertArticle.run(
        art.id,
        art.title,
        art.slug,
        art.deck || art.excerpt || '',
        art.category || 'News',
        art.categorySlug || 'india',
        art.subcategory || null,
        authorId,
        pubAt,
        art.updatedAt || pubAt,
        art.excerpt || art.deck || art.title,
        art.heroImage || '',
        art.imageCaption || '',
        contentStr,
        pullQuotesStr,
        tagsStr,
        'published',
        artType,
        locStr,
        art.isInvestigation ? 1 : 0,
        art.isLead ? 1 : 0,
        art.isBreaking ? 1 : 0,
        art.isOpinion || art.categorySlug === 'opinions' ? 1 : 0,
        art.isFactCheck || art.categorySlug === 'fact-check' ? 1 : 0,
        art.readTimeMinutes || 4,
        evStr,
        art.title,
        art.excerpt || art.deck || '',
        pubAt
      );

      if (Array.isArray(art.sources)) {
        art.sources.forEach((s, sIdx) => {
          if (s && s.id) {
            try {
              insertArticleSource.run(`as-${art.id}-${s.id}`, art.id, s.id, sIdx);
            } catch (e) {}
          }
        });
      }
    }
  }

  // 6. Seed Case Files from CASE_FILES
  const insertCaseFile = db.prepare(`
    INSERT OR IGNORE INTO case_files (
      id, title, slug, summary, location, status, category,
      incident_type, lead_image, what_is_confirmed, what_is_alleged,
      key_parties, primary_documents, last_updated, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  for (const cf of CASE_FILES) {
    insertCaseFile.run(
      cf.id,
      cf.title,
      cf.id,
      cf.summary,
      JSON.stringify(cf.location || { country: 'India' }),
      cf.status || 'Under Investigation',
      cf.category || 'Antiquities & Heritage',
      cf.incidentType || 'General Case',
      (cf as any).leadImage || '',
      JSON.stringify(cf.whatIsConfirmed || []),
      JSON.stringify(cf.whatIsAlleged || []),
      JSON.stringify((cf as any).keyParties || []),
      JSON.stringify(cf.primaryDocuments || []),
      cf.lastUpdated || now,
      cf.date || now
    );
  }

  // Also seed Ratlam Dhodhar Minor Abduction Case Dossier
  try {
    insertCaseFile.run(
      'case-ratlam-dhodhar-minor-abduction',
      'Abduction & Interception of 16-Year-Old Minor at Dhodhar Station',
      'case-ratlam-dhodhar-minor-abduction',
      'On September 28, 2026, a 16-year-old Hindu minor girl was abducted by Sahil Khan, Mustafa Khan, and Namroz Khan. On October 1, 2026, Bajrang Dal activists caught Sahil Khan and the minor at Dhodhar railway station while attempting to board a train to Chittorgarh. Ratlam District Police registered an FIR under kidnapping and child protection provisions.',
      JSON.stringify({ city: 'Ratlam / Dhodhar', state: 'Madhya Pradesh', country: 'India' }),
      'Verified',
      'Persecution',
      'Minor Abduction & Trafficking',
      'https://canon-filetolink-go.vercel.app/dl/17c49814494681d463187f3e',
      JSON.stringify([
        '16-year-old Hindu minor girl abducted on September 28, 2026 was successfully rescued.',
        'Accused Sahil Khan caught at Dhodhar railway station by Bajrang Dal workers while attempting to transport minor to Chittorgarh.',
        'Police case registered against Sahil Khan, Mustafa Khan, and Namroz Khan under kidnapping provisions.',
        'Video recording at Dhodhar station confirms interception and police custody handover.'
      ]),
      JSON.stringify([
        'Allegations of organized inter-district conversion and trafficking network targeting minor girls under active police inquiry.'
      ]),
      JSON.stringify(['Sahil Khan (Accused, Caught)', 'Mustafa Khan (Co-Accused)', 'Namroz Khan (Co-Accused)', 'Ratlam District Police', 'Bajrang Dal Dhodhar Unit']),
      JSON.stringify([
        {
          id: 'doc-ratlam-fir',
          title: 'Police FIR & Video Record - Dhodhar Minor Abduction Case',
          type: 'Police FIR',
          date: '2026-09-29',
          filingAuthority: 'Ratlam District Police',
          documentNumber: 'FIR-RATLAM-2026-402',
          classification: 'Primary Public Record',
          url: 'https://canon-filetolink-go.vercel.app/dl/17c49814494681d463187f3e'
        }
      ]),
      now,
      '2026-09-28'
    );
  } catch (e) {}

  // 7. Seed Public Corrections
  const insertCorrection = db.prepare(`
    INSERT OR IGNORE INTO corrections (
      id, article_id, correction_date, original_publication_date,
      what_was_changed, reason, created_by, created_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  for (const corr of PUBLIC_CORRECTIONS) {
    const row = db.prepare('SELECT id FROM articles WHERE slug = ?').get(corr.articleSlug) as { id: string } | undefined;
    const artId = row ? row.id : 'art-lead-heritage-cadastre';
    insertCorrection.run(
      corr.id,
      artId,
      corr.correctionDate,
      corr.originalPublicationDate,
      corr.whatWasChanged,
      corr.reasonForCorrection,
      'Senior Editorial Board',
      corr.correctionDate
    );
  }

  // 9. Seed Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `);

    insertSetting.run('site_title', 'DharmaWatch', now);
    insertSetting.run('site_tagline', 'Documenting. Verifying. Reporting.', now);
    insertSetting.run('primary_slogan', 'Proudly Hindu. Proudly Indian.', now);
    insertSetting.run('editorial_philosophy', 'Our identity is Hindu. Our home is India. Our standard is evidence.', now);
    insertSetting.run('sanskrit_mantra', 'सत्यमेव जयते • ॐ नमो भगवते वासुदेवाय', now);
    insertSetting.run('auto_archive_days', '90', now);
    insertSetting.run('enable_breaking_banner', 'true', now);
    insertSetting.run('default_read_time', '4', now);
    insertSetting.run('allow_public_submissions', 'true', now);
  }

  // 10. Seed Compliance Reports
  const crCount = db.prepare('SELECT COUNT(*) as count FROM compliance_reports').get() as { count: number };
  if (crCount.count === 0) {
    const insertCR = db.prepare(`
      INSERT OR IGNORE INTO compliance_reports (id, month_year, total_received, resolved, pending, summary, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCR.run('cr-2026-11', 'November 2026', 0, 0, 0, 'No grievances were received during this period.', 202611, '2026-11-01T00:00:00Z', now);
    insertCR.run('cr-2026-10', 'October 2026', 0, 0, 0, 'No grievances were received during this period.', 202610, '2026-10-01T00:00:00Z', now);
    insertCR.run('cr-2026-09', 'September 2026', 0, 0, 0, 'No grievances were received during this period.', 202609, '2026-09-01T00:00:00Z', now);
  }
}
