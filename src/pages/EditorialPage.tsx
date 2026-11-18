import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  BookOpen, 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  Compass,
  ArrowRight
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
      description: 'Strictly factual, evidentiary, dispassionate, and verifiable. Personal sentiment, emotional adjectives, and subjective editorialising are barred from the reportage.',
    },
    {
      label: 'News Analysis & Forensic Audits',
      badge: 'Context-Driven',
      description: 'Expert analysis placing breaking news into legal, constitutional, and economic context. Must be grounded in empirical data, peer-reviewed methodology, and statutory law.',
    },
    {
      label: 'The Dharma View (Institutional Editorials)',
      badge: 'Unsigned Editorial Board',
      description: 'The collective stance of The Dharma Watch Editorial Board on matters of public policy, national security, constitutional justice, and democratic governance.',
    },
    {
      label: 'Columns & Signed Opinion',
      badge: 'Signed Byline',
      description: 'Individual perspectives by named contributing jurists, scholars, and public intellectuals. Opinions expressed belong strictly to the author and do not reflect the newsroom.',
    },
  ];

  const ethicsRules = [
    {
      title: 'Prohibition on Gifts & Paid Junkets',
      desc: 'No staff reporter, correspondent, or editor may accept gifts, subsidized travel, commercial hospitality, or personal favors from any government body, corporation, foreign embassy, or political figure.',
    },
    {
      title: 'Financial & Investment Disclosures',
      desc: 'Reporters covering economic, financial, or corporate sectors must disclose all direct stock holdings, mutual fund participations, and family commercial interests annually to the Managing Editor. Direct trading in covered entities is strictly prohibited.',
    },
    {
      title: 'Political Non-Involvement',
      desc: 'DharmaWatch journalists may not hold formal membership in any political party, donate to election campaigns, sign partisan petitions, or advise candidates seeking public office.',
    },
    {
      title: 'Social Media Professionalism',
      desc: 'Personal social media channels (X, LinkedIn, Meta) reflect on the credibility of the institution. Staff are expected to refrain from public partisan vitriol, personal attacks, or taking definitive public stances on active investigative beats.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Newsroom Governance
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Editorial Independence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Editorial Charter &amp; Independence
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch is founded upon the ironclad principle of editorial independence. Our newsroom operates under a strict separation of news gathering, forensic analysis, and institutional commentary.
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
            Our readers have the constitutional right to distinguish instantly between objective factual reportage and commentary.
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

      {/* The Editorial Board */}
      <section className="bg-stone-50 border border-stone-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2 border-b border-stone-200 pb-2">
          <Users className="w-5 h-5 text-gray-800" />
          <span>The Editorial Board &amp; Institutional Voice</span>
        </h2>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          Unsigned institutional editorials—published under <strong>The Dharma View</strong>—represent the considered, collective stance of The Dharma Watch Editorial Board. The Board meets weekly to deliberate on major legislative enactments, judicial verdicts, foreign policy milestones, and civil liberties challenges.
        </p>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          The Editorial Board operates independently of day-to-day news desk reporters. Reporters covering beats (such as the Supreme Court, Parliament, or the Ministry of Finance) do not participate in editorial board deliberations on those beats, ensuring that their beat reporting remains strictly uninfluenced by institutional opinions.
        </p>
      </section>

      {/* Newsroom Conflict of Interest Code */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Staff Conflict of Interest &amp; Integrity Code</span>
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

      {/* The Reporter Conscience Clause */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 rounded space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
            The Conscience Clause
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
          The Dharma Watch bylaws enshrine a legally binding Conscience Clause for all full-time journalists and contributing reporters. No editor, trustee, or executive may compel a reporter to write, amend, or attach their byline to any story that contradicts their verifiable factual findings or violates their professional journalistic conscience.
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
