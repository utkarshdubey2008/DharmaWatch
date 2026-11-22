import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { CaseFilesPage } from './pages/CaseFilesPage';
import { CaseFileDetailPage } from './pages/CaseFileDetailPage';
import { ArchivePage } from './pages/ArchivePage';
import { SearchPage } from './pages/SearchPage';
import { DataPage } from './pages/DataPage';
import { AboutPage } from './pages/AboutPage';
import { PublicationHubPage } from './pages/PublicationHubPage';
import { OwnershipFundingPage } from './pages/OwnershipFundingPage';
import { StandardsHubPage } from './pages/StandardsHubPage';
import { EditorialPage } from './pages/EditorialPage';
import { EditorialPolicyPage } from './pages/EditorialPolicyPage';
import { FactCheckingPage } from './pages/FactCheckingPage';
import { CorrectionsPage } from './pages/CorrectionsPage';
import { SourcesAttributionPage } from './pages/SourcesAttributionPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';
import { GrievanceRedressalPage } from './pages/GrievanceRedressalPage';
import { ComplianceReportPage } from './pages/ComplianceReportPage';
import { AiUsagePolicyPage } from './pages/AiUsagePolicyPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { AdvertisingPage } from './pages/AdvertisingPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { AuthorPage } from './pages/AuthorPage';
import { ContactPage } from './pages/ContactPage';
import { PostStoryPage } from './pages/PostStoryPage';
import { SyndicationDocsPage } from './pages/SyndicationDocsPage';

// Admin CMS Imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminArticlesPage } from './admin/pages/AdminArticlesPage';
import { AdminArticleEditorPage } from './admin/pages/AdminArticleEditorPage';
import { AdminOpinionsPage } from './admin/pages/AdminOpinionsPage';
import { AdminInvestigationsPage } from './admin/pages/AdminInvestigationsPage';
import { AdminCaseFilesPage } from './admin/pages/AdminCaseFilesPage';
import { AdminCaseFileEditorPage } from './admin/pages/AdminCaseFileEditorPage';
import { AdminHomepagePage } from './admin/pages/AdminHomepagePage';
import { AdminMediaPage } from './admin/pages/AdminMediaPage';
import { AdminAuthorsPage } from './admin/pages/AdminAuthorsPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminCorrectionsPage } from './admin/pages/AdminCorrectionsPage';
import { AdminAuditLogPage } from './admin/pages/AdminAuditLogPage';
import { AdminAnalyticsPage } from './admin/pages/AdminAnalyticsPage';
import { AdminSubscribersPage } from './admin/pages/AdminSubscribersPage';
import { AdminCompliancePage } from './admin/pages/AdminCompliancePage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';

import { DOCS_CONFIG } from './config/docsConfig';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* ========================================================= */}
            {/* ADMIN NEWSROOM & CMS ROUTES (Isolated from Public Layout) */}
            {/* ========================================================= */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="articles/new" element={<AdminArticleEditorPage />} />
              <Route path="articles/:id/edit" element={<AdminArticleEditorPage />} />
              <Route path="opinions" element={<AdminOpinionsPage />} />
              <Route path="investigations" element={<AdminInvestigationsPage />} />
              <Route path="case-files" element={<AdminCaseFilesPage />} />
              <Route path="case-files/new" element={<AdminCaseFileEditorPage />} />
              <Route path="case-files/:id/edit" element={<AdminCaseFileEditorPage />} />
              <Route path="homepage" element={<AdminHomepagePage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="authors" element={<AdminAuthorsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="corrections" element={<AdminCorrectionsPage />} />
              <Route path="audit-log" element={<AdminAuditLogPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="subscribers" element={<AdminSubscribersPage />} />
              <Route path="compliance" element={<AdminCompliancePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Dedicated Newsroom Dispatch Studio */}
            <Route path="/post" element={<PostStoryPage />} />
            <Route path="/publish" element={<PostStoryPage />} />
            <Route path="/newsroom/post" element={<PostStoryPage />} />

            {/* Secret Syndication & API Docs Vault (Configurable Route) */}
            <Route path={DOCS_CONFIG.route} element={<SyndicationDocsPage />} />

            {/* ========================================================= */}
            {/* PUBLIC WEBSITE ROUTES (MainLayout) */}
            {/* ========================================================= */}
            <Route path="/" element={<MainLayout />}>
              {/* Core Front Page */}
              <Route index element={<HomePage />} />

              {/* Specialized Institutional & Archival Hubs */}
              <Route path="investigations" element={<InvestigationsPage />} />
              <Route path="case-files" element={<CaseFilesPage />} />
              <Route path="case-files/:caseId" element={<CaseFileDetailPage />} />
              <Route path="archive" element={<ArchivePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="data" element={<DataPage />} />

              {/* Governance, Institutional & Transparency */}
              <Route path="publication" element={<PublicationHubPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="about-us" element={<AboutPage />} />
              <Route path="publication/about" element={<AboutPage />} />
              <Route path="ownership-and-funding" element={<OwnershipFundingPage />} />
              <Route path="ownership" element={<OwnershipFundingPage />} />
              <Route path="publication/ownership" element={<OwnershipFundingPage />} />
              
              {/* Standards, Charters & Verification Protocols */}
              <Route path="standards" element={<StandardsHubPage />} />
              <Route path="our-standards" element={<StandardsHubPage />} />
              <Route path="editorial" element={<EditorialPage />} />
              <Route path="standards/editorial" element={<EditorialPage />} />
              <Route path="editorial-policy" element={<EditorialPolicyPage />} />
              <Route path="standards/editorial-policy" element={<EditorialPolicyPage />} />
              <Route path="fact-checking" element={<FactCheckingPage />} />
              <Route path="standards/fact-checking" element={<FactCheckingPage />} />
              <Route path="corrections" element={<CorrectionsPage />} />
              <Route path="standards/corrections" element={<CorrectionsPage />} />
              <Route path="sources-and-attribution" element={<SourcesAttributionPage />} />
              <Route path="sources" element={<SourcesAttributionPage />} />
              <Route path="standards/sources" element={<SourcesAttributionPage />} />

              {/* Legal, Privacy & Operational Charters */}
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="terms-of-use" element={<TermsOfUsePage />} />
              <Route path="terms" element={<TermsOfUsePage />} />
              <Route path="grievance-redressal" element={<GrievanceRedressalPage />} />
              <Route path="grievance" element={<GrievanceRedressalPage />} />
              <Route path="compliance-report" element={<ComplianceReportPage />} />
              <Route path="compliance" element={<ComplianceReportPage />} />
              <Route path="monthly-compliance-report" element={<ComplianceReportPage />} />
              <Route path="grievance-officer" element={<ContactPage />} />
              <Route path="ai-usage-policy" element={<AiUsagePolicyPage />} />
              <Route path="ai-policy" element={<AiUsagePolicyPage />} />
              <Route path="ai" element={<AiUsagePolicyPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />
              <Route path="advertising" element={<AdvertisingPage />} />
              <Route path="advertise" element={<AdvertisingPage />} />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="op-ed-submissions" element={<SubmissionsPage />} />

              <Route path="contact" element={<ContactPage />} />
              <Route path="contact-us" element={<ContactPage />} />
              <Route path="publication/contact" element={<ContactPage />} />
              <Route path="tips" element={<ContactPage />} />
              <Route path="submit-tip" element={<ContactPage />} />
              <Route path="authors/:slug" element={<AuthorPage />} />

              {/* Article Direct Alias */}
              <Route path="article/:slug" element={<ArticlePage />} />

              {/* Clean Section / Category Routes */}
              <Route path=":category" element={<CategoryPage />} />

              {/* Article Detail Pages under Category */}
              <Route path=":category/:slug" element={<ArticlePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
