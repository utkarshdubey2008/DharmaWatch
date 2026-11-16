import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

export const analyticsRouter = Router();

// POST /api/analytics/track - Real pageview event recorder
analyticsRouter.post('/track', (req, res) => {
  const { articleId, category, path: pagePath, referrer, deviceType } = req.body;
  const now = new Date().toISOString();
  const eventId = `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  db.prepare(`
    INSERT INTO analytics_events (id, event_type, article_id, category, path, referrer, user_agent, device_type, country, created_at)
    VALUES (?, 'page_view', ?, ?, ?, ?, ?, ?, 'India', ?)
  `).run(
    eventId,
    articleId || null,
    category || null,
    pagePath || '/',
    referrer || 'Direct',
    req.headers['user-agent'] || '',
    deviceType || 'Desktop',
    now
  );

  if (articleId) {
    db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE id = ?').run(articleId);
  }

  res.json({ ok: true });
});

// GET /api/analytics/dashboard - Comprehensive REAL newsroom analytics
analyticsRouter.get('/dashboard', authenticateToken, requireRole(['admin', 'editor', 'reporter']), (req, res) => {
  const { period = '30d', range } = req.query;
  const activeRange = (range || period) as string;

  // 1. Real Article Status Counts from DB
  const statusCounts = db.prepare(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status IN ('published', 'updated', 'correction') THEN 1 ELSE 0 END), 0) as published,
      COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draft,
      COALESCE(SUM(CASE WHEN status IN ('in_review', 'review') THEN 1 ELSE 0 END), 0) as in_review,
      COALESCE(SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END), 0) as scheduled,
      COALESCE(SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END), 0) as archived,
      COALESCE(SUM(views_count), 0) as total_views
    FROM articles
  `).get() as any;

  // 2. Real Subscribers Count from DB
  const subscribersCount = (db.prepare(`
    SELECT COUNT(*) as c FROM subscribers WHERE status = 'active'
  `).get() as { c: number }).c;

  // 3. Real Today Stats from DB
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayPublished = (db.prepare(`
    SELECT COUNT(*) as c FROM articles WHERE published_at LIKE ? AND status IN ('published', 'updated', 'correction')
  `).get(`${todayDate}%`) as { c: number }).c;

  const todayViews = (db.prepare(`
    SELECT COUNT(*) as c FROM analytics_events WHERE created_at LIKE ?
  `).get(`${todayDate}%`) as { c: number }).c;

  const uniqueVisitorsToday = (db.prepare(`
    SELECT COUNT(DISTINCT user_agent) as c FROM analytics_events WHERE created_at LIKE ?
  `).get(`${todayDate}%`) as { c: number }).c;

  // 4. Real Views Over Time Chart from DB
  const days = activeRange === 'today' ? 1 : activeRange === '7d' ? 7 : activeRange === '90d' ? 90 : 30;
  const viewsChart: { label: string; date: string; views: number; visitors: number }[] = [];

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateIso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const row = db.prepare(`
      SELECT COUNT(*) as views, COUNT(DISTINCT user_agent) as visitors
      FROM analytics_events
      WHERE created_at LIKE ?
    `).get(`${dateIso}%`) as { views: number; visitors: number };

    viewsChart.push({
      label,
      date: dateIso,
      views: row.views || 0,
      visitors: row.visitors || 0,
    });
  }

  // 5. Real Weekly Output from DB
  const publishedChart: { label: string; count: number }[] = [];
  for (let w = 4; w >= 0; w--) {
    const start = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000).toISOString();
    const count = (db.prepare(`
      SELECT COUNT(*) as c FROM articles WHERE status IN ('published', 'updated', 'correction') AND published_at >= ? AND published_at < ?
    `).get(start, end) as { c: number }).c;
    const label = w === 0 ? 'This Week' : w === 1 ? 'Last Week' : `${w} Wks Ago`;
    publishedChart.push({ label, count });
  }

  // 6. Real Category Performance from DB
  const categoryStats = db.prepare(`
    SELECT category as name, category_slug as slug, COUNT(*) as count, COALESCE(SUM(views_count), 0) as views
    FROM articles
    WHERE status IN ('published', 'updated', 'correction')
    GROUP BY category, category_slug
    ORDER BY views DESC, count DESC
  `).all() as any[];

  // 7. Real Top Articles by Views from DB
  const topArticles = db.prepare(`
    SELECT id, title, slug, category, views_count as views, published_at
    FROM articles
    WHERE status IN ('published', 'updated', 'correction')
    ORDER BY views_count DESC, published_at DESC
    LIMIT 10
  `).all() as any[];

  // 8. Real Traffic Sources from DB
  const totalEvents = (db.prepare('SELECT COUNT(*) as c FROM analytics_events').get() as { c: number }).c;
  const sourceRows = db.prepare(`
    SELECT
      CASE
        WHEN referrer IS NULL OR referrer = '' OR referrer = 'Direct' THEN 'Direct'
        WHEN referrer LIKE '%google%' OR referrer LIKE '%duckduckgo%' OR referrer LIKE '%bing%' THEN 'Search'
        WHEN referrer LIKE '%twitter%' OR referrer LIKE '%t.co%' OR referrer LIKE '%x.com%' OR referrer LIKE '%facebook%' THEN 'Social'
        ELSE 'Referral'
      END as source,
      COUNT(*) as count
    FROM analytics_events
    GROUP BY source
  `).all() as { source: string; count: number }[];

  const trafficSources = sourceRows.length > 0
    ? sourceRows.map((r) => ({
        source: r.source,
        count: r.count,
        percentage: totalEvents > 0 ? Math.round((r.count / totalEvents) * 100) : 0,
      }))
    : [{ source: 'Direct', count: totalEvents, percentage: 100 }];

  // 9. Real Device Breakdown from DB
  const deviceRows = db.prepare(`
    SELECT COALESCE(device_type, 'Desktop') as device, COUNT(*) as count
    FROM analytics_events
    GROUP BY device
  `).all() as { device: string; count: number }[];

  const deviceBreakdown = deviceRows.length > 0
    ? deviceRows.map((r) => ({
        device: r.device,
        percentage: totalEvents > 0 ? Math.round((r.count / totalEvents) * 100) : 0,
      }))
    : [{ device: 'Desktop', percentage: 100 }];

  // 10. Real Average Reading Time
  const articlesList = db.prepare("SELECT read_time_minutes FROM articles WHERE status IN ('published', 'updated', 'correction')").all() as any[];
  const avgMinutes = articlesList.length > 0
    ? Math.round(articlesList.reduce((acc, a) => acc + (a.read_time_minutes || 4), 0) / articlesList.length)
    : 4;

  const totalViewsNumber = Number(statusCounts.total_views) || 0;

  res.json({
    counts: {
      published: statusCounts.published || 0,
      drafts: statusCounts.draft || 0,
      review: statusCounts.in_review || 0,
      scheduled: statusCounts.scheduled || 0,
      archived: statusCounts.archived || 0,
      total: statusCounts.total || 0,
    },
    subscribersCount,
    traffic: {
      totalViews: totalViewsNumber,
      viewsTrend: viewsChart,
      categoryBreakdown: categoryStats,
      sourcesBreakdown: trafficSources,
    },
    summary: {
      totalArticles: statusCounts.total || 0,
      publishedArticles: statusCounts.published || 0,
      draftArticles: statusCounts.draft || 0,
      inReviewArticles: statusCounts.in_review || 0,
      scheduledArticles: statusCounts.scheduled || 0,
      archivedArticles: statusCounts.archived || 0,
      viewsToday: todayViews,
      viewsWeek: totalViewsNumber,
      viewsMonth: totalViewsNumber,
      uniqueVisitors: uniqueVisitorsToday,
      averageReadingTime: `${avgMinutes}m 00s`,
      todayPublished,
    },
    charts: {
      viewsOverTime: viewsChart,
      publishedPerWeek: publishedChart,
      categoryPerformance: categoryStats.map((c) => ({
        category: c.name,
        slug: c.slug,
        articles: c.count,
        views: c.views,
      })),
      topArticles: topArticles.map((a, idx) => ({
        rank: idx + 1,
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        views: a.views,
        publishedAt: a.published_at,
      })),
      trafficSources,
      deviceBreakdown,
    },
    topArticles,
  });
});
