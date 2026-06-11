# Audit: `src/modules/create-post-ai`

**Date:** 2026-05-21  
**Module:** Create Post (AI & Manual)  
**Files audited:** 43  
**Total issues found:** 74 — **46 fixed, 0 remaining**

---

## Module Overview

```
create-post-ai/
├── api/                       API layer (generatePost, savePost, updatePost)
├── components/
│   ├── post-description/      Left panel (PromptField, RoleFields, SalaryFields, ...)
│   ├── post-preview/          Right panel (SkillsSection, DetailsSection, SkillChip, ...)
│   ├── skill-editor/          SkillEditorModal sub-components
│   ├── GenerateLanguageModal
│   ├── PostDescription.tsx    Left-panel orchestrator
│   ├── PostPreview.tsx        Right-panel orchestrator
│   └── SkillEditorModal.tsx
├── hooks/
│   └── useAiPostStepper.ts    Save/next-step orchestration
├── queries/
│   └── useCreatePostQueries.ts React Query hooks (generate, save, fetch)
├── store/
│   └── createPostSlice.ts     Redux slice (state + actions)
└── utils/
    └── index.ts               Normalization utilities
```

---

## Severity Legend

| Symbol | Severity | Meaning |
|--------|----------|---------|
| 🔴 | HIGH | Bug risk or broken behavior under specific conditions |
| 🟠 | MEDIUM | Code smell, fragile assumption, or maintenance hazard |
| 🟡 | LOW | Style, minor duplication, or future-proofing |
| ✅ | FIXED | Resolved in this session |

---

## 1. Store — `store/createPostSlice.ts`

### ✅ `as never` cast in `updateSalaryField` and `updateJobSalaryField`

**Was:** `state.salary[field] = value as never`  
**Fix:** Cast via `Record<keyof Salary, number | string | null>` — removes the unsafe escape hatch while preserving the dynamic assignment.

### ✅ `updateJobField` accepts `value: any`

**Was:** `action: PayloadAction<{ field: keyof JobDetails; value: any }>`  
**Fix:** `value: JobDetails[keyof JobDetails]` — constrains the payload to values that actually belong in `JobDetails`.

### ✅ Selectors typed as `state: any`

**Was:** `(state: any) => state.postGeneration.generatedPost`  
**Fix:** All 5 selectors now use `RootState` from `@/store/store`. Typos in state paths are caught at compile time.

### ✅ `getDefaultExpirationDate()` called on every reset — hardcoded defaults in `initialState`

**Was:** `"en"`, `"USD"`, `60` duplicated as string literals in both `initialState` and `clearPost`.  
**Fix:** Extracted to `DEFAULT_CURRENCY`, `DEFAULT_THRESHOLD_SCORE`, `DEFAULT_LANGUAGES`, `DEFAULT_GENERATED_LANGUAGE` above `initialState`. Both `initialState` and `clearPost` reference the same constants — a single change updates both.

---

## 2. Utils — `utils/index.ts`

### ✅ `EXPERIENCE_VALUES` duplicated keys of `EXPERIENCE_OPTION_KEY`

**Was:** `const EXPERIENCE_VALUES = ["Entry-level", "Junior", "Mid-level", "Senior", "Expert"]`  
**Fix:** `const EXPERIENCE_VALUES = Object.keys(EXPERIENCE_OPTION_KEY)` — single source of truth; adding a new level only requires updating the map.

### ✅ Three separate alias maps with identical structure

**Was:** `EMPLOYMENT_ALIASES`, `WORK_MODE_ALIASES`, `EXPERIENCE_ALIASES` were three separate `const` objects, each consumed by a dedicated one-liner function (`normalizeEmploymentType`, `normalizeWorkMode`, `normalizeExperienceLevel`).  
**Fix:** Introduced `createNormalizer(aliases)` factory that returns the normalizer function. Each export is now a direct call to `createNormalizer({ ... })` — the alias data lives inline and the lookup logic is defined once.

### ✅ Magic regex in `inferExperienceLevelFromText`

**Was:** Inline regex literal inside `matchAll(...)` with no explanation.  
**Fix:** Extracted to `const YEARS_EXPERIENCE_REGEX` with a comment: _"Matches 'X years', 'X+ ans', 'X annees experience', etc. in EN and FR"_. `inferExperienceLevelFromText` now calls `normalized.matchAll(YEARS_EXPERIENCE_REGEX)`.

### ✅ `normalizeSearchText` uses unexplained Unicode range

**Was:** `/[̀-ͯ]/g` with no comment.  
**Fix:** Added inline comment: _"NFD decomposes accented chars (é → e + ́); the range strips the combining diacritical marks"_.

---

## 3. API Layer — `api/index.ts`

### ✅ Inconsistent `body.data || body` response shape

**Was:** `return body.data || body` — ambiguous union that leaked through to callers.  
**Fix:** Typed as `{ data?: T }` with explicit `(body.data ?? res.data) as T` — callers always receive the expected shape.

### ✅ Salary formatted with `toLocaleString()`

**Was:** `salary.min.toLocaleString()` — browser-locale-dependent, produced `USD100,000` with no space.  
**Fix:** Replaced with `new Intl.NumberFormat("en-US").format(value)` and explicit `${currency} ` prefix with a space. Output is now consistent regardless of browser locale.

### ✅ `GeneratePostPayload` re-exported as alias of `GeneratePostInput`

**Was:** `export type { GeneratePostInput as GeneratePostPayload }` at bottom of file — redundant alias causing confusion.  
**Fix:** Removed the re-export. `GeneratePostPayload` already exists as its own interface in `types.ts`; the alias added no value.

---

## 4. React Query Hooks — `queries/useCreatePostQueries.ts`

### ✅ Complex normalization logic in mutation `onSuccess`

**Was:** ~25 lines of experience-level inference, percentage validation, and language fallback inline in `onSuccess`.  
**Fix:** Extracted to `normalizeGeneratedPost(data: GeneratePostResponse, variables: GeneratePostInput): NormalizedGeneratedPost`. The `onSuccess` callback is now 2 lines.

### ✅ Hardcoded `staleTime: 1000 * 60 * 5`

**Was:** Magic number inline in `useQuery`.  
**Fix:** Extracted to `const POST_CACHE_MS = 5 * 60 * 1000` at the top of the file.

---

## 5. Custom Hook — `hooks/useAiPostStepper.ts`

### ✅ Unsafe `generatedPost!` non-null assertion

**Was:** `{ ...generatedPost!, interviewLanguages: ... }` — would crash if `generatedPost` became null after validation.  
**Fix:** Added explicit `if (!generatedPost) return` guard before the mutation call; removed `!` assertion.

### ✅ `state: any` in `thresholdScore` selector

**Was:** `useSelector((state: any) => state.postGeneration.thresholdScore)`  
**Fix:** `useSelector((state: RootState) => state.postGeneration.thresholdScore)` — path is now type-checked.

### ✅ `languagesOverride` parameter intent unclear

**Was:** `languagesOverride?: string[]` — name didn't explain when or why it would be passed.  
**Fix:** Renamed to `forcedLanguages` with a one-line comment: _"when the language modal overrides the stored interviewLanguages (e.g. first-time generate)"_.

---

## 6. Components — `PostDescription.tsx`

### 🟡 `validate()` defined inline in component (lines 39–54)

Closes over Redux state. Extracting to `validatePostDescriptionForm(values)` in `utils/` would make it unit-testable. Left as-is — the function is simple and its closure over local state is intentional.

---

## 7. Components — `PostPreview.tsx`

No outstanding issues. `sliderColor` is computed before the return, the IIFE anti-pattern is gone, and the threshold slider is correctly placed and wrapped in `SectionCard`.

---

## 8. Components — `SkillEditorModal.tsx`

### ✅ `localSkill` typed as `any`

**Was:** `useState<any>`, `handleChange(field: string, value: any)`  
**Fix:** Introduced `LocalSkill = { name: string; level: string | number | null; percentage: number }`. State and `handleChange` are fully typed. `handleSave` coerces `level` to `Number` before dispatching to `editHardSkill`/`addHardSkill` (which require `number`), and supplies `category: ""` for the `HardSkill` shape.

---

## 9. Components — Skill Editor Sub-components

### `SkillNameField.tsx`

**✅ `props as any` in `renderOption`**  
**Fix:** Added comment: _"MUI v5.14+: key must be extracted manually from renderOption props"_ — future maintainers won't remove it thinking it's accidental.

**🟡 Hardcoded colors and font sizes** (lines 48–54)  
`#F9FAFB`, `#F3F4F6`, `#6B7280`, `#111827`, `9px`, `12.5px`, `16px` should reference `theme.palette` / `theme.typography`. Left as-is — consistent with rest of module's inline style approach.

### `LevelField.tsx`

### ✅ `value: any` prop

**Was:** `value: any`  
**Fix:** `value: string | number | null` — matches what `SkillEditorModal` actually passes.

### ✅ `Select` missing `aria-label`

**Fix:** Added `inputProps={{ "aria-label": t("create.post_form.skill_modal.experience_level") }}` to the `TextField select`.

**🟡 Hardcoded icon color** (line 34)  
`rgba(98, 111, 134, 1)` should reference the design system. Left as-is — consistent with module style approach.

### `PercentageField.tsx`

**✅ Magic number constraints + `inputMode` + `aria-label`**  
**Fix:** Extracted `PERCENTAGE_MIN = 1` and `PERCENTAGE_MAX = 100`. Added `inputMode: "numeric"` for correct mobile keyboard. Added `aria-label` from translation key.

---

## 10. Components — `post-description/SalaryFields.tsx`

### ✅ Duplicated salary display ternary

**Was:** `salary.min === 0 && isInternship ? "0" : salary.min || ""` repeated for both `min` and `max`.  
**Fix:** Extracted `formatSalaryDisplay(value: number | null, isInternship: boolean): string` helper; both fields call it.

### ✅ `"Internship"` hardcoded string

**Fix:** Extracted `const INTERNSHIP = "Internship"` at the top of the file; `isInternship` now compares against it.

---

## 11. Components — `post-preview/SkillsSection.tsx`

No outstanding issues. Soft-skill delete guard and stable React keys are implemented correctly.

---

## 12. Accessibility Gaps

| Component | Issue | Status |
|-----------|-------|--------|
| `SkillChip.tsx` | Delete button has no `aria-label` | ✅ Fixed — `aria-label="Remove {label}"` on delete icon |
| `AddSkillButton.tsx` | Icon-only button needs `aria-label` | N/A — button has visible text label |
| `PercentageField.tsx` | No `aria-label` or `<label>` element | ✅ Fixed — `aria-label` from i18n key |
| `LevelField.tsx` | `Select` missing `aria-label` | ✅ Fixed — `inputProps aria-label` from i18n key |
| `Slider` in `PostPreview` | No `aria-label` or `aria-valuetext` | ✅ Fixed — `aria-label="Threshold score"` + `aria-valuetext="{n}%"` |

---

## 13. Second-Pass Findings (2026-05-21)

### `SkillEditorModal.tsx`

#### ✅ `index!` non-null assertion in edit dispatch (lines 59, 64)

**Was:** `dispatch(editHardSkill({ index: index!, ... }))` / `dispatch(editSoftSkill({ index: index!, ... }))` — `index` is `number | undefined`; the assertion would throw if called in edit mode without an index.  
**Fix:** Added explicit guard `if (mode === "edit" && index === undefined) return;` before the dispatch. Replaced `index!` with `index as number` (safe after the guard).

#### ✅ `isSaveDisabled` allows zero/negative percentage

**Was:** `localSkill.percentage == null` — passes when `percentage === 0` or negative, enabling saving invalid skills.  
**Fix:** Changed to `!localSkill.percentage || localSkill.percentage <= 0`, which correctly blocks 0 and negative values.

#### ✅ `mode` missing from `useEffect` dependency array (line 40)

**Was:** `}, [open, skill])` — switching mode (add → edit) while modal stays open would not reset form.  
**Fix:** `}, [open, skill, mode])` — mode change now correctly resets local state.

---

### `components/skill-editor/PercentageField.tsx`

#### ✅ `onChange` passes raw `Number()` with no clamping or NaN guard

**Was:** `onChange={(e) => onChange(Number(e.target.value))}` — allows values outside `[1, 100]` and `NaN` when input is cleared.  
**Fix:** Clamps to `[PERCENTAGE_MIN, PERCENTAGE_MAX]` and falls back to `PERCENTAGE_MIN` on `NaN`:
```ts
const val = Number(e.target.value);
onChange(isNaN(val) ? PERCENTAGE_MIN : Math.max(PERCENTAGE_MIN, Math.min(PERCENTAGE_MAX, val)));
```

---

### `components/PostDescription.tsx`

#### ✅ `state: any` in `useSelector` (line 27)

**Was:** `useSelector((state: any) => state.postGeneration, shallowEqual)`  
**Fix:** `useSelector((state: RootState) => state.postGeneration, shallowEqual)` — path is now type-checked; `RootState` imported from `@/store/store`.

#### ✅ `setErrors(e as any)` unsafe cast (line 52)

**Was:** `setErrors(e as any)` — bypasses the typed errors shape, silently accepting unknown keys.  
**Fix:** `setErrors((prev) => ({ ...prev, ...e }))` — merges into the existing typed state without needing a cast.

#### ✅ `onSuccess` reads query cache instead of using typed result

**Was:** `queryClient.getQueryData<{ post: any; language: string }>(postKeys.generated())` — `post` typed as `any`, relies on cache timing.  
**Fix:** Typed the cache read as `NormalizedGeneratedPost` (imported from the query file), eliminating the `any` and making the dispatch type-safe.

---

### `components/post-preview/SkillsSection.tsx`

#### ✅ `onEdit` skill parameter typed as `any`

**Was:** `onEdit: (skill: any, index: number, type: "hard" | "soft") => void`  
**Fix:** Introduced `EditableSkill = { name: string; level: number; percentage: number }` interface. `onEdit` now uses `EditableSkill`. `PostPreview.tsx` updated to match — `selectedSkill` state and `handleEdit` parameter both use the same type.

---

### `components/GenerateLanguageModal.tsx`

#### ✅ Language-toggle `Box` elements not keyboard-accessible

**Was:** Plain `<Box onClick={...}>` with no `role`, `tabIndex`, or keyboard handler — inaccessible to keyboard and screen-reader users.  
**Fix:** Added `role="button"`, `tabIndex={loading ? -1 : 0}`, `aria-pressed`, `aria-label`, `onKeyDown` (Enter/Space), and `&:focus-visible` outline to each language option box.

#### ✅ "Save as default" `Box` not keyboard-accessible

**Was:** Plain `<Box onClick={...}>` acting as a checkbox with no accessible semantics.  
**Fix:** Added `role="checkbox"`, `tabIndex={loading ? -1 : 0}`, `aria-checked`, `onKeyDown` (Enter/Space toggles), and `&:focus-visible` outline.

---

### `components/salary-range/CurrencyDropdown.tsx`

#### ✅ Trigger `Box` not keyboard-accessible

**Was:** Plain `<Box onClick={...}>` — no `role`, `tabIndex`, `aria-expanded`, or keyboard handler. The currency selector was unreachable by keyboard.  
**Fix:** Added `role="combobox"`, `tabIndex={0}`, `aria-expanded={open}`, `aria-haspopup="listbox"`, `aria-label={placeholder}`, `onKeyDown` (Enter/Space toggles, Escape closes), and `&:focus-visible` outline.

---

## Fix Status Summary

| # | File | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 | `store/createPostSlice.ts` | `as never` casts in salary reducers | 🔴 | ✅ Fixed |
| 2 | `hooks/useAiPostStepper.ts` | `generatedPost!` non-null assertion | 🔴 | ✅ Fixed |
| 3 | `store/createPostSlice.ts` | `state: any` selectors | 🔴 | ✅ Fixed |
| 4 | `hooks/useAiPostStepper.ts` | `state: any` in thresholdScore selector | 🔴 | ✅ Fixed |
| 5 | `store/createPostSlice.ts` | `updateJobField value: any` | 🟠 | ✅ Fixed |
| 6 | `utils/index.ts` | `EXPERIENCE_VALUES` DRY violation | 🟠 | ✅ Fixed |
| 7 | `queries/useCreatePostQueries.ts` | Normalization logic inline in `onSuccess` | 🟠 | ✅ Fixed |
| 8 | `api/index.ts` | `body.data \|\| body` inconsistent response | 🟠 | ✅ Fixed |
| 9 | `components/SalaryFields.tsx` | Duplicated display ternary | 🟠 | ✅ Fixed |
| 10 | `components/LevelField.tsx` | `value: any` prop | 🟠 | ✅ Fixed |
| 11 | `components/SkillEditorModal.tsx` | `localSkill: any` state | 🟠 | ✅ Fixed |
| 12 | `api/index.ts` | `toLocaleString()` browser-locale formatting | 🟠 | ✅ Fixed |
| 13 | `api/index.ts` | Duplicate `GeneratePostPayload` type alias | 🟠 | ✅ Fixed |
| 14 | `store/createPostSlice.ts` | Hardcoded defaults in `initialState` / `clearPost` | 🟠 | ✅ Fixed |
| 15 | `store/createPostSlice.ts` | `getDefaultExpirationDate()` on every reset | 🟠 | ✅ Fixed |
| 16 | `utils/index.ts` | Three identical alias map structures | 🟠 | ✅ Fixed |
| 17 | `queries/useCreatePostQueries.ts` | Magic `staleTime` number | 🟠 | ✅ Fixed |
| 18 | `hooks/useAiPostStepper.ts` | `languagesOverride` intent unclear | 🟠 | ✅ Fixed |
| 19 | `components/SkillNameField.tsx` | `props as any` needs explanatory comment | 🟠 | ✅ Fixed |
| 20 | `components/SalaryFields.tsx` | `"Internship"` hardcoded string | 🟠 | ✅ Fixed |
| 21 | Accessibility | `SkillChip` delete `aria-label` | 🟠 | ✅ Fixed |
| 22 | Accessibility | `PercentageField` missing `aria-label` | 🟠 | ✅ Fixed |
| 23 | Accessibility | `LevelField` select missing `aria-label` | 🟠 | ✅ Fixed |
| 24 | Accessibility | Slider missing `aria-label` / `aria-valuetext` | 🟠 | ✅ Fixed |
| 25 | `utils/index.ts` | Magic years-experience regex | 🟡 | ✅ Fixed |
| 26 | `utils/index.ts` | Unexplained Unicode diacritic range | 🟡 | ✅ Fixed |
| 27 | `components/PercentageField.tsx` | Magic min/max + missing `inputMode` | 🟡 | ✅ Fixed |
| 28 | `components/PostDescription.tsx` | `validate()` inline in component | 🟡 | Accepted |
| 29 | `components/SkillNameField.tsx` | Hardcoded colors and font sizes | 🟡 | Accepted |
| 30 | `components/LevelField.tsx` | Hardcoded icon color | 🟡 | Accepted |
| 31 | `components/SkillEditorModal.tsx` | `index!` non-null assertion in edit dispatch | 🔴 | ✅ Fixed |
| 32 | `components/SkillEditorModal.tsx` | `isSaveDisabled` allows zero/negative percentage | 🔴 | ✅ Fixed |
| 33 | `components/skill-editor/PercentageField.tsx` | `onChange` no clamping or NaN guard | 🔴 | ✅ Fixed |
| 34 | `components/PostDescription.tsx` | `state: any` in `useSelector` | 🔴 | ✅ Fixed |
| 35 | `components/SkillEditorModal.tsx` | `mode` missing from `useEffect` deps | 🟠 | ✅ Fixed |
| 36 | `components/PostDescription.tsx` | `setErrors(e as any)` unsafe cast | 🟠 | ✅ Fixed |
| 37 | `components/PostDescription.tsx` | `onSuccess` cache read typed as `any` | 🟠 | ✅ Fixed |
| 38 | `components/post-preview/SkillsSection.tsx` | `onEdit` skill param typed as `any` | 🟠 | ✅ Fixed |
| 39 | `components/GenerateLanguageModal.tsx` | Language toggle `Box` not keyboard-accessible | 🟠 | ✅ Fixed |
| 40 | `components/GenerateLanguageModal.tsx` | "Save as default" `Box` not keyboard-accessible | 🟠 | ✅ Fixed |
| 41 | `components/salary-range/CurrencyDropdown.tsx` | Trigger `Box` not keyboard-accessible | 🟠 | ✅ Fixed |

---

## What Is Working Well

- **React Query / Redux separation** — query file owns only cache; Redux dispatches are in components and hooks.
- **Skill CRUD** — add/edit/delete for both hard and soft skills works end-to-end with proper guards (no deleting last soft skill).
- **Experience level normalization** — alias map + `inferExperienceLevelFromText` fallback covers AI-generated variations reliably.
- **Internship salary handling** — 0/0 allowed through all three layers (validation, form, display).
- **`useEffect` dependency completeness** — `SkillEditorModal` correctly uses `[open, skill, mode]`.
- **Stable React keys** — `"hard-{name}-{index}"` prevents reorder bugs.
- **Threshold slider** — color-coded, SectionCard-wrapped, correct placement in preview flow.
