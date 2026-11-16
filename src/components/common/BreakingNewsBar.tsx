import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: string;
  category: string;
  headline: string;
  path: string;
}

export const BreakingNewsBar: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/homepage').then((r) => (r.ok ? r.json() : { slots: {} })),
      fetch('/api/articles?is_breaking=true&status=published&limit=5').then((r) => (r.ok ? r.json() : { data: [] })),
    ])
      .then(([hpData, artData]) => {
        const list: NewsItem[] = [];
        const seenIds = new Set<string>();

        // 1. Curated breaking slot
        const curatedBreaking = hpData.slots?.breaking?.item;
        if (curatedBreaking && curatedBreaking.slug) {
          list.push({
            id: curatedBreaking.id,
            category: curatedBreaking.category || 'Breaking',
            headline: curatedBreaking.title,
            path: `/${curatedBreaking.categorySlug || 'news'}/${curatedBreaking.slug}`,
          });
          seenIds.add(curatedBreaking.id);
        }

        // 2. Query articles marked breaking
        const articlesList = Array.isArray(artData.data) ? artData.data : (Array.isArray(artData.articles) ? artData.articles : []);
        articlesList.forEach((a: any) => {
          if (!seenIds.has(a.id)) {
            list.push({
              id: a.id,
              category: a.category || 'Breaking',
              headline: a.title,
              path: `/${a.categorySlug || 'news'}/${a.slug}`,
            });
            seenIds.add(a.id);
          }
        });

        // Fallback default headlines if none marked
        if (list.length === 0) {
          fetch('/api/articles?limit=5')
            .then((r) => r.json())
            .then((fallbackData) => {
              const fallbackList = Array.isArray(fallbackData.data) ? fallbackData.data : [];
              setItems(
                fallbackList.map((a: any) => ({
                  id: a.id,
                  category: a.category || 'Dispatch',
                  headline: a.title,
                  path: `/${a.categorySlug || 'news'}/${a.slug}`,
                }))
              );
            })
            .catch(() => {});
        } else {
          setItems(list);
        }
      })
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 text-gray-900 border-b border-gray-200 overflow-hidden font-sans">
      <div className="flex items-center max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mint Amber Breaking Tag */}
        <div className="bg-amber-500 text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 shrink-0 z-10 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Latest Wire</span>
        </div>

        {/* Seamless Marquee Content */}
        <div className="flex-1 overflow-hidden whitespace-nowrap py-1.5 text-xs font-medium tracking-wide">
          <div className="animate-marquee hover:pause cursor-pointer text-gray-800">
            {items.map((item, idx) => (
              <React.Fragment key={`${item.id}-${idx}`}>
                <span className="mx-3 font-bold text-amber-600 uppercase text-[11px]">
                  {item.category}:
                </span>
                <Link
                  to={item.path}
                  className="hover:text-amber-600 transition-colors font-medium text-gray-900"
                >
                  {item.headline}
                </Link>
                <span className="mx-3 text-gray-300">•</span>
              </React.Fragment>
            ))}
            {/* Repeat for continuous marquee loop */}
            {items.map((item, idx) => (
              <React.Fragment key={`rep-${item.id}-${idx}`}>
                <span className="mx-3 font-bold text-amber-600 uppercase text-[11px]">
                  {item.category}:
                </span>
                <Link
                  to={item.path}
                  className="hover:text-amber-600 transition-colors font-medium text-gray-900"
                >
                  {item.headline}
                </Link>
                <span className="mx-3 text-gray-300">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
