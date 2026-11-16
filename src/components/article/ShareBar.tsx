import React, { useState } from 'react';
import { Link as LinkIcon, MessageSquare, Twitter, Mail, Check } from 'lucide-react';
import { Article } from '../../types';

interface ShareBarProps {
  article: Article;
}

export const ShareBar: React.FC<ShareBarProps> = ({ article }) => {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : `https://thedharmawatch.in/${article.categorySlug}/${article.slug}`;
  const title = article.title;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=thedharmawatch`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Read this article on The Dharma Watch:\n\n${url}`)}`,
  };

  return (
    <>
      {/* Desktop Sticky Share Sidebar */}
      <div className="no-print hidden lg:flex flex-col items-center gap-2.5 sticky top-24 z-10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
          Share
        </span>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:text-amber-600 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors relative"
          title="Copy Link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
          {copied && (
            <span className="absolute left-10 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
              Copied
            </span>
          )}
        </button>

        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
          title="Share on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </a>

        {/* X / Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
          title="Share on X"
        >
          <Twitter className="w-3.5 h-3.5" />
        </a>

        {/* Email */}
        <a
          href={shareLinks.email}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:text-amber-600 hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
          title="Share via Email"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mobile Floating Share Bar */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between shadow-lg">
        <span className="text-xs text-gray-500 font-medium">Share:</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="p-2 text-gray-600 dark:text-neutral-300 hover:text-amber-600"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
          </button>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600">
            <MessageSquare className="w-4 h-4" />
          </a>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-700 dark:text-neutral-300">
            <Twitter className="w-4 h-4" />
          </a>
          <a href={shareLinks.email} className="p-2 text-gray-600 dark:text-neutral-300">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
};
