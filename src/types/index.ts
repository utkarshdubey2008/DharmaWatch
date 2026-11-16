export type ArticleStatus = 'Published' | 'Updated' | 'Correction' | 'Investigating';

export type VerificationGrade = 'Confirmed' | 'Allegation' | 'Unverified';

export type SourceType =
  | 'Court document'
  | 'Government document'
  | 'Police statement'
  | 'Official statement'
  | 'FIR'
  | 'Academic research'
  | 'News report'
  | 'Interview'
  | 'Archive'
  | 'Other';

export type SourceClassification = 'Primary' | 'Secondary';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  sourceType: SourceType;
  publicationDate: string;
  url?: string;
  classification: SourceClassification;
  archivedUrl?: string;
  documentNumber?: string;
  verifiedStatus?: VerificationGrade;
  notes?: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: string;
  areasOfCoverage: string[];
  email?: string;
  pgpKeyFingerprint?: string;
}

export interface ArticleCorrection {
  id: string;
  date: string;
  whatWasChanged: string;
  reason: string;
  originalPublicationDate: string;
  version: string;
}

export interface ArticleLocation {
  country: string;
  state?: string;
  city?: string;
  coordinates?: [number, number];
}

export interface ArticleEvidenceSummary {
  confirmed: string[];
  alleged: string[];
  unverified: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  deck: string; // Subheadline / explanatory deck
  category: string;
  categorySlug: string;
  subcategory?: string;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  heroImage?: string;
  imageCaption?: string;
  content: string[]; // Formatted paragraphs and pullquotes
  pullQuotes?: string[];
  tags: string[];
  sources: Source[];
  status: ArticleStatus;
  location: ArticleLocation;
  isInvestigation?: boolean;
  isLead?: boolean;
  isBreaking?: boolean;
  isOpinion?: boolean;
  isFactCheck?: boolean;
  readTimeMinutes: number;
  evidenceSummary?: ArticleEvidenceSummary;
  corrections?: ArticleCorrection[];
  relatedArticleIds?: string[];
}

export type CaseFileStatus = 'Developing' | 'Under Investigation' | 'In Court' | 'Resolved' | 'Archived' | 'Verified';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  headline: string;
  description: string;
  verificationStatus: VerificationGrade;
  sourceType?: SourceType;
  sourceRef?: string;
  documentNumber?: string;
}

export interface CaseDocument {
  id: string;
  title: string;
  type: string;
  date: string;
  filingAuthority: string;
  documentNumber: string;
  classification: 'Primary Public Record' | 'Official Certified Copy' | 'Filed Affidavit';
  fileSize?: string;
  notes: string;
}

export interface OfficialStatement {
  id: string;
  authority: string;
  date: string;
  medium: string;
  summary: string;
  directExcerpt: string;
  verified: boolean;
}

export interface CourtDevelopment {
  id: string;
  court: string;
  bench?: string;
  caseNumber: string;
  date: string;
  stage: string;
  orderSummary: string;
  nextHearingDate?: string;
}

export interface CaseUpdate {
  id: string;
  date: string;
  title: string;
  text: string;
  verified: boolean;
}

export interface CaseFile {
  id: string; // e.g. "DW-2026-0001"
  title: string;
  location: ArticleLocation;
  date: string;
  lastUpdated: string;
  status: CaseFileStatus;
  summary: string;
  incidentType: string;
  timeline: TimelineEvent[];
  whatIsConfirmed: string[];
  whatIsAlleged: string[];
  unverifiedClaims: string[];
  primaryDocuments: CaseDocument[];
  officialStatements: OfficialStatement[];
  courtDevelopments: CourtDevelopment[];
  relatedArticleIds: string[];
  updates: CaseUpdate[];
  sources: Source[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
  subcategories?: string[];
}

export interface PublicCorrectionItem {
  id: string;
  articleTitle: string;
  articleSlug: string;
  category: string;
  originalPublicationDate: string;
  correctionDate: string;
  whatWasChanged: string;
  reasonForCorrection: string;
  currentVersion: string;
  archivalNote?: string;
}

export interface ResearchDataset {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  coveragePeriod: string;
  recordsCount: number;
  verifiedPercentage: number;
  description: string;
  methodologyNote: string;
  keyFindings: string[];
  primarySourceTypes: string[];
}
