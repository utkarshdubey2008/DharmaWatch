import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Scale, Mail, Clock, FileCheck2, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const GrievanceRedressalPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Grievance Redressal' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Editorial Accountability
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Digital Media Ethics Code</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Grievance Redressal Mechanism
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch is committed to fair, responsible, and transparent journalism. This page outlines our formal procedure for receiving, acknowledging, and resolving reader grievances concerning published editorial content.
        </p>
      </header>

      {/* Institutional Context & Status */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Operational &amp; Regulatory Context</span>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
          <p>
            The Dharma Watch is an independently owned and operated digital news publication, managed and directed by its individual owner without corporate parent entities or permanent editorial staff.
          </p>
          <p>
            The publication does not claim government recognition, MIB accreditation, or membership in a self-regulatory body. In relation to the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, a formal clarification request has been submitted to the Ministry of Information and Broadcasting (MIB) regarding the specific filing modalities applicable to independent, single-operator digital news publications, and a formal response is currently pending.
          </p>
          <p>
            Notwithstanding pending administrative clarifications, The Dharma Watch voluntarily maintains this robust internal grievance redressal mechanism to ensure that all legitimate editorial complaints are addressed promptly and in good faith.
          </p>
        </div>
      </section>

      {/* Submission Procedure */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Step 1 */}
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600" />
            <span>1. Grievance Contact Point</span>
          </h2>
          <p className="text-gray-700">
            All editorial grievances relating to news reports, articles, or visual content published on <code className="bg-stone-100 px-1 py-0.5 font-mono text-xs">https://thedharmawatch.in/</code> should be submitted directly to our dedicated Editorial Grievance Desk:
          </p>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded font-mono text-xs space-y-1">
            <div><strong>The Dharma Watch — Editorial Grievance Desk</strong></div>
            <div>Email: <a href="mailto:grievance@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">grievance@thedharmawatch.in</a></div>
            <div>Alternative / Editor Contact: <a href="mailto:editor@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">editor@thedharmawatch.in</a></div>
            <div>Subject Line Format: <span className="text-gray-600 font-sans">[Editorial Grievance] Article Title — URL</span></div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <span>2. Information Required in a Grievance</span>
          </h2>
          <p className="text-gray-700">
            To enable effective investigation and prompt resolution, your communication should include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li><strong>Complainant Details:</strong> Full name, verified email address, and institutional or personal affiliation (if applicable).</li>
            <li><strong>Specific Article URL:</strong> The exact hyperlink to the published story on thedharmawatch.in.</li>
            <li><strong>Precise Passage Objected To:</strong> The specific sentence, quote, paragraph, or visual media item to which the grievance relates.</li>
            <li><strong>Factual Grounds:</strong> A clear, concise statement explaining why the content is believed to be factually inaccurate, defamatory, misleading, or contrary to the Code of Ethics.</li>
            <li><strong>Evidentiary Proof:</strong> Supporting documentary evidence (e.g., official court orders, certified FIR copies, public gazette notifications, or certified records) substantiating the claim.</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>3. Redressal Timelines &amp; Process</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Acknowledgment:</strong> Every grievance submitted with the required details will be formally acknowledged via email within <strong>48 hours</strong> of receipt.
            </p>
            <p>
              <strong>Investigation &amp; Review:</strong> The editor will review the published dispatch against the documentary evidence provided, consult primary sources, and determine whether a factual error, omission, or ethical infringement has occurred.
            </p>
            <p>
              <strong>Decision &amp; Communication:</strong> A reasoned decision will be communicated to the complainant within <strong>15 days</strong> of receipt. Where a factual correction, clarification, or update is warranted, it will be executed promptly on the article and logged in our permanent <Link to="/corrections" className="text-amber-700 font-bold hover:underline">Public Corrections Ledger</Link>.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>4. Minor Typographical Errors vs. Substantive Grievances</span>
          </h2>
          <p className="text-gray-700">
            For minor typographical corrections, spelling errors, or non-material date fixes that do not alter the factual substance of a story, please email our copy desk at{' '}
            <a href="mailto:corrections@thedharmawatch.in" className="text-amber-700 font-bold hover:underline font-mono">
              corrections@thedharmawatch.in
            </a>{' '}
            for immediate attention.
          </p>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/editorial-policy" className="text-gray-600 hover:text-gray-900">
          ← Editorial Standards
        </Link>
        <Link to="/corrections" className="text-amber-700 hover:text-amber-900">
          Public Corrections Ledger →
        </Link>
      </div>
    </div>
  );
};
