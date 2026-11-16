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
  const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || `localhost:${PORT}`;
  const baseUrl = `${protocol}://${host}`;
  const fullUrl = `${baseUrl}${req.originalUrl}`;
  const defaultImage = `${baseUrl}/dharmawatch-og.png`;

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
            authorName: article.author_name || 'National Bureau',
            authorRole: article.author_role || 'Political & Governance Bureau',
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
      description: 'Why The Dharma Watch exists: An independent national daily and investigative newsroom dedicated to fearless journalism, constitutional accountability, and verified public records.',
    },
    violence: {
      title: 'Crime & Public Safety Watch | The Dharma Watch',
      description: 'Investigative records, police statements, and ground documentation of crime and public safety enforcement across India.',
    },
    persecution: {
      title: 'Civil Liberties & Rights Watch | The Dharma Watch',
      description: 'Documenting civil liberty violations, demographic intimidation, and institutional discrimination through certified legal records.',
    },
    'temple-heritage': {
      title: 'Temple Heritage & Sanctity | The Dharma Watch',
      description: 'Ground investigations and verified reporting on temple conservation, architectural heritage, and historical preservation.',
    },
    'editorial-policy': {
      title: 'Editorial Charter & Evidentiary Standards | The Dharma Watch',
      description: 'Our journalistic methodology, evidence verification criteria, right of reply, and commitment to truth and independence.',
    },
    corrections: {
      title: 'Public Corrections Log | The Dharma Watch',
      description: 'Transparent public record of all factual corrections and editorial updates.',
    },
    contact: {
      title: 'Confidential Tip Intake | The Dharma Watch',
      description: 'Submit verified documents, RTI disclosures, court filings, and ground video evidence securely to our reporting desk.',
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
    title: 'The Dharma Watch | Journalism of Courage · The National Journal of Record',
    description: 'An independent broadsheet news publication and investigative journal of record. Dedicated to fearless reporting, constitutional accountability, and primary evidence verification.',
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
    <meta name="description" content="${escapedDesc}" />
    <meta property="og:site_name" content="The Dharma Watch" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:image" content="${escapedImg}" />
    <meta property="og:image:secure_url" content="${escapedImg}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapedTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thedharmawatch" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    <meta name="twitter:image" content="${escapedImg}" />
    <link rel="canonical" href="${escapedUrl}" />

    <!-- Google News, Syndication Feeds & Sitemaps -->
    <link rel="alternate" type="application/rss+xml" title="The Dharma Watch RSS Feed" href="${meta.baseUrl}/rss.xml" />
    <link rel="alternate" type="application/feed+json" title="The Dharma Watch JSON Feed" href="${meta.baseUrl}/feed.json" />
    <link rel="sitemap" type="application/xml" title="Google News Sitemap" href="${meta.baseUrl}/news-sitemap.xml" />
    <link rel="sitemap" type="application/xml" title="Master Sitemap" href="${meta.baseUrl}/sitemap.xml" />
    <meta name="news_keywords" content="India News, National, Politics, Economy, Sensex, Supreme Court, Investigations, Fact Check, Public Policy" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

    ${jsonLd}
        `.trim();

        // Strip static title/description/og tags from build and inject dynamic tags
        let customizedHtml = html
          .replace(/<title>.*?<\/title>/gi, '')
          .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+property="og:.*?"\s+content=".*?"\s*\/?>/gi, '')
          .replace(/<meta\s+name="twitter:.*?"\s+content=".*?"\s*\/?>/gi, '');

        customizedHtml = customizedHtml.replace('</head>', `  ${ogTags}\n  </head>`);

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
