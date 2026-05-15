# Job Match Email — How & When It Sends

## Overview

When a company publishes a job post, TalentAI automatically finds all candidates whose skills match the post's requirements and sends each one a personalised **"New job match"** email.

---

## When Does It Trigger?

The email is fired in **two situations**, both inside `Backend/controllers/PostControllers/post.controller.js`:

### 1 — Post created directly as OPEN

```
POST /post/create
Body: { ..., status: "open" }
```

A company creates a post and publishes it immediately.  
After `createPostWithSideEffects()` resolves, the controller checks:

```js
if (post?.status === POST_STATUS.OPEN) {
  notifyMatchingCandidates(String(post._id)).catch(...)
}
```

---

### 2 — Post status changed to OPEN (publish later)

```
PATCH /post/:id/status
Body: { status: "open" }
```

A company created a draft and then publishes it.  
After `updatePostStatus()` resolves, the controller checks:

```js
if (status === POST_STATUS.OPEN) {
  notifyMatchingCandidates(req.params.id).catch(...)
}
```

> **Both calls are fire-and-forget** (`.catch()` only) — they do **not** block the HTTP response. The company gets their `200 OK` instantly; emails are sent in the background.

---

## What Happens Inside `notifyMatchingCandidates(postId)`

**File:** `Backend/services/jobMatch.service.js`

```
Step 1 — Load post
  Post.findById(postId) + populate("user", "email username")
  → Extract: jobTitle, companyName, experienceLevel, workMode
  → Extract: requiredSkills[] (lowercase names from skillAnalysis.requiredSkills)
  → If requiredSkills is empty → abort (nothing to match against)

Step 2 — Load all candidates
  Profile.find({ type: "Candidate" })
  → For each candidate, resolve email priority:
      profile.email  →  profile.contactInformation.email  →  profile.userId.email
  → Skip if no email found

Step 3 — Match skills (per candidate)
  candidateSkills = profile.skills[].name (lowercase)
  matched = candidateSkills ∩ requiredSkills   (case-insensitive intersection)
  → Skip if matched.length === 0

Step 4 — Compute match score
  matchScore = round((matched.length / requiredSkills.length) * 100)
  capped at 100

Step 5 — Send email
  sendJobMatchEmail(email, { candidateName, jobTitle, companyName,
                              experienceLevel, workMode, matchedSkills,
                              matchScore, jobLink })
  jobLink = FRONTEND_URL + /candidate/jobs/<postId>

Step 6 — Log result
  "📧 Job match emails sent: N candidate(s) notified for post '...'"
```

---

## Email Template

**File:** `Backend/templates/emails/job/job-match.hbs`

| Field shown in email | Source |
|---|---|
| Candidate name | `profile.firstName + profile.lastName` |
| Job title | `post.jobDetails.title` |
| Company name | `post.user.username` |
| Experience level | `post.jobDetails.experienceLevel` |
| Work mode | `post.jobDetails.workMode` |
| Matching skills | Intersection list (comma-separated) |
| Match score | `%` badge (green) |
| CTA link | `FRONTEND_URL/candidate/jobs/<postId>` |

**Subject line:**
```
🎯 New job match: <jobTitle> at <companyName>
```

---

## Matching Logic

```
A candidate receives the email if and only if:
  profile.type === "Candidate"
  AND at least 1 skill name in profile.skills[]
      matches (case-insensitive) a skill name
      in post.skillAnalysis.requiredSkills[]
```

No AI call is made — it is pure string intersection, zero cost.

---

## Environment Variables Required

| Variable | Purpose | Default |
|---|---|---|
| `FRONTEND_URL` | Base URL for the "View Job" CTA link | `http://localhost:3000` |
| `EMAIL_HOST` | SMTP host | — |
| `EMAIL_PORT` | SMTP port | `465` |
| `EMAIL_USER` | SMTP auth user | — |
| `EMAIL_PASSWORD` | SMTP auth password | — |
| `NO_REPLY_EMAIL` | From address shown to recipient | falls back to `EMAIL_USER` |

---

## Files Involved

```
Backend/
├── controllers/PostControllers/post.controller.js   ← trigger point (createPost + updatePostStatus)
├── services/jobMatch.service.js                     ← matching logic + loop
├── utils/email-service.js                           ← sendJobMatchEmail()
└── templates/emails/job/job-match.hbs               ← HTML email template
```

---

## Flow Diagram

```
Company publishes post
        │
        ▼
post.controller.js
  createPost()  ──── status === "open" ────┐
  updatePostStatus()  status === "open" ───┘
        │
        ▼  (non-blocking, background)
jobMatch.service.js → notifyMatchingCandidates(postId)
        │
        ├── Load post + required skills
        ├── Load all Candidate profiles
        └── For each candidate:
              skills ∩ requiredSkills ≥ 1?
                    │ YES
                    ▼
              email-service.js → sendJobMatchEmail()
                    │
                    ▼
              SMTP → Candidate inbox
```
