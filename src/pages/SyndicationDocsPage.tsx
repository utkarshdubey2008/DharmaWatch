import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Code2,
  FileCode2,
  Rss,
  Radio,
  Share2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

import { DOCS_CONFIG } from "../config/docsConfig";

interface RouteDoc {
  id: string;
  category: 'xml' | 'json' | 'api';
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  headers: Record<string, string>;
  queryParams?: { name: string; type: string; required: boolean; description: string }[];
  curlExample: string;
  responseType: string;
  expectedResponse: string;
  fieldNotes: { field: string; type: string; explanation: string }[];
}

const PUBLIC_DOMAIN = DOCS_CONFIG.domain;

const ROUTE_DOCS: RouteDoc[] = [
  {
    id: 'rss-master',
    category: 'xml',
    method: 'GET',
    path: '/rss.xml',
    title: 'Master RSS 2.0 Syndication Feed',
    description: 'Master RSS 2.0 wire with Dublin Core (dc:creator), Media RSS (media:content), and enclosure attachments for hero images. Dispatches the latest 50 verified reports across all beats. Suitable for feed aggregators, Feedly, Zapier, Make, Buffer, and IFTTT.',
    headers: {
      'Accept': 'application/xml, text/xml, */*',
    },
    curlExample: `curl -s ${PUBLIC_DOMAIN}/rss.xml`,
    responseType: 'application/xml; charset=utf-8',
    expectedResponse: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Dharma Watch — Broadsheet &amp; Investigative Journal of Record</title>
    <link>https://yourdomain.com</link>
    <description>Independent national broadsheet news publication and investigative journal of record. Dedicated to constitutional accountability and primary public records.</description>
    <language>en-in</language>
    <lastBuildDate>Mon, 16 Nov 2026 07:24:09 GMT</lastBuildDate>
    <atom:link href="https://yourdomain.com/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://yourdomain.com/logo-dark.png</url>
      <title>The Dharma Watch — Broadsheet &amp; Investigative Journal of Record</title>
      <link>https://yourdomain.com</link>
    </image>
    <copyright>© 2026 The Dharma Watch. All rights reserved.</copyright>
    <generator>DharmaWatch Newsroom Syndication Engine v2.0</generator>

    <item>
      <title>Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records</title>
      <link>https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records</link>
      <guid isPermaLink="true">https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records</guid>
      <pubDate>Mon, 16 Nov 2026 07:24:09 GMT</pubDate>
      <dc:creator><![CDATA[National Legal Desk]]></dc:creator>
      <category>national</category>
      <description><![CDATA[A three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives to all twenty-five High Courts across the republic to standardize electronic trial court records within ninety days.]]></description>
      <content:encoded><![CDATA[<p>In a landmark directive aimed at modernizing appellate jurisprudence, the Supreme Court of India on Monday instructed all High Courts...</p>]]></content:encoded>
      <enclosure url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200" length="0" type="image/jpeg" />
      <media:content url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200" medium="image" type="image/jpeg" />
    </item>
  </channel>
</rss>`,
    fieldNotes: [
      { field: 'title', type: 'string', explanation: 'Article headline sanitized for XML encoding.' },
      { field: 'link', type: 'url', explanation: 'Canonical permanent URL of the story on yourdomain.com.' },
      { field: 'guid', type: 'url', explanation: 'Globally unique permanent story identifier.' },
      { field: 'pubDate', type: 'RFC 822 / RFC 2822', explanation: 'Standard publication timestamp for sorting.' },
      { field: 'dc:creator', type: 'string', explanation: 'Author name or reporting bureau byline.' },
      { field: 'category', type: 'string', explanation: 'Desk slug (national, economy, world, opinions, investigations).' },
      { field: 'description', type: 'string', explanation: 'Article deck / brief summary / lead paragraph.' },
      { field: 'content:encoded', type: 'HTML string', explanation: 'Sanitized full story text wrapped in CDATA.' },
      { field: 'enclosure', type: 'XML element', explanation: 'Hero image attachment required by automation tools (Zapier, Buffer) for thumbnail rendering.' },
      { field: 'media:content', type: 'XML element', explanation: 'Media RSS standard thumbnail tag for modern feed readers.' },
    ],
  },
  {
    id: 'rss-category',
    category: 'xml',
    method: 'GET',
    path: '/rss/:category.xml',
    title: 'Category Beat RSS 2.0 Feeds',
    description: 'Dedicated section feeds filtered by beat. Supported category slugs: national, world, economy, opinions, investigations, society-culture, fact-check. Also accepts /rss/:category (without .xml extension).',
    headers: {
      'Accept': 'application/xml',
    },
    queryParams: [
      { name: 'category', type: 'path param', required: true, description: 'Slug of the section (e.g. national, economy, world).' },
    ],
    curlExample: `curl -s ${PUBLIC_DOMAIN}/rss/economy.xml`,
    responseType: 'application/xml; charset=utf-8',
    expectedResponse: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Dharma Watch — ECONOMY Wire</title>
    <link>https://yourdomain.com/economy</link>
    <description>The Dharma Watch ECONOMY reporting wire and verified dispatches.</description>
    <language>en-in</language>
    <lastBuildDate>Mon, 16 Nov 2026 07:15:33 GMT</lastBuildDate>
    <atom:link href="https://yourdomain.com/rss/economy.xml" rel="self" type="application/rss+xml" />
    <item>
      <title>GST Council Rationalises Compliance Framework for Micro and Small Enterprises</title>
      <link>https://yourdomain.com/economy/gst-council-rationalises-compliance-framework-for-micro-and-small-enterprises</link>
      <guid isPermaLink="true">https://yourdomain.com/economy/gst-council-rationalises-compliance-framework-for-micro-and-small-enterprises</guid>
      <pubDate>Mon, 16 Nov 2026 07:15:33 GMT</pubDate>
      <dc:creator><![CDATA[Economy & Financial Bureau]]></dc:creator>
      <category>economy</category>
      <enclosure url="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200" length="0" type="image/jpeg" />
    </item>
  </channel>
</rss>`,
    fieldNotes: [
      { field: 'channel/title', type: 'string', explanation: 'Names the specific editorial beat wire.' },
      { field: 'item', type: 'array', explanation: 'Articles specifically tagged under this category.' },
    ],
  },
  {
    id: 'google-news-sitemap',
    category: 'xml',
    method: 'GET',
    path: '/news-sitemap.xml',
    title: 'Google News XML Sitemap Protocol',
    description: 'Official Google News protocol compliant XML sitemap. Filtered strictly to verified stories published within the last 48-72 hours. Googlebot-News crawls this endpoint every few minutes for real-time news indexation.',
    headers: {
      'Accept': 'application/xml',
    },
    curlExample: `curl -s ${PUBLIC_DOMAIN}/news-sitemap.xml`,
    responseType: 'application/xml; charset=utf-8',
    expectedResponse: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

  <url>
    <loc>https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records</loc>
    <news:news>
      <news:publication>
        <news:name>The Dharma Watch</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2026-11-16T07:24:09.853Z</news:publication_date>
      <news:title>Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records</news:title>
    </news:news>
  </url>
</urlset>`,
    fieldNotes: [
      { field: 'loc', type: 'url', explanation: 'Exact canonical URL of the article.' },
      { field: 'news:publication/news:name', type: 'string', explanation: 'Official publication name registered with Google News Publisher Center.' },
      { field: 'news:publication/news:language', type: 'string', explanation: 'ISO 639-1 language code (en).' },
      { field: 'news:publication_date', type: 'W3C ISO 8601', explanation: 'Timestamp required by Google News schema.' },
      { field: 'news:title', type: 'string', explanation: 'Exact headline matching on-page H1 and NewsArticle JSON-LD.' },
    ],
  },
  {
    id: 'master-sitemap',
    category: 'xml',
    method: 'GET',
    path: '/sitemap.xml',
    title: 'Master XML Sitemap Index (sitemaps.org 0.9)',
    description: 'Comprehensive sitemap indexing all published articles, category desks, investigative case files, and institutional public surfaces for general crawlers (Google Search, Bingbot).',
    headers: {
      'Accept': 'application/xml',
    },
    curlExample: `curl -s ${PUBLIC_DOMAIN}/sitemap.xml`,
    responseType: 'application/xml; charset=utf-8',
    expectedResponse: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com</loc>
    <lastmod>2026-11-16</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/national</loc>
    <lastmod>2026-11-16</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records</loc>
    <lastmod>2026-11-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/case-files/dossier-urban-drainage-procurement-audit</loc>
    <lastmod>2026-11-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`,
    fieldNotes: [
      { field: 'loc', type: 'url', explanation: 'Target page URL.' },
      { field: 'lastmod', type: 'YYYY-MM-DD', explanation: 'Date of last content revision.' },
      { field: 'changefreq', type: 'string', explanation: 'Crawler refresh cadence hint.' },
      { field: 'priority', type: 'float 0.0 - 1.0', explanation: 'Relative weight of page importance.' },
    ],
  },
  {
    id: 'json-feed',
    category: 'json',
    method: 'GET',
    path: '/feed.json',
    title: 'JSON Feed v1.1 Specification',
    description: 'Modern JSON Feed specification (jsonfeed.org). Clean alternative to XML for JavaScript microservices, headless frontends, mobile apps, and webhook workers. Also accessible at /api/feed/json.',
    headers: {
      'Accept': 'application/feed+json, application/json',
    },
    curlExample: `curl -s ${PUBLIC_DOMAIN}/feed.json`,
    responseType: 'application/feed+json; charset=utf-8',
    expectedResponse: `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "The Dharma Watch — Broadsheet & Investigative Journal of Record",
  "home_page_url": "https://yourdomain.com",
  "feed_url": "https://yourdomain.com/feed.json",
  "description": "Independent national broadsheet news publication and investigative journal of record.",
  "user_comment": "This feed allows automated aggregators and bots to read newsroom updates.",
  "favicon": "https://yourdomain.com/favicon.svg",
  "icon": "https://yourdomain.com/logo-dark.png",
  "language": "en-IN",
  "items": [
    {
      "id": "https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
      "url": "https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
      "title": "Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records",
      "summary": "A three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives to all twenty-five High Courts across the republic to standardize electronic trial court records within ninety days.",
      "content_html": "<p>In a landmark directive aimed at modernizing appellate jurisprudence, the Supreme Court of India on Monday instructed all High Courts...</p>",
      "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200",
      "date_published": "2026-11-16T07:24:09.853Z",
      "authors": [
        {
          "name": "National Legal Desk",
          "url": "https://yourdomain.com/authors/supreme-court-desk"
        }
      ],
      "tags": ["national", "supreme-court", "judiciary", "reform"]
    }
  ]
}`,
    fieldNotes: [
      { field: 'version', type: 'string', explanation: 'Spec URI ("https://jsonfeed.org/version/1.1").' },
      { field: 'items[].id', type: 'string', explanation: 'Unique permanent identifier for deduplication.' },
      { field: 'items[].url', type: 'url', explanation: 'Direct link to story on website.' },
      { field: 'items[].image', type: 'url', explanation: 'High-resolution hero banner for social preview.' },
      { field: 'items[].content_html', type: 'HTML string', explanation: 'Full body HTML formatted content.' },
      { field: 'items[].tags', type: 'array of strings', explanation: 'Category and keywords.' },
    ],
  },
  {
    id: 'crosspost-api',
    category: 'json',
    method: 'GET',
    path: '/api/feed/latest',
    title: 'Programmatic Cross-Posting & Social Distribution API',
    description: 'Engineered specifically for social media auto-posters, n8n, Zapier Webhooks, Make.com, Python bots, and Telegram channel relays. Returns verified articles with pre-formatted snippets for X/Twitter, Telegram (HTML & Markdown), LinkedIn, and Reddit.',
    headers: {
      'Accept': 'application/json',
    },
    queryParams: [
      { name: 'limit', type: 'number', required: false, description: 'Number of stories to return (1 to 50, default: 10).' },
      { name: 'category', type: 'string', required: false, description: 'Optional beat filter (e.g. economy, national).' },
    ],
    curlExample: `curl -s "${PUBLIC_DOMAIN}/api/feed/latest?limit=5"`,
    responseType: 'application/json; charset=utf-8',
    expectedResponse: `{
  "success": true,
  "count": 1,
  "endpoint": "/api/feed/latest",
  "documentation": "Use this endpoint to trigger social bots and external cross-posting workflows.",
  "data": [
    {
      "id": 14,
      "slug": "supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
      "title": "Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records",
      "deck": "A three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives to all twenty-five High Courts across the republic to standardize electronic trial court records within ninety days.",
      "category": "National",
      "categorySlug": "national",
      "url": "https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
      "imageUrl": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200",
      "author": "National Legal Desk",
      "authorRole": "Supreme Court & Constitutional Bureau",
      "publishedAt": "2026-11-16T07:24:09.853Z",
      "readTimeMinutes": 5,
      "isBreaking": false,
      "isInvestigation": false,
      "crossPostSnippets": {
        "xTwitter": "SUPREME COURT DIRECTS HIGH COURTS TO FORMULATE STANDARD RULES FOR DIGITAL CASE RECORDS\\n\\nA three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives...\\n\\nRead the investigation on The Dharma Watch:\\nhttps://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records\\n\\n@newsroom",
        "telegramHtml": "<b>SUPREME COURT DIRECTS HIGH COURTS TO FORMULATE STANDARD RULES FOR DIGITAL CASE RECORDS</b>\\n\\nA three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives to all twenty-five High Courts...\\n\\n<b>Desk:</b> National\\n<b>Byline:</b> National Legal Desk\\n\\nFull coverage: <a href=\\"https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records\\">The Dharma Watch</a>",
        "telegramMarkdown": "*SUPREME COURT DIRECTS HIGH COURTS TO FORMULATE STANDARD RULES FOR DIGITAL CASE RECORDS*\\n\\nA three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives...\\n\\n[The Dharma Watch](https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records)",
        "linkedIn": "Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records\\n\\nA three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives...\\n\\nFull report via The Dharma Watch:\\nhttps://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
        "reddit": "**Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records**\\n\\nA three-judge Constitution Bench led by the Chief Justice of India issued mandatory directives...\\n\\n[Link to Article](https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records)"
      }
    }
  ]
}`,
    fieldNotes: [
      { field: 'data[].id', type: 'integer / string', explanation: 'Unique numeric or string ID in database.' },
      { field: 'data[].url', type: 'url', explanation: 'Canonical story permalink.' },
      { field: 'data[].imageUrl', type: 'url', explanation: 'Image file URL to attach in Telegram sendPhoto or Twitter API media upload.' },
      { field: 'data[].crossPostSnippets.xTwitter', type: 'string', explanation: 'Formatted within 280 chars with title, deck preview, url, and @newsroom handle.' },
      { field: 'data[].crossPostSnippets.telegramHtml', type: 'HTML string', explanation: 'Ready to send directly as parse_mode=HTML in Telegram Bot API sendMessage or sendPhoto caption.' },
      { field: 'data[].crossPostSnippets.telegramMarkdown', type: 'Markdown string', explanation: 'Ready to send with parse_mode=Markdown.' },
    ],
  },
  {
    id: 'rest-articles',
    category: 'api',
    method: 'GET',
    path: '/api/articles',
    title: 'Public REST Articles Query API',
    description: 'Direct query endpoint for full article entities with pagination, beat filtering, search terms, and author expansion.',
    headers: {
      'Accept': 'application/json',
    },
    queryParams: [
      { name: 'page', type: 'number', required: false, description: 'Page index (default: 1).' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100).' },
      { name: 'category', type: 'string', required: false, description: 'Category slug filter (e.g. economy).' },
      { name: 'search', type: 'string', required: false, description: 'Full-text keyword search query.' },
    ],
    curlExample: `curl -s "${PUBLIC_DOMAIN}/api/articles?limit=2&category=national"`,
    responseType: 'application/json; charset=utf-8',
    expectedResponse: `{
  "data": [
    {
      "id": "art-mwixtpts-muyk",
      "slug": "supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records",
      "title": "Supreme Court Directs High Courts to Formulate Standard Rules for Digital Case Records",
      "deck": "A three-judge Constitution Bench led by the Chief Justice of India...",
      "content": [
        "In a landmark directive aimed at modernizing appellate jurisprudence...",
        "## Standardization Across High Courts",
        "The Bench underscored that disparate digital filing practices..."
      ],
      "category": "National",
      "categorySlug": "national",
      "author": {
        "id": "supreme-court-desk",
        "name": "National Legal Desk",
        "slug": "supreme-court-desk",
        "role": "Supreme Court & Constitutional Bureau",
        "avatar": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150"
      },
      "heroImage": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200",
      "imageCaption": "The Supreme Court of India in New Delhi.",
      "publishedAt": "2026-11-16T07:24:09.853Z",
      "readTimeMinutes": 5,
      "isBreaking": false,
      "isLeadStory": true,
      "isInvestigation": false,
      "canonicalUrl": "https://yourdomain.com/national/supreme-court-directs-high-courts-to-formulate-standard-rules-for-digital-case-records"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 14,
    "totalPages": 7
  }
}`,
    fieldNotes: [
      { field: 'data[].content', type: 'array of strings', explanation: 'Paragraphs of the article including markdown headings (##, ###).' },
      { field: 'data[].author', type: 'object', explanation: 'Author metadata with avatar, role, and slug.' },
      { field: 'pagination', type: 'object', explanation: 'Pagination metadata.' },
    ],
  },
  {
    id: 'rest-case-files',
    category: 'api',
    method: 'GET',
    path: '/api/case-files',
    title: 'Judicial Dossiers & Investigation Case Files API',
    description: 'Retrieves verified investigative dossiers, RTI disclosures, court FIR records, confirmed facts, alleged points, and primary evidence documents.',
    headers: {
      'Accept': 'application/json',
    },
    curlExample: `curl -s ${PUBLIC_DOMAIN}/api/case-files`,
    responseType: 'application/json; charset=utf-8',
    expectedResponse: `{
  "data": [
    {
      "id": "dossier-urban-drainage-procurement-audit",
      "title": "The Urban Drainage Procurement Audit: Cross-State RTI Investigation",
      "slug": "dossier-urban-drainage-procurement-audit",
      "summary": "A comprehensive multi-city investigation evaluating ₹14,200 crore in municipal stormwater drainage tenders...",
      "status": "Verified",
      "category": "investigations",
      "incidentType": "Public Spending & Infrastructure Audit",
      "whatIsConfirmed": [
        "Disbursement of ₹14,200 crore across five municipal corporations between 2023 and 2026.",
        "Core-drilling samples from 82 project sites revealed 64% used unreinforced masonry..."
      ],
      "primaryDocuments": [
        {
          "id": "doc-drainage-rti",
          "title": "Compiled RTI Disclosures on Municipal Stormwater Procurement (2023-2026)",
          "documentNumber": "RTI-DW-2026-DRAIN-AUDIT",
          "classification": "Primary Public Record"
        }
      ],
      "lastUpdated": "2026-11-16T06:20:56.886Z"
    }
  ]
}`,
    fieldNotes: [
      { field: 'data[].whatIsConfirmed', type: 'array of strings', explanation: 'Fact-checked evidence points verified by editorial desk.' },
      { field: 'data[].primaryDocuments', type: 'array of objects', explanation: 'Official government/court records referenced.' },
    ],
  },
];

export const SyndicationDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'xml' | 'json' | 'api' | 'recipes'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = ROUTE_DOCS.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Banner / Masthead */}
      <header className="border-b-2 border-stone-900 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-stone-950 text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-1">
                INTERNAL NEWSROOM SPECIFICATION
              </span>
              <span className="text-stone-400 text-xs font-mono">v2.4.0 • STRICTLY PRIVATE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider">
                SYNDICATION PIPELINE LIVE
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-stone-950 tracking-tight">
                The Dharma Watch
              </h1>
              <p className="font-serif italic text-base sm:text-lg text-stone-700 mt-1">
                Broadsheet Wire, Syndication Feeds &amp; Programmatic Cross-Posting API Reference
              </p>
            </div>
            <div className="bg-stone-100 p-3 rounded border border-stone-300 font-mono text-xs">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Canonical Base URL</span>
              <span className="font-bold text-stone-900">{PUBLIC_DOMAIN}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Confidentiality Notice:</strong> This documentation endpoint (<code>{DOCS_CONFIG.route}</code>) is excluded from search engine indexes (<code>robots.txt</code>) and should not be distributed publicly. Use this reference to configure your autonomous publishing tools, Telegram forwarders, and social cross-posters.
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-300 pb-3 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
              activeTab === 'all'
                ? 'bg-stone-950 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
            }`}
          >
            All Endpoints ({ROUTE_DOCS.length})
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
              activeTab === 'xml'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            RSS &amp; XML Feeds (4)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
              activeTab === 'json'
                ? 'bg-sky-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            JSON Feeds &amp; Cross-Post (2)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
              activeTab === 'api'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            REST APIs (2)
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
              activeTab === 'recipes'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Automation Bot Recipes
          </button>
        </div>

        {/* RECIPES TAB */}
        {activeTab === 'recipes' ? (
          <div className="space-y-8">
            {/* Recipe 1: Python Telegram Bot */}
            <div className="bg-white border border-stone-300 rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-900 font-bold text-xs uppercase px-2 py-0.5 rounded">
                    Python Automation Recipe
                  </span>
                  <h3 className="font-bold text-base text-stone-900">
                    Auto-Post New DharmaWatch Stories to a Telegram Channel
                  </h3>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `import time
import requests

API_URL = "https://yourdomain.com/api/feed/latest?limit=5"
TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
CHANNEL_CHAT_ID = "@your_channel_or_id" # or -100xxxxxxxxxx

posted_ids = set()

def poll_and_post():
    try:
        r = requests.get(API_URL, timeout=10)
        data = r.json()
        if not data.get("success"):
            return

        for story in reversed(data.get("data", [])):
            story_id = story["id"]
            if story_id in posted_ids:
                continue

            caption_html = story["crossPostSnippets"]["telegramHtml"]
            image_url = story.get("imageUrl")

            # Send photo with pre-formatted broadsheet caption
            if image_url:
                payload = {
                    "chat_id": CHANNEL_CHAT_ID,
                    "photo": image_url,
                    "caption": caption_html,
                    "parse_mode": "HTML"
                }
                res = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto", json=payload)
            else:
                payload = {
                    "chat_id": CHANNEL_CHAT_ID,
                    "text": caption_html,
                    "parse_mode": "HTML"
                }
                res = requests.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json=payload)

            if res.ok:
                print(f"[POSTED] {story['title']}")
                posted_ids.add(story_id)
            else:
                print(f"[FAIL] {res.text}")

    except Exception as e:
        print("[ERROR]", e)

if __name__ == "__main__":
    print("DharmaWatch Telegram Relay Active...")
    while True:
        poll_and_post()
        time.sleep(120) # Poll every 2 minutes
`,
                      'recipe-python'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded transition-colors"
                >
                  {copiedId === 'recipe-python' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'recipe-python' ? 'Copied Script' : 'Copy Python Code'}
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                This lightweight Python daemon polls <code>/api/feed/latest</code> every 2 minutes, reads the pre-generated <code>telegramHtml</code> social snippet and <code>imageUrl</code>, and sends formatted dispatches to any Telegram broadcast channel.
              </p>

              <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-xs rounded overflow-x-auto leading-relaxed">
{`import time
import requests

API_URL = "https://yourdomain.com/api/feed/latest?limit=5"
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
CHANNEL_CHAT_ID = "@your_channel_or_id"

posted_ids = set()

def poll_and_post():
    r = requests.get(API_URL, timeout=10)
    data = r.json()
    for story in reversed(data.get("data", [])):
        if story["id"] not in posted_ids:
            # Uses pre-formatted HTML caption ready for Telegram
            caption = story["crossPostSnippets"]["telegramHtml"]
            requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto",
                json={"chat_id": CHANNEL_CHAT_ID, "photo": story["imageUrl"], "caption": caption, "parse_mode": "HTML"}
            )
            posted_ids.add(story["id"])

while True:
    poll_and_post()
    time.sleep(120)`}
              </pre>
            </div>

            {/* Recipe 2: Zapier / Make / n8n Webhook */}
            <div className="bg-white border border-stone-300 rounded-lg p-6 shadow-xs space-y-4">
              <span className="bg-sky-100 text-sky-900 font-bold text-xs uppercase px-2 py-0.5 rounded">
                No-Code Integration Guide (Zapier / Make / n8n / Buffer)
              </span>
              <h3 className="font-bold text-base text-stone-900">
                Direct RSS Trigger Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <span className="font-bold block text-stone-800 mb-1">1. RSS Trigger</span>
                  <p className="text-stone-600">Feed URL: <code>https://yourdomain.com/rss.xml</code></p>
                  <p className="text-stone-500 mt-1">Triggers immediately whenever a new <code>&lt;item&gt;</code> is published.</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <span className="font-bold block text-stone-800 mb-1">2. Image Thumbnail</span>
                  <p className="text-stone-600">Use tag: <code>enclosure:url</code> or <code>media:content:url</code></p>
                  <p className="text-stone-500 mt-1">Hero image is cleanly extracted for Twitter/Instagram/LinkedIn cards.</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <span className="font-bold block text-stone-800 mb-1">3. Action Text</span>
                  <p className="text-stone-600">Map Title: <code>title</code>, Link: <code>link</code>, Summary: <code>description</code></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ENDPOINT LIST */
          <div className="space-y-12">
            {filteredDocs.map((doc, idx) => {
              const fullUrl = `${PUBLIC_DOMAIN}${doc.path}`;
              const badgeColor =
                doc.category === 'xml'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : doc.category === 'json'
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300';

              return (
                <article
                  key={doc.id}
                  id={doc.id}
                  className="bg-white border-2 border-stone-900 rounded-lg overflow-hidden shadow-xs"
                >
                  {/* Route Header */}
                  <div className="p-5 sm:p-6 bg-stone-100 border-b-2 border-stone-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-stone-900 text-white font-mono text-xs font-black rounded">
                          {doc.method}
                        </span>
                        <code className="text-sm sm:text-base font-bold font-mono text-stone-950">
                          {doc.path}
                        </code>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {doc.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(fullUrl, `url-${doc.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-mono rounded transition-colors"
                          title="Copy Full URL"
                        >
                          {copiedId === `url-${doc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === `url-${doc.id}` ? 'Copied' : 'Copy URL'}
                        </button>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-mono rounded transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </a>
                      </div>
                    </div>
                    <h2 className="font-serif font-black text-xl text-stone-950 mt-2">
                      {doc.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  {/* Route Specs Body */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Headers & Query Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-stone-50 p-4 rounded border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">
                          Request Headers
                        </span>
                        <div className="space-y-1 font-mono text-xs">
                          {Object.entries(doc.headers).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-stone-600 font-bold">{k}:</span>
                              <span className="text-stone-900">{v}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 border-t border-stone-200 mt-2">
                            <span className="text-stone-500">Response Type:</span>
                            <span className="text-emerald-700 font-bold">{doc.responseType}</span>
                          </div>
                        </div>
                      </div>

                      {doc.queryParams && doc.queryParams.length > 0 ? (
                        <div className="bg-stone-50 p-4 rounded border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">
                            Parameters
                          </span>
                          <div className="space-y-2 text-xs">
                            {doc.queryParams.map((param) => (
                              <div key={param.name} className="border-b border-stone-200 pb-1.5 last:border-0">
                                <div className="flex items-center gap-2">
                                  <code className="font-bold text-stone-900">{param.name}</code>
                                  <span className="text-[10px] text-stone-500 font-mono">({param.type})</span>
                                  {param.required && (
                                    <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1 rounded">REQUIRED</span>
                                  )}
                                </div>
                                <p className="text-stone-600 text-[11px] mt-0.5">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-50 p-4 rounded border border-stone-200 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">
                            Parameters
                          </span>
                          <span className="text-xs text-stone-500 italic">None required. Operates across global catalog.</span>
                        </div>
                      )}
                    </div>

                    {/* cURL Quick Test */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-stone-700" />
                          Terminal cURL Command
                        </span>
                        <button
                          onClick={() => handleCopy(doc.curlExample, `curl-${doc.id}`)}
                          className="text-[11px] font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `curl-${doc.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedId === `curl-${doc.id}` ? 'Copied' : 'Copy cURL'}
                        </button>
                      </div>
                      <div className="p-3 bg-stone-900 text-stone-100 rounded font-mono text-xs overflow-x-auto">
                        <code>{doc.curlExample}</code>
                      </div>
                    </div>

                    {/* Expected Response Payload */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5 text-stone-700" />
                          Expected Live Response Structure
                        </span>
                        <button
                          onClick={() => handleCopy(doc.expectedResponse, `resp-${doc.id}`)}
                          className="text-[11px] font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `resp-${doc.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedId === `resp-${doc.id}` ? 'Copied Payload' : 'Copy Expected Payload'}
                        </button>
                      </div>
                      <pre className="p-4 bg-stone-900 text-stone-200 rounded font-mono text-xs overflow-x-auto max-h-[350px] leading-relaxed border border-stone-800">
                        {doc.expectedResponse}
                      </pre>
                    </div>

                    {/* Field Notes & Schema Breakdown */}
                    {doc.fieldNotes && doc.fieldNotes.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2">
                          Field Specification &amp; Parsing Guide
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-stone-200 divide-y divide-stone-200">
                            <thead className="bg-stone-100 text-stone-700 font-bold text-[10px] uppercase tracking-wider">
                              <tr>
                                <th className="p-2.5 font-mono">Field Key</th>
                                <th className="p-2.5">Data Type</th>
                                <th className="p-2.5">Newsroom Role &amp; Parsing Context</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 bg-white">
                              {doc.fieldNotes.map((fn) => (
                                <tr key={fn.field} className="hover:bg-stone-50">
                                  <td className="p-2.5 font-mono font-bold text-stone-900">{fn.field}</td>
                                  <td className="p-2.5 text-stone-500 font-mono text-[11px]">{fn.type}</td>
                                  <td className="p-2.5 text-stone-700">{fn.explanation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer Navigation Back to Site */}
        <div className="mt-16 pt-8 border-t-2 border-stone-900 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="font-serif italic text-stone-700">
            The Dharma Watch — Broadsheet Journal of Record. Confidential Systems Telemetry.
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-950 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-stone-800 transition-colors"
          >
            <span>Return to Front Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
};
export default SyndicationDocsPage;
