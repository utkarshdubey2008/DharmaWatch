import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article } from '../types';
import { ARTICLES } from '../data/articles';
import { MediaRenderer } from '../components/common/MediaRenderer';
import { formatTimeAgo } from '../utils/dateUtils';
import {
  Bookmark,
  Share2,
  ChevronRight,
  TrendingUp,
  Check,
  ArrowUpRight,
  BookOpen,
  Filter,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await contentService.getArticles({ limit: 50 }).catch(() => null);
        const allArticles = res && res.data && res.data.length > 0 ? res.data : ARTICLES;

        const sorted = [...allArticles].sort((a, b) => {
          const timeA = new Date(a.publishedAt || 0).getTime();
          const timeB = new Date(b.publishedAt || 0).getTime();
          return timeB - timeA;
        });

        setArticles(sorted);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        const sortedFallback = [...ARTICLES].sort((a, b) => {
          const timeA = new Date(a.publishedAt || 0).getTime();
          const timeB = new Date(b.publishedAt || 0).getTime();
          return timeB - timeA;
        });
        setArticles(sortedFallback);
      }
    };

    loadData();
  }, []);

  const activeList =
    articles.length > 0
      ? articles
      : [...ARTICLES].sort((a, b) => {
          const timeA = new Date(a.publishedAt || 0).getTime();
          const timeB = new Date(b.publishedAt || 0).getTime();
          return timeB - timeA;
        });

  // Spotlight carousel items (like "FROM THE WALL STREET JOURNAL" in Mint)
  const spotlightArticles = activeList.filter(
    (a) => a.isInvestigation || a.categorySlug === 'investigations' || a.isLead
  ).slice(0, 5);

  const carouselItems = spotlightArticles.length >= 3 ? spotlightArticles : activeList.slice(0, 5);

  // Lead / Hero Article
  const leadStory = activeList.find((a) => a.isLead) || activeList[0];

  // Most Read / Trending stories for sidebar (ranked 1-5)
  const trendingStories = activeList.slice(1, 6);

  // Editorial Columns
  const opinionArticles = activeList.filter(
    (a) => a.isOpinion || a.categorySlug === 'opinions'
  ).slice(0, 3);

  // Filtered Feed items based on activeFilter
  const feedArticles = activeList.filter((a) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Economy & Markets') return a.categorySlug === 'economy';
    if (activeFilter === 'National & Policy') return a.categorySlug === 'national';
    if (activeFilter === 'World') return a.categorySlug === 'world';
    if (activeFilter === 'Investigations') return a.isInvestigation || a.categorySlug === 'investigations';
    if (activeFilter === 'Opinion') return a.isOpinion || a.categorySlug === 'opinions';
    return true;
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = (article: Article, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${article.categorySlug}/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="bg-white text-gray-900 font-sans pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* MAIN LEFT FEED COLUMN (8 COLS)                              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">
            {/* ──────────────────────────────────────────────────────────── */}
            {/* 1. LEAD TOP STORY (MINT STYLE LEAD SPLASH)                   */}
            {/* ──────────────────────────────────────────────────────────── */}
            {leadStory && (
              <div className="border-b border-gray-200 pb-6 group">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 font-bold uppercase tracking-wider text-[10px]">
                        {leadStory.category}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 font-normal">
                        {leadStory.readTimeMinutes || 5} min read • {formatTimeAgo(leadStory.publishedAt)}
                      </span>
                    </div>

                    <Link to={`/${leadStory.categorySlug}/${leadStory.slug}`}>
                      <h1 className="font-sans font-bold text-xl sm:text-2xl md:text-3xl text-gray-950 group-hover:text-amber-600 transition-colors leading-tight">
                        {leadStory.title}
                      </h1>
                    </Link>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {leadStory.deck || leadStory.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                      <span>By <strong className="text-gray-900 font-semibold">{leadStory.author?.name || 'The Dharma Watch'}</strong></span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleBookmark(leadStory.id, e)}
                          className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                          title="Bookmark story"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              savedIds.has(leadStory.id) ? 'fill-amber-600 text-amber-600' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => handleShare(leadStory, e)}
                          className="p-1 text-gray-500 hover:text-amber-600 transition-colors relative"
                          title="Share story"
                        >
                          {copiedId === leadStory.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lead Image */}
                  {leadStory.heroImage && (
                    <div className="relative shrink-0 w-full sm:w-64 md:w-72 aspect-[16/10] sm:aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <Link to={`/${leadStory.categorySlug}/${leadStory.slug}`}>
                        <MediaRenderer
                          url={leadStory.heroImage}
                          alt={leadStory.title}
                          isThumbnail={true}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* 2. "FROM THE WALL STREET JOURNAL" STYLE CAROUSEL             */}
            {/* (EXACT MINT FEATURED SPOTLIGHT SLIDER)                       */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="py-2 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="font-sans font-extrabold text-sm sm:text-base tracking-wide text-gray-950 uppercase">
                  From DharmaWatch Investigations
                </h2>
                <Link
                  to="/investigations"
                  className="text-amber-600 hover:text-amber-700 text-xs sm:text-sm font-bold flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Horizontal Scroll Cards (Mint Style) */}
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {carouselItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-64 sm:w-72 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Image */}
                      <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                        {item.heroImage && (
                          <MediaRenderer
                            url={item.heroImage}
                            alt={item.title}
                            isThumbnail={true}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-3.5 space-y-1.5">
                        <span className="text-[10px] font-serif font-black tracking-wider text-gray-500 uppercase block">
                          THE DHARMA WATCH.
                        </span>
                        <Link to={`/${item.categorySlug}/${item.slug}`}>
                          <h3 className="font-sans font-bold text-sm text-gray-950 leading-snug line-clamp-3 group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 text-[11px] text-gray-400">
                      {formatTimeAgo(item.publishedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* 3. MINT NEWS FEED (VERTICAL LIST WITH RIGHT THUMBNAILS)      */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="space-y-1">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 mb-2">
                {[
                  'All',
                  'Economy & Markets',
                  'National & Policy',
                  'World',
                  'Investigations',
                  'Opinion',
                ].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      activeFilter === filter
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Feed Items (Exact Mint Layout) */}
              <div className="divide-y divide-gray-100">
                {feedArticles.map((article) => {
                  const isSaved = savedIds.has(article.id);
                  const isCopied = copiedId === article.id;

                  return (
                    <article
                      key={article.id}
                      className="py-4.5 flex items-start justify-between gap-4 group"
                    >
                      {/* Left: Text, Metadata, & Action Icons */}
                      <div className="flex-1 min-w-0 pr-1">
                        <Link to={`/${article.categorySlug}/${article.slug}`}>
                          <h3 className="font-sans font-bold text-[15px] sm:text-base text-gray-950 group-hover:text-amber-600 transition-colors leading-snug line-clamp-3 mb-2">
                            {article.title}
                          </h3>
                        </Link>

                        {/* Metadata row with Bookmark & Share */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-normal">
                          <span>
                            {article.readTimeMinutes || 4} min read • {formatTimeAgo(article.publishedAt)}
                          </span>

                          <div className="flex items-center gap-2.5 ml-auto sm:ml-4">
                            <button
                              onClick={(e) => toggleBookmark(article.id, e)}
                              className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                              title="Bookmark story"
                            >
                              <Bookmark
                                className={`w-4 h-4 ${
                                  isSaved ? 'fill-amber-600 text-amber-600' : ''
                                }`}
                              />
                            </button>

                            <button
                              onClick={(e) => handleShare(article, e)}
                              className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                              title="Share link"
                            >
                              {isCopied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Share2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Compact Rounded Thumbnail with Mint Gold Badge */}
                      <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80">
                        {article.heroImage ? (
                          <Link to={`/${article.categorySlug}/${article.slug}`}>
                            <MediaRenderer
                              url={article.heroImage}
                              alt={article.title}
                              isThumbnail={true}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-bold uppercase">
                            DW
                          </div>
                        )}

                        {/* Thumbnail Container */}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* RIGHT SIDEBAR (4 COLS): TRENDING, MARKETS & OPINIONS        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6 lg:pl-4 lg:border-l border-gray-200">
            {/* ──────────────────────────────────────────────────────────── */}
            {/* 1. MOST READ / TRENDING (RANKED 1 - 5)                       */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-gray-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Trending on DharmaWatch</span>
                </h3>
              </div>

              <div className="divide-y divide-gray-200/60">
                {trendingStories.map((story, idx) => (
                  <div key={story.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group">
                    <span className="font-sans font-extrabold text-lg text-amber-600/80 shrink-0 select-none w-5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link to={`/${story.categorySlug}/${story.slug}`}>
                        <h4 className="font-sans font-bold text-xs sm:text-sm text-gray-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                          {story.title}
                        </h4>
                      </Link>
                      <span className="text-[10px] text-gray-500 font-normal mt-1 block">
                        {formatTimeAgo(story.publishedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* 2. MARKET WATCH CAPSULE                                      */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Market Watch</span>
                </h4>
                <Link to="/economy" className="text-[11px] text-amber-600 hover:underline font-semibold">
                  Full Board →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">BSE SENSEX</div>
                  <div className="font-bold text-gray-900 text-sm">81,420.50</div>
                  <div className="text-[11px] font-bold text-emerald-600">+245.30 (+0.30%)</div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">NIFTY 50</div>
                  <div className="font-bold text-gray-900 text-sm">24,810.15</div>
                  <div className="text-[11px] font-bold text-emerald-600">+78.20 (+0.32%)</div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">GOLD (10G)</div>
                  <div className="font-bold text-gray-900 text-sm">₹76,400</div>
                  <div className="text-[11px] font-bold text-emerald-600">+120 (+0.16%)</div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">USD / INR</div>
                  <div className="font-bold text-gray-900 text-sm">₹84.12</div>
                  <div className="text-[11px] font-bold text-gray-500">Flat (-0.01)</div>
                </div>
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* 3. OPINION & COLUMNS (AUTHOR CARDS)                          */}
            {/* ──────────────────────────────────────────────────────────── */}
            {opinionArticles.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Views &amp; Columns</span>
                  </h4>
                  <Link to="/opinions" className="text-[11px] text-amber-600 hover:underline font-semibold">
                    All Views →
                  </Link>
                </div>

                <div className="divide-y divide-gray-100">
                  {opinionArticles.map((op) => (
                    <div key={op.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5 group">
                      <div className="flex items-center gap-2">
                        {op.author?.avatar ? (
                          <img
                            src={op.author.avatar}
                            alt={op.author.name}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
                            {op.author?.name ? op.author.name[0] : 'D'}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-gray-900">
                          {op.author?.name || 'Editorial Board'}
                        </span>
                      </div>

                      <Link to={`/${op.categorySlug}/${op.slug}`}>
                        <h5 className="font-sans font-bold text-xs sm:text-sm text-gray-950 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                          {op.title}
                        </h5>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* 4. NEWSLETTER BRIEFING (MINT CLEAN CARD)                     */}
            {/* ──────────────────────────────────────────────────────────── */}
            <div className="rounded-xl p-5 bg-gradient-to-br from-gray-950 to-gray-900 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                The Morning Dispatch
              </span>
              <h4 className="font-sans font-extrabold text-base text-white">
                Get India's sharpest reporting every morning.
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Curated intelligence across markets, policy, the Supreme Court, and investigations.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing to The DharmaWatch Morning Dispatch.');
                }}
                className="space-y-2 pt-1"
              >
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-colors"
                >
                  Subscribe Free
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
