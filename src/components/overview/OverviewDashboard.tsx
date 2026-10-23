import React from 'react';
import {
  FileCheck2,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ReviewRecord } from '../../types/brandguard';
import { StatusBadge } from '../common/StatusBadge';

interface OverviewDashboardProps {
  reviews: ReviewRecord[];
  onStartNewReview: () => void;
  onOpenReview: (reviewId: string) => void;
  onNavigateToQueue: () => void;
  onNavigateToSources: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  reviews,
  onStartNewReview,
  onOpenReview,
  onNavigateToQueue,
  onNavigateToSources,
}) => {
  // Compute real metrics from reviews
  const totalReviews = reviews.length;
  const awaitingApproval = reviews.filter(
    (r) => r.status === 'in_review' || r.status === 'changes_requested'
  ).length;

  let totalOpenIssues = 0;
  let totalResolvedIssues = 0;
  let scoreSum = 0;

  const categoryCounts: Record<string, number> = {
    factual: 0,
    claim: 0,
    restricted_term: 0,
    preferred_term: 0,
    tone: 0,
    accessibility: 0,
    custom: 0,
  };

  reviews.forEach((r) => {
    scoreSum += r.complianceScore.overall;
    r.findings.forEach((f) => {
      if (f.resolutionStatus === 'open') {
        totalOpenIssues += 1;
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
      } else {
        totalResolvedIssues += 1;
      }
    });
  });

  const avgScore = totalReviews > 0 ? Math.round(scoreSum / totalReviews) : 100;

  // Category labels and display
  const categoryLabels: Record<string, string> = {
    factual: 'Factual Mismatches',
    claim: 'Promotional Superiority Claims',
    restricted_term: 'Restricted Terminology',
    preferred_term: 'Non-preferred Terms',
    tone: 'Brand Tone & Casing Violations',
    accessibility: 'Missing Alt Text (Accessibility)',
    custom: 'Custom Rule Flags',
  };

  const topViolations = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 rounded-xl p-6 text-white border border-slate-700/60 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-medium mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Source-Backed Engine Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            “Protect Your Brand Before You Publish.”
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            TrustAI BrandGuard verifies marketing drafts against approved product facts, legal claims,
            vocabulary policies, and WCAG accessibility standards — ensuring every statement has verifiable proof.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onStartNewReview}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Start New Content Review</span>
            </button>
            <button
              onClick={onNavigateToSources}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-600 transition-colors"
            >
              <span>Explore Approved Source Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total Drafts</span>
            <FileCheck2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {totalReviews}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Stored reviews</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium">Awaiting Approval</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {awaitingApproval}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Pending human sign-off</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium">Open Issues</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {totalOpenIssues}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Violations requiring action</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium">Issues Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {totalResolvedIssues}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Corrected or audited</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs font-medium">Avg Compliance Score</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700">
            {avgScore}
            <span className="text-sm font-normal text-neutral-500">/100</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Across all drafts</p>
        </div>
      </div>

      {/* Main Grid: Recent Reviews & Violation Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Reviews */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Recent Content Reviews</h2>
              <p className="text-xs text-neutral-500">Live drafts evaluated against approved sources</p>
            </div>
            <button
              onClick={onNavigateToQueue}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center">
              <FileCheck2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">No content reviews yet</p>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Start your first brand check or load the NOVA smartphone demo scenario.
              </p>
              <button
                onClick={onStartNewReview}
                className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-md"
              >
                Start New Review
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-150 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Draft Title</th>
                    <th className="px-4 py-3 font-semibold">Channel</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Score</th>
                    <th className="px-4 py-3 font-semibold text-right">Open Issues</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reviews.slice(0, 5).map((rev) => {
                    const openCount = rev.findings.filter((f) => f.resolutionStatus === 'open').length;
                    return (
                      <tr key={rev.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onOpenReview(rev.id)}
                            className="font-medium text-neutral-900 hover:text-teal-700 text-left line-clamp-1 cursor-pointer"
                          >
                            {rev.title}
                          </button>
                          <span className="text-[11px] text-neutral-500 block">
                            {rev.brandOrProduct} · {new Date(rev.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-neutral-600">{rev.channel}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={rev.status} type="review" />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-neutral-800">
                          {rev.complianceScore.overall}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {openCount > 0 ? (
                            <span className="text-rose-600 font-semibold">{openCount}</span>
                          ) : (
                            <span className="text-emerald-600">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onOpenReview(rev.id)}
                            className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Common Violations & Activity */}
        <div className="space-y-6">
          {/* Top Violation Categories */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Open Violations by Category</h3>
            <p className="text-xs text-neutral-500 mb-4">Issues currently detected in active drafts</p>

            {topViolations.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                No active violations across stored reviews.
              </div>
            ) : (
              <div className="space-y-3">
                {topViolations.map(([cat, count]) => {
                  const pct = Math.min(100, Math.round((count / (totalOpenIssues || 1)) * 100));
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-700 font-medium">{categoryLabels[cat] || cat}</span>
                        <span className="font-mono text-neutral-600 font-semibold tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick NOVA Demo Card */}
          <div className="bg-teal-50/50 rounded-lg border border-teal-200/80 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-md shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-teal-950">NOVA Smartphone Demonstration</h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Evaluate the seeded scenario: “Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!”
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const nova = reviews.find((r) => r.id === 'rev-nova-demo-001');
                      if (nova) onOpenReview(nova.id);
                      else onStartNewReview();
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect NOVA findings & workflow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
