import { CaseFile } from '../types';

export const CASE_FILES: CaseFile[] = [
  {
    id: 'dossier-urban-drainage-procurement-audit',
    title: 'The Urban Drainage Procurement Audit: Cross-State RTI Investigation',
    location: {
      country: 'India',
      state: 'Multiple States',
      city: 'Delhi / Bengaluru / Mumbai / Chennai / Patna'
    },
    date: '2026-10-15',
    lastUpdated: '2026-11-15',
    status: 'Verified',
    incidentType: 'Public Spending & Infrastructure Audit',
    summary: 'A comprehensive multi-city investigation evaluating ₹14,200 crore in municipal stormwater drainage tenders. Analysis of 420 RTI responses and certified bill-of-quantities ledgers exposed structural contractor cartels, falsified concrete completion certificates, and acute ecological encroachment over natural drainage corridors.',
    whatIsConfirmed: [
      'Disbursement of ₹14,200 crore across five municipal corporations between 2023 and 2026.',
      'Core-drilling samples from 82 project sites revealed 64% used unreinforced masonry instead of certified RCC retaining walls.',
      'Identical registered company addresses and PANs shared by supposedly competing bidding entities in three municipal zones.',
      'Formal transmission of audit findings to state vigilance bureaus and High Court oversight panels.'
    ],
    whatIsAlleged: [
      'Systematic kickback channels routed via benami real estate developers currently under review by state anti-corruption authorities.'
    ],
    unverifiedClaims: [],
    timeline: [
      {
        id: 'tm-drainage-1',
        date: '2026-01-10',
        headline: 'Filing of 420 RTI Applications',
        description: 'DharmaWatch investigative teams file coordinated Right to Information requests across five metropolitan municipal bodies.',
        verificationStatus: 'Confirmed'
      },
      {
        id: 'tm-drainage-2',
        date: '2026-06-20',
        headline: 'Receipt & Tabulation of Bill-of-Quantities Ledgers',
        description: 'Over 18,000 pages of municipal engineering disclosures compiled into a relational database.',
        verificationStatus: 'Confirmed'
      },
      {
        id: 'tm-drainage-3',
        date: '2026-10-15',
        headline: 'Physical Site Sampling & Core Testing',
        description: 'Independent structural engineers execute ultrasonic pulse velocity tests across 82 drainage canals.',
        verificationStatus: 'Confirmed'
      },
      {
        id: 'tm-drainage-4',
        date: '2026-11-14',
        headline: 'Publication of Investigative Dossier',
        description: 'Full investigative findings published and submitted to judicial monitoring committees.',
        verificationStatus: 'Confirmed'
      }
    ],
    primaryDocuments: [
      {
        id: 'doc-drainage-rti',
        title: 'Compiled RTI Disclosures on Municipal Stormwater Procurement (2023-2026)',
        type: 'Government document',
        date: '2026-10-15',
        filingAuthority: 'Municipal Corporations & State Vigilance Commissions',
        documentNumber: 'RTI-DW-2026-DRAIN-AUDIT',
        classification: 'Primary Public Record',
        notes: 'Compiled municipal and RTI audit ledgers across five municipal corporations.'
      }
    ],
    officialStatements: [
      {
        id: 'stmt-drainage-1',
        authority: 'Municipal Corporation Oversight Committee',
        date: '2026-11-15',
        medium: 'Official Press Statement',
        summary: 'Review of structural audit and commencement of blacklisting proceedings',
        directExcerpt: 'The discrepancies highlighted in the structural audit will be investigated with forensic rigor, and blacklisting proceedings have commenced against non-compliant entities.',
        verified: true
      }
    ],
    courtDevelopments: [],
    sources: [],
    updates: [],
    relatedArticleIds: ['art-investigation-urban-flood-drainage-audit-five-cities']
  },
  {
    id: 'dossier-clean-energy-transmission-grid',
    title: 'National Clean Energy Grid Project Tracker: Evacuation & Storage Infrastructure',
    location: {
      country: 'India',
      state: 'Multiple States',
      city: 'Rajasthan / Gujarat / Ladakh / Southern Grid'
    },
    date: '2026-08-01',
    lastUpdated: '2026-11-15',
    status: 'Verified',
    incidentType: 'Energy Transition & Infrastructure Tracking',
    summary: 'A project monitoring dossier tracking the implementation of the ₹85,000-crore High Voltage Direct Current (HVDC) interstate green corridors designed to evacuate 500 GW of renewable energy by 2030.',
    whatIsConfirmed: [
      'Statutory enactment of the National Clean Energy Grid Integration Bill 2026.',
      'Commissioning of the first 4,000 MW Desert Solar HVDC corridor linking Bhadla Solar Park to the Western industrial hub.',
      'Establishment of central grid frequency stabilization reserves.'
    ],
    whatIsAlleged: [],
    unverifiedClaims: [],
    timeline: [
      {
        id: 'tm-energy-1',
        date: '2026-03-15',
        headline: 'Union Cabinet Approves Interstate Green Corridor Phase 2',
        description: 'Approval of ₹85,000 crore capital expenditure program for ultra-high voltage transmission.',
        verificationStatus: 'Confirmed'
      },
      {
        id: 'tm-energy-2',
        date: '2026-11-15',
        headline: 'Parliamentary Enactment of Clean Grid Integration Bill',
        description: 'Bipartisan approval grants statutory power for grid integration and tariff equalization.',
        verificationStatus: 'Confirmed'
      }
    ],
    primaryDocuments: [
      {
        id: 'doc-energy-bill',
        title: 'National Clean Energy Grid Integration Act 2026',
        type: 'Government document',
        date: '2026-11-15',
        filingAuthority: 'Parliament of India',
        documentNumber: 'ACT-BILL-2026-GRID-500GW',
        classification: 'Primary Public Record',
        notes: 'Statutory enactment providing interstate transmission rights and storage reserve quotas.'
      }
    ],
    officialStatements: [
      {
        id: 'stmt-energy-1',
        authority: 'Ministry of Power',
        date: '2026-11-15',
        medium: 'Parliamentary Address',
        summary: 'Enactment of clean power evacuation infrastructure',
        directExcerpt: 'India’s green corridor represents the largest interconnected clean power evacuation infrastructure in the developing world.',
        verified: true
      }
    ],
    courtDevelopments: [],
    sources: [],
    updates: [],
    relatedArticleIds: ['art-national-parliament-winter-session-green-energy-grid']
  }
];
