# TalentAI Intelligent Interview System

## Architecture Overview

The interview system is built on 4 AI classes + Agent Persona + Combined Analysis, Redis session storage, MongoDB RAG (Retrieval-Augmented Generation), and WebSocket communication.

```
Frontend (Next.js)  <──WebSocket──>  Controller  <──>  AI Service  <──>  AWS Bedrock
                                         │                  │
                                    Socket.IO          Agent Persona
                                    safeEmit()         Combined Analysis
                                         │             Question Strategy
                                       Redis            MongoDB RAG
                                   (sessions)         (JD + questions)
```

### Components

| Component | File | Role |
|-----------|------|------|
| **Controller** | `controllers/intelligentInterview.controller.js` | WebSocket event handler with `safeEmit()` |
| **AI Service** | `services/intelligentInterview.service.js` | Main orchestrator with Agent Persona + Combined Analysis |
| **Config Manager** | `utils/config-manager.js` | `detectJobCategory()`, `getEvaluationFramework()`, interview configs |
| **Bedrock Helper** | `helpers/bedrock.helpers.js` | LLM calls (dual-model: gpt-oss + Nova Lite) |
| **RAG Service** | `services/rag.service.js` | JD indexing, question dedup, context retrieval |
| **Session Manager** | `utils/redis-session-manager.js` | Session state, coverage, conversation history |

### Dual-Model Architecture

| Model | Used For | Speed | API |
|-------|----------|-------|-----|
| **gpt-oss-120b** (OpenAI on Bedrock) | Greeting (streamed) | ~15-25s | `InvokeModelCommand` (OpenAI format) |
| **Amazon Nova Lite** (fast model) | Combined analysis, question generation, all other calls | ~2-3s | `ConverseCommand` (universal format) |

All LLM calls except greeting use Nova Lite via `useFastModel: true`. Target: <5s total per turn.

---

## Agent Persona System (NEW)

At interview start, the system builds a **job-aware AI persona** that drives all subsequent behavior.

### How It Works

1. **`detectJobCategory(title, description)`** — Keyword-based category detection:
   - engineering, marketing, sales, design, product, data, customer_support, management, operations, finance

2. **`getEvaluationFramework(category, interviewType)`** — Category-specific focus areas:
   - engineering/technical: `technical_depth`(35%), `problem_solving`(25%), `code_quality`(20%), `practical_experience`(20%)
   - marketing/technical: `strategy_thinking`(30%), `data_driven`(25%), `creativity`(25%), `execution`(20%)
   - sales/technical: `selling_skills`(35%), `product_knowledge`(20%), `process_discipline`(25%), `relationship_building`(20%)
   - Each framework includes `questionStyles` (e.g., "scenario-based", "code review")

3. **`buildAgentPersona(jobData, config)`** — ONE Nova Lite call at interview start:
   - Analyzes JD to extract: `mustHaveSkills`, `niceToHaveSkills`, `keyBehaviors`, `redFlags`, `domainSpecificTopics`, `agentTone`
   - Stored in session as `agentPersona`
   - Overrides coverage areas with evaluation framework

### Persona Data Structure

```javascript
{
  job: { title, company, description, requirements, responsibilities, experienceLevel },
  interviewType: "TECHNICAL_SKILL",
  jobCategory: "engineering",
  idealCandidate: {
    mustHaveSkills: ["React", "Node.js", "System Design"],
    niceToHaveSkills: ["GraphQL", "Docker"],
    keyBehaviors: ["attention to detail", "collaboration"],
    redFlags: ["no testing experience", "avoids complexity"],
    domainSpecificTopics: ["microservices", "CI/CD", "cloud architecture"],
    agentTone: "technical but approachable"
  },
  evaluationFramework: { focusAreas: {...}, questionStyles: [...] },
  agentBehavior: { tone: "...", domainTopics: [...] }
}
```

---

## Interview Flow: Start to Finish

### Phase 1: Interview Initialization

```
Client emits: start_interview { config, candidateId }
                    |
                    v
         +----------------------+
         |  Generate Session ID | (UUID)
         |  Create Redis Session| (2-hour TTL)
         +----------+-----------+
                    |
                    v
         +----------------------+
         |  Load Job Description| (from MongoDB Post model)
         |  Index JD for RAG    | (4 semantic chunks -> embeddings)
         +----------+-----------+
                    |
                    v
         +----------------------+
         | Build Agent Persona  | (ONE Nova Lite call)
         | -> detectJobCategory | (keyword-based)
         | -> getEvalFramework  | (category-specific areas)
         | -> LLM: ideal cand.  | (must-haves, red flags, tone)
         +----------+-----------+
                    |
                    v
         +----------------------+
         | Override Coverage    | (persona-driven focus areas)
         | Init Candidate Prof. | (empty profile for tracking)
         | Initialize Timing    | (time budget per area)
         +----------+-----------+
                    |
                    v
         +----------------------+
         |  Generate Greeting   | (gpt-oss, streamed)
         |  <- greeting_chunk   | (real-time text chunks)
         |  <- greeting_complete| (done signal)
         +----------------------+
```

### Phase 2: Each Candidate Turn (NEW Pipeline)

Target: <5 seconds total per turn.

```
candidateResponse (transcript text)
        |
        v
+-------------------------------------------+
| STEP 1: COMBINED ANALYSIS                  |  <- Nova Lite (~2-3s)
|    combinedAnalysis()                      |
|    ONE call replaces 4-5 separate calls:   |
|    -> quality (score, depth, completeness) |
|    -> skills (demonstrated, hinted, gaps)  |
|    -> coverage (areas impacted, evidence)  |
|    -> style (verbosity, confidence, etc.)  |
|    -> interestingTopics (bridge candidates)|
|    -> shouldEnd (AI termination check)     |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 2: UPDATE CANDIDATE PROFILE           |  <- Pure logic (0ms)
|    updateCandidateProfile()                |
|    -> communication style, expertise       |
|    -> gaps, anchors, difficulty level      |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 3: APPLY COVERAGE UPDATES             |  <- Pure logic (0ms)
|    From analysis.coverage.areasImpacted    |
|    -> increment area percentages           |
|    -> store evidence as indicators         |
|    -> time-based bonus (if early)          |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 4: QUALITY FILTER + TERMINATION       |  <- Pure logic (0ms)
|    quality < 30 -> ignore content          |
|    shouldEnd -> return end_interview       |
|    Rule-based: time, 8 bad/good, avg      |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 5: QUESTION STRATEGY                  |  <- Pure logic (0ms)
|    decideQuestionStrategy()                |
|    4 modes:                                |
|    BRIDGE:     topic -> coverage gap       |
|    PROBE:      surface answer -> depth     |
|    TRANSITION: switch to weakest area      |
|    VALIDATE:   confirm strength            |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 6: GENERATE QUESTION                  |  <- Nova Lite (~2-3s)
|    generateIntelligentQuestion()           |
|    Prompt includes:                        |
|    -> persona (must-haves, red flags)      |
|    -> strategy (bridge/probe/etc.)         |
|    -> candidate profile (style, expertise) |
|    -> coverage gaps                        |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 7: DEDUP (RAG Vector Search)          |  <- ~50ms
|    If > 85% similar -> regenerate ONCE     |
+-------------------+-----------------------+
                    |
                    v
+-------------------------------------------+
| STEP 8: EMIT + BACKGROUND                  |  <- Immediate
|    -> interviewer_message to client        |
|    -> coverage_update to client            |
|    Fire-and-forget:                        |
|    -> index question in RAG                |
|    -> update real-time report              |
+-------------------------------------------+

TOTAL: ~4-5 seconds per turn
```

---

## Candidate Profile (Adaptive Behavior)

The system builds a real-time profile of the candidate to adapt questions.

```javascript
{
  communicationStyle: {
    verbosity: "concise|detailed|rambling",
    confidenceLevel: "hesitant|moderate|confident",
    usesExamples: true/false
  },
  revealedExpertise: ["React", "AWS"],       // Skills demonstrated
  revealedGaps: ["testing", "CI/CD"],         // Skills missing
  anchors: [                                  // Topics for BRIDGE mode
    { turn: 3, topic: "microservices migration", unexplored: ["testing strategy"], relevantArea: "code_quality" }
  ],
  currentDifficulty: "foundational|intermediate|advanced",
  responseQualities: [72, 85, 45, ...]        // Score history
}
```

### How Profile Drives Questions

- **Concise speaker** -> open-ended questions that invite elaboration
- **Rambling speaker** -> focused, specific questions
- **Advanced difficulty** -> deeper, more challenging questions
- **Foundational difficulty** -> simpler, more scaffolded questions
- **Anchor topics** -> BRIDGE mode connects past mentions to coverage gaps

---

## 4-Mode Question Strategy

Instead of an LLM deciding the next action, pure logic selects one of 4 modes:

| Mode | Trigger | Effect |
|------|---------|--------|
| **BRIDGE** | Candidate mentioned topic mapping to a coverage gap | "You mentioned X — how does that relate to Y?" |
| **PROBE** | Current area < 70% and answer was surface-level | "Can you give a specific example of that?" |
| **TRANSITION** | Need to explore weakest uncovered area | "Let's talk about [weakest area]" |
| **VALIDATE** | All areas adequately covered | Quick confirmation question |

Priority order: BRIDGE > PROBE > TRANSITION > VALIDATE

---

## Combined Analysis (Replaces 4-5 Separate Calls)

One Nova Lite call returns all analysis in a single JSON response:

```json
{
  "quality": { "score": 72, "answeredQuestion": true, "depthLevel": "moderate", "isOffTopic": false, "completeness": "complete" },
  "skills": { "demonstrated": ["React hooks"], "hinted": ["TypeScript"], "gaps": ["testing"] },
  "coverage": { "areasImpacted": [{ "area": "technical_depth", "increase": 10, "evidence": "Discussed React component architecture" }] },
  "style": { "verbosity": "detailed", "confidence": "confident", "usesExamples": true },
  "interestingTopics": [{ "topic": "microservices migration", "unexplored": ["rollback strategy"], "relevantArea": "practical_experience" }],
  "shouldEnd": { "shouldEnd": false, "reason": "" }
}
```

---

## Coverage Tracking System

Each interview tracks coverage of focus areas as percentages (0-100%).

### How Coverage Increases

After each candidate response:
1. **Combined analysis** returns `areasImpacted` with evidence
2. **Per-area updates**: `{ area, increase (5-15), evidence }`
3. **Time bonus**: +up to 15% if an area reaches 60% before its time budget expires
4. **Capped at 100%** per area

### Coverage Drives Question Strategy

The weakest areas receive priority via `decideQuestionStrategy()`:
- Areas < 50% coverage are candidates for TRANSITION mode
- Areas < 70% with surface-level answers trigger PROBE mode

---

## Early Termination

| Condition | Threshold | Label |
|-----------|-----------|-------|
| Time limit | 20 minutes (configurable) | `time_limit` |
| Consecutive bad answers | 8 responses with quality < 40 | `poor_quality` |
| Consecutive good answers | 8 responses with quality >= 75 | `excellent_quality` |
| Poor performance | Avg quality < 35% after 6+ responses | `poor_performance` |
| Excellent performance | Avg quality >= 80% after 8+ responses | `excellent_performance` |
| AI judgment | Combined analysis `shouldEnd: true` | `ai_determined` |

---

## Error Handling & Fallbacks

| Call | Timeout | Fallback |
|------|---------|----------|
| Combined analysis | 15s | Default scores (quality: 50, no coverage impact) |
| Agent persona build | 30s | Empty persona (generic focus areas used) |
| Question generation | 30s | "Can you elaborate on your most recent project experience?" |
| Question similarity | 8s | `isSimilar: false` (proceed with question) |
| Greeting | 30s | Pre-built fallback greeting |
| Report update | 30s | Fire-and-forget (doesn't block question delivery) |

### safeEmit()

All `socket.emit()` calls go through `safeEmit()` which checks `socket.connected` before emitting. If disconnected, the event is logged and dropped instead of crashing.

---

## WebSocket Events Reference

| Event | Direction | Payload |
|-------|-----------|---------|
| `start_interview` | Client -> Server | `{ config, candidateId }` |
| `interview_started` | Server -> Client | `{ success, sessionId, greeting, config, jobDetails }` |
| `greeting_chunk` | Server -> Client | `{ content, sessionId }` |
| `greeting_complete` | Server -> Client | `{ sessionId }` |
| `candidate_response` | Client -> Server | `{ sessionId, transcript, v3Turn, turnOrder }` |
| `interviewer_typing` | Server -> Client | `{ sessionId, status: "thinking" }` |
| `interviewer_message` | Server -> Client | `{ type, content, targetAreas, timestamp }` |
| `response_processed` | Server -> Client | `{ sessionId, coverageUpdate }` |
| `coverage_update` | Server -> Client | `{ sessionId, coverage }` |
| `report_update` | Server -> Client | `{ sessionId, report }` |
| `end_interview` | Client -> Server | `{ sessionId }` |
| `interview_ended` | Server -> Client | `{ finalReport, analytics, sessionId }` |
| `interview_error` | Server -> Client | `{ error, message }` |

---

## Session Data Structure (Redis)

```javascript
{
  sessionId: "uuid",
  candidateId: "mongo-id",
  config: { interviewType, context, focusAreas, persona, sessionSettings },
  agentPersona: {                              // NEW
    job: { title, company, description, requirements, responsibilities },
    jobCategory: "engineering",
    idealCandidate: { mustHaveSkills, redFlags, agentTone, ... },
    evaluationFramework: { focusAreas, questionStyles },
    agentBehavior: { tone, domainTopics }
  },
  candidateProfile: {                          // NEW
    communicationStyle: { verbosity, confidenceLevel, usesExamples },
    revealedExpertise: [], revealedGaps: [], anchors: [],
    currentDifficulty: "intermediate", responseQualities: []
  },
  currentFocusArea: "technical_depth",         // NEW - tracks current area for strategy
  conversation: [
    {
      id: "msg-uuid",
      timestamp: "ISO",
      type: "interviewer" | "candidate",
      content: "text",
      metadata: {
        aiGenerated: true,
        targetAreas: ["area"],
        qualityScore: 72,
        strategy: "bridge",                    // NEW - which strategy mode generated this
        aiAnalysis: { skillsInferred, competenciesShown, depthLevel }
      }
    }
  ],
  coverage: {
    overall: 45,
    areas: {
      technical_depth: {
        percentage: 65,
        indicators: [{ name, covered, evidence, quality }],
        weight: 35,                            // From evaluation framework
        description: "Deep technical knowledge...",  // NEW
        questionsAsked: 3,
        completed: false
      }
    }
  },
  qualityTracking: {
    consecutiveBadAnswers: 0,
    consecutiveGoodAnswers: 2,
    totalQuestions: 5,
    avgQualityScore: 68
  },
  realTimeReport: {
    strengths: ["REST API experience"],
    weaknesses: ["No mention of testing"],
    recommendations: ["Ask about CI/CD"],
    scores: { technicalSkills: 7, communication: 8 }
  },
  status: "active",
  startTime: "ISO",
  lastActivity: "ISO"
}
```

---

## RAG System

### Job Description Indexing (once per interview)

```
Job Post (MongoDB) -> 4 Semantic Chunks:
  +- role_overview:     "Role: {title}. {description}"
  +- requirements:      All requirements joined
  +- responsibilities:  All responsibilities joined
  +- company:           Company context

Each chunk -> Together AI embedding (1024 dims) -> MongoDB jd_chunks collection
```

### Question Deduplication (per question)

```
Proposed question -> Together AI embedding -> Vector search (interview_questions)
  +- Score > 0.85 -> Too similar, regenerate
  +- Score < 0.85 -> Unique, proceed
```

**Collections:**
- `jd_chunks` -- JD embeddings (indexed by `jd_vector_index`)
- `interview_questions` -- Asked question embeddings (indexed by `question_vector_index`)

Both use MongoDB Atlas Vector Search with BAAI/bge-large-en-v1.5 embeddings (1024 dimensions).

---

## Performance Summary

### Before Upgrade
- 5-7 LLM calls per turn
- ~20-30s per turn (gpt-oss for questions, Nova Lite for analysis)
- Generic questions regardless of job type
- No candidate adaptation

### After Upgrade
- 2 LLM calls per turn (combined analysis + question generation, both Nova Lite)
- ~4-5s per turn
- Job-aware persona with category-specific evaluation frameworks
- Candidate profile tracks style/expertise/gaps for adaptive prompting
- 4-mode question strategy (BRIDGE/PROBE/TRANSITION/VALIDATE) replaces LLM decision engine
- gpt-oss only used for greeting (streamed, one-time) and final report
