# Time-Budgeted Coverage Interview System

## Context

Interviews are running 40+ minutes instead of the target 20-30 minutes. The user wants:
1. A `deep` URL parameter: `deep=true` → 30 min, otherwise → 20 min
2. Time budgeted per coverage item: `maxTime / numberOfCoverageItems`
3. Auto-advance to next coverage item when its time budget is exhausted
4. Score bonus when candidate covers an item before its time budget expires

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/interviewConfigBuilder.ts` | Add `deep` param, set duration 20/30 |
| `src/hooks/useInterviewConfig.ts` | Parse `deep` from URL query |
| `Backend/services/intelligentInterview.service.js` | Time-budget logic in decision engine, score bonus, auto-advance |
| `Backend/utils/redis-session-manager.js` | Store `areaStartTime` and `timeBudgetPerArea` in session |
| `Backend/utils/config-manager.js` | Fix default duration from 45 → respect frontend value |

---

## Fix 1: Add `deep` URL Parameter (Frontend)

### `src/utils/interviewConfigBuilder.ts`
- Add `deep?: string` to `URLParams` interface (line ~15)
- In `buildInterviewConfigFromURL()` (line 162), change duration logic:
  ```typescript
  duration: params.deep === 'true' ? 30 : 20
  ```

### `src/hooks/useInterviewConfig.ts`
- Add `deep` to URL param extraction (line ~272):
  ```typescript
  deep: router.query.deep as string,
  ```

---

## Fix 2: Compute & Store Time Budget Per Coverage Area (Backend)

### `Backend/services/intelligentInterview.service.js` — `startInterview()` (line ~1171)

After session creation, compute time budget per area and store it:
```javascript
const coverageAreas = Object.keys(session.coverage.areas);
const totalMinutes = config.sessionSettings?.duration || 20;
const timeBudgetPerAreaMs = (totalMinutes * 60 * 1000) / coverageAreas.length;

await this.sessionManager.updateSession(sessionId, {
  interviewStartTime: Date.now(),
  maxDurationMinutes: totalMinutes,
  timeBudgetPerAreaMs,
  coverageAreaCount: coverageAreas.length,
  // ... existing qualityTracking ...
});
```

### `Backend/utils/redis-session-manager.js` — Coverage area tracking

When the first question targets a new area, record `areaStartTime` on the coverage area object. Add a helper method:
```javascript
async setAreaStartTime(sessionId, areaName) {
  const session = await this.getSession(sessionId);
  if (session?.coverage?.areas?.[areaName] && !session.coverage.areas[areaName].startTime) {
    session.coverage.areas[areaName].startTime = Date.now();
    await this.updateCoverage(sessionId, session.coverage);
  }
}
```

---

## Fix 3: Auto-Advance When Area Time Budget Expires (Backend)

### `Backend/services/intelligentInterview.service.js` — `makeIntelligentDecision()` (line ~660)

Add a time budget check BEFORE the existing quality-based logic:

```javascript
// TIME BUDGET CHECK: Force advance if area time budget exhausted
if (currentArea && session.timeBudgetPerAreaMs) {
  const areaData = session.coverage.areas[currentArea];
  if (areaData?.startTime) {
    const areaElapsed = Date.now() - areaData.startTime;
    if (areaElapsed >= session.timeBudgetPerAreaMs) {
      console.log(`Time budget exhausted for area "${currentArea}" (${Math.round(areaElapsed/1000)}s)`);
      const nextArea = this.findLeastAskedArea(session.coverage.areas, currentArea);
      return {
        decision: 'explore_new_area',
        targetArea: nextArea,
        reasoning: `Time budget for "${currentArea}" exhausted. Moving to "${nextArea}".`,
        forceAdvance: true
      };
    }
  }
}
```

Also: after question generation, when storing the interviewer question, mark `areaStartTime` if this is the first question in that area. This goes in `processCandidateResponse()` and `processCandidateResponseIntelligently()` after storing the question:

```javascript
// Set area start time if this is the first question targeting this area
const targetArea = proposedQuestion.targetAreas?.[0];
if (targetArea) {
  await this.sessionManager.setAreaStartTime(sessionId, targetArea);
}
```

---

## Fix 4: Score Bonus for Early Coverage Completion (Backend)

### `Backend/services/intelligentInterview.service.js` — `updateCoverageIntelligently()` (line ~2648)

After updating an area's coverage, check if it reached "covered" threshold (percentage >= 60%) before its time budget expired. If so, apply a bonus:

```javascript
// SCORE BONUS: Reward candidates who cover an area before time expires
if (session.timeBudgetPerAreaMs && updatedArea.percentage >= 60 && !updatedArea.earlyCompletionBonus) {
  const areaStartTime = updatedArea.startTime;
  if (areaStartTime) {
    const elapsed = Date.now() - areaStartTime;
    const timeBudget = session.timeBudgetPerAreaMs;
    if (elapsed < timeBudget) {
      const timeRemainingRatio = (timeBudget - elapsed) / timeBudget;
      const bonus = Math.round(timeRemainingRatio * 15); // Up to 15 bonus points
      updatedArea.percentage = Math.min(100, updatedArea.percentage + bonus);
      updatedArea.earlyCompletionBonus = bonus;
      console.log(`Early completion bonus: +${bonus}% for "${areaName}" (${Math.round(timeRemainingRatio*100)}% time remaining)`);
    }
  }
}
```

---

## Fix 5: Enforce Duration Default in Config Manager (Backend)

### `Backend/utils/config-manager.js` — `createIntelligentConfig()` (line ~319)

Change the session settings default from 45 to respect the frontend value:
```javascript
duration: userConfig.sessionSettings?.duration || 20,  // was 45
```

This ensures the backend doesn't override the 20/30 min duration set by the `deep` param.

---

## Verification

1. **URL param test**: Navigate to `/interview/hr?jobId=xxx&deep=true` → verify 30 min timer. Without `deep` → verify 20 min timer.
2. **Time budget test**: With 4 coverage areas and 20 min → each area gets 5 min. Monitor backend logs for "Time budget exhausted" after ~5 min per area.
3. **Auto-advance test**: Let the clock run on one area without answering well → verify it auto-advances to next area.
4. **Score bonus test**: Answer a coverage item well and quickly → check backend logs for "Early completion bonus" and verify the area percentage has the bonus applied.
5. **Total duration**: Verify interview ends at 20 or 30 min total.
