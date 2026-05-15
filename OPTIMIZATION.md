# Frontend Optimization Report — TalentAI

> Generated: 2026-05-15 | Total source: ~74k lines across 590+ files

---

## Priority Legend
- 🔴 **High** — Affects correctness, security, or major performance
- 🟡 **Medium** — Noticeable DX/UX improvement, low risk
- 🟢 **Low** — Polish, maintainability

---

## 1. 🔴 Unused / Oversized Dependencies

| Package | Size | Status | Action |
|---------|------|--------|--------|
| `openai` | ~2MB | Only used in `src/pages/api/whisper.ts` + `src/workers/audioProcessor.worker.ts` | Keep — but lazy-load in worker |
| `jspdf` | ~300KB | Only used in `src/pages/company/billing/index.tsx` | Move to dynamic import |
| `framer-motion` | ~150KB | Used in many places | Audit — replace simple animations with CSS |
| `recharts` | ~500KB | Used in company dashboard | Already dynamic? Verify |
| `reactflow` | ~400KB | Only in post creation pipeline step | Confirm dynamic import |
| `leaflet` + `react-leaflet` | ~140KB | Admin world map only | Confirm dynamic import |
| `i18n-iso-countries` | ~200KB | Check if tree-shakeable | Import only needed locales |

**Immediate fix for `jspdf`** in `src/pages/company/billing/index.tsx:28`:
```ts
// Before
import { jsPDF } from "jspdf";

// After — only load when user clicks export
const exportPDF = async () => {
  const { jsPDF } = await import("jspdf");
  // ...
};
```

---

## 2. 🔴 Security

### Hardcoded IP address
**File:** `src/hooks/useInterviewSocket.ts:91`
```ts
// BEFORE — exposes internal server IP
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.23.207.114:5000').replace(/\/$/, '');

// AFTER
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
```
Remove the fallback IP entirely — if the env var is missing the socket should fail loudly, not silently connect to a dev server.

### `dangerouslySetInnerHTML` usage
**File:** `src/components/features/home/company/FAQSection.tsx:162`
```tsx
// BEFORE
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

// AFTER — use next/head safely
import Head from 'next/head';
<Head>
  <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
</Head>
```

---

## 3. 🔴 TypeScript — 680 `any` usages across 176 files

The worst offenders to fix first:

| File | `any` count | Fix |
|------|-------------|-----|
| `src/store/slices/campaignSlice.ts` | 61 | Type API responses with interfaces |
| `src/store/slices/postSlice.ts` | 31 | Type API responses |
| `src/store/slices/memberSlice.ts` | 19 | Type member/invitation objects |
| `src/store/slices/adminSlice.ts` | 13 | Type admin stats objects |
| `src/pages/candidate/interview/hr.tsx` | 13 | Type interview state |
| `src/hooks/useAudioTranscription.ts` | 10 | Type AssemblyAI responses |

**Quick pattern for slice typing:**
```ts
// Create src/types/campaign.ts
export interface Campaign {
  _id: string;
  title: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  // ...
}

// In campaignSlice.ts — replace `any` with Campaign
fetchCampaignById.fulfilled, (state, action: PayloadAction<Campaign>) => { ... }
```

**Props with `any`** (quick wins):
- `src/components/features/signin/SigninForm.tsx` — `themeColors: any` → create `ThemeColors` interface
- `src/components/features/signin/BackToLandingButton.tsx` — same

---

## 4. 🟡 Code Duplication

### Color constants defined in 10+ files
The color `#8310FF` (admin purple) is hard-coded in **8 admin files**. `#0D1B2A` (navy) in **11+ files**. `#0D9488` (teal) in **6+ files**.

**Fix:** Create `src/constants/colors.ts`:
```ts
export const NAVY    = '#0D1B2A';
export const TEAL    = '#0D9488';
export const PURPLE  = '#8310FF';
export const SUCCESS = '#059669';
export const WARNING = '#D97706';
export const DANGER  = '#DC2626';
```
Then replace all local `const NAVY = ...` / `const T = ...` / `const PRIMARY = ...` with the import.

Files to update:
- `src/components/features/admin/AdminSidebar.tsx`
- `src/components/features/admin/UserManagement.tsx`
- `src/components/features/admin/PostInterviewAssessments.tsx`
- `src/components/features/admin/SkillInterviewAssessments.tsx`
- `src/components/features/admin/AssessmentDetailsDialog.tsx`
- `src/components/features/admin/CompanyConfig.tsx`
- `src/components/features/admin/CompanyPermissionsModal.tsx`
- `src/components/features/admin/UserDetailsDialog.tsx`
- `src/components/features/campaign/assessment/GDPRConsentModal.tsx`
- `src/components/features/candidate/candidate-interviews/InterviewsBlock.tsx`
- + 6 more teal files

### `formatDate` defined in 3 files
- `src/utils/functions.ts` — `export const formatDate`
- `src/utils/jobHelpers.ts` — `export const formatDate`
- `src/utils/postInterviewHelpers.ts` — `export const formatDate`

**Fix:** Keep only the one in `src/utils/functions.ts`, delete duplicates, update imports.

### API base URL repeated in 35 files
Every service file re-declares:
```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

**Fix:** Create `src/utils/apiConfig.ts`:
```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const getImageUrl = (type: 'Users' | 'Companies', filename: string) =>
  `${API_BASE_URL}images/${type}/${filename}`;
```
The `getImageUrl` helper alone removes 4+ duplicated string patterns in:
- `src/components/features/candidate/candidate-interviews/AssessmentCard.tsx`
- `src/components/features/candidate/CandidateApplications.tsx`
- `src/components/layout/dashboard/Sidebar.tsx`
- `src/components/layout/header/UserAvatar.tsx`

### Score color logic in 3+ files
Pattern `score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'` appears in:
- `src/components/features/admin/AssessmentDetailsDialog.tsx`
- `src/components/features/admin/PostInterviewAssessments.tsx` (×2)
- `src/components/features/admin/SkillInterviewAssessments.tsx` (×2)
- `src/components/features/campaign/results/CampaignResultsView.tsx`

**Fix:** Use the already-existing `getScoreColor` from `src/utils/colorMappings.ts`.

---

## 5. 🟡 Performance

### Large files (>600 lines) — split into sub-components

| File | Lines | Split suggestion |
|------|-------|-----------------|
| `PaymentConfirmationModal.tsx` | 1011 | Extract `ConfirmationStep`, `SuccessStep`, `ErrorStep` |
| `CampaignParticipantsTab.tsx` | 914 | Extract `ParticipantRow`, `AddParticipantModal` |
| `plans/index.tsx` | 780 | Extract `PlanCard`, `SubscriptionBanner`, `BillingHistory` |
| `hr.tsx` (interview) | 736 | Move interview logic to `useHRInterview` hook |
| `SkillInterviewAssessments.tsx` | 714 | Extract `AssessmentRow`, `ScoreBar` |
| `WorldMapComponent.tsx` | 663 | Extract `MapLegend`, `MapTooltip` |
| `MessageList.tsx` | 649 | Extract `MessageBubble`, `DateSeparator` |
| `posts/index.tsx` | 662 | Extract `PostCard`, `PostsFilter` |

### Missing virtualization for long lists
- **`CampaignParticipantsTab.tsx`** — renders all participants at once; add pagination or `react-window`
- **`MessageList.tsx`** — chat messages can be 1000+; use `react-window` `VariableSizeList`
- **`JobPostsList.tsx`** — posts list has no virtualization

```bash
npm install react-window @types/react-window
```

### Dynamic imports missing for heavy components
Confirm these are already using `dynamic()`:
- `WorldMapComponent` (Leaflet) — verify SSR disabled
- `reactflow` pipeline component — verify lazy loaded
- `recharts` charts — verify lazy loaded

---

## 6. 🟡 Images

### 4 raw `<img>` tags — replace with `next/image`

| File | Line | Issue |
|------|------|-------|
| `src/components/ui/LanguageSwitcher.tsx` | 53, 98 | `<img>` from flagcdn.com |
| `src/components/features/company/posts/details/PostBasicDetails.tsx` | 105 | `<img>` from flagcdn.com |
| `src/components/features/company/posts/create/InterviewLanguagesModal.tsx` | 110 | `<img>` from flagcdn.com |

**Fix — add flagcdn to next.config.ts + use Image:**
```ts
// next.config.ts — add to remotePatterns:
{ protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' }
```
```tsx
// Replace
<img src={`https://flagcdn.com/w40/${lang.flag}.png`} width={28} height={20} alt={lang.label} />
// With
<Image src={`https://flagcdn.com/w40/${lang.flag}.png`} width={28} height={20} alt={lang.label} unoptimized />
```

---

## 7. 🟡 Accessibility (a11y)

### Clickable `<Box>` missing `role` and keyboard support
Pattern `<Box onClick={...} sx={{cursor:'pointer'}}>` appears 20+ times with no keyboard access.

**Fix pattern:**
```tsx
// Before
<Box onClick={() => setActive(key)} sx={{ cursor: 'pointer' }}>

// After
<Box
  onClick={() => setActive(key)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && setActive(key)}
  aria-label="Select filter"
  sx={{ cursor: 'pointer' }}
>
```

Key files to fix:
- `src/components/ui/Pagination.tsx:72`
- `src/components/features/candidate/CandidateApplications.tsx:279`
- `src/components/features/company/settings/LanguageTab.tsx:101,151,176`
- `src/components/features/company/campaigns/details/CampaignDetail.tsx:174,195,332`
- `src/components/features/interview/OnboardingModal.tsx:363`

### Hidden file inputs without aria label
- `src/pages/employee/settings.tsx:173` — `<input type="file" style={{display:'none'}}/>` needs `aria-label`

---

## 8. 🟢 Code Style

### 179 `style={{}}` inline styles — replace with `sx`
MUI's `sx` prop is tree-shakeable and theme-aware; `style={{}}` bypasses theming.

Files with most inline styles:
- `src/components/ui/LanguageSwitcher.tsx`
- `src/components/features/interview/start/CameraPreview.tsx`
- `src/components/features/register/RegisterContainer.tsx`

```tsx
// Before
<Box style={{ marginTop: 8, color: '#666' }}>

// After
<Box sx={{ mt: 1, color: 'text.secondary' }}>
```

### Namespace React imports in icon files
These 5 files use old `import * as React from 'react'` pattern:
- `src/components/icons/CheckIcon.tsx`
- `src/components/icons/EditIcon.tsx`
- `src/components/icons/MingcuteIcon.tsx`
- `src/components/icons/UserIcon.tsx`
- `src/components/icons/UsersIcon.tsx`

**Fix:** Change to `import React from 'react'` (or remove entirely if JSX transform is configured — it is, since Next.js 13+).

---

## 9. 🟢 Data Fetching

### AbortController missing in useEffect fetches
`src/components/features/home/candidate/HeroSection.tsx:35-69` — fetch without cleanup.

```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(`${API_BASE_URL}/post/public-stats`, { signal: controller.signal })
    .then(r => r.json())
    .then(setStats)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, []);
```

### Duplicate privacy/terms pages
- `src/pages/privacy.tsx` AND `src/pages/privacy-policy.tsx` — likely duplicates
- `src/pages/terms.tsx` AND `src/pages/terms-of-use.tsx` — likely duplicates

**Fix:** Pick one URL per page, redirect the other with `getServerSideProps`.

---

## Quick Win Checklist

```
[ ] Remove hardcoded IP from useInterviewSocket.ts
[ ] Dynamic import jsPDF in billing/index.tsx
[ ] Add flagcdn.com to next.config.ts remotePatterns
[ ] Create src/constants/colors.ts and replace 10+ local color consts
[ ] Create src/utils/apiConfig.ts and replace 35 inline API_BASE_URL defs
[ ] Delete duplicate formatDate in jobHelpers.ts and postInterviewHelpers.ts
[ ] Replace dangerouslySetInnerHTML in FAQSection.tsx
[ ] Add role+tabIndex to 20+ clickable Box elements
[ ] Install react-window and virtualize MessageList + CampaignParticipantsTab
[ ] Replace 4 raw <img> with <Image> from next/image
```

---

## NOT recommended to touch
- All 20 Redux slices — all active and load-bearing
- All 20 hooks — all in use
- All service files — all consumed by slices
- `recharts` / `reactflow` / `leaflet` — domain-critical, already scoped
