# TrustAI BrandGuard
> **“Protect Your Brand Before You Publish.”**
> Intelligent Brand Governance Platform | Hackathon Round 3

TrustAI BrandGuard is an enterprise brand-governance web platform that reviews marketing content against approved brand guidelines, product facts, terminology, promotional claims, and accessibility rules before external publication.

---

## 1. Product Architecture

- **Frontend Core**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS v4, enterprise navy (`#0F172A`) / teal (`#0D9488`) design language with strict typography hierarchy (Plus Jakarta Sans & JetBrains Mono for tabular numbers).
- **Rule Engine**: Deterministic, source-backed brand-checking engine that compares draft content strictly against **Approved** Source Library records. Draft or pending sources are never allowed to influence results.
- **Persistence**: Self-contained client-side `localStorage` with seed data initialization, state backup/restore (JSON), and full reset capabilities.
- **Testing**: Automated Vitest test suite (`src/__tests__/brandguard.test.ts`) covering all 12 evaluation criteria.

---

## 2. Core Governance Capabilities

### A. Authoritative Source Library
- Structured repository for **Approved Brand Facts**, **Brand Guidelines**, **Approved Claims & Evidence**, **Preferred Terminology**, **Restricted Terminology**, and **Accessibility Standards**.
- Enforces strict status lifecycle: `Draft`, `Pending Review`, `Approved`, `Archived`.
- Only `Approved` records are used by the checking engine.

### B. Deterministic Brand-Checking Engine
1. **Factual Consistency**: Detects specification discrepancies (e.g. 250 MP vs approved 50 MP).
2. **Promotional Superiority Claims**: Identifies unverified claims like *"India's No. 1"* or *"World's Best"*, requiring registered audit evidence before publication without making unsubstantiated claims of falsehood.
3. **Restricted & Preferred Terminology**: Replaces prohibited wording (e.g. *"cheapest"*) with approved vocabulary (e.g. *"accessible and high-value"*).
4. **Tone & Casing Governance**: Flags excessive capitalization / shouting that violates professional brand voice.
5. **Accessibility**: Checks for missing alt-text descriptions when media assets are attached (never flags when no image is present).

### C. Human-Controlled Corrections
- **Accept Suggestion**: Directly applies corrections to draft text while preserving the original submission and logging an immutable revision.
- **Edit & Apply**: Allows the author or compliance officer to adjust wording before applying.
- **Dismiss with Audit Rationale**: Requires explicit justification for high-severity issues.

### D. Human Approval & Review Workflow
- Workflow statuses: `Draft`, `In Review`, `Changes Requested`, `Approved`, `Rejected`.
- Safeguard: Prevents approving drafts with unresolved confirmed conflicts unless an explicit audit override justification is entered.

### E. Revision History & Audit Log
- Displays before-and-after visual diffs comparing uncorrected baselines against subsequent revisions.
- Tracks compliance score progression, timestamps, and editor roles.

---

## 3. NOVA Demonstration Scenario

To evaluate the system immediately:
1. Navigate to **New Review**.
2. Click **“Load NOVA Demo Scenario”**.
3. Observe prefilled copy:
   > *“Meet NOVA, featuring a 250 MP camera. INDIA’S NO. 1 SMARTPHONE FOR EVERYONE!”*
4. Click **“Run Brand Check”**:
   - **250 MP** is flagged as a **Confirmed Conflict** against the approved 50 MP hardware specification.
   - **“INDIA'S NO. 1”** is flagged as **Evidence Required** because no certified third-party audit is on file.
   - **“INDIA'S NO. 1 SMARTPHONE FOR EVERYONE!”** is flagged as a **Brand Tone Warning** for excessive capitalization.
5. Click **“Accept Suggestion”** on 250 MP to automatically update the draft to 50 MP, observing the compliance score rise in real time.

---

## 4. Running the Application & Tests

### Development Server
```bash
npm install
npm run dev
```
The server runs locally at `http://localhost:3000`.

### Running Tests
Execute the Vitest test suite:
```bash
npm test
```
All 12 test specifications run hermetically and verify core engine rules, scoring, and persistence.

---

## 5. Security, Privacy & Backend Integration

- **Data Privacy**: 100% of review records, source rules, and drafts remain local to the user's browser in `localStorage`. No marketing drafts are ever transmitted to third-party endpoints.
- **Demonstration Roles**: Personas (`Brand Compliance Lead`, `Marketing Manager`, `Content Creator`) are demonstration roles for evaluating approval workflows.
- **FastAPI / Python Integration Roadmap**: If deployed to enterprise multi-tenant infrastructure, a Python FastAPI backend can be connected via REST endpoints (`/api/v1/sources`, `/api/v1/reviews`) with PostgreSQL and OAuth SSO authentication.
