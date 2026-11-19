import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  AlertCircle,
  ArrowRight,
  Eye,
  Award,
  Cpu,
  HelpCircle
} from 'lucide-react';

export const StandardsHubPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Our Standards & Ethics' },
  ];

  const standardsSections = [
    {
      title: 'Editorial Independence Charter',
      path: '/editorial',
      badge: 'News vs. Opinion',
      icon: BookOpen,
      desc: 'The clear structural separation between objective news reporting, forensic analysis, institutional editorials, and signed opinion columns.',
    },
    {
      title: 'Editorial Policy & Evidentiary Mandate',
      path: '/editorial-policy',
      badge: 'Evidentiary Standard',
      icon: FileText,
      desc: 'Our evidentiary criteria for publishing investigative reports, right-of-reply protocol, POCSO and minor protection, and ongoing judicial trial reporting rules.',
    },
    {
      title: 'Fact-Checking & Media Watch Protocol',
      path: '/fact-checking',
      badge: 'Forensic Verification',
      icon: CheckCircle2,
      desc: 'Verification methodology for viral claims, reverse visual search, audio spectrogram validation, and our five-tier veracity rating system.',
    },
    {
      title: 'Public Corrections Ledger & Errata Protocol',
      path: '/corrections',
      badge: 'Zero Silent Edits',
      icon: Scale,
      desc: 'Our commitment to public accountability. How factual discrepancies are logged, corrected, and permanently published in our public corrections archive.',
    },
    {
      title: 'Sources & Attribution Doctrine',
      path: '/sources-and-attribution',
      badge: 'Evidence Hierarchy',
      icon: Lock,
      desc: 'The strict hierarchy of primary legal filings, rules governing anonymous source approval, secondary corroboration, and confidential source protections.',
    },
    {
      title: 'AI Usage & Synthetic Media Policy',
      path: '/ai-usage-policy',
      badge: 'AI & Synthesis',
      icon: Cpu,
      desc: 'Our commitment to human reporting, clear labeling of any AI-assisted tools, and forensic interrogation of synthetic deepfakes.',
    },
  ];

  const corePillars = [
    {
      title: '1. Primary Source Anchoring',
      desc: 'We do not publish unverified gossip, single-source uncorroborated leaks, or viral hearsay. Reporting is anchored in certified primary documentation: court records, police filings, RTI disclosures, or verified documentary media.',
    },
    {
      title: '2. Fair Inquiries & Right of Reply',
      desc: 'When investigative reporting raises specific allegations regarding an individual, public official, or corporation, reasonable inquiries are tendered with an appropriate window for response prior to publication.',
    },
    {
      title: '3. Zero Silent Edits',
      desc: 'When factual errors occur, we correct them transparently. We do not alter text secretly. An explicit correction notice detailing what was altered, why, and the timestamp is logged and appended to the report.',
    },
    {
      title: '4. Non-Negotiable Child & Victim Protection',
      desc: 'Strict legal and ethical compliance with the Juvenile Justice Act and statutory privacy provisions. The identity, school, locality, or family details of minors and victims of sexual violence are never disclosed.',
    },
    {
      title: '5. Conflict of Interest Disclosure',
      desc: 'The publication maintains a strict policy against conflicts of interest. Writers and contributors must disclose any personal, commercial, or organizational interest in subjects they report upon.',
    },
    {
      title: '6. Confidential Source Protection',
      desc: 'We respect and defend the principle of confidential sourcing when individuals risk retaliation to expose corruption, malpractice, or illegality.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Journalistic Code of Integrity
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Editorial Standards</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Journalism Standards &amp; Ethical Principles
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch operates on a rigorous evidentiary doctrine. In an era of algorithmic noise, viral rumors, and unverified assertions, we adhere to foundational journalistic discipline—grounding our reporting in verified public records, constitutional fidelity, and factual precision.
        </p>
      </header>

      {/* Standards Navigation Directory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Dedicated Charters &amp; Policy Protocols</span>
          </h2>
          <span className="text-xs font-mono text-gray-400">Policy Charters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standardsSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link 
                key={sec.path} 
                to={sec.path}
                className="bg-white border border-gray-200 p-5 hover:border-gray-900 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-stone-100 rounded text-gray-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-50 text-stone-700 px-2 py-0.5 border border-stone-200">
                      {sec.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-amber-600">
                  <span>Read Detailed Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* The 6 Core Pillars */}
      <section className="bg-stone-50 border border-stone-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-stone-200 pb-3">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-700 block mb-1">Evidentiary Doctrine</span>
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide">
            The Six Pillars of DharmaWatch Evidentiary Discipline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {corePillars.map((pillar) => (
            <div key={pillar.title} className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{pillar.title}</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed pl-5 font-sans">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Reader Recourse & Grievance Redressal */}
      <section className="bg-white border border-gray-200 p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-600" />
          <span>Reader Oversight &amp; Grievance Redressal</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          If you believe any story published on The Dharma Watch contains a factual inaccuracy or ethical concern, we encourage you to file an editorial correction request or formal grievance. All communications are reviewed promptly.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
          <span>Corrections: <strong className="text-gray-900">corrections@thedharmawatch.in</strong></span>
          <span>•</span>
          <span>Grievances: <strong className="text-gray-900">grievance@thedharmawatch.in</strong></span>
          <span>•</span>
          <Link to="/grievance-redressal" className="text-amber-700 font-bold hover:underline">
            Grievance Redressal Procedure →
          </Link>
        </div>
      </section>
    </div>
  );
};
