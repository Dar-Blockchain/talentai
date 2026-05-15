# What Still Needs to Change

> Status after cleanup session — 2026-05-15

---

## 🔴 High Priority

### 1. Replace 14 inline image URL patterns with `getImageUrl()`

A `getImageUrl()` helper was created in `src/utils/apiConfig.ts` but the 14 files below still build the URL manually:

```ts
// Current pattern (repeated 14 times)
`${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`

// Should be
import { getImageUrl } from '@/utils/apiConfig';
getImageUrl('Users', profile.user_image)
```

Files to update:
- `src/components/features/candidate/candidate-interviews/AssessmentCard.tsx:81`
- `src/components/features/candidate/CandidateApplications.tsx:88`
- `src/components/features/company/applications/ApplicationCard.tsx:63`
- `src/components/layout/dashboard/Sidebar.tsx:149`
- `src/components/layout/header/MobileDrawer.tsx:99`
- `src/components/layout/header/UserAvatar.tsx:44`
- `src/hooks/useCompanyProfileManagement.ts:98,133,135`
- `src/pages/candidate/applications/[id].tsx:156`
- `src/pages/candidate/assessment/[id].tsx:323`
- `src/pages/candidate/dashboard.tsx:208`
- `src/pages/candidate/profile/settings.tsx:84`
- `src/pages/employee/settings.tsx:91`

---

### 2. TypeScript — 680 `any` types remaining

Worst files to fix first (highest `any` count):

| File | Count | What to type |
|------|-------|-------------|
| `src/store/slices/campaignSlice.ts` | 61 | Campaign, CampaignMetrics, Participant interfaces |
| `src/store/slices/postSlice.ts` | 31 | Post, Step, Assessment interfaces |
| `src/store/slices/memberSlice.ts` | 19 | Member, Invitation interfaces |
| `src/store/slices/adminSlice.ts` | 13 | AdminStats, UserGrowth interfaces |
| `src/pages/candidate/interview/hr.tsx` | 13 | Interview state types |
| `src/hooks/useAudioTranscription.ts` | 10 | AssemblyAI response types |

Create proper interfaces in `src/types/` and replace `any` with them.

---

## 🟡 Medium Priority

### 3. Split large files (>600 lines)

| File | Lines | Extract |
|------|-------|---------|
| `src/components/features/company/posts/create/steps/recruitment-flow-step/PaymentConfirmationModal.tsx` | 1011 | `ConfirmationStep`, `SuccessStep`, `ErrorStep` sub-components |
| `src/components/features/company/campaigns/details/CampaignParticipantsTab.tsx` | 914 | `ParticipantRow` → own file, `AddParticipantDialog` → own file |
| `src/pages/company/plans/index.tsx` | 780 | `PlanCard`, `SubscriptionBanner`, `BillingHistoryTable` |
| `src/pages/candidate/interview/hr.tsx` | 736 | Move interview logic into `useHRInterview` hook |
| `src/components/features/admin/SkillInterviewAssessments.tsx` | 714 | `AssessmentRow`, `ScoreBar` |
| `src/components/features/admin/WorldMapComponent.tsx` | 663 | `MapLegend`, `MapTooltip` |
| `src/components/features/chat/MessageList.tsx` | 649 | `MessageBubble`, `DateSeparator` |
| `src/pages/company/posts/index.tsx` | 662 | `PostCard`, `PostsFilterBar` |

---

### 4. Accessibility — remaining clickable `<Box>` without `role`

Fixed: `Pagination.tsx`, `LanguageTab.tsx`, `InterviewLanguagesModal.tsx`

Still missing `role="button"` + `tabIndex={0}`:
- `src/components/features/interview/OnboardingModal.tsx:363` — file upload drop zone
- `src/components/features/company/campaigns/details/CampaignDetail.tsx:174,195,332`
- `src/components/features/company/departments/details/DepartmentMembersSection.tsx:56`
- `src/components/features/candidate/CandidateApplications.tsx:279`
- `src/pages/candidate/dashboard.tsx:54`

---

### 5. Replace `style={{}}` inline styles with `sx` prop (179 occurrences in 81 files)

Highest-density files:
- `src/components/features/interview/start/CameraPreview.tsx`
- `src/components/features/register/RegisterContainer.tsx`
- `src/components/ui/LanguageSwitcher.tsx`

Pattern:
```tsx
// Before
<Box style={{ marginTop: 8, color: '#666' }}>
// After
<Box sx={{ mt: 1, color: 'text.secondary' }}>
```

---

### 6. Duplicate privacy/terms pages

Two pairs of duplicate pages — pick one URL each, redirect the other:
- `src/pages/privacy.tsx` ↔ `src/pages/privacy-policy.tsx`
- `src/pages/terms.tsx` ↔ `src/pages/terms-of-use.tsx`

---

## 🟢 Low Priority

### 7. Update icon files to modern React import

5 files use `import * as React from 'react'` (old pattern, unnecessary in Next.js 13+):
- `src/components/icons/CheckIcon.tsx`
- `src/components/icons/EditIcon.tsx`
- `src/components/icons/MingcuteIcon.tsx`
- `src/components/icons/UserIcon.tsx`
- `src/components/icons/UsersIcon.tsx`

Change to `import React from 'react'` or remove the import entirely.

---

### 8. Add AbortController to useEffect fetches

`src/components/features/home/candidate/HeroSection.tsx:35-69` — fetch with no cleanup on unmount. Add:
```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, []);
```

---

## ✅ Already Done

- [x] Hardcoded dev IP removed from `useInterviewSocket.ts`
- [x] `jsPDF` dynamically imported in `billing/index.tsx`
- [x] `dangerouslySetInnerHTML` removed from `FAQSection.tsx`
- [x] `PURPLE` (#8310FF) centralized — 32 files updated
- [x] `TEAL` (#0D9488) centralized — 60+ files updated
- [x] `NAVY` (#0D1B2A) centralized — 11+ files updated
- [x] `src/constants/colors.ts` created
- [x] `src/utils/apiConfig.ts` created
- [x] Duplicate `formatDate` removed from `jobHelpers.ts` and `postInterviewHelpers.ts`
- [x] `flagcdn.com` added to `next.config.ts` remotePatterns
- [x] 4 raw `<img>` replaced with `<Image>` (Next.js)
- [x] `role`/`tabIndex` added to clickable boxes in 3 files
- [x] `candidateSlice.ts` (empty placeholder) deleted
- [x] ~115 `console.log` statements removed across 21 files
- [x] `uuid` package uninstalled (unused)
- [x] `reactStrictMode` enabled
- [x] 15 unused utility exports removed
- [x] Dead TODO comments cleaned in campaign files
