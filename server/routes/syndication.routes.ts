/**
 * DharmaWatch Broadsheet Syndication, News Feeds & SEO Engine
 * Compliant with:
 * - RSS 2.0 with Media RSS & Dublin Core
 * - JSON Feed v1.1
 * - Google News XML Sitemap Specification
 * - Master XML Sitemap (sitemaps.org 0.9)
 * - Programmatic Cross-Posting API for Zapier, Make, n8n, & Custom Scrapers
 */

import { Router } from 'express';
import { db } from '../db.js';

export const syndicationRouter = Router();

const PUBLIC_DOMAIN = (process.env.PUBLIC_DOMAIN || 'https://thedharmawatch.in').replace(/\/$/, '');

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return `${PUBLIC_DOMAIN}/dharmawatch-og.png`;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${PUBLIC_DOMAIN}${cleanPath}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RSS 2.0 SYNDICATION FEED (/rss.xml, /feed.xml, /rss)
// ─────────────────────────────────────────────────────────────────────────────
function generateRssFeed(categoryFilter?: string): string {
  let query = `
    SELECT a.*, aut.name as author_name, aut.role as author_role
    FROM articles a
    LEFT JOIN authors aut ON aut.id = a.author_id OR aut.slug = a.author_id
    WHERE a.status = 'published'
  `;
  const params: any[] = [];

  if (categoryFilter) {
    query += ' AND a.category_slug = ?';
    params.push(categoryFilter);
  }

  query += ' ORDER BY a.published_at DESC LIMIT 50';

  const articles = db.prepare(query).all(...params) as any[];

  const feedTitle = categoryFilter
    ? `The Dharma Watch — ${categoryFilter.toUpperCase()} Wire`
    : 'The Dharma Watch — Broadsheet & Investigative Journal of Record';

  const feedDesc = categoryFilter
    ? `Latest ${categoryFilter} investigative journalism and broadsheet reports from The Dharma Watch.`
    : 'Independent national broadsheet news publication and investigative journal of record. Dedicated to constitutional accountability and primary public records.';

  const feedLink = categoryFilter ? `${PUBLIC_DOMAIN}/${categoryFilter}` : PUBLIC_DOMAIN;
  const lastBuildDate = articles.length > 0 ? new Date(articles[0].published_at).toUTCString() : new Date().toUTCString();

  let itemsXml = '';
  for (const art of articles) {
    const artUrl = `${PUBLIC_DOMAIN}/${art.category_slug}/${art.slug}`;
    const pubDate = new Date(art.published_at).toUTCString();
    const heroImg = getAbsoluteUrl(art.hero_image);
    const authorName = art.author_name || art.author_id || 'National Bureau';

    let paragraphs: string[] = [];
    try {
      paragraphs = JSON.parse(art.content || '[]');
    } catch {
      paragraphs = [art.content || ''];
    }

    const contentHtml = paragraphs.map((p) => `<p>${escapeXml(p)}</p>`).join('\n');
    const description = escapeXml(art.deck || art.excerpt || (paragraphs[0] ? paragraphs[0].substring(0, 200) + '...' : art.title));

    itemsXml += `
    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${artUrl}</link>
      <guid isPermaLink="true">${artUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
      <category>${escapeXml(art.category || art.category_slug)}</category>
      <description>${description}</description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <enclosure url="${escapeXml(heroImg)}" length="0" type="image/jpeg" />
      <media:content url="${escapeXml(heroImg)}" medium="image">
        <media:title>${escapeXml(art.title)}</media:title>
      </media:content>
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${feedLink}</link>
    <description>${escapeXml(feedDesc)}</description>
    <language>en-in</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${PUBLIC_DOMAIN}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${PUBLIC_DOMAIN}/logo-dark.png</url>
      <title>${escapeXml(feedTitle)}</title>
      <link>${PUBLIC_DOMAIN}</link>
    </image>
    <copyright>© ${new Date().getFullYear()} The Dharma Watch. All rights reserved.</copyright>
    <generator>DharmaWatch Newsroom Syndication Engine v2.0</generator>
${itemsXml}
  </channel>
</rss>`;
}

// Master RSS Feed
syndicationRouter.get(['/rss.xml', '/feed.xml', '/rss'], (_req, res) => {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.send(generateRssFeed());
});

// Category-Specific RSS Feeds (e.g. /rss/national.xml, /rss/economy.xml)
syndicationRouter.get(['/rss/:cat.xml', '/rss/:cat'], (req, res) => {
  const cat = req.params.cat.replace(/\.xml$/, '').toLowerCase();
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.send(generateRssFeed(cat));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. JSON FEED v1.1 SPECIFICATION (/feed.json, /api/feed/json)
// ─────────────────────────────────────────────────────────────────────────────
syndicationRouter.get(['/feed.json', '/api/feed/json'], (_req, res) => {
  try {
    const articles = db.prepare(`
      SELECT a.*, aut.name as author_name, aut.role as author_role
      FROM articles a
      LEFT JOIN authors aut ON aut.id = a.author_id OR aut.slug = a.author_id
      WHERE a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT 50
    `).all() as any[];

    const jsonFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'The Dharma Watch',
      home_page_url: PUBLIC_DOMAIN,
      feed_url: `${PUBLIC_DOMAIN}/feed.json`,
      description: 'National Broadsheet & In-Depth Inquiries Journal of Record.',
      icon: `${PUBLIC_DOMAIN}/logo-dark.png`,
      favicon: `${PUBLIC_DOMAIN}/favicon.ico`,
      language: 'en-IN',
      items: articles.map((art) => {
        let paragraphs: string[] = [];
        try {
          paragraphs = JSON.parse(art.content || '[]');
        } catch {
          paragraphs = [art.content || ''];
        }

        const artUrl = `${PUBLIC_DOMAIN}/${art.category_slug}/${art.slug}`;
        const heroImg = getAbsoluteUrl(art.hero_image);

        return {
          id: art.id,
          url: artUrl,
          title: art.title,
          content_html: paragraphs.map((p) => `<p>${escapeXml(p)}</p>`).join(''),
          summary: art.deck || art.excerpt || paragraphs[0]?.substring(0, 200) || '',
          image: heroImg,
          date_published: new Date(art.published_at).toISOString(),
          tags: [art.category_slug, ...(art.is_lead ? ['lead_story'] : []), ...(art.is_breaking ? ['breaking'] : [])],
          authors: [
            {
              name: art.author_name || art.author_id || 'National Bureau',
            },
          ],
        };
      }),
    };

    res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.json(jsonFeed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CROSS-POSTING AUTOMATION API (/api/feed/latest, /api/feed/cross-post)
// Designed for Zapier, Make, n8n, Python bots, Telegram Channel Autoposters & Buffer
// ─────────────────────────────────────────────────────────────────────────────
syndicationRouter.get(['/api/feed/latest', '/api/feed/cross-post'], (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const since = req.query.since as string;

    let query = `
      SELECT a.*, aut.name as author_name, aut.role as author_role
      FROM articles a
      LEFT JOIN authors aut ON aut.id = a.author_id OR aut.slug = a.author_id
      WHERE a.status = 'published'
    `;
    const params: any[] = [];

    if (since) {
      query += ' AND a.published_at > ?';
      params.push(since);
    }

    query += ' ORDER BY a.published_at DESC LIMIT ?';
    params.push(limit);

    const articles = db.prepare(query).all(...params) as any[];

    const posts = articles.map((art) => {
      const artUrl = `${PUBLIC_DOMAIN}/${art.category_slug}/${art.slug}`;
      const heroImg = getAbsoluteUrl(art.hero_image);
      const author = art.author_name || art.author_id || 'National Bureau';
      const category = (art.category || art.category_slug || 'National').toUpperCase();
      const hashtag = `#${art.category_slug.replace(/[^\w]/g, '')}`;

      return {
        id: art.id,
        slug: art.slug,
        title: art.title,
        summary: art.deck || art.excerpt || '',
        category: art.category || art.category_slug,
        categorySlug: art.category_slug,
        author,
        url: artUrl,
        imageUrl: heroImg,
        isLead: Boolean(art.is_lead),
        isBreaking: Boolean(art.is_breaking),
        readTimeMinutes: art.read_time_minutes || 2,
        publishedAt: art.published_at,
        socialSnippets: {
          xTwitter: `${art.is_breaking ? '⚡ BREAKING: ' : ''}${art.title}\n\n${artUrl} ${hashtag} #DharmaWatch`,
          telegramHtml: `<b>${art.is_breaking ? '⚡ BREAKING: ' : ''}${escapeXml(art.title)}</b>\n\n${escapeXml(art.deck || art.excerpt || '')}\n\n✍️ <i>${escapeXml(author)}</i>\n🔗 <a href="${artUrl}">Read Full Broadsheet Story</a>`,
          telegramMarkdown: `*${art.is_breaking ? '⚡ BREAKING: ' : ''}${art.title}*\n\n_${art.deck || art.excerpt || ''}_\n\n[Read Full Story on DharmaWatch](${artUrl})`,
          linkedin: `${art.title}\n\n${art.deck || art.excerpt || ''}\n\nRead the full report on The Dharma Watch: ${artUrl}`,
          redditTitle: `${art.title} [${category}]`,
        },
      };
    });

    res.json({
      success: true,
      total: posts.length,
      timestamp: new Date().toISOString(),
      crossPostEndpoint: `${PUBLIC_DOMAIN}/api/feed/latest`,
      posts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOOGLE NEWS XML SITEMAP (/news-sitemap.xml)
// Strictly follows Google News Protocol for Top Stories & Google Discover ranking
// ─────────────────────────────────────────────────────────────────────────────
syndicationRouter.get('/news-sitemap.xml', (_req, res) => {
  try {
    // Google News only accepts articles published in the last 48-72 hours
    const cutOff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const articles = db.prepare(`
      SELECT id, title, slug, category_slug, published_at
      FROM articles
      WHERE status = 'published' AND published_at >= ?
      ORDER BY published_at DESC
      LIMIT 1000
    `).all(cutOff) as any[];

    let urlset = '';
    for (const art of articles) {
      const artUrl = `${PUBLIC_DOMAIN}/${art.category_slug}/${art.slug}`;
      const pubDate = new Date(art.published_at).toISOString();

      urlset += `
  <url>
    <loc>${artUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>The Dharma Watch</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlset}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, stale-while-revalidate=1200');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. MASTER XML SITEMAP (/sitemap.xml)
// Comprehensive index of all articles, sections, dossiers, and institutional pages
// ─────────────────────────────────────────────────────────────────────────────
syndicationRouter.get('/sitemap.xml', (_req, res) => {
  try {
    const articles = db.prepare(`
      SELECT slug, category_slug, published_at, updated_at
      FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 5000
    `).all() as any[];

    const categories = db.prepare('SELECT slug FROM categories ORDER BY sort_order ASC').all() as any[];
    const caseFiles = db.prepare('SELECT id, slug, last_updated FROM case_files').all() as any[];

    const now = new Date().toISOString().split('T')[0];

    let urlsXml = '';

    // Homepage
    urlsXml += `
  <url>
    <loc>${PUBLIC_DOMAIN}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Core Categories
    for (const cat of categories) {
      urlsXml += `
  <url>
    <loc>${PUBLIC_DOMAIN}/${cat.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // Static Institutional Pages
    const staticPages = ['investigations', 'case-files', 'archive', 'data', 'about', 'editorial-policy', 'corrections', 'contact', 'tips'];
    for (const p of staticPages) {
      urlsXml += `
  <url>
    <loc>${PUBLIC_DOMAIN}/${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // All Articles
    for (const art of articles) {
      const artUrl = `${PUBLIC_DOMAIN}/${art.category_slug}/${art.slug}`;
      const lastMod = (art.updated_at || art.published_at || now).split('T')[0];
      urlsXml += `
  <url>
    <loc>${artUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Case Files
    for (const cf of caseFiles) {
      const cfUrl = `${PUBLIC_DOMAIN}/case-files/${cf.slug || cf.id}`;
      const lastMod = (cf.last_updated || now).split('T')[0];
      urlsXml += `
  <url>
    <loc>${cfUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ROBOTS.TXT DIRECTIVE (/robots.txt)
// ─────────────────────────────────────────────────────────────────────────────
syndicationRouter.get('/robots.txt', (_req, res) => {
  const docsRoute = process.env.DOCS_ROUTE || '/wire-specs-7x9q2p';
  const content = `# Newsroom Platform Robots Directive
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /post
Disallow: /publish
Disallow: /newsroom/post
Disallow: ${docsRoute}
Disallow: /wire-specs-
Disallow: /api/tips
Disallow: /api/auth
Disallow: /api/audit
Disallow: /api/users

# Dedicated News Crawlers (Googlebot-News, Bingbot, Applebot)
User-agent: Googlebot
Allow: /

User-agent: Googlebot-News
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Feeds & Sitemaps
Sitemap: ${PUBLIC_DOMAIN}/sitemap.xml
Sitemap: ${PUBLIC_DOMAIN}/news-sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(content);
});
