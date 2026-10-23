import React from 'react';
import { AlertCircle, AlertTriangle, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import { FindingSeverity, FindingResolutionStatus } from '../../types/brandguard';

interface SeverityBadgeProps {
  severity: FindingSeverity;
  resolutionStatus?: FindingResolutionStatus;
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  resolutionStatus,
  showIcon = true,
}) => {
  if (resolutionStatus === 'accepted' || resolutionStatus === 'dismissed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        <span>{resolutionStatus === 'accepted' ? 'Corrected' : 'Dismissed (Audit Override)'}</span>
      </span>
    );
  }

  switch (severity) {
    case 'confirmed_conflict':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          <span>Confirmed Conflict</span>
        </span>
      );
    case 'evidence_required':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Evidence Required</span>
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Warning</span>
        </span>
      );
    case 'suggestion':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {showIcon && <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
          <span>Suggestion</span>
        </span>
      );
  }
};
