# Fix Greeting to be Role-Aware

## Context

Fixes 1-4 are already implemented and working (model upgrade to 70B, role-aware questions, role-aware focus areas, roleSpecifics keyword matching). The only remaining issue is the **greeting**.

The greeting for a "Growth Marketing Manager" TECHNICAL_SKILL interview says:
> "Hello! I'm excited to discuss your technical experience... hands-on technical skills, code architecture, problem-solving approach... system design and technical depth."

This happens because `buildGreetingPrompt()` (line 2529-2539) hardcodes dev-specific language for ALL `TECHNICAL_SKILL` interviews regardless of the actual role.

## Fix: Make `buildGreetingPrompt()` Role-Aware

### File: `Backend/services/intelligentInterview.service.js` — `buildGreetingPrompt()` (line 2529)

Replace the hardcoded TECHNICAL_SKILL block with role-aware version that reads focus areas from config:

```javascript
if (config.interviewType === 'TECHNICAL_SKILL') {
  const focusAreaNames = config.intelligenceContext?.focusAreas
    ?.map(a => a.skillName || a.area) || [];
  const focusDescription = focusAreaNames.length > 0
    ? focusAreaNames.join(', ')
    : 'domain-specific expertise';

  interviewFocus = `This is a SKILL ASSESSMENT interview for the role of "${config.context.targetRole}" at ${config.context.experienceLevel} level.

FOCUS:
- Assess practical expertise in: ${focusDescription}
- Probe for hands-on experience and real-world results
- Match the greeting to the role's domain (NOT generic software engineering unless the role IS a dev role)`;

  exampleGreeting = `"Hello! I'm excited to discuss your experience in ${focusDescription} as it relates to the ${config.context.targetRole} role. Today we'll be exploring your hands-on expertise, problem-solving approach, and practical experience at the ${config.context.experienceLevel} level. Let's dive in!"`;
}
```

This way:
- **Marketing role** → greeting mentions "marketing strategy, analytics, channels"
- **Dev role** → greeting mentions "technical depth, code architecture" (from dev-specific focus areas)
- **Sales role** → greeting mentions "sales process, relationship building"

### Verification

Start a "Growth Marketing Manager" interview → greeting should mention marketing-related skills, NOT code/architecture/system design.
