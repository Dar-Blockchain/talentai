# Fix AI Interview Agent Intelligence

## Context

The AI interview agent asks irrelevant questions for the job role. Example: a "Growth Marketing Senior" position gets technical dev questions about code, architecture, and algorithms. There are two root causes:

1. **Models are too small and hardcoded** — AI classes ignore `config.models` and hardcode `Llama-3.2-3B` (3B!) for coverage analysis, decision making, and memory. A 3B model is far too weak for complex reasoning about job-role relevance.
2. **Question generation prompt forces dev-specific topics** — The `TECHNICAL_SKILL` system prompt explicitly tells the AI to ask about "Code, architecture, algorithms" and FORBIDS behavioral questions, regardless of whether the role is a developer or a marketer.
3. **Focus areas are interview-type-based, not role-based** — Non-pipeline interviews use generic defaults like `technical_depth`, `problem_approach` instead of role-specific skills.
4. **`roleSpecifics` only maps 3 hardcoded roles** — Everything else defaults to "Software Engineer".

---

## Fix 1: Upgrade Models & Use Config Models (Most Impactful)

### Problem
AI classes hardcode small models and ignore `session.config.models`:
- `QuestionGeneratorAI` (line 453): hardcoded `8B`
- `CoverageAnalysisAI` (line 321): hardcoded `3B`
- `DecisionEngineAI` (line 639): hardcoded `3B`
- `MemoryAI` (line 140): hardcoded `3B`

### File: `Backend/services/intelligentInterview.service.js`

**a)** Change all AI class constructors to accept and store model config:
```javascript
// QuestionGeneratorAI constructor (line 450-453):
constructor(together, sessionManager, models = {}) {
  this.model = models.fastModel || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";
}

// CoverageAnalysisAI constructor (line 318-321):
constructor(together, sessionManager, models = {}) {
  this.model = models.analysisModel || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"; // Upgraded from 3B
}

// DecisionEngineAI constructor (line 634-639):
constructor(together, sessionManager, serviceInstance, models = {}) {
  this.model = models.thinkingModel || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"; // Upgraded from 3B
}

// MemoryAI constructor (line 137-140):
constructor(together, sessionManager, models = {}) {
  this.model = models.analysisModel || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"; // Upgraded from 3B
}
```

**b)** Update `IntelligentInterviewService` constructor (line 821-831) to pass models to AI classes.

### File: `Backend/utils/config-manager.js`

**c)** Update default models in all interview type configs (lines 66-198) from `3B` to `8B`:
```javascript
thinkingModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",   // was 3B
analysisModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"    // was 3B
```

---

## Fix 2: Make Question Generation Role-Aware (Critical)

### Problem
`TECHNICAL_SKILL` question guidelines (line 461-480) hardcode dev-specific topics ("Code, architecture, algorithms") and FORBID behavioral questions. A "Growth Marketing Senior" gets forced into asking about code.

### File: `Backend/services/intelligentInterview.service.js` — `generateIntelligentQuestion()` (line 456)

Replace the hardcoded TECHNICAL_SKILL guidelines with role-aware guidelines:

```javascript
if (session.config.interviewType === 'TECHNICAL_SKILL') {
  const focusAreaNames = session.config.intelligenceContext?.focusAreas?.map(a => a.skillName || a.area) || [];
  const roleContext = session.config.context.targetRole;

  questionGuidelines = `
⚠️ CRITICAL: This is a TECHNICAL SKILL interview for the role of "${roleContext}".
Ask questions specifically related to the technical skills required for this role.

FOCUS AREAS FOR THIS ROLE:
${focusAreaNames.map(a => `- ${a}`).join('\n')}

RULES:
- Ask questions that assess practical expertise in the focus areas listed above
- Probe for real-world experience, implementation details, and best practices
- Match the technical domain to the role (e.g., marketing role → marketing analytics, campaign tools; dev role → code, architecture)
- Do NOT ask about topics outside the listed focus areas
- Be natural and conversational`;
}
```

---

## Fix 3: Make Focus Areas Role-Aware for Non-Pipeline Interviews

### Problem
When no `pipelineConfig` exists, `buildIntelligenceContext()` (line 408-424) falls back to generic defaults from `defaultConfigs[interviewType]` (e.g., `technical_depth`, `problem_approach`). These are dev-centric.

### File: `Backend/utils/config-manager.js` — `buildIntelligenceContext()` (line 408)

Add role-based focus area generation when no pipeline config exists. Add new method `generateRoleFocusAreas(targetRole)` with keyword matching:
- `marketing`/`growth` → marketing_strategy, analytics_data, channel_expertise, execution_results
- `sales`/`business development` → sales_process, relationship_building, negotiation_closing, pipeline_management
- `design`/`ux`/`ui` → design_process, user_research, visual_interaction, tools_collaboration
- `data`/`analyst` → data_analysis, tools_technologies, insights_communication, methodology
- No match → `null` (use generic defaults)

---

## Fix 4: Expand `roleSpecifics` With Dynamic Matching

### Problem
`generateRoleSpecifics()` (line 365-403) only has 3 hardcoded roles. "Growth Marketing Senior" defaults to "Software Engineer" specs.

### File: `Backend/utils/config-manager.js` — `generateRoleSpecifics()` (line 365)

Add keyword-based matching fallback before defaulting to Software Engineer:
- `marketing`/`growth` → Marketing Manager specs
- `product` → Product Manager specs
- `engineer`/`developer` → Software Engineer specs
- No match → Generic professional fallback (NOT Software Engineer)

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `Backend/services/intelligentInterview.service.js` | AI class constructors accept models; question prompt made role-aware; model upgrade 3B→8B |
| `Backend/utils/config-manager.js` | Default models 3B→8B; `generateRoleFocusAreas()` for non-pipeline; expand `roleSpecifics` |

---

## Verification

1. **Model check**: Start an interview, confirm backend logs show `Meta-Llama-3.1-8B` (not 3B) for all AI calls
2. **Role-specific questions**: Create a "Growth Marketing Senior" interview → verify questions are about marketing strategy, analytics, campaigns — NOT code/architecture
3. **Focus areas**: Check Redis session data → confirm focus areas include marketing-relevant terms
4. **roleSpecifics**: Check logs for enriched role context containing marketing responsibilities
5. **Dev role sanity check**: Create a "Software Engineer" interview → verify it still asks technical dev questions correctly
