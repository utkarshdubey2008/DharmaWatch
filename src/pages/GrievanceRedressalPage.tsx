import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Scale, Mail, Clock, FileCheck2, AlertCircle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const GrievanceRedressalPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Grievance Redressal Policy' },
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
          Grievance Redressal Policy
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          DharmaWatch is committed to accurate, ethical, and responsible journalism. This policy outlines how readers can report factual errors, complaints, or content concerns regarding published material.
        </p>

        {/* Regulatory context statement */}
        <p className="text-xs text-gray-600 font-medium pt-1 border-t border-gray-100">
          This mechanism exists in line with the Digital Media Ethics Code under India&apos;s Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
        </p>
      </header>

      {/* Grievance Officer Contact Box */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
          <Scale className="w-4 h-4 text-amber-700" />
          <span>Designated Grievance Officer</span>
        </div>

        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-sans">
          Any reader, individual, or entity wishing to report a factual error, complaint, or content concern regarding articles published on DharmaWatch may submit their grievance directly to our designated Grievance Officer:
        </p>

        <div className="p-4 bg-white border border-amber-200/80 rounded font-mono text-xs space-y-1.5">
          <div><strong className="text-gray-900">Name:</strong> Shubham</div>
          <div><strong className="text-gray-900">Designation:</strong> Grievance Officer</div>
          <div><strong className="text-gray-900">Email:</strong> <a href="mailto:grievance@TheDharmaWatch.in" className="text-amber-700 font-bold hover:underline">grievance@TheDharmaWatch.in</a></div>
          <div className="text-[11px] text-gray-500 font-sans pt-1">
            (Email is the sole point of contact for grievance submissions.)
          </div>
        </div>
      </section>

      {/* How to Report & Requirements */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Section 1: Filing Instructions */}
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <span>1. How to Report a Grievance or Factual Error</span>
          </h2>
          <p className="text-gray-700">
            To submit a complaint, email <a href="mailto:grievance@TheDharmaWatch.in" className="text-amber-700 font-bold font-mono hover:underline">grievance@TheDharmaWatch.in</a> with the subject line <strong>&quot;Editorial Grievance - [Article Title / URL]&quot;</strong>. To facilitate review, your email should include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li><strong>Complainant Information:</strong> Your full name and verified contact email address.</li>
            <li><strong>Article URL:</strong> The exact web link to the story or content in question on thedharmawatch.in.</li>
            <li><strong>Specific Content in Issue:</strong> The precise text, headline, quote, or media element objected to.</li>
            <li><strong>Nature of Concern:</strong> A clear explanation of the factual error, ethical concern, or legal objection.</li>
            <li><strong>Supporting Material:</strong> Any primary documentation, certified court records, or verifiable evidence supporting your request.</li>
          </ul>
        </div>

        {/* Section 2: Combined Timeline Commitment */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>2. Grievance Review &amp; Resolution Timeline</span>
          </h2>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-gray-950">
              Grievances will be reviewed and resolved within 15 days of receipt.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              All communications sent to the Grievance Officer are reviewed in accordance with this 15-day timeline, which represents the maximum outer period provided under the applicable regulatory framework.
            </p>
          </div>
        </div>

        {/* Section 3: Discretionary Corrective Action */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>3. Discretionary Corrective Action</span>
          </h2>
          <p className="text-gray-700">
            DharmaWatch reviews every complaint and takes corrective action (correction, clarification, or removal) where warranted, at its own discretion.
          </p>
          <p className="text-gray-700">
            If a factual discrepancy is verified, the article will be updated with an explicit, timestamped correction note. When appropriate, corrections are mirrored in our publicly accessible <Link to="/corrections" className="text-amber-700 font-bold hover:underline">Public Corrections Ledger</Link>.
          </p>
        </div>

        {/* Section 4: Monthly Compliance Reporting */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>4. Monthly Compliance Disclosures</span>
          </h2>
          <p className="text-gray-700">
            In compliance with applicable rules, DharmaWatch maintains and publishes monthly compliance statements detailing the total number of grievances received, resolved, and pending during each monthly reporting period.
          </p>
          <div className="pt-1">
            <Link
              to="/compliance-report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-colors font-mono"
            >
              <span>View Monthly Compliance Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/about" className="text-gray-600 hover:text-gray-900">
          ← About DharmaWatch
        </Link>
        <Link to="/compliance-report" className="text-amber-700 hover:text-amber-900">
          Monthly Compliance Report →
        </Link>
      </div>
    </div>
  );
};
