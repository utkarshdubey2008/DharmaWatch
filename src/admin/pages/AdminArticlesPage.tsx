import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Zap,
  CheckCircle2,
  Clock,
  Archive,
  ArrowUpRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminArticlesPage: React.FC = () => {
  const { user, hasPermission } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 15;

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (searchQuery) params.set('q', searchQuery);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await api.get(`/api/articles?${params.toString()}`);
      setArticles(res.articles || res.data || []);
      setTotal(res.total || 0);

      // Load categories if not loaded yet
      if (categories.length === 0) {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.categories || []);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [statusFilter, categoryFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles();
  };

  const handleToggleBreaking = async (articleId: string, currentVal: boolean) => {
    try {
      await api.put(`/api/articles/${articleId}`, {
        is_breaking: !currentVal,
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, is_breaking: !currentVal } : a))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update breaking status');
    }
  };

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/articles/${articleId}`);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <h1 className="text-xl font-serif font-bold text-gray-900">Articles Desk</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Manage, review, publish and archive DharmaWatch journalism ({total} records)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-gray-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search headline, summary or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="all">Status: All</option>
            <option value="published">Status: Published</option>
            <option value="review">Status: In Review</option>
            <option value="draft">Status: Draft</option>
            <option value="archived">Status: Archived</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="all">Type: All Desks</option>
            <option value="news">News</option>
            <option value="breaking">Breaking</option>
            <option value="opinion">Opinion</option>
            <option value="investigation">Investigation</option>
            <option value="analysis">Analysis</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-serif">No articles found matching filters.</p>
            <Link
              to="/admin/articles/new"
              className="mt-3 inline-block text-xs text-dw-red font-bold uppercase tracking-wider hover:underline"
            >
              Draft a new article now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 font-mono uppercase text-[10px] text-gray-500 bg-gray-50">
                  <th className="py-2.5 px-4">Headline & Lead</th>
                  <th className="py-2.5 px-3">Desk / Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Breaking?</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-serif font-bold text-gray-900 text-sm hover:text-dw-red">
                        <Link to={`/admin/articles/${art.id}/edit`}>{art.title}</Link>
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {art.subtitle || art.excerpt}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-2">
                        <span className="font-semibold text-gray-600">
                          {art.category_name || 'General'}
                        </span>
                        <span>•</span>
                        <span>
                          {art.published_at
                            ? `Published ${new Date(art.published_at).toLocaleDateString()}`
                            : `Created ${new Date(art.created_at).toLocaleDateString()}`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          art.article_type === 'opinion'
                            ? 'bg-purple-100 text-purple-800'
                            : art.article_type === 'investigation'
                            ? 'bg-amber-100 text-amber-900'
                            : art.article_type === 'breaking'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {art.article_type || 'news'}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          art.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : art.status === 'review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : art.status === 'archived'
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                      {art.author_name || 'Staff'}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleBreaking(art.id, Boolean(art.is_breaking))}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs transition-colors flex items-center gap-1 ${
                          art.is_breaking
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Toggle breaking news ticker"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>{art.is_breaking ? 'ACTIVE' : 'Off'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-gray-700 whitespace-nowrap">
                      {(art.views_count || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {art.status === 'published' && (
                          <Link
                            to={`/article/${art.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-dw-red hover:bg-gray-100 transition-colors"
                            title="View Public Page"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          to={`/admin/articles/${art.id}/edit`}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {hasPermission(['admin', 'editor']) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            className="p-1.5 text-gray-400 hover:text-dw-red hover:bg-red-50 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">
              Page {page} of {totalPages} ({total} articles)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
