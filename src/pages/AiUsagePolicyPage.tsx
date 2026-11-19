import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Eye, FileText, Lock } from 'lucide-react';

export const AiUsagePolicyPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Standards', path: '/standards' },
    { label: 'AI Usage Policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Technology &amp; Editorial Ethics
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Artificial Intelligence Charter</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          AI Usage &amp; Synthetic Media Policy
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          In an era where generative artificial intelligence can mass-produce text, synthesize human voices, and manufacture realistic imagery, The Dharma Watch establishes strict guidelines governing the responsible use and forensic scrutiny of artificial intelligence.
        </p>
      </header>

      {/* Core Principle Banner */}
      <section className="bg-stone-50 border-l-4 border-amber-600 p-6 rounded-r space-y-2">
        <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span>Core Editorial Commitment: Human Journalism</span>
        </h2>
        <p className="text-sm text-gray-800 leading-relaxed font-sans">
          All news dispatches, investigative reports, political analysis, and editorials published on The Dharma Watch are researched, written, and fact-checked by human editorial judgment. We do not publish automated, unverified, or AI-generated news articles.
        </p>
      </section>

      {/* Content Breakdown */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Section 1 */}
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Permitted Uses of Technical AI Tools</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              We recognize that computational and automated tools can assist journalists in managing data and improving efficiency. Permissible uses include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Audio Transcription:</strong> Automated speech-to-text tools may be used to transcribe recorded press conferences and interviews, subject to mandatory human audio verification before quoting.</li>
              <li><strong>Copy Editing &amp; Grammar Assistance:</strong> Standard spelling, syntax, and grammar verification utilities to assist the editing workflow.</li>
              <li><strong>Large-Scale Data Organization:</strong> Natural language and optical character recognition (OCR) tools used to search large, public document dumps or scanned RTI disclosures.</li>
              <li><strong>Technical Development:</strong> Software engineering and web optimization tools used to maintain site security, build search indexes, and improve performance.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>2. Strictly Prohibited Uses</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li><strong>No Synthetic Reporting:</strong> We strictly prohibit using generative models to write stories, fabricate quotes, or draft dispatches presented as on-the-ground news reporting.</li>
            <li><strong>No Photorealistic Fakes:</strong> We do not publish AI-generated photorealistic images depicted as actual news photography or eyewitness evidence.</li>
            <li><strong>No Automated Fact-Checking:</strong> Algorithmic tools do not replace manual, primary-record verification in our Fact-Check and Media Watch investigations.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>3. Forensic Scrutiny of AI Disinformation</span>
          </h2>
          <p className="text-gray-700">
            A core responsibility of modern broadsheet journalism is interrogating synthetic media. When examining viral clips, audio recordings, or visual memes, our Media Watch desk utilizes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li>Audio spectrogram and waveform analysis to detect synthetic vocoder artifacts, artificial cadence, and neural clone signatures.</li>
            <li>Visual keyframe and error level analysis (ELA) to identify diffusion patterns, facial blending seams, and inconsistent physics.</li>
            <li>Primary record triangulation: cross-checking claims against official verbatim transcripts, certified video feeds, and on-the-record eyewitness accounts.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>4. Data Scraping &amp; AI Model Training Restrictions</span>
          </h2>
          <p className="text-gray-700">
            Original investigative journalism published on The Dharma Watch represents substantial human effort and proprietary copyright. We prohibit the automated scraping, harvesting, or bulk ingestion of our articles, case files, or datasets for commercial AI model training or commercial derivative services without prior written permission.
          </p>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/fact-checking" className="text-gray-600 hover:text-gray-900">
          ← Fact-Checking Methodology
        </Link>
        <Link to="/standards" className="text-amber-700 hover:text-amber-900">
          Our Standards Overview →
        </Link>
      </div>
    </div>
  );
};
