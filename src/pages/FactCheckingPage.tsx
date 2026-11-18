import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  CheckCircle2, 
  Search, 
  FileCheck2, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export const FactCheckingPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Standards', path: '/standards' },
    { label: 'Fact-Checking Methodology' },
  ];

  const ratingTaxonomy = [
    {
      rating: 'VERIFIED TRUE',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'The claim is completely accurate, supported in full by primary public records, unedited certified recordings, official statutory notifications, or undisputed physical documentation.',
    },
    {
      rating: 'MOSTLY ACCURATE',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeColor: 'bg-blue-600 text-white',
      desc: 'The primary premise of the claim is factual and verified, though minor non-material contextual nuances or ancillary details require clarification.',
    },
    {
      rating: 'MISLEADING / SELECTIVE CONTEXT',
      color: 'bg-amber-50 text-amber-900 border-amber-300',
      badgeColor: 'bg-amber-600 text-white',
      desc: 'The claim takes real elements of fact out of chronological order, omits critical qualifying data, or frames partial figures to generate a deliberately deceptive narrative.',
    },
    {
      rating: 'FABRICATED / SYNTHETIC AI DEEPFAKE',
      color: 'bg-red-50 text-red-900 border-red-300',
      badgeColor: 'bg-red-700 text-white',
      desc: 'The claim is completely manufactured, relies on synthetic voice cloning, generative AI imagery, staged audio, or forged official letterheads.',
    },
    {
      rating: 'UNSUBSTANTIATED CLAIM',
      color: 'bg-stone-100 text-stone-800 border-stone-300',
      badgeColor: 'bg-stone-600 text-white',
      desc: 'The claim is circulating widely as verified fact, but rigorous investigation reveals no primary evidence, eyewitness testimony, police record, or official documentation to support it.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Triage & Selection Criteria',
      desc: 'We monitor public discourse for claims that meet our public interest threshold: significant virality (100k+ impressions), direct relevance to public safety or elections, communal peace, or statements made by constitutional dignitaries.',
    },
    {
      step: '02',
      title: 'Primary Evidence Retrieval',
      desc: 'We trace claims back to their origin. Rather than citing other media commentary, our researchers access primary government gazettes, Hansard parliamentary debate transcripts, certified FIRs, chargesheets, and scientific databases.',
    },
    {
      step: '03',
      title: 'Multimodal Forensic Analysis',
      desc: 'Visual and auditory media undergo technical interrogation: metadata/EXIF extraction, reverse multi-engine search (Google, Yandex, TinEye), audio spectrogram analysis for artificial timbre/clones, and video keyframe error level analysis.',
    },
    {
      step: '04',
      title: 'Dual-Editor Adjudication & Publishing',
      desc: 'No fact-check is published without unanimous sign-off by the lead researcher and a senior desk editor. We provide direct clickable links to all primary evidence so readers can audit our conclusion independently.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Fact-Checking &amp; Media Watch Desk
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Forensic Verification Charter</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Fact-Checking Methodology &amp; Forensic Rigor
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          In an era where algorithmic feeds amplify sensationalism and generative artificial intelligence can mass-produce synthetic falsehoods, The Dharma Watch Media Watch desk provides a rigorous, non-partisan antidote anchored in verifiable primary evidence.
        </p>
      </header>

      {/* 4-Step Verification Workflow */}
      <section className="bg-white border border-gray-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-600" />
            <span>The Four-Stage Forensic Investigation Pipeline</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {workflowSteps.map((ws) => (
            <div key={ws.step} className="space-y-2 bg-stone-50 p-4 border border-stone-200">
              <span className="text-xl font-black font-mono text-amber-700 block">
                {ws.step}
              </span>
              <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">
                {ws.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                {ws.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Veracity Rating Taxonomy */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-gray-800" />
            <span>The Dharma Watch Veracity Rating Taxonomy</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Every investigated claim is classified under one of five transparent, standardized categories:
          </p>
        </div>

        <div className="space-y-3">
          {ratingTaxonomy.map((item) => (
            <div key={item.rating} className={`p-4 border ${item.color} rounded flex flex-col sm:flex-row sm:items-start gap-3`}>
              <span className={`inline-block px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded ${item.badgeColor} shrink-0`}>
                {item.rating}
              </span>
              <p className="text-xs leading-relaxed font-sans">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Forensics in the AI Era */}
      <section className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-lg space-y-4 border border-stone-800">
        <div className="flex items-center gap-2 text-amber-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">
            Combating Synthetic Media &amp; Voice Clones
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
          The proliferation of diffusion-model imagery and neural voice synthesizers demands new forensic methodologies. Our technical desk extracts camera sensor noise signatures (PRNU), inspects spectral continuity in audio files, and consults official press recordings before declaring any viral visual or audio dispatch authentic.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-stone-400 border-t border-stone-800 pt-3">
          <span>Submit a Viral Claim: <strong className="text-white">tips@thedharmawatch.in</strong></span>
          <span>•</span>
          <Link to="/fact-check" className="text-amber-400 hover:underline font-bold">
            Explore Fact Check Wire Archive →
          </Link>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/editorial-policy" className="text-gray-600 hover:text-gray-900">
          ← Editorial Policy
        </Link>
        <Link to="/corrections" className="text-amber-700 hover:text-amber-900 flex items-center gap-1">
          <span>Public Corrections Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
