import React from 'react';
import { Link } from 'react-router-dom';
import { SOCIAL_LINKS, XIcon, InstagramIcon, TelegramIcon } from './SocialIcons';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-6 sm:mt-8 bg-gray-950 text-white border-t border-gray-800 pt-8 pb-20 md:pb-8 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand & Institutional Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="inline-block">
              <img
                src="/logo-white.png"
                alt="The Dharma Watch"
                className="h-9 sm:h-11 w-auto max-w-[220px] sm:max-w-none object-contain mb-1"
              />
            </Link>
            <p className="text-xs uppercase tracking-widest text-amber-500 font-bold">
              Journalism of Courage · Public Record
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's independent investigative journal of record. Dedicated to verifiable documentation, constitutional accountability, market intelligence, and holding authority to account without ideological bias.
            </p>
            <p className="text-xs text-gray-300 font-medium pt-1">
              सत्यमेव जयते — Truth Alone Triumphs · Dharmo Rakshati Rakshitah
            </p>

            {/* Official Channels */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Official Channels: {SOCIAL_LINKS.handle}
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-amber-600 text-white text-xs font-semibold rounded-md transition-colors"
                  title="Follow on X / Twitter"
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>X (Twitter)</span>
                </a>
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-[#0088cc] text-white text-xs font-semibold rounded-md transition-colors"
                  title="Join on Telegram"
                >
                  <TelegramIcon className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Newsroom Desks (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 pb-2 border-b border-gray-800">
              Newsroom Desks
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li>
                <Link to="/national" className="hover:text-white transition-colors">
                  National &amp; Politics
                </Link>
              </li>
              <li>
                <Link to="/economy" className="hover:text-white transition-colors">
                  Economy &amp; Financial Markets
                </Link>
              </li>
              <li>
                <Link to="/world" className="hover:text-white transition-colors">
                  World &amp; Strategic Affairs
                </Link>
              </li>
              <li>
                <Link to="/opinions" className="hover:text-white transition-colors">
                  Opinion &amp; Editorials
                </Link>
              </li>
              <li>
                <Link to="/investigations" className="hover:text-white transition-colors">
                  Investigations &amp; RTI
                </Link>
              </li>
              <li>
                <Link to="/society-culture" className="hover:text-white transition-colors">
                  Society, Law &amp; Culture
                </Link>
              </li>
              <li>
                <Link to="/fact-check" className="hover:text-white transition-colors">
                  Fact Check &amp; Media Watch
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standards & Governance (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 pb-2 border-b border-gray-800">
              Charter &amp; Ethics
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DharmaWatch
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-white transition-colors">
                  Editorial Standards
                </Link>
              </li>
              <li>
                <Link to="/corrections" className="hover:text-white transition-colors">
                  Corrections Ledger
                </Link>
              </li>
              <li>
                <Link to="/case-files" className="hover:text-white transition-colors">
                  Judicial Case Files
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Newsroom
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Confidential Whistleblower Tip Vault (3 cols) */}
          <div className="lg:col-span-3 rounded-xl p-4 sm:p-5 bg-gradient-to-b from-stone-900 via-stone-900/95 to-black border border-stone-800 shadow-xl space-y-3.5 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            {/* Top Security Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 font-mono">
                  Secure Tip Intake
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                E2EE Active
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Have verified public documents, RTI disclosures, court filings, or whistleblower evidence?
            </p>

            {/* Direct Channel Badges */}
            <div className="space-y-1.5 py-0.5 text-[11px] font-mono text-stone-400">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-950/80 rounded-md border border-stone-800/80">
                <span className="text-stone-400 text-[10px] uppercase font-sans font-semibold">Signal</span>
                <span className="text-sky-400 font-bold">@dharmawatch.01</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-stone-950/80 rounded-md border border-stone-800/80">
                <span className="text-stone-400 text-[10px] uppercase font-sans font-semibold">PGP Ingest</span>
                <span className="text-amber-300">leak@thedharmawatch.in</span>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <Link
                to="/tips"
                className="group/btn inline-flex items-center justify-center w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md hover:shadow-amber-500/20 text-center gap-1.5"
              >
                <span>Submit Encrypted Tip</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>

            {/* Shield Notice */}
            <p className="text-[10px] text-stone-400 text-center leading-tight">
              Zero IP logging · No tracking scripts · Shield protected
            </p>
          </div>
        </div>

        {/* Bottom Rule & Copyright Bar */}
        <div className="pt-6 border-t border-gray-800/80 text-center text-xs text-gray-500 space-y-1">
          <p>
            © {new Date().getFullYear()} The Dharma Watch. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-600">
            Adhering to Press Council of India standards of verification, non-partisanship, and editorial integrity.
          </p>
        </div>
      </div>
    </footer>
  );
};
