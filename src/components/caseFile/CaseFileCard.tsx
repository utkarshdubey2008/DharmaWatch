import React from 'react';
import { Link } from 'react-router-dom';
import { CaseFile, CaseFileStatus } from '../../types';
import { FileText, MapPin, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface CaseFileCardProps {
  caseFile: CaseFile;
}

export const CaseStatusBadge: React.FC<{ status: CaseFileStatus }> = ({ status }) => {
  switch (status) {
    case 'In Court':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          In Court
        </span>
      );
    case 'Under Investigation':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Investigation Active
        </span>
      );
    case 'Developing':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
          Developing
        </span>
      );
    case 'Resolved':
    case 'Verified':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Verified Audit
        </span>
      );
    case 'Archived':
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          Archived
        </span>
      );
    default:
      return (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};

export const CaseFileCard: React.FC<CaseFileCardProps> = ({ caseFile }) => {
  const locationText = caseFile.location.state
    ? `${caseFile.location.state}, ${caseFile.location.country}`
    : caseFile.location.country;

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-400 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Header with Case ID and Status */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs mb-3">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold uppercase tracking-wider text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>PROJECT DOSSIER</span>
          </div>
          <CaseStatusBadge status={caseFile.status} />
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-lg sm:text-xl text-gray-900 group-hover:text-amber-600 transition-colors leading-snug">
          <Link to={`/case-files/${caseFile.id}`}>
            {caseFile.title}
          </Link>
        </h3>

        {/* Location & Date */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {locationText}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {caseFile.date}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-gray-600 mt-3 line-clamp-3 leading-relaxed font-sans">
          {caseFile.summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500 font-medium">
          {caseFile.timeline.length} Documented Milestones
        </span>
        <Link
          to={`/case-files/${caseFile.id}`}
          className="inline-flex items-center gap-1 text-amber-600 font-bold hover:text-amber-700 transition-colors uppercase text-[11px] tracking-wider"
        >
          <span>Explore Dossier</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
