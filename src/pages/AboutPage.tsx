import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  ArrowRight, 
  Globe2, 
  Building2, 
  Landmark,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'About Us' },
  ];

  const editorialCoverage = [
    {
      title: 'National Affairs & Governance',
      desc: 'Cabinet decisions, federal policy, parliamentary legislation, electoral scrutiny, and public administrative accountability.',
      icon: Building2,
    },
    {
      title: 'Constitutional Accountability & Law',
      desc: 'Supreme Court jurisprudence, High Court rulings, constitutional bench hearings, and statutory oversight.',
      icon: Scale,
    },
    {
      title: 'Culture, Spirituality & Living Heritage',
      desc: 'Ground inquiries into religious freedom, sacred architectural preservation, ancient and living traditions, and cultural heritage.',
      icon: Landmark,
    },
    {
      title: 'Investigative Journalism & Primary Records',
      desc: 'In-depth dispatches anchored in certified First Information Reports (FIRs), court dockets, chargesheets, and Right to Information (RTI) disclosures.',
      icon: FileText,
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
          About DharmaWatch
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          DharmaWatch is an independently operated digital news publication based in India, dedicated to substantive reporting on national affairs, governance, culture, spirituality, and constitutional accountability.
        </p>
      </header>

      {/* 2-3 Short Paragraphs on Mission, Purpose, Editorial Approach & Commencement */}
      <article className="space-y-6 text-gray-800 leading-relaxed text-sm sm:text-base">
        <div className="bg-stone-50 border-l-4 border-amber-600 p-6 rounded-r space-y-4">
          <p className="leading-relaxed">
            DharmaWatch is an independently operated digital news publication covering national news, politics, governance, constitutional accountability, culture, spirituality, living heritage, and current affairs. Run by an individual publisher in India, the publication was established to provide thoughtful, evidence-led reporting on the civic, cultural, and political developments shaping modern India.
          </p>

          <p className="leading-relaxed">
            Our editorial approach is anchored in primary documentation, verifiable public records, and on-the-record statements. We prioritize empirical facts, court filings, statutory notices, and investigative depth over viral rumors and unverified social media commentary. Factual news dispatches maintain a strict boundary from opinion, allowing readers to engage with the facts directly and draw informed conclusions.
          </p>

          <p className="leading-relaxed">
            As an independent publication, DharmaWatch operates free from corporate conglomerate ownership, partisan political affiliations, or external institutional directives. We adhere to the core principles of fairness, transparency, and accuracy, maintaining an open door for reader corrections and formal grievance redressal.
          </p>

          {/* Commencement Details */}
          <div className="pt-3 border-t border-stone-200/80 flex items-center gap-2 text-xs font-mono text-gray-600">
            <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
            <span><strong>Commencement of Publication:</strong> September 2026</span>
          </div>
        </div>

        {/* Focus Areas */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Editorial Coverage
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
              Primary Beats &amp; Reporting Scope
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

        {/* Transparency & Charters Directory */}
        <section className="space-y-3 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
            Editorial Charters &amp; Transparency Disclosures
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
            <Link to="/grievance-redressal" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Grievance Redressal
            </Link>
            <Link to="/compliance-report" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Compliance Report
            </Link>
            <Link to="/corrections" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Corrections Ledger
            </Link>
            <Link to="/privacy-policy" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Privacy Policy
            </Link>
            <Link to="/contact" className="p-2.5 bg-stone-50 border border-stone-200 hover:border-amber-600 hover:text-amber-800 transition-colors block">
              → Contact Newsroom
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
};
