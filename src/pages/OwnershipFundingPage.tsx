import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  PieChart, 
  FileCheck2, 
  Scale, 
  Lock, 
  HelpCircle,
  ExternalLink,
  Award
} from 'lucide-react';

export const OwnershipFundingPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Publication', path: '/publication' },
    { label: 'Ownership & Funding' },
  ];

  const revenueStreams = [
    {
      source: 'Reader Subscriptions & Voluntary Contributions',
      percentage: '62%',
      description: 'The foundation of our financial independence. Direct monthly and annual subscriptions from individual citizens, researchers, and legal practitioners across India and the global diaspora.',
      icon: DollarSign,
      color: 'bg-emerald-600',
    },
    {
      source: 'Non-Partisan Philanthropic & Academic Research Grants',
      percentage: '26%',
      description: 'Restricted and unrestricted grants from public charitable trusts and academic endowments dedicated to judicial record digitisation, environmental audits, and heritage preservation.',
      icon: Award,
      color: 'bg-amber-600',
    },
    {
      source: 'Direct Contextual Non-Tracking Advertising & Reprints',
      percentage: '12%',
      description: 'Direct corporate notices, public tender announcements, and syndication wire licenses. We do not deploy behavioral ad trackers, surveillance scripts, or third-party programmatic networks.',
      icon: Building2,
      color: 'bg-stone-700',
    },
  ];

  const firewallRules = [
    {
      title: '1. Strict 5% Donor Cap Policy',
      desc: 'To prevent undue institutional leverage, no single individual, family, foundation, or institutional benefactor is permitted to contribute more than 5% of The Dharma Watch’s total annual operating expenditure in any single financial year.',
    },
    {
      title: '2. The Legal Editorial Firewall',
      desc: 'All donors, subscribers, and advertisers explicitly sign an irrevocable waiver of editorial involvement. Financial contribution confers zero right to review drafts, alter headlines, suggest investigative targets, or suppress verified findings.',
    },
    {
      title: '3. Rejection of Corporate Debt & Private Equity',
      desc: 'The Dharma Watch operates entirely without venture capital equity, private equity debt, or bank credit lines that could subject our newsroom to creditor pressure or liquidation threats from commercial interests.',
    },
    {
      title: '4. Absolute Prohibition on Political Party Funding',
      desc: 'Under our statutory trust bylaws, The Dharma Watch does not accept funds, donations, advertising, or sponsored content from registered political parties, partisan political action committees, or election candidates.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Financial Transparency &amp; Ownership
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Statutory Disclosures</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Ownership, Governance &amp; Funding
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          Editorial independence is inseparable from financial transparency. The Dharma Watch is organized as a mission-driven public trust designed to insulate investigative journalism from commercial blackmail, political coercion, and oligarchic monopoly.
        </p>
      </header>

      {/* Legal Structure & Ownership Overview */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
          <Building2 className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
            Legal Entity &amp; Institutional Governance
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-gray-800 leading-relaxed">
          <p>
            <strong>The Dharma Watch</strong> is published by <strong>The Dharma Watch Foundation</strong>, an autonomous, non-profit public charitable trust registered in New Delhi, India. The Foundation is governed by a permanent Board of Trustees comprising senior constitutional jurists, veteran broadsheet editors, academic historians, and forensic accountants.
          </p>
          <p>
            Unlike conventional corporate media entities owned by industrial conglomerates or publicly listed conglomerates with conflicting cross-holdings, The Dharma Watch has no equity shareholders, distributes no private dividends, and answers solely to the constitutional mandate of public interest journalism.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs font-mono">
          <div className="bg-stone-50 p-3 border border-stone-200">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Registration</span>
            <span className="font-bold text-gray-900">Public Media Trust (New Delhi)</span>
          </div>
          <div className="bg-stone-50 p-3 border border-stone-200">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Ownership Model</span>
            <span className="font-bold text-gray-900">100% Non-Profit Trust Owned</span>
          </div>
          <div className="bg-stone-50 p-3 border border-stone-200">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Financial Audit</span>
            <span className="font-bold text-emerald-700">Annual Statutory Audit Conducted</span>
          </div>
        </div>
      </section>

      {/* Revenue Model Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
              Annual Operating Revenue Model
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-500">FY 2026–2027 Projections</span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Our financial model is diversified to guarantee that no single revenue stream can jeopardize our newsroom operations or influence our investigatory agenda:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {revenueStreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <div key={stream.source} className="bg-white border border-gray-200 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-gray-950">
                      {stream.percentage}
                    </span>
                    <div className="p-2 bg-stone-100 rounded text-gray-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    {stream.source}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {stream.description}
                  </p>
                </div>

                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${stream.color}`} style={{ width: stream.percentage }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Editorial Firewall */}
      <section className="bg-stone-50 border border-stone-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950">
            The Editorial Firewall &amp; Donor Protections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {firewallRules.map((rule) => (
            <div key={rule.title} className="bg-white p-4 border border-stone-200 space-y-1.5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide text-amber-800">
                {rule.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Statutory Disclosures & Compliance Inquiries */}
      <section className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Scale className="w-4 h-4 text-gray-600" />
          <span>Statutory Audits &amp; Public Inquiries</span>
        </h2>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          In compliance with Indian public trust regulations and international non-profit journalism transparency standards, our audited balance sheets and annual programmatic disclosures are prepared by independent statutory chartered accountants and submitted to public regulatory authorities.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50 p-4 border border-stone-200 font-mono">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Corporate &amp; Audit Inquiries</span>
            <span className="font-bold text-gray-900">admin@thedharmawatch.in</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Grievance &amp; Compliance Officer</span>
            <span className="font-bold text-gray-900">compliance@thedharmawatch.in</span>
          </div>
          <Link to="/contact" className="text-amber-700 hover:underline font-bold font-sans flex items-center gap-1">
            <span>Newsroom Directory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
