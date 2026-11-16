import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  FolderArchive,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  FileCheck,
} from 'lucide-react';

export const AdminCaseFilesPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [caseFiles, setCaseFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadCaseFiles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'All') params.set('status', statusFilter);

      const res = await api.get(`/api/case-files?${params.toString()}`);
      setCaseFiles(res || []);
    } catch (err) {
      console.error('Failed to load case files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseFiles();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCaseFiles();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete case file "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/case-files/${id}`);
      setCaseFiles((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete case file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Archive & Evidence
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            DharmaWatch Case Files
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Persistent documentary dossiers, incident timelines, and primary source records ({caseFiles.length} dossiers)
          </p>
        </div>

        <Link
          to="/admin/case-files/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Case File</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case title, incident type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="All">Status: All</option>
            <option value="Investigating">Investigating</option>
            <option value="Verified">Verified</option>
            <option value="Legal Action">Legal Action</option>
            <option value="Archived">Archived</option>
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Case Files List */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Case Files...
          </div>
        ) : caseFiles.length === 0 ? (
          <div className="p-12 text-center">
            <FolderArchive className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-serif">No case files found matching criteria.</p>
            <Link
              to="/admin/case-files/new"
              className="mt-3 inline-block text-xs text-dw-red font-bold uppercase tracking-wider hover:underline"
            >
              Open a new case file
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {caseFiles.map((c) => (
              <div
                key={c.id}
                className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-800 border border-gray-300">
                      {c.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        c.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'Legal Action'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{c.category}</span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-gray-900 hover:text-dw-red">
                    <Link to={`/admin/case-files/${c.id}/edit`}>{c.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2">{c.summary}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {c.location?.city ? `${c.location.city}, ${c.location.state || ''}` : 'Location pending'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Updated: {c.lastUpdated || 'Recent'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-gray-400" />
                      {c.timeline?.length || 0} Timeline Events • {c.primaryDocuments?.length || 0} Documents
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/admin/case-files/${c.id}/edit`}
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Dossier</span>
                  </Link>

                  <Link
                    to={`/case/${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-gray-300 hover:bg-gray-100 text-dw-red"
                    title="View Public Dossier"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {hasPermission(['admin']) && (
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="p-2 border border-gray-300 hover:bg-red-50 text-gray-400 hover:text-dw-red"
                      title="Delete Case File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
