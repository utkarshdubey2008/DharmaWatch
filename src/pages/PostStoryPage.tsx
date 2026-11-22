import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../admin/context/AdminAuthContext';
import {
  Send,
  Eye,
  Edit3,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkle,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { MediaRenderer } from '../components/common/MediaRenderer';

interface StorySource {
  title: string;
  publisher: string;
  sourceType: string;
  classification: string;
  url: string;
  documentNumber: string;
}

const PRESET_IMAGES = [
  {
    label: 'Parliament / Central Vista',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200',
    caption: 'The Parliament of India in New Delhi.',
    credit: 'Express Photo',
  },
  {
    label: 'Dalal Street & Financial Markets',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
    caption: 'Trading terminal indicators on Dalal Street, Mumbai.',
    credit: 'Reuters',
  },
  {
    label: 'Supreme Court & Law',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
    caption: 'Gavel and judicial statutes on legal bench.',
    credit: 'PTI',
  },
  {
    label: 'National Infrastructure & Rails',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200',
    caption: 'High-speed rail corridor and logistics freight network.',
    credit: 'PIB Photo',
  },
  {
    label: 'Diplomacy & Global Summit',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200',
    caption: 'Delegates convene at bilateral diplomatic summit.',
    credit: 'MEA India',
  },
];

const PRESET_TEMPLATES = [
  {
    label: 'Breaking Policy / National',
    category: 'national',
    title: 'Union Cabinet Approves Comprehensive National Semiconductor Subsidies in ₹45,000 Crore Expansion',
    deck: 'Phase-II incentives target advance packaging hubs and indigenous silicon design clusters across three states.',
    heroImage: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200',
    imageCaption: 'Union Cabinet briefing hall at the National Media Centre, New Delhi.',
    content: `NEW DELHI — The Union Cabinet on Monday cleared the second phase of the National Semiconductor Mission with an allocated outlay of ₹45,000 crore, significantly expanding fiscal incentives for silicon fabrication, testing, and indigenous design clusters.

The flagship policy intervention guarantees up to 50% capital expenditure support for international consortiums establishing advance packaging units (ATMP/OSAT) in designated industrial zones in Gujarat, Karnataka, and Odisha.

## Key Strategic Pillars

Under the revised charter, the Ministry of Electronics and Information Technology (MeitY) has introduced dedicated performance-linked tranches for commercial volume production, designed to insulate domestic electronics manufacturers from global supply disruptions.

Senior officials from the National Semiconductor Mission confirmed that four commercial fabrication proposals submitted by joint ventures have completed technical scrutiny by the empowered committee.

"This approval marks a structural transition from exploratory pilot lines to high-throughput commercial wafer production," the minister stated during the press briefing. Public gazette notifications outlining application guidelines are scheduled for release within forty-eight hours.`,
    isLead: true,
    isBreaking: true,
    authorName: 'National Bureau',
    authorRole: 'Political & Governance Bureau',
    location: 'New Delhi',
  },
  {
    label: 'Market & Economy Brief',
    category: 'economy',
    title: 'RBI Monetary Policy Committee Holds Repo Rate at 6.50% Amid Resilient Domestic Capital Expenditure',
    deck: 'Governor affirms disinflation trajectory is progressing toward 4% target; GDP growth projection for FY25 retained at 7.2%.',
    heroImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
    imageCaption: 'Reserve Bank of India headquarters at Mint Road, Mumbai.',
    content: `MUMBAI — The Reserve Bank of India’s Monetary Policy Committee (MPC) on Wednesday voted 5-1 to maintain the benchmark policy repo rate unchanged at 6.50% for the ninth consecutive bi-monthly meeting, citing resilient domestic demand alongside persistent food price volatility.

The Standing Deposit Facility (SDF) rate remains at 6.25%, and the Marginal Standing Facility (MSF) rate stays pegged at 6.75%.

## Growth Outlook Retained

The central bank retained its real GDP growth forecast for the fiscal year 2024-25 at 7.2%, supported by robust manufacturing capacity utilisation, strong bank balance sheets, and high-frequency indicators across transport and power demand.

"While headline inflation has moderated significantly from earlier peaks, the last mile of disinflation requires unwavering vigilance. The MPC remains committed to aligning inflation durably with the 4% statutory mandate," Governor Shaktikanta Das announced during the televised address.

Bond yields eased marginally by two basis points following the statement, with the benchmark 10-year sovereign paper trading at 6.98%.`,
    isLead: false,
    isBreaking: false,
    authorName: 'Priya Raman',
    authorRole: 'Senior Economics & Markets Editor',
    location: 'Mumbai',
  },
  {
    label: 'Investigative Audit Dossier',
    category: 'investigations',
    title: 'Audit Discloses ₹1,840 Crore Discrepancy in State Urban Drainage Tenders Over Three Fiscal Cycles',
    deck: 'RTI documents reveal unverified completion certificates and duplicated procurement orders across five municipal corporations.',
    heroImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200',
    imageCaption: 'Municipal infrastructure stormwater drainage canal under ongoing audit inspection.',
    content: `NEW DELHI — An investigative audit conducted by DharmaWatch examining 420 Right to Information (RTI) disclosures has exposed a ₹1,840 crore accounting discrepancy in stormwater drainage tenders awarded across five municipal corporations between FY 2022 and FY 2025.

Official municipal logbooks and certified engineering inspection records obtained through statutory appeals demonstrate that multiple contractor consortiums were disbursed full completion payments prior to physical site verification.

## Primary Evidentiary Patterns

In at least twelve documented drainage packages, digital procurement stamps and vendor invoices were duplicated across separate civic wards without corresponding dispatch notes or materials gate entries.

Senior auditors from the state accountant general’s directorate had previously flagged related anomalies in preliminary audit memorandums, which remained unaddressed by municipal standing committees for over fourteen months.

Following inquiries submitted by this journal, the state urban development vigilance wing confirmed that a formal scrutiny panel has been constituted to cross-verify physical works with satellite survey records.`,
    isLead: false,
    isBreaking: false,
    authorName: 'Adarsh Dubey',
    authorRole: 'Senior National Correspondent',
    location: 'New Delhi',
  },
];

export const PostStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAdminAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [deck, setDeck] = useState('');
  const [category, setCategory] = useState('national');
  const [subcategory, setSubcategory] = useState('');
  const [authorName, setAuthorName] = useState('National Bureau');
  const [authorRole, setAuthorRole] = useState('Political & Governance Bureau');
  const [location, setLocation] = useState('New Delhi');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200');
  const [imageCaption, setImageCaption] = useState('The Parliament of India in New Delhi.');
  const [content, setContent] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isInvestigation, setIsInvestigation] = useState(false);
  const [isOpinion, setIsOpinion] = useState(false);
  const [tags, setTags] = useState('Policy, Economy, Governance');

  // Sources
  const [sources, setSources] = useState<StorySource[]>([
    {
      title: 'Official Union Cabinet Press Information Bureau Release',
      publisher: 'Press Information Bureau (PIB), Government of India',
      sourceType: 'Government Gazette / PIB',
      classification: 'Primary Public Record',
      url: 'https://pib.gov.in',
      documentNumber: 'PIB-DEL-2026-0912',
    },
  ]);

  // UI Modes
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-calculate word count and reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Apply a quick preset template
  const applyPreset = (template: typeof PRESET_TEMPLATES[0]) => {
    setTitle(template.title);
    setDeck(template.deck);
    setCategory(template.category);
    setHeroImage(template.heroImage);
    setImageCaption(template.imageCaption);
    setContent(template.content);
    setIsLead(template.isLead);
    setIsBreaking(template.isBreaking);
    setAuthorName(template.authorName);
    setAuthorRole(template.authorRole);
    setLocation(template.location);
    setErrorMessage(null);
  };

  // Add a source row
  const addSource = () => {
    setSources([
      ...sources,
      {
        title: '',
        publisher: '',
        sourceType: 'Public Filing',
        classification: 'Primary Public Record',
        url: '',
        documentNumber: '',
      },
    ]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, idx) => idx !== index));
  };

  const updateSource = (index: number, field: keyof StorySource, val: string) => {
    const updated = [...sources];
    updated[index][field] = val;
    setSources(updated);
  };

  // Handle Submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a headline for this story.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Please compose the story body content.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      deck: deck.trim(),
      categorySlug: category,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      subcategory: subcategory.trim() || undefined,
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      location: { city: location.trim(), country: 'India' },
      heroImage: heroImage.trim(),
      imageCaption: imageCaption.trim(),
      content: content.trim(),
      isLead,
      isBreaking,
      isInvestigation: isInvestigation || category === 'investigations',
      isOpinion: isOpinion || category === 'opinions',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      sources: sources.filter((s) => s.title.trim().length > 0),
      readTimeMinutes: estimatedReadTime,
    };

    try {
      const res = await fetch('/api/articles/quick-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish story to news wire.');
      }

      setSuccessUrl(data.url);
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrorMessage(err.message || 'Network error while transmitting story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (successUrl) {
      const full = `${window.location.origin}${successUrl}`;
      navigator.clipboard.writeText(full);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="inline-block w-6 h-6 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs text-gray-500 font-medium">Verifying newsroom editorial credentials...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. STUDIO MASTHEAD & WORKFLOW ACTIONS                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Left: Brand & Studio Indicator */}
            <div className="flex items-center gap-3">
              <Link to="/" className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                <span>← Newsroom</span>
              </Link>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="font-sans font-extrabold text-sm sm:text-base text-gray-950 tracking-tight">
                  Editorial Dispatch Studio
                </h1>
                <span className="hidden md:inline px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
                  Direct Wire
                </span>
              </div>
            </div>

            {/* Right: Quick Templates & Publish Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Preset Selector */}
              <div className="relative group hidden sm:block">
                <select
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    if (!isNaN(idx) && PRESET_TEMPLATES[idx]) {
                      applyPreset(PRESET_TEMPLATES[idx]);
                    }
                  }}
                  defaultValue=""
                  className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Load Wire Preset Template...</option>
                  {PRESET_TEMPLATES.map((tmpl, idx) => (
                    <option key={idx} value={idx}>{tmpl.label}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="hidden lg:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'edit' ? 'bg-white text-gray-950 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'split' ? 'bg-white text-gray-950 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'preview' ? 'bg-white text-gray-950 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              {/* Publish Action Button */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-950 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Publish Live Story'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. SUCCESS MODAL OVERLAY                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {successUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="font-sans font-black text-xl sm:text-2xl text-gray-950">
                Story Published to Live Wire
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                The article has been committed to the database and is immediately live on the front page and category stream.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">Permanent Broadsheet URL</span>
              <div className="font-mono text-xs text-gray-900 break-all select-all font-semibold">
                {window.location.origin}{successUrl}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied URL' : 'Copy Article Link'}</span>
              </button>

              <Link
                to={successUrl}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gray-950 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View Live Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              onClick={() => {
                setSuccessUrl(null);
                setTitle('');
                setDeck('');
                setContent('');
              }}
              className="text-xs text-gray-500 hover:text-gray-900 underline block mx-auto pt-2"
            >
              Compose Another Story
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. MAIN WORKSPACE: EDITOR & LIVE SPLIT PREVIEW               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className={`grid gap-8 items-start ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* COMPOSER FORM (Shown in 'edit' or 'split')                  */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="space-y-6">
              {/* Card 1: Section & Placement Flags */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
                    1. Reporting Desk &amp; Placement
                  </span>
                  <span className="text-[11px] text-gray-400">Broadsheet Section</span>
                </div>

                {/* Section Pills */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Section Desk *
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 'national', name: 'National' },
                      { id: 'economy', name: 'Economy & Markets' },
                      { id: 'world', name: 'World' },
                      { id: 'opinions', name: 'Opinion & Editorial' },
                      { id: 'investigations', name: 'Investigations' },
                      { id: 'society-culture', name: 'Society & Culture' },
                      { id: 'fact-check', name: 'Fact Check' },
                      { id: 'violence', name: 'Public Safety' },
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setCategory(sec.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                          category === sec.id
                            ? 'bg-gray-950 text-white border-gray-950 shadow-2xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {sec.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Placement Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isLead}
                      onChange={(e) => setIsLead(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">#1 Lead Story</span>
                      <span className="text-[10px] text-gray-500 block leading-tight">Featured top hero card on front page</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">Breaking Alert</span>
                      <span className="text-[10px] text-gray-500 block leading-tight">Flash in red breaking news ticker</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isInvestigation}
                      onChange={(e) => setIsInvestigation(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">Investigation</span>
                      <span className="text-[10px] text-gray-500 block leading-tight">Include in investigative audits stream</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card 2: Headline, Deck & Byline */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
                    2. Headline &amp; Byline
                  </span>
                  <span className="text-[11px] text-gray-400">Editorial Core</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Story Headline *
                    </label>
                    <span className="text-[10px] text-gray-400">{title.length} chars</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter authoritative headline in broadsheet title case..."
                    className="w-full p-3 font-sans font-bold text-base sm:text-lg text-gray-950 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Standfirst / Subtitle Deck (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={deck}
                    onChange={(e) => setDeck(e.target.value)}
                    placeholder="Concise secondary summary providing crucial background context..."
                    className="w-full p-3 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
                  />
                </div>

                {/* Byline Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Author / Byline
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Aarav Mehta or National Bureau"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Author Title / Bureau
                    </label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Senior Economics Editor"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                      Dateline Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New Delhi or Mumbai"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Lead Image Asset */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
                    3. Lead Image &amp; Media Asset
                  </span>
                  <span className="text-[11px] text-gray-400">16:9 / Landscape</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Lead Image URL
                  </label>
                  <input
                    type="url"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block mb-1.5">
                    Or select high-res broadsheet editorial photo:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setHeroImage(img.url);
                          setImageCaption(`${img.caption} (Photo: ${img.credit})`);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          heroImage === img.url
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Image Caption &amp; Attribution
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Parliament session in New Delhi. (Photo: Express Archives)"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Card 4: Story Body */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
                      4. Story Body Content
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {wordCount} words • {estimatedReadTime} min read
                    </span>
                  </div>

                  {/* Formatting helper buttons */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <button
                      type="button"
                      onClick={() => setContent(content + '\n\n## Subheading Here\n\n')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold"
                    >
                      + Subheading
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent(content + '\n\n> "Key quote statement goes here."\n\n')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-semibold"
                    >
                      + Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const imgUrl = prompt('Enter Image URL (JPG, PNG, WebP) to embed:');
                        if (!imgUrl) return;
                        const caption = prompt('Enter optional caption for this photo:') || '';
                        setContent(content + `\n\n![${caption}](${imgUrl.trim()})\n\n`);
                      }}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-amber-800 font-semibold"
                    >
                      + Photo Embed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const vidUrl = prompt('Enter Video URL (YouTube, Vimeo, or MP4) to embed:');
                        if (!vidUrl) return;
                        setContent(content + `\n\n${vidUrl.trim()}\n\n`);
                      }}
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-800 font-semibold"
                    >
                      + Video Embed
                    </button>
                  </div>
                </div>

                <textarea
                  rows={14}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or write full dispatches here. Separate paragraphs with blank lines.

Use ## for sub-headings.
Use > for pull quotes.
Use - for bullet lists."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed transition-colors"
                />

                <p className="text-[11px] text-gray-400">
                  Tip: Blank lines automatically split your story into clean, broadsheet paragraphs with standard typographic spacing.
                </p>
              </div>

              {/* Card 5: Evidentiary Documents & Primary Sources */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>5. Verified Primary Sources &amp; Citations</span>
                  </span>
                  <button
                    type="button"
                    onClick={addSource}
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Source</span>
                  </button>
                </div>

                {sources.map((src, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeSource(idx)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                      title="Remove source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          Document Title *
                        </label>
                        <input
                          type="text"
                          value={src.title}
                          onChange={(e) => updateSource(idx, 'title', e.target.value)}
                          placeholder="e.g. Gazette Notification No. 412/2026"
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          Publisher / Authority
                        </label>
                        <input
                          type="text"
                          value={src.publisher}
                          onChange={(e) => updateSource(idx, 'publisher', e.target.value)}
                          placeholder="e.g. Supreme Court of India / RBI"
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          Reference / Document Number
                        </label>
                        <input
                          type="text"
                          value={src.documentNumber}
                          onChange={(e) => updateSource(idx, 'documentNumber', e.target.value)}
                          placeholder="e.g. W.P.(C) No. 4108/2026"
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                          Public URL
                        </label>
                        <input
                          type="url"
                          value={src.url}
                          onChange={(e) => updateSource(idx, 'url', e.target.value)}
                          placeholder="https://main.sci.gov.in/..."
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar on Mobile */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Transmitting Story...' : 'Publish Story to DharmaWatch Wire'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* LIVE BROADSHEET PREVIEW (Shown in 'split' or 'preview')      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="sticky top-20 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Wire Output Preview
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {category.toUpperCase()} / {location || 'INDIA'}
                </span>
              </div>

              {/* Article Header in Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {isBreaking && (
                    <span className="px-2 py-0.5 rounded-xs bg-red-600 text-white font-extrabold uppercase text-[10px] tracking-wider">
                      BREAKING
                    </span>
                  )}
                  {isLead && (
                    <span className="px-2 py-0.5 rounded-xs bg-amber-500 text-black font-extrabold uppercase text-[10px] tracking-wider">
                      LEAD STORY
                    </span>
                  )}
                  <span className="text-amber-700 font-bold uppercase text-[11px] tracking-wide">
                    {category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400 font-normal text-xs">
                    {estimatedReadTime} min read
                  </span>
                </div>

                <h1 className="font-sans font-black text-2xl sm:text-3xl text-gray-950 leading-tight">
                  {title || 'Headline will appear here as you type...'}
                </h1>

                {deck && (
                  <p className="font-sans text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-300 pl-3">
                    {deck}
                  </p>
                )}

                {/* Byline */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <div>
                    <span className="font-bold text-gray-900">{authorName || 'Newsroom Bureau'}</span>
                    <span className="text-gray-400"> • {authorRole || 'Correspondent'}</span>
                  </div>
                  <span className="text-gray-400">Just now</span>
                </div>
              </div>

              {/* Hero Image in Preview */}
              {heroImage && (
                <div className="space-y-1.5">
                  <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={heroImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';
                      }}
                    />
                  </div>
                  {imageCaption && (
                    <p className="text-[11px] text-gray-500 italic text-right">
                      {imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Body Content in Preview */}
              <div className="space-y-4 text-sm text-gray-800 leading-relaxed font-sans">
                {content ? (
                  content.split(/\n\s*\n/).map((para, idx) => {
                    const trimmed = para.trim();
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="font-sans font-black text-lg text-gray-950 pt-2 border-b border-gray-100 pb-1">
                          {trimmed.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('> ')) {
                      return (
                        <blockquote key={idx} className="p-4 bg-gray-50 border-l-4 border-amber-500 rounded-r-xl italic text-gray-800 font-serif my-3">
                          {trimmed.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    return (
                      <p key={idx} className={idx === 0 ? 'first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-none' : ''}>
                        {trimmed}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-gray-400 italic">
                    Story paragraphs, pull quotes, and subheadings will render here in live broadsheet formatting.
                  </p>
                )}
              </div>

              {/* Verified Sources Box in Preview */}
              {sources.filter((s) => s.title.trim()).length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Primary Evidentiary Records ({sources.filter((s) => s.title.trim()).length})</span>
                  </span>
                  <div className="divide-y divide-gray-200/60 text-xs">
                    {sources.filter((s) => s.title.trim()).map((s, idx) => (
                      <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900 block">{s.title}</span>
                          <span className="text-[10px] text-gray-500">{s.publisher} {s.documentNumber && `• Doc: ${s.documentNumber}`}</span>
                        </div>
                        {s.url && (
                          <span className="text-[10px] text-amber-600 font-bold">Verified Link ↗</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
