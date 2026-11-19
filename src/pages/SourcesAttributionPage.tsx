import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  Lock, 
  FileText, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  ArrowRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export const SourcesAttributionPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Standards', path: '/standards' },
    { label: 'Sources & Attribution' },
  ];

  const sourcingTiers = [
    {
      tier: 'TIER 1: PRIMARY CERTIFIED RECORDS (GOLD STANDARD)',
      badge: 'Unimpeachable',
      color: 'border-l-4 border-amber-600 bg-amber-50/50',
      items: [
        'Certified Court Judgments, High Court & Supreme Court Petitions, Orders, and Affidavits.',
        'Registered First Information Reports (FIRs), Police Chargesheets, and Forensic Ballistics Recoveries.',
        'Official Responses to Right to Information (RTI) Applications under statutory public authority seal.',
        'Parliamentary Debates, Lok Sabha & Rajya Sabha Hansard Transcripts, and Standing Committee Reports.',
        'Government Gazettes, Statutory Notifications, and Ministry of Corporate Affairs (MCA) Filings.',
      ],
    },
    {
      tier: 'TIER 2: CORROBORATED ON-THE-RECORD WITNESSES & EXPERTS',
      badge: 'Corroborated',
      color: 'border-l-4 border-stone-600 bg-stone-50',
      items: [
        'Named public officials, constitutional experts, defense veterans, and specialized researchers.',
        'On-the-record eyewitnesses to public incidents whose identities and presence have been verified.',
        'Peer-reviewed scientific datasets, geological surveys, and published university whitepapers.',
        'Corporate disclosures submitted directly to SEBI, BSE, and NSE stock exchange repositories.',
      ],
    },
    {
      tier: 'TIER 3: BACKGROUND & INSTITUTIONAL STATEMENTS',
      badge: 'Contextual',
      color: 'border-l-4 border-gray-400 bg-white',
      items: [
        'Official press releases, ministry press conferences, and corporate media statements.',
        'Historical archives, Archaeological Survey of India documentation, and demographic records.',
      ],
    },
  ];

  const anonymousRules = [
    {
      title: '1. Strict Criteria of Personal / Professional Peril',
      desc: 'Anonymity is granted only when on-the-record attribution would expose the source to concrete risk of physical violence, criminal prosecution, extra-judicial reprisal, or loss of livelihood.',
    },
    {
      title: '2. Direct Editorial Vetting Requirement',
      desc: 'Anonymity is granted only after the source’s identity, background, and bona fides have been directly verified by the editor. The publication does not accept unvetted pseudonymous claims.',
    },
    {
      title: '3. The Rule of Two Independent Corroborations',
      desc: 'An anonymous source’s factual claims cannot be published in isolation. Every substantive claim must be corroborated by independent physical documentation or verified by at least one other unrelated source.',
    },
    {
      title: '4. Absolute Prohibition on Character Assassination',
      desc: 'Anonymity is never permitted for sources to make derogatory, speculative, or uncorroborated personal attacks against individuals or political opponents.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Evidentiary Standards
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Sourcing Doctrine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Sources, Evidence Hierarchy &amp; Attribution
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The credibility of journalism depends entirely on the veracity of its sources. The Dharma Watch operates under a strict evidence hierarchy, demanding primary document substantiation and transparent attribution for every published fact.
        </p>
      </header>

      {/* The Sourcing Pyramid */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>The Dharma Watch Evidence Pyramid</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Every fact reported in our investigations is classified against this three-tiered evidentiary hierarchy:
          </p>
        </div>

        <div className="space-y-4">
          {sourcingTiers.map((st) => (
            <div key={st.tier} className={`p-5 border border-gray-200 ${st.color} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-950 uppercase tracking-wide">
                  {st.tier}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white px-2 py-0.5 border border-gray-300">
                  {st.badge}
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 font-sans">
                {st.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Anonymous Sources Protocol */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Protocol Governing Anonymous Sources
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Anonymous sourcing is an extraordinary measure of last resort, subject to rigorous institutional safeguards:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {anonymousRules.map((ar) => (
            <div key={ar.title} className="bg-stone-50 p-4 border border-stone-200 space-y-1.5">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                {ar.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {ar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution & Plagiarism Guidelines */}
      <section className="bg-stone-50 border border-stone-200 p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2 border-b border-stone-200 pb-2">
          <FileText className="w-4 h-4 text-gray-700" />
          <span>Attribution &amp; Fair Use Standards</span>
        </h2>

        <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>Proper Credit to Peer Publications:</strong> When reporting on stories initially uncovered by another news organization, The Dharma Watch always attributes the original scoop prominently in the first two paragraphs, including a direct hyperlink to the original source.
          </p>
          <p>
            <strong>Verbatim Quotations:</strong> Direct quotes are never fabricated, summarized into quotation marks, or altered in a manner that distorts meaning. If audio or video quality is partially unclear, ellipsis <code className="bg-white px-1 font-mono">[...]</code> or bracketed clarifications are explicitly documented.
          </p>
        </div>
      </section>

      {/* Whistleblower Channel Information */}
      <section className="bg-stone-900 text-stone-100 p-6 rounded-lg space-y-3 border border-stone-800">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
            Whistleblower Protection &amp; Cryptographic Intake
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
          Civil servants, law enforcement personnel, and corporate whistleblowers possessing verified evidence of illegality or corruption can submit documents securely via our encrypted channels:
        </p>

        <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-300 pt-2 border-t border-stone-800">
          <span>PGP Ingest: <strong className="text-amber-400">leak@thedharmawatch.in</strong></span>
          <span>•</span>
          <span>Signal: <strong className="text-white">@dharmawatch.01</strong></span>
          <span>•</span>
          <Link to="/contact" className="text-amber-400 hover:underline font-bold">
            Open Secure Tip Intake Vault →
          </Link>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/standards" className="text-gray-600 hover:text-gray-900">
          ← Back to Standards Overview
        </Link>
        <Link to="/corrections" className="text-amber-700 hover:text-amber-900 flex items-center gap-1">
          <span>Public Corrections Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
