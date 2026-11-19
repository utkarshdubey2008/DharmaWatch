import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  BookOpen, 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';

export const EditorialPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Standards', path: '/standards' },
    { label: 'Editorial Charter' },
  ];

  const separationTiers = [
    {
      label: 'Straight News & Investigations',
      badge: 'Fact-Bound',
      description: 'Strictly factual, evidentiary, dispassionate, and verifiable. Personal conjecture and subjective commentary are strictly excluded from news reporting.',
    },
    {
      label: 'News Analysis & In-Depth Context',
      badge: 'Analytical Context',
      description: 'Analysis placing breaking news into legal, constitutional, and economic context, grounded in empirical data, official records, and statutory law.',
    },
    {
      label: 'The Dharma View (Editorials)',
      badge: 'Institutional Stance',
      description: 'The editorial viewpoint of The Dharma Watch on matters of public policy, national interest, constitutional justice, and governance.',
    },
    {
      label: 'Columns & Signed Opinion',
      badge: 'Signed Byline',
      description: 'Individual perspectives by named contributing authors, jurists, and scholars. Opinions expressed belong strictly to the author and do not necessarily represent the publication.',
    },
  ];

  const ethicsRules = [
    {
      title: 'Prohibition on Commercial Junkets & Favors',
      desc: 'The publication and any contributing writers may not accept gifts, subsidized travel, commercial hospitality, or personal favors from subjects of reporting, government departments, corporations, or political bodies.',
    },
    {
      title: 'Financial Conflict Disclosures',
      desc: 'Anyone reporting on economic, financial, or corporate matters must disclose relevant personal or commercial holdings in entities under reporting to prevent conflicts of interest.',
    },
    {
      title: 'Editorial Non-Partisanship',
      desc: 'The publication maintains independence from political parties, election campaign organizations, and commercial lobbying groups.',
    },
    {
      title: 'Verifiable Attribution',
      desc: 'Information from peer publications, external agencies, or public documents is attributed clearly with source links and citations.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Newsroom Standards
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Editorial Independence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Editorial Charter &amp; Independence
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch is committed to independent journalism. We maintain a clear structural separation between objective news reporting, in-depth analysis, institutional editorials, and guest commentary.
        </p>
      </header>

      {/* Separation of News and Opinion */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <span>The Four Tiers of Content Demarcation</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Readers are entitled to distinguish clearly between verified factual reportage and opinion:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {separationTiers.map((tier) => (
            <div key={tier.label} className="bg-stone-50 p-4 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white px-2 py-0.5 border border-stone-300 text-stone-700">
                  {tier.badge}
                </span>
              </div>
              <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">
                {tier.label}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {tier.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethics & Integrity Code */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Conflict of Interest &amp; Integrity Guidelines</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ethicsRules.map((rule) => (
            <div key={rule.title} className="p-4 bg-stone-50 border border-stone-200 space-y-1.5">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                {rule.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Factual Integrity & Corrections Commitment */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 rounded space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
            Commitment to Factual Accuracy
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
          The Dharma Watch adheres to the standard that factual accuracy takes precedence over publishing speed. When errors occur, they are corrected transparently without silent revisions.
        </p>
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/standards" className="text-gray-600 hover:text-gray-900">
          ← Back to Standards Overview
        </Link>
        <Link to="/editorial-policy" className="text-amber-700 hover:text-amber-900 flex items-center gap-1">
          <span>Editorial Policy &amp; Evidentiary Mandate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
