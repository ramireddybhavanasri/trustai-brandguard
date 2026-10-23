import { AttachedImage, BrandSource, Finding } from '../types/brandguard';

/**
 * Deterministic, rule-based brand-checking engine.
 * CRITICAL RULE: ONLY sources with status === 'approved' are authoritative.
 * Draft or pending sources are strictly excluded.
 */
export function runBrandCheck(
  content: string,
  sources: BrandSource[],
  brandOrProduct?: string,
  attachedImage?: AttachedImage
): Finding[] {
  const findings: Finding[] = [];
  const text = content;

  // Filter to approved sources only
  const approvedSources = sources.filter((s) => s.status === 'approved');

  // Helper to safely find start and end index
  const findIndices = (needle: string, fromIndex = 0) => {
    const idx = text.toLowerCase().indexOf(needle.toLowerCase(), fromIndex);
    if (idx === -1) {
      return { start: 0, end: needle.length };
    }
    return { start: idx, end: idx + needle.length };
  };

  // -------------------------------------------------------------
  // 1. FACTUAL CONSISTENCY
  // -------------------------------------------------------------
  // Look for approved brand facts (e.g. Camera resolution 50 MP, RAM 8 GB, Battery 5000 mAh)
  const factSources = approvedSources.filter((s) => s.type === 'brand_fact');

  for (const fact of factSources) {
    // If targeted to a specific product (e.g. 'NOVA smartphone'), verify match or check if text contains product name
    const isTargetProduct =
      !fact.productTarget ||
      fact.productTarget === 'All Products' ||
      !brandOrProduct ||
      brandOrProduct.toLowerCase().includes(fact.productTarget.toLowerCase()) ||
      fact.productTarget.toLowerCase().includes(brandOrProduct.toLowerCase()) ||
      text.toLowerCase().includes('nova');

    if (!isTargetProduct) continue;

    // Check camera resolution pattern: e.g. (\d+)\s*(MP|Megapixels|megapixel)
    const cameraMatch = fact.content.match(/(\d+)\s*(MP|Megapixels)/i) ||
      (fact.approvedWording && fact.approvedWording.match(/(\d+)\s*(MP|Megapixels)/i));

    if (cameraMatch) {
      const approvedVal = parseInt(cameraMatch[1], 10);
      const unit = cameraMatch[2].toUpperCase();
      
      // Look for any mention of camera resolution in draft
      const draftRegex = /(\d+)\s*(MP|Megapixels|megapixel)/gi;
      let match: RegExpExecArray | null;
      while ((match = draftRegex.exec(text)) !== null) {
        const draftVal = parseInt(match[1], 10);
        if (draftVal !== approvedVal) {
          const matchedStr = match[0];
          findings.push({
            id: `fact-camera-${match.index}`,
            category: 'factual',
            severity: 'confirmed_conflict',
            matchedText: matchedStr,
            startIndex: match.index,
            endIndex: match.index + matchedStr.length,
            explanation: `Factual specification mismatch: Draft claims "${matchedStr}", but approved product specification for ${fact.productTarget || 'NOVA'} is ${approvedVal} ${unit}.`,
            sourceId: fact.id,
            sourceTitle: fact.title,
            sourceStatus: fact.status,
            suggestedCorrection: `${approvedVal} ${unit}`,
            evidenceStatus: 'verified',
            resolutionStatus: 'open',
          });
        }
      }
    }

    // Check battery or storage patterns if present in approved facts
    const storageMatch = fact.content.match(/(\d+)\s*(GB|TB)/i);
    if (storageMatch) {
      const approvedStorage = parseInt(storageMatch[1], 10);
      const storageRegex = /(\d+)\s*(GB|TB)/gi;
      let sMatch: RegExpExecArray | null;
      while ((sMatch = storageRegex.exec(text)) !== null) {
        const val = parseInt(sMatch[1], 10);
        if (val !== approvedStorage && fact.title.toLowerCase().includes('storage')) {
          const matchedStr = sMatch[0];
          findings.push({
            id: `fact-storage-${sMatch.index}`,
            category: 'factual',
            severity: 'confirmed_conflict',
            matchedText: matchedStr,
            startIndex: sMatch.index,
            endIndex: sMatch.index + matchedStr.length,
            explanation: `Factual specification mismatch: Draft states "${matchedStr}", but approved specification is ${approvedStorage} ${storageMatch[2].toUpperCase()}.`,
            sourceId: fact.id,
            sourceTitle: fact.title,
            sourceStatus: fact.status,
            suggestedCorrection: `${approvedStorage} ${storageMatch[2].toUpperCase()}`,
            evidenceStatus: 'verified',
            resolutionStatus: 'open',
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. PROMOTIONAL CLAIMS & EVIDENCE CHECK
  // -------------------------------------------------------------
  // Detect claims such as "India's No. 1", "best in the world", "guaranteed results"
  const claimPatterns = [
    { regex: /India(?:[''’]s|\s+is)?\s+No\.?\s*1(?:\s+smartphone)?/gi, label: "India's No. 1" },
    { regex: /world(?:[''’]s)?\s+best/gi, label: "World's Best" },
    { regex: /best\s+in\s+the\s+world/gi, label: "Best in the World" },
    { regex: /guaranteed\s+(?:results|satisfaction|performance)/gi, label: "Guaranteed Results" },
    { regex: /unmatched\s+(?:quality|performance|speed)/gi, label: "Unmatched Performance" },
    { regex: /100%\s+(?:foolproof|error-free|perfect)/gi, label: "100% Guarantee" },
    { regex: /cheapest\s+in\s+(?:the\s+)?market/gi, label: "Cheapest in Market" },
  ];

  const approvedClaims = approvedSources.filter((s) => s.type === 'claim');

  for (const item of claimPatterns) {
    let match: RegExpExecArray | null;
    while ((match = item.regex.exec(text)) !== null) {
      const matchedStr = match[0];
      // Check if this specific claim has an approved source with verified evidence
      const matchingApprovedClaim = approvedClaims.find(
        (c) =>
          c.content.toLowerCase().includes(matchedStr.toLowerCase()) ||
          (c.approvedWording && c.approvedWording.toLowerCase().includes(matchedStr.toLowerCase()))
      );

      const hasSupportingEvidence =
        matchingApprovedClaim &&
        matchingApprovedClaim.supportingEvidence &&
        matchingApprovedClaim.supportingEvidence.trim().length > 0;

      if (!hasSupportingEvidence) {
        findings.push({
          id: `claim-${match.index}`,
          category: 'claim',
          severity: 'evidence_required',
          matchedText: matchedStr,
          startIndex: match.index,
          endIndex: match.index + matchedStr.length,
          explanation: `Promotional superiority claim "${matchedStr}" requires verifiable third-party evidence (e.g. IDC/Counterpoint research, audit certification) before publishing. No approved evidence was found in the Source Library.`,
          sourceId: matchingApprovedClaim?.id,
          sourceTitle: matchingApprovedClaim?.title || 'Claim Substantiation Standard',
          sourceStatus: matchingApprovedClaim?.status,
          suggestedCorrection: 'A top-rated smartphone for everyday creators',
          evidenceStatus: 'missing',
          resolutionStatus: 'open',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. RESTRICTED TERMINOLOGY
  // -------------------------------------------------------------
  const restrictedSources = approvedSources.filter((s) => s.type === 'restricted_term');

  for (const source of restrictedSources) {
    const phrase = source.restrictedPattern || source.title;
    if (!phrase || phrase.trim() === '') continue;

    // Word boundary match
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let rMatch: RegExpExecArray | null;

    while ((rMatch = regex.exec(text)) !== null) {
      const matchedStr = rMatch[0];
      findings.push({
        id: `restricted-${rMatch.index}`,
        category: 'restricted_term',
        severity: source.priority === 'high' ? 'confirmed_conflict' : 'warning',
        matchedText: matchedStr,
        startIndex: rMatch.index,
        endIndex: rMatch.index + matchedStr.length,
        explanation: `Restricted terminology: "${matchedStr}" is prohibited under brand policy (${source.title}). ${source.content}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceStatus: source.status,
        suggestedCorrection: source.approvedWording,
        evidenceStatus: 'not_applicable',
        resolutionStatus: 'open',
      });
    }
  }

  // -------------------------------------------------------------
  // 4. PREFERRED TERMINOLOGY
  // -------------------------------------------------------------
  const preferredSources = approvedSources.filter((s) => s.type === 'preferred_term');

  for (const source of preferredSources) {
    const nonPreferred = source.restrictedPattern || source.title;
    if (!nonPreferred || nonPreferred.trim() === '') continue;

    const escaped = nonPreferred.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let pMatch: RegExpExecArray | null;

    while ((pMatch = regex.exec(text)) !== null) {
      const matchedStr = pMatch[0];
      findings.push({
        id: `pref-${pMatch.index}`,
        category: 'preferred_term',
        severity: 'suggestion',
        matchedText: matchedStr,
        startIndex: pMatch.index,
        endIndex: pMatch.index + matchedStr.length,
        explanation: `Preferred terminology available: Replace "${matchedStr}" with approved term "${source.approvedWording || source.content}".`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceStatus: source.status,
        suggestedCorrection: source.approvedWording || source.content,
        evidenceStatus: 'not_applicable',
        resolutionStatus: 'open',
      });
    }
  }

  // -------------------------------------------------------------
  // 5. BRAND TONE & CASING
  // -------------------------------------------------------------
  const toneGuidelines = approvedSources.filter(
    (s) => s.type === 'guideline' && s.content.toLowerCase().includes('capitalization')
  );

  // If approved tone guidelines prohibit excessive capitalization
  if (toneGuidelines.length > 0) {
    const toneSource = toneGuidelines[0];
    
    // Check for sequence of 3+ uppercase words or long capitalized sentences
    // e.g. "INDIA'S NO. 1 SMARTPHONE FOR EVERYONE!"
    const shoutingRegex = /\b([A-Z0-9']{2,}(?:\s+[A-Z0-9']{2,}){2,}[!?.]*)\b/g;
    let tMatch: RegExpExecArray | null;

    while ((tMatch = shoutingRegex.exec(text)) !== null) {
      const matchedStr = tMatch[0];
      // Filter out acceptable acronyms if alone
      if (matchedStr.length >= 8) {
        // Convert to sentence/title case as suggested correction
        const suggested = matchedStr
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
          .replace(/No\. 1/i, "No. 1");

        findings.push({
          id: `tone-caps-${tMatch.index}`,
          category: 'tone',
          severity: 'warning',
          matchedText: matchedStr,
          startIndex: tMatch.index,
          endIndex: tMatch.index + matchedStr.length,
          explanation: `Excessive capitalization detected: "${matchedStr}". Violates approved brand tone guideline "${toneSource.title}" ("${toneSource.content}"). Shouting reduces reader trust and hurts accessibility.`,
          sourceId: toneSource.id,
          sourceTitle: toneSource.title,
          sourceStatus: toneSource.status,
          suggestedCorrection: suggested,
          evidenceStatus: 'not_applicable',
          resolutionStatus: 'open',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 6. ACCESSIBILITY RULES
  // -------------------------------------------------------------
  // "Check for missing alt text when an image is uploaded or attached to a review. Do not report image alt-text problems when there is no image."
  if (attachedImage) {
    if (!attachedImage.altText || attachedImage.altText.trim().length === 0) {
      const accessibilitySource = approvedSources.find((s) => s.type === 'accessibility');
      findings.push({
        id: `access-alt-${attachedImage.id}`,
        category: 'accessibility',
        severity: 'warning',
        matchedText: `[Image: ${attachedImage.name}]`,
        startIndex: 0,
        endIndex: 0,
        explanation: `Attached image "${attachedImage.name}" is missing alternative text (alt text). Content cannot be certified for public digital distribution without accessible image descriptions for visually impaired readers.`,
        sourceId: accessibilitySource?.id,
        sourceTitle: accessibilitySource?.title || 'Accessibility Guidelines (WCAG 2.1 AA)',
        sourceStatus: accessibilitySource?.status,
        suggestedCorrection: 'Add a concise description explaining what is shown in the image.',
        evidenceStatus: 'not_applicable',
        resolutionStatus: 'open',
      });
    }
  }

  // -------------------------------------------------------------
  // 7. CUSTOM RULES
  // -------------------------------------------------------------
  const customRules = approvedSources.filter((s) => s.type === 'custom_rule');
  for (const rule of customRules) {
    if (!rule.restrictedPattern) continue;
    try {
      const cRegex = new RegExp(rule.restrictedPattern, 'gi');
      let cMatch: RegExpExecArray | null;
      while ((cMatch = cRegex.exec(text)) !== null) {
        const matchedStr = cMatch[0];
        findings.push({
          id: `custom-${rule.id}-${cMatch.index}`,
          category: 'custom',
          severity: rule.priority === 'high' ? 'confirmed_conflict' : 'warning',
          matchedText: matchedStr,
          startIndex: cMatch.index,
          endIndex: cMatch.index + matchedStr.length,
          explanation: `Custom rule violation (${rule.title}): ${rule.content}`,
          sourceId: rule.id,
          sourceTitle: rule.title,
          sourceStatus: rule.status,
          suggestedCorrection: rule.approvedWording,
          evidenceStatus: 'not_applicable',
          resolutionStatus: 'open',
        });
      }
    } catch {
      // Ignore invalid regex in user custom rules gracefully
    }
  }

  // Sort findings by severity priority: confirmed_conflict > evidence_required > warning > suggestion
  const severityWeight = {
    confirmed_conflict: 4,
    evidence_required: 3,
    warning: 2,
    suggestion: 1,
  };

  return findings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
}
