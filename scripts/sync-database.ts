import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../src/data/categories.js';
import { AUTHORS } from '../src/data/authors.js';
import { ARTICLES } from '../src/data/articles.js';
import { CASE_FILES } from '../src/data/caseFiles.js';
import { SOURCES_CATALOG } from '../src/data/sources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '..', 'data', 'dharmawatch.db');

const db = new DatabaseSync(dbPath);
const now = new Date().toISOString();

console.log('Synchronizing database at:', dbPath);

// Clear old articles, categories, authors, sources, case files
db.exec('DELETE FROM article_sources;');
db.exec('DELETE FROM case_file_articles;');
db.exec('DELETE FROM case_timeline_events;');
db.exec('DELETE FROM case_files;');
db.exec('DELETE FROM articles;');
db.exec('DELETE FROM categories;');
db.exec('DELETE FROM authors;');
db.exec('DELETE FROM sources;');

console.log('Cleared obsolete tables.');

// 1. Insert Authors
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
console.log(`Inserted ${Object.keys(AUTHORS).length} authors.`);

// 2. Insert Categories
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
console.log(`Inserted ${CATEGORIES.length} categories.`);

// 3. Insert Sources
const insertSource = db.prepare(`
  INSERT INTO sources (
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
console.log(`Inserted ${Object.keys(SOURCES_CATALOG).length} sources.`);

// 4. Insert Articles
const insertArticle = db.prepare(`
  INSERT INTO articles (
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
    art.category || 'National',
    art.categorySlug || 'national',
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
console.log(`Inserted ${ARTICLES.length} articles.`);

// 5. Insert Case Files
const insertCaseFile = db.prepare(`
  INSERT INTO case_files (
    id, title, slug, summary, location, status, category,
    incident_type, lead_image, what_is_confirmed, what_is_alleged,
    key_parties, primary_documents, last_updated, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTimeline = db.prepare(`
  INSERT INTO case_timeline_events (
    id, case_file_id, date, time, headline, description,
    verification_status, sort_order
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const cf of CASE_FILES) {
  insertCaseFile.run(
    cf.id,
    cf.title,
    cf.id,
    cf.summary,
    JSON.stringify(cf.location),
    cf.status,
    'investigations',
    cf.incidentType,
    null,
    JSON.stringify(cf.whatIsConfirmed || []),
    JSON.stringify(cf.whatIsAlleged || []),
    JSON.stringify([]),
    JSON.stringify(cf.primaryDocuments || []),
    cf.lastUpdated || now,
    now
  );

  if (Array.isArray(cf.timeline)) {
    cf.timeline.forEach((evt, idx) => {
      insertTimeline.run(
        evt.id,
        cf.id,
        evt.date,
        null,
        evt.headline,
        evt.description,
        evt.verificationStatus,
        idx
      );
    });
  }
}
console.log(`Inserted ${CASE_FILES.length} project dossiers.`);
console.log('Database synchronization completed successfully!');
