import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, TrendingUp, ChevronRight, Shield, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { SearchModal } from './SearchBar';
import { SOCIAL_LINKS, XIcon, InstagramIcon, TelegramIcon } from './SocialIcons';

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // ESC key listener to close full screen menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Mint top primary navigation tabs
  const primaryTabs = [
    { name: 'Home', path: '/' },
    { name: 'Latest News', path: '/archive' },
    { name: 'National', path: '/national' },
    { name: 'Economy & Markets', path: '/economy' },
    { name: 'World', path: '/world' },
    { name: 'Opinion', path: '/opinions' },
    { name: 'Investigations', path: '/investigations' },
    { name: 'Society & Culture', path: '/society-culture' },
    { name: 'Fact Check', path: '/fact-check' },
  ];

  // Mint secondary sub-category horizontal scroll strip
  const subCategories = [
    { name: 'All', path: '/' },
    { name: 'Companies & Markets', path: '/economy' },
    { name: 'Technology & AI', path: '/economy' },
    { name: 'Supreme Court & Law', path: '/national' },
    { name: 'Parliament & Policy', path: '/national' },
    { name: 'Global Diplomacy', path: '/world' },
    { name: 'RTI Dossiers', path: '/investigations' },
    { name: 'Heritage & Faith', path: '/society-culture' },
    { name: 'Viral Fact Checks', path: '/fact-check' },
    { name: 'Public Safety', path: '/violence' },
  ];

  const isTabActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. TOP BAR: LOGO, MARKETS TICKER & ACTIONS                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Left: 3-Dots Button & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 sm:p-2 text-gray-800 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0 group cursor-pointer"
                aria-label="Open comprehensive newsroom directory"
                title="All Desks & Navigation (3 Dots)"
              >
                <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 group-hover:bg-amber-600 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 group-hover:bg-amber-600 transition-colors" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 group-hover:bg-amber-600 transition-colors" />
                </div>
              </button>

              <Link to="/" className="flex items-center gap-2 group shrink-0 py-0.5">
                <img
                  src="/logo-dark.png"
                  alt="The Dharma Watch"
                  className="h-8 sm:h-10 md:h-11 w-auto max-w-[200px] sm:max-w-[280px] object-contain transition-transform group-hover:opacity-90"
                />
              </Link>
            </div>

            {/* Center: Live Financial Markets Capsule (Mint style) */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-sans text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" /> BSE SENSEX 81,420 +245 (+0.30%)
              </span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-emerald-700">
                NIFTY 50 24,810 +78 (+0.32%)
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">
                USD/INR 84.12
              </span>
            </div>

            {/* Right: Search & Confidential Tip Intake */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Search news & investigations"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <Link
                to="/tips"
                className="inline-flex items-center px-3 sm:px-3.5 py-1.5 rounded-full bg-gray-950 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-colors shrink-0 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Confidential </span>
                <span>Tip</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. PRIMARY NAVIGATION TABS (MINT TOP TAB BAR)                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none whitespace-nowrap text-sm font-semibold py-2">
              {primaryTabs.map((tab) => {
                const active = isTabActive(tab.path);
                return (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    className={`transition-colors pb-0.5 text-[13px] sm:text-sm ${
                      active
                        ? 'text-gray-950 font-bold border-b-2 border-gray-950'
                        : 'text-gray-600 hover:text-gray-950'
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. SECONDARY TOPIC STRIP (MINT HOMEPAGE SUB-FILTER PILLS)      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {location.pathname === '/' && (
          <div className="border-t border-gray-100 bg-gray-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center space-x-5 overflow-x-auto scrollbar-none whitespace-nowrap py-2 text-xs font-medium text-gray-600">
                {subCategories.map((sub, idx) => {
                  const isSelected = idx === 0;
                  return (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className={`transition-colors pb-0.5 ${
                        isSelected
                          ? 'text-gray-950 font-bold border-b-2 border-gray-900'
                          : 'hover:text-gray-950'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. FULL SCREEN ANIMATED DESK DIRECTORY & DIRECTORY OVERLAY      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-white text-gray-950 flex flex-col animate-in fade-in zoom-in-95 duration-250 ease-out overflow-hidden"
        >
          {/* Full Screen Top Masthead Bar with Prominent Cross Close Button */}
          <div className="border-b-2 border-gray-900 bg-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-xs">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
              <img
                src="/logo-dark.png"
                alt="The Dharma Watch"
                className="h-8 sm:h-10 md:h-11 w-auto max-w-[200px] sm:max-w-[280px] object-contain"
              />
              <span className="hidden md:inline-block text-[11px] font-serif italic text-gray-500 border-l border-gray-300 pl-3">
                Broadsheet Directory &amp; Reporting Desks
              </span>
            </Link>

            {/* Cross Button to Stop / Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 hover:bg-amber-600 text-white rounded-full transition-all duration-200 cursor-pointer shadow-sm group"
                aria-label="Close menu"
                title="Press ESC or click to close"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Close</span>
                <span className="hidden sm:inline-block text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded font-mono group-hover:bg-amber-700 group-hover:text-white">
                  ESC
                </span>
                <X className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-90" />
              </button>
            </div>
          </div>

          {/* Full Screen Scrollable Content Grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 bg-gradient-to-b from-white via-stone-50/50 to-white">
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Quick Search Row inside Full Screen Overlay */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">Search the newsroom archives:</span>
                  <span className="text-gray-500">Over 50+ investigated stories and constitutional rulings</span>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Open Search Bar ↵
                </button>
              </div>

              {/* 4-Column Broadsheet Directory Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {/* Column 1: Newsroom Reporting Bureaus */}
                <div className="space-y-4">
                  <div className="border-b-2 border-gray-900 pb-2 flex items-center justify-between">
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-gray-950">
                      Reporting Desks
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">BEATS</span>
                  </div>
                  <nav className="space-y-1 text-sm font-medium">
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Front Page &amp; Live Wire</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/national"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>National &amp; Politics</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/economy"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Economy, Markets &amp; Tech</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/world"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>World &amp; Strategic Affairs</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/opinions"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Opinion &amp; Editorials</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/investigations"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Investigations &amp; RTI</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/society-culture"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Society, Law &amp; Culture</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/fact-check"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Fact Check &amp; Media Watch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </nav>
                </div>

                {/* Column 2: Judicial Dossiers & Archival Hubs */}
                <div className="space-y-4">
                  <div className="border-b-2 border-gray-900 pb-2 flex items-center justify-between">
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-gray-950">
                      Dossiers &amp; Archives
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">RECORDS</span>
                  </div>
                  <nav className="space-y-1 text-sm font-medium">
                    <Link
                      to="/case-files"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold">Judicial Case Files</div>
                        <div className="text-[11px] text-gray-500 font-normal">FIRs, trials &amp; case tracking</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/archive"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold">Chronological Archive</div>
                        <div className="text-[11px] text-gray-500 font-normal">All historical dispatches</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/data"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold">Primary Data &amp; Evidence</div>
                        <div className="text-[11px] text-gray-500 font-normal">Original government tenders &amp; RTI</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/violence"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold">Public Safety Watch</div>
                        <div className="text-[11px] text-gray-500 font-normal">Ground incidents &amp; police filings</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/persecution"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold">Civil Liberties Registry</div>
                        <div className="text-[11px] text-gray-500 font-normal">Rights and demographic defense</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </nav>
                </div>

                {/* Column 3: Institutional Standards & Governance */}
                <div className="space-y-4">
                  <div className="border-b-2 border-gray-900 pb-2 flex items-center justify-between">
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-gray-950">
                      Publication &amp; Standards
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">CHARTERS</span>
                  </div>
                  <nav className="space-y-1 text-sm font-medium">
                    <Link
                      to="/publication"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span className="font-bold">Publication Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>About The Dharma Watch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/ownership-and-funding"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Ownership &amp; Funding</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/standards"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span className="font-bold">Code of Standards</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/editorial"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Editorial Independence</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/fact-checking"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Fact-Checking Protocol</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/sources-and-attribution"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Sources &amp; Attribution</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/corrections"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Public Corrections Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/grievance-redressal"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Grievance Redressal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/compliance-report"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Compliance Reports</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/privacy-policy"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Privacy &amp; Terms</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>Contact Us</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    <a
                      href="/rss.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg text-gray-900 hover:bg-gray-100 hover:text-amber-700 transition-colors"
                    >
                      <span>RSS Syndication Wire</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </a>
                  </nav>
                </div>

                {/* Column 4: Whistleblower Intake & Community Wire */}
                <div className="space-y-4">
                  <div className="border-b-2 border-gray-900 pb-2 flex items-center justify-between">
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-amber-700">
                      Whistleblower Intake
                    </h3>
                    <span className="text-[10px] font-mono text-amber-600 font-bold">SECURE</span>
                  </div>

                  <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-5 space-y-3 shadow-md">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Encrypted Tips Desk</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Whistleblower evidence, court transcripts, or leaked public records are strictly protected under journalistic shield privilege.
                    </p>
                    <Link
                      to="/tips"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Submit Encrypted Tip →
                    </Link>
                  </div>

                  {/* Social Handles */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                      Connect on Official Channels
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={SOCIAL_LINKS.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-800 text-xs font-semibold rounded-md transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                        <span>X (Twitter)</span>
                      </a>
                      <a
                        href={SOCIAL_LINKS.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-[#0088cc] hover:text-white text-gray-800 text-xs font-semibold rounded-md transition-colors"
                      >
                        <TelegramIcon className="w-3 h-3" />
                        <span>Telegram</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Screen Footer Bar */}
          <div className="border-t border-gray-200 bg-white px-4 sm:px-8 py-3 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div>
              © {new Date().getFullYear()} The Dharma Watch. Independent National Journal of Record.
            </div>
            <div className="font-serif italic text-gray-600">
              सत्यमेव जयते — Truth Alone Triumphs · Dharmo Rakshati Rakshitah
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
