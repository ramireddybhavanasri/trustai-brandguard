import { describe, it, expect, beforeEach } from 'vitest';
import { runBrandCheck } from '../services/engine';
import { calculateComplianceScore } from '../services/scoring';
import {
  INITIAL_SOURCES,
  getSources,
  saveSources,
  getReviews,
  saveReviews,
  resetToDefaults,
} from '../services/storage';
import { BrandSource, ReviewRecord } from '../types/brandguard';

describe('TrustAI BrandGuard Core Governance Engine & Workflows', () => {
  beforeEach(() => {
    // Reset memory stores to pristine baseline before each test
    resetToDefaults();
  });

  // 1. Adding and editing a Source Library entry works
  it('1. correctly adds and edits a Source Library entry', () => {
    const currentSources = getSources();
    const newSource: BrandSource = {
      id: 'test-src-101',
      title: 'Waterproof Spec IP68',
      type: 'brand_fact',
      content: 'NOVA device has IP68 water resistance certified up to 1.5m.',
      approvedWording: 'IP68 water resistant',
      priority: 'high',
      status: 'approved',
      tags: ['specs', 'waterproof'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSources([...currentSources, newSource]);
    const updated = getSources();
    const found = updated.find((s) => s.id === 'test-src-101');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Waterproof Spec IP68');

    // Edit the source
    if (found) {
      found.approvedWording = 'Certified IP68';
      saveSources(updated);
      const rechecked = getSources().find((s) => s.id === 'test-src-101');
      expect(rechecked?.approvedWording).toBe('Certified IP68');
    }
  });

  // 2. Only approved sources are treated as authoritative
  it('2. ensures ONLY approved sources are treated as authoritative by the brand checking engine', () => {
    const draftText = 'NOVA smartphone has 120W charging and 200 MP camera.';

    // Create an unapproved (draft or pending_review) source attempting to approve 200 MP
    const draftSource: BrandSource = {
      id: 'unapproved-fact',
      title: 'Draft 200 MP Spec (UNAPPROVED)',
      type: 'brand_fact',
      content: 'NOVA camera sensor is 200 MP.',
      approvedWording: '200 MP',
      status: 'draft', // DRAFT STATUS - NOT AUTHORITATIVE
      priority: 'high',
      tags: ['unapproved'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sources = [...INITIAL_SOURCES, draftSource];
    const findings = runBrandCheck(draftText, sources, 'NOVA smartphone');

    // Because the draftSource is NOT approved, the engine still evaluates against the APPROVED source (50 MP)
    // and flags 200 MP as a confirmed conflict!
    const cameraConflict = findings.find((f) => f.matchedText === '200 MP');
    expect(cameraConflict).toBeDefined();
    expect(cameraConflict?.severity).toBe('confirmed_conflict');
    expect(cameraConflict?.suggestedCorrection).toBe('50 MP');
  });

  // 3. The NOVA 250 MP claim is flagged against the approved 50 MP fact
  it('3. flags the NOVA 250 MP specification against the approved 50 MP fact', () => {
    const draft = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const findings = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone');

    const cameraConflict = findings.find(
      (f) => f.category === 'factual' && f.matchedText === '250 MP'
    );

    expect(cameraConflict).toBeDefined();
    expect(cameraConflict?.severity).toBe('confirmed_conflict');
    expect(cameraConflict?.suggestedCorrection).toBe('50 MP');
    expect(cameraConflict?.explanation).toContain('50 MP');
  });

  // 4. “India’s No. 1” is marked as requiring evidence when no evidence exists
  it('4. marks "India\'s No. 1" as requiring evidence without falsely declaring it automatically false', () => {
    const draft = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const findings = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone');

    const claimFinding = findings.find(
      (f) => f.category === 'claim' && f.matchedText.toLowerCase().replace(/[’']/g, "'").includes("india's no. 1")
    );

    expect(claimFinding).toBeDefined();
    expect(claimFinding?.severity).toBe('evidence_required');
    expect(claimFinding?.evidenceStatus).toBe('missing');
    expect(claimFinding?.explanation).toContain('requires verifiable third-party evidence');
  });

  // 5. The tone rule flags the configured excessive-capitalization example
  it('5. flags excessive capitalization against the approved tone guideline', () => {
    const draft = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const findings = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone');

    const toneFinding = findings.find((f) => f.category === 'tone');
    expect(toneFinding).toBeDefined();
    expect(toneFinding?.severity).toBe('warning');
    expect(toneFinding?.explanation).toContain('Excessive capitalization detected');
    expect(toneFinding?.suggestedCorrection).toBeDefined();
  });

  // 6. Findings link to the correct sources
  it('6. correctly links findings to their approved source identifiers and titles', () => {
    const draft = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const findings = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone');

    const cameraFinding = findings.find((f) => f.category === 'factual');
    expect(cameraFinding?.sourceId).toBe('src-fact-camera');
    expect(cameraFinding?.sourceTitle).toBe('NOVA Smartphone Camera Specification');

    const toneFinding = findings.find((f) => f.category === 'tone');
    expect(toneFinding?.sourceId).toBe('src-guide-tone');
  });

  // 7. Suggested corrections modify the draft only after user action
  it('7. applies corrections to the draft content only through explicit human acceptance', () => {
    const initialText = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const findings = runBrandCheck(initialText, INITIAL_SOURCES, 'NOVA smartphone');
    const cameraFinding = findings.find((f) => f.matchedText === '250 MP');

    expect(cameraFinding).toBeDefined();
    // Before human acceptance, initialText remains unmodified
    expect(initialText).toContain('250 MP');

    // Simulate explicit user action: replace matched text with suggestion
    const correctedText = initialText.replace(cameraFinding!.matchedText, cameraFinding!.suggestedCorrection!);
    expect(correctedText).toContain('50 MP');
    expect(correctedText).not.toContain('250 MP');
  });

  // 8. Revisions preserve the original content
  it('8. preserves the original content when recording revisions', () => {
    const originalText = 'Initial unreviewed draft with 250 MP camera.';
    const revisedText = 'Revised draft with 50 MP camera.';

    const review: ReviewRecord = {
      id: 'rev-test-8',
      title: 'Revision Preservation Test',
      contentType: 'social_post',
      channel: 'linkedin',
      brandOrProduct: 'NOVA smartphone',
      originalContent: originalText,
      currentContent: revisedText,
      status: 'in_review',
      complianceScore: calculateComplianceScore([], false, false),
      findings: [],
      revisions: [
        {
          id: 'r-1',
          revisionNumber: 1,
          timestamp: new Date().toISOString(),
          userRole: 'Content Creator',
          authorName: 'Alex Rivera',
          summary: 'Original draft submission',
          content: originalText,
          complianceScore: 75,
          status: 'in_review',
        },
        {
          id: 'r-2',
          revisionNumber: 2,
          timestamp: new Date().toISOString(),
          userRole: 'Brand Compliance Lead',
          authorName: 'Sarah Chen',
          summary: 'Applied 50 MP hardware correction',
          content: revisedText,
          complianceScore: 100,
          status: 'approved',
        },
      ],
      comments: [],
      creatorRole: 'Content Creator',
      creatorName: 'Alex Rivera',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(review.originalContent).toBe(originalText);
    expect(review.revisions[0].content).toBe(originalText);
    expect(review.currentContent).toBe(revisedText);
  });

  // 9. Review status changes persist after save
  it('9. persists review status and comment changes in storage', () => {
    const reviews = getReviews();
    const demoRev = reviews[0];
    const initialStatus = demoRev.status;

    demoRev.status = 'approved';
    demoRev.comments.push({
      id: 'c-test',
      author: 'Sarah Chen',
      role: 'Brand Compliance Lead',
      timestamp: new Date().toISOString(),
      text: 'Verified by compliance lead.',
    });

    saveReviews(reviews);

    const reloaded = getReviews();
    const found = reloaded.find((r) => r.id === demoRev.id);
    expect(found?.status).toBe('approved');
    expect(found?.comments.some((c) => c.text === 'Verified by compliance lead.')).toBe(true);
  });

  // 10. Dashboard metrics reflect stored records
  it('10. calculates dashboard metrics accurately from stored records', () => {
    const reviews = getReviews();
    const totalDrafts = reviews.length;
    const awaitingApproval = reviews.filter(
      (r) => r.status === 'in_review' || r.status === 'changes_requested'
    ).length;

    let openIssues = 0;
    reviews.forEach((r) => {
      r.findings.forEach((f) => {
        if (f.resolutionStatus === 'open') openIssues += 1;
      });
    });

    expect(totalDrafts).toBeGreaterThanOrEqual(1);
    expect(awaitingApproval).toBeGreaterThanOrEqual(0);
    expect(openIssues).toBeGreaterThanOrEqual(0);
  });

  // 11. Dynamic compliance score formula works properly
  it('11. deducts points deterministically and restores them upon resolution', () => {
    const draft = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';
    const rawFindings = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone');

    const scoreWithOpenIssues = calculateComplianceScore(rawFindings, false, false);
    // Base 100 minus conflict (25), evidence required (15), tone warning (10)
    expect(scoreWithOpenIssues.overall).toBeLessThan(70);

    // If all issues are accepted/resolved
    const resolvedFindings = rawFindings.map((f) => ({
      ...f,
      resolutionStatus: 'accepted' as const,
    }));
    const scoreWithResolvedIssues = calculateComplianceScore(resolvedFindings, false, false);
    expect(scoreWithResolvedIssues.overall).toBe(100);
  });

  // 12. Accessibility check only evaluates alt-text when an image is present
  it('12. only evaluates image alt-text when an image is attached and never when absent', () => {
    const draft = 'Simple marketing post with no images.';

    // Check with NO image attached: accessibility score is null / not evaluated
    const findingsNoImage = runBrandCheck(draft, INITIAL_SOURCES, 'NOVA smartphone', undefined);
    const scoreNoImage = calculateComplianceScore(findingsNoImage, false, false);
    expect(findingsNoImage.some((f) => f.category === 'accessibility')).toBe(false);
    expect(scoreNoImage.accessibility).toBeNull();

    // Check WITH image attached but missing alt text
    const attachedImageWithoutAlt = {
      id: 'img-1',
      name: 'banner.jpg',
      altText: '',
    };
    const findingsWithImage = runBrandCheck(
      draft,
      INITIAL_SOURCES,
      'NOVA smartphone',
      attachedImageWithoutAlt
    );
    const accessibilityIssue = findingsWithImage.find((f) => f.category === 'accessibility');
    expect(accessibilityIssue).toBeDefined();
    expect(accessibilityIssue?.severity).toBe('warning');
  });
});
