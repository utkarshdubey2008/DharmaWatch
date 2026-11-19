import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  ShieldCheck, 
  User, 
  HelpCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const OwnershipFundingPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Ownership & Funding' },
  ];

  const facts = [
    {
      label: 'Publication Name',
      value: 'The Dharma Watch (DharmaWatch)',
      detail: 'Independent digital news publication',
    },
    {
      label: 'Website Domain',
      value: 'https://thedharmawatch.in/',
      detail: 'Official online home of the publication',
    },
    {
      label: 'Ownership Structure',
      value: 'Individually Owned',
      detail: 'Owned by a single private individual',
    },
    {
      label: 'Operational Management',
      value: 'Single Operator',
      detail: 'Managed and directed by its individual owner',
    },
    {
      label: 'Current Funding',
      value: 'Personally Funded',
      detail: 'All operating costs currently borne by the owner',
    },
    {
      label: 'Corporate Entity Status',
      value: 'Unincorporated Independent Venture',
      detail: 'Not incorporated as a Private Limited company',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Institutional Transparency
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Public Disclosures</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Ownership &amp; Funding Disclosure
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch believes that transparency regarding ownership and operating finances is vital for maintaining reader trust. This disclosure sets forth our exact operational, legal, and financial status.
        </p>
      </header>

      {/* Primary Statement */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 sm:p-8 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
            Official Ownership &amp; Funding Statement
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-900 leading-relaxed font-sans">
          <p className="font-medium">
            The Dharma Watch is an independently owned and operated digital news publication, personally funded by its individual owner. All current operating expenses are borne by the owner. The publication does not currently receive external institutional funding, investment or advertising revenue.
          </p>
          <p>
            DharmaWatch operates independently and is not incorporated as a Private Limited company or operated by a registered news agency.
          </p>
          <p>
            The publication may explore advertising and other revenue sources in the future.
          </p>
        </div>
      </section>

      {/* Key Facts Summary */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950">
            Structure at a Glance
          </h2>
          <span className="text-xs font-mono text-gray-400">Current Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {facts.map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 p-4 rounded space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-gray-500 block">
                {item.label}
              </span>
              <span className="text-sm font-bold text-gray-950 block">
                {item.value}
              </span>
              <p className="text-xs text-gray-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Operational Clarifications */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 border-b border-gray-100 pb-3">
          Detailed Transparency Clarifications
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed divide-y divide-gray-100">
          <div className="pt-3 first:pt-0 space-y-1">
            <h3 className="font-bold text-gray-950">1. Individual Operation</h3>
            <p>
              The Dharma Watch is managed and operated by its single individual founder. The publication has no employees or permanent editorial staff. Independent contributors or columnists who write for the publication do so on a freelance or guest submission basis.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-gray-950">2. No External Investors or Debt</h3>
            <p>
              The publication does not have outside equity investors, venture capital backing, charitable grants, corporate debt, or institutional loans. Operating expenses (such as domain registration, cloud hosting, and technical infrastructure) are fully financed through the owner’s personal resources.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-gray-950">3. Current Absence of Advertising &amp; Future Plans</h3>
            <p>
              The website currently does not host commercial display advertisements, programmatic ad network scripts, sponsored articles, or paid government notices. To sustain operations over the long term, The Dharma Watch may explore advertising, reader subscriptions, or syndication in the future. Should advertising or sponsorship be introduced, it will be strictly demarcated and will carry no editorial influence.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-gray-950">4. Regulatory &amp; Ministry of Information and Broadcasting (MIB) Status</h3>
            <p>
              The Dharma Watch does not claim registration as a formal news agency, accredited media house, or MIB-approved entity. In accordance with Indian regulatory norms regarding digital news publishers under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, a clarification request has been formally submitted to the Ministry of Information and Broadcasting (MIB) regarding applicable filing requirements for independent single-operator digital news publications, and a formal response is currently pending.
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Inquiries */}
      <section className="bg-stone-50 border border-stone-200 p-6 rounded space-y-3">
        <div className="flex items-center gap-2 text-stone-900">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Questions Regarding Ownership &amp; Operations
          </h2>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          For legitimate inquiries concerning our ownership disclosures, operational model, or editorial integrity, please write to{' '}
          <a href="mailto:contact@thedharmawatch.in" className="text-amber-700 font-bold hover:underline font-mono">
            contact@thedharmawatch.in
          </a>.
        </p>
      </section>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/about" className="text-gray-600 hover:text-gray-900">
          ← About The Dharma Watch
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/publication" className="text-amber-700 hover:text-amber-900">
            Publication Overview →
          </Link>
          <Link to="/standards" className="text-gray-900 hover:text-black">
            Our Standards →
          </Link>
        </div>
      </div>
    </div>
  );
};
