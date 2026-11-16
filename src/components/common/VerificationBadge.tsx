import React from 'react';
import { VerificationGrade, SourceClassification, SourceType } from '../../types';
import { CheckCircle2, AlertTriangle, HelpCircle, FileText, Landmark, ShieldAlert, BookOpen, Scale } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationGrade;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'sm',
  showIcon = true,
}) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'Confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold ${
            isSm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          } bg-emerald-950/20 text-emerald-400 border border-emerald-800/80`}
        >
          {showIcon && <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          [CONFIRMED]
        </span>
      );
    case 'Allegation':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold ${
            isSm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          } bg-amber-950/20 text-amber-400 border border-amber-800/80`}
        >
          {showIcon && <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          [ALLEGATION]
        </span>
      );
    case 'Unverified':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold ${
            isSm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
          } bg-zinc-900 text-zinc-400 border border-zinc-700`}
        >
          {showIcon && <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
          [UNVERIFIED]
        </span>
      );
    default:
      return null;
  }
};

interface SourceClassificationBadgeProps {
  classification: SourceClassification;
  size?: 'sm' | 'md';
}

export const SourceClassificationBadge: React.FC<SourceClassificationBadgeProps> = ({
  classification,
  size = 'sm',
}) => {
  const isSm = size === 'sm';
  if (classification === 'Primary') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-bold ${
          isSm ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
        } bg-red-950/30 text-red-500 border border-red-800`}
      >
        PRIMARY EVIDENCE
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-medium ${
        isSm ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
      } bg-zinc-900 text-zinc-400 border border-zinc-800`}
    >
      SECONDARY REPORT
    </span>
  );
};

export const SourceTypeIcon: React.FC<{ type: SourceType; className?: string }> = ({
  type,
  className = 'w-3.5 h-3.5',
}) => {
  switch (type) {
    case 'Court document':
      return <Scale className={className} />;
    case 'Government document':
      return <Landmark className={className} />;
    case 'FIR':
    case 'Police statement':
      return <ShieldAlert className={className} />;
    case 'Academic research':
    case 'Archive':
      return <BookOpen className={className} />;
    default:
      return <FileText className={className} />;
  }
};
