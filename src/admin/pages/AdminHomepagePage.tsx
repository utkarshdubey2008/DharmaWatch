import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Layout,
  Save,
  CheckCircle,
  Zap,
  Star,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

interface SlotConfig {
  key: string;
  name: string;
  description: string;
  type: 'article' | 'case_file';
}

const CURATED_SLOTS: SlotConfig[] = [
  {
    key: 'lead_story',
    name: 'Main Lead Story',
    description: 'Primary visual headline with full-width image on the public homepage',
    type: 'article',
  },
  {
    key: 'breaking',
    name: 'Breaking News Ticker',
    description: 'Red urgent banner alert displayed across the top of the homepage',
    type: 'article',
  },
  {
    key: 'top_1',
    name: 'Top Story 1 (Secondary Lead)',
    description: 'First spotlight item directly under the lead story',
    type: 'article',
  },
  {
    key: 'top_2',
    name: 'Top Story 2',
    description: 'Second spotlight item in the hero grid',
    type: 'article',
  },
  {
    key: 'top_3',
    name: 'Top Story 3',
    description: 'Third spotlight item in the hero grid',
    type: 'article',
  },
  {
    key: 'featured_investigation',
    name: 'Featured Investigation Dossier',
    description: 'Pinned long-form investigative project with evidence badges',
    type: 'article',
  },
  {
    key: 'featured_opinion',
    name: 'Spotlight Opinion Column',
    description: 'Prominent intellectual commentary column on the right sidebar',
    type: 'article',
  },
];

export const AdminHomepagePage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [assignedSlots, setAssignedSlots] = useState<Record<string, any>>({});
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [activeSlotModal, setActiveSlotModal] = useState<SlotConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSlots = async () => {
    setIsLoading(true);
    try {
      const [homepageRes, articlesRes] = await Promise.all([
        api.get('/api/homepage'),
        api.get('/api/articles?status=published&limit=50'),
      ]);

      setAssignedSlots(homepageRes.slots || {});
      setPublishedArticles(articlesRes.articles || []);
    } catch (err) {
      console.error('Failed to load homepage slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleSelectArticle = (slotKey: string, article: any) => {
    setAssignedSlots((prev) => ({
      ...prev,
      [slotKey]: {
        slotName: slotKey,
        referenceId: article.id,
        referenceType: 'article',
        item: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          deck: article.subtitle || article.deck,
          category: article.category_name,
          heroImage: article.featured_image || article.hero_image,
          excerpt: article.excerpt,
          publishedAt: article.published_at,
        },
      },
    }));
    setActiveSlotModal(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const slotsPayload = Object.keys(assignedSlots).map((key) => ({
      slotName: key,
      referenceId: assignedSlots[key].referenceId,
      referenceType: assignedSlots[key].referenceType || 'article',
    }));

    try {
      await api.post('/api/homepage/slots', { slots: slotsPayload });
      alert('Homepage curated slots published successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save homepage slots');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredArticles = publishedArticles.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Editorial Curation
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Curated Homepage Layout
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Assign headline journalism and investigative dossiers to high-visibility frontpage positions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {hasPermission(['admin', 'editor']) && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-dw-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Layout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-4">
        {CURATED_SLOTS.map((slot) => {
          const assignment = assignedSlots[slot.key];
          const item = assignment?.item;

          return (
            <div
              key={slot.key}
              className="bg-white border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
            >
              <div className="space-y-1 md:w-1/3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-dw-red uppercase">
                    {slot.key}
                  </span>
                  {slot.key === 'breaking' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-mono bg-red-100 text-red-800 font-bold uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-gray-900 text-sm">{slot.name}</h3>
                <p className="text-[11px] text-gray-500">{slot.description}</p>
              </div>

              {/* Current Assigned Story */}
              <div className="flex-1 bg-gray-50 border border-gray-200 p-3">
                {item ? (
                  <div className="flex items-start gap-3">
                    {item.heroImage && (
                      <img
                        src={item.heroImage}
                        alt=""
                        className="w-16 h-12 object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono font-bold uppercase text-dw-red">
                        {item.category || 'News'}
                      </div>
                      <h4 className="font-serif font-bold text-xs text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ID: {assignment.referenceId}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">
                    No story assigned to this slot yet.
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlotModal(slot);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>{item ? 'Change Story' : 'Assign Story'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Select Article for Slot */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 space-y-4 border border-gray-200 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-dw-red font-bold">
                  Assign Slot: {activeSlotModal.key}
                </span>
                <h3 className="text-base font-serif font-bold text-gray-900">
                  Select Story for {activeSlotModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search published articles by headline or desk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
              />
            </div>

            {/* Articles List */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 pr-1">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 font-mono">
                  No published stories matching search query.
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(activeSlotModal.key, art)}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="font-bold text-dw-red uppercase">
                          {art.category_name}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{art.author_name}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-gray-900 mt-0.5">
                        {art.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {art.subtitle || art.excerpt}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-dw-red shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
