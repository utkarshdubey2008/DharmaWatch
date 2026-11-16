import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'national',
    name: 'National',
    slug: 'national',
    description: 'Comprehensive coverage of Indian politics, Parliament, Supreme Court jurisprudence, governance, federalism, and state developments.',
    articleCount: 48,
    subcategories: [
      'Politics & Elections',
      'Parliament & Legislation',
      'Supreme Court & Judiciary',
      'Governance & States',
      'Defence & Strategic Security',
      'Public Policy'
    ],
  },
  {
    id: 'world',
    name: 'World',
    slug: 'world',
    description: 'International diplomacy, global geopolitics, South Asian neighborhood, multilateral alliances, and diaspora affairs.',
    articleCount: 32,
    subcategories: [
      'South Asia & Neighbors',
      'Indo-Pacific & Strategic Alliances',
      'Global Powers & Diplomacy',
      'Conflict, Treaties & Security',
      'Global Indian Diaspora',
      'Multilateral Bodies & UN'
    ],
  },
  {
    id: 'economy',
    name: 'Economy & Business',
    slug: 'economy',
    description: 'Macroeconomic analysis, RBI monetary policy, banking, capital markets, industrial growth, technology ecosystems, and trade.',
    articleCount: 36,
    subcategories: [
      'Macroeconomy & Fiscal Policy',
      'Banking, RBI & Credit',
      'Stock Markets & Corporate Affairs',
      'Tech, Startups & AI',
      'Trade, Energy & Infrastructure',
      'Agriculture & Rural Economy'
    ],
  },
  {
    id: 'opinions',
    name: 'Opinion & Editorial',
    slug: 'opinions',
    description: "The Dharma Watch's flagship editorial positions, authoritative columnists, constitutional debates, policy critiques, and scholarly essays.",
    articleCount: 28,
    subcategories: [
      'The Dharma View (Editorials)',
      'Signed Columns',
      'Constitutional & Legal Debates',
      'Economic Perspectives',
      'Global Affairs Commentary',
      'Letters to the Editor'
    ],
  },
  {
    id: 'investigations',
    name: 'Investigations & Watchdog',
    slug: 'investigations',
    description: 'In-depth investigative dossiers, forensic document trails, RTI audits, public spending scrutiny, and verified accountability reporting.',
    articleCount: 26,
    subcategories: [
      'Special Investigative Dossiers',
      'RTI & Public Records Audits',
      'Corporate & Financial Scrutiny',
      'Judicial & Law Enforcement Audits',
      'Environmental & Resource Watch',
      'Case File Registries'
    ],
  },
  {
    id: 'society-culture',
    name: 'Society & Culture',
    slug: 'society-culture',
    description: 'Civil liberties, ancient and living heritage, architectural conservation, educational developments, communities, and literature.',
    articleCount: 34,
    subcategories: [
      'Heritage, Temples & Monuments',
      'Civil Liberties & Human Rights',
      'Education & Scientific Research',
      'Faith, Traditions & Philosophy',
      'Art, Literature & Cinema',
      'Environment & Ecology'
    ],
  },
  {
    id: 'fact-check',
    name: 'Fact Check & Media Watch',
    slug: 'fact-check',
    description: 'Forensic debunking of viral disinformation, AI-generated synthetic media, manipulated clips, and narrative distortion audits.',
    articleCount: 20,
    subcategories: [
      'Viral Disinformation Audits',
      'AI & Deepfake Verification',
      'Media Distortion Analysis',
      'Certified Document Chronologies',
      'Claim-vs-Fact Trackers'
    ],
  },
  {
    id: 'crime-justice',
    name: 'Crime & Justice',
    slug: 'crime-justice',
    description: 'Police investigations, certified FIRs, chargesheets, criminal jurisprudence, cyber security, and public safety enforcement.',
    articleCount: 24,
    subcategories: [
      'Police Inquiries & FIRs',
      'Court Remands & Chargesheets',
      'Organized Crime & Cyber Fraud',
      'Public Safety & Civil Protection',
      'Forensic Evidence'
    ],
  },
  // Backwards compatibility sections
  {
    id: 'india',
    name: 'India Wire',
    slug: 'india',
    description: 'National and state developments, policy updates, and ground reports from across India.',
    articleCount: 38,
    subcategories: ['Governance', 'State Policies', 'Legal Cases & FIRs', 'Public Welfare'],
  },
  {
    id: 'temple-heritage',
    name: 'Temple & Heritage',
    slug: 'temple-heritage',
    description: 'Documenting temple conservation, architectural heritage, historical sites, idol restitution, and sacred geography.',
    articleCount: 18,
    subcategories: ['Vandalism & Restitution', 'Land Encroachment & Cadastre', 'Idol Theft & Restitution', 'Temple Autonomy'],
  },
  {
    id: 'violence',
    name: 'Violence & Public Safety',
    slug: 'violence',
    description: 'Documented incidents of violence, targeted crime, communal clashes, and law enforcement interventions.',
    articleCount: 22,
    subcategories: ['Targeted Assaults', 'Mob Violence', 'Property Destruction', 'Police Inquiries'],
  },
  {
    id: 'persecution',
    name: 'Civil Liberties & Rights',
    slug: 'persecution',
    description: 'Systematic documentation of discrimination, civil liberty violations, demographic intimidation, and institutional bias.',
    articleCount: 19,
    subcategories: ['Forced Conversion & Abduction', 'Institutional Bias', 'Religious Restrictions', 'Minority Rights'],
  },
  {
    id: 'archive',
    name: 'Archive & Dossiers',
    slug: 'archive',
    description: 'Permanent judicial records, investigative chronologies, verified archives, and historical data repositories.',
    articleCount: 140,
    subcategories: ['Court Archives', 'Investigative Dossiers', 'Annual Chronologies'],
  },
];
