import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Author, Article } from '../types';
import { ArticleCard } from '../components/article/ArticleCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Mail, Key, Tag, ChevronLeft, ShieldCheck, Newspaper } from 'lucide-react';

export const AuthorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!slug) return;
      setIsLoading(true);
      const au = await contentService.getAuthorBySlug(slug);
      if (au) {
        setAuthor(au);
        const artRes = await contentService.getArticles({ authorSlug: au.slug, limit: 12 });
        setArticles(artRes.data);
        document.title = `${au.name} - Editorial Masthead - DharmaWatch`;
      }
      setIsLoading(false);
    };

    fetchAuthorData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
          Loading author profile...
        </p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <h2 className="font-sans font-bold text-2xl text-gray-900 mb-2">
          Editorial Author Not Found
        </h2>
        <p className="text-sm text-gray-600 font-sans mb-6">
          The requested journalist profile does not exist in our masthead records.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-sans uppercase font-bold rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Front Page
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Newsroom Masthead', path: '/about' },
    { label: author.name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Author Bio Header Card */}
      <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
          {author.avatar && !author.avatar.includes('unsplash.com') ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-gray-100 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-500/10 border-2 border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-3xl shadow-xs shrink-0">
              {author.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}

          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase text-amber-600 font-bold tracking-wider">
                  DharmaWatch Editorial Desk
                </span>
                <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-gray-900 mt-0.5">
                  {author.name}
                </h1>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff Correspondent
              </span>
            </div>

            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {author.role}
            </p>

            <p className="font-sans text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl">
              {author.bio}
            </p>

            {/* Areas of Coverage */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-gray-400 mr-1 flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3" /> Beats:
              </span>
              {author.areasOfCoverage.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-0.5 bg-gray-100 rounded-full text-gray-700 text-[11px] font-medium"
                >
                  {area}
                </span>
              ))}
            </div>

            {/* Contact details */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {author.email && (
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{author.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Author's Published Reports in Mint Row Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-amber-600" />
            <h2 className="font-sans font-bold text-xl text-gray-900">
              Published Dispatches ({articles.length})
            </h2>
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Chronological
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
            No published reports currently cataloged under this bureau.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} variant="standard" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
