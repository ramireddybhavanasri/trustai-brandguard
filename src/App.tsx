/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  clearAllData,
  getReviews,
  getSettings,
  getSources,
  resetToDefaults,
  saveReviews,
  saveSettings,
  saveSources,
  subscribeToStore,
} from './services/storage';
import { AppSettings, BrandSource, DemonstrationRole, ReviewRecord, ReviewStatus } from './types/brandguard';
import { NavSection, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { NewReviewWorkspace } from './components/workspace/NewReviewWorkspace';
import { ReviewQueue } from './components/queue/ReviewQueue';
import { SourceLibrary } from './components/sources/SourceLibrary';
import { GovernanceInsights } from './components/insights/GovernanceInsights';
import { RevisionHistory } from './components/history/RevisionHistory';
import { SettingsAndPrivacy } from './components/settings/SettingsAndPrivacy';
import { ExportReportModal } from './components/export/ExportReportModal';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('overview');
  const [sources, setSources] = useState<BrandSource[]>(getSources());
  const [reviews, setReviews] = useState<ReviewRecord[]>(getReviews());
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const [activeReviewForWorkspace, setActiveReviewForWorkspace] = useState<ReviewRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exportModalReview, setExportModalReview] = useState<ReviewRecord | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setSources(getSources());
      setReviews(getReviews());
      setSettings(getSettings());
    });
    return unsubscribe;
  }, []);

  // Handlers for reviews
  const handleSaveReview = (review: ReviewRecord) => {
    const existingIndex = reviews.findIndex((r) => r.id === review.id);
    let updated: ReviewRecord[];
    if (existingIndex >= 0) {
      updated = [...reviews];
      updated[existingIndex] = review;
    } else {
      updated = [review, ...reviews];
    }
    saveReviews(updated);
    setActiveReviewForWorkspace(review);
  };

  const handleOpenReview = (reviewId: string) => {
    const found = reviews.find((r) => r.id === reviewId);
    if (found) {
      setActiveReviewForWorkspace(found);
      setCurrentSection('new_review');
    }
  };

  const handleStartNewReview = () => {
    setActiveReviewForWorkspace(null);
    setCurrentSection('new_review');
  };

  const handleUpdateReviewStatus = (
    reviewId: string,
    newStatus: ReviewStatus,
    commentText?: string,
    overrideReason?: string
  ) => {
    const updated = reviews.map((r) => {
      if (r.id !== reviewId) return r;

      const newComments = [...(r.comments || [])];
      if (commentText) {
        newComments.push({
          id: `comm-${Date.now()}`,
          author: settings.activeUserName,
          role: settings.activeRole,
          timestamp: new Date().toISOString(),
          text: commentText,
        });
      }

      const newRevisions = [...(r.revisions || [])];
      newRevisions.push({
        id: `rev-${Date.now()}`,
        revisionNumber: (r.revisions?.length || 0) + 1,
        timestamp: new Date().toISOString(),
        userRole: settings.activeRole,
        authorName: settings.activeUserName,
        summary: `Status updated to ${newStatus.replace('_', ' ')}${
          overrideReason ? ` (Override: ${overrideReason})` : ''
        }`,
        content: r.currentContent,
        complianceScore: r.complianceScore.overall,
        status: newStatus,
      });

      return {
        ...r,
        status: newStatus,
        comments: newComments,
        revisions: newRevisions,
        approvalOverrideReason: overrideReason || r.approvalOverrideReason,
        updatedAt: new Date().toISOString(),
      };
    });

    saveReviews(updated);
  };

  // Handlers for Sources
  const handleSaveSource = (source: BrandSource) => {
    const existingIdx = sources.findIndex((s) => s.id === source.id);
    let updated: BrandSource[];
    if (existingIdx >= 0) {
      updated = [...sources];
      updated[existingIdx] = source;
    } else {
      updated = [source, ...sources];
    }
    saveSources(updated);
  };

  const handleDeleteSource = (sourceId: string) => {
    const updated = sources.filter((s) => s.id !== sourceId);
    saveSources(updated);
  };

  const handleDuplicateSource = (source: BrandSource) => {
    saveSources([source, ...sources]);
  };

  // Handlers for Settings & Data
  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
  };

  const handleRoleChange = (role: DemonstrationRole) => {
    const updated: AppSettings = {
      ...settings,
      activeRole: role,
    };
    saveSettings(updated);
  };

  const handleResetData = () => {
    resetToDefaults();
    setActiveReviewForWorkspace(null);
  };

  const handleClearData = () => {
    clearAllData();
    setActiveReviewForWorkspace(null);
  };

  const handleExportJSON = () => {
    const state = {
      sources,
      reviews,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trustai_brandguard_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonString: string) => {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.sources) && Array.isArray(parsed.reviews)) {
      saveSources(parsed.sources);
      saveReviews(parsed.reviews);
      if (parsed.settings) saveSettings(parsed.settings);
    } else {
      throw new Error('Invalid JSON structure');
    }
  };

  // Aggregate counters for badge indicators
  const pendingReviewsCount = reviews.filter(
    (r) => r.status === 'in_review' || r.status === 'changes_requested'
  ).length;

  let openIssuesCount = 0;
  reviews.forEach((r) => {
    r.findings.forEach((f) => {
      if (f.resolutionStatus === 'open') openIssuesCount += 1;
    });
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 selection:bg-teal-500/20 selection:text-teal-900">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => {
          if (sec === 'new_review' && currentSection !== 'new_review') {
            // keep existing review if already set or open default
          }
          setCurrentSection(sec);
        }}
        pendingReviewsCount={pendingReviewsCount}
        openIssuesCount={openIssuesCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          currentSection={currentSection}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onStartNewReview={handleStartNewReview}
          activeRole={settings.activeRole}
          onRoleChange={handleRoleChange}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentSection === 'overview' && (
            <OverviewDashboard
              reviews={reviews}
              onStartNewReview={handleStartNewReview}
              onOpenReview={handleOpenReview}
              onNavigateToQueue={() => setCurrentSection('review_queue')}
              onNavigateToSources={() => setCurrentSection('source_library')}
            />
          )}

          {currentSection === 'new_review' && (
            <NewReviewWorkspace
              sources={sources}
              initialReview={activeReviewForWorkspace}
              onSaveReview={handleSaveReview}
              currentUserRole={settings.activeRole}
              currentUserName={settings.activeUserName}
              onOpenReportModal={(rev) => setExportModalReview(rev)}
            />
          )}

          {currentSection === 'review_queue' && (
            <ReviewQueue
              reviews={reviews}
              onOpenReview={handleOpenReview}
              onUpdateReviewStatus={handleUpdateReviewStatus}
              onOpenReportModal={(rev) => setExportModalReview(rev)}
              currentUserRole={settings.activeRole}
              currentUserName={settings.activeUserName}
            />
          )}

          {currentSection === 'source_library' && (
            <SourceLibrary
              sources={sources}
              onSaveSource={handleSaveSource}
              onDeleteSource={handleDeleteSource}
              onDuplicateSource={handleDuplicateSource}
            />
          )}

          {currentSection === 'governance_insights' && (
            <GovernanceInsights reviews={reviews} />
          )}

          {currentSection === 'revision_history' && (
            <RevisionHistory reviews={reviews} onOpenReview={handleOpenReview} />
          )}

          {currentSection === 'settings_privacy' && (
            <SettingsAndPrivacy
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onClearData={handleClearData}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
            />
          )}
        </main>
      </div>

      {/* Export / Print Report Modal */}
      <ExportReportModal
        isOpen={Boolean(exportModalReview)}
        onClose={() => setExportModalReview(null)}
        review={exportModalReview}
      />
    </div>
  );
}
