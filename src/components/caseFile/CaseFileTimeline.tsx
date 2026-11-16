import React from 'react';
import { TimelineEvent } from '../../types';

interface CaseFileTimelineProps {
  events: TimelineEvent[];
}

export const CaseFileTimeline: React.FC<CaseFileTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) return null;

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
      {sortedEvents.map((evt) => (
        <div key={evt.id} className="relative group">
          {/* Dot */}
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-amber-500 group-hover:bg-amber-500 transition-colors" />

          {/* Event Content */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-gray-500 mb-1">
              <span className="font-bold text-gray-900">{evt.date}</span>
              {evt.documentNumber && (
                <span className="text-[11px] text-amber-600 font-semibold">
                  Ref: {evt.documentNumber}
                </span>
              )}
            </div>

            <h4 className="font-sans font-bold text-base text-gray-900 leading-snug">
              {evt.headline}
            </h4>

            <p className="font-sans text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              {evt.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
