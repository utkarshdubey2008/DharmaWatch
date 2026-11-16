import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1.5 py-6 font-sans text-xs ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages.map((p, idx) => {
        if (p === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-stone-400">
              ...
            </span>
          );
        }
        const pageNumber = p as number;
        const isCurrent = pageNumber === currentPage;
        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
              isCurrent
                ? 'bg-amber-500 text-black shadow-xs'
                : 'border border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};
