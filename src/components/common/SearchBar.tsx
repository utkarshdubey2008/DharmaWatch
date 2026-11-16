import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowUpRight, ArrowRight, FileText, FolderArchive, User, Sparkles } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Article, CaseFile, Author } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SEARCH_HISTORY = [
  'National Semiconductor Mission Phase II',
  'Supreme Court Judicial Bench & PILs',
  'Reserve Bank Monetary Policy & Inflation',
  'RTI Public Procurement Audit',
  'Temple Heritage & Inam Land Encroachments',
  'Dalal Street Financial Markets',
];

const TRENDING_DESKS = [
  { label: 'National & Politics', slug: 'national' },
  { label: 'Economy & Markets', slug: 'economy' },
  { label: 'Supreme Court & Law', slug: 'supreme-court' },
  { label: 'Investigative RTI', slug: 'investigations' },
  { label: 'World Affairs', slug: 'world' },
  { label: 'Opinions & Editorials', slug: 'opinions' },
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    articles: Article[];
    caseFiles: CaseFile[];
    authors: Author[];
    totalResults: number;
  }>({ articles: [], caseFiles: [], authors: [], totalResults: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dw_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SEARCH_HISTORY;
  });

  const addToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('dw_search_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('dw_search_history');
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Global keydown listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ articles: [], caseFiles: [], authors: [], totalResults: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await contentService.globalSearch(query);
      setResults(res);
      setIsLoading(false);
    }, 160);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query.trim());
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectHistory = (term: string) => {
    setQuery(term);
    addToHistory(term);
  };

  const handleNavigate = (path: string, term?: string) => {
    if (term) addToHistory(term);
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-150 overflow-hidden font-sans">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP SEARCH BAR WITH PILL INPUT & PROPER CUT BUTTON        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 sm:py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Pill Search Input */}
          <div className="flex-1 relative flex items-center bg-gray-100/90 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500 border border-transparent rounded-full px-4 py-2.5 sm:py-3 transition-all shadow-2xs">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm sm:text-base font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-700 p-1 mr-1 transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Proper Cut / Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Search (ESC)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 border border-gray-200/80 shadow-2xs"
            aria-label="Close full-screen search"
          >
            <X className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </button>
        </form>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BODY SCROLLABLE CONTENT                                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* A. IDLE STATE: SEARCH HISTORY & TRENDING */}
          {!query && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Search History Header */}
              <div>
                <div className="flex items-center justify-between pb-2">
                  <h3 className="font-sans font-bold text-base sm:text-lg text-gray-950 tracking-tight">
                    Search History
                  </h3>
                  {searchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs font-semibold text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search History Items */}
                <div className="divide-y divide-gray-100">
                  {searchHistory.map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectHistory(term)}
                      className="w-full flex items-center justify-between py-3.5 text-left text-sm sm:text-[15px] text-gray-700 hover:text-gray-950 group transition-colors cursor-pointer"
                    >
                      <span className="font-normal group-hover:font-medium transition-all">
                        {term}
                      </span>
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-amber-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-3" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Desks & Sections */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Explore Newsroom Desks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_DESKS.map((desk) => (
                    <button
                      key={desk.slug}
                      type="button"
                      onClick={() => handleNavigate(`/${desk.slug}`, desk.label)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 transition-colors cursor-pointer"
                    >
                      {desk.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* B. ACTIVE SEARCHING STATE: LIVE RESULTS */}
          {query && (
            <div className="space-y-6">
              {isLoading && (
                <div className="py-12 text-center text-sm text-gray-500">
                  <div className="inline-block w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="font-mono text-xs text-gray-400">Querying verified records...</p>
                </div>
              )}

              {!isLoading && results.totalResults === 0 && (
                <div className="py-12 text-center space-y-2">
                  <p className="text-base text-gray-900 font-serif">
                    No verified records found matching &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Try searching by case ID (e.g. DW-2026-0001), broadsheet keywords, legal docket, or byline.
                  </p>
                </div>
              )}

              {/* Case Files Section */}
              {!isLoading && results.caseFiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-amber-700 font-bold tracking-wider mb-2.5">
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>Case Files ({results.caseFiles.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.caseFiles.map((caseFile) => (
                      <div
                        key={caseFile.id}
                        onClick={() => handleNavigate(`/case-files/${caseFile.id}`, caseFile.title)}
                        className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/80 cursor-pointer transition-colors shadow-2xs group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-amber-600">
                            {caseFile.id.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 uppercase">
                            {caseFile.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-serif font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                          {caseFile.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                          {caseFile.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documented Articles Section */}
              {!isLoading && results.articles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-gray-500 font-bold tracking-wider mb-2.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Documented Articles ({results.articles.length})</span>
                  </div>
                  <div className="space-y-2">
                    {results.articles.slice(0, 6).map((article) => (
                      <div
                        key={article.id}
                        onClick={() => handleNavigate(`/${article.categorySlug}/${article.slug}`, article.title)}
                        className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/80 cursor-pointer transition-colors shadow-2xs group"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                          <span className="uppercase tracking-wider font-mono font-bold text-amber-600 text-[10px]">
                            {article.category}
                          </span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-serif font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                          {article.title}
                        </h4>
                        {article.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors Section */}
              {!isLoading && results.authors.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-gray-500 font-bold tracking-wider mb-2.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Editorial Authors ({results.authors.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.authors.map((author) => (
                      <div
                        key={author.id}
                        onClick={() => handleNavigate(`/authors/${author.slug}`, author.name)}
                        className="p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/80 cursor-pointer transition-colors shadow-2xs"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {author.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-950 truncate">{author.name}</div>
                          <div className="text-[11px] text-gray-500 truncate">{author.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Matches Footer CTA */}
              {!isLoading && results.totalResults > 0 && (
                <div className="pt-3 pb-6 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Showing top results for <strong className="text-gray-900">&ldquo;{query}&rdquo;</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                  >
                    <span>View all {results.totalResults} results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
