import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article, Category } from '../types';
import { ARTICLES } from '../data/articles';
import { MediaRenderer } from '../components/common/MediaRenderer';
import { formatTimeAgo } from '../utils/dateUtils';
import {
  Bookmark,
  Share2,
  ChevronRight,
  TrendingUp,
  Check,
  Filter,
  FileText,
} from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;
      setIsLoading(true);
      window.scrollTo(0, 0);

      try {
        const catData = await contentService.getCategoryBySlug(categorySlug);
        setCategory(catData);

        const result = await contentService.getArticles({
          category: categorySlug,
          limit: 50,
        });

        // Fallback to in-memory ARTICLES if empty
        const list =
          result.data && result.data.length > 0
            ? result.data
            : ARTICLES.filter((a) => a.categorySlug === categorySlug);

        setArticles(list);
      } catch (err) {
        console.error('Error fetching category data:', err);
        const fallbackList = ARTICLES.filter((a) => a.categorySlug === categorySlug);
        setArticles(fallbackList);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

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

  // Filter articles by subcategory if selected
  const filteredArticles = articles.filter((a) => {
    if (selectedSubcategory === 'All') return true;
    const matchSub = a.subcategory && a.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    const matchTag = a.tags && a.tags.some((t) => t.toLowerCase() === selectedSubcategory.toLowerCase());
    return matchSub || matchTag;
  });

  const leadStory = filteredArticles[0] || articles[0];
  const feedList = filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles;
  const trendingList = articles.slice(0, 5);

  const subcategoryList = ['All', ...(category?.subcategories || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-2 font-sans">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. MINT SUB-CATEGORY HORIZONTAL PILL STRIP                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {subcategoryList.length > 1 && (
        <div className="border-b border-gray-200 mb-4 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-6 py-2 text-xs font-semibold">
            {subcategoryList.map((sub) => {
              const isActive = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`relative pb-2.5 transition-colors shrink-0 ${
                    isActive
                      ? 'text-gray-950 font-extrabold border-b-2 border-gray-950'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN GRID: 8 COLS FEED + 4 COLS SIDEBAR (EXACT MINT LAYOUT) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (8 COLS): LEAD STORY + NEWSFEED */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Loading dispatches...
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center border border-gray-200 rounded-xl p-8 bg-gray-50">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">
                No dispatches currently listed in this category.
              </p>
              <Link
                to="/"
                className="mt-3 inline-flex items-center gap-1 text-xs uppercase font-bold text-amber-600 hover:underline"
              >
                Return to Front Page <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {/* ──────────────────────────────────────────────────────────── */}
              {/* LEAD STORY CARD (MINT HERO SPLASH)                           */}
              {/* ──────────────────────────────────────────────────────────── */}
              {leadStory && (
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex flex-col-reverse sm:flex-row items-stretch justify-between gap-4 sm:gap-6 group">
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="px-1.5 py-0.5 rounded-xs bg-amber-500/10 text-amber-700 font-bold uppercase tracking-wider text-[10px]">
                            {leadStory.category}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 font-normal">
                            {leadStory.readTimeMinutes || 4} min read • {formatTimeAgo(leadStory.publishedAt)}
                          </span>
                        </div>

                        <Link to={`/${leadStory.categorySlug}/${leadStory.slug}`}>
                          <h1 className="font-sans font-extrabold text-xl sm:text-2xl lg:text-3xl text-gray-950 group-hover:text-amber-600 transition-colors leading-tight">
                            {leadStory.title}
                          </h1>
                        </Link>

                        {leadStory.deck && (
                          <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {leadStory.deck}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                        <span>
                          By <strong className="text-gray-900 font-semibold">{leadStory.author?.name || 'The Dharma Watch'}</strong>
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => toggleBookmark(leadStory.id, e)}
                            className="p-1 text-gray-500 hover:text-amber-600 transition-colors"
                            title="Bookmark"
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
                            title="Share"
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
              {/* SPOTLIGHT HORIZONTAL CAROUSEL (MINT STYLE)                   */}
              {/* ──────────────────────────────────────────────────────────── */}
              {articles.length >= 3 && (
                <div className="py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="font-sans font-extrabold text-sm sm:text-base tracking-wide text-gray-950 uppercase">
                      Top in {category ? category.name : categorySlug}
                    </h2>
                  </div>

                  <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {articles.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="w-64 sm:w-72 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
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

                          <div className="p-3.5 space-y-1.5">
                            <span className="text-[10px] font-serif font-black tracking-wider text-gray-500 uppercase block">
                              THE DHARMA WATCH
                            </span>
                            <Link to={`/${item.categorySlug}/${item.slug}`}>
                              <h3 className="font-sans font-bold text-sm text-gray-950 leading-snug line-clamp-3 group-hover:text-amber-600 transition-colors">
                                {item.title}
                              </h3>
                            </Link>
                          </div>
                        </div>

                        <div className="px-3.5 pb-3 pt-1 text-[11px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
                          <span>{item.readTimeMinutes || 4} min read</span>
                          <span>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────── */}
              {/* VERTICAL STREAM: 2-COLUMN ROWS (EXACT MINT LAYOUT)          */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="divide-y divide-gray-200">
                {feedList.map((article) => {
                  const isSaved = savedIds.has(article.id);
                  const isCopied = copiedId === article.id;

                  return (
                    <article
                      key={article.id}
                      className="py-4 sm:py-5 flex items-start justify-between gap-4 group bg-white"
                    >
                      {/* Left: Headline & Metadata */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-1.5">
                          {article.subcategory && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                              {article.subcategory}
                            </span>
                          )}
                          {article.isBreaking && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-red-100 text-red-700 font-bold uppercase text-[9px]">
                              BREAKING
                            </span>
                          )}
                          {article.isInvestigation && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800 font-bold uppercase text-[9px]">
                              INVESTIGATION
                            </span>
                          )}
                        </div>

                        <Link to={`/${article.categorySlug}/${article.slug}`}>
                          <h3 className="font-sans font-bold text-[15px] sm:text-base text-gray-950 group-hover:text-amber-600 transition-colors leading-snug line-clamp-3 mb-2">
                            {article.title}
                          </h3>
                        </Link>

                        {article.deck && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed hidden sm:block">
                            {article.deck}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 font-normal">
                          <span>
                            {article.readTimeMinutes || 4} min read • {formatTimeAgo(article.publishedAt)}
                          </span>

                          <div className="flex items-center gap-2 ml-auto sm:ml-4">
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
                              className="p-1 text-gray-400 hover:text-amber-600 transition-colors relative"
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
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RIGHT SIDEBAR (4 COLS): TRENDING & SECTION CAPSULE         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-6 lg:pl-4 lg:border-l border-gray-200">
          {/* Trending in Section */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-gray-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Most Read in {category ? category.name : 'Desk'}</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-200/60">
              {trendingList.map((story, idx) => (
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

          {/* Market Watch Capsule if in Economy */}
          {categorySlug === 'economy' && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Key Market Indicators</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">SENSEX</div>
                  <div className="font-bold text-gray-950 text-sm mt-0.5">82,450.12</div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    +412.30 (+0.50%)
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">NIFTY 50</div>
                  <div className="font-bold text-gray-950 text-sm mt-0.5">25,180.45</div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    +128.90 (+0.51%)
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">USD / INR</div>
                  <div className="font-bold text-gray-950 text-sm mt-0.5">84.22</div>
                  <div className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                    -0.05 (-0.06%)
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">GOLD (10G)</div>
                  <div className="font-bold text-gray-950 text-sm mt-0.5">₹78,450</div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    +240 (+0.31%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Newsletter Box */}
          <div className="bg-gray-900 text-white rounded-xl p-5 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">
              DharmaWatch Briefing
            </span>
            <h4 className="font-sans font-bold text-base leading-snug">
              Get the morning intelligence note delivered daily at 7 AM.
            </h4>
            <div className="space-y-2 pt-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => alert('Thank you for subscribing to DharmaWatch Morning Intelligence!')}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs uppercase font-extrabold tracking-wider rounded-lg transition-colors"
              >
                Subscribe Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
