import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileCheck2,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { ReviewRecord } from '../../types/brandguard';

interface GovernanceInsightsProps {
  reviews: ReviewRecord[];
}

export const GovernanceInsights: React.FC<GovernanceInsightsProps> = ({ reviews }) => {
  const metrics = useMemo(() => {
    let confirmedConflicts = 0;
    let claimsAwaitingEvidence = 0;
    let totalOpen = 0;
    let totalResolved = 0;

    const categoryBreakdown: Record<string, { open: number; resolved: number }> = {
      factual: { open: 0, resolved: 0 },
      claim: { open: 0, resolved: 0 },
      restricted_term: { open: 0, resolved: 0 },
      preferred_term: { open: 0, resolved: 0 },
      tone: { open: 0, resolved: 0 },
      accessibility: { open: 0, resolved: 0 },
      custom: { open: 0, resolved: 0 },
    };

    const statusBreakdown: Record<string, number> = {
      approved: 0,
      in_review: 0,
      changes_requested: 0,
      rejected: 0,
      draft: 0,
    };

    const ruleViolations: Record<string, { count: number; title: string }> = {};

    reviews.forEach((r) => {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;

      r.findings.forEach((f) => {
        const isOpen = f.resolutionStatus === 'open';
        if (isOpen) {
          totalOpen += 1;
          if (f.severity === 'confirmed_conflict') confirmedConflicts += 1;
          if (f.severity === 'evidence_required') claimsAwaitingEvidence += 1;
        } else {
          totalResolved += 1;
        }

        if (categoryBreakdown[f.category]) {
          if (isOpen) {
            categoryBreakdown[f.category].open += 1;
          } else {
            categoryBreakdown[f.category].resolved += 1;
          }
        }

        if (f.sourceTitle) {
          if (!ruleViolations[f.sourceTitle]) {
            ruleViolations[f.sourceTitle] = { count: 0, title: f.sourceTitle };
          }
          ruleViolations[f.sourceTitle].count += 1;
        }
      });
    });

    const topRules = Object.values(ruleViolations).sort((a, b) => b.count - a.count);

    return {
      confirmedConflicts,
      claimsAwaitingEvidence,
      totalOpen,
      totalResolved,
      categoryBreakdown,
      statusBreakdown,
      topRules,
    };
  }, [reviews]);

  const categoryNames: Record<string, string> = {
    factual: 'Factual Mismatches',
    claim: 'Unverified Claims',
    restricted_term: 'Restricted Terminology',
    preferred_term: 'Non-preferred Terms',
    tone: 'Brand Tone / Casing',
    accessibility: 'Missing Alt Text',
    custom: 'Custom Rules',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Brand Governance Insights & Analytics</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Aggregated trends across stored reviews. Computed from live records without external telemetry.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium">Confirmed Conflicts</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {metrics.confirmedConflicts}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">High-severity factual mismatches</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium">Claims Awaiting Proof</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {metrics.claimsAwaitingEvidence}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Superlatives without registered certs</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium">Issues Corrected</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {metrics.totalResolved}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Suggestions applied or overridden</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-medium">Resolution Ratio</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {metrics.totalOpen + metrics.totalResolved > 0
              ? `${Math.round((metrics.totalResolved / (metrics.totalOpen + metrics.totalResolved)) * 100)}%`
              : '100%'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Issues corrected before publication</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Issue Distribution by Category (Open vs Resolved) */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Violations by Governance Category</h3>
            <p className="text-xs text-neutral-500">Comparison of open issues vs resolved/corrected issues</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(metrics.categoryBreakdown).map(([catKey, counts]) => {
              const total = counts.open + counts.resolved;
              if (total === 0) return null;
              const maxScale = Math.max(
                ...Object.values(metrics.categoryBreakdown).map((c) => c.open + c.resolved),
                1
              );
              const openPct = (counts.open / maxScale) * 100;
              const resPct = (counts.resolved / maxScale) * 100;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">{categoryNames[catKey] || catKey}</span>
                    <span className="text-neutral-500 font-mono text-[11px] tabular-nums">
                      <span className="text-rose-600 font-semibold">{counts.open} open</span>
                      {' · '}
                      <span className="text-emerald-600 font-semibold">{counts.resolved} resolved</span>
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 flex overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 transition-all duration-300"
                      style={{ width: `${openPct}%` }}
                      title={`${counts.open} open`}
                    />
                    <div
                      className="bg-emerald-500 h-2 transition-all duration-300"
                      style={{ width: `${resPct}%` }}
                      title={`${counts.resolved} resolved`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Open Flags</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resolved / Corrected</span>
            </span>
          </div>
        </div>

        {/* Chart 2: Reviews by Approval Status */}
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Review Pipeline Status</h3>
            <p className="text-xs text-neutral-500">Breakdown of drafts across the approval workflow</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { key: 'approved', label: 'Approved for Release', color: 'bg-emerald-600' },
              { key: 'in_review', label: 'In Review (Pending)', color: 'bg-blue-600' },
              { key: 'changes_requested', label: 'Changes Requested', color: 'bg-amber-500' },
              { key: 'draft', label: 'Drafts in Progress', color: 'bg-neutral-400' },
              { key: 'rejected', label: 'Rejected', color: 'bg-rose-600' },
            ].map((item) => {
              const count = metrics.statusBreakdown[item.key] || 0;
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">{item.label}</span>
                    <span className="font-mono text-neutral-600 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Commonly Violated Brand Rules */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Frequently Triggered Brand Rules & Sources</h3>
          <p className="text-xs text-neutral-500">
            Source policies that generate the highest frequency of flagged drafts
          </p>
        </div>

        {metrics.topRules.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-4">No violations logged yet.</p>
        ) : (
          <div className="divide-y divide-neutral-150">
            {metrics.topRules.slice(0, 5).map((rule, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-400 text-[11px] w-5">
                    0{idx + 1}.
                  </span>
                  <span className="font-medium text-neutral-800">{rule.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {rule.count} {rule.count === 1 ? 'incident' : 'incidents'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
