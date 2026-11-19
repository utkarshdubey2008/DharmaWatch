import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  ArrowRight, 
  BookOpen, 
  Globe2, 
  Building2, 
  TrendingUp,
  Landmark,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'About Us' },
  ];

  const editorialCoverage = [
    {
      title: 'National & International Affairs',
      desc: 'Diplomatic engagements, foreign policy dynamics, bilateral treaties, and global geopolitical developments impacting India and South Asia.',
      icon: Globe2,
    },
    {
      title: 'Politics & Governance',
      desc: 'Parliamentary proceedings, cabinet decisions, federal-state dynamics, administrative scrutiny, and electoral processes.',
      icon: Building2,
    },
    {
      title: 'Constitutional Accountability & Law',
      desc: 'Supreme Court jurisprudence, High Court rulings, constitutional bench hearings, statutory oversight, and the rule of law.',
      icon: Scale,
    },
    {
      title: 'Investigative Journalism & Primary Records',
      desc: 'In-depth investigative reports grounded in certified First Information Reports (FIRs), chargesheets, RTI disclosures, and official records.',
      icon: FileText,
    },
    {
      title: 'Violence, Persecution & Civil Liberties',
      desc: 'Documenting incidents of communal violence, civil liberty violations, demographic intimidation, and victim statements through verifiable evidence.',
      icon: Eye,
    },
    {
      title: 'Religious Freedom, Temples & Living Heritage',
      desc: 'Ground inquiries into religious freedom, temple governance, historical architectural preservation, sacred heritage, and cultural rights.',
      icon: Landmark,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            About The Publication
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Independent Digital News</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          About The Dharma Watch
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch (DharmaWatch) is an independent digital news publication dedicated to rigorous investigative reporting, primary-source documentation, and constitutional accountability.
        </p>
      </header>

      {/* Institutional Identity & Purpose */}
      <article className="space-y-6 text-gray-800 leading-relaxed">
        <div className="bg-stone-50 border-l-4 border-amber-600 p-5 rounded-r space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-950">
            What DharmaWatch Is
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            The Dharma Watch is an independent digital news publication, comparable in format and ambition to established Indian broadsheet newspapers. It is not a personal blog, not a hobby website, not a registered news agency, not a corporate media house, and not a government-affiliated publication. It is an independently owned and operated digital news publication.
          </p>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-700">
          <p>
            In Indian philosophical and constitutional traditions, <em>Dharma</em> embodies public duty, ethical governance, and the rule of law (*Satya* and *Nyaya*). Under the principle that the law protects those who uphold it, an independent press serves as an indispensable record of public accountability.
          </p>
          <p>
            The publication’s reporting prioritizes evidentiary depth: anchoring reporting in certified court dockets, police filings, Right to Information (RTI) disclosures, legislative records, and corroborated on-the-ground documentation.
          </p>
        </div>

        {/* Editorial Coverage Areas */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Reporting Scope
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
              Key Areas of Editorial Coverage
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editorialCoverage.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ownership & Operation Transparency Notice */}
        <section className="bg-white border border-gray-200 p-6 rounded-lg space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>Ownership, Staffing &amp; Regulatory Status</span>
          </h2>
          <div className="text-xs sm:text-sm text-gray-700 space-y-2 leading-relaxed">
            <p>
              The Dharma Watch is individually owned and managed by its single founder. The publication has no corporate board, external investors, or permanent editorial staff. All current operational expenses are borne personally by the individual owner without institutional funding or commercial advertising revenue.
            </p>
            <p>
              The publication does not claim government accreditation, MIB approval, or news agency registration. In line with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, a clarification request has been formally sent to the Ministry of Information and Broadcasting (MIB) regarding applicable filing requirements for independent digital news publishers, and a response is pending.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              to="/ownership-and-funding" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 font-mono"
            >
              <span>Read Full Ownership &amp; Funding Disclosure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Transparency & Charters Directory */}
        <section className="space-y-3 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
            Editorial Policies &amp; Legal Disclosures
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <Link to="/ownership-and-funding" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Ownership &amp; Funding
            </Link>
            <Link to="/editorial-policy" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Editorial Policy
            </Link>
            <Link to="/standards" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Journalism Standards
            </Link>
            <Link to="/fact-checking" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Fact-Checking Policy
            </Link>
            <Link to="/corrections" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Corrections Ledger
            </Link>
            <Link to="/sources-and-attribution" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Sources &amp; Attribution
            </Link>
            <Link to="/privacy-policy" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Terms of Use
            </Link>
            <Link to="/grievance-redressal" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Grievance Redressal
            </Link>
            <Link to="/ai-usage-policy" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → AI Usage Policy
            </Link>
            <Link to="/disclaimer" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Disclaimer
            </Link>
            <Link to="/contact" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Contact Us
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
};
