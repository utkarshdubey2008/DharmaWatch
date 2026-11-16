import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article, CaseFile, Author } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Search, FolderArchive, FileText, User, ArrowRight } from 'lucide-react';
import { ArticleCard } from '../components/article/ArticleCard';
import { CaseFileCard } from '../components/caseFile/CaseFileCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(query);

  const [results, setResults] = useState<{
    articles: Article[];
    caseFiles: CaseFile[];
    authors: Author[];
    totalResults: number;
  }>({ articles: [], caseFiles: [], authors: [], totalResults: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'cases' | 'authors'>('all');

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setResults({ articles: [], caseFiles: [], authors: [], totalResults: 0 });
        return;
      }
      setIsLoading(true);
      const data = await contentService.globalSearch(query);
      setResults(data);
      setIsLoading(false);
    };

    doSearch();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const breadcrumbs = [
    { label: 'Search Newsroom' },
    { label: query ? `"${query}"` : 'All' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Search Header Form */}
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">
          DharmaWatch Discovery
        </span>
        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Newsroom Search
        </h1>
        <p className="font-sans text-xs sm:text-sm text-gray-600 mt-1.5">
          Query across news dispatches, financial analysis, investigative dossiers, primary documents, and editorial staff.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 max-w-2xl flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search by topic, company, policy, author, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 shadow-xs transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-900 text-white font-sans text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-black transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {query && !isLoading && (
          <div className="mt-4 text-xs font-sans text-gray-500">
            Found <strong className="text-gray-900 font-bold">{results.totalResults}</strong> records matching{' '}
            <span className="text-amber-600 font-bold">"{query}"</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {query && results.totalResults > 0 && (
        <div className="flex gap-2 border-b border-gray-200 text-xs font-sans font-semibold tracking-wider pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'all'
                ? 'bg-amber-500 border-amber-500 text-black font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            All Results ({results.totalResults})
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'articles'
                ? 'bg-amber-500 border-amber-500 text-black font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Articles ({results.articles.length})
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'cases'
                ? 'bg-amber-500 border-amber-500 text-black font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Project Dossiers ({results.caseFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('authors')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'authors'
                ? 'bg-amber-500 border-amber-500 text-black font-bold'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Authors &amp; Desks ({results.authors.length})
          </button>
        </div>
      )}

      {/* Results Content */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
            Searching records...
          </p>
        </div>
      ) : query && results.totalResults === 0 ? (
        <div className="py-16 text-center border border-gray-200 rounded-2xl p-8 bg-white shadow-xs">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-base font-sans font-bold text-gray-900">
            No documented records matched your query "{query}".
          </p>
          <p className="text-xs text-gray-500 mt-2 font-sans">
            Check your spelling or try searching broader terms like "Supreme Court", "Semiconductor", "Reserve Bank", or "Green Energy".
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Articles Block in Mint row format */}
          {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-sans uppercase font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Articles &amp; Dispatches ({results.articles.length})</span>
              </div>
              <div className="divide-y divide-gray-200">
                {results.articles.map((art) => (
                  <ArticleCard key={art.id} article={art} variant="standard" />
                ))}
              </div>
            </div>
          )}

          {/* Project Dossiers Block */}
          {(activeTab === 'all' || activeTab === 'cases') && results.caseFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-sans uppercase font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                <FolderArchive className="w-4 h-4 text-amber-600" />
                <span>Project Dossiers &amp; Inquiries ({results.caseFiles.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.caseFiles.map((c) => (
                  <CaseFileCard key={c.id} caseFile={c} />
                ))}
              </div>
            </div>
          )}

          {/* Authors Block */}
          {(activeTab === 'all' || activeTab === 'authors') && results.authors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                <User className="w-4 h-4 text-amber-600" />
                <span>Editorial Desks &amp; Columnists ({results.authors.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.authors.map((au) => (
                  <Link
                    key={au.id}
                    to={`/authors/${au.slug}`}
                    className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-4 hover:border-gray-400 hover:shadow-xs transition-all"
                  >
                    <img
                      src={au.avatar}
                      alt={au.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-sans font-bold text-base text-gray-900 truncate">
                        {au.name}
                      </h4>
                      <p className="text-xs text-amber-600 font-semibold">{au.role}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {au.bio}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
