/**
 * TrustAI BrandGuard Type Definitions
 * Complete domain models for Brand Governance
 */

export type SourceCategory =
  | 'brand_fact'
  | 'guideline'
  | 'claim'
  | 'preferred_term'
  | 'restricted_term'
  | 'asset'
  | 'accessibility'
  | 'custom_rule';

export type SourceStatus = 'draft' | 'pending_review' | 'approved' | 'archived';

export type Priority = 'high' | 'medium' | 'low';

export interface BrandSource {
  id: string;
  title: string;
  type: SourceCategory;
  content: string; // Description or full guideline
  approvedWording?: string; // Expected value or approved replacement
  restrictedPattern?: string; // Term or regex to flag
  supportingEvidence?: string; // Reference URL, certificate, or research link
  tags: string[];
  priority: Priority;
  status: SourceStatus;
  expiryDate?: string;
  productTarget?: string; // e.g. 'NOVA smartphone' or 'All Products'
  createdAt: string;
  updatedAt: string;
}

export type FindingCategory =
  | 'factual'
  | 'claim'
  | 'restricted_term'
  | 'preferred_term'
  | 'tone'
  | 'accessibility'
  | 'custom';

export type FindingSeverity =
  | 'confirmed_conflict'
  | 'warning'
  | 'evidence_required'
  | 'suggestion';

export type FindingResolutionStatus = 'open' | 'accepted' | 'dismissed' | 'manual_fix';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  explanation: string;
  sourceId?: string;
  sourceTitle?: string;
  sourceStatus?: SourceStatus;
  suggestedCorrection?: string;
  evidenceStatus: 'verified' | 'unverified' | 'missing' | 'not_applicable';
  resolutionStatus: FindingResolutionStatus;
  overrideReason?: string;
  userNote?: string;
}

export type ReviewStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'rejected';

export type ContentType =
  | 'social_post'
  | 'advertisement'
  | 'website_copy'
  | 'product_description'
  | 'email_campaign';

export type TargetChannel = 'linkedin' | 'instagram' | 'website' | 'email';

export interface AttachedImage {
  id: string;
  name: string;
  dataUrl?: string;
  altText: string;
}

export interface ComplianceScore {
  overall: number; // 0-100
  factualConsistency: number | null;
  terminology: number | null;
  tone: number | null;
  evidence: number | null;
  accessibility: number | null;
  openDeductions: {
    category: string;
    description: string;
    points: number;
  }[];
  formulaSummary: string;
}

export interface Revision {
  id: string;
  revisionNumber: number;
  timestamp: string;
  userRole: string;
  authorName: string;
  summary: string;
  content: string;
  complianceScore: number;
  status: ReviewStatus;
}

export interface ReviewComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  findingId?: string;
}

export interface ReviewRecord {
  id: string;
  title: string;
  contentType: ContentType;
  channel: TargetChannel;
  brandOrProduct: string;
  originalContent: string;
  currentContent: string;
  attachedImage?: AttachedImage;
  status: ReviewStatus;
  complianceScore: ComplianceScore;
  findings: Finding[];
  revisions: Revision[];
  comments: ReviewComment[];
  creatorRole: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  approvalOverrideReason?: string;
}

export type DemonstrationRole =
  | 'Brand Compliance Lead'
  | 'Marketing Manager'
  | 'Content Creator';

export interface AppSettings {
  activeRole: DemonstrationRole;
  activeUserName: string;
  autoCheckOnDraftChange: boolean;
  highlightSeverityFilter: string;
}
