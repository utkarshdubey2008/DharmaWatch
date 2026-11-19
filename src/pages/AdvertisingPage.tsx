import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Building2, AlertCircle, FileCheck2, ArrowRight } from 'lucide-react';

export const AdvertisingPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Advertising & Monetisation' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Commercial Standards
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Advertising Policy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Advertising &amp; Commercial Policy
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          This policy details the current commercial status and future advertising standards of The Dharma Watch.
        </p>
      </header>

      {/* Current Operational Status */}
      <section className="bg-amber-50/60 border border-amber-200 p-6 sm:p-8 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Current Operating Status: Self-Funded</span>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-amber-950 leading-relaxed font-sans">
          <p className="font-semibold">
            The Dharma Watch is an independently owned and operated digital news publication, personally funded by its individual owner. All current operating expenses are borne by the owner. The publication does not currently receive external institutional funding, investment or advertising revenue.
          </p>
          <p>
            DharmaWatch operates independently and is not incorporated as a Private Limited company or operated by a registered news agency.
          </p>
          <p>
            The publication does not currently display programmatic banner ads, commercial sponsored articles, or third-party ad network tracking scripts.
          </p>
          <p>
            The publication may explore advertising and other revenue sources in the future.
          </p>
        </div>
      </section>

      {/* Principles Governing Future Advertising */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>1. The Editorial Firewall</span>
          </h2>
          <p className="text-gray-700">
            Editorial independence is absolute. In the event that commercial advertising, corporate notices, or non-tracking sponsorships are accepted in the future, advertisers will have zero influence over story selection, reporting methodology, headline writing, or investigative conclusions. Commercial entities under active investigation will receive no preferential treatment or exemption.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <span>2. Transparent Demarcation &amp; Labeling</span>
          </h2>
          <p className="text-gray-700">
            Any future paid notice, public tender advertisement, or sponsored promotion will be conspicuously and unmistakably labeled with clear tags such as <strong>"Advertisement"</strong> or <strong>"Sponsored Content"</strong>. The Dharma Watch does not publish covert native advertorials disguised as independent journalism.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>3. Reader Privacy &amp; Anti-Tracking Commitment</span>
          </h2>
          <p className="text-gray-700">
            We reject the surveillance capitalism model that characterizes much of modern digital media. If advertising is integrated, The Dharma Watch prioritizes direct, non-tracking, contextual sponsorship over invasive programmatic tracking networks, behavioral cookies, or third-party data broker pixels.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>4. Prohibited Advertising Categories</span>
          </h2>
          <p className="text-gray-700">
            The Dharma Watch will not accept advertising related to illegal goods or services, misleading financial or get-rich-quick schemes, unregulated gambling, hate speech, or content deemed contrary to public decency and statutory legal norms.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide">
            5. Inquiries Regarding Sponsorship &amp; Notices
          </h2>
          <p className="text-gray-700">
            Organizations interested in inquiring about future direct sponsorships or public notices may reach out to:
          </p>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded font-mono text-xs space-y-1">
            <div><strong>The Dharma Watch — Advertising &amp; Sponsorship Inquiries</strong></div>
            <div>Email: <a href="mailto:contact@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">contact@thedharmawatch.in</a></div>
            <div>Website: https://thedharmawatch.in/</div>
          </div>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/ownership-and-funding" className="text-gray-600 hover:text-gray-900">
          ← Ownership &amp; Funding Disclosure
        </Link>
        <Link to="/editorial-policy" className="text-amber-700 hover:text-amber-900">
          Editorial Policy →
        </Link>
      </div>
    </div>
  );
};
