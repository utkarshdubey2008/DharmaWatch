import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { CaseFile, CaseDocument } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { CaseFileTimeline } from '../components/caseFile/CaseFileTimeline';
import { CaseStatusBadge } from '../components/caseFile/CaseFileCard';
import { SourceList } from '../components/article/SourceList';
import {
  Calendar,
  MapPin,
  FileText,
  Scale,
  Eye,
  X,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

export const CaseFileDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'documents' | 'court'>('timeline');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!caseId) return;
      setIsLoading(true);
      const data = await contentService.getCaseFileById(caseId);
      if (data) {
        setCaseFile(data);
        document.title = `${data.title} - Project Dossier - DharmaWatch`;
      }
      setIsLoading(false);
    };

    fetchDetails();
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
          Loading project dossier...
        </p>
      </div>
    );
  }

  if (!caseFile) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <h2 className="font-sans font-bold text-2xl text-gray-900 mb-2">
          Project Dossier Not Found
        </h2>
        <p className="text-sm text-gray-600 font-sans mb-6">
          The requested project record could not be located in the archives.
        </p>
        <Link
          to="/case-files"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs uppercase font-bold rounded-lg"
        >
          Return to Project Trackers
        </Link>
      </div>
    );
  }

  const locationText = caseFile.location.city
    ? `${caseFile.location.city}, ${caseFile.location.state ? `${caseFile.location.state}, ` : ''}${caseFile.location.country}`
    : caseFile.location.state
    ? `${caseFile.location.state}, ${caseFile.location.country}`
    : caseFile.location.country;

  const breadcrumbs = [
    { label: 'Project Trackers', path: '/case-files' },
    { label: caseFile.title },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Case Dossier Masthead */}
      <div className="border border-gray-200 bg-white p-4 sm:p-6 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-600">
              {caseFile.incidentType}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CaseStatusBadge status={caseFile.status} />
            <span>Updated: {caseFile.lastUpdated}</span>
          </div>
        </div>

        <h1 className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-gray-900 leading-snug">
          {caseFile.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            {locationText}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            Initiated: {caseFile.date}
          </span>
        </div>

        <div className="pt-3 text-sm text-gray-700 leading-relaxed font-sans border-t border-gray-100">
          {caseFile.summary}
        </div>
      </div>

      {/* Structured Tabs */}
      <div className="border-b border-gray-200 flex gap-6 text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-black text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Milestones ({caseFile.timeline.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'border-black text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Audit Findings &amp; Facts</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'border-black text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Official Disclosures ({caseFile.primaryDocuments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('court')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'court'
              ? 'border-black text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Regulatory &amp; Legal Actions</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-xl text-gray-900">
              Chronology of Project Milestones
            </h3>
            <CaseFileTimeline events={caseFile.timeline} />
          </div>
        )}

        {/* Evidence & Facts Summary */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <h3 className="font-sans font-bold text-xl text-gray-900">
              Key Audit Findings &amp; Documented Metrics
            </h3>
            <div className="space-y-6 text-sm leading-relaxed">
              {/* Confirmed points */}
              <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Established on Primary Record:</span>
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {caseFile.whatIsConfirmed.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Inquiries / Allegations */}
              {caseFile.whatIsAlleged && caseFile.whatIsAlleged.length > 0 && (
                <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Areas Under Regulatory Review:</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {caseFile.whatIsAlleged.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents View */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-xl text-gray-900">
              Official Public Filings &amp; Transcripts
            </h3>
            <div className="divide-y divide-gray-200 border-t border-b border-gray-200 bg-white rounded-xl overflow-hidden px-4">
              {caseFile.primaryDocuments.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-amber-600 tracking-wider block mb-1">
                      {doc.classification}
                    </span>
                    <h4 className="font-sans font-bold text-base text-gray-900">
                      {doc.title}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1 space-x-3">
                      <span>Filing: {doc.filingAuthority}</span>
                      <span>•</span>
                      <span>Ref: {doc.documentNumber}</span>
                      <span>•</span>
                      <span>Date: {doc.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-800 shrink-0 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Record</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Court / Regulatory Developments View */}
        {activeTab === 'court' && (
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-xl text-gray-900">
              Oversight &amp; Regulatory Developments
            </h3>
            {caseFile.courtDevelopments.length === 0 ? (
              <div className="p-6 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
                All regulatory filings and oversight notifications are current as of the latest update.
              </div>
            ) : (
              <div className="space-y-4">
                {caseFile.courtDevelopments.map((cd) => (
                  <div key={cd.id} className="p-5 bg-white rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="font-bold text-gray-900">{cd.court}</span>
                      <span>Docket: {cd.caseNumber}</span>
                    </div>
                    <h4 className="font-sans font-bold text-base text-gray-900">
                      {cd.stage}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {cd.orderSummary}
                    </p>
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      Order Date: {cd.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sources Component at bottom */}
      <SourceList sources={caseFile.sources} />

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="font-bold text-xs uppercase tracking-wider text-amber-600">
                Document Metadata &amp; Archival Record
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="font-sans font-bold text-lg text-gray-900">
                {selectedDoc.title}
              </h4>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div>Classification: {selectedDoc.classification}</div>
                <div>Filing Authority: {selectedDoc.filingAuthority}</div>
                <div>Document Reference: {selectedDoc.documentNumber}</div>
                <div>Date Filed: {selectedDoc.date}</div>
              </div>
              {selectedDoc.notes && (
                <p className="text-xs text-gray-600 italic mt-3 pt-2 border-t border-gray-100">
                  {selectedDoc.notes}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => alert('Download initiated for document certified copy.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
