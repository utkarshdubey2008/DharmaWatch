import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { PublicCorrectionItem } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const CorrectionsPage: React.FC = () => {
  const [corrections, setCorrections] = useState<PublicCorrectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCorrections = async () => {
      setIsLoading(true);
      const data = await contentService.getPublicCorrections();
      setCorrections(data);
      setIsLoading(false);
    };

    fetchCorrections();
  }, []);

  const breadcrumbs = [
    { label: 'Standards', path: '/editorial-policy' },
    { label: 'Corrections & Clarifications Ledger' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">
          Editorial Standards &amp; Transparency
        </span>

        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Corrections &amp; Clarifications Ledger
        </h1>

        <p className="font-sans text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed max-w-3xl">
          DharmaWatch is strictly committed to evidentiary accuracy. When we make a factual mistake, omit critical context, or need to clarify published reporting, we correct the public record promptly and transparently without stealth edits.
        </p>

        <p className="text-xs text-gray-500 mt-3">
          To report a factual discrepancy, contact our corrections desk at{' '}
          <a href="mailto:corrections@thedharmawatch.in" className="text-amber-600 hover:underline font-bold">
            corrections@thedharmawatch.in
          </a>.
        </p>
      </div>

      {/* Corrections List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
            Loading corrections ledger...
          </p>
        </div>
      ) : corrections.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-sm text-gray-500">
          No public corrections currently entered for this reporting period.
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((item) => {
            const pubDate = new Date(item.originalPublicationDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const corrDate = new Date(item.correctionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={item.id} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-gray-500">
                  <span className="font-bold text-amber-600 uppercase tracking-wider text-[11px]">
                    Rectified • {corrDate}
                  </span>
                  <span>Originally Published: {pubDate}</span>
                </div>

                <h3 className="font-sans font-bold text-lg sm:text-xl text-gray-900 hover:text-amber-600 transition-colors">
                  <Link to={`/${item.category.toLowerCase()}/${item.articleSlug}`}>
                    {item.articleTitle}
                  </Link>
                </h3>

                <div className="text-sm text-gray-700 leading-relaxed font-sans space-y-2">
                  <p>
                    <strong className="text-gray-900">What was amended:</strong> {item.whatWasChanged}
                  </p>
                  <p className="text-gray-500 text-xs italic">
                    <strong className="text-gray-700 not-italic">Reason for clarification:</strong> {item.reasonForCorrection}
                  </p>
                </div>

                <div className="pt-2 text-xs">
                  <Link
                    to={`/${item.category.toLowerCase()}/${item.articleSlug}`}
                    className="text-amber-600 font-bold hover:underline uppercase tracking-wider text-[11px]"
                  >
                    View amended dispatch →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 text-xs font-bold font-sans">
        <Link to="/standards" className="text-gray-600 hover:text-gray-900">
          ← Back to Standards Hub
        </Link>
        <div className="flex gap-4">
          <Link to="/editorial-policy" className="text-amber-700 hover:underline">
            Editorial Policy
          </Link>
          <Link to="/fact-checking" className="text-amber-700 hover:underline">
            Fact-Checking Methodology
          </Link>
          <Link to="/sources-and-attribution" className="text-amber-700 hover:underline">
            Sources &amp; Attribution
          </Link>
        </div>
      </div>
    </div>
  );
};
