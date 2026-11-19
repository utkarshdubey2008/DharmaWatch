import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { parseVideoUrl } from '../../utils/mediaUtils';
import { MediaRenderer } from '../common/MediaRenderer';
import { formatTimeAgo, formatDateStandard } from '../../utils/dateUtils';
import { Bookmark, Share2, Check } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'compact' | 'horizontal' | 'ranked';
  showImage?: boolean;
  rank?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  rank,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = formatDateStandard(article.publishedAt) || 'Recent';
  const timeAgo = formatTimeAgo(article.publishedAt);

  const hasMedia =
    article.heroImage &&
    (parseVideoUrl(article.heroImage).isVideo ||
      article.heroImage.startsWith('http') ||
      article.heroImage.startsWith('/'));

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${article.categorySlug}/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  // 1. Ranked Wire Card (e.g. Most Read)
  if (variant === 'ranked') {
    const rankStr = rank ? (rank < 10 ? `0${rank}` : `${rank}`) : '01';
    return (
      <article className="group py-3.5 border-b border-gray-100 last:border-b-0 flex items-start gap-3.5 bg-white">
        <span className="font-sans text-xl font-black text-amber-500/80 group-hover:text-amber-600 transition-colors shrink-0 select-none">
          {rankStr}
        </span>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-amber-600 uppercase tracking-wider text-[10px]">
              {article.category}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-normal">{timeAgo}</span>
          </div>
          <h4 className="font-sans font-bold text-sm sm:text-base text-gray-950 group-hover:text-amber-600 transition-colors leading-snug">
            <Link to={`/${article.categorySlug}/${article.slug}`}>
              {article.title}
            </Link>
          </h4>
          <div className="text-[11px] text-gray-400 font-sans">
            By {article.author?.name || 'The Dharma Watch'}
          </div>
        </div>
      </article>
    );
  }

  // 2. Standard Mint-Style Horizontal News Feed Row
  return (
    <article className="py-4 border-b border-gray-100 last:border-b-0 flex items-start justify-between gap-4 group bg-white">
      {/* Left: Text, Category, Metadata & Actions */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 mb-1.5">
          <span className="px-1.5 py-0.5 rounded-xs bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
            {article.category}
          </span>
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

        {/* Metadata + Bookmark & Share */}
        <div className="flex items-center gap-3 text-xs text-gray-500 font-normal">
          <span>
            {article.readTimeMinutes || 4} min read • {timeAgo}
          </span>

          <div className="flex items-center gap-2 ml-auto sm:ml-4">
            <button
              onClick={handleBookmark}
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
              onClick={handleShare}
              className="p-1 text-gray-400 hover:text-amber-600 transition-colors relative"
              title="Share link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Rounded Thumbnail with Mint Gold Badge */}
      <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80">
        {hasMedia ? (
          <Link to={`/${article.categorySlug}/${article.slug}`} className="block w-full h-full">
            <MediaRenderer
              url={article.heroImage}
              alt={article.title}
              isThumbnail={true}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-bold uppercase">
            DW
          </div>
        )}
      </div>
    </article>
  );
};
