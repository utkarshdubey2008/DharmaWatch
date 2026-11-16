import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { Article } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SourceList } from '../components/article/SourceList';
import { ArticleCard } from '../components/article/ArticleCard';
import { Clock, Calendar, ChevronLeft, Link as LinkIcon, Bookmark, Share2, Check } from 'lucide-react';
import { MediaRenderer } from '../components/common/MediaRenderer';
import { formatTimeAgo } from '../utils/dateUtils';
import { SOCIAL_LINKS, TelegramIcon } from '../components/common/SocialIcons';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ category: string; slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setIsLoading(true);
      const data = await contentService.getArticleBySlug(slug);
      if (data) {
        setArticle(data);
        document.title = `${data.title} - The Dharma Watch`;
        if (data.slug && data.slug !== slug) {
          navigate(`/${data.categorySlug}/${data.slug}`, { replace: true });
        }

        // Fetch related articles
        const related = await contentService.getRelatedArticles(data.id, 4);
        setRelatedArticles(related);
      }
      setIsLoading(false);
    };

    fetchArticle();
  }, [slug, navigate]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="py-28 text-center max-w-xl mx-auto font-sans">
        <div className="inline-block w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading dispatch...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto font-sans">
        <h2 className="font-sans font-bold text-2xl text-gray-900 mb-2">
          Dispatch Not Found
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          The requested article could not be located in our records.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    );
  }

  const publishedFormatted = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeAgoFormatted = formatTimeAgo(article.publishedAt);

  const locationText = article.location?.state
    ? `${article.location.state}, ${article.location.country}`
    : article.location?.country || 'India';

  const breadcrumbs = [
    { label: article.category, path: `/${article.categorySlug}` },
    { label: article.title },
  ];

  // Helper to render inline formatting
  const renderFormattedText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-gray-950">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-8 px-4 sm:px-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-3" />

      <article className="space-y-6">
        {/* Category & Metadata Pill Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <Link
            to={`/${article.categorySlug}`}
            className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 font-bold uppercase tracking-wider text-[10px]"
          >
            {article.category}
          </Link>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-normal">{locationText}</span>

          {article.isBreaking && (
            <>
              <span className="text-gray-300">•</span>
              <span className="bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                BREAKING
              </span>
            </>
          )}

          {article.isInvestigation && (
            <>
              <span className="text-gray-300">•</span>
              <span className="bg-amber-100 text-amber-800 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                INVESTIGATION
              </span>
            </>
          )}

          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-normal">{timeAgoFormatted}</span>
        </div>

        {/* Main Headline (Mint Crisp Style) */}
        <h1 className="font-sans font-extrabold text-2xl sm:text-3xl md:text-4xl text-gray-950 leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Subheadline / Deck */}
        {article.deck && (
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {article.deck}
          </p>
        )}

        {/* Author Byline, Date & Actions (Mint Style Bar) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-t border-b border-gray-200 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            {article.author?.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                DW
              </div>
            )}
            <div>
              <span className="font-bold text-gray-900 text-sm block">
                {article.author?.name || 'DharmaWatch Staff'}
              </span>
              <span className="text-gray-500 text-[11px] block">
                {article.author?.role || 'National Bureau'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{publishedFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{article.readTimeMinutes} min read</span>
            </div>

            {/* Bookmark & Share Icons */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Bookmark article"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {article.heroImage && (
          <div className="my-6 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <MediaRenderer
              url={article.heroImage}
              alt={article.title}
              caption={article.imageCaption}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="space-y-6 text-gray-800 text-[16px] sm:text-[17px] leading-[1.8] font-sans">
          {article.content.map((paragraph: string, index: number) => {
            const trimmed = paragraph.trim();

            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={index}
                  className="font-bold text-xl sm:text-2xl text-gray-950 mt-10 mb-3 pt-4 border-t border-gray-100 tracking-tight"
                >
                  {trimmed.replace(/^##\s+/, '')}
                </h2>
              );
            }

            if (trimmed.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className="font-bold text-lg text-gray-950 mt-6 mb-2 tracking-tight"
                >
                  {trimmed.replace(/^###\s+/, '')}
                </h3>
              );
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <ul key={index} className="list-disc pl-5 my-3 space-y-1.5 text-gray-800 text-base">
                  {trimmed.split('\n').map((line, liIdx) => (
                    <li key={liIdx}>
                      {renderFormattedText(line.replace(/^[-*]\s+/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }

            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={index}
                  className="my-6 py-3 px-5 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-lg text-gray-800 text-sm leading-relaxed"
                >
                  {renderFormattedText(trimmed.replace(/^>\s+/, ''))}
                </blockquote>
              );
            }

            return (
              <p key={index} className="leading-[1.8]">
                {renderFormattedText(paragraph)}
              </p>
            );
          })}
        </div>

        {/* Article Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-5 border-t border-gray-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold mr-1">Related Topics:</span>
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                to={`/archive?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-700 text-xs rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Official Sources Reference if available */}
        {article.sources && article.sources.length > 0 && (
          <SourceList sources={article.sources} />
        )}

        {/* Related Stories Feed (Mint Style) */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
            <h3 className="font-sans font-bold text-lg text-gray-950 uppercase tracking-wide">
              More From DharmaWatch
            </h3>
            <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 px-4 sm:px-6 shadow-xs">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} variant="standard" />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
