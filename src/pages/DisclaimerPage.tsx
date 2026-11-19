import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HelpCircle, AlertCircle, Scale, FileText, CheckCircle2 } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Disclaimer' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Legal Disclosures
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">General Notice</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Disclaimer
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          This disclaimer outlines the general terms, legal limits, and evidentiary scope governing content published on <strong className="text-gray-900">https://thedharmawatch.in/</strong>.
        </p>
      </header>

      {/* Disclaimers List */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Section 1 */}
        <div className="pt-6 first:pt-0 space-y-2">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>1. General Journalistic Purpose</span>
          </h2>
          <p className="text-gray-700">
            The articles, investigative dispatches, datasets, case files, and analyses published by The Dharma Watch are provided solely for general public information, educational awareness, and civic discussion in the public interest. Content does not constitute formal legal counsel, financial or investment advisory, medical advice, or statutory certification. Readers should consult qualified professional advisers before acting upon matters discussed in reportage.
          </p>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-2">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>2. Sub-Judice Matters &amp; Judicial Presumption</span>
          </h2>
          <p className="text-gray-700">
            When reporting on police investigations, First Information Reports (FIRs), remand proceedings, chargesheets, or ongoing litigation, The Dharma Watch reports matters strictly as entered in official legal records. The lodging of an FIR or allegations in a complaint do not constitute proof of guilt. Under the Indian legal system, an accused person is presumed innocent until proven guilty by a court of competent jurisdiction.
          </p>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-2">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>3. Opinion Columns &amp; External Bylines</span>
          </h2>
          <p className="text-gray-700">
            Columns, signed opinion essays, analytical submissions, and reader responses express the individual viewpoints and interpretations of their named authors. They do not necessarily reflect the official stance or editorial perspective of The Dharma Watch or its owner.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-2">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>4. Third-Party Websites &amp; External Links</span>
          </h2>
          <p className="text-gray-700">
            For the convenience and evidentiary verification of our readers, articles often include hyperlinks to third-party government websites, legal registries, academic datasets, and peer news publications. The Dharma Watch does not operate, control, or endorse third-party content and assumes no legal responsibility for external websites.
          </p>
        </div>

        {/* Section 5 */}
        <div className="pt-6 space-y-2">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>5. Commitment to Immediate Correction</span>
          </h2>
          <p className="text-gray-700">
            While every reasonable precaution is taken to ensure factual accuracy through primary source documentation, errors of fact may occasionally occur. The Dharma Watch commits to correcting verified factual inaccuracies promptly and transparently in our{' '}
            <Link to="/corrections" className="text-amber-700 font-bold hover:underline">Public Corrections Ledger</Link>.
          </p>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/terms-of-use" className="text-gray-600 hover:text-gray-900">
          ← Terms of Use
        </Link>
        <Link to="/editorial-policy" className="text-amber-700 hover:text-amber-900">
          Editorial Policy →
        </Link>
      </div>
    </div>
  );
};
