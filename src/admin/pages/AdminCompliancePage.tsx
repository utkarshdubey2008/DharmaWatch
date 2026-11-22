import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FileCheck, Plus, AlertCircle, Trash2, Edit3, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCompliancePage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [monthYear, setMonthYear] = useState('');
  const [totalReceived, setTotalReceived] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [pending, setPending] = useState(0);
  const [summary, setSummary] = useState('No grievances were received during this period.');

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/compliance');
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load compliance reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    setMonthYear(`${monthName} ${year}`);
    setTotalReceived(0);
    setResolved(0);
    setPending(0);
    setSummary('No grievances were received during this period.');
    setShowModal(true);
  };

  const openEditModal = (report: any) => {
    setEditingId(report.id);
    setMonthYear(report.month_year);
    setTotalReceived(report.total_received);
    setResolved(report.resolved);
    setPending(report.pending);
    setSummary(report.summary || 'No grievances were received during this period.');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthYear.trim()) {
      alert('Month & Year are required.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/compliance/${editingId}`, {
          month_year: monthYear.trim(),
          total_received: Number(totalReceived) || 0,
          resolved: Number(resolved) || 0,
          pending: Number(pending) || 0,
          summary: summary.trim(),
        });
      } else {
        await api.post('/api/compliance', {
          month_year: monthYear.trim(),
          total_received: Number(totalReceived) || 0,
          resolved: Number(resolved) || 0,
          pending: Number(pending) || 0,
          summary: summary.trim(),
        });
      }

      setShowModal(false);
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to save compliance report.');
    }
  };

  const handleDelete = async (id: string, month: string) => {
    if (!window.confirm(`Permanently delete the compliance report for ${month}?`)) return;
    try {
      await api.delete(`/api/compliance/${id}`);
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <span>Monthly Grievance Compliance Reports</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Part III Digital Media Ethics Code (IT Rules, 2021) compliance records published on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/compliance-report"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>

          {hasPermission(['admin', 'editor']) && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Monthly Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading compliance reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 bg-white border border-zinc-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm text-zinc-600">No monthly compliance reports registered yet.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Create First Report
          </button>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 font-semibold text-center">Received</th>
                <th className="px-4 py-3 font-semibold text-center">Resolved</th>
                <th className="px-4 py-3 font-semibold text-center">Pending</th>
                <th className="px-4 py-3 font-semibold">Summary Note</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-900 font-sans">
                    {r.month_year}
                  </td>
                  <td className="px-4 py-3 font-mono text-center font-bold text-zinc-800">
                    {r.total_received}
                  </td>
                  <td className="px-4 py-3 font-mono text-center text-emerald-700 font-bold">
                    {r.resolved}
                  </td>
                  <td className="px-4 py-3 font-mono text-center text-amber-700 font-bold">
                    {r.pending}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 max-w-md truncate">
                    {r.summary}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 text-zinc-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        title="Edit Report"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {hasPermission(['admin']) && (
                        <button
                          onClick={() => handleDelete(r.id, r.month_year)}
                          className="p-1.5 text-zinc-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">
                {editingId ? 'Edit Monthly Compliance Report' : 'Add Monthly Compliance Report'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Month &amp; Year
                </label>
                <input
                  type="text"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  placeholder="e.g. November 2026"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Received
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalReceived}
                    onChange={(e) => setTotalReceived(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Resolved
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resolved}
                    onChange={(e) => setResolved(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Pending
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pending}
                    onChange={(e) => setPending(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Summary Note
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. No grievances were received during this period."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingId ? 'Update Report' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
