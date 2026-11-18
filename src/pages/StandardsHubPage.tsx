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
  Award
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
      badge: 'Charter & Ethics',
      icon: BookOpen,
      desc: 'The constitutional firewall separating news reporting from commentary, staff conflict of interest rules, financial asset disclosures, and reporter conscience protections.',
    },
    {
      title: 'Editorial Policy & Evidentiary Mandate',
      path: '/editorial-policy',
      badge: 'Evidentiary Standard',
      icon: FileText,
      desc: 'Our evidentiary criteria for publishing investigative dispatches, mandatory 48-hour right-of-reply protocol, POCSO legal compliance, and ongoing judicial trial coverage.',
    },
    {
      title: 'Fact-Checking & Media Watch Protocol',
      path: '/fact-checking',
      badge: 'Digital Forensics',
      icon: CheckCircle2,
      desc: 'Multi-tiered authentication protocols for viral disinformation, reverse visual forensics, audio spectrogram validation, and our 5-tier veracity rating system.',
    },
    {
      title: 'Public Corrections Ledger & Errata Protocol',
      path: '/corrections',
      badge: 'Zero Silent Edits',
      icon: Scale,
      desc: 'Our commitment to public accountability. How factual discrepancies are logged, corrected, and permanently published in our public corrections archive.',
    },
    {
      title: 'Sources, Sourcing Pyramid & Attribution Doctrine',
      path: '/sources-and-attribution',
      badge: 'Sourcing Hierarchy',
      icon: Lock,
      desc: 'The strict hierarchy of primary legal filings, rules governing anonymous source approval, dual-editor confirmation, and whistleblower defense shields.',
    },
  ];

  const corePillars = [
    {
      title: '1. Primary Source Anchoring',
      desc: 'We do not publish gossip, single-source uncorroborated leaks, or viral hearsay. Every investigation is substantiated by certified primary documentation: court transcripts, FIRs, RTI replies, or forensic media.',
    },
    {
      title: '2. The 48-Hour Right of Reply',
      desc: 'Fairness is an ethical prerequisite. When investigative reportage touches an individual, public official, or corporation, detailed inquiries are tendered with a reasonable window for substantive reply before publication.',
    },
    {
      title: '3. Zero Silent Edits',
      desc: 'When factual errors occur, we correct them transparently. We never alter text secretly. An explicit correction notice detailing what was altered, why, and the exact timestamp is appended to the report and logged.',
    },
    {
      title: '4. Non-Negotiable Child & Victim Protection',
      desc: 'Strict legal and ethical compliance with Section 74 of the Juvenile Justice Act and Section 228A IPC/BNS. The identity, school, locality, or family details of minors and victims of sexual violence are never disclosed.',
    },
    {
      title: '5. Complete Conflict Disclosure',
      desc: 'Reporters and editors must recuse themselves from stories involving personal, financial, familial, or organizational interests. Staff members are prohibited from accepting gifts, paid travel, or political campaign roles.',
    },
    {
      title: '6. Cryptographic Whistleblower Sanctuary',
      desc: 'We defend the constitutional principle of confidential sourcing. Whistleblowers exposing systemic malpractice or illegalities are shielded with end-to-end client-side encryption and absolute journalistic confidentiality.',
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
          <span className="text-xs text-gray-500 font-mono">Press Council of India Aligned</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Our Standards &amp; Ethical Charter
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch operates on a rigorous evidentiary doctrine. In an era saturated with sensationalism, algorithmic rage, and uncorroborated viral narratives, we adhere to the ancient maxim <em>Satyam Eva Jayate</em>—grounding our journalism in constitutional truth, verifiable public records, and fearless inquiry.
        </p>
      </header>

      {/* Standards Navigation Directory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Dedicated Standards &amp; Policy Charters</span>
          </h2>
          <span className="text-xs font-mono text-gray-400">Complete Protocols</span>
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
            The Six Pillars of DharmaWatch Evidentiary Rigor
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {corePillars.map((pillar) => (
            <div key={pillar.title} className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
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
          If you believe any story published by The Dharma Watch contains a factual inaccuracy or violates our stated standards, we encourage you to file an editorial grievance. Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, all complaints are acknowledged within 24 hours and addressed within 15 days.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
          <span>Grievance Desk: <strong className="text-gray-900">corrections@thedharmawatch.in</strong></span>
          <span>•</span>
          <Link to="/corrections" className="text-amber-700 font-bold hover:underline">
            View Public Corrections Ledger →
          </Link>
        </div>
      </section>
    </div>
  );
};
