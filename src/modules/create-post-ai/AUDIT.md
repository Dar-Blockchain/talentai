# Audit: `src/modules/create-post-ai`

**Date:** 2026-05-21  
**Module:** Create Post (AI & Manual)  
**Files audited:** 43  
**Total issues found:** 62

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
│   ├── PostPreview.tsx         Right-panel orchestrator
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

---

## 1. Store — `store/createPostSlice.ts`

### 🔴 `as never` cast bypasses type safety (lines 149, 166)

```ts
state.salary[action.payload.field] = action.payload.value as never;
```

`as never` silences a real type mismatch between `string | number` and the `Salary` field types. Fix: type the `Salary` interface with a mapped type and use `as Salary[typeof field]` or restructure the action.

### 🔴 `updateJobField` accepts `value: any` (line 154)

No constraint on what can be stored. Passing an object or array instead of a primitive will corrupt slice state silently.

### 🔴 Selectors typed as `state: any` (lines 243–247)

```ts
export const selectGeneratedPost = (state: any) => state.postGeneration.generatedPost;
```

The full `RootState` type from `store.ts` should be used. With `any`, typos in state paths go undetected.

### 🟠 `getDefaultExpirationDate()` called on every reset (lines 101, 103, 142)

The function is called inside `clearPost` and `initialState` definition, which means it runs once at module load and once per dispatch — not a performance problem today, but it creates an inconsistency if the function ever becomes expensive or time-zone-sensitive.

### 🟠 Hardcoded defaults scattered in `initialState` (lines 78–82)

`currency: "USD"`, `thresholdScore: 60`, `interviewLanguages: ["en"]` are scattered inline. Group them into a `DEFAULT_POST_STATE` constant above `initialState` so they can be referenced by tests or reset logic.

---

## 2. Utils — `utils/index.ts`

### 🟠 `EXPERIENCE_VALUES` duplicates keys of `EXPERIENCE_OPTION_KEY` (line 63)

```ts
export const EXPERIENCE_OPTION_KEY = { "Entry-level": "...", "Junior": "...", ... };
const EXPERIENCE_VALUES = ["Entry-level", "Junior", "Mid-level", "Senior", "Expert"];
```

`EXPERIENCE_VALUES` can be derived: `Object.keys(EXPERIENCE_OPTION_KEY)`. The duplicate array drifts out of sync when new levels are added.

### 🟠 Three separate alias maps with identical structure (lines 24–61)

`EMPLOYMENT_ALIASES`, `WORK_MODE_ALIASES`, `EXPERIENCE_ALIASES` all follow the same `Record<string, string>` pattern. Consider a single `createNormalizer(optionKey, aliases)` factory to reduce repetition and keep normalization logic consistent.

### 🟡 Magic regex in `inferExperienceLevelFromText` (line 97)

```ts
/(\d+)\s*(?:\+|plus)?\s*(?:years?|ans?|annees?|annee|experience)/g
```

This pattern is undocumented. Extract it as a named constant `YEARS_EXPERIENCE_REGEX` at the top of the file.

### 🟡 `normalizeSearchText` uses unexplained Unicode range (line 69)

```ts
text.replace(/[̀-ͯ]/g, "")
```

The range `U+0300`–`U+036F` strips combining diacritics. Add a one-line comment explaining the intent (`// strip combining diacritical marks after NFD decomposition`).

---

## 3. API Layer — `api/index.ts`

### 🟠 Salary formatted with `toLocaleString()` uses browser locale (lines 26–27)

```ts
`${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`
```

Two problems: (1) formatting depends on the browser locale rather than the user's chosen currency locale; (2) currency code is prepended with no space (`USD100,000`). Use `Intl.NumberFormat` or just pass raw numbers to the backend and format on the server.

### 🟠 Salary/contract/work-mode concatenated into `description` string (lines 29–31)

```ts
const description = jobDescription + salaryText + contractText + workModeText;
```

Appending structured data into an unstructured string means the LLM (and any future parser) must re-parse it. These fields are already in the payload object — pass them separately and let the backend construct the prompt.

### 🟠 Response shape assumed inconsistent (line 45)

```ts
return body.data || body;
```

This pattern means the caller never knows which shape they received. Normalize the response inside the API function and always return the same shape.

### 🟠 `GeneratePostPayload` and `GeneratePostInput` are the same type (lines 14 & 61)

```ts
export type GeneratePostPayload = GeneratePostInput;
```

Remove the re-export alias; it adds confusion with no benefit.

### 🟠 No error handling on API calls (lines 34, 41, 53)

`axios` will throw on 4xx/5xx, but the raw `response.data` is used without validating the shape. Add a lightweight response guard or Zod schema so callers receive typed, validated data.

---

## 4. React Query Hooks — `queries/useCreatePostQueries.ts`

### 🔴 Null dereference in `useGetPostQuery` (line 18)

```ts
(state: any) => state.auth?.user?._id
```

If `state.auth` is undefined (e.g., before hydration), the selector returns `undefined`. The `enabled` option prevents the query from running but the selector itself throws. Use the typed `RootState` selector or a safe default.

### 🟠 Complex normalization logic in mutation `onSuccess` (lines 52–77)

The `onSuccess` callback of `useGeneratePostMutation` runs ~25 lines of normalization (experience level inference, percentage validation, language fallback). Extract this into `normalizeGeneratedPost(data, variables)` in `utils/index.ts` so it can be unit-tested independently.

### 🟠 Hardcoded `staleTime: 1000 * 60 * 5` (line 38)

Extract to `const CACHE_MINUTES = 5` or `GENERATED_POST_STALE_MS = 5 * 60 * 1000` so the intent is clear and it can be adjusted in one place.

### 🟡 `"Internship"` hardcoded string check (line 57)

```ts
variables.contractType === "Internship"
```

This string is used in at least 5 places across the module. Extract a `EMPLOYMENT_TYPES.INTERNSHIP = "Internship"` constant.

---

## 5. Custom Hook — `hooks/useAiPostStepper.ts`

### 🔴 Non-null assertion `generatedPost!` without runtime guard (line 27)

```ts
saveMutation.mutate({ jobData: { ...generatedPost!, interviewLanguages: ... } });
```

`validateAIPostStep0` returns early via `return` but `generatedPost` is still asserted non-null below. If the validation function ever changes, this will crash at runtime. Add an explicit guard:

```ts
if (!generatedPost) return;
```

### 🔴 `state: any` in selector (line 18)

Same issue as `createPostSlice.ts` — use `RootState`.

### 🟠 `languagesOverride` used without null-check at call (line 22)

The param is optional (`languagesOverride?: string[]`) but the mutation call spreads it without verifying it's defined:

```ts
languagesOverride ?? interviewLanguages
```

The nullish coalescing handles it, but the intent is unclear. Rename the parameter to `forcedLanguages` and document why it exists.

---

## 6. Components — `PostDescription.tsx`

### 🟡 Validation inline in component (lines 39–54)

The `validate()` function is defined inside the component. It closes over `promptDescription`, `employmentType`, `salary`, `workMode` from the selector. Consider extracting to `validatePostDescriptionForm(values)` in `utils/` so it's testable without a Redux store.

---

## 7. Components — `PostPreview.tsx`

### 🟡 `sliderColor` computed correctly before return

No issues here — the IIFE anti-pattern was already fixed. The current implementation is clean.

---

## 8. Components — `SkillEditorModal.tsx`

### 🟠 `localSkill` typed as `any` (lines 26, 34)

```ts
const [localSkill, setLocalSkill] = React.useState<any>(...);
const handleChange = (field: string, value: any) => ...
```

Define `LocalSkill = { name: string; level: string | null; percentage: number }` and use it. This prevents passing invalid keys via `handleChange("nmae", ...)`.

---

## 9. Components — Skill Editor Sub-components

### `SkillNameField.tsx`

**🟠 `props as any` in `renderOption`** (line 39)  
The MUI Autocomplete `renderOption` spreads `props as any` to extract the `key`. This is a known MUI pattern for v5.14+ where keys must be forwarded manually. Add a comment explaining it so future maintainers don't remove it.

**🟡 Hardcoded colors and font sizes** (lines 48–54)  
`#F9FAFB`, `#F3F4F6`, `#6B7280`, `#111827`, `9px`, `12.5px`, `16px` — use `theme.palette` and `theme.typography` or define module-level constants.

### `LevelField.tsx`

**🟠 `value: any` prop** (line 9)  
Should be typed as `string | null` to match the actual values used.

**🟡 Hardcoded icon color** (line 34)  
`rgba(98, 111, 134, 1)` should reference the design system.

### `PercentageField.tsx`

**🟡 Magic number constraints** (line 21)  
`min: 1, max: 100` as `inputProps` should be named constants `PERCENTAGE_MIN = 1`, `PERCENTAGE_MAX = 100`.

**🟡 `type="number"` without `inputMode="numeric"`** (line 19)  
On iOS Safari, `type="number"` shows a decimal keyboard. Add `inputMode="numeric"` to get the integer keypad.

---

## 10. Components — `post-description/SalaryFields.tsx`

### 🟠 Salary display value ternary duplicated for min and max (lines 44, 48)

```tsx
value={salary.min === 0 && isInternship ? "0" : salary.min || ""}
value={salary.max === 0 && isInternship ? "0" : salary.max || ""}
```

Extract `formatSalaryDisplay(value: number, isInternship: boolean): string` and call it for both.

### 🟠 `"Internship"` hardcoded string again (line 20)

```ts
const isInternship = employmentType === "Internship";
```

Use the shared constant mentioned in issue 4.4.

---

## 11. Components — `post-preview/SkillsSection.tsx`

No critical issues. The soft-skill delete guard and stable keys were already implemented correctly.

---

## 12. Accessibility Gaps

| Component | Issue |
|-----------|-------|
| `SkillChip.tsx` | Delete button has no `aria-label`; screen readers read "button" only |
| `AddSkillButton.tsx` | Icon-only button needs `aria-label="Add hard skill"` / `"Add soft skill"` |
| `PercentageField.tsx` | No `aria-label` or `<label>` element |
| `LevelField.tsx` | `Select` uses `displayEmpty` without `aria-label` |
| `Slider` in `PostPreview` | No `aria-label` or `aria-valuetext` for screen readers |

---

## Priority Fix List

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `store/createPostSlice.ts` | Replace `as never` with proper typing | 🔴 |
| 2 | `hooks/useAiPostStepper.ts` | Add `if (!generatedPost) return` guard | 🔴 |
| 3 | `store/createPostSlice.ts` | Replace `state: any` selectors with `RootState` | 🔴 |
| 4 | `queries/useCreatePostQueries.ts` | Fix null dereference in `useGetPostQuery` selector | 🔴 |
| 5 | `api/index.ts` | Pass salary/contract/workMode as structured fields, not concatenated string | 🟠 |
| 6 | `api/index.ts` | Normalize API response shape; remove `body.data || body` pattern | 🟠 |
| 7 | `queries/useCreatePostQueries.ts` | Extract `normalizeGeneratedPost()` from `onSuccess` | 🟠 |
| 8 | `utils/index.ts` | Derive `EXPERIENCE_VALUES` from `Object.keys(EXPERIENCE_OPTION_KEY)` | 🟠 |
| 9 | `components/SkillEditorModal.tsx` | Type `localSkill` as `LocalSkill` instead of `any` | 🟠 |
| 10 | All files | Extract `"Internship"` literal to shared constant | 🟠 |
| 11 | `components/skill-editor/LevelField.tsx` | Type `value` prop as `string \| null` | 🟠 |
| 12 | Accessibility | Add `aria-label` to SkillChip delete, AddSkillButton, Slider | 🟠 |

---

## What Is Working Well

- **React Query / Redux separation** — query file owns only cache; Redux dispatches are in components and hooks.
- **Skill CRUD** — add/edit/delete for both hard and soft skills works end-to-end with proper guards (no deleting last soft skill).
- **Experience level normalization** — alias map + `inferExperienceLevelFromText` fallback covers AI-generated variations reliably.
- **Internship salary handling** — 0/0 allowed through all three layers (validation, form, display).
- **`useEffect` dependency completeness** — `SkillEditorModal` correctly uses `[open, skill]`.
- **Stable React keys** — `"hard-{name}-{index}"` prevents reorder bugs.
- **Threshold slider** — color-coded, SectionCard-wrapped, correct placement in preview flow.
