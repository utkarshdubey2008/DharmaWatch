import { Article, Author, CaseFile, Category, PublicCorrectionItem, ResearchDataset } from '../types';
import { CATEGORIES } from '../data/categories';
import { ARTICLES } from '../data/articles';

export interface ArticleQueryParams {
  category?: string;
  tag?: string;
  authorSlug?: string;
  isInvestigation?: boolean;
  isLead?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  year?: string;
  country?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function formatRowToArticle(r: any): Article {
  const contentArray = Array.isArray(r.content)
    ? r.content
    : typeof r.content === 'string'
    ? (r.content.startsWith('[') ? (() => { try { return JSON.parse(r.content); } catch { return [r.content]; } })() : r.content.split('\n\n').filter(Boolean))
    : [];

  const tagsArray = Array.isArray(r.tags)
    ? r.tags
    : typeof r.tags === 'string'
    ? (() => { try { return JSON.parse(r.tags); } catch { return []; } })()
    : [];

  let locationObj = { country: 'India' };
  if (r.location) {
    if (typeof r.location === 'string') {
      try {
        locationObj = JSON.parse(r.location);
      } catch {
        locationObj = { country: r.location };
      }
    } else if (typeof r.location === 'object' && r.location !== null) {
      locationObj = r.location;
    }
  }

  const rawAuthor = r.author || {};
  const authorObj: Author = {
    id: 'dharma-watch-staff',
    name: 'Dharma Watch Staff',
    slug: 'dharma-watch-staff',
    role: 'Editorial & Ground Investigation Desk',
    bio: 'Primary legal filings, forensic digital analysis, certified police records, and verified ground reporting by the Dharma Watch editorial and investigative desk.',
    avatar: '',
    areasOfCoverage: ['Civil Rights', 'Legal & Judicial Filings', 'Field Investigations', 'Temple Heritage', 'Law Enforcement Tracking'],
  };

  const rawDate = r.publishedAt || r.published_at || r.createdAt || r.created_at;
  const validPublishedDate = rawDate && !isNaN(new Date(rawDate).getTime())
    ? new Date(rawDate).toISOString()
    : new Date().toISOString();

  const rawUpdated = r.updatedAt || r.updated_at;
  const validUpdatedDate = rawUpdated && !isNaN(new Date(rawUpdated).getTime())
    ? new Date(rawUpdated).toISOString()
    : undefined;

  let evidenceSummary = r.evidenceSummary;
  if (!evidenceSummary && r.evidence_summary) {
    try {
      evidenceSummary = typeof r.evidence_summary === 'string' ? JSON.parse(r.evidence_summary) : r.evidence_summary;
    } catch {}
  }

  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    deck: r.deck || r.subtitle || r.excerpt || '',
    category: r.category || r.category_name || 'Persecution',
    categorySlug: r.categorySlug || r.category_slug || 'persecution',
    author: authorObj,
    publishedAt: validPublishedDate,
    updatedAt: validUpdatedDate,
    excerpt: r.excerpt || r.subtitle || r.title,
    heroImage: r.heroImage || r.featured_image || r.hero_image || '',
    imageCaption: r.imageCaption || r.image_caption || '',
    content: contentArray,
    tags: tagsArray,
    sources: Array.isArray(r.sources)
      ? r.sources.map((s: any) => ({
          id: s.id || `src-${Math.random()}`,
          title: s.title,
          publisher: s.publisher || 'Official Record',
          sourceType: (s.sourceType || s.source_type || 'Police statement') as any,
          publicationDate: s.publicationDate || s.published_date || '2026-09-20',
          url: s.url,
          classification: (s.classification === 'primary' || s.classification === 'Primary' ? 'Primary' : 'Secondary') as any,
          documentNumber: s.documentNumber || s.document_number,
          notes: s.notes || '',
        }))
      : [],
    status: (r.status === 'published' || r.status === 'Published' ? 'Published' : 'Investigating') as any,
    location: locationObj,
    evidenceSummary,
    isInvestigation: Boolean(r.isInvestigation ?? r.is_investigation ?? r.article_type === 'investigation'),
    isLead: Boolean(r.isLead ?? r.is_lead),
    isBreaking: Boolean(r.isBreaking ?? r.is_breaking),
    isOpinion: Boolean(r.isOpinion ?? r.is_opinion ?? r.article_type === 'opinion'),
    isFactCheck: Boolean(r.isFactCheck ?? r.is_fact_check),
    readTimeMinutes: r.readTimeMinutes || r.read_time_minutes || Math.max(1, Math.ceil(contentArray.join(' ').split(/\s+/).length / 200)),
  };
}

class ContentService {
  // Articles
  async getArticles(params: ArticleQueryParams = {}): Promise<PaginatedResult<Article>> {
    try {
      const q = new URLSearchParams();
      if (params.category && params.category !== 'all' && params.category !== 'latest') {
        q.set('category', params.category);
      }
      if (params.limit) q.set('limit', String(params.limit));
      if (params.offset) q.set('page', String(Math.floor(params.offset / (params.limit || 20)) + 1));
      if (params.search) q.set('q', params.search);
      if (params.isInvestigation !== undefined) q.set('type', params.isInvestigation ? 'investigation' : 'news');
      q.set('status', 'published');

      const res = await fetch(`/api/articles?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const articlesList = Array.isArray(json.articles) ? json.articles : (Array.isArray(json.data) ? json.data : []);
        if (articlesList.length > 0) {
          const formatted = articlesList.map(formatRowToArticle);

          return {
            data: formatted,
            total: json.total ?? formatted.length,
            page: json.page || 1,
            pageSize: params.limit || 20,
            totalPages: json.totalPages || 1,
          };
        }
      }
    } catch (err) {
      console.error('[contentService.getArticles Error]:', err);
    }

    // High reliability fallback: filter ARTICLES dataset
    let fallback = [...ARTICLES];
    if (params.category && params.category !== 'all' && params.category !== 'latest') {
      const cat = params.category.toLowerCase();
      if (cat === 'national' || cat === 'india') {
        fallback = fallback.filter((a) => ['national', 'india'].includes((a.categorySlug || '').toLowerCase()));
      } else if (cat === 'opinions') {
        fallback = fallback.filter((a) => a.categorySlug === 'opinions' || a.isOpinion);
      } else if (cat === 'investigations') {
        fallback = fallback.filter((a) => a.categorySlug === 'investigations' || a.isInvestigation);
      } else if (cat === 'fact-check') {
        fallback = fallback.filter((a) => a.categorySlug === 'fact-check' || a.isFactCheck);
      } else {
        fallback = fallback.filter((a) => (a.categorySlug || '').toLowerCase() === cat || (a.category || '').toLowerCase() === cat);
      }
    }
    if (params.isInvestigation !== undefined) {
      fallback = fallback.filter((a) => Boolean(a.isInvestigation) === params.isInvestigation);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      fallback = fallback.filter((a) => a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s));
    }
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const pageData = fallback.slice(offset, offset + limit);

    return {
      data: pageData,
      total: fallback.length,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      totalPages: Math.max(1, Math.ceil(fallback.length / limit)),
    };
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const SLUG_ALIASES: Record<string, string> = {
      'ratlam-16-year-old-hindu-girl-abducted-rescued-dhodhar-station': '16-year-old-hindu-girl-abducted-by-3-muslim-men-rescued-by-bajrang-dal',
      'hyderabad-dilsukhnagar-santoshi-mata-temple-desecration-mohammed-ansari-arrested': 'a-muslim-man-tried-to-vandalise-idol-of-deity-with-sticks-in-hyderabad',
      'maihar-mp-tribal-man-murdered-dumped-well-three-arrested-community-fear': 'muslims-chopped-my-son-like-a-vegetable-maihar-murder-dumped-in-well',
      'temple-premises-alms-recipient-makeshift-mazar-encroachment-foiled': 'sufi-shia-muslim-trying-to-turn-hindu-temple-into-islamic-mazar',
      'selective-secularism-religious-attire-uniform-dress-code-debate': 'gmc-doda-burqa-controversy-clinical-safety-vs-religious-demands',
    };
    const resolvedSlug = SLUG_ALIASES[slug] || slug;

    try {
      const res = await fetch(`/api/articles/slug/${encodeURIComponent(resolvedSlug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.id) {
          // Track page view event in real analytics
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: json.id,
              category: json.category_slug,
              path: `/article/${resolvedSlug}`,
              referrer: document.referrer || 'Direct',
              deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
            }),
          }).catch(() => {});

          return formatRowToArticle(json);
        }
      }
    } catch (err) {
      console.error('[contentService.getArticleBySlug Error]:', err);
    }

    // Fallback to static articles
    const fallbackArticle = ARTICLES.find((a) => a.slug === resolvedSlug || a.slug === slug);
    return fallbackArticle || null;
  }

  async getLeadStory(): Promise<Article | null> {
    try {
      // 1. Direct lead endpoint
      const leadRes = await fetch('/api/homepage/lead');
      if (leadRes.ok) {
        const json = await leadRes.json();
        if (json && json.id) {
          return formatRowToArticle(json);
        }
      }

      // 2. Try curated homepage slot
      const hpRes = await fetch('/api/homepage');
      if (hpRes.ok) {
        const hpJson = await hpRes.json();
        const leadItem = hpJson.slots?.lead_story?.item;
        if (leadItem?.slug) {
          const article = await this.getArticleBySlug(leadItem.slug);
          if (article) return article;
        }
      }

      // 3. Fallback to newest published article marked is_lead or simply newest
      const artRes = await fetch('/api/articles?status=published&limit=1');
      if (artRes.ok) {
        const artJson = await artRes.json();
        const list = Array.isArray(artJson.articles) ? artJson.articles : (Array.isArray(artJson.data) ? artJson.data : []);
        if (list.length > 0) {
          return formatRowToArticle(list[0]);
        }
      }
    } catch (err) {
      console.error('[contentService.getLeadStory Error]:', err);
    }

    return ARTICLES.find((a) => a.isLead) || ARTICLES[0] || null;
  }

  async getHomepageSlots(): Promise<Record<string, any>> {
    try {
      const res = await fetch('/api/homepage');
      if (res.ok) {
        const json = await res.json();
        return json.slots || {};
      }
    } catch (err) {
      console.error('[contentService.getHomepageSlots Error]:', err);
    }
    return {};
  }

  async getSettings(): Promise<Record<string, string>> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('[contentService.getSettings Error]:', err);
    }
    return {};
  }

  async getLatestArticles(limit: number = 6): Promise<Article[]> {
    try {
      const res = await fetch(`/api/articles?status=published&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.articles) ? json.articles : (Array.isArray(json.data) ? json.data : []);
        return list.map(formatRowToArticle);
      }
    } catch (err) {
      console.error('[contentService.getLatestArticles Error]:', err);
    }
    return [];
  }

  async getInvestigations(limit: number = 6): Promise<Article[]> {
    try {
      const res = await fetch(`/api/articles?type=investigation&status=published&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.articles)) {
          return json.articles.map(formatRowToArticle);
        }
      }
    } catch (err) {
      console.error('[contentService.getInvestigations Error]:', err);
    }
    return [];
  }

  async getRelatedArticles(articleId: string, limit: number = 3): Promise<Article[]> {
    try {
      const res = await fetch(`/api/articles?status=published&limit=${limit + 1}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.articles)) {
          return json.articles
            .filter((a: any) => a.id !== articleId)
            .slice(0, limit)
            .map(formatRowToArticle);
        }
      }
    } catch (err) {
      console.error('[contentService.getRelatedArticles Error]:', err);
    }
    return [];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.categories)) {
          return json.categories;
        }
      }
    } catch {}
    return CATEGORIES;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  // Case Files
  async getCaseFiles(statusFilter?: string): Promise<CaseFile[]> {
    try {
      const q = statusFilter && statusFilter !== 'All' ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const res = await fetch(`/api/case-files${q}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          return json.map((c: any) => ({
            id: c.id,
            title: c.title,
            date: c.createdAt?.slice(0, 10) || '2026-01-01',
            status: c.status || 'Under Investigation',
            category: c.category || 'Violence',
            incidentType: c.incidentType || 'General Case',
            location: c.location || { country: 'India' },
            summary: c.summary || '',
            whatIsConfirmed: c.whatIsConfirmed || [],
            whatIsAlleged: c.whatIsAlleged || [],
            unverifiedClaims: c.unverifiedClaims || [],
            primaryDocuments: c.primaryDocuments || [],
            officialStatements: c.officialStatements || [],
            courtDevelopments: c.courtDevelopments || [],
            relatedArticleIds: c.relatedArticleIds || [],
            updates: c.updates || [],
            sources: c.sources || [],
            timeline: c.timeline || [],
            lastUpdated: c.lastUpdated || c.createdAt?.slice(0, 10) || '2026-01-01',
          })) as CaseFile[];
        }
      }
    } catch (err) {
      console.error('[contentService.getCaseFiles Error]:', err);
    }
    return [];
  }

  async getCaseFileById(id: string): Promise<CaseFile | null> {
    try {
      const res = await fetch(`/api/case-files/${encodeURIComponent(id)}`);
      if (res.ok) {
        const c = await res.json();
        if (c && c.id) {
          return {
            id: c.id,
            title: c.title,
            date: c.createdAt?.slice(0, 10) || '2026-01-01',
            status: c.status || 'Under Investigation',
            category: c.category || 'Violence',
            incidentType: c.incidentType || 'General Case',
            location: c.location || { country: 'India' },
            summary: c.summary || '',
            whatIsConfirmed: c.whatIsConfirmed || [],
            whatIsAlleged: c.whatIsAlleged || [],
            unverifiedClaims: c.unverifiedClaims || [],
            primaryDocuments: c.primaryDocuments || [],
            officialStatements: c.officialStatements || [],
            courtDevelopments: c.courtDevelopments || [],
            relatedArticleIds: c.relatedArticleIds || [],
            updates: c.updates || [],
            sources: c.sources || [],
            timeline: c.timeline || [],
            lastUpdated: c.lastUpdated || c.createdAt?.slice(0, 10) || '2026-01-01',
          } as CaseFile;
        }
      }
    } catch (err) {
      console.error('[contentService.getCaseFileById Error]:', err);
    }
    return null;
  }

  // Authors
  async getAuthors(): Promise<Author[]> {
    try {
      const res = await fetch('/api/authors');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
      }
    } catch {}
    return [];
  }

  async getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
      const res = await fetch(`/api/authors/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.id) return json;
      }
    } catch {}
    return null;
  }

  // Corrections
  async getPublicCorrections(): Promise<PublicCorrectionItem[]> {
    try {
      const res = await fetch('/api/corrections');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
      }
    } catch {}
    return [];
  }

  // Research Datasets
  async getResearchDatasets(): Promise<ResearchDataset[]> {
    return [];
  }

  // Global Unified Search
  async globalSearch(query: string): Promise<{
    articles: Article[];
    caseFiles: CaseFile[];
    authors: Author[];
    totalResults: number;
  }> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { articles: [], caseFiles: [], authors: [], totalResults: 0 };
    }

    try {
      const [artRes, cfRes, auRes] = await Promise.all([
        fetch(`/api/articles?q=${encodeURIComponent(q)}&status=published`).then((r) => r.ok ? r.json() : { articles: [] }),
        fetch(`/api/case-files?search=${encodeURIComponent(q)}`).then((r) => r.ok ? r.json() : []),
        fetch(`/api/authors`).then((r) => r.ok ? r.json() : []),
      ]);

      const articles = (artRes.articles || []).map(formatRowToArticle);
      const caseFiles = Array.isArray(cfRes) ? cfRes : [];
      const authors = (Array.isArray(auRes) ? auRes : []).filter(
        (a: any) =>
          a.name?.toLowerCase().includes(q) ||
          a.role?.toLowerCase().includes(q) ||
          a.bio?.toLowerCase().includes(q)
      );

      return {
        articles,
        caseFiles,
        authors,
        totalResults: articles.length + caseFiles.length + authors.length,
      };
    } catch (err) {
      console.error('[contentService.globalSearch Error]:', err);
      return { articles: [], caseFiles: [], authors: [], totalResults: 0 };
    }
  }
}

export const contentService = new ContentService();
