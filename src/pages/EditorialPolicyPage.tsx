import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, Scale, AlertCircle } from 'lucide-react';

export const EditorialPolicyPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Newsroom', path: '/' },
    { label: 'Editorial Charter & Standards' },
  ];

  const standards = [
    {
      title: '1. Primary Source Verification & Evidentiary Standard',
      desc: 'DharmaWatch operates on an evidence-first doctrine. We do not publish speculative rumors, anonymous leaks without secondary verification, or uncorroborated social media chatter. Every investigative dispatch and lead news report is anchored in primary records—including certified First Information Reports (FIRs), chargesheets, judicial remand orders, RTI disclosures, parliamentary transcripts, or certified audio-visual recordings.',
    },
    {
      title: '2. Strict Separation of News and Opinion',
      desc: 'Our readers are entitled to distinguish immediately between verifiable factual reportage and editorial interpretation. Factual news reports maintain an objective, dispassionate tone. Commentary, columnists, and institutional positions are strictly demarcated under "Opinion", "The Dharma View (Editorials)", or "Analysis" with explicit author attribution.',
    },
    {
      title: '3. Fairness, Balance & Right of Reply',
      desc: 'Whenever an article or investigation makes serious allegations regarding an individual, corporation, political party, or government institution, our reporters are required to solicit a response prior to publication. If a response is received, it is incorporated fairly into the body of the dispatch. If no response is received before our publication deadline, the report explicitly notes that a response was sought and remains open for update.',
    },
    {
      title: '4. Public Corrections & Permanent Transparency',
      desc: 'Honesty and accountability demand that errors of fact be acknowledged without equivocation. DharmaWatch does not execute silent or stealth edits. When a factual discrepancy is identified, an explicit correction note is appended to the article stating the exact error, what was amended, and the timestamp of rectification. All corrections are mirrored in our permanent Public Corrections Ledger.',
    },
    {
      title: '5. Whistleblower Protection & Source Confidentiality',
      desc: 'We defend the constitutional principle of confidential sourcing. When sources risk professional retribution, legal harassment, or physical danger to expose corruption, illegality, or institutional failure, their identities are safeguarded with end-to-end cryptographic security and legal privilege.',
    },
    {
      title: '6. Forensic Media & AI Disinformation Verification',
      desc: 'In an era of synthetic media, generative voice clones, and viral disinformation, our Fact-Check and Media Watch desk applies rigorous technical protocols—including audio waveform spectral analysis, reverse image search, and verification against official press briefings—before authenticating any viral claim.',
    },
    {
      title: '7. Adherence to Press Council of India Guidelines',
      desc: 'DharmaWatch subscribes to the Journalistic Conduct norms articulated by the Press Council of India. We uphold public decency, respect communal peace and social harmony, avoid sensationalism in reporting criminal matters, and respect the dignity and privacy of victims of crime and minors.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      <header className="border-b-2 border-gray-900 pb-4 space-y-2">
        <div className="text-amber-600 font-extrabold text-[11px] uppercase tracking-wider">
          DharmaWatch Charter
        </div>

        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Editorial Standards &amp; Evidentiary Charter
        </h1>

        <div className="py-2 border-y border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
          <span className="font-bold text-gray-950">
            Documented Evidence • Constitutional Integrity
          </span>
          <span className="text-amber-700 font-semibold uppercase tracking-wider text-[11px]">
            Verified Records • Transparent Ledger
          </span>
        </div>
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
          <span>Spot an Inaccuracy in Our Reporting?</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          If you believe a factual assertion in any DharmaWatch report is inaccurate or outdated, please submit a formal correction request with supporting primary documents to our editorial standards desk at <strong className="text-gray-900 font-mono">corrections@thedharmawatch.in</strong>.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
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
