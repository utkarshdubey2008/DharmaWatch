import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { Clock, Bookmark, Share2 } from 'lucide-react';

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  const formattedDate = article.publishedAt && !isNaN(new Date(article.publishedAt).getTime())
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-gray-400 transition-colors shadow-xs">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <span className="text-amber-600 font-extrabold">
          LEAD STORY
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-gray-600 font-semibold">{article.category}</span>
      </div>

      <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-gray-900 hover:text-amber-600 transition-colors leading-snug">
        <Link to={`/${article.categorySlug}/${article.slug}`}>
          {article.title}
        </Link>
      </h2>

      <p className="font-sans text-sm sm:text-base text-gray-600 leading-relaxed">
        {article.deck || article.excerpt}
      </p>

      {article.heroImage && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span>By {article.author?.name} • {formattedDate}</span>
        <span className="flex items-center gap-1 font-semibold text-gray-700">
          <Clock className="w-3.5 h-3.5" />
          {article.readTimeMinutes} min read
        </span>
      </div>
    </article>
  );
};
