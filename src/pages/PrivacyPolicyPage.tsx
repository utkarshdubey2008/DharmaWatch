import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Lock, Eye, Server, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Privacy Policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Legal &amp; Privacy Disclosures
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Last Updated: November 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Privacy Policy
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          The Dharma Watch is committed to reader privacy and transparent data stewardship. This policy explains what information is collected, how it is used, and the steps taken to protect your personal data when you visit <strong className="text-gray-900">https://thedharmawatch.in/</strong>.
        </p>
      </header>

      {/* Summary Box */}
      <section className="bg-stone-50 border border-stone-200 p-6 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Privacy Principles at a Glance</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700 pt-1">
          <div className="bg-white p-3 border border-stone-200 rounded">
            <strong className="block text-gray-950 mb-1">No Invasive Trackers</strong>
            We do not deploy third-party advertising tracking pixels, cross-site surveillance cookies, or data-broker scripts.
          </div>
          <div className="bg-white p-3 border border-stone-200 rounded">
            <strong className="block text-gray-950 mb-1">Data Minimization</strong>
            We collect only the bare minimum technical data required to securely deliver articles and prevent denial-of-service abuse.
          </div>
          <div className="bg-white p-3 border border-stone-200 rounded">
            <strong className="block text-gray-950 mb-1">No Sale of Personal Data</strong>
            Reader emails and contact submissions are never sold, rented, monetized, or shared with commercial marketers.
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Section 1 */}
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-600" />
            <span>1. Information We Collect</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>A. Technical &amp; Operational Server Logs:</strong> Like standard web infrastructure, our web servers automatically generate technical logs upon request. These logs record your IP address, browser user-agent, requested URL, referral header, HTTP response code, and timestamp. These logs are used strictly for network security, diagnostics, DDoS mitigation, and server performance monitoring, and are purged periodically.
            </p>
            <p>
              <strong>B. Voluntary Newsletter Subscriptions:</strong> If you voluntarily subscribe to the DharmaWatch Dispatch, we collect and store your email address solely to deliver scheduled news updates. You may unsubscribe at any time via the link provided in any newsletter email or by contacting <code className="bg-stone-100 px-1 py-0.5 font-mono text-xs">contact@thedharmawatch.in</code>.
            </p>
            <p>
              <strong>C. Direct Communications &amp; Tips:</strong> When you contact us via email, contact forms, or tip intake channels, we receive the contents of your message, any attached files, and any contact handle you provide. Tip submissions may also be submitted with client-side cryptographic encryption or over Signal.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>2. Cookies &amp; Local Storage</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              The Dharma Watch does not use third-party advertising or behavioral profiling cookies.
            </p>
            <p>
              The site uses strictly functional client storage (such as browser <code className="bg-stone-100 px-1 py-0.5 font-mono text-xs">localStorage</code>) to store essential user interface preferences (such as light or dark theme choices) and temporary administrative session tokens for authorized newsroom management.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>3. How Information is Used</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li>To serve web pages, articles, and investigative archives quickly and securely.</li>
            <li>To dispatch voluntary editorial email bulletins to subscribers.</li>
            <li>To investigate and respond to reader inquiries, correction requests, and formal editorial grievances.</li>
            <li>To detect, investigate, and prevent malicious attacks, automated scraping, security threats, or unauthorized access attempts.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>4. Third-Party Sharing &amp; Disclosures</span>
          </h2>
          <p className="text-gray-700">
            We do not sell, rent, or trade reader personal data to third parties. Information may only be disclosed in the following narrow circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li><strong>Infrastructure Service Providers:</strong> Trusted technical providers (such as hosting facilities and domain DNS routing) that maintain server infrastructure under strict confidentiality agreements.</li>
            <li><strong>Legal &amp; Statutory Compliance:</strong> Where strictly required under applicable Indian law, a valid judicial warrant, or a lawful order from a competent legal authority.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>5. Reader Rights &amp; Data Protection</span>
          </h2>
          <p className="text-gray-700">
            In accordance with applicable Indian data protection principles under the Digital Personal Data Protection Act, 2023 (DPDP Act), readers have the right to request confirmation of data held about them (such as newsletter subscription records), seek rectification of inaccurate information, or request the erasure of their subscriber records.
          </p>
        </div>

        {/* Section 6 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>6. Privacy Inquiries &amp; Data Contact</span>
          </h2>
          <p className="text-gray-700">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please write to:
          </p>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded font-mono text-xs space-y-1">
            <div><strong>The Dharma Watch — Privacy Inquiries</strong></div>
            <div>Email: <a href="mailto:privacy@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">privacy@thedharmawatch.in</a></div>
            <div>Website: https://thedharmawatch.in/</div>
          </div>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/terms-of-use" className="text-amber-700 hover:text-amber-900">
          Terms of Use →
        </Link>
        <Link to="/ownership-and-funding" className="text-gray-600 hover:text-gray-900">
          Ownership &amp; Funding Disclosure →
        </Link>
      </div>
    </div>
  );
};
