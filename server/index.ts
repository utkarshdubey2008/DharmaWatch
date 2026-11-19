import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { initDatabase, db } from './db.js';
import { authRouter } from './routes/auth.routes.js';
import { articlesRouter } from './routes/articles.routes.js';
import { caseFilesRouter } from './routes/caseFiles.routes.js';
import { homepageRouter } from './routes/homepage.routes.js';
import { mediaRouter } from './routes/media.routes.js';
import { authorsRouter } from './routes/authors.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { correctionsRouter } from './routes/corrections.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { subscribersRouter } from './routes/subscribers.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { tipsRouter } from './routes/tips.routes.js';
import { syndicationRouter } from './routes/syndication.routes.js';
import { startTelegramBot } from './telegramBot.js';

// Initialize SQLite database and seed schema if needed
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// High-Security & Anti-Forensics Headers for Journalistic Whistleblower Protection
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Zero-Cache policy for whistleblower intake and cryptographic receipts
app.use('/api/tips', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Project root directory
const projectRoot = path.resolve(import.meta.dirname, '..');

// Static Media Uploads Directory
const uploadsDir = path.resolve(projectRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DharmaWatch Newsroom API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Categories API
app.get('/api/categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[];
    const categories = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      subcategories: JSON.parse(r.subcategories || '[]'),
      sort_order: r.sort_order,
      sortOrder: r.sort_order,
    }));
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount API Routers
app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/case-files', caseFilesRouter);
app.use('/api/homepage', homepageRouter);
app.use('/api/media', mediaRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/corrections', correctionsRouter);
app.use('/api/audit-log', auditRouter);
app.use('/api/audit', auditRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/subscribers', subscribersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tips', tipsRouter);
app.use(syndicationRouter);

// Helper to escape HTML characters in meta tags
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface PageMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  baseUrl: string;
  articleData?: {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified: string;
    authorName: string;
    authorRole: string;
    section: string;
    url: string;
  };
}

function getOpenGraphMeta(req: express.Request): PageMeta {
  const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const publicDomain = process.env.PUBLIC_DOMAIN || '';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || `thedharmawatch.in`;
  const baseUrl = publicDomain ? publicDomain.replace(/\/+$/, '') : `${protocol}://${host}`;
  const fullUrl = `${baseUrl}${req.originalUrl}`;

  // Retrieve customizable social sharing configuration (settings DB -> env -> defaults)
  let customOgImage = '';
  let ogVersion = '';
  let homeTitle = '';
  let homeDesc = '';
  try {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('og_image', 'og_image_version', 'og_title', 'og_description')").all() as any[];
    for (const r of rows) {
      if (r.key === 'og_image' && r.value) customOgImage = r.value.trim();
      if (r.key === 'og_image_version' && r.value) ogVersion = r.value.trim();
      if (r.key === 'og_title' && r.value) homeTitle = r.value.trim();
      if (r.key === 'og_description' && r.value) homeDesc = r.value.trim();
    }
  } catch (e) {}

  if (!customOgImage && process.env.OG_IMAGE_URL) {
    customOgImage = process.env.OG_IMAGE_URL.trim();
  }
  if (!ogVersion && process.env.OG_IMAGE_VERSION) {
    ogVersion = process.env.OG_IMAGE_VERSION.trim();
  }
  if (!customOgImage) {
    customOgImage = '/dharmawatch-social-preview.png';
  }
  if (!ogVersion) {
    ogVersion = '2.2';
  }

  let defaultImage = customOgImage;
  if (defaultImage.startsWith('/')) {
    defaultImage = `${baseUrl}${defaultImage}`;
  }
  if (!defaultImage.includes('?')) {
    defaultImage = `${defaultImage}?v=${ogVersion}`;
  }

  const rawPath = req.path.split('?')[0];
  const parts = rawPath.split('/').filter(Boolean);

  // 1. Article URL: /:category/:slug or /article/:slug
  let articleSlug: string | null = null;
  if (parts.length === 2 && !['admin', 'api', 'uploads', 'case-files', 'case', 'authors'].includes(parts[0])) {
    articleSlug = parts[1];
  } else if (parts.length >= 2 && parts[0] === 'article') {
    articleSlug = parts[1];
  }

  if (articleSlug) {
    try {
      const article = db.prepare(`
        SELECT a.title, a.deck, a.excerpt, a.hero_image, a.seo_title, a.seo_meta_description,
               a.published_at, a.updated_at, a.category, a.category_slug,
               aut.name as author_name, aut.role as author_role
        FROM articles a
        LEFT JOIN authors aut ON aut.id = a.author_id OR aut.slug = a.author_id
        WHERE a.slug = ?
      `).get(articleSlug) as any;

      if (article) {
        const title = article.seo_title || article.title;
        const description = article.seo_meta_description || article.deck || article.excerpt || '';
        let image = article.hero_image || defaultImage;
        if (image.includes('canon-filetolink') || image.endsWith('.mp4')) {
          image = defaultImage;
        } else if (image.startsWith('/')) {
          image = `${baseUrl}${image}`;
        }
        return {
          title: `${title} | The Dharma Watch`,
          description,
          image,
          url: fullUrl,
          type: 'article',
          baseUrl,
          articleData: {
            headline: article.title,
            description,
            image,
            datePublished: article.published_at,
            dateModified: article.updated_at || article.published_at,
            authorName: article.author_name || 'The Dharma Watch',
            authorRole: article.author_role || 'Independent Newsroom',
            section: article.category || article.category_slug,
            url: fullUrl,
          },
        };
      }
    } catch (e) {
      console.error('[OpenGraph Article Meta Error]:', e);
    }
  }

  // 2. Case File URL: /case-files/:id or /case/:id
  if ((parts[0] === 'case-files' || parts[0] === 'case') && parts[1]) {
    const caseId = parts[1];
    try {
      const caseFile = db.prepare('SELECT title, summary, lead_image FROM case_files WHERE id = ? OR slug = ?').get(caseId, caseId) as any;
      if (caseFile) {
        let image = caseFile.lead_image || defaultImage;
        if (image.includes('canon-filetolink') || image.endsWith('.mp4')) {
          image = defaultImage;
        } else if (image.startsWith('/')) {
          image = `${baseUrl}${image}`;
        }
        return {
          title: `${caseFile.title} | The Dharma Watch Case File`,
          description: caseFile.summary || '',
          image,
          url: fullUrl,
          type: 'article',
          baseUrl,
        };
      }
    } catch (e) {
      console.error('[OpenGraph Case File Meta Error]:', e);
    }
  }

  // 3. Author URL: /authors/:slug
  if (parts[0] === 'authors' && parts[1]) {
    const authorSlug = parts[1];
    try {
      const author = db.prepare('SELECT name, bio, avatar FROM authors WHERE slug = ?').get(authorSlug) as any;
      if (author) {
        let image = author.avatar || defaultImage;
        if (image.startsWith('/')) {
          image = `${baseUrl}${image}`;
        }
        return {
          title: `${author.name} | The Dharma Watch`,
          description: author.bio || '',
          image,
          url: fullUrl,
          type: 'profile',
          baseUrl,
        };
      }
    } catch (e) {
      console.error('[OpenGraph Author Meta Error]:', e);
    }
  }

  // 4. Section & Institutional Pages
  const sectionMeta: Record<string, { title: string; description: string }> = {
    national: {
      title: 'National & Politics | The Dharma Watch',
      description: 'Comprehensive coverage of Indian politics, Parliament, Supreme Court jurisprudence, federal policy, and election updates.',
    },
    world: {
      title: 'World & Strategic Affairs | The Dharma Watch',
      description: 'International diplomacy, Indo-Pacific alliances, South Asian neighborhood, multilateral treaties, and global geopolitics.',
    },
    economy: {
      title: 'Economy & Financial Markets | The Dharma Watch',
      description: 'Macroeconomic analysis, RBI monetary policy, banking, capital markets, industrial manufacturing, tech, and fiscal governance.',
    },
    investigations: {
      title: 'Investigations & Watchdog Dossiers | The Dharma Watch',
      description: 'In-depth investigative dossiers, forensic document trails, RTI audits, public spending scrutiny, and accountability reporting.',
    },
    opinions: {
      title: 'Opinion & The Editorial Page | The Dharma Watch',
      description: 'The Dharma View editorials, columns, constitutional debates, policy critiques, and scholarly essays.',
    },
    'society-culture': {
      title: 'Society, Law & Living Heritage | The Dharma Watch',
      description: 'Civil liberties, ancient and living heritage, architectural conservation, educational developments, and cultural traditions.',
    },
    'fact-check': {
      title: 'Fact Check & Media Watch | The Dharma Watch',
      description: 'Forensic debunking of viral disinformation, AI-generated synthetic media, manipulated clips, and narrative distortion audits.',
    },
    about: {
      title: 'About Us | The Dharma Watch - The National Journal of Record',
      description: 'Why The Dharma Watch exists: An independent digital news publication dedicated to investigative journalism, constitutional accountability, and verified public records.',
    },
    'about-us': {
      title: 'About Us | The Dharma Watch - The National Journal of Record',
      description: 'Why The Dharma Watch exists: An independent digital news publication dedicated to investigative journalism, constitutional accountability, and verified public records.',
    },
    publication: {
      title: 'Publication & Editorial Directory | The Dharma Watch',
      description: 'Directory of operational disclosures, editorial charters, standards, and legal policies of The Dharma Watch.',
    },
    'ownership-and-funding': {
      title: 'Ownership & Funding Disclosure | The Dharma Watch',
      description: 'Official ownership and financial disclosure: independently owned and operated, personally funded by the owner, with zero external institutional funding or advertising revenue.',
    },
    ownership: {
      title: 'Ownership & Funding Disclosure | The Dharma Watch',
      description: 'Official ownership and financial disclosure: independently owned and operated, personally funded by the owner, with zero external institutional funding or advertising revenue.',
    },
    standards: {
      title: 'Journalism Standards & Ethical Principles | The Dharma Watch',
      description: 'Our foundational journalistic standards: primary-source verification, fairness, right of reply, transparent corrections, and conflict avoidance.',
    },
    'our-standards': {
      title: 'Journalism Standards & Ethical Principles | The Dharma Watch',
      description: 'Our foundational journalistic standards: primary-source verification, fairness, right of reply, transparent corrections, and conflict avoidance.',
    },
    editorial: {
      title: 'Editorial Charter & Independence | The Dharma Watch',
      description: 'Editorial independence, four-tier content demarcation, and conflict-of-interest guidelines for independent reporting.',
    },
    'editorial-policy': {
      title: 'Editorial Standards & Evidentiary Policy | The Dharma Watch',
      description: 'Our investigative methodology, evidence verification criteria, right of reply, and commitment to factual accuracy.',
    },
    'fact-checking': {
      title: 'Fact-Checking & Forensic Verification | The Dharma Watch',
      description: 'Four-stage forensic verification pipeline, primary source triangulation, and five-tier veracity taxonomy.',
    },
    'sources-and-attribution': {
      title: 'Sources & Attribution Doctrine | The Dharma Watch',
      description: 'Three-tier evidence pyramid, primary public records standard, anonymous sourcing criteria, and confidential source protection.',
    },
    sources: {
      title: 'Sources & Attribution Doctrine | The Dharma Watch',
      description: 'Three-tier evidence pyramid, primary public records standard, anonymous sourcing criteria, and confidential source protection.',
    },
    corrections: {
      title: 'Public Corrections Ledger | The Dharma Watch',
      description: 'Transparent public record of all factual corrections, clarifications, and errata updates.',
    },
    'privacy-policy': {
      title: 'Privacy Policy | The Dharma Watch',
      description: 'Reader privacy policy: no behavioral ad trackers, data minimization, functional local storage, and secure communications.',
    },
    privacy: {
      title: 'Privacy Policy | The Dharma Watch',
      description: 'Reader privacy policy: no behavioral ad trackers, data minimization, functional local storage, and secure communications.',
    },
    'terms-of-use': {
      title: 'Terms of Use | The Dharma Watch',
      description: 'Terms and conditions governing access, intellectual property, acceptable use, and educational fair dealing on The Dharma Watch.',
    },
    terms: {
      title: 'Terms of Use | The Dharma Watch',
      description: 'Terms and conditions governing access, intellectual property, acceptable use, and educational fair dealing on The Dharma Watch.',
    },
    'grievance-redressal': {
      title: 'Grievance Redressal Mechanism | The Dharma Watch',
      description: 'Editorial grievance redressal procedure, timelines, and contact channels for published content on The Dharma Watch.',
    },
    grievance: {
      title: 'Grievance Redressal Mechanism | The Dharma Watch',
      description: 'Editorial grievance redressal procedure, timelines, and contact channels for published content on The Dharma Watch.',
    },
    'ai-usage-policy': {
      title: 'AI Usage & Synthetic Media Policy | The Dharma Watch',
      description: 'Our commitment to human-reported journalism, safeguards regarding artificial intelligence tools, and forensic scrutiny of deepfakes.',
    },
    'ai-policy': {
      title: 'AI Usage & Synthetic Media Policy | The Dharma Watch',
      description: 'Our commitment to human-reported journalism, safeguards regarding artificial intelligence tools, and forensic scrutiny of deepfakes.',
    },
    ai: {
      title: 'AI Usage & Synthetic Media Policy | The Dharma Watch',
      description: 'Our commitment to human-reported journalism, safeguards regarding artificial intelligence tools, and forensic scrutiny of deepfakes.',
    },
    disclaimer: {
      title: 'Legal Disclaimer | The Dharma Watch',
      description: 'General journalistic disclaimer, sub-judice reporting notice, and limitation of liability disclosures.',
    },
    advertising: {
      title: 'Advertising & Commercial Policy | The Dharma Watch',
      description: 'Current self-funded status, absence of programmatic tracking networks, and strict editorial separation principles.',
    },
    advertise: {
      title: 'Advertising & Commercial Policy | The Dharma Watch',
      description: 'Current self-funded status, absence of programmatic tracking networks, and strict editorial separation principles.',
    },
    submissions: {
      title: 'Submissions & Op-Ed Guidelines | The Dharma Watch',
      description: 'Guidelines and criteria for contributing external op-eds, legal analysis, and research pitches to The Dharma Watch.',
    },
    'op-ed-submissions': {
      title: 'Submissions & Op-Ed Guidelines | The Dharma Watch',
      description: 'Guidelines and criteria for contributing external op-eds, legal analysis, and research pitches to The Dharma Watch.',
    },
    contact: {
      title: 'Contact Us & Confidential Ingest | The Dharma Watch',
      description: 'Editorial contacts, general inquiries, submissions desk, corrections desk, and encrypted whistleblower intake channels.',
    },
    'contact-us': {
      title: 'Contact Us & Confidential Ingest | The Dharma Watch',
      description: 'Editorial contacts, general inquiries, submissions desk, corrections desk, and encrypted whistleblower intake channels.',
    },
    archive: {
      title: 'Archive Wire & Dossiers | The Dharma Watch',
      description: 'Complete chronological archive of investigative dispatches, ground reports, and primary public records.',
    },
  };

  const sectionKey = parts[0]?.toLowerCase();
  if (sectionKey && sectionMeta[sectionKey]) {
    return {
      title: sectionMeta[sectionKey].title,
      description: sectionMeta[sectionKey].description,
      image: defaultImage,
      url: fullUrl,
      type: 'website',
      baseUrl,
    };
  }

  // 5. Default / Home URL
  return {
    title: homeTitle || 'The Dharma Watch | Journalism of Courage · The National Journal of Record',
    description: homeDesc || 'An independent national broadsheet news publication and investigative journal of record. Dedicated to fearless reporting, constitutional accountability, and primary evidence verification.',
    image: defaultImage,
    url: fullUrl,
    type: 'website',
    baseUrl,
  };
}

// Serve Static Frontend Assets & Client SPA Fallback
const distDir = path.resolve(projectRoot, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));

  const indexPath = path.join(distDir, 'index.html');

  // SPA fallback for all non-API and non-uploads GET & HEAD requests with dynamic Open Graph injection
  app.use((req, res, next) => {
    if ((req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      fs.readFile(indexPath, 'utf-8', (err, html) => {
        if (err) return next(err);

        const meta = getOpenGraphMeta(req);
        const escapedTitle = escapeHtml(meta.title);
        const escapedDesc = escapeHtml(meta.description);
        const escapedImg = escapeHtml(meta.image);
        const escapedUrl = escapeHtml(meta.url);

        const jsonLd = meta.articleData ? `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${escapedUrl}"
      },
      "headline": "${escapeHtml(meta.articleData.headline)}",
      "description": "${escapedDesc}",
      "image": ["${escapedImg}"],
      "datePublished": "${meta.articleData.datePublished}",
      "dateModified": "${meta.articleData.dateModified}",
      "author": {
        "@type": "Person",
        "name": "${escapeHtml(meta.articleData.authorName)}",
        "jobTitle": "${escapeHtml(meta.articleData.authorRole)}"
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "The Dharma Watch",
        "url": "${meta.baseUrl}",
        "logo": {
          "@type": "ImageObject",
          "url": "${meta.baseUrl}/logo-dark.png",
          "width": 1972,
          "height": 376
        }
      },
      "articleSection": "${escapeHtml(meta.articleData.section)}",
      "inLanguage": "en-IN"
    }
    </script>` : `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": "The Dharma Watch",
      "url": "${meta.baseUrl}",
      "logo": "${meta.baseUrl}/logo-dark.png",
      "sameAs": ["https://x.com/thedharmawatch"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${meta.baseUrl}/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>`;

        const ogTags = `
    <!-- Dynamic Social Share & Open Graph Meta Tags -->
    <title>${escapedTitle}</title>
    <meta name="title" content="${escapedTitle}" />
    <meta name="description" content="${escapedDesc}" />
    <link rel="canonical" href="${escapedUrl}" />

    <!-- Open Graph (Facebook, WhatsApp, LinkedIn, Telegram) -->
    <meta property="og:site_name" content="The Dharma Watch" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:image" content="${escapedImg}" />
    <meta property="og:image:secure_url" content="${escapedImg}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapedTitle}" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thedharmawatch" />
    <meta name="twitter:creator" content="@thedharmawatch" />
    <meta name="twitter:url" content="${escapedUrl}" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    <meta name="twitter:image" content="${escapedImg}" />
    <meta name="twitter:image:alt" content="${escapedTitle}" />

    <!-- Telegram & WhatsApp Rich Preview Microdata -->
    <meta itemprop="name" content="${escapedTitle}" />
    <meta itemprop="description" content="${escapedDesc}" />
    <meta itemprop="image" content="${escapedImg}" />
    <link rel="image_src" href="${escapedImg}" />

    <!-- Google News, Syndication Feeds & Sitemaps -->
    <link rel="alternate" type="application/rss+xml" title="The Dharma Watch RSS Feed" href="${meta.baseUrl}/rss.xml" />
    <link rel="alternate" type="application/feed+json" title="The Dharma Watch JSON Feed" href="${meta.baseUrl}/feed.json" />
    <link rel="sitemap" type="application/xml" title="Google News Sitemap" href="${meta.baseUrl}/news-sitemap.xml" />
    <link rel="sitemap" type="application/xml" title="Master Sitemap" href="${meta.baseUrl}/sitemap.xml" />
    <meta name="news_keywords" content="India News, National, Politics, Economy, Sensex, Supreme Court, Investigations, Fact Check, Public Policy" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

    ${jsonLd}
        `.trim();

        // Strip static title/description/og tags from build and inject dynamic tags at top of head
        let customizedHtml = html
          .replace(/<title>.*?<\/title>/gi, '')
          .replace(/<meta\s+name="title"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+property="og:.*?"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+name="twitter:.*?"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+itemprop=".*?"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, '')
          .replace(/<link\s+rel="image_src"\s+href=".*?"\s*\/?>/gi, '');

        if (customizedHtml.includes('<meta name="viewport"')) {
          customizedHtml = customizedHtml.replace(/(<meta name="viewport"[^>]*>)/i, `$1\n    ${ogTags}`);
        } else {
          customizedHtml = customizedHtml.replace('<head>', `<head>\n    ${ogTags}`);
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(customizedHtml);
      });
    } else {
      next();
    }
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Newsroom API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error in newsroom system.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DharmaWatch Newsroom API & CMS] Online on http://0.0.0.0:${PORT}`);
  // Launch Telegram Newsroom Control Bot
  try {
    startTelegramBot();
  } catch (err: any) {
    console.error('[Telegram Bot Initialization Error]:', err.message);
  }
});
