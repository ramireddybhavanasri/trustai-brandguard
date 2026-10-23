import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Play,
  Save,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileCheck2,
  Image as ImageIcon,
  Check,
  Edit3,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AttachedImage,
  BrandSource,
  ContentType,
  Finding,
  FindingResolutionStatus,
  ReviewRecord,
  ReviewStatus,
  TargetChannel,
} from '../../types/brandguard';
import { runBrandCheck } from '../../services/engine';
import { calculateComplianceScore } from '../../services/scoring';
import { SeverityBadge } from '../common/SeverityBadge';

interface NewReviewWorkspaceProps {
  sources: BrandSource[];
  initialReview?: ReviewRecord | null;
  onSaveReview: (review: ReviewRecord) => void;
  currentUserRole: string;
  currentUserName: string;
  onOpenReportModal?: (review: ReviewRecord) => void;
}

const NOVA_DEMO_TEXT = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';

export const NewReviewWorkspace: React.FC<NewReviewWorkspaceProps> = ({
  sources,
  initialReview,
  onSaveReview,
  currentUserRole,
  currentUserName,
  onOpenReportModal,
}) => {
  const [title, setTitle] = useState('NOVA Smartphone Launch Announcement');
  const [contentType, setContentType] = useState<ContentType>('social_post');
  const [channel, setChannel] = useState<TargetChannel>('linkedin');
  const [brandOrProduct, setBrandOrProduct] = useState('NOVA smartphone');
  const [draftContent, setDraftContent] = useState(NOVA_DEMO_TEXT);
  const [originalContent, setOriginalContent] = useState(NOVA_DEMO_TEXT);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | undefined>(undefined);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('draft');

  // Findings & scoring state
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [hasRunCheck, setHasRunCheck] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Edit suggestion modal state
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [customReplacementText, setCustomReplacementText] = useState('');

  // Dismiss with rationale modal state
  const [dismissingFinding, setDismissingFinding] = useState<Finding | null>(null);
  const [dismissRationale, setDismissRationale] = useState('');

  // Track review ID and revisions
  const [currentReviewId, setCurrentReviewId] = useState<string>(
    initialReview ? initialReview.id : `rev-${Date.now()}`
  );
  const [revisions, setRevisions] = useState<ReviewRecord['revisions']>(
    initialReview ? initialReview.revisions : []
  );
  const [comments, setComments] = useState<ReviewRecord['comments']>(
    initialReview ? initialReview.comments : []
  );

  // Populate if editing existing review
  useEffect(() => {
    if (initialReview) {
      setCurrentReviewId(initialReview.id);
      setTitle(initialReview.title);
      setContentType(initialReview.contentType);
      setChannel(initialReview.channel);
      setBrandOrProduct(initialReview.brandOrProduct);
      setDraftContent(initialReview.currentContent);
      setOriginalContent(initialReview.originalContent);
      setAttachedImage(initialReview.attachedImage);
      setReviewStatus(initialReview.status);
      setFindings(initialReview.findings);
      setRevisions(initialReview.revisions || []);
      setComments(initialReview.comments || []);
      setHasRunCheck(true);
      if (initialReview.findings.length > 0) {
        setSelectedFindingId(initialReview.findings[0].id);
      }
    }
  }, [initialReview]);

  // Dynamic score calculation
  const complianceScore = useMemo(() => {
    return calculateComplianceScore(
      findings,
      Boolean(attachedImage),
      Boolean(attachedImage?.altText && attachedImage.altText.trim().length > 0)
    );
  }, [findings, attachedImage]);

  // Execute Brand Check
  const handleRunBrandCheck = () => {
    const rawFindings = runBrandCheck(draftContent, sources, brandOrProduct, attachedImage);
    setFindings(rawFindings);
    setHasRunCheck(true);
    if (rawFindings.length > 0) {
      setSelectedFindingId(rawFindings[0].id);
    } else {
      setSelectedFindingId(null);
    }
    showToast(`Brand check complete. ${rawFindings.length} findings evaluated.`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load NOVA Demo Preset
  const handleLoadNovaDemo = () => {
    setTitle('NOVA Smartphone Launch Announcement');
    setContentType('social_post');
    setChannel('linkedin');
    setBrandOrProduct('NOVA smartphone');
    setDraftContent(NOVA_DEMO_TEXT);
    setOriginalContent(NOVA_DEMO_TEXT);
    setAttachedImage(undefined);
    setReviewStatus('draft');

    // Run check immediately for judges
    const rawFindings = runBrandCheck(NOVA_DEMO_TEXT, sources, 'NOVA smartphone', undefined);
    setFindings(rawFindings);
    setHasRunCheck(true);
    if (rawFindings.length > 0) {
      setSelectedFindingId(rawFindings[0].id);
    }
    showToast('Loaded standard NOVA demonstration scenario with 250 MP & unverified claims.', 'success');
  };

  // Human correction: Accept Suggestion
  const handleAcceptSuggestion = (finding: Finding, replacementOverride?: string) => {
    const replacement = replacementOverride !== undefined ? replacementOverride : finding.suggestedCorrection;
    if (!replacement) return;

    let updatedText = draftContent;
    if (finding.matchedText && draftContent.includes(finding.matchedText)) {
      updatedText = draftContent.replace(finding.matchedText, replacement);
    } else {
      // Fallback: replace substring
      updatedText = draftContent.slice(0, finding.startIndex) + replacement + draftContent.slice(finding.endIndex);
    }

    setDraftContent(updatedText);

    // Update finding status
    const updatedFindings = findings.map((f) =>
      f.id === finding.id ? { ...f, resolutionStatus: 'accepted' as FindingResolutionStatus } : f
    );
    setFindings(updatedFindings);

    // Record revision
    const newRevNumber = (revisions.length || 0) + 1;
    const newRevision = {
      id: `rev-${Date.now()}`,
      revisionNumber: newRevNumber,
      timestamp: new Date().toISOString(),
      userRole: currentUserRole,
      authorName: currentUserName,
      summary: `Accepted correction: replaced "${finding.matchedText}" with "${replacement}"`,
      content: updatedText,
      complianceScore: calculateComplianceScore(updatedFindings, Boolean(attachedImage), Boolean(attachedImage?.altText)).overall,
      status: reviewStatus,
    };
    setRevisions((prev) => [...prev, newRevision]);

    showToast(`Applied correction: "${replacement}". Score updated.`, 'success');
  };

  // Human correction: Dismiss Finding
  const handleConfirmDismiss = () => {
    if (!dismissingFinding) return;

    const updatedFindings = findings.map((f) =>
      f.id === dismissingFinding.id
        ? {
            ...f,
            resolutionStatus: 'dismissed' as FindingResolutionStatus,
            overrideReason: dismissRationale.trim() || 'Audited and approved by reviewer.',
          }
        : f
    );
    setFindings(updatedFindings);

    // Record revision log for auditability
    const newRevNumber = (revisions.length || 0) + 1;
    const newRevision = {
      id: `rev-${Date.now()}`,
      revisionNumber: newRevNumber,
      timestamp: new Date().toISOString(),
      userRole: currentUserRole,
      authorName: currentUserName,
      summary: `Dismissed issue "${dismissingFinding.matchedText || dismissingFinding.explanation}". Reason: ${dismissRationale || 'Auditor discretion'}`,
      content: draftContent,
      complianceScore: calculateComplianceScore(updatedFindings, Boolean(attachedImage), Boolean(attachedImage?.altText)).overall,
      status: reviewStatus,
    };
    setRevisions((prev) => [...prev, newRevision]);

    setDismissingFinding(null);
    setDismissRationale('');
    showToast('Finding dismissed with audit override reason.', 'info');
  };

  // Save or update draft to storage
  const handleSaveReview = (targetStatus?: ReviewStatus) => {
    const finalStatus = targetStatus || reviewStatus;
    const score = complianceScore;

    const reviewRecord: ReviewRecord = {
      id: currentReviewId,
      title: title.trim() || 'Untitled Brand Review',
      contentType,
      channel,
      brandOrProduct,
      originalContent,
      currentContent: draftContent,
      attachedImage,
      status: finalStatus,
      complianceScore: score,
      findings,
      revisions,
      comments,
      creatorRole: currentUserRole,
      creatorName: currentUserName,
      createdAt: initialReview ? initialReview.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveReview(reviewRecord);
    setReviewStatus(finalStatus);
    showToast(`Draft successfully saved (Status: ${finalStatus.replace('_', ' ')}).`, 'success');
  };

  // Image attachment handler (mock upload or dataUrl)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImg: AttachedImage = {
          id: `img-${Date.now()}`,
          name: file.name,
          dataUrl: event.target?.result as string,
          altText: '', // initially empty to allow testing accessibility check!
        };
        setAttachedImage(newImg);
        showToast(`Image "${file.name}" attached. Run check to verify alt-text accessibility.`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedFinding = findings.find((f) => f.id === selectedFindingId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Preset Banner / NOVA Fast-Track */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-900">Content Brand Review Workspace</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              Deterministic Governance
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Preserves human intent: issues are clearly explained with suggested corrections before publication.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleLoadNovaDemo}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span>Load NOVA Demo Scenario</span>
          </button>

          <button
            onClick={handleRunBrandCheck}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Brand Check</span>
          </button>
        </div>
      </div>

      {/* Metadata Form Strip */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Draft Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. NOVA Launch Social Post"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs bg-white text-neutral-800"
            >
              <option value="social_post">Social Media Post</option>
              <option value="advertisement">Advertisement</option>
              <option value="website_copy">Website Copy</option>
              <option value="product_description">Product Description</option>
              <option value="email_campaign">Email Campaign</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Target Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as TargetChannel)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs bg-white text-neutral-800"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="website">Website</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Brand / Product Target</label>
            <input
              type="text"
              value={brandOrProduct}
              onChange={(e) => setBrandOrProduct(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. NOVA smartphone"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Left Editor, Right Governance Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Content Editor + Image Upload */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800">Draft Content Editor</span>
              <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px] tabular-nums">
                <span>{draftContent.length} chars</span>
                <span>{draftContent.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Editable Content Area */}
            <div className="p-4 space-y-3">
              <label htmlFor="draft-text" className="sr-only">Marketing draft content</label>
              <textarea
                id="draft-text"
                rows={7}
                value={draftContent}
                onChange={(e) => {
                  setDraftContent(e.target.value);
                }}
                placeholder="Type or paste your marketing copy here..."
                className="w-full p-3 font-sans text-sm border border-neutral-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-neutral-900 leading-relaxed resize-y"
              />

              {/* Inline Highlighted Text Visualizer */}
              {hasRunCheck && findings.length > 0 && (
                <div className="pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                      Interactive Text Highlights (Click to Inspect)
                    </span>
                    <span className="text-[10px] text-neutral-600">
                      Red: Conflict · Amber: Evidence/Tone · Blue: Suggestion
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-sm leading-relaxed text-neutral-800">
                    {/* Render with interactive highlights */}
                    {renderHighlightedContent(draftContent, findings, selectedFindingId, (id) =>
                      setSelectedFindingId(id)
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Image Attachment & Accessibility Block */}
            <div className="p-4 bg-neutral-50/80 border-t border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-semibold text-neutral-800">
                    Media Asset & Accessibility Verification
                  </span>
                </div>
                {!attachedImage ? (
                  <label className="cursor-pointer text-xs font-medium text-teal-700 hover:text-teal-900 underline">
                    <span>+ Attach Image for WCAG Check</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <button
                    onClick={() => {
                      setAttachedImage(undefined);
                      // remove accessibility finding if present
                      setFindings((prev) => prev.filter((f) => f.category !== 'accessibility'));
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {attachedImage && (
                <div className="p-3 bg-white rounded-md border border-neutral-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span className="font-medium font-mono text-[11px]">{attachedImage.name}</span>
                    <span className="text-[11px] text-neutral-600">Attached Media</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Image Alternative Text (Alt Text)
                    </label>
                    <input
                      type="text"
                      value={attachedImage.altText}
                      onChange={(e) => {
                        const updated = { ...attachedImage, altText: e.target.value };
                        setAttachedImage(updated);
                        // update accessibility finding in-place
                        if (e.target.value.trim().length > 0) {
                          setFindings((prev) => prev.filter((f) => f.category !== 'accessibility'));
                        }
                      }}
                      placeholder="e.g. Side profile of the NOVA smartphone displaying 50 MP camera module"
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-teal-500"
                    />
                    <p className="text-[10px] text-neutral-600 mt-1">
                      Leaving this empty will trigger a WCAG accessibility warning upon running checks.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Editor Actions */}
            <div className="px-4 py-3 bg-neutral-100 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveReview('draft')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  onClick={() => handleSaveReview('in_review')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 shadow-2xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Submit to Queue</span>
                </button>
              </div>

              {onOpenReportModal && (
                <button
                  onClick={() => {
                    const rev: ReviewRecord = {
                      id: currentReviewId,
                      title,
                      contentType,
                      channel,
                      brandOrProduct,
                      originalContent,
                      currentContent: draftContent,
                      attachedImage,
                      status: reviewStatus,
                      complianceScore,
                      findings,
                      revisions,
                      comments,
                      creatorRole: currentUserRole,
                      creatorName: currentUserName,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    onOpenReportModal(rev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 underline"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Compliance Score & Findings Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic Score Card */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider block">
                  Dynamic Brand Compliance Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-neutral-900">
                    {complianceScore.overall}
                  </span>
                  <span className="text-xs text-neutral-600">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    complianceScore.overall >= 90
                      ? 'bg-emerald-100 text-emerald-800'
                      : complianceScore.overall >= 70
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {complianceScore.overall >= 90
                    ? 'COMPLIANT'
                    : complianceScore.overall >= 70
                    ? 'CHANGES NEEDED'
                    : 'BLOCKED'}
                </span>
              </div>
            </div>

            {/* Category Subscores Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-150 text-xs">
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                <span className="text-[10px] text-neutral-600 block">Factual Consistency</span>
                <span className="font-mono font-semibold tabular-nums text-neutral-800">
                  {complianceScore.factualConsistency !== null ? `${complianceScore.factualConsistency}/100` : 'N/A'}
                </span>
              </div>

              <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                <span className="text-[10px] text-neutral-600 block">Claim & Evidence</span>
                <span className="font-mono font-semibold tabular-nums text-neutral-800">
                  {complianceScore.evidence !== null ? `${complianceScore.evidence}/100` : 'N/A'}
                </span>
              </div>

              <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                <span className="text-[10px] text-neutral-600 block">Brand Tone & Casing</span>
                <span className="font-mono font-semibold tabular-nums text-neutral-800">
                  {complianceScore.tone !== null ? `${complianceScore.tone}/100` : 'N/A'}
                </span>
              </div>

              <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                <span className="text-[10px] text-neutral-600 block">Accessibility</span>
                <span className="font-mono font-semibold tabular-nums text-neutral-800">
                  {complianceScore.accessibility !== null ? `${complianceScore.accessibility}/100` : 'Not applicable'}
                </span>
              </div>
            </div>

            {/* Scoring transparency notice */}
            <p className="text-[11px] text-neutral-600 mt-3 italic">
              * Note: A high compliance score does not guarantee factual accuracy; human editorial sign-off is required.
            </p>
          </div>

          {/* Explainable Findings List & Selected Detail */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-neutral-900">Explainable Findings</h3>
                <span className="text-[11px] text-neutral-600">
                  {findings.filter((f) => f.resolutionStatus === 'open').length} open ·{' '}
                  {findings.filter((f) => f.resolutionStatus !== 'open').length} resolved
                </span>
              </div>
              {!hasRunCheck && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Check not yet run
                </span>
              )}
            </div>

            {findings.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-600">
                <Shield className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="font-medium text-neutral-700">No issues flagged</p>
                <p className="text-neutral-600 mt-1">
                  Click "Run Brand Check" or load the NOVA sample above to evaluate your copy against approved sources.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-150 max-h-[500px] overflow-y-auto">
                {findings.map((f) => {
                  const isSelected = f.id === selectedFindingId;
                  const isOpen = f.resolutionStatus === 'open';

                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFindingId(f.id)}
                      className={`p-4 transition-colors cursor-pointer text-xs space-y-2.5 ${
                        isSelected
                          ? 'bg-teal-50/40 border-l-2 border-teal-600'
                          : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      {/* Finding Header */}
                      <div className="flex items-start justify-between gap-2">
                        <SeverityBadge severity={f.severity} resolutionStatus={f.resolutionStatus} />
                        <span className="text-[10px] text-neutral-600 font-mono capitalize">
                          {f.category.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Flagged Text */}
                      {f.matchedText && (
                        <div className="text-xs font-mono bg-neutral-100/80 px-2 py-1 rounded text-neutral-800 break-all">
                          Flagged: <span className="font-semibold text-rose-700">"{f.matchedText}"</span>
                        </div>
                      )}

                      {/* Explanation */}
                      <p className="text-neutral-700 leading-relaxed text-xs">{f.explanation}</p>

                      {/* Linked Approved Source */}
                      {f.sourceTitle && (
                        <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 pt-1">
                          <Layers className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>Linked Source: </span>
                          <span className="font-medium text-neutral-800">{f.sourceTitle}</span>
                        </div>
                      )}

                      {/* Suggested Correction Pill */}
                      {f.suggestedCorrection && isOpen && (
                        <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded text-xs text-emerald-950">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">
                            Suggested Correction:
                          </span>
                          <span className="font-mono text-emerald-900 font-semibold">
                            {f.suggestedCorrection}
                          </span>
                        </div>
                      )}

                      {/* Interactive Actions for Human Control */}
                      {isOpen && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          {f.suggestedCorrection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptSuggestion(f);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept Suggestion</span>
                            </button>
                          )}

                          {f.suggestedCorrection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFinding(f);
                                setCustomReplacementText(f.suggestedCorrection || '');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit & Apply</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDismissingFinding(f);
                              setDismissRationale('');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-rose-700 hover:bg-rose-50 rounded"
                          >
                            <X className="w-3 h-3" />
                            <span>Dismiss Finding</span>
                          </button>
                        </div>
                      )}

                      {/* If resolved: display audit trail */}
                      {!isOpen && (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {f.resolutionStatus === 'accepted'
                              ? 'Correction adopted into draft'
                              : `Dismissed (${f.overrideReason || 'Auditor discretion'})`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Suggestion Modal */}
      {editingFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900">Custom Replacement for Suggestion</h3>
            <p className="text-xs text-neutral-500">
              Customize the replacement wording for <span className="font-semibold text-neutral-800">"{editingFinding.matchedText}"</span>:
            </p>
            <input
              type="text"
              value={customReplacementText}
              onChange={(e) => setCustomReplacementText(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded text-xs focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingFinding(null)}
                className="px-3 py-1.5 border border-neutral-300 rounded text-xs font-medium text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAcceptSuggestion(editingFinding, customReplacementText);
                  setEditingFinding(null);
                }}
                className="px-3.5 py-1.5 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700"
              >
                Apply Replacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Finding Modal with Audit Rationale */}
      {dismissingFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-neutral-900">Dismiss Issue with Audit Rationale</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Dismissing a finding marks it as reviewed under human editorial discretion. It will be recorded
              in the revision log.
            </p>
            {dismissingFinding.severity === 'confirmed_conflict' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
                <strong>Warning:</strong> This is a confirmed factual conflict. An explicit justification is required.
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Override Justification / Editorial Rationale
              </label>
              <textarea
                rows={3}
                value={dismissRationale}
                onChange={(e) => setDismissRationale(e.target.value)}
                placeholder="e.g. Approved exception signed off by VP Marketing for promotional pilot..."
                className="w-full p-2 border border-neutral-300 rounded text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDismissingFinding(null)}
                className="px-3 py-1.5 border border-neutral-300 rounded text-xs font-medium text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDismiss}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-semibold"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Renders text with styled highlights mapped to findings
function renderHighlightedContent(
  text: string,
  findings: Finding[],
  selectedFindingId: string | null,
  onSelect: (findingId: string) => void
) {
  // Only highlight text-based findings with matchedText
  const validFindings = findings.filter((f) => f.matchedText && text.includes(f.matchedText));

  if (validFindings.length === 0) {
    return <span>{text}</span>;
  }

  // Find occurrences of each matched text
  interface Slice {
    text: string;
    finding?: Finding;
  }

  let remaining = text;
  const slices: Slice[] = [];

  // Sort findings by position if possible
  const sorted = [...validFindings].sort((a, b) => {
    const idxA = text.indexOf(a.matchedText);
    const idxB = text.indexOf(b.matchedText);
    return idxA - idxB;
  });

  let curIdx = 0;
  for (const f of sorted) {
    const matchIdx = text.indexOf(f.matchedText, curIdx);
    if (matchIdx !== -1) {
      if (matchIdx > curIdx) {
        slices.push({ text: text.slice(curIdx, matchIdx) });
      }
      slices.push({ text: f.matchedText, finding: f });
      curIdx = matchIdx + f.matchedText.length;
    }
  }

  if (curIdx < text.length) {
    slices.push({ text: text.slice(curIdx) });
  }

  return (
    <>
      {slices.map((slice, i) => {
        if (!slice.finding) {
          return <span key={i}>{slice.text}</span>;
        }

        const f = slice.finding;
        const isSelected = f.id === selectedFindingId;
        const isResolved = f.resolutionStatus !== 'open';

        let colorClasses = 'border-b-2 border-teal-500 bg-teal-50';
        if (isResolved) {
          colorClasses = 'border-b-2 border-emerald-500 bg-emerald-50 text-emerald-900 line-through';
        } else if (f.severity === 'confirmed_conflict') {
          colorClasses = 'border-b-2 border-rose-500 bg-rose-100/70 text-rose-950 font-semibold';
        } else if (f.severity === 'evidence_required' || f.severity === 'warning') {
          colorClasses = 'border-b-2 border-amber-500 bg-amber-100/70 text-amber-950 font-medium';
        } else if (f.severity === 'suggestion') {
          colorClasses = 'border-b-2 border-sky-400 bg-sky-50 text-sky-950';
        }

        return (
          <mark
            key={i}
            onClick={() => onSelect(f.id)}
            className={`cursor-pointer px-1 py-0.5 rounded-xs transition-all ${colorClasses} ${
              isSelected ? 'ring-2 ring-teal-600 font-bold' : ''
            }`}
            title={`${f.category}: ${f.explanation}`}
          >
            {slice.text}
          </mark>
        );
      })}
    </>
  );
}
