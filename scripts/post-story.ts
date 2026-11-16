#!/usr/bin/env tsx
/**
 * DharmaWatch Broadsheet Newsroom CLI Publishing Tool
 * Usage:
 *   npx tsx scripts/post-story.ts --title="Headline" --category="economy" --content="Body paragraphs..."
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'data/dharmawatch.db');
const db = new DatabaseSync(dbPath);

interface PostOptions {
  title: string;
  deck?: string;
  category: string;
  content: string;
  authorName?: string;
  authorRole?: string;
  heroImage?: string;
  imageCaption?: string;
  isLead?: boolean;
  isBreaking?: boolean;
  isInvestigation?: boolean;
}

export function postStory(opts: PostOptions) {
  const {
    title,
    deck = '',
    category = 'national',
    content,
    authorName = 'National Bureau',
    authorRole = 'Political & Governance Bureau',
    heroImage = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200',
    imageCaption = '',
    isLead = false,
    isBreaking = false,
    isInvestigation = false,
  } = opts;

  if (!title || !title.trim()) {
    throw new Error('Title is required.');
  }
  if (!content || !content.trim()) {
    throw new Error('Content is required.');
  }

  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  // Author resolution
  const authorSlug = authorName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  let authorId = authorSlug;
  const existingAuthor = db.prepare('SELECT id FROM authors WHERE id = ? OR slug = ?').get(authorSlug, authorSlug);
  if (!existingAuthor) {
    db.prepare(`
      INSERT INTO authors (id, name, slug, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(authorId, authorName, authorSlug, authorRole, now, now);
  }

  // Slug generation
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const existingSlug = db.prepare('SELECT id FROM articles WHERE slug = ?').get(baseSlug);
  const slug = existingSlug ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug;
  const uniqueId = `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // Parse paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const leadFlag = isLead ? 1 : 0;
  const breakingFlag = isBreaking ? 1 : 0;
  const investigationFlag = isInvestigation || categorySlug === 'investigations' ? 1 : 0;

  if (leadFlag === 1) {
    db.prepare('UPDATE articles SET is_lead = 0').run();
  }

  const stmt = db.prepare(`
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

  stmt.run(
    uniqueId,
    title.trim(),
    slug,
    deck.trim(),
    category.charAt(0).toUpperCase() + category.slice(1),
    categorySlug,
    null,
    authorId,
    now,
    null,
    null,
    deck ? deck.trim() : paragraphs[0].substring(0, 180) + '...',
    heroImage,
    imageCaption,
    JSON.stringify(paragraphs),
    JSON.stringify([]),
    JSON.stringify([categorySlug]),
    'published',
    isBreaking ? 'breaking' : (isInvestigation ? 'investigation' : 'news'),
    JSON.stringify({ city: 'New Delhi', country: 'India' }),
    investigationFlag,
    leadFlag,
    breakingFlag,
    categorySlug === 'opinions' ? 1 : 0,
    categorySlug === 'fact-check' ? 1 : 0,
    readTime,
    JSON.stringify({}),
    title.trim(),
    deck || paragraphs[0].substring(0, 160),
    `https://thedharmawatch.in/${categorySlug}/${slug}`,
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

  const url = `/${categorySlug}/${slug}`;
  console.log(`\n=================================================`);
  console.log(`[DharmaWatch Wire] Article Published Successfully!`);
  console.log(`=================================================`);
  console.log(`ID:        ${uniqueId}`);
  console.log(`Headline:  ${title}`);
  console.log(`Category:  ${categorySlug}`);
  console.log(`Author:    ${authorName} (${authorRole})`);
  console.log(`Lead Flag: ${leadFlag === 1 ? 'YES' : 'NO'}`);
  console.log(`Read Time: ${readTime} min`);
  console.log(`Live URL:  ${url}`);
  console.log(`=================================================\n`);

  return { id: uniqueId, slug, url };
}

// Parse CLI flags if executed directly
if (process.argv[1]?.endsWith('post-story.ts')) {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const found = args.find((a) => a.startsWith(`--${flag}=`));
    if (found) return found.split('=')[1];
    const idx = args.indexOf(`--${flag}`);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
    return undefined;
  };

  const title = getArg('title');
  const content = getArg('content');
  const category = getArg('category') || 'national';
  const deck = getArg('deck');
  const authorName = getArg('author') || getArg('authorName');
  const isLead = args.includes('--lead') || args.includes('--isLead');
  const isBreaking = args.includes('--breaking') || args.includes('--isBreaking');

  if (title && content) {
    postStory({
      title,
      content,
      category,
      deck,
      authorName,
      isLead,
      isBreaking,
    });
  } else {
    console.log(`DharmaWatch CLI Post Tool`);
    console.log(`Usage: npx tsx scripts/post-story.ts --title="Headline" --content="Paragraphs..." [--category=economy] [--lead] [--breaking]`);
  }
}
