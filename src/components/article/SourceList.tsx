import React, { useState } from 'react';
import { Source } from '../../types';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface SourceListProps {
  sources: Source[];
  className?: string;
}

export const SourceList: React.FC<SourceListProps> = ({ sources, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  // Deduplicate by source.id or source.title
  const uniqueSources = Array.from(
    new Map(sources.map((s) => [s.id || s.title, s])).values()
  );

  return (
    <div className={`mt-8 pt-4 border-t border-gray-200 text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-amber-600 text-xs">
            Documentation &amp; Sources ({uniqueSources.length})
          </span>
          <span className="text-gray-400 text-xs">• Primary Citations</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>Collapse <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Expand Citations <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      </div>

      {/* Citations List */}
      <ol className="mt-3 space-y-2 text-gray-600">
        {uniqueSources.map((source, idx) => (
          <li key={source.id || idx} className="flex items-baseline gap-2">
            <span className="text-amber-600 font-bold text-xs shrink-0">
              [{idx + 1}]
            </span>
            <div className="flex-1">
              <span className="font-semibold text-gray-900">{source.title}</span>
              {source.publisher && (
                <>
                  <span className="text-gray-400"> - </span>
                  <span className="text-gray-600">{source.publisher}</span>
                </>
              )}
              {source.documentNumber && (
                <span className="text-gray-500"> (Doc: {source.documentNumber})</span>
              )}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-0.5 text-amber-600 hover:underline text-xs font-semibold"
                >
                  <span>Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {isExpanded && source.notes && (
                <p className="text-xs text-zinc-500 mt-1 pl-2 border-l border-red-600">
                  {source.notes}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
