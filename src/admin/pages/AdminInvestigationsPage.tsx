import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Plus, Search, ShieldCheck, ArrowUpRight, Edit2, FileText, Database } from 'lucide-react';

export const AdminInvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestigations = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/articles?type=investigation&status=all&limit=50');
        setInvestigations(res.articles || res.data || []);
      } catch (e) {
        console.error('Failed to load investigations:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvestigations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900">
              Special Projects Desk
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Investigative Reporting & Dossiers
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Deep-dive forensic journalism, archival audits, and multi-part investigations ({investigations.length} dossiers)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/case-files"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Database className="w-4 h-4 text-gray-600" />
            <span>Case Files</span>
          </Link>
          <Link
            to="/admin/articles/new?type=investigation"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            Published Investigations
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-1">
            {investigations.filter((i) => i.status === 'published').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            In Field Verification / Review
          </span>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">
            {investigations.filter((i) => i.status === 'review').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            Average Citations / Dossier
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-600 mt-1">
            4.8
          </div>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Investigations...
          </div>
        ) : investigations.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-serif">No investigations filed yet.</p>
            <Link
              to="/admin/articles/new?type=investigation"
              className="mt-3 inline-block text-xs text-amber-700 font-bold uppercase tracking-wider hover:underline"
            >
              Start an investigative project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {investigations.map((art) => (
              <div
                key={art.id}
                className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900">
                      INVESTIGATION
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      Led by {art.author_name || 'Special Investigations Team'}
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

                  <h3 className="text-base font-serif font-bold text-gray-900 hover:text-amber-800">
                    <Link to={`/admin/articles/${art.id}/edit`}>{art.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {art.subtitle || art.excerpt}
                  </p>

                  <div className="text-[11px] font-mono text-gray-400 flex items-center gap-3 pt-1">
                    <span>Dateline: {art.location || 'Pan-India'}</span>
                    <span>•</span>
                    <span>{(art.views_count || 0).toLocaleString()} Readership</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Dossier</span>
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
