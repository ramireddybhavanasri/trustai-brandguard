import React from 'react';
import { ReviewStatus, SourceStatus } from '../../types/brandguard';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Archive, FileEdit } from 'lucide-react';

interface StatusBadgeProps {
  status: ReviewStatus | SourceStatus;
  type?: 'review' | 'source';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'review' }) => {
  if (type === 'review') {
    switch (status as ReviewStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Changes Requested
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            In Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            <FileEdit className="w-3.5 h-3.5 text-neutral-500" />
            Draft
          </span>
        );
    }
  }

  // Source status
  switch (status as SourceStatus) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved (Authoritative)
        </span>
      );
    case 'pending_review':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-850 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Review
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-650 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          <FileEdit className="w-3.5 h-3.5 text-neutral-500" />
          Draft (Non-authoritative)
        </span>
      );
    case 'archived':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          <Archive className="w-3.5 h-3.5 text-neutral-400" />
          Archived
        </span>
      );
  }
};
