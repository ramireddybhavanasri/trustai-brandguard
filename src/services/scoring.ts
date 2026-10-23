import { ComplianceScore, Finding } from '../types/brandguard';

/**
 * Calculates a dynamic, deterministic compliance score out of 100.
 * Deductions apply only to 'open' findings.
 * Accepted or dismissed findings do not penalize the current score.
 */
export function calculateComplianceScore(
  findings: Finding[],
  hasImageAttached: boolean,
  imageHasAltText: boolean
): ComplianceScore {
  const openFindings = findings.filter((f) => f.resolutionStatus === 'open');

  let overall = 100;
  const openDeductions: { category: string; description: string; points: number }[] = [];

  // Track subscore deductions
  let factualDeduction = 0;
  let termDeduction = 0;
  let toneDeduction = 0;
  let evidenceDeduction = 0;

  for (const f of openFindings) {
    let points = 0;
    if (f.severity === 'confirmed_conflict') {
      points = 25;
    } else if (f.severity === 'evidence_required') {
      points = 15;
    } else if (f.severity === 'warning') {
      points = 10;
    } else if (f.severity === 'suggestion') {
      points = 5;
    }

    overall -= points;
    openDeductions.push({
      category: f.category,
      description: `[${f.severity.replace('_', ' ').toUpperCase()}] ${f.matchedText ? `"${f.matchedText}"` : f.explanation}`,
      points,
    });

    if (f.category === 'factual') {
      factualDeduction += points;
    } else if (f.category === 'restricted_term' || f.category === 'preferred_term') {
      termDeduction += points;
    } else if (f.category === 'tone') {
      toneDeduction += points;
    } else if (f.category === 'claim') {
      evidenceDeduction += points;
    }
  }

  // Accessibility score
  let accessibilityScore: number | null = null;
  if (hasImageAttached) {
    accessibilityScore = imageHasAltText ? 100 : 70;
  }

  const finalOverall = Math.max(0, Math.min(100, overall));

  return {
    overall: finalOverall,
    factualConsistency: Math.max(0, 100 - factualDeduction),
    terminology: Math.max(0, 100 - termDeduction),
    tone: Math.max(0, 100 - toneDeduction),
    evidence: Math.max(0, 100 - evidenceDeduction),
    accessibility: accessibilityScore,
    openDeductions,
    formulaSummary: `Base 100 - (Conflicts × 25) - (Evidence Required × 15) - (Warnings × 10) - (Suggestions × 5)`,
  };
}
