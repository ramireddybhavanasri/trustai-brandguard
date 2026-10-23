import { AppSettings, BrandSource, ReviewRecord } from '../types/brandguard';
import { runBrandCheck } from './engine';
import { calculateComplianceScore } from './scoring';

const STORAGE_KEYS = {
  SOURCES: 'trustai_brandguard_sources_v1',
  REVIEWS: 'trustai_brandguard_reviews_v1',
  SETTINGS: 'trustai_brandguard_settings_v1',
};

export const INITIAL_SOURCES: BrandSource[] = [
  {
    id: 'src-fact-camera',
    title: 'NOVA Smartphone Camera Specification',
    type: 'brand_fact',
    content: 'NOVA flagship main camera sensor is officially certified at 50 MP with f/1.8 aperture and optical image stabilization (OIS).',
    approvedWording: '50 MP',
    productTarget: 'NOVA smartphone',
    tags: ['specs', 'camera', 'hardware', 'nova'],
    priority: 'high',
    status: 'approved',
    supportingEvidence: 'https://specs.trustai-brand.internal/hardware/nova-50mp-sensor-spec.pdf',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'src-fact-battery',
    title: 'NOVA Smartphone Battery Specification',
    type: 'brand_fact',
    content: 'NOVA smartphone battery capacity is 5000 mAh supporting 67W rapid Turbo Charge.',
    approvedWording: '5000 mAh',
    productTarget: 'NOVA smartphone',
    tags: ['specs', 'battery', 'hardware'],
    priority: 'medium',
    status: 'approved',
    supportingEvidence: 'https://specs.trustai-brand.internal/hardware/nova-battery-cert.pdf',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'src-guide-tone',
    title: 'Brand Tone and Capitalization Standards',
    type: 'guideline',
    content: 'Use clear, professional, customer-friendly language. Avoid excessive capitalization, aggressive exclamation, and shouting across all external channels.',
    tags: ['tone', 'style', 'casing', 'voice'],
    priority: 'medium',
    status: 'approved',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'src-claim-policy',
    title: 'Promotional Claims & Benchmark Substantiation Policy',
    type: 'claim',
    content: 'Superiority and superlative claims like "India\'s No. 1" or "Best in the World" must cite registered third-party audit reports or official market share research.',
    approvedWording: 'Top-rated everyday smartphone according to consumer reviews',
    tags: ['legal', 'claims', 'compliance', 'substantiation'],
    priority: 'high',
    status: 'approved',
    supportingEvidence: '', // Deliberately empty for unverified claims
    createdAt: '2026-08-15T08:30:00Z',
    updatedAt: '2026-09-20T16:00:00Z',
  },
  {
    id: 'src-rest-cheap',
    title: 'Restricted Term: Cheap / Cheapest',
    type: 'restricted_term',
    content: 'Do not use "cheap" or "cheapest". Brand positioning emphasizes accessible craftsmanship and lasting value, never budget cutbacks.',
    restrictedPattern: 'cheap|cheapest',
    approvedWording: 'accessible and high-value',
    tags: ['vocabulary', 'positioning', 'restricted'],
    priority: 'high',
    status: 'approved',
    createdAt: '2026-08-12T13:00:00Z',
    updatedAt: '2026-08-12T13:00:00Z',
  },
  {
    id: 'src-pref-customer',
    title: 'Preferred Term: Customer-Centric',
    type: 'preferred_term',
    content: 'Preferred brand voice uses "customer-centric" instead of "user-focused" to highlight relationship-first marketing.',
    restrictedPattern: 'user-focused',
    approvedWording: 'customer-centric',
    tags: ['vocabulary', 'preferred'],
    priority: 'low',
    status: 'approved',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'src-access-alt',
    title: 'Digital Accessibility Rule: Image Alternative Text',
    type: 'accessibility',
    content: 'All uploaded visual assets must provide human-authored alternative text (alt text) describing image content for assistive technologies and WCAG 2.1 AA compliance.',
    tags: ['accessibility', 'wcag', 'images'],
    priority: 'high',
    status: 'approved',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-08-01T15:00:00Z',
  },
  {
    id: 'src-draft-waterproof',
    title: 'Draft Fact: Water Resistance Rating (UNAPPROVED)',
    type: 'brand_fact',
    content: 'NOVA IP68 water resistance rating is currently under laboratory thermal stress testing. Not yet approved for external claims.',
    approvedWording: 'IP68 rating',
    productTarget: 'NOVA smartphone',
    tags: ['testing', 'lab', 'unapproved'],
    priority: 'low',
    status: 'draft', // Draft status: Must NOT be used in checks
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'src-pending-slogan',
    title: 'Pending Review: 2027 Tagline (PENDING APPROVAL)',
    type: 'guideline',
    content: 'Proposed brand slogan: "Intelligence within Reach". Under brand council committee review.',
    tags: ['campaign2027', 'pending'],
    priority: 'medium',
    status: 'pending_review', // Pending review: Must NOT be used in checks
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-20T08:00:00Z',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  activeRole: 'Brand Compliance Lead',
  activeUserName: 'Sarah Chen',
  autoCheckOnDraftChange: false,
  highlightSeverityFilter: 'all',
};

// Seed initial review for the NOVA scenario
const SEED_NOVA_DRAFT = 'Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!';

function createInitialReviews(): ReviewRecord[] {
  const initialFindings = runBrandCheck(SEED_NOVA_DRAFT, INITIAL_SOURCES, 'NOVA smartphone');
  const initialScore = calculateComplianceScore(initialFindings, false, false);

  const novaReview: ReviewRecord = {
    id: 'rev-nova-demo-001',
    title: 'NOVA Smartphone Launch Announcement',
    contentType: 'social_post',
    channel: 'linkedin',
    brandOrProduct: 'NOVA smartphone',
    originalContent: SEED_NOVA_DRAFT,
    currentContent: SEED_NOVA_DRAFT,
    status: 'changes_requested',
    complianceScore: initialScore,
    findings: initialFindings,
    revisions: [
      {
        id: 'rev-1',
        revisionNumber: 1,
        timestamp: '2026-10-21T16:20:00Z',
        userRole: 'Content Creator',
        authorName: 'Alex Rivera',
        summary: 'Initial draft submitted for pre-publication brand check',
        content: SEED_NOVA_DRAFT,
        complianceScore: initialScore.overall,
        status: 'in_review',
      },
      {
        id: 'rev-2',
        revisionNumber: 2,
        timestamp: '2026-10-21T17:45:00Z',
        userRole: 'Brand Compliance Lead',
        authorName: 'Sarah Chen',
        summary: 'Flagged 250 MP mismatch and unverified superiority claim; requested revisions',
        content: SEED_NOVA_DRAFT,
        complianceScore: initialScore.overall,
        status: 'changes_requested',
      },
    ],
    comments: [
      {
        id: 'comm-1',
        author: 'Sarah Chen',
        role: 'Brand Compliance Lead',
        timestamp: '2026-10-21T17:46:00Z',
        text: 'The 250 MP spec is a confirmed conflict with our hardware engineering spec (50 MP). Also, "India\'s No. 1" cannot be published without certified market share documentation.',
      },
    ],
    creatorRole: 'Content Creator',
    creatorName: 'Alex Rivera',
    createdAt: '2026-10-21T16:20:00Z',
    updatedAt: '2026-10-21T17:46:00Z',
  };

  const approvedDraft = 'Meet NOVA, featuring an approved 50 MP camera built for customer-centric creators.';
  const approvedFindings = runBrandCheck(approvedDraft, INITIAL_SOURCES, 'NOVA smartphone');
  const approvedScore = calculateComplianceScore(approvedFindings, false, false);

  const compliantReview: ReviewRecord = {
    id: 'rev-nova-approved-002',
    title: 'NOVA Creator Series Website Copy',
    contentType: 'website_copy',
    channel: 'website',
    brandOrProduct: 'NOVA smartphone',
    originalContent: approvedDraft,
    currentContent: approvedDraft,
    status: 'approved',
    complianceScore: approvedScore,
    findings: approvedFindings,
    revisions: [
      {
        id: 'rev-appr-1',
        revisionNumber: 1,
        timestamp: '2026-10-20T11:00:00Z',
        userRole: 'Content Creator',
        authorName: 'Marcus Bell',
        summary: 'Draft submitted matching approved guidelines',
        content: approvedDraft,
        complianceScore: approvedScore.overall,
        status: 'in_review',
      },
      {
        id: 'rev-appr-2',
        revisionNumber: 2,
        timestamp: '2026-10-20T14:30:00Z',
        userRole: 'Brand Compliance Lead',
        authorName: 'Sarah Chen',
        summary: 'Approved for publication; all facts and tone certified',
        content: approvedDraft,
        complianceScore: approvedScore.overall,
        status: 'approved',
      },
    ],
    comments: [
      {
        id: 'comm-2',
        author: 'Sarah Chen',
        role: 'Brand Compliance Lead',
        timestamp: '2026-10-20T14:30:00Z',
        text: 'Fully compliant with 50 MP camera specification and approved customer-centric vocabulary. Approved for release.',
      },
    ],
    creatorRole: 'Content Creator',
    creatorName: 'Marcus Bell',
    createdAt: '2026-10-20T11:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  };

  return [novaReview, compliantReview];
}

// Memory fallback if localStorage is unavailable
let memSources: BrandSource[] | null = null;
let memReviews: ReviewRecord[] | null = null;
let memSettings: AppSettings | null = null;

const listeners: Array<() => void> = [];

export function subscribeToStore(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function getSources(): BrandSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  if (!memSources) {
    memSources = [...INITIAL_SOURCES];
    saveSources(memSources);
  }
  return memSources;
}

export function saveSources(sources: BrandSource[]): void {
  memSources = sources;
  try {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  } catch {
    // ignore
  }
  notifyListeners();
}

export function getReviews(): ReviewRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  if (!memReviews) {
    memReviews = createInitialReviews();
    saveReviews(memReviews);
  }
  return memReviews;
}

export function saveReviews(reviews: ReviewRecord[]): void {
  memReviews = reviews;
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch {
    // ignore
  }
  notifyListeners();
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  if (!memSettings) {
    memSettings = { ...INITIAL_SETTINGS };
    saveSettings(memSettings);
  }
  return memSettings;
}

export function saveSettings(settings: AppSettings): void {
  memSettings = settings;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
  notifyListeners();
}

export function resetToDefaults(): void {
  memSources = [...INITIAL_SOURCES];
  memReviews = createInitialReviews();
  memSettings = { ...INITIAL_SETTINGS };
  saveSources(memSources);
  saveReviews(memReviews);
  saveSettings(memSettings);
}

export function clearAllData(): void {
  memSources = [];
  memReviews = [];
  saveSources([]);
  saveReviews([]);
}
