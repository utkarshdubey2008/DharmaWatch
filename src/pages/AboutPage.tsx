import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Scale, ArrowRight, BookOpen, Globe2, Building2, TrendingUp } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-8 font-sans">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. EDITORIAL MASTHEAD BANNER (CLEAN NEWSPAPER STYLE)         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="border-b-2 border-gray-900 pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600">
            Institutional Charter &amp; Mission
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">New Delhi</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Why DharmaWatch Exists
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-semibold text-gray-900">
            DharmaWatch · Journal of Record
          </span>
          <span className="text-amber-700 font-serif italic">
            सत्यमेव जयते — Truth Alone Triumphs
          </span>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. CORE EDITORIAL MANIFESTO                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <article className="space-y-6 text-gray-800 leading-relaxed">
        <p className="text-base sm:text-xl font-bold text-gray-950 leading-snug border-l-3 border-amber-500 pl-3 sm:pl-4">
          DharmaWatch was founded on a singular conviction: that a thriving, democratic India requires an uncompromising fourth estate committed to constitutional truth, verified documentation, and holding power to account without ideological bias or corporate censorship.
        </p>

        <div className="space-y-3 text-sm sm:text-base text-gray-700">
          <p>
            In classical Indian statecraft and philosophy, the term <strong>Dharma</strong> signifies constitutional duty, civic virtue, ethical governance, and the relentless pursuit of justice (*Satya* and *Nyaya*). As the constitutional maxim asserts—<em>Dharmo Rakshati Rakshitah</em>—the rule of law and righteousness protect those who protect them.
          </p>
          <p>
            In modern democratic life, the foremost custodian of that public duty is an independent, investigative press. When governance mechanisms falter, when procurement budgets disappear into collusive cartels, when fundamental civil liberties are tested, or when public discourse is hijacked by synthetic deepfakes and partisan narratives, <strong>DharmaWatch</strong> serves as a reliable evidentiary journal of record.
          </p>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 3. CORE NEWSROOM DESKS                                       */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
              Editorial Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
              Newsroom Desks &amp; Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>National &amp; Governance</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Parliament, Cabinet &amp; Federal Policy
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Scrutinizing legislative acts, federal-state dynamics, electoral processes, administrative transparency, and public policy outcomes across India.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" />
                <span>Supreme Court &amp; Judiciary</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Constitutional Benches &amp; Rule of Law
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                In-depth jurisprudence reporting from the Supreme Court and High Courts, upholding Article 21, civil liberties, and statutory accountability.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Economy &amp; Financial Markets</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Macroeconomy, RBI &amp; Industrial Growth
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Independent economic analysis examining monetary policy, banking health, semiconductor manufacturing, and fiscal discipline.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <Globe2 className="w-3.5 h-3.5" />
                <span>World &amp; Strategic Affairs</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Diplomacy, Indo-Pacific &amp; South Asia
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tracking multilateral summits, Quad security, bilateral trade negotiations, and global geopolitical developments.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Investigations &amp; RTI Watchdog</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Forensic Audits &amp; Public Records
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Multi-month ground inquiries analyzing RTI disclosures, municipal tenders, environmental degradation, and conflicts of interest.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fact Check &amp; Media Watch</span>
              </div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-gray-950">
                Deepfakes, Disinformation &amp; AI Forensics
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Countering synthetic media and partisan falsehoods through forensic audio/video spectrum analysis and certified public documents.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 4. CODE OF ETHICS & INDEPENDENCE                             */}
        {/* ──────────────────────────────────────────────────────────── */}
        <section className="bg-gray-50 rounded-xl border border-gray-200/80 p-4 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-950">
            Our Guiding Journalistic Principles
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-gray-700">
            <p>
              <strong>1. Verification Over Speed:</strong> Every dispatch is corroborated through primary source documentation, certified police filings, court dockets, or on-the-record statements.
            </p>
            <p>
              <strong>2. Distinction Between News and Opinion:</strong> Clear structural separation is maintained between factual reportage and editorial commentary.
            </p>
            <p>
              <strong>3. Public Corrections:</strong> Errors of fact are corrected promptly and transparently in our permanent public corrections ledger.
            </p>
            <p>
              <strong>4. Protection of Sources:</strong> We defend journalistic confidentiality and whistleblower security under the highest standards of legal privilege.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/editorial-policy"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              <span>Editorial Charter</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:border-gray-900 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors bg-white"
            >
              <span>Submit Tip</span>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
};
