import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article } from '../types';
import { MediaRenderer } from '../components/common/MediaRenderer';
import { formatTimeAgo } from '../utils/dateUtils';
import { Clock, ArrowRight, Bookmark, Share2, TrendingUp, FileText, Check } from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestigations = async () => {
      setIsLoading(true);
      window.scrollTo(0, 0);
      try {
        const items = await contentService.getInvestigations(20);
        setInvestigations(items);
      } catch (e) {
        console.error('Error fetching investigations:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestigations();
  }, []);

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

  const leadStory = investigations[0];
  const feedList = investigations.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-2 font-sans">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. MINT SUB-CATEGORY HORIZONTAL STRIP                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 mb-4 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-6 py-2 text-xs font-semibold">
          <span className="text-gray-950 font-extrabold border-b-2 border-gray-950 pb-2.5 shrink-0">
            All Investigations
          </span>
          <Link to="/case-files" className="text-gray-500 hover:text-gray-900 pb-2.5 shrink-0">
            Project Dossiers &amp; Trackers
          </Link>
          <Link to="/data" className="text-gray-500 hover:text-gray-900 pb-2.5 shrink-0">
            Data Journalism &amp; Registries
          </Link>
          <Link to="/editorial-policy" className="text-gray-500 hover:text-gray-900 pb-2.5 shrink-0">
            Evidentiary Standards
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN GRID: 8 COLS FEED + 4 COLS SIDEBAR (MINT STANDARD)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Loading investigative reports...
              </p>
            </div>
          ) : investigations.length === 0 ? (
            <div className="py-16 text-center text-gray-500 font-sans">
              No investigative dispatches currently cataloged.
            </div>
          ) : (
            <>
              {/* Lead Hero Card */}
              {leadStory && (
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex flex-col-reverse sm:flex-row items-stretch justify-between gap-4 sm:gap-6 group">
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="px-1.5 py-0.5 rounded-xs bg-amber-500 text-black font-extrabold uppercase tracking-wider text-[10px]">
                            INVESTIGATION
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 font-normal">
                            {leadStory.readTimeMinutes || 6} min read • {formatTimeAgo(leadStory.publishedAt)}
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
                          By <strong className="text-gray-900 font-semibold">{leadStory.author?.name}</strong>
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

              {/* Mint Vertical Stream Rows */}
              <div className="divide-y divide-gray-200">
                {feedList.map((article) => {
                  const isSaved = savedIds.has(article.id);
                  const isCopied = copiedId === article.id;

                  return (
                    <article
                      key={article.id}
                      className="py-4 sm:py-5 flex items-start justify-between gap-4 group bg-white"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded-xs bg-amber-50 text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                            {article.category}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span>{article.readTimeMinutes || 5} min read</span>
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
                          <span>By {article.author?.name} • {formatTimeAgo(article.publishedAt)}</span>

                          <div className="flex items-center gap-2 ml-auto sm:ml-4">
                            <button
                              onClick={(e) => toggleBookmark(article.id, e)}
                              className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                              title="Bookmark"
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
                              title="Share"
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

                      {/* Right Thumbnail */}
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

        {/* Right 4 Cols */}
        <div className="lg:col-span-4 space-y-6 lg:pl-4 lg:border-l border-gray-200">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-gray-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Active Investigative Audits</span>
              </h3>
            </div>
            <div className="space-y-3">
              <Link to="/case-files/dossier-urban-drainage-procurement-audit" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-amber-500 transition-colors">
                <span className="text-[10px] font-bold uppercase text-amber-600 block">PUBLIC SPENDING AUDIT</span>
                <h4 className="font-sans font-bold text-xs sm:text-sm text-gray-900 mt-0.5 leading-snug">
                  Urban Drainage Procurement Audit (₹14,200 Cr)
                </h4>
                <span className="text-[11px] text-gray-400 mt-1 block">5 Municipalities • 420 RTI Disclosures</span>
              </Link>
              <Link to="/case-files/dossier-clean-energy-transmission-grid" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-amber-500 transition-colors">
                <span className="text-[10px] font-bold uppercase text-amber-600 block">INFRASTRUCTURE TRACKER</span>
                <h4 className="font-sans font-bold text-xs sm:text-sm text-gray-900 mt-0.5 leading-snug">
                  National Clean Energy HVDC Grid Corridor
                </h4>
                <span className="text-[11px] text-gray-400 mt-1 block">500 GW Non-Fossil Power Target</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
