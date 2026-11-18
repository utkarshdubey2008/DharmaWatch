import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Globe2, 
  Lock, 
  Compass, 
  BookOpen,
  DollarSign
} from 'lucide-react';

export const PublicationHubPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication Overview' },
  ];

  const publicationPillars = [
    {
      title: 'About Us & Institutional Mission',
      path: '/about',
      badge: 'Mission & Charter',
      icon: Compass,
      description: 'Why The Dharma Watch exists: our founding philosophy, commitment to constitutional accountability, investigative journalism of courage, and role as India’s archival journal of record.',
    },
    {
      title: 'Ownership & Funding Transparency',
      path: '/ownership-and-funding',
      badge: 'Governance & Finance',
      icon: DollarSign,
      description: 'Complete transparency regarding legal entity structure, zero corporate debt, non-partisan charitable governance, reader subscription revenue, and our strict donor non-interference firewall.',
    },
    {
      title: 'Contact Newsroom & Public Desks',
      path: '/contact',
      badge: '11 Public & Private Desks',
      icon: Mail,
      description: 'Direct institutional access to all editorial desks, grievance redressal officers, RTI filing coordination, and the cryptographically secure whistleblower intake vault.',
    },
  ];

  const standardsPillars = [
    {
      title: 'Our Standards & Code of Ethics',
      path: '/standards',
      badge: 'Core Code of Conduct',
      icon: ShieldCheck,
      description: 'The master charter governing journalistic integrity, conflicts of interest, harm minimization, and compliance with the Press Council of India standards.',
    },
    {
      title: 'Editorial Independence Charter',
      path: '/editorial',
      badge: 'News vs. Opinion',
      icon: BookOpen,
      description: 'Strict separation of news reporting from institutional commentary, the editorial board governance model, and reporter conscience protections.',
    },
    {
      title: 'Editorial Policy & Evidentiary Standards',
      path: '/editorial-policy',
      badge: 'Evidentiary Doctrine',
      icon: FileText,
      description: 'Mandatory primary document verification, 48-hour right-of-reply protocol, POCSO legal compliance, and rules for reporting on ongoing judicial trials.',
    },
    {
      title: 'Fact-Checking & Media Watch Methodology',
      path: '/fact-checking',
      badge: 'Digital Forensics',
      icon: CheckCircle2,
      description: 'Multi-source forensic authentication, reverse visual search, audio spectrogram analysis, and our 5-tier veracity rating taxonomy.',
    },
    {
      title: 'Public Corrections Ledger & Errata Protocol',
      path: '/corrections',
      badge: 'Zero Silent Edits',
      icon: Scale,
      description: 'Transparent public record of all editorial rectifications, how readers can request corrections, and our permanent accountability ledger.',
    },
    {
      title: 'Sources & Attribution Doctrine',
      path: '/sources-and-attribution',
      badge: 'Evidence Hierarchy',
      icon: Lock,
      description: 'Primary source hierarchy, anonymous sourcing rules, dual-editor verification protocols, and whistleblower legal shield protections.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Hero Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Institutional Transparency Directory
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">The Dharma Watch Foundation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Publication &amp; Standards Hub
        </h1>

        <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed">
          The Dharma Watch operates as an independent broadsheet newspaper and national journal of record. Built on an unyielding evidentiary standard, we publish our governance charters, funding records, ethical codes, and editorial protocols openly.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
          <span><strong>Established:</strong> New Delhi, India</span>
          <span>•</span>
          <span><strong>Governance:</strong> Independent Non-Profit Trust</span>
          <span>•</span>
          <span className="text-amber-800 font-serif italic">सत्यमेव जयते — Truth Alone Triumphs</span>
        </div>
      </header>

      {/* Part 1: Publication Governance */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Publication Governance &amp; Desks
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500">Pillar 1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicationPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.path}
                className="bg-white border border-gray-200 p-6 flex flex-col justify-between hover:border-gray-900 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-gray-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 border border-gray-200">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-gray-100">
                  <Link 
                    to={pillar.path}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    <span>Read Full Documentation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Part 2: Journalistic Standards & Ethics */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Journalistic Standards, Ethics &amp; Verification
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500">Pillar 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardsPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.path}
                className="bg-white border border-gray-200 p-6 flex flex-col justify-between hover:border-amber-600 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded bg-amber-50 flex items-center justify-center text-amber-700 group-hover:bg-gray-950 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link 
                    to={pillar.path}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    <span>View Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Institutional Callout / Summary Box */}
      <section className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-lg space-y-4 border border-stone-800">
        <div className="flex items-center gap-2 text-amber-400">
          <Scale className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
            Commitment to Public Accountability
          </h3>
        </div>

        <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
          The Dharma Watch operates without corporate debt, private equity ownership, or political party subsidies. All primary investigative dossiers, judicial dockets, and research datasets are preserved in immutable public archives for historical posterity and civic auditing.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-stone-400">
          <span>Public Tip Line: <strong className="text-white">tips@thedharmawatch.in</strong></span>
          <span>•</span>
          <span>Legal &amp; Privacy: <strong className="text-white">privacy@thedharmawatch.in</strong></span>
          <span>•</span>
          <span>Corrections Desk: <strong className="text-white">corrections@thedharmawatch.in</strong></span>
        </div>
      </section>
    </div>
  );
};
