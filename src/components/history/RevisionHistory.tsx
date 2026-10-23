import React, { useState } from 'react';
import { History, GitCommit, ArrowRight, User, Clock, CheckCircle2, FileText } from 'lucide-react';
import { ReviewRecord, Revision } from '../../types/brandguard';
import { StatusBadge } from '../common/StatusBadge';

interface RevisionHistoryProps {
  reviews: ReviewRecord[];
  onOpenReview: (reviewId: string) => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  reviews,
  onOpenReview,
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    reviews[0]?.id || ''
  );
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);

  const currentReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0];

  const revisions = currentReview?.revisions || [];
  const selectedRev =
    revisions.find((rev) => rev.id === selectedRevisionId) || revisions[revisions.length - 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Revision History & Verifiable Audit Log</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable log of all draft modifications, accepted corrections, reviewer comments, and score changes.
          </p>
        </div>

        {/* Draft selector */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Select Draft:</span>
            <select
              value={selectedReviewId}
              onChange={(e) => {
                setSelectedReviewId(e.target.value);
                setSelectedRevisionId(null);
              }}
              className="px-3 py-1.5 border border-neutral-300 rounded-md bg-white text-neutral-800 font-medium focus:ring-2 focus:ring-teal-500"
            >
              {reviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.revisions.length} revisions)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!currentReview ? (
        <div className="bg-white p-12 text-center rounded-lg border border-neutral-200 text-xs text-neutral-500">
          No review records available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Revision Timeline */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800">Timeline of Modifications</span>
              <span className="font-mono text-[11px] text-neutral-500">
                {revisions.length} recorded events
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {revisions.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No revisions logged yet for this draft.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {revisions.map((rev) => {
                    const isSelected = selectedRev?.id === rev.id;
                    return (
                      <div
                        key={rev.id}
                        onClick={() => setSelectedRevisionId(rev.id)}
                        className={`relative cursor-pointer p-3 rounded-lg border transition-all text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-teal-50/60 border-teal-500 ring-1 ring-teal-500'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {/* Timeline node */}
                        <div
                          className={`absolute -left-[27px] top-3.5 w-3 h-3 rounded-full border-2 bg-white ${
                            isSelected ? 'border-teal-600 bg-teal-600' : 'border-neutral-400'
                          }`}
                        />

                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900 text-xs">
                            Rev #{rev.revisionNumber}
                          </span>
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rev.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-neutral-700 font-medium leading-snug">{rev.summary}</p>

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-neutral-400" />
                            {rev.authorName} ({rev.userRole})
                          </span>
                          <span className="font-mono font-semibold text-teal-700">
                            Score: {rev.complianceScore}/100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Visual Diff Comparison */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Visual Diff Comparison
                </h3>
                <p className="text-xs text-neutral-500">
                  Original baseline draft vs Selected Revision #{selectedRev?.revisionNumber || 1}
                </p>
              </div>

              <button
                onClick={() => onOpenReview(currentReview.id)}
                className="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 rounded-md transition-colors"
              >
                Inspect in Workspace
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Original Draft Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-700 text-xs">
                    Original Submitted Draft (Rev #1 Baseline)
                  </span>
                  <span className="text-[10px] text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Uncorrected Original
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-neutral-800 leading-relaxed font-sans text-xs">
                  {currentReview.originalContent}
                </div>
              </div>

              {/* Current/Selected Revision Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-700 text-xs">
                    Content at Revision #{selectedRev?.revisionNumber || 1}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Compliance Score: {selectedRev?.complianceScore || currentReview.complianceScore.overall}/100
                  </span>
                </div>
                <div className="p-3 bg-white rounded-md border border-teal-200 text-neutral-900 leading-relaxed font-sans text-xs shadow-2xs">
                  {renderTextDiff(currentReview.originalContent, selectedRev?.content || currentReview.currentContent)}
                </div>
              </div>

              {/* Audit Comments Trail */}
              {currentReview.comments && currentReview.comments.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  <span className="font-semibold text-neutral-800 text-xs block">
                    Reviewer Audit Notes & Comments:
                  </span>
                  <div className="space-y-2">
                    {currentReview.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="font-semibold text-neutral-800">
                            {comm.author} ({comm.role})
                          </span>
                          <span>{new Date(comm.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-neutral-700 leading-relaxed">{comm.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Word-level diff renderer: marks deleted words in red strikethrough, added words in green highlight
function renderTextDiff(original: string, current: string) {
  if (original === current) {
    return <span>{current}</span>;
  }

  const origWords = original.split(/(\s+)/);
  const currWords = current.split(/(\s+)/);

  return (
    <div className="space-y-2">
      <div className="leading-relaxed">
        {currWords.map((word, i) => {
          if (!origWords.includes(word) && word.trim().length > 0) {
            return (
              <span
                key={i}
                className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-semibold border-b border-emerald-400"
              >
                {word}
              </span>
            );
          }
          return <span key={i}>{word}</span>;
        })}
      </div>
    </div>
  );
}
