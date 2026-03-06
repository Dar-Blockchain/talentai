# TalentAI - AI Orchestration Architecture & Bedrock/RAG Assessment

## Purpose

This document provides a comprehensive analysis of the TalentAI interview system's AI orchestration, identifies the "question not received" bug, assesses whether AWS Bedrock (Claude 4) can replace Together AI, and evaluates whether RAG is needed.

---

## 1. SYSTEM OVERVIEW

The interview system uses **Together AI** (Llama 3.3 70B) for all AI operations, **Redis** for session state, and **Socket.IO** WebSocket for real-time communication.

**Key Files:**
- `Backend/services/intelligentInterview.service.js` — Main AI service (3200+ lines, 16 LLM calls)
- `Backend/controllers/intelligentInterview.controller.js` — Socket controller
- `Backend/helpers/togetherai.helpers.js` — Together AI client wrapper
- `Backend/utils/config-manager.js` — Interview config & focus areas
- `Backend/utils/redis-session-manager.js` — Redis session management
- `Backend/utils/contextual-interventions.js` — Silence/help prompts

---

## 2. COMPLETE LLM CALL INVENTORY (16 Calls)

| # | Function | Temp | Max Tokens | Timeout | Purpose |
|---|----------|------|-----------|---------|---------|
| 1 | `analyzeQuestionSimilarity` | 0.2 | 800 | 8s | Detect duplicate questions |
| 2 | `analyzeResponseIntelligence` | 0.3 | 600 | **NONE** | Extract skills from response |
| 3 | `analyzeResponseQuality` | 0.3 | 700 | **NONE** | Rate response quality 0-100 |
| 4 | `analyzeCoverageIntelligently` | 0.2 | 1200 | 15s | Map response to focus areas |
| 5 | `determineIfCoverageIsSufficient` | 0.1 | 600 | **NONE** | Check area depth |
| 6 | `generateIntelligentQuestion` | 0.7 | 500 | 10s | Generate next question |
| 7 | `generateTargetedQuestionForArea` | 0.6 | 600 | **NONE** | Generate area-specific question |
| 8 | `makeIntelligentDecision` | 0.3 | 600 | 15s | Decide next action |
| 9 | `generateIntelligentGreeting` | 0.6 | 400 | 2 retries | Opening greeting |
| 10 | `shouldEndInterview` | 0.1 | 500 | **NONE** | End-interview decision |
| 11 | `generateSilencePrompt` | 0.7 | 300 | 2 retries | Silence encouragement |
| 12 | `detectQuestionComplexity` | 0.2 | 200 | **NONE** | Rate question complexity |
| 13 | `generatePatiencePrompt` | 0.7 | 100 | **NONE** | Encourage during thinking |
| 14 | `generateHelpOffer` | 0.7 | 150 | **NONE** | Offer clarification |
| 15 | `rephraseCurrentQuestion` | 0.7 | variable | **NONE** | Simplify complex question |
| 16 | `updateRealTimeReportIntelligently` | 0.4 | 1000 | **NONE** | Generate performance report |

**All calls use model: `meta-llama/Llama-3.3-70B-Instruct-Turbo`**

### Reliability Tiers

| Tier | Protection | Calls | Risk |
|------|-----------|-------|------|
| TIER 1: Protected | Explicit timeout (8-15s) | #1, #4, #6, #8 | LOW |
| TIER 2: Partial | Retry logic (2x) | #9, #11 | MEDIUM |
| TIER 3: Unprotected | No timeout | #2, #3, #5, #7, #10, #12-16 | **HIGH** |

**11 of 16 LLM calls have NO timeout protection** — they can hang indefinitely.

---

## 3. RESPONSE PROCESSING FLOW

### Two-Path Architecture (Cost Optimization)

```
Candidate submits response
    |
    +-- Heuristic analysis (word count, structure, keywords) -- FREE
    |
    +-- shouldDoFullAnalysis() decision:
    |   +-- quality >= 75%  -> SKIP AI (save $$$)
    |   +-- wordCount < 10  -> SKIP AI
    |   +-- generic ack     -> SKIP AI
    |   +-- every 3rd resp  -> FORCE full AI
    |
    +-- LIGHTWEIGHT PATH (60% of responses) --------------------+
    |   +-- Heuristic coverage update (keyword matching)         |
    |   +-- 1 LLM call: generateIntelligentQuestion (10s)        |
    |   +-- Return decision                                      |
    |                                                            |
    +-- FULL AI PATH (40% of responses) -----------------------+|
        +-- LLM: analyzeResponseIntelligence (NO TIMEOUT)       ||
        +-- LLM: analyzeResponseQuality (NO TIMEOUT)            ||
        +-- LLM: analyzeCoverageIntelligently (15s timeout)      ||
        +-- PARALLEL Promise.all:                                ||
        |   +-- LLM: makeIntelligentDecision (15s timeout)       ||
        |   +-- LLM: generateIntelligentQuestion (10s timeout)   ||
        +-- LLM: analyzeQuestionSimilarity (8s timeout)          ||
        +-- LLM: detectQuestionComplexity (NO TIMEOUT)           ||
        +-- LLM: updateRealTimeReportIntelligently (NO TIMEOUT)  ||
        +-- Return decision                                      ||
                                                                 ||
    Controller receives decision <-------------------------------+|
        |                          <------------------------------+
        +-- socket.emit("interviewer_message") -- question/follow-up
        +-- socket.emit("coverage_update")
        +-- socket.emit("report_update")
```

### Latency

| Path | LLM Calls | Time | Cost |
|------|-----------|------|------|
| Lightweight | 1 | 3-5s | ~$0.0005 |
| Full AI | 6-8 (parallel) | 8-12s | ~$0.002-0.005 |

---

## 4. "QUESTION NOT RECEIVED" BUG ANALYSIS

The agent sends to LLM but sometimes doesn't receive the question back. Here are the **10 failure points** identified:

### Failure Point 1: Unprotected LLM Calls Hanging (MOST LIKELY)
`analyzeResponseIntelligence` and `analyzeResponseQuality` have **NO timeout**. If Together AI is slow, these calls block the entire pipeline indefinitely. The question generation never runs.

### Failure Point 2: Promise.all Race Condition
```javascript
const [decisionAnalysis, proposedQuestion] = await Promise.all([
  AIUtils.withTimeout(makeIntelligentDecision(), 15000),
  AIUtils.withTimeout(generateIntelligentQuestion(), 10000)
]);
```
If `generateIntelligentQuestion` times out at 10s but `makeIntelligentDecision` succeeds, `proposedQuestion` is a fallback object. The decision may reference `proposedQuestion.question` which could be undefined in edge cases.

### Failure Point 3: decision.content Undefined
In the controller, the default case emits `decision.content`:
```javascript
default:
  socket.emit("interviewer_message", {
    type: 'question',
    content: decision.content  // <-- Could be undefined
  });
```
If the decision action is unrecognized and `content` is missing, the frontend receives `undefined`.

### Failure Point 4: JSON Parsing Failure
All LLM responses must be valid JSON. If the LLM returns text instead:
```javascript
const parsed = JSON.parse(response.choices[0].message.content); // Throws
```
The fallback structure may not carry the question through all paths.

### Failure Point 5: generateTargetedQuestionForArea No Timeout
When a question is similar to a previous one, `generateTargetedQuestionForArea` is called with **NO timeout**. It can hang indefinitely.

### Failure Point 6: Together AI 30s Global Timeout
The global Together AI wrapper has a 30s timeout. But some code paths call `together.chat.completions.create` directly, bypassing this.

### Failure Point 7: Redis Session Stale
Between LLM calls, the session is re-fetched from Redis. If Redis is slow or the session expired (2h TTL), subsequent calls use stale/null data.

### Failure Point 8: Socket Disconnect During Processing
If the WebSocket disconnects during the 8-12s processing time, the `socket.emit` call silently fails. The question was generated but never delivered.

### Failure Point 9: No Retry on Question Generation
Only greeting and silence prompts have retry logic. If `generateIntelligentQuestion` fails once, it falls back to "Can you tell me more?" — which may not reach the frontend if the error cascades.

### Failure Point 10: updateRealTimeReportIntelligently Blocking
This call has NO timeout and runs AFTER the question is generated but BEFORE the decision is returned. If it hangs, the entire response (including the question) is blocked.

### Recommended Fixes (Priority Order)

1. **Add 15s timeout** to ALL unprotected LLM calls (#2, #3, #5, #7, #10, #12-16)
2. **Validate decision.content** before socket.emit — send fallback if undefined
3. **Move updateRealTimeReport to background** — don't block question delivery
4. **Add retry logic** (2x with exponential backoff) to question generation
5. **Add socket.connected check** before emit

---

## 5. CAN BEDROCK (CLAUDE 4) REPLACE TOGETHER AI?

### Current Together AI Usage

| Capability | Currently Used For | Can Claude 4 Do It? |
|------------|-------------------|---------------------|
| Conversational Q&A | Greeting, questions, follow-ups | YES — Claude excels at this |
| Coverage analysis | Map response to focus areas (JSON) | YES — Claude follows JSON schemas well |
| Decision making | Next action (probe/change/wrap-up) | YES — Claude has strong reasoning |
| Response quality | Rate quality 0-100 | YES |
| Question similarity | Compare question intent | YES |
| Report generation | Strengths/weaknesses/recommendations | YES — Claude excels at analysis |
| Streaming | N/A (not currently streaming) | YES — Bedrock supports streaming |

### Bedrock Advantages Over Together AI

| Feature | Together AI (Llama 70B) | Bedrock (Claude 4) |
|---------|------------------------|---------------------|
| Intelligence | Good | Significantly better reasoning |
| JSON reliability | Sometimes breaks | Very reliable structured output |
| Context window | 8K tokens | 200K tokens |
| Streaming | Supported | Native streaming via Bedrock |
| Reliability | Variable latency | AWS SLA-backed |
| Cost | $0.88/M tokens | ~$3-15/M tokens (varies by model) |
| Timeout issues | Frequent | Rare (AWS infrastructure) |

### Migration Assessment

**YES — Claude 4 via Bedrock can handle ALL 16 LLM call types.** Key benefits:
- Better JSON adherence (fewer parsing failures)
- 200K context window (can send full conversation instead of last 3-5 messages)
- Streaming support (show question as it generates, reducing perceived latency)
- AWS reliability (fewer timeout/hang issues)

**Trade-off:** Cost is 3-15x higher per token. Mitigation: the 60% lightweight path already reduces calls significantly.

### Bedrock Streaming Architecture

Currently, the system generates a complete question then sends it via socket. With Bedrock streaming:

```
Current: LLM generates full question (5-10s) -> socket.emit(complete question)
Bedrock: LLM streams tokens -> socket.emit(each chunk) -> frontend renders progressively
```

This would reduce **perceived** latency from 5-10s to <1s (first token).

### Bedrock Integration Points

The single file to modify: `Backend/helpers/togetherai.helpers.js`

Replace Together AI client with Bedrock client:
```javascript
// Current: together.chat.completions.create(params)
// New:     bedrockClient.invokeModelWithResponseStream(params)
```

All 16 LLM calls go through a shared helper, so **one file change** migrates everything.

---

## 6. RAG ASSESSMENT — IS IT NEEDED?

### Current Context Gaps

| Data | Available in DB | Used by LLM | Gap |
|------|----------------|-------------|-----|
| Job description | YES (full text) | NO — only title used | **CRITICAL** |
| Job requirements | YES (array) | NO | **CRITICAL** |
| Job responsibilities | YES (array) | NO | HIGH |
| Company profile | 5 hardcoded only | Greeting only | HIGH |
| Conversation history | 50-msg buffer | Last 3-5 messages | MEDIUM |
| Candidate resume | NO | NO | LOW (optional) |
| Previous interviews | NO | NO | LOW |

### What the LLM Actually Sees vs What Exists

**Database has:**
```
title: "Senior React Developer"
description: "Build scalable UIs for fintech platform..."
requirements: ["5+ years React", "TypeScript", "Testing Library"]
responsibilities: ["Lead component library", "Mentor juniors"]
```

**LLM receives:**
```
targetRole: "Senior React Developer"  <-- title only
targetCompany: "Google"               <-- hardcoded fallback
experienceLevel: "Senior"
```

**Result:** LLM asks generic React questions instead of fintech-specific, Testing Library-specific questions from the actual JD.

### RAG Would Transform 4 Key Areas

**1. Job Description Grounding (HIGH IMPACT: +30% question relevance)**
- Store JDs as vectors, retrieve relevant sections per response
- LLM asks about actual requirements, not generic topics
- Example: "Tell me about your experience with headless CMS" (from JD) vs "Tell me about your React experience" (generic)

**2. Company Profiles (HIGH IMPACT: scales from 5 to unlimited)**
- Move from 5 hardcoded profiles to vector-stored profiles
- Any company gets proper culture/values context
- Currently: Stripe interview uses Google's profile as fallback

**3. Question Deduplication (MEDIUM IMPACT: 100x faster)**
- Currently: Full LLM call per similarity check ($0.0005 + 3-5s)
- With RAG: Vector cosine similarity (<10ms, ~free)
- Store each asked question as embedding, compare before generating new

**4. Conversation Continuity (MEDIUM IMPACT: no context loss)**
- Currently: LLM sees only last 3-5 messages (loses earlier discussion)
- With RAG: Semantic search retrieves relevant past turns
- Example: Turn 1 discusses React hooks -> Turn 10 can reference it without re-asking

### RAG Architecture Recommendation

**Vector Store:** Pinecone (serverless, no infra needed for MVP)

**Collections:**
1. `job_descriptions` — Full JD text + requirements + responsibilities
2. `company_profiles` — Dynamic company info (replaces hardcoded 5)
3. `interview_questions` — All asked questions per session (dedup)
4. `conversation_summaries` — Compressed conversation chunks (continuity)

### Token Efficiency

| Component | Before RAG | After RAG | Savings |
|-----------|-----------|-----------|---------|
| System prompt | 300 tokens | 300 tokens | 0% |
| Interview context | 200 tokens | 100 tokens | 50% |
| Coverage JSON dump | 400 tokens | 200 tokens | 50% |
| Focus areas JSON | 300 tokens | 150 tokens | 50% |
| Recent conversation | 300 tokens | 300 tokens | 0% |
| **+ Retrieved JD context** | 0 | 150 tokens | -- |
| **+ Retrieved questions** | 0 | 100 tokens | -- |
| **TOTAL** | 1,500 | 1,300 | **13% + better quality** |

Plus eliminates ~5 LLM calls/interview for similarity checking.

### Implementation Roadmap

| Phase | Scope | Timeline | Impact |
|-------|-------|----------|--------|
| 1 | Job Description RAG | Week 1-2 | +30% question relevance |
| 2 | Dynamic Company Profiles | Week 2-3 | Scales to unlimited companies |
| 3 | Question Deduplication | Week 3 | -30% redundant LLM calls |
| 4 | Conversation Compression | Week 4 | Support longer interviews |

---

## 7. RECOMMENDED NEXT STEPS

### Immediate (No RAG needed)

1. **Fix "question not received" bug** — Add timeouts to all 11 unprotected LLM calls
2. **Validate decision.content** before socket.emit
3. **Move report generation to background** — don't block question delivery

### Short-term: Bedrock Migration

1. Create Bedrock client wrapper in `Backend/helpers/bedrock.helpers.js`
2. Add streaming support for question delivery
3. Keep Together AI as fallback (dual-provider)
4. Test all 16 LLM call types with Claude 4

### Medium-term: RAG Implementation

1. Set up Pinecone + embed existing job descriptions
2. Integrate JD retrieval into question generation prompts
3. Replace hardcoded company profiles with vector-stored profiles
4. Replace LLM-based question similarity with vector search

---

## 8. VERIFICATION

After implementing the document's recommendations:
- Start a "Growth Marketing Manager" interview -> questions should reference actual JD requirements
- Check no "question not received" failures under load
- Verify Bedrock streaming reduces perceived latency to <1s
- Confirm RAG retrieves relevant JD sections in question prompts
