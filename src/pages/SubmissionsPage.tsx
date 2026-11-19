import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { FileText, Send, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Submissions & Op-Eds' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Guest Commentary &amp; Pitches
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Contributor Guidelines</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Submissions &amp; Op-Ed Guidelines
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch welcomes well-researched opinion columns, constitutional analyses, and investigative pitches from scholars, legal practitioners, economists, and researchers.
        </p>
      </header>

      {/* Guidelines Box */}
      <section className="bg-stone-50 border border-stone-200 p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wider font-mono">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>What We Look For</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="bg-white p-4 border border-stone-200 rounded space-y-1">
            <strong className="block text-gray-950">Primary-Source Anchored</strong>
            Arguments grounded in statutory law, verified datasets, judicial precedents, or public records rather than unsupported rhetoric.
          </div>
          <div className="bg-white p-4 border border-stone-200 rounded space-y-1">
            <strong className="block text-gray-950">Exclusive &amp; Original</strong>
            We only accept unpublished drafts. Submissions published elsewhere, on personal blogs, or on social platforms will not be considered.
          </div>
          <div className="bg-white p-4 border border-stone-200 rounded space-y-1">
            <strong className="block text-gray-950">Clarity &amp; Precision</strong>
            Rigorous analysis written in clear, dispassionate broadsheet prose accessible to informed citizens and policymakers.
          </div>
        </div>
      </section>

      {/* Submission Criteria */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>1. Submission Specifications</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li><strong>Length:</strong> Op-eds and columns should ideally range between <strong>800 and 1,400 words</strong>. Long-form investigative submissions or academic essays may be up to 2,500 words.</li>
            <li><strong>Format:</strong> Submit complete drafts in plain text, Markdown, or clean document format (.docx / .pdf). Include direct hyperlinks for all citations, statistics, and legal references.</li>
            <li><strong>Author Byline &amp; Bio:</strong> Provide a 2–3 sentence biography detailing your current institutional affiliation, legal standing, or relevant expertise.</li>
            <li><strong>Conflict of Interest Disclosure:</strong> Authors must disclose any financial, professional, or organizational interest in the subject matter.</li>
          </ul>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-600" />
            <span>2. How to Submit Your Pitch</span>
          </h2>
          <p className="text-gray-700">
            Send your draft or pitch directly to our submissions desk:
          </p>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded font-mono text-xs space-y-1">
            <div><strong>The Dharma Watch — Submissions Desk</strong></div>
            <div>Email: <a href="mailto:submissions@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">submissions@thedharmawatch.in</a></div>
            <div>Subject Line Format: <span className="text-gray-600 font-sans">[Op-Ed Submission] Working Headline — Author Name</span></div>
          </div>
          <p className="text-xs text-gray-600">
            Due to volume, we endeavor to review and reply to submissions within 3 to 5 business days. If you do not hear back within 5 business days, you are free to submit your piece elsewhere.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>3. Whistleblower Leaks &amp; Confidential Dossiers</span>
          </h2>
          <p className="text-gray-700">
            If you possess confidential primary evidence, official documents, or whistleblower materials concerning corruption, illegalities, or institutional misconduct, please do <strong>NOT</strong> use the standard submissions email. Instead, utilize our encrypted whistleblower drop:
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
            <span>Signal: <strong className="text-gray-900">@dharmawatch.01</strong></span>
            <span>•</span>
            <span>PGP Ingest: <strong className="text-gray-900">leak@thedharmawatch.in</strong></span>
            <span>•</span>
            <Link to="/contact" className="text-amber-700 font-bold hover:underline">
              Open Secure Intake Vault →
            </Link>
          </div>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/editorial" className="text-gray-600 hover:text-gray-900">
          ← Editorial Independence Charter
        </Link>
        <Link to="/standards" className="text-amber-700 hover:text-amber-900">
          Our Standards →
        </Link>
      </div>
    </div>
  );
};
