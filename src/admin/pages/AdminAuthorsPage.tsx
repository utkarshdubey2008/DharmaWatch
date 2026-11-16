import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Users, Plus, Edit2, Trash2, Mail, Key, BookOpen } from 'lucide-react';

export const AdminAuthorsPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Investigative Reporter');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pgpKey, setPgpKey] = useState('');
  const [areasOfCoverage, setAreasOfCoverage] = useState('');

  const loadAuthors = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/authors');
      setAuthors(data || []);
    } catch (err) {
      console.error('Failed to load authors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const openCreate = () => {
    setEditingAuthor(null);
    setName('');
    setRole('Senior Investigative Reporter');
    setEmail('');
    setBio('');
    setAvatar('');
    setPgpKey('');
    setAreasOfCoverage('');
    setShowModal(true);
  };

  const openEdit = (author: any) => {
    setEditingAuthor(author);
    setName(author.name || '');
    setRole(author.role || '');
    setEmail(author.email || '');
    setBio(author.bio || '');
    setAvatar(author.avatar || '');
    setPgpKey(author.pgpKeyFingerprint || '');
    setAreasOfCoverage(
      Array.isArray(author.areasOfCoverage) ? author.areasOfCoverage.join(', ') : ''
    );
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      role,
      email,
      bio,
      avatar,
      pgpKey,
      areasOfCoverage: areasOfCoverage
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    };

    try {
      if (editingAuthor) {
        await api.put(`/api/authors/${editingAuthor.id}`, payload);
      } else {
        await api.post('/api/authors', payload);
      }
      setShowModal(false);
      loadAuthors();
    } catch (err: any) {
      alert(err.message || 'Failed to save author');
    }
  };

  const handleDelete = async (id: string, authorName: string) => {
    if (!window.confirm(`Deactivate author "${authorName}"?`)) return;
    try {
      await api.delete(`/api/authors/${id}`);
      loadAuthors();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate author');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Newsroom Staff & Bylines
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Authors & Correspondents
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Manage bylines, investigative staff, theological analysts, and contributing writers ({authors.length} bylines)
          </p>
        </div>

        {hasPermission(['admin', 'editor']) && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dw-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Author</span>
          </button>
        )}
      </div>

      {/* Authors Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500 font-mono bg-white border border-gray-200">
          Loading Authors...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-white border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                    {author.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                        {author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">
                      {author.name}
                    </h3>
                    <div className="text-xs text-dw-red font-mono font-bold">
                      {author.role}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {author.bio || 'No biographical statement provided.'}
                </p>

                {author.areasOfCoverage && author.areasOfCoverage.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {author.areasOfCoverage.map((area: string) => (
                      <span
                        key={area}
                        className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 font-mono"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span>{author.articleCount || 0} stories</span>
                </span>

                <div className="flex items-center gap-2">
                  {hasPermission(['admin', 'editor']) && (
                    <>
                      <button
                        onClick={() => openEdit(author)}
                        className="p-1.5 text-gray-600 hover:text-gray-900"
                        title="Edit Author"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(author.id, author.name)}
                        className="p-1.5 text-gray-400 hover:text-dw-red"
                        title="Deactivate Author"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Author Editor */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white max-w-lg w-full p-6 space-y-4 border border-gray-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif">
                {editingAuthor ? 'Edit Author Profile' : 'Add New Newsroom Author'}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Sharma"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Newsroom Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Investigative Reporter"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="newsroom@thedharmawatch.in"
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Bio / Background
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief journalistic credentials, prior publications, and areas of focus..."
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2 border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Areas of Coverage (comma separated)
                </label>
                <input
                  type="text"
                  value={areasOfCoverage}
                  onChange={(e) => setAreasOfCoverage(e.target.value)}
                  placeholder="Kashmir, Legal Affairs, Temple Heritage"
                  className="w-full text-xs p-2 border border-gray-300 font-mono"
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
                Save Author
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
