# Campaign Interview — Technical Flow

## Overview

Campaign interviews are AI-driven voice assessments embedded inside campaigns of type `AI_INTERVIEW` or `SKILL_TEST`. A candidate joins through a campaign link or their employee account, speaks their answers out loud (transcribed in real-time by AssemblyAI), and the backend LLM generates questions, evaluates answers, and stores a full report when the session ends.

The feature uses a dedicated Socket.IO namespace (`/campaign-interview`) separate from the standard HR post-interview namespace (`/interview`).

---

## Architecture at a Glance

```
Browser (Next.js)
  │
  ├── useInterviewSocket       — Socket.IO connection & event bus
  ├── useAudioTranscription    — Microphone → AssemblyAI → transcript
  ├── useCampaignInterviewConfig — Builds interview config from campaign object
  └── InterviewAssessment.tsx  — Orchestrates all hooks, owns UI state
          │
          │  Socket.IO  /campaign-interview
          │
Node.js backend
  ├── campaignInterview.controller.js  — Socket event handlers
  ├── campaignInterview.service.js     — Session logic, LLM calls
  │       │
  │       ├── Redis             — Active session storage (TTL-based)
  │       └── Bedrock (LLM)     — Greeting, next question, final report
  │
  └── internalCampaign.controller.js
          └── GET /:campaignId/results/:participantId  — Results polling
```

---

## 1. Frontend Entry Point

**File:** `src/components/features/campaign/assessment/InterviewAssessment.tsx`

The component receives four props:

| Prop | Type | Purpose |
|---|---|---|
| `campaign` | `Campaign` | Full campaign object including `module.config` |
| `campaignId` | `string` | MongoDB `_id` of the campaign |
| `participantId` | `string` | Employee `_id` or anonymous token |
| `onBack` | `() => void` | Navigate back if user declines GDPR |

On mount it:
1. Opens a Socket.IO connection to `/campaign-interview`
2. Requests camera + microphone access (GDPR consent modal gates this)
3. Waits for the user to click **Start** before emitting `start_interview`

Security monitoring (`useSecurityMonitoring`) is **disabled** for campaign interviews — it remains active only for post-interviews (`hr.tsx`).

---

## 2. Interview Configuration

**File:** `src/hooks/useCampaignInterviewConfig.ts`

The hook reads `campaign.module` and builds an `interviewConfig` object that is sent with `start_interview`:

```typescript
{
  interviewType: moduleType === 'SKILL_TEST' ? 'TECHNICAL_INTERVIEW' : 'HR_INTERVIEW',
  testReason: `Campaign assessment: ${campaign.title}`,
  context: {
    interviewGoal: campaign.module.config.agentPrompt || `Assess candidate for ${campaign.title}`,
  },
  models: {
    fastModel:     'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    thinkingModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    analysisModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  },
  sessionSettings: {
    duration:       campaign.module.config.durationMinutes ?? 30,  // minutes
    language:       campaign.module.config.language ?? 'en',
    difficulty:     campaign.module.config.difficulty ?? 'intermediate',
    silenceTimeout: 5,
    silenceIntelligence: {
      enabled: true,
      adaptiveThresholds: true,
      maxSilencePrompts: 3,
      naturalPauseDetection: true,
      contextAwareThresholds: true,
    },
  },
}
```

The `agentPrompt` field (set in the campaign's module configuration UI) becomes the LLM's behavioral instruction — it tells the AI interviewer what role to play and what topics to cover.

---

## 3. Socket.IO Events

**Namespace:** `/campaign-interview`

### Events emitted by the client

| Event | Payload | When |
|---|---|---|
| `start_interview` | `{ config, candidateId }` | User clicks Start |
| `candidate_response` | `{ sessionId, transcript, timestamp, isFinal, turnCount, speakingDuration, accumulated }` | AssemblyAI finalises a turn |
| `end_interview` | `{ sessionId }` | User clicks End or timer expires |

### Events received by the client

| Event | Payload | Meaning |
|---|---|---|
| `interview_started` | `{ sessionId, config: { duration, silenceIntelligence } }` | Session ready, timer starts |
| `interviewer_message` | `{ type, content, timestamp, sessionId, metadata? }` | AI greeting / question / follow-up / closing |
| `coverage_update` | `{ coverage, sessionId }` | Real-time topic coverage percentages |
| `silence_response` | `{ silenceCount, action, content? }` | Backend nudge after long silence |
| `voice_activity` | `{ isActive }` | VAD signal from backend |
| `interview_ended` | `{ sessionId, finalReport, analytics }` | Session complete, report ready |
| `interview_error` | `{ message }` | Recoverable error |

---

## 4. Audio Transcription

**File:** `src/hooks/useAudioTranscription.ts`

### Microphone setup
- Calls `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation, noiseSuppression, sampleRate: 16000, channelCount: 1 } })`
- Audio stream is also fed to a `<canvas>` waveform visualiser via `audioContextRef`

### AssemblyAI streaming (V3)
1. Frontend calls `POST /api/session` with `{ action: 'generate_token' }` to obtain a short-lived token
2. Creates a `RealtimeTranscriber` with end-of-turn detection configured per question type:

| Context | Silence threshold | Confidence | Max turn silence |
|---|---|---|---|
| Quick factual | 400 ms | 0.70 | — |
| Behavioural | 700 ms | 0.75 | 8 s |
| Technical | 900 ms | 0.85 | 10 s |

3. Each finalised utterance is a **turn**. Up to 10 consecutive turns are accumulated into one answer (the full answer for the question).

### Turn accumulation rules
- Accumulated text is sent when:
  - AssemblyAI fires `turn_end` and the silence since last speech exceeds the adaptive threshold
  - The candidate has been speaking for more than **180 seconds** (forced send)
  - The max turns (10) is reached
- After sending, accumulators reset and reading-time mode begins (10 s buffer so candidate can read the next question)

---

## 5. Backend — Socket Handler

**File:** `Backend/controllers/campaignInterview.controller.js`
**Namespace registration:** `app.js` line 177

### `start_interview`
1. Generates a UUID `sessionId`
2. Calls `service.startInterview(sessionId, config, candidateId, onGreetingChunk)`
3. Emits `greeting_chunk` events (streamed) then `greeting_complete`
4. Emits `interview_started` and an `interviewer_message` of type `greeting`

### `candidate_response`
1. Delegates to `service.processCandidateResponse(sessionId, transcript)`
2. Emits `coverage_update` if coverage changed
3. Based on the LLM decision:
   - `next_question` / `follow_up` → emits `interviewer_message`
   - `end_interview` → calls `service.endInterview()`, emits `interviewer_message` (closing), then after 1.5 s emits `interview_ended`
4. Always emits `response_processed`

### `end_interview`
1. Calls `service.endInterview(sessionId)` (same path as auto-end)
2. Emits `interview_ended` with final report

---

## 6. Question Generation

**File:** `Backend/services/campaignInterview.service.js`

Questions are generated **on demand** after each candidate answer — there is no pre-generated question bank. The LLM decides in real time what to ask next.

### Session data (stored in Redis)

```javascript
{
  sessionId, campaignId, moduleType,
  context: {
    type: 'AI_INTERVIEW' | 'SKILL_TEST',
    systemPrompt,          // Built from agentPrompt + interviewType
    skill?,                // SKILL_TEST only
    campaignTitle?,
  },
  conversation: [          // Full turn-by-turn history
    { type: 'agent' | 'candidate', content, timestamp, metadata? }
  ],
  coverage: {
    overall: 0,            // Weighted average 0–100
    areas: { ... }         // Per-area percentages + weights (see below)
  },
  questionsAsked: 0,
  maxQuestions: Math.max(5, Math.round(duration * 0.6)),
  config: { duration, interviewType },
  startedAt, candidateId,
}
```

### Coverage areas

**AI_INTERVIEW:**
| Area | Weight |
|---|---|
| experience | 30 % |
| competencies | 30 % |
| motivation | 20 % |
| situational | 20 % |

**SKILL_TEST:**
| Area | Weight |
|---|---|
| fundamentals | 30 % |
| practical_usage | 25 % |
| advanced_topics | 25 % |
| best_practices | 20 % |

### The `_combinedTurn` LLM call

After every candidate answer the service calls the LLM with:
- The system prompt (from `context.systemPrompt`)
- The last **4 turns** of conversation (to stay within context)
- Current coverage percentages per area
- A `shouldEnd` flag (`questionsAsked >= maxQuestions`)

The LLM must return JSON:

```json
{
  "decision": "next_question | follow_up | end_interview",
  "nextQuestion": "<question text or closing statement>",
  "coverageUpdates": [
    { "area": "<area_key>", "increase": 0–25 }
  ],
  "analysis": {
    "quality": "poor | fair | good | excellent",
    "score": 0–100,
    "completeness": "complete | partial | minimal | avoided",
    "keyPoints": ["..."]
  },
  "report": {
    "strengths": ["..."],
    "areasForImprovement": ["..."],
    "overallProgress": 0–100
  }
}
```

The coverage areas accumulate additively (`min(100, prev + increase)`) and the weighted overall score is recalculated after each update. The session is saved back to Redis.

### End condition
- Auto-end when `questionsAsked >= maxQuestions` (LLM is told to generate a closing statement)
- Manual end when user clicks the End button or the frontend timer fires `onTimeUp`

---

## 7. Final Report Generation

At end of interview the service calls the LLM a second time (temperature 0.3, full conversation history) and asks for a structured report:

```json
{
  "overallScore": 0–100,
  "summary": "2–3 sentence assessment",
  "strengths": ["..."],
  "areasForImprovement": ["..."],
  "recommendation": "hire | strong_hire | consider | reject",
  "coverageSummary": { "<area>": 0–100 },
  "communicationScore": 0–100,
  "confidenceScore": 0–100,
  "clarityScore": 0–100,
  "engagementScore": 0–100
}
```

If the LLM call fails, baseline scores are derived from the coverage percentages already collected.

---

## 8. Results — Database Storage

**File:** `Backend/services/campaignInterview.service.js` → `_persistResults()`

Two MongoDB documents are written when the interview ends:

### CampaignResponse (upserted)

**Model:** `Backend/models/campaignResponse.model.js`

```javascript
{
  campaign:    ObjectId,          // InternalCampaign._id
  participant: ObjectId,          // CampaignParticipant._id
  moduleType:  'AI_INTERVIEW' | 'SKILL_TEST',
  aiScore:     Number (0–100),    // finalReport.overallScore
  aiSummary:   String,            // finalReport.summary
  interviewTranscript: [
    { role: 'agent' | 'candidate', message: String, timestamp: Date }
  ],
  testResults: {
    score:     Number,
    maxScore:  100,
    breakdown: [{ area, label, score }]   // One entry per coverage area
  }
}
```

Index: `{ campaign: 1, moduleType: 1 }`

### CampaignParticipant (updated)

**Model:** `Backend/models/campaignParticipant.model.js`

Fields updated:

```javascript
{
  status:         'COMPLETED',
  completedAt:    new Date(),
  moduleProgress: {
    moduleType,
    status:      'COMPLETED',
    completedAt: new Date(),
    responseRef: ObjectId,   // → CampaignResponse._id
  }
}
```

The participant is looked up by `{ campaign: campaignId, employee: candidateId }` (or by `anonymousToken` / `linkAccessToken` for link-based access).

---

## 9. Post-Interview Redirect Flow

After receiving `interview_ended` the frontend begins polling:

```
dispatch(fetchParticipantResults({ campaignId, participantId }))
  every 2 seconds
  until participant.status === 'COMPLETED'
  → redirect to /employee/campaigns/{campaignId}/results
```

**Endpoint:** `GET /internal-campaigns/:campaignId/results/:participantId`
**File:** `Backend/controllers/internalCampaign.controller.js`

The endpoint supports four identifier types for `:participantId`:
- CampaignParticipant `_id`
- Employee User `_id`
- `anonymousToken`
- `linkAccessToken`

Response shape:

```json
{
  "success": true,
  "data": {
    "campaign":    { "_id", "title", "type", "module" },
    "participant": { "_id", "status", "completedAt", "score" },
    "response":    { "aiScore", "aiSummary", "interviewTranscript", "testResults", ... }
  }
}
```

---

## 10. Full Sequence

```
Browser                        Socket /campaign-interview        Service / DB
  │                                     │                             │
  ├─ connect ─────────────────────────> │                             │
  ├─ emit: start_interview ───────────> │ ──────────────────────────> │ create Redis session
  │                                     │                             │ LLM → greeting
  │ <── interview_started ─────────────│                             │
  │ <── interviewer_message (greeting)─│                             │
  │                                     │                             │
  │  [candidate speaks]                 │                             │
  │  AssemblyAI transcribes             │                             │
  │                                     │                             │
  ├─ emit: candidate_response ────────> │ ──────────────────────────> │ append to convo
  │                                     │                             │ LLM → next question
  │                                     │                             │ update coverage
  │ <── coverage_update ───────────────│                             │
  │ <── interviewer_message (question) ─│                             │
  │                                     │                             │
  │  [repeat for each question]         │                             │
  │                                     │                             │
  ├─ emit: end_interview ─────────────> │ ──────────────────────────> │ LLM → final report
  │    (or maxQuestions reached)        │                             │ CampaignResponse upsert
  │                                     │                             │ CampaignParticipant → COMPLETED
  │ <── interview_ended ───────────────│                             │
  │                                     │                             │
  ├─ [poll GET /results/:participantId] ─────────────────────────────> │
  │ <── { participant.status: 'COMPLETED' } ─────────────────────────│
  │                                     │                             │
  └─ redirect → /employee/campaigns/:id/results
```
