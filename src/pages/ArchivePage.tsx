import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article } from '../types';
import { ArticleCard } from '../components/article/ArticleCard';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const ArchivePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [yearFilter, setYearFilter] = useState(searchParams.get('year') || 'all');
  const [countryFilter, setCountryFilter] = useState(searchParams.get('country') || 'all');
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');

  const pageSize = 8;

  const fetchFilteredArticles = async () => {
    setIsLoading(true);

    const res = await contentService.getArticles({
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      year: yearFilter !== 'all' ? yearFilter : undefined,
      country: countryFilter !== 'all' ? countryFilter : undefined,
      search: searchKeyword.trim() || undefined,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    });

    setArticles(res.data);
    setTotalResults(res.total);
    setTotalPages(res.totalPages);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFilteredArticles();
  }, [categoryFilter, yearFilter, countryFilter, searchKeyword, currentPage]);

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setYearFilter('all');
    setCountryFilter('all');
    setSearchKeyword('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const breadcrumbs = [
    { label: 'News Archive' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Archive Header */}
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">
          DharmaWatch Index &amp; Repository
        </span>
        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          News Archive
        </h1>
        <p className="font-sans text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
          Search, filter, and explore historical reportage, investigative coverage, policy analyses, and primary records published across all news desks.
        </p>
      </div>

      {/* Clean Mint Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search headlines, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Category */}
          <div className="flex items-center gap-1.5">
            <label className="text-gray-500 font-medium">Desk:</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Desks &amp; Categories</option>
              <option value="national">National</option>
              <option value="economy">Economy &amp; Markets</option>
              <option value="world">World</option>
              <option value="opinions">Opinion &amp; Columns</option>
              <option value="investigations">Investigations</option>
              <option value="society-culture">Society &amp; Culture</option>
              <option value="fact-check">Fact Check</option>
            </select>
          </div>

          {/* Year */}
          <div className="flex items-center gap-1.5">
            <label className="text-gray-500 font-medium">Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Country */}
          <div className="flex items-center gap-1.5">
            <label className="text-gray-500 font-medium">Region:</label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Regions</option>
              <option value="India">India</option>
              <option value="International">International</option>
              <option value="USA">USA / Americas</option>
              <option value="Indo-Pacific">Indo-Pacific</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-bold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="pt-2 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
          <span>{totalResults} dispatches cataloged</span>
          <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
        </div>
      </div>

      {/* Articles Feed */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
            Searching archive...
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center border border-gray-200 rounded-xl p-8 bg-white">
          <p className="font-sans font-bold text-lg text-gray-800">
            No articles found matching your criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 text-xs text-amber-600 hover:underline uppercase font-bold tracking-wider"
          >
            Clear filters and reload all articles
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {articles.map((item) => (
            <ArticleCard key={item.id} article={item} variant="standard" />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
};
