import { ResearchDataset } from '../types';

/**
 * Structured public interest datasets and data journalism metrics for DharmaWatch Data & Research.
 * Mainstream economic, governance, constitutional, and infrastructure datasets.
 */
export const RESEARCH_DATASETS: ResearchDataset[] = [
  {
    id: 'ds-clean-energy-grid',
    title: 'National Clean Energy Grid & Interstate Transmission Tracker (2020–2026)',
    category: 'Energy & Infrastructure',
    lastUpdated: '2026-11-10',
    coveragePeriod: '2020 - 2026',
    recordsCount: 1420,
    verifiedPercentage: 99.2,
    description: 'Systematic index of interstate high-voltage direct-current (HVDC) transmission lines, substation capacity, and renewable energy curtailment logs across India.',
    methodologyNote: 'Entries are compiled directly from Central Electricity Authority (CEA) monthly bulletins, Power Grid Corporation of India grid frequency telemetry, and state transmission regulatory filings.',
    keyFindings: [
      'Interstate renewable energy evacuation capacity reached 242 GW by Q3 2026, marking a 34% increase over 2024 baselines.',
      'Average grid transmission loss across HVDC corridors declined to 2.1%, beating international benchmarks for long-distance bulk transfer.',
      'Desert solar parks in Rajasthan and Gujarat achieved a peak evacuation reliability index of 98.6% during seasonal summer demand surges.'
    ],
    primarySourceTypes: ['Central Electricity Authority Bulletins', 'Grid-India Real-Time Telemetry', 'State Load Despatch Center Logs', 'CERC Regulatory Tariffs']
  },
  {
    id: 'ds-infrastructure-procurement-audit',
    title: 'Metropolitan Stormwater & Drainage Procurement Audit (2021–2026)',
    category: 'Urban Governance & Public Spending',
    lastUpdated: '2026-11-14',
    coveragePeriod: '2021 - 2026',
    recordsCount: 420,
    verifiedPercentage: 97.8,
    description: 'Forensic evaluation tracking ₹14,200 crore in municipal stormwater tenders across five major metropolitan corridors (Delhi, Mumbai, Bengaluru, Chennai, Patna).',
    methodologyNote: 'Synthesizes 420 primary RTI responses, certified bill-of-quantities engineering registers, CAG performance audits, and independent core-sampling laboratory assays.',
    keyFindings: [
      '64% of examined project corridors exhibited discrepancies between certified bill-of-quantities specifications and actual physical field construction.',
      'Identical registered PAN addresses and corporate director networks identified across 28 bidding consortia.',
      'State vigilance commissions initiated asset-attachment and contractor blacklisting proceedings following publication of primary dossier.'
    ],
    primarySourceTypes: ['Municipal RTI Disclosures', 'CAG Performance Audits', 'Ultrasonic Pulse Core Laboratory Assays', 'State Vigilance Reports']
  },
  {
    id: 'ds-supreme-court-bench-metrics',
    title: 'Supreme Court Constitutional Bench & Disposal Velocity Metrics (2018–2026)',
    category: 'Judiciary & Constitutional Law',
    lastUpdated: '2026-10-30',
    coveragePeriod: '2018 - 2026',
    recordsCount: 860,
    verifiedPercentage: 100.0,
    description: 'Empirical judicial analysis examining constitutional bench composition, Article 21 hearing intervals, case pendency rates, and digital accessibility indicators.',
    methodologyNote: 'Extracted directly from the National Judicial Data Grid (NJDG), certified Supreme Court of India registry daily orders, and official e-Courts XML feeds.',
    keyFindings: [
      'Five-judge and seven-judge constitutional bench disposal velocity accelerated by 48% following the institutionalization of permanent Constitution Benches.',
      'Average pendency duration for landmark constitutional matters reduced from 7.2 years to 2.8 years.',
      'Multilingual digital judgment accessibility (translating verdicts into 22 Eighth Schedule languages) attained 91% coverage across reported decisions.'
    ],
    primarySourceTypes: ['Supreme Court Registry Orders', 'National Judicial Data Grid', 'Law Commission Reports', 'e-Courts Repository']
  },
  {
    id: 'ds-fdi-semiconductor-ecosystem',
    title: 'National Semiconductor & High-Tech Manufacturing PLI Capital Outlay (2022–2026)',
    category: 'Economy, Tech & Industrial Policy',
    lastUpdated: '2026-11-05',
    coveragePeriod: '2022 - 2026',
    recordsCount: 310,
    verifiedPercentage: 98.9,
    description: 'Tracking commercial fabrication milestones, assembly-and-test facilities, and ancillary supply chain capital expenditure under the India Semiconductor Mission.',
    methodologyNote: 'Tracks quarterly statutory filings with the Ministry of Electronics and Information Technology (MeitY), industrial development corporations, and SEBI disclosures.',
    keyFindings: [
      'Total verified commercial capex commitments across Dholera, Sanand, and Noida surpassed ₹1,85,000 crore ($22.2 billion) as of Q3 2026.',
      'Cleanroom qualification completed for two primary 28nm/40nm commercial fab nodes ahead of statutory commissioning deadlines.',
      'Over 140 domestic tier-1 and tier-2 chemical, gas, and precision packaging suppliers onboarded into the domestic ecosystem.'
    ],
    primarySourceTypes: ['India Semiconductor Mission Disclosures', 'MeitY Quarterly PLI Ledgers', 'State Industrial Development Corp MoUs', 'SEBI Corporate Filings']
  }
];

export const DEMO_STAT_SUMMARY = {
  totalDocumentedRecords: 3010,
  verifiedPrimarySources: 2840,
  activeCaseFiles: 14,
  resolvedRestitutions: 86,
  reconciliationAuditAcreage: '₹1.85 Lakh Cr',
  lastSyncTimestamp: '2026-11-15T18:30:00Z'
};

export const DEMO_CHART_RESTITUTION_BY_YEAR = [
  { year: '2020', count: 45, label: '45 GW' },
  { year: '2021', count: 68, label: '68 GW' },
  { year: '2022', count: 95, label: '95 GW' },
  { year: '2023', count: 135, label: '135 GW' },
  { year: '2024', count: 178, label: '178 GW' },
  { year: '2025', count: 215, label: '215 GW' },
  { year: '2026 (YTD)', count: 242, label: '242 GW' },
];

export const DEMO_CHART_STATUS_BREAKDOWN = [
  { status: 'Verified Primary Government & Statutory Records', percentage: 78, color: '#D97706' },
  { status: 'Statutory Regulatory Disclosures & Filings', percentage: 14, color: '#111827' },
  { status: 'Independent Laboratory & Forensic Assays', percentage: 6, color: '#059669' },
  { status: 'Public RTI Disclosures in Review', percentage: 2, color: '#6B7280' },
];
