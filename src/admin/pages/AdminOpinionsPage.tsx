import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Plus, MessageSquareQuote, ShieldAlert, ArrowUpRight, Edit2, Eye } from 'lucide-react';

export const AdminOpinionsPage: React.FC = () => {
  const [opinions, setOpinions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpinions = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/articles?type=opinion&status=all&limit=50');
        setOpinions(res.articles || res.data || []);
      } catch (e) {
        console.error('Failed to load opinions:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpinions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-purple-100 text-purple-800">
              Editorial Desk
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">Opinions & Perspectives</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Documented analysis, theological commentary, legal opinion, and intellectual debate ({opinions.length} pieces)
          </p>
        </div>

        <Link
          to="/admin/articles/new?type=opinion"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Opinion Piece</span>
        </Link>
      </div>

      {/* Editorial Policy Warning */}
      <div className="bg-purple-50 border border-purple-200 p-4 text-xs text-purple-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Opinions Policy Guidelines</p>
          <p className="text-purple-800">
            All pieces published under the Opinions Desk represent the verified viewpoints of the respective authors and contributors. DharmaWatch policy mandates that opinion pieces remain strictly distinguished from factual news reporting through clear visual labelling, author bios, and factual claim verification.
          </p>
        </div>
      </div>

      {/* Opinions Grid / Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Opinion Pieces...
          </div>
        ) : opinions.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-serif">No opinion pieces published yet.</p>
            <Link
              to="/admin/articles/new?type=opinion"
              className="mt-3 inline-block text-xs text-purple-700 font-bold uppercase tracking-wider hover:underline"
            >
              Draft an opinion piece
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {opinions.map((art) => (
              <div key={art.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-purple-100 text-purple-800">
                      OPINION
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      By {art.author_name || 'Editorial Board'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        art.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-gray-900 hover:text-purple-800">
                    <Link to={`/admin/articles/${art.id}/edit`}>{art.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {art.subtitle || art.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right font-mono text-xs text-gray-500 mr-2">
                    <div className="font-bold text-gray-800">{(art.views_count || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">views</div>
                  </div>
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  {art.status === 'published' && (
                    <Link
                      to={`/article/${art.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-gray-300 hover:bg-gray-100 text-dw-red"
                      title="View Live"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
