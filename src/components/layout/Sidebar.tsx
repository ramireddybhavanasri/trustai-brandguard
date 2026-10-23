import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Inbox,
  BookOpenCheck,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'new_review'
  | 'review_queue'
  | 'source_library'
  | 'governance_insights'
  | 'revision_history'
  | 'settings_privacy';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  pendingReviewsCount: number;
  openIssuesCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  pendingReviewsCount,
  openIssuesCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview' as NavSection,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new_review' as NavSection,
      label: 'New Review',
      icon: FileCheck2,
      badge: 'Check',
    },
    {
      id: 'review_queue' as NavSection,
      label: 'Review Queue',
      icon: Inbox,
      badge: pendingReviewsCount > 0 ? String(pendingReviewsCount) : null,
    },
    {
      id: 'source_library' as NavSection,
      label: 'Source Library',
      icon: BookOpenCheck,
      badge: null,
    },
    {
      id: 'governance_insights' as NavSection,
      label: 'Governance Insights',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'revision_history' as NavSection,
      label: 'Revision History',
      icon: History,
      badge: null,
    },
    {
      id: 'settings_privacy' as NavSection,
      label: 'Settings & Privacy',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white">TrustAI BrandGuard</span>
            <span className="text-[11px] text-slate-400">Brand Governance</span>
          </div>
        </div>

        {/* Tagline bar */}
        <div className="px-5 py-3 border-b border-slate-800/40 bg-slate-950/30">
          <p className="text-[11px] text-teal-300 font-medium leading-tight">
            “Protect Your Brand Before You Publish.”
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                      isActive
                        ? 'bg-teal-500/30 text-teal-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Open Flagged Issues</span>
            <span className="font-mono font-semibold text-rose-400 tabular-nums">
              {openIssuesCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Awaiting Approval</span>
            <span className="font-mono font-semibold text-amber-400 tabular-nums">
              {pendingReviewsCount}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Deterministic Rule-Engine Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
