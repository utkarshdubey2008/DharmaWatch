import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { History, Shield, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      params.set('limit', '50');

      const res = await api.get(`/api/audit-log?${params.toString()}`);
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAudit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Institutional Governance
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Newsroom Audit & Verification Trail
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Cryptographically timestamped, append-only ledger tracking all editorial operations ({total} records)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, action, target title or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="ALL">All Actions</option>
            <option value="ARTICLE_PUBLISHED">ARTICLE_PUBLISHED</option>
            <option value="ARTICLE_UPDATED">ARTICLE_UPDATED</option>
            <option value="ARTICLE_CREATED">ARTICLE_CREATED</option>
            <option value="ARTICLE_DELETED">ARTICLE_DELETED</option>
            <option value="HOMEPAGE_UPDATED">HOMEPAGE_UPDATED</option>
            <option value="CORRECTION_ISSUED">CORRECTION_ISSUED</option>
            <option value="MEDIA_UPLOADED">MEDIA_UPLOADED</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Audit Trail...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-serif">No audit entries found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 uppercase text-[10px] text-gray-500 bg-gray-50">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-3">Personnel</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Title / ID</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{log.user_name || 'System'}</span>
                      {log.user_id && (
                        <div className="text-[10px] text-gray-400">{log.user_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          log.action?.includes('PUBLISHED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action?.includes('DELETED')
                            ? 'bg-red-100 text-red-800'
                            : log.action?.includes('CORRECTION')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-gray-800 font-serif">
                      {log.target_title || log.target_id || '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-sans text-xs">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
