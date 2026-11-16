import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { RefreshCw, Plus, AlertCircle, ArrowUpRight, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCorrectionsPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [corrections, setCorrections] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New correction form
  const [articleId, setArticleId] = useState('');
  const [whatWasChanged, setWhatWasChanged] = useState('');
  const [reason, setReason] = useState('');

  const loadCorrections = async () => {
    setIsLoading(true);
    try {
      const [corrData, artData] = await Promise.all([
        api.get('/api/corrections'),
        api.get('/api/articles?status=published&limit=50'),
      ]);
      setCorrections(corrData || []);
      setArticles(artData.articles || []);
      if (artData.articles?.length > 0 && !articleId) {
        setArticleId(artData.articles[0].id);
      }
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCorrections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId || !whatWasChanged || !reason) {
      alert('All fields are required.');
      return;
    }

    try {
      await api.post('/api/corrections', {
        articleId,
        whatWasChanged,
        reason,
      });

      setShowModal(false);
      setWhatWasChanged('');
      setReason('');
      loadCorrections();
    } catch (err: any) {
      alert(err.message || 'Failed to issue correction');
    }
  };

  const handleDeleteCorrection = async (corrId: string) => {
    if (!window.confirm('Permanently delete this correction entry?')) return;
    try {
      await api.delete(`/api/corrections/${corrId}`);
      loadCorrections();
    } catch (err: any) {
      alert(err.message || 'Failed to delete correction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Journalistic Standards
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Corrections & Clarifications Register
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Transparent, permanent public audit log of factual revisions and errata ({corrections.length} recorded)
          </p>
        </div>

        {hasPermission(['admin', 'editor']) && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Issue Correction</span>
          </button>
        )}
      </div>

      {/* Editorial Standards Statement */}
      <div className="bg-white border border-gray-200 p-5 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
          DharmaWatch Errata Protocol
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed font-sans">
          DharmaWatch is committed to unwavering factual accuracy. When an error of fact or substantial omission occurs, an entry is formally added to this public ledger and a timestamped notice is appended to the original report. Silent corrections or unannounced post-publication edits are strictly prohibited.
        </p>
      </div>

      {/* Corrections List */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Corrections Register...
          </div>
        ) : corrections.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-serif">No corrections issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {corrections.map((item) => (
              <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800">
                      CORRECTION ISSUED
                    </span>
                    <span className="text-gray-500">
                      {new Date(item.correctionDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.articleSlug && (
                      <Link
                        to={`/article/${item.articleSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-dw-red hover:underline inline-flex items-center gap-1 font-bold text-xs"
                      >
                        <span>View Story</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {hasPermission(['admin']) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCorrection(item.id)}
                        className="text-gray-400 hover:text-dw-red p-1"
                        title="Delete correction entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-gray-900">
                  {item.articleTitle}
                </h3>

                <div className="bg-gray-50 p-3 border border-gray-200 text-xs space-y-1.5 font-sans">
                  <div>
                    <strong className="text-gray-900 uppercase font-mono text-[10px] block">
                      Factual Revision:
                    </strong>
                    <span className="text-gray-800">{item.whatWasChanged}</span>
                  </div>
                  <div>
                    <strong className="text-gray-900 uppercase font-mono text-[10px] block">
                      Editorial Reason:
                    </strong>
                    <span className="text-gray-600">{item.reasonForCorrection}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Issue Correction */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white max-w-lg w-full p-6 space-y-4 border border-gray-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif">
                Issue Formal Editorial Correction
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Referenced Published Article *
                </label>
                <select
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none"
                >
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.category_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  What Was Changed (Revision Statement) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={whatWasChanged}
                  onChange={(e) => setWhatWasChanged(e.target.value)}
                  placeholder="e.g. An earlier version of this report incorrectly stated the suspect was detained on Friday. Police records confirm detention took place on Thursday evening."
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Reason for Correction *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Official update following receipt of certified copy of police remand application."
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-dw-red text-white hover:bg-red-700"
              >
                Publish Correction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
