import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  PlusCircle,
  Zap,
  FolderArchive,
  Upload,
  BarChart2,
  Users,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAdminAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [recentAudit, setRecentAudit] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, articlesData, auditData] = await Promise.all([
        api.get(`/api/analytics/dashboard?range=${timeRange}`),
        api.get('/api/articles?limit=10'),
        api.get('/api/audit?limit=6').catch(() => ({ logs: [] })),
      ]);

      setMetrics(analyticsData);
      const loadedArticles = articlesData.articles || articlesData.data || [];
      setRecentArticles(loadedArticles);
      setPendingArticles(
        loadedArticles.filter((a: any) => (a.rawStatus || a.status)?.toLowerCase() === 'review')
      );
      setRecentAudit(auditData.logs || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const handleApprove = async (articleId: string) => {
    try {
      await api.post(`/api/articles/${articleId}/approve`);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve article');
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-dw-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">
            Loading Newsroom Overview...
          </p>
        </div>
      </div>
    );
  }

  const counts = metrics?.counts || {
    published: 0,
    drafts: 0,
    review: 0,
    archived: 0,
    total: 0,
  };

  const traffic = metrics?.traffic || {
    totalViews: 0,
    viewsTrend: [],
    categoryBreakdown: [],
    sourcesBreakdown: [],
  };

  const topArticles = metrics?.topArticles || [];

  // SVG Chart Calculation for Views
  const viewsData = traffic.viewsTrend || [];
  const maxView = Math.max(...viewsData.map((d: any) => d.views), 100);
  const chartHeight = 160;
  const chartWidth = 600;

  const points = viewsData
    .map((d: any, idx: number) => {
      const x = (idx / Math.max(viewsData.length - 1, 1)) * chartWidth;
      const y = chartHeight - (d.views / maxView) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 font-mono">
              Live Newsroom Active
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            DharmaWatch Editorial Operations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Logged in as <strong className="text-gray-800">{user?.fullName}</strong> ({user?.role?.toUpperCase()})
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/articles/new?breaking=true"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>+ Breaking News</span>
          </Link>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Article</span>
          </Link>
          <Link
            to="/admin/case-files/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-xs"
          >
            <FolderArchive className="w-3.5 h-3.5 text-gray-600" />
            <span>+ Case File</span>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-gray-900">
            {counts.published}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono">Live on site</div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>In Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-amber-600">
            {counts.review}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono">Requires sign-off</div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Drafts</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-gray-700">
            {counts.drafts}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono">Desk in-progress</div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Archived</span>
            <FolderArchive className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-gray-700">
            {counts.archived}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono">Retracted or old</div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-gray-900">
            {(traffic.totalViews ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>{metrics?.summary?.viewsToday ?? 0} views today</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Subscribers</span>
            <Users className="w-4 h-4 text-dw-red" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-gray-900">
            {(metrics?.subscribersCount ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-mono">Live registered readers</div>
        </div>
      </div>

      {/* Pending Review Section (if any) */}
      {pendingArticles.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                Editorial Review Required ({pendingArticles.length})
              </h2>
            </div>
            <span className="text-xs text-amber-800">
              Senior editor sign-off needed before publishing
            </span>
          </div>

          <div className="space-y-2">
            {pendingArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white p-3.5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800">
                      {art.article_type || 'News'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      By {art.author_name || 'Reporter'}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-gray-900 mt-1">
                    {art.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    Edit / Review
                  </Link>
                  {hasPermission(['admin', 'editor']) && (
                    <button
                      onClick={() => handleApprove(art.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve & Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Charts & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Newsroom Traffic & Readership Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-gray-900">
                Audience Engagement & Article Views
              </h2>
              <p className="text-xs text-gray-500">
                Live readership tracking across published journalism
              </p>
            </div>
            <div className="flex items-center gap-1 border border-gray-200 p-0.5 bg-gray-50 text-xs font-mono">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-1 uppercase ${
                    timeRange === r
                      ? 'bg-white font-bold text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Readership Line Graph */}
          <div className="relative pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              {/* Grid Lines */}
              <line
                x1="0"
                y1={chartHeight - 15}
                x2={chartWidth}
                y2={chartHeight - 15}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={chartHeight / 2}
                x2={chartWidth}
                y2={chartHeight / 2}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="4"
              />

              {/* Gradient Area under line */}
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b1e1b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b1e1b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {points && (
                <>
                  <polygon
                    points={`0,${chartHeight - 15} ${points} ${chartWidth},${chartHeight - 15}`}
                    fill="url(#viewGrad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#8b1e1b"
                    strokeWidth="2.5"
                    points={points}
                  />
                </>
              )}

              {/* Data points */}
              {viewsData.map((d: any, idx: number) => {
                const x = (idx / Math.max(viewsData.length - 1, 1)) * chartWidth;
                const y = chartHeight - (d.views / maxView) * (chartHeight - 30) - 15;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="3.5"
                      className="fill-dw-red stroke-white stroke-2 group-hover:r-5 transition-all"
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-axis date labels */}
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1 border-t border-gray-100 pt-1">
              <span>{viewsData[0]?.date || 'Start'}</span>
              <span>{viewsData[Math.floor(viewsData.length / 2)]?.date || 'Mid'}</span>
              <span>{viewsData[viewsData.length - 1]?.date || 'Today'}</span>
            </div>
          </div>

          {/* Category Distribution Bar */}
          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Desk Coverage Distribution
            </h3>
            <div className="space-y-2">
              {(traffic.categoryBreakdown || []).slice(0, 5).map((cat: any) => {
                const total = (traffic.categoryBreakdown || []).reduce(
                  (acc: number, c: any) => acc + c.count,
                  0
                );
                const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                return (
                  <div key={cat.name} className="text-xs">
                    <div className="flex justify-between text-gray-600 font-mono mb-1">
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                      <span>
                        {cat.count} stories ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gray-800"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Traffic Sources & Newsroom Audit */}
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="bg-white border border-gray-200 p-5">
            <h2 className="text-sm font-serif font-bold text-gray-900 border-b border-gray-100 pb-2">
              Reader Referral Sources
            </h2>
            <div className="mt-4 space-y-3">
              {(traffic.sourcesBreakdown && traffic.sourcesBreakdown.length > 0
                ? traffic.sourcesBreakdown
                : [{ source: 'Direct / Bookmarks', percentage: 100, count: 0 }]
              ).map((item: any, idx: number) => {
                const colors = ['bg-dw-red', 'bg-gray-800', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600'];
                const color = colors[idx % colors.length];
                const share = typeof item.percentage === 'number' ? item.percentage : (item.share || 0);
                return (
                  <div key={item.source} className="text-xs">
                    <div className="flex justify-between text-gray-600 font-mono mb-1">
                      <span>{item.source}</span>
                      <span className="font-bold text-gray-900">{share}% ({item.count || 0})</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100">
                      <div
                        className={`h-full ${color}`}
                        style={{ width: `${Math.max(share, item.count ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newsroom Audit Trail */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <h2 className="text-sm font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-dw-red" />
                <span>Editorial Audit Log</span>
              </h2>
              <Link
                to="/admin/audit-log"
                className="text-[11px] text-dw-red font-mono font-bold hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentAudit.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No recent log entries.</p>
              ) : (
                recentAudit.map((log: any) => (
                  <div
                    key={log.id}
                    className="text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{log.username || 'System'}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="font-bold text-gray-800 mt-0.5">
                      {log.action}
                    </div>
                    <div className="text-gray-500 truncate text-[11px]">
                      {log.details || log.entity_type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Performing Articles Table */}
      <div className="bg-white border border-gray-200 p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-gray-900">
              Top Impact Stories & Readership
            </h2>
            <p className="text-xs text-gray-500">
              Ranked by total page reads, verification score, and citations
            </p>
          </div>
          <Link
            to="/admin/articles"
            className="text-xs font-bold text-dw-red hover:underline flex items-center gap-1"
          >
            Manage All Articles <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 font-mono uppercase text-[10px] text-gray-500 bg-gray-50">
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3 text-right">Views</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentArticles.slice(0, 7).map((art) => (
                <tr key={art.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <div className="font-serif font-bold text-gray-900 text-sm hover:text-dw-red">
                      <Link to={`/admin/articles/${art.id}/edit`}>{art.title}</Link>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {art.category_name || 'General'} • Published {new Date(art.published_at || art.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-700">
                      {art.article_type || 'news'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        art.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : art.status === 'review'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-mono text-[11px]">
                    {art.author_name || 'Dharma Watch Staff'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-800">
                    {(art.views_count ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/articles/${art.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Edit
                      </Link>
                      {art.status === 'published' && (
                        <Link
                          to={`/article/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-dw-red hover:underline inline-flex items-center gap-0.5"
                          title="View Live"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
