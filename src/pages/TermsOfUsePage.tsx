import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Scale, FileText, ShieldAlert, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const TermsOfUsePage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Terms of Use' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Legal Terms &amp; Conditions
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Last Updated: November 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Terms of Use
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          These Terms of Use govern your access to and use of <strong className="text-gray-900">https://thedharmawatch.in/</strong> and any associated content feeds, dispatches, and archives published by The Dharma Watch.
        </p>
      </header>

      {/* Notice Box */}
      <section className="bg-stone-50 border border-stone-200 p-5 rounded-lg text-xs text-gray-700 leading-relaxed space-y-2">
        <p>
          By accessing or reading The Dharma Watch, you agree to comply with and be bound by these Terms. If you do not agree with any part of these terms, please refrain from using the website.
        </p>
        <p>
          The Dharma Watch is an independently owned and operated digital news publication, managed by its individual founder and personally funded by its owner.
        </p>
      </section>

      {/* Articles & Provisions */}
      <article className="space-y-6 text-sm text-gray-800 leading-relaxed divide-y divide-gray-200">
        {/* Provision 1 */}
        <div className="pt-6 first:pt-0 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>1. Intellectual Property &amp; Copyright</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              All original written journalism, investigative reports, analytical dossiers, bespoke graphics, and editorial compilation published on this website are the intellectual property of The Dharma Watch or its contributing authors, protected under the Indian Copyright Act, 1957 and applicable international treaties.
            </p>
            <p>
              <strong>Fair Dealing &amp; Educational Citation:</strong> Excerpts, brief quotes, and summaries may be reproduced for non-commercial critique, review, study, or news reporting in accordance with Section 52 of the Indian Copyright Act, 1957, provided that clear and prominent attribution is given to <em>The Dharma Watch</em> along with an active hyperlink to the original article URL on <code className="bg-stone-100 px-1 py-0.5 font-mono text-xs">https://thedharmawatch.in/</code>.
            </p>
            <p>
              <strong>Third-Party Public Records:</strong> Primary legal documents, First Information Reports (FIRs), court orders, government gazette notifications, and parliamentary transcripts hosted or cited on the site constitute official public records. Any third-party trademarks or trade names cited remain the property of their respective owners.
            </p>
          </div>
        </div>

        {/* Provision 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>2. Permitted Use &amp; Code of Conduct</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>When accessing the website, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Deploy automated bots, scrapers, or high-concurrency requests that degrade site availability or burden server infrastructure.</li>
              <li>Attempt to circumvent, probe, or breach any security, rate-limiting, or authentication mechanisms.</li>
              <li>Transmit malicious software, worms, destructive payloads, or harmful scripts.</li>
              <li>Misrepresent or distort quotes, headlines, or findings from The Dharma Watch to mislead the public.</li>
            </ul>
          </div>
        </div>

        {/* Provision 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>3. Editorial Nature &amp; Disclaimers</span>
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              Content published on The Dharma Watch is provided solely for general public information, journalistic documentation, and educational discussion. It does not constitute formal legal, financial, investment, or professional advice.
            </p>
            <p>
              Signed opinion articles, guest essays, and interviews reflect the personal viewpoints of their individual authors and do not necessarily represent the editorial stance of The Dharma Watch.
            </p>
            <p>
              While we exercise rigorous diligence to verify facts prior to publication, the website and its contents are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.
            </p>
          </div>
        </div>

        {/* Provision 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>4. Limitation of Liability</span>
          </h2>
          <p className="text-gray-700">
            To the maximum extent permitted by applicable law, The Dharma Watch and its owner shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to, use of, or inability to access the website or its published articles.
          </p>
        </div>

        {/* Provision 5 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>5. Corrections &amp; Grievances</span>
          </h2>
          <p className="text-gray-700">
            If you identify a factual inaccuracy in our reporting or have a grievance concerning editorial content, please refer to our{' '}
            <Link to="/corrections" className="text-amber-700 font-bold hover:underline">Corrections Policy</Link>{' '}
            and our{' '}
            <Link to="/grievance-redressal" className="text-amber-700 font-bold hover:underline">Grievance Redressal Procedure</Link>.
          </p>
        </div>

        {/* Provision 6 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>6. Governing Law &amp; Jurisdiction</span>
          </h2>
          <p className="text-gray-700">
            These Terms of Use and any disputes arising in connection with the website shall be governed by and construed in accordance with the laws of the Republic of India.
          </p>
        </div>

        {/* Provision 7 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-base font-bold text-gray-950 uppercase tracking-wide">
            7. Contact Information
          </h2>
          <p className="text-gray-700">
            For inquiries regarding syndication, licensing, or these Terms of Use, please reach out to:
          </p>
          <div className="p-4 bg-stone-50 border border-stone-200 rounded font-mono text-xs space-y-1">
            <div><strong>The Dharma Watch — Legal &amp; Syndication Inquiries</strong></div>
            <div>Email: <a href="mailto:contact@thedharmawatch.in" className="text-amber-700 font-bold hover:underline">contact@thedharmawatch.in</a></div>
            <div>Website: https://thedharmawatch.in/</div>
          </div>
        </div>
      </article>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900">
          ← Privacy Policy
        </Link>
        <Link to="/disclaimer" className="text-amber-700 hover:text-amber-900">
          General Disclaimer →
        </Link>
      </div>
    </div>
  );
};
