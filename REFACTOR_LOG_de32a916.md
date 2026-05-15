# Refactor Log — Commit `de32a916`

**Commit:** `de32a916b547ab65b6c8555dd67e3330ad5321b7`  
**Date:** 2026-05-15  
**Author:** jassemtalbi  
**Summary:** Refactor: Remove unused console logs and clean up code  
**Scope:** 157 files changed — 1,304 insertions, 1,952 deletions

---

## 1. Console Log Removal

Removed all `console.log(...)` debug statements across the codebase. `console.error(...)` and `console.warn(...)` were preserved — those are intentional error reporting.

**High-density removals (lines deleted):**

| File | Lines removed |
|------|--------------|
| `src/hooks/useAudioTranscription.ts` | 97 |
| `src/store/slices/campaignSlice.ts` | ~89 |
| `src/pages/api/sessionpost.ts` | 15 |
| `src/utils/exportInterviewData.ts` | 21 |
| `src/hooks/useInterviewConfig.ts` | 44 |
| `src/pages/api/session.ts` | 8 |
| `src/store/slices/candidateSlice.ts` | 24 |
| `src/hooks/useInterviewSocket.ts` | 20 |
| `src/store/store.ts` | 2 |
| `src/utils/functions.ts` | 8 |
| `src/utils/interviewConfigBuilder.ts` | 6 |
| `src/utils/tokenUtils.ts` | 1 |

**Additional files cleaned (1–5 console.log lines each):**  
`useCamera.ts`, `useInterviewTimer.ts`, `usePermissions.ts`, `useCandidateChatSession.ts`, `campaigns/new.tsx`, `interview/results.tsx`, and 40+ component files across `features/`, `pages/`, and `layout/`.

**Total impact:** Eliminated the primary source of console noise in production. API session routes (`session.ts`, `sessionpost.ts`) were completely cleaned — they had been logging raw request data and token values.

---

## 2. Unused Utility Deletion

Removed functions and constants that had zero import sites across the codebase.

### `src/utils/jobHelpers.ts` — 33 lines deleted

| Removed export | Reason |
|----------------|--------|
| `formatDate(dateString)` | 0 import sites — inline `toLocaleDateString` used everywhere |
| `getJobTypeColor(type)` | 0 import sites — inline colors used in components |
| `getJobTypeTextColor(type)` | 0 import sites — same |

The `Job` interface and `transformJobData()` were retained (still in use).

### `src/utils/postHelpers.ts` — 19 lines deleted

| Removed export | Reason |
|----------------|--------|
| `getJobSkills(job)` | 0 import sites — consumers read `job.skillAnalysis` directly |

The `Skill` interface and `getLevelFromNumber()` were retained.

### `src/utils/postInterviewHelpers.ts` — 64 lines deleted

| Removed export | Reason |
|----------------|--------|
| `validateProgressData(progress)` | 0 import sites |
| Additional unused helpers | 0 import sites |

`getScoreLabel()` and `CandidateProgress` interface were retained.

### `src/utils/colorMappings.ts` — 158 lines reduced

Removed all inline color definitions that were migrated to `src/constants/colors.ts` (see section 3). The file was gutted rather than deleted to preserve the module path.

---

## 3. Color Centralization — `src/constants/colors.ts`

**Created:** `src/constants/colors.ts` (new file, 8 lines)

```ts
export const NAVY   = '#0D1B2A';
export const TEAL   = '#0D9488';
export const PURPLE = '#8310FF';

export const SUCCESS = '#059669';
export const WARNING = '#D97706';
export const DANGER  = '#DC2626';
export const INFO    = '#0891B2';
```

**Why:** Color hex values were scattered across ~80 component files as string literals. A single typo or designer update required touching every file. Centralizing into one module makes palette changes a one-line edit.

**Migrated in this commit:** 80+ components updated to import from `src/constants/colors.ts` instead of using inline hex strings. Key affected areas:
- All admin panel components (`AdminSidebar.tsx`, `CompanyConfig.tsx`, etc.)
- `src/components/ui/` — `AppInput`, `AppSelect`, `Pagination`, `Toast`, `LanguageSwitcher`
- `src/components/icons/` — all 5 icon components
- Settings components, home page sections, interview flow components

---

## 4. API Config Helper — `src/utils/apiConfig.ts`

**Created:** `src/utils/apiConfig.ts` (new file, 4 lines)

```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const getImageUrl = (type: 'Users' | 'Companies', filename: string): string =>
  `${API_BASE_URL}images/${type}/${filename}`;
```

**Why:** Image URLs were being built manually in 14+ component files:
```ts
// Before (scattered across components)
`${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${filename}`
`${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${logo}`
```

**After:** Single helper with a typed `type` parameter prevents path typos and centralizes the URL pattern.

**Adopted by (initial set, this commit):**  
`Sidebar.tsx`, `MobileDrawer.tsx`, `UserAvatar.tsx`, `ApplicationCard.tsx`, `AssessmentCard.tsx`, `CandidateApplications.tsx`, `useCompanyProfileManagement.ts`, `candidate/dashboard.tsx`, `candidate/profile/settings.tsx`, `employee/settings.tsx`, `candidate/applications/[id].tsx`, `candidate/assessment/[id].tsx`

---

## 5. Dynamic jsPDF Import — Billing Page

**File:** `src/pages/company/billing/index.tsx`

**Before:**
```ts
import { jsPDF } from "jspdf";  // top-level static import
```

**After:**
```ts
const downloadInvoice = async (payment: Payment) => {
  const { jsPDF } = await import("jspdf");  // dynamic import inside function
  // ...
};
```

**Why:** `jsPDF` is ~800KB. A static import bundles it into the initial JS payload for every user who loads the billing page, even if they never click "Download Invoice." A dynamic import defers the load until the function is actually called, reducing the initial page bundle.

---

## 6. Payment Confirmation Modal — Extracted State Components

**Created:** `src/components/features/company/posts/create/steps/recruitment-flow-step/PaymentConfirmationParts.tsx` (220 lines)

Three named exports extracted from the original 1,007-line `PaymentConfirmationModal.tsx`:

| Export | Purpose |
|--------|---------|
| `ModalLoadingState` | Spinner + message — reused for "saving steps" and "publishing" states |
| `ModalSuccessState` | Checkmark circle — shown after publish succeeds |
| `ConfirmationContent` | Beta banner + summary card with step count and pricing display |

**Props:**
```ts
// ModalLoadingState
interface ModalLoadingStateProps { message: string; }

// ConfirmationContent
interface ConfirmationContentProps { numberOfSteps: number; totalPrice: number; }
```

Also removed in this commit: ~350 lines of commented-out pre-beta token payment code from `PaymentConfirmationModal.tsx` (balance checks, `processPostPayment` dispatch, `isProcessingPayment` state, token UI). The modal was reduced from 1,007 → 163 lines.

---

## 7. Component Updates — Centralized Constants and Helpers

Beyond the structural changes above, 80+ components were updated in this commit to:

- Replace inline hex color strings with imports from `src/constants/colors.ts`
- Replace manual `${process.env.NEXT_PUBLIC_API_BASE_URL}images/...` strings with `getImageUrl()` from `src/utils/apiConfig.ts`
- Remove `console.log` debug lines (covered in section 1)

**Notable per-component changes:**

| File | Change |
|------|--------|
| `LanguageTab.tsx` | 36 lines changed — color constants + flag image URL migration |
| `home/candidate/HeroSection.tsx` | 33 lines changed — color constants |
| `NotificationsPanel.tsx` | 18 lines — color constants |
| `ProfileNotificationSoundSettings.tsx` | 20 lines — color constants |
| `Pagination.tsx` | 30 lines — color constants |
| `FAQSection.tsx` | 26 lines — color constants |
| `UserDetailsDialog.tsx` | 25 lines — color constants |
| `campaignSlice.ts` | 89 lines — color + selector cleanup |

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/constants/colors.ts` | 8 | Centralized palette constants |
| `src/utils/apiConfig.ts` | 4 | `API_BASE_URL` + `getImageUrl()` helper |
| `src/components/features/company/posts/create/steps/recruitment-flow-step/PaymentConfirmationParts.tsx` | 220 | Extracted modal state components |
| `OPTIMIZATION.md` | 331 | Codebase optimization tracking doc |
| `REMAINING.md` | 157 | Remaining work tracking doc |

## Files Deleted / Gutted

| File | Lines removed | Reason |
|------|--------------|--------|
| `src/utils/jobHelpers.ts` (partial) | 33 | Removed 3 unused exported functions |
| `src/utils/postHelpers.ts` (partial) | 19 | Removed 1 unused exported function |
| `src/utils/postInterviewHelpers.ts` (partial) | 64 | Removed unused helpers |
| `src/utils/colorMappings.ts` (partial) | 158 | Migrated to `colors.ts` |
