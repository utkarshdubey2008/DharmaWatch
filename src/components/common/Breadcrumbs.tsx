import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs font-sans text-stone-500 py-2.5 overflow-x-auto whitespace-nowrap ${className}`}
    >
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-500 hover:text-amber-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-amber-600 transition-colors uppercase tracking-wider font-semibold text-[11px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-gray-900 font-semibold truncate max-w-xs sm:max-w-md text-xs"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
