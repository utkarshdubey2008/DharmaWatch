import { Source } from '../types';

/**
 * Sources Catalog for DharmaWatch.
 * Anchored exclusively in primary public records, court orders, government notifications,
 * parliamentary transcripts, and regulatory disclosures.
 */
export const SOURCES_CATALOG: Record<string, Source> = {
  'src-sc-verdict-2026-privacy': {
    id: 'src-sc-verdict-2026-privacy',
    title: 'Supreme Court Judgment: WP(C) 342/2024 on Electronic Surveillance and Privacy',
    publisher: 'Supreme Court of India',
    sourceType: 'Court document',
    publicationDate: '2026-11-14',
    classification: 'Primary',
    documentNumber: 'WP(C) 342/2024',
    verifiedStatus: 'Confirmed',
    notes: 'Five-judge Constitution Bench unanimous judgment establishing mandatory judicial warrants for telecom interception.'
  },
  'src-parliament-bill-2026': {
    id: 'src-parliament-bill-2026',
    title: 'National Clean Energy Grid Integration Bill 2026 - Parliamentary Record',
    publisher: 'Lok Sabha Secretariat',
    sourceType: 'Government document',
    publicationDate: '2026-11-12',
    classification: 'Primary',
    documentNumber: 'Bill No. 104 of 2026',
    verifiedStatus: 'Confirmed',
    notes: 'Statutory framework for interstate green power transmission corridors and battery storage mandates.'
  },
  'src-rbi-mpc-statement-2026': {
    id: 'src-rbi-mpc-statement-2026',
    title: 'Monetary Policy Statement: Reserve Bank of India',
    publisher: 'Reserve Bank of India',
    sourceType: 'Official statement',
    publicationDate: '2026-11-10',
    classification: 'Primary',
    documentNumber: 'RBI/2026-27/84',
    verifiedStatus: 'Confirmed',
    notes: 'Bi-monthly monetary policy committee decision maintaining policy repo rate at 6.25%.'
  },
  'src-semicon-dholera-update': {
    id: 'src-semicon-dholera-update',
    title: 'India Semiconductor Mission Official Status Report',
    publisher: 'Ministry of Electronics & IT',
    sourceType: 'Government document',
    publicationDate: '2026-11-08',
    classification: 'Primary',
    documentNumber: 'MeitY-ISM-2026-Q3',
    verifiedStatus: 'Confirmed',
    notes: 'Progress report verifying pilot silicon wafer runs at the Dholera commercial semiconductor fabrication facility.'
  },
  'src-dw-rti-drainage-2026': {
    id: 'src-dw-rti-drainage-2026',
    title: 'Municipal Right to Information Disclosures on Stormwater Drainage Contracts (2023-2026)',
    publisher: 'The Dharma Watch Investigative Bureau',
    sourceType: 'Government document',
    publicationDate: '2026-11-14',
    classification: 'Primary',
    documentNumber: 'RTI-DW-2026-DRAIN-AUDIT',
    verifiedStatus: 'Confirmed',
    notes: 'Cross-state tabulation of 420 RTI responses and certified bill-of-quantities engineering registers.'
  },
  'src-quad-declaration-2026': {
    id: 'src-quad-declaration-2026',
    title: 'Joint Declaration of the Quad Leaders Summit',
    publisher: 'Ministry of External Affairs, India',
    sourceType: 'Official statement',
    publicationDate: '2026-11-06',
    classification: 'Primary',
    documentNumber: 'MEA-PR-2026-11-06',
    verifiedStatus: 'Confirmed',
    notes: 'Quad leaders joint communique launching Indo-Pacific maritime domain awareness architecture.'
  },
  'src-nmm-portal-2026': {
    id: 'src-nmm-portal-2026',
    title: 'Jnana Bhandara National Manuscripts Portal Launch Document',
    publisher: 'Ministry of Culture, Government of India',
    sourceType: 'Government document',
    publicationDate: '2026-11-04',
    classification: 'Primary',
    documentNumber: 'MoC-NMM-2026-04',
    verifiedStatus: 'Confirmed',
    notes: 'Open-access digital archiving initiative digitizing one million ancient Indian manuscripts.'
  },
  'src-eci-clarification-2026': {
    id: 'src-eci-clarification-2026',
    title: 'Election Commission of India Clarification on Fabricated Audio Clip',
    publisher: 'Election Commission of India',
    sourceType: 'Official statement',
    publicationDate: '2026-11-13',
    classification: 'Primary',
    documentNumber: 'ECI-PN-2026-92',
    verifiedStatus: 'Confirmed',
    notes: 'Forensic clarification establishing that a viral voice clone attributed to the Chief Election Commissioner was synthetic AI audio.'
  },
  'src-jrc-joint-statement': {
    id: 'src-jrc-joint-statement',
    title: 'Joint Press Release of the 38th India-Bangladesh Joint Rivers Commission',
    publisher: 'Ministry of External Affairs, India',
    sourceType: 'Official statement',
    publicationDate: '2026-11-02',
    classification: 'Primary',
    documentNumber: 'MEA-PR-2026-11-02',
    verifiedStatus: 'Confirmed',
    notes: 'Bilateral technical agreements on Teesta and Kushiyara hydrological data exchange.'
  },
  'src-sebi-circular-2026': {
    id: 'src-sebi-circular-2026',
    title: 'SEBI Circular on Systemic Risk and High-Frequency Trading Guidelines',
    publisher: 'Securities and Exchange Board of India',
    sourceType: 'Government document',
    publicationDate: '2026-10-28',
    classification: 'Primary',
    documentNumber: 'SEBI/HO/MRD/2026/14',
    verifiedStatus: 'Confirmed',
    notes: 'Mandatory co-location and algorithmic trading risk parameters.'
  },
  'src-eci-roll-update': {
    id: 'src-eci-roll-update',
    title: 'ECI Press Note on National Electoral Roll Cleansing & De-Duplication',
    publisher: 'Election Commission of India',
    sourceType: 'Official statement',
    publicationDate: '2026-10-24',
    classification: 'Primary',
    documentNumber: 'ECI-PN-2026-88',
    verifiedStatus: 'Confirmed',
    notes: 'Removal of 3.8 million duplicate voter records using demographic and geospatial validation.'
  }
};
