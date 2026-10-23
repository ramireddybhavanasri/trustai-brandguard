import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  History,
  FileSpreadsheet,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ReviewRecord, ReviewStatus } from '../../types/brandguard';
import { StatusBadge } from '../common/StatusBadge';

interface ReviewQueueProps {
  reviews: ReviewRecord[];
  onOpenReview: (reviewId: string) => void;
  onUpdateReviewStatus: (
    reviewId: string,
    newStatus: ReviewStatus,
    commentText?: string,
    overrideReason?: string
  ) => void;
  onOpenReportModal: (review: ReviewRecord) => void;
  currentUserRole: string;
  currentUserName: string;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  reviews,
  onOpenReview,
  onUpdateReviewStatus,
  onOpenReportModal,
  currentUserRole,
  currentUserName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title'>('updated');

  // Approval/Action modal
  const [actionReview, setActionReview] = useState<ReviewRecord | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'request_changes' | 'reject' | 'comment' | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [overrideRationale, setOverrideRationale] = useState('');
  const [actionError, setActionError] = useState('');

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchBrand = r.brandOrProduct.toLowerCase().includes(q);
          const matchCreator = r.creatorName.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchCreator) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.complianceScore.overall - a.complianceScore.overall;
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [reviews, statusFilter, searchQuery, sortBy]);

  const handleOpenActionModal = (
    rev: ReviewRecord,
    type: 'approve' | 'request_changes' | 'reject' | 'comment'
  ) => {
    setActionReview(rev);
    setActionType(type);
    setCommentInput('');
    setOverrideRationale('');
    setActionError('');
  };

  const handleExecuteAction = () => {
    if (!actionReview || !actionType) return;

    const openHighSeverityIssues = actionReview.findings.filter(
      (f) => f.resolutionStatus === 'open' && f.severity === 'confirmed_conflict'
    );

    if (actionType === 'approve') {
      if (openHighSeverityIssues.length > 0 && !overrideRationale.trim()) {
        setActionError(
          `Cannot approve draft with ${openHighSeverityIssues.length} unresolved high-severity conflict(s) without an explicit documented override justification.`
        );
        return;
      }
      onUpdateReviewStatus(
        actionReview.id,
        'approved',
        commentInput.trim() || 'Approved for publication.',
        overrideRationale.trim() || undefined
      );
    } else if (actionType === 'request_changes') {
      if (!commentInput.trim()) {
        setActionError('Please specify the changes requested for the author.');
        return;
      }
      onUpdateReviewStatus(actionReview.id, 'changes_requested', commentInput.trim());
    } else if (actionType === 'reject') {
      if (!commentInput.trim()) {
        setActionError('Please state the formal rejection reason.');
        return;
      }
      onUpdateReviewStatus(actionReview.id, 'rejected', commentInput.trim());
    } else if (actionType === 'comment') {
      if (!commentInput.trim()) {
        setActionError('Please enter a comment.');
        return;
      }
      onUpdateReviewStatus(actionReview.id, actionReview.status, commentInput.trim());
    }

    setActionReview(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Overview header */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Governance Review Queue & Approvals</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Human-in-the-loop sign-off workflow. High-severity conflicts require documented justification to override.
          </p>
        </div>

        <div className="text-xs text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200">
          Acting as: <span className="font-semibold text-neutral-800">{currentUserRole}</span> ({currentUserName})
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, brand, or author..."
              className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-md bg-white text-neutral-700 font-medium"
            >
              <option value="all">All Statuses ({reviews.length})</option>
              <option value="in_review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-md bg-white text-neutral-700"
            >
              <option value="updated">Sort by Last Updated</option>
              <option value="score">Sort by Compliance Score</option>
              <option value="title">Sort Alphabetically</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Reviews */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <Inbox className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No review records found</p>
            <p className="mt-1">Try adjusting your filters or create a new review in the workspace.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Draft & Campaign</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Score</th>
                  <th className="px-4 py-3 font-semibold text-right">Open Issues</th>
                  <th className="px-4 py-3 font-semibold">Author / Role</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {filteredReviews.map((rev) => {
                  const openCount = rev.findings.filter((f) => f.resolutionStatus === 'open').length;
                  const hasConflicts = rev.findings.some(
                    (f) => f.resolutionStatus === 'open' && f.severity === 'confirmed_conflict'
                  );

                  return (
                    <tr key={rev.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onOpenReview(rev.id)}
                            className="font-medium text-neutral-900 hover:text-teal-700 text-left line-clamp-1 cursor-pointer"
                          >
                            {rev.title}
                          </button>
                          <span className="text-[11px] text-neutral-500">
                            {rev.brandOrProduct} · {new Date(rev.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-neutral-600">{rev.channel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rev.status} type="review" />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            rev.complianceScore.overall >= 90
                              ? 'text-emerald-700'
                              : rev.complianceScore.overall >= 70
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {rev.complianceScore.overall}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {openCount > 0 ? (
                          <span className="text-rose-700 font-semibold">{openCount}</span>
                        ) : (
                          <span className="text-emerald-700">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-neutral-800 font-medium block">{rev.creatorName}</span>
                        <span className="text-[10px] text-neutral-500">{rev.creatorRole}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenReview(rev.id)}
                            className="p-1 text-teal-700 hover:bg-teal-50 rounded"
                            title="Inspect in workspace"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {rev.status !== 'approved' && (
                            <button
                              onClick={() => handleOpenActionModal(rev, 'approve')}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded"
                            >
                              Approve
                            </button>
                          )}

                          {rev.status !== 'changes_requested' && (
                            <button
                              onClick={() => handleOpenActionModal(rev, 'request_changes')}
                              className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded"
                            >
                              Request Changes
                            </button>
                          )}

                          <button
                            onClick={() => onOpenReportModal(rev)}
                            className="p-1 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded"
                            title="Export review report"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Human Workflow Action Modal */}
      {actionReview && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 capitalize">
                  {actionType === 'approve'
                    ? 'Approve Draft for Publication'
                    : actionType === 'request_changes'
                    ? 'Request Changes from Author'
                    : 'Reject Draft'}
                </h3>
                <p className="text-xs text-neutral-500">{actionReview.title}</p>
              </div>
              <button
                onClick={() => setActionReview(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Warning if approving with open high-severity conflicts */}
            {actionType === 'approve' &&
              actionReview.findings.some(
                (f) => f.resolutionStatus === 'open' && f.severity === 'confirmed_conflict'
              ) && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Unresolved High-Severity Conflicts Detected</span>
                  </div>
                  <p className="leading-relaxed">
                    This draft contains open confirmed conflicts (e.g. specification mismatches). To approve,
                    you must supply an explicit documented override justification for audit compliance.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">
                      Mandatory Override Justification:
                    </label>
                    <textarea
                      rows={2}
                      value={overrideRationale}
                      onChange={(e) => setOverrideRationale(e.target.value)}
                      placeholder="e.g. Hardware engineering signed off on special prototype batch..."
                      className="w-full p-2 border border-rose-300 rounded text-xs bg-white text-rose-950 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

            {/* Comment box */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {actionType === 'approve' ? 'Reviewer Sign-off Note' : 'Reviewer Feedback & Instructions'}
              </label>
              <textarea
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'e.g. Certified for social media distribution.'
                    : 'e.g. Correct 250 MP to 50 MP and remove or verify India No. 1 claim.'
                }
                className="w-full p-2.5 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={() => setActionReview(null)}
                className="px-3.5 py-1.5 border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded transition-colors ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'request_changes'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType.replace('_', ' ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
