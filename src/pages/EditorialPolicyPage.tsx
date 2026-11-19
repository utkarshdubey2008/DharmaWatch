import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, Scale, AlertCircle, ArrowRight } from 'lucide-react';

export const EditorialPolicyPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Standards', path: '/standards' },
    { label: 'Editorial Policy' },
  ];

  const standards = [
    {
      title: '1. Primary Source Verification & Evidentiary Standard',
      desc: 'The Dharma Watch operates on an evidence-first doctrine. We do not publish speculative rumors, unverified leaks, or uncorroborated social media chatter. Investigative reports and news dispatches are anchored in primary public records—including certified First Information Reports (FIRs), chargesheets, judicial remand orders, RTI disclosures, parliamentary transcripts, and verified documentary material.',
    },
    {
      title: '2. Clear Demarcation of News and Opinion',
      desc: 'Readers are entitled to distinguish immediately between verifiable factual reportage and editorial interpretation. Factual news reports maintain an objective, dispassionate tone. Commentary, columnists, and institutional positions are strictly demarcated under "Opinion", "The Dharma View (Editorials)", or "Analysis" with explicit author attribution.',
    },
    {
      title: '3. Fairness, Balance & Right of Reply',
      desc: 'Whenever an article or investigation makes serious factual allegations regarding an individual, corporation, political party, or government body, reasonable efforts are made to solicit a response prior to publication. If a response is received, it is incorporated into the dispatch. If no response is received prior to publication, the report notes that inquiries were sought and remains open for subsequent update.',
    },
    {
      title: '4. Public Corrections & Errata Policy',
      desc: 'Honesty and accountability demand that errors of fact be acknowledged without equivocation. The Dharma Watch does not execute silent edits. When a factual discrepancy is identified, an explicit correction note is appended to the article stating the error, what was amended, and the timestamp of rectification. All corrections are mirrored in our permanent Public Corrections Ledger.',
    },
    {
      title: '5. Confidential Source Protection',
      desc: 'We defend the journalistic principle of confidential sourcing. When individuals risk professional reprisal, legal harassment, or physical danger to expose corruption, illegality, or institutional failure, their confidentiality is preserved with end-to-end security precautions.',
    },
    {
      title: '6. Forensic Media & AI Disinformation Verification',
      desc: 'In an era of synthetic media, generative voice clones, and viral disinformation, our Fact-Check and Media Watch desk applies technical protocols—including reverse image search, audio spectrogram inspection, and comparison against official press releases—before authenticating viral claims.',
    },
    {
      title: '7. Responsible Coverage of Judicial Proceedings & Crime',
      desc: 'In covering ongoing judicial matters (*sub judice*), the publication adheres strictly to verified filings, court proceedings, and judicial orders without prejudging culpability. We strictly adhere to statutory protections prohibiting disclosure of the identity of minors (Juvenile Justice Act) and victims of sexual offences under applicable legal provisions.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Journalistic Charter
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Editorial Policy</span>
        </div>

        <h1 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl text-gray-950 tracking-tight leading-tight">
          Editorial Standards &amp; Verification Policy
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch is committed to evidentiary rigor, constitutional accountability, and journalistic transparency. This policy outlines our operational standards across newsgathering, verification, and correction.
        </p>
      </header>

      {/* Core Principles Grid */}
      <div className="space-y-4">
        {standards.map((s, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-2 hover:border-gray-400 transition-colors shadow-xs"
          >
            <h2 className="font-sans font-bold text-lg sm:text-xl text-gray-900">
              {s.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Corrections Callout */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-3">
        <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span>Reporting Inaccuracies</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
          If you believe a factual assertion in any DharmaWatch report is inaccurate or incomplete, please submit a correction request with supporting primary documents to our editorial desk at <strong className="text-gray-900 font-mono">corrections@thedharmawatch.in</strong>.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider font-mono">
          <Link to="/corrections" className="text-amber-700 hover:text-amber-900">
            View Public Corrections Ledger →
          </Link>
          <Link to="/sources-and-attribution" className="text-gray-900 hover:text-black">
            Sources &amp; Attribution Protocol →
          </Link>
          <Link to="/standards" className="text-gray-600 hover:text-gray-900">
            All Standards &amp; Charters →
          </Link>
        </div>
      </div>
    </div>
  );
};
