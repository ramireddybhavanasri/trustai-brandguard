import React from 'react';
import { Menu, Plus, User, Shield } from 'lucide-react';
import { NavSection } from './Sidebar';
import { DemonstrationRole } from '../../types/brandguard';

interface HeaderProps {
  currentSection: NavSection;
  onOpenMobileMenu: () => void;
  onStartNewReview: () => void;
  activeRole: DemonstrationRole;
  onRoleChange: (role: DemonstrationRole) => void;
}

const SECTION_LABELS: Record<NavSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Governance Overview',
    subtitle: 'Real-time visibility into marketing brand compliance, pending approvals, and active issues.',
  },
  new_review: {
    title: 'Content Review Workspace',
    subtitle: 'Verify marketing drafts against approved brand facts, guidelines, terminology, and accessibility rules.',
  },
  review_queue: {
    title: 'Review Queue & Approvals',
    subtitle: 'Human-in-the-loop governance workflow for reviewing, requesting changes, or approving drafts.',
  },
  source_library: {
    title: 'Authoritative Source Library',
    subtitle: 'Verified brand facts, approved claims, terminology, and accessibility policies.',
  },
  governance_insights: {
    title: 'Governance Insights & Analytics',
    subtitle: 'Trend analysis of brand violations, compliance score distribution, and rule violation rates.',
  },
  revision_history: {
    title: 'Revision History & Audit Log',
    subtitle: 'Verifiable audit trail of draft modifications, accepted corrections, and reviewer sign-offs.',
  },
  settings_privacy: {
    title: 'Settings & Privacy Controls',
    subtitle: 'Local data persistence management, simulation boundaries, and demonstration role configuration.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenMobileMenu,
  onStartNewReview,
  activeRole,
  onRoleChange,
}) => {
  const currentInfo = SECTION_LABELS[currentSection];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">TrustAI BrandGuard</span>
              <span className="text-neutral-300">/</span>
              <span className="text-teal-700 font-medium">{currentInfo.title}</span>
            </div>
          </div>
        </div>

        {/* Right: Demo role selector + Start New Review CTA */}
        <div className="flex items-center gap-3">
          {/* Demonstration role selector */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs text-neutral-700">
            <User className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-500">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as DemonstrationRole)}
              className="bg-transparent font-medium text-neutral-800 border-none py-0.5 focus:ring-0 cursor-pointer text-xs"
              aria-label="Active demonstration role"
            >
              <option value="Brand Compliance Lead">Brand Compliance Lead</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Content Creator">Content Creator</option>
            </select>
            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1 rounded">Demo</span>
          </div>

          {/* Quick CTA */}
          {currentSection !== 'new_review' && (
            <button
              onClick={onStartNewReview}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors shrink-0 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Review</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
