import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Plus, Trash2, Shield, User, Lock, Mail } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New user form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'reporter' | 'contributor'>('reporter');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', {
        username,
        email,
        password,
        fullName,
        role,
      });

      setShowModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('reporter');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleActive = async (u: any) => {
    if (u.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    const newStatus = !u.is_active;
    try {
      await api.put(`/api/users/${u.id}`, { isActive: newStatus });
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, is_active: newStatus ? 1 : 0 } : item)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (u: any, newRole: string) => {
    try {
      await api.put(`/api/users/${u.id}`, { role: newRole });
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, role: newRole } : item)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleResetPassword = async (u: any) => {
    const newPassword = window.prompt(`Enter new password for ${u.full_name} (${u.username}):`);
    if (!newPassword || newPassword.trim().length < 6) {
      if (newPassword !== null) alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await api.put(`/api/users/${u.id}`, { password: newPassword });
      alert(`Password updated successfully for ${u.username}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own active account.');
      return;
    }
    if (!window.confirm(`Delete user account for "${name}"?`)) return;

    try {
      await api.delete(`/api/users/${id}`);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-dw-red text-white">
              System Administration
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Newsroom Personnel & Access Roles
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Role-based access control (RBAC): Admin, Editor, Reporter, and Contributor permissions
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Personnel</span>
        </button>
      </div>

      {/* Roles Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 p-3">
          <div className="text-[10px] font-mono font-bold uppercase text-red-700">Admin</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">Editor-in-Chief</div>
          <div className="text-[11px] text-gray-500 mt-1">Full publishing, user, and deletion rights</div>
        </div>
        <div className="bg-white border border-gray-200 p-3">
          <div className="text-[10px] font-mono font-bold uppercase text-amber-700">Editor</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">Desk Editor</div>
          <div className="text-[11px] text-gray-500 mt-1">Review, approve, and publish newsroom stories</div>
        </div>
        <div className="bg-white border border-gray-200 p-3">
          <div className="text-[10px] font-mono font-bold uppercase text-blue-700">Reporter</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">Staff Reporter</div>
          <div className="text-[11px] text-gray-500 mt-1">Draft stories, upload media, submit for review</div>
        </div>
        <div className="bg-white border border-gray-200 p-3">
          <div className="text-[10px] font-mono font-bold uppercase text-purple-700">Contributor</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">External Columnist</div>
          <div className="text-[11px] text-gray-500 mt-1">File draft commentary for editorial review</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading Newsroom Personnel...
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 font-mono uppercase text-[10px] text-gray-500 bg-gray-50">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                            {u.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{u.full_name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                      disabled={u.id === currentUser?.id}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-gray-200 bg-white focus:outline-none focus:border-dw-red cursor-pointer"
                    >
                      <option value="admin">ADMIN</option>
                      <option value="editor">EDITOR</option>
                      <option value="reporter">REPORTER</option>
                      <option value="contributor">CONTRIBUTOR</option>
                    </select>
                  </td>

                  <td className="py-3 px-3 font-mono text-gray-600 text-xs">{u.username}</td>

                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      disabled={u.id === currentUser?.id}
                      title={u.id === currentUser?.id ? 'Cannot deactivate self' : 'Click to toggle status'}
                      className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                    >
                      {u.is_active ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-700 font-bold">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="text-gray-500 font-bold">Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleResetPassword(u)}
                        className="text-gray-400 hover:text-gray-800 p-1"
                        title="Reset Password"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name)}
                          className="text-gray-400 hover:text-dw-red p-1"
                          title="Delete User"
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
        )}
      </div>

      {/* Modal: Add User */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white max-w-md w-full p-6 space-y-4 border border-gray-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif">
                Add Newsroom Personnel
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anand Ranganathan"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. aranganathan"
                  className="w-full text-xs p-2 border border-gray-300 font-mono focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@thedharmawatch.in"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Role Assignment *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none"
                >
                  <option value="reporter">Staff Reporter (Draft & File)</option>
                  <option value="contributor">Contributor (External Columnist)</option>
                  <option value="editor">Editor (Review & Publish)</option>
                  <option value="admin">Admin (Editor-in-Chief)</option>
                </select>
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
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
