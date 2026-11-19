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
  Globe2, 
  Lock, 
  Compass, 
  BookOpen, 
  Eye, 
  Cpu, 
  HelpCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';

export const PublicationHubPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication Overview' },
  ];

  const publicationPillars = [
    {
      title: 'About The Dharma Watch',
      path: '/about',
      badge: 'Editorial Mission',
      icon: Compass,
      description: 'The founding philosophy, reporting priorities, constitutional focus, and broadsheet format of India’s independent digital journal of record.',
    },
    {
      title: 'Ownership & Funding Disclosure',
      path: '/ownership-and-funding',
      badge: 'Ownership & Finance',
      icon: DollarSign,
      description: 'Transparent disclosure: individually owned and operated, personally funded by the owner, zero institutional debt or external equity, and current absence of advertising.',
    },
    {
      title: 'Contact & Inquiries Directory',
      path: '/contact',
      badge: 'Communication Channels',
      icon: Mail,
      description: 'Direct points of contact for editorial inquiries, reader feedback, pitches, corrections, and our encrypted whistleblower intake channels.',
    },
    {
      title: 'Advertising & Monetisation Policy',
      path: '/advertising',
      badge: 'Commercial Standards',
      icon: FileCheck2,
      description: 'Current self-funded status, absence of programmatic tracking networks, and strict editorial separation principles for any future revenue sources.',
    },
    {
      title: 'Submissions & Op-Ed Guidelines',
      path: '/submissions',
      badge: 'Guest Contributors',
      icon: FileText,
      description: 'Guidelines for external jurists, academics, and researchers submitting guest columns, legal analysis, and documentary findings.',
    },
    {
      title: 'Grievance Redressal Mechanism',
      path: '/grievance-redressal',
      badge: 'Digital Ethics & Redressal',
      icon: Scale,
      description: 'Formal mechanism for addressing reader grievances regarding published editorial content under applicable Indian digital media norms.',
    },
  ];

  const standardsPillars = [
    {
      title: 'Journalism Standards & Ethics',
      path: '/standards',
      badge: 'Core Principles',
      icon: ShieldCheck,
      description: 'The master code of journalistic conduct: primary-source evidence, fairness, right of reply, victim protection, and conflict avoidance.',
    },
    {
      title: 'Editorial Independence Charter',
      path: '/editorial',
      badge: 'News vs. Opinion',
      icon: BookOpen,
      description: 'Clear demarcation between objective news reporting, forensic analysis, institutional editorials, and signed opinions.',
    },
    {
      title: 'Editorial Policy & Evidentiary Mandate',
      path: '/editorial-policy',
      badge: 'Verification Doctrine',
      icon: FileText,
      description: 'Mandatory primary-document substantiation, right-of-reply protocols, legal compliance regarding ongoing trials, and protection of minors.',
    },
    {
      title: 'Fact-Checking & Media Watch Protocol',
      path: '/fact-checking',
      badge: 'Forensic Rigor',
      icon: CheckCircle2,
      description: 'Multi-source forensic authentication, reverse visual search, audio spectrogram validation, and our five-tier veracity rating taxonomy.',
    },
    {
      title: 'Public Corrections Ledger',
      path: '/corrections',
      badge: 'Zero Silent Edits',
      icon: Scale,
      description: 'Transparent public record of all factual corrections, how readers can report discrepancies, and our commitment to clear accountability.',
    },
    {
      title: 'Sources & Attribution Doctrine',
      path: '/sources-and-attribution',
      badge: 'Evidence Hierarchy',
      icon: Lock,
      description: 'Three-tiered evidence pyramid, strict rules governing anonymous sources, attribution protocols, and confidential source protections.',
    },
    {
      title: 'AI Usage & Synthetic Media Policy',
      path: '/ai-usage-policy',
      badge: 'Technology & AI',
      icon: Cpu,
      description: 'Human-authored editorial reporting commitment, strict safeguards against synthetic text, and rules for forensic AI detection.',
    },
    {
      title: 'General Disclaimer',
      path: '/disclaimer',
      badge: 'Legal Disclosures',
      icon: HelpCircle,
      description: 'Informational public-interest nature of dispatches, limitation of liability, and third-party public records disclaimers.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Hero Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Transparency Directory
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">The Dharma Watch</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Publication &amp; Standards Directory
        </h1>

        <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed font-sans">
          The Dharma Watch operates as an independent digital news publication. Built upon evidentiary discipline, primary public records, and constitutional accountability, we maintain complete transparency regarding our ownership, funding, editorial standards, and legal policies.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
          <span><strong>Format:</strong> Independent Digital Broadsheet</span>
          <span>•</span>
          <span><strong>Operation:</strong> Individually Owned &amp; Operated</span>
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
              Publication Operations &amp; Disclosures
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500">Section 1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicationPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link 
                to={pillar.path}
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

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-amber-600">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Part 2: Journalistic Standards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Journalistic Charters &amp; Verification Protocols
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500">Section 2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {standardsPillars.map((std) => {
            const Icon = std.icon;
            return (
              <Link 
                to={std.path}
                key={std.path}
                className="bg-white border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-900 hover:shadow-md transition-all group space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-stone-100 rounded text-gray-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-50 text-stone-700 px-2 py-0.5 border border-stone-200">
                      {std.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-amber-700 transition-colors">
                    {std.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {std.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-amber-600">
                  <span>Read Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Part 3: Legal & Regulatory Notes */}
      <section className="bg-stone-50 border border-stone-200 p-6 sm:p-8 rounded-lg space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-stone-200 pb-2">
          Regulatory Status &amp; Compliance Notes
        </h2>
        <div className="text-xs sm:text-sm text-gray-700 space-y-2 leading-relaxed">
          <p>
            The Dharma Watch is an independently owned and managed digital publication. It is not incorporated as a corporate entity and does not operate as a registered news agency.
          </p>
          <p>
            The publication does not claim government certification or formal MIB accreditation. A clarification request has been formally submitted to the Ministry of Information and Broadcasting (MIB) regarding the applicability of digital publisher guidelines under the IT Rules, 2021 to single-operator digital news publications, and a response is currently pending.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
          <Link to="/ownership-and-funding" className="text-amber-700 font-bold hover:underline">
            Ownership Disclosure →
          </Link>
          <Link to="/grievance-redressal" className="text-amber-700 font-bold hover:underline">
            Grievance Redressal →
          </Link>
          <Link to="/privacy-policy" className="text-amber-700 font-bold hover:underline">
            Privacy Policy →
          </Link>
          <Link to="/terms-of-use" className="text-amber-700 font-bold hover:underline">
            Terms of Use →
          </Link>
        </div>
      </section>
    </div>
  );
};
