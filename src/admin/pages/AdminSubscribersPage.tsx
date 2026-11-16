import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Mail, Download, Users, CheckCircle, UserX, Search } from 'lucide-react';

export const AdminSubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/subscribers?limit=100');
      setSubscribers(res.data || []);
      setTotal(res.total || 0);
      setActive(res.active || 0);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleExportCSV = () => {
    const token = localStorage.getItem('dw_admin_token');
    window.open(`/api/subscribers/export?token=${token}`, '_blank');
  };

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Audience Engagement
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            DharmaWatch Dispatch Subscribers
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Weekly briefing reader registry ({total} total, {active} active)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            Total Subscribers
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-1">{total}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            Active Readers
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-600 mt-1">{active}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">
            Unsubscribed / Bounced
          </span>
          <div className="text-2xl font-serif font-bold text-gray-400 mt-1">
            {total - active}
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriber email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            No subscribers found.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-gray-200 uppercase text-[10px] text-gray-400 bg-gray-50">
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Acquisition Source</th>
                <th className="py-2.5 px-4 text-right">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800 font-sans">{sub.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        sub.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{sub.source || 'Website'}</td>
                  <td className="py-3 px-4 text-right text-gray-400 text-[11px]">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
