/**
 * Intelligent Interview Service
 * Core AI engine for adaptive interview management
 */

const bedrock = require("../helpers/bedrock.helpers");
const ragService = require("./rag.service");
const configManager = require("../utils/config-manager");
const { detectJobCategory, getEvaluationFramework } = require("../utils/config-manager");
const redisSessionManager = require("../utils/redis-session-manager");
const Post = require("../models/Post.model");
require('dotenv').config();

/**
 * Shared AI utilities for JSON parsing and error handling
 */
class AIUtils {
  /**
   * Robust JSON parsing with fallback handling
   */
  static parseJSONResponse(responseContent, methodName) {
    try {
      // Pre-strip markdown code fences if present (Nova Lite often wraps JSON in ```json```)
      let cleaned = responseContent;
      if (cleaned.trimStart().startsWith('```')) {
        const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fenceMatch) cleaned = fenceMatch[1];
      }
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn(`⚠️ JSON parse failed in ${methodName}, trying fallback extraction`);

      try {
        // Extract JSON that might have text before/after
        const jsonStart = responseContent.indexOf('{');
        const jsonEnd = responseContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonSubstring = responseContent.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonSubstring);
        }

        // Return fallback structure based on method
        return AIUtils.getFallbackResponse(methodName, responseContent);
      } catch (fallbackError) {
        // Try truncation repair: LLM output may be cut off mid-JSON
        try {
          const jsonStart = responseContent.indexOf('{');
          if (jsonStart !== -1) {
            let truncated = responseContent.substring(jsonStart);
            // Remove any trailing incomplete string value (cut off mid-quote)
            truncated = truncated.replace(/,?\s*"[^"]*$/, '');
            // Count unmatched brackets and close them
            let openBraces = 0, openBrackets = 0;
            let inString = false;
            for (let i = 0; i < truncated.length; i++) {
              const ch = truncated[i];
              if (ch === '"' && (i === 0 || truncated[i-1] !== '\\')) inString = !inString;
              if (!inString) {
                if (ch === '{') openBraces++;
                else if (ch === '}') openBraces--;
                else if (ch === '[') openBrackets++;
                else if (ch === ']') openBrackets--;
              }
            }
            // Remove trailing comma before closing
            truncated = truncated.replace(/,\s*$/, '');
            const closing = ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces));
            if (closing.length > 0) {
              const repaired = truncated + closing;
              console.warn(`🔧 [${methodName}] Attempting truncation repair (added ${closing.length} closing brackets)`);
              return JSON.parse(repaired);
            }
          }
        } catch (repairError) {
          // Repair also failed — fall through to fallback
        }
        console.error(`Fallback parsing also failed in ${methodName}:`, fallbackError.message);
        return AIUtils.getFallbackResponse(methodName, responseContent);
      }
    }
  }

  /**
   * Get fallback response structure when JSON parsing fails
   */
  static getFallbackResponse(methodName, originalContent) {
    const fallbacks = {
      'analyzeResponseIntelligence': {
        skillsInferred: ['Communication'],
        competenciesShown: ['Basic response'],
        topicsDiscussed: ['General discussion'],
        depthLevel: 'moderate',
        communicationQuality: 'fair',
        keyInsights: ['Response provided but analysis failed'],
        fallback: true,
        originalContent: originalContent.substring(0, 100) + '...'
      },
      'analyzeQuestionSimilarity': {
        isSimilar: false,
        confidence: 0,
        reasoning: 'Analysis failed, assuming different',
        similarQuestions: [],
        recommendations: 'Manual review needed',
        fallback: true
      },
      'analyzeCoverageIntelligently': {
        coverageUpdates: {},
        overallAssessment: {
          totalCoverage: 0,
          strongestAreas: [],
          weakestAreas: [],
          recommendedFocus: []
        },
        fallback: true,
        originalContent: originalContent.substring(0, 100) + '...'
      },
      'generateIntelligentQuestion': {
        question: "Can you tell me more about your experience?",
        targetAreas: ["General"],
        reasoning: "Fallback question due to generation failure",
        expectedOutcomes: ["Basic response"],
        followUpStrategy: "Continue conversation",
        fallback: true
      },
      'makeIntelligentDecision': {
        decision: "continue_probing",
        reasoning: "Default decision due to analysis failure",
        targetArea: "General",
        strategy: "Ask follow-up question",
        confidence: 50,
        expectedDuration: "2-3 minutes",
        fallback: true
      },
      'updateRealTimeReport': {
        strengths: ["Communication attempted"],
        weaknesses: ["Analysis unavailable"],
        recommendations: ["Continue interview for better assessment"],
        scores: { communication: 60, overall: 60 },
        overallProgress: 50,
        aiInsights: ["Report generation failed, using fallback"],
        trends: ["Unable to analyze trends"],
        fallback: true
      },
      'combinedAnalysis': {
        quality: { score: 50, answeredQuestion: true, depthLevel: "moderate", isOffTopic: false, completeness: "partial" },
        skills: { demonstrated: [], hinted: [], gaps: [] },
        coverage: { areasImpacted: [] },
        style: { verbosity: "detailed", confidence: "moderate", usesExamples: false },
        interestingTopics: [],
        shouldEnd: { shouldEnd: false, reason: "" },
        fallback: true
      },
      'buildAgentPersona': {
        mustHaveSkills: [],
        niceToHaveSkills: [],
        keyBehaviors: [],
        redFlags: [],
        seniorityExpectations: "Standard expectations",
        domainSpecificTopics: [],
        agentTone: "professional and conversational",
        fallback: true
      }
    };

    return fallbacks[methodName] || { error: 'Parsing failed', fallback: true };
  }

  /**
   * Wrap a promise with a timeout. Rejects if the promise doesn't resolve within timeoutMs.
   */
  static withTimeout(promise, timeoutMs, label = 'AI call') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }
}

/**
 * Memory AI - Manages conversation memory and semantic deduplication
 */
class MemoryAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async analyzeQuestionSimilarity(newQuestion, sessionHistory, sessionId) {
    try {
      // Use RAG vector search instead of LLM call (100x faster, near-free)
      const result = await ragService.findSimilarQuestions(sessionId, newQuestion);
      return {
        isSimilar: result.isSimilar,
        confidence: result.isSimilar ? Math.round(result.score * 100) : 0,
        reasoning: result.isSimilar
          ? `Similar to: "${result.similarQuestion}" (score: ${result.score.toFixed(2)})`
          : "No similar questions found via vector search",
        similarQuestions: result.isSimilar ? [{ question: result.similarQuestion, similarity: result.score }] : [],
        recommendations: result.isSimilar ? "Generate alternative question for same area" : "Question is unique"
      };
    } catch (error) {
      console.error('Error in analyzeQuestionSimilarity:', error);
      return { isSimilar: false, confidence: 0, reasoning: "Analysis failed", error: error.message };
    }
  }

  async storeConversationWithIntelligence(sessionId, entry) {
    try {
      // Add AI analysis to the entry
      if (entry.type === 'candidate' && entry.content) {
        entry.aiAnalysis = await this.analyzeResponseIntelligence(entry.content);
      }

      return await this.sessionManager.addConversationEntry(sessionId, entry);
    } catch (error) {
      console.error('Error storing conversation with intelligence:', error);
      throw error;
    }
  }

  async analyzeResponseIntelligence(candidateResponse) {
    try {
      const systemPrompt = `Analyze this interview response for intelligence insights that will help with coverage analysis.

EXTRACT:
- Skills/knowledge demonstrated
- Competencies evidenced
- Topics discussed
- Depth of understanding shown
- Communication quality

RESPONSE FORMAT (JSON only):
{
  "skillsInferred": ["specific skills demonstrated"],
  "competenciesShown": ["competencies evidenced"],
  "topicsDiscussed": ["main topics covered"],
  "depthLevel": "shallow|moderate|deep|expert",
  "communicationQuality": "poor|fair|good|excellent",
  "keyInsights": ["important insights about candidate"]
}`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Analyze: "${candidateResponse}"` }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(aiResponse.content, 'analyzeResponseIntelligence');
    } catch (error) {
      console.error('Error analyzing response intelligence:', error);
      return { error: error.message };
    }
  }

  /**
   * Analyze if candidate's response adequately answered the interviewer's question
   */
  async analyzeResponseQuality(question, response, targetArea) {
    try {
      const systemPrompt = `You are an expert interview evaluator analyzing if a candidate's response adequately addresses the interviewer's question.

EVALUATION CRITERIA:
- Does the response relate to the question topic?
- Does it provide examples/details specifically asked for?
- Is the response vague, unclear, or evasive?
- Did the candidate dodge or avoid answering directly?
- Is there missing information that should be clarified?

RESPONSE FORMAT (JSON only):
{
  "answeredQuestion": boolean,
  "qualityScore": number (0-100),
  "completeness": "complete|partial|minimal|avoided",
  "missingElements": ["specific elements not addressed"],
  "clarificationNeeded": boolean,
  "suggestedFollowUp": "clarifying question if needed (or null)",
  "reasoning": "detailed explanation of evaluation"
}`;

      const userPrompt = `INTERVIEWER QUESTION: "${question}"

CANDIDATE RESPONSE: "${response}"

TARGET AREA: ${targetArea || 'General'}

Evaluate if the response adequately answered the question. If clarification is needed, suggest a specific follow-up question.`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.3,
        maxTokens: 700,
        timeout: 30000,
        useFastModel: true
      });

      const result = AIUtils.parseJSONResponse(aiResponse.content, 'analyzeResponseQuality');

      console.log(`🔍 [Response Quality] ${result.answeredQuestion ? '✅ Answered' : '❌ Not Answered'} - Score: ${result.qualityScore}/100`);

      return result;
    } catch (error) {
      console.error('Error analyzing response quality:', error);
      return {
        answeredQuestion: true, // Default to true on error to not block flow
        qualityScore: 50,
        completeness: 'unknown',
        missingElements: [],
        clarificationNeeded: false,
        suggestedFollowUp: null,
        reasoning: 'Analysis failed: ' + error.message,
        error: error.message
      };
    }
  }
}

/**
 * Coverage Analysis AI - Intelligent topic coverage evaluation
 */
class CoverageAnalysisAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async analyzeCoverageIntelligently(candidateResponse, currentCoverage, focusAreas, sessionHistory) {
    try {
      const systemPrompt = `You are an expert interview coverage analyst. Analyze candidate responses to determine coverage of competency areas.

INTELLIGENCE REQUIREMENTS:
- Infer coverage even when keywords aren't explicitly mentioned
- Recognize implicit demonstrations of skills/knowledge
- Evaluate depth and quality of evidence
- Consider progressive coverage building
- Account for different communication styles

RESPONSE FORMAT (JSON only):
{
  "coverageUpdates": {
    "areaName": {
      "percentageIncrease": number,
      "evidence": ["specific evidence from response"],
      "qualityScore": number,
      "indicators": ["which indicators were addressed"],
      "reasoning": "why this coverage was detected"
    }
  },
  "overallAssessment": {
    "totalCoverage": number,
    "strongestAreas": ["areas"],
    "weakestAreas": ["areas"],
    "recommendedFocus": ["areas needing attention"]
  }
}`;

      const contextHistory = sessionHistory.slice(-20).map(entry =>
        `${entry.type}: ${entry.content}`
      ).join('\n');

      const userPrompt = `CANDIDATE RESPONSE: "${candidateResponse}"

CURRENT COVERAGE STATE:
${JSON.stringify(currentCoverage, null, 2)}

FOCUS AREAS TO EVALUATE:
${JSON.stringify(focusAreas, null, 2)}

RECENT CONVERSATION CONTEXT:
${contextHistory}

Analyze this response intelligently for coverage of focus areas. Look for implicit evidence and progressive skill demonstration.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.2,
        maxTokens: 1200,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'analyzeCoverageIntelligently');
    } catch (error) {
      console.error('Error in intelligent coverage analysis:', error);
      throw error;
    }
  }

  async determineIfCoverageIsSufficient(areaName, currentCoverage, sessionHistory, targetRole) {
    try {
      const systemPrompt = `You are an expert interviewer determining if a competency area has been sufficiently covered.

EVALUATION CRITERIA:
- Coverage percentage and quality
- Depth of evidence provided
- Consistency across multiple responses
- Relevance to target role requirements
- Progressive demonstration of competency

RESPONSE FORMAT (JSON only):
{
  "isSufficient": boolean,
  "confidence": number,
  "reasoning": "detailed explanation",
  "evidenceStrength": "weak|moderate|strong|excellent",
  "recommendations": "what else might be needed",
  "stopExploring": boolean
}`;

      const areaData = currentCoverage.areas[areaName] || {};
      const areaHistory = sessionHistory.filter(entry =>
        entry.aiAnalysis?.topicsDiscussed?.includes(areaName) ||
        entry.content.toLowerCase().includes(areaName.toLowerCase())
      );

      const userPrompt = `COMPETENCY AREA: ${areaName}
TARGET ROLE: ${targetRole}

CURRENT COVERAGE DATA:
${JSON.stringify(areaData, null, 2)}

RELATED CONVERSATION HISTORY:
${areaHistory.map(entry => `${entry.type}: ${entry.content}`).join('\n')}

Determine if this competency area has been sufficiently explored for the target role.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'determineIfCoverageIsSufficient');
    } catch (error) {
      console.error('Error determining coverage sufficiency:', error);
      return { isSufficient: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }
}

/**
 * Question Generator AI - Creates intelligent, targeted questions
 */
class QuestionGeneratorAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async generateIntelligentQuestion(session, coverageAnalysis, memoryAnalysis, questionStrategy = null, questionStyle = null) {
    try {
      const persona = session.agentPersona || {};
      const candidateProfile = session.candidateProfile || {};

      // Build persona context for the prompt
      let personaBlock = '';
      if (persona.job) {
        personaBlock = `
=== AGENT PERSONA ===
Role: ${persona.job.title} at ${persona.job.company}
Category: ${persona.jobCategory} | Interview: ${persona.interviewType}
Must-Have Skills: ${persona.idealCandidate?.mustHaveSkills?.join(", ") || "N/A"}
Nice-to-Have: ${persona.idealCandidate?.niceToHaveSkills?.join(", ") || "N/A"}
Red Flags: ${persona.idealCandidate?.redFlags?.join(", ") || "N/A"}
Tone: ${persona.agentBehavior?.tone || "professional"}
Domain Topics: ${persona.agentBehavior?.domainTopics?.join(", ") || "N/A"}
Experience Level: ${persona.job.experienceLevel || "mid"}
Seniority Expectations: ${persona.idealCandidate?.seniorityExpectations || "N/A"}

=== JOB REQUIREMENTS (questions MUST align with these) ===
${(persona.job.requirements || []).slice(0, 10).join("\n") || "N/A"}

=== JOB RESPONSIBILITIES ===
${(persona.job.responsibilities || []).slice(0, 10).join("\n") || "N/A"}`;
      }

      // Build candidate profile context
      let profileBlock = '';
      if (candidateProfile.responseQualities?.length > 0) {
        profileBlock = `
=== CANDIDATE PROFILE ===
Style: ${candidateProfile.communicationStyle?.verbosity || "unknown"} speaker, ${candidateProfile.communicationStyle?.confidenceLevel || "unknown"} confidence
Uses Examples: ${candidateProfile.communicationStyle?.usesExamples ? "yes" : "not yet"}
Expertise Shown: ${candidateProfile.revealedExpertise?.slice(-5).join(", ") || "none yet"}
Gaps Identified: ${candidateProfile.revealedGaps?.slice(-3).join(", ") || "none yet"}
Current Difficulty: ${candidateProfile.currentDifficulty || "intermediate"}`;
      }

      // Build strategy context
      let strategyBlock = '';
      if (questionStrategy) {
        const modeInstructions = {
          bridge: `BRIDGE MODE: The candidate just mentioned "${questionStrategy.context}". Naturally bridge from that topic to explore ${questionStrategy.targetArea}. Use what they said as a springboard.`,
          probe: `PROBE MODE: ${questionStrategy.context}. Ask for a specific, concrete example or deeper technical detail about ${questionStrategy.targetArea}.`,
          transition: `TRANSITION MODE: ${questionStrategy.context}. Smoothly transition to ${questionStrategy.targetArea} — connect it to something already discussed if possible.`,
          validate: `VALIDATE MODE: ${questionStrategy.context}. Ask a quick validation question for ${questionStrategy.targetArea} to confirm the candidate's strength.`,
        };
        strategyBlock = `\n=== QUESTION STRATEGY ===\n${modeInstructions[questionStrategy.mode] || `Target: ${questionStrategy.targetArea}`}`;
      }

      // ENFORCE INTERVIEW TYPE SPECIFIC QUESTION GUIDELINES
      const experienceLevel = session.agentPersona?.job?.experienceLevel || session.config.context?.experienceLevel || 'mid';
      let questionGuidelines = '';
      if (session.config.interviewType === 'TECHNICAL_SKILL') {
        const focusAreaNames = Object.keys(session.coverage?.areas || {});
        questionGuidelines = `
TECHNICAL SKILL interview for "${session.config.context.targetRole}".
Focus areas: ${focusAreaNames.join(', ')}
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'HR_INTERVIEW') {
        questionGuidelines = `HR/BEHAVIORAL interview — focus on soft skills, teamwork, cultural fit.
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'SOFT_SKILL') {
        questionGuidelines = `SOFT SKILLS interview — focus on communication, EQ, collaboration.
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      }

      // Adapt style based on candidate profile
      let styleInstruction = '';
      if (candidateProfile.communicationStyle?.verbosity === 'concise') {
        styleInstruction = 'Candidate is concise — ask open-ended questions that invite elaboration.';
      } else if (candidateProfile.communicationStyle?.verbosity === 'rambling') {
        styleInstruction = 'Candidate tends to ramble — ask focused, specific questions.';
      }

      // Build question style block
      let questionStyleBlock = '';
      if (questionStyle && questionStyle.instruction) {
        questionStyleBlock = `
=== QUESTION STYLE ===
${questionStyle.instruction}
IMPORTANT: Follow this style while respecting the strategy mode above. The style dictates HOW to phrase the question; the strategy dictates WHAT area to target.`;
      }

      const systemPrompt = `You are an expert interviewer. Generate ONE targeted question.
${personaBlock}
${profileBlock}
${strategyBlock}

${questionGuidelines}
${styleInstruction}
${questionStyleBlock}

RULES:
- ONE clear question, 1-2 sentences, max 40 words
- No preambles ("That's great...", "Interesting...")
- No multi-part questions
- Target the specified coverage gap
- Be natural and conversational
- NEVER ask the candidate to write, read, or review actual code snippets. This is a verbal interview — all questions must be conversational.
- Questions MUST be directly relevant to the JOB REQUIREMENTS and RESPONSIBILITIES listed above. Do NOT ask about technologies, tools, or concepts not mentioned in the JD.
- PRIORITIZE asking about skills from the "JD SKILLS NOT YET ASKED ABOUT" list. Each question should target a DIFFERENT uncovered skill.
- NEVER ask a question similar to any in the "ALREADY ASKED" list
- Each question must explore a NEW angle or sub-topic not yet covered
- Within the same focus area, each question MUST explore a DIFFERENT sub-topic. If you already asked about middleware, ask about database design, caching, API design, or another sub-topic next. Check the "TOPICS ALREADY EXPLORED" list below.
- CALIBRATE question difficulty to the EXPERIENCE LEVEL above:
  * Junior/Entry: Basic concepts, "how would you" questions, guided scenarios, no system design
  * Mid-Level: Practical experience questions, trade-off discussions, real project examples
  * Senior: Architecture decisions, system design, leadership, cross-team impact, mentoring
  * Lead/Principal: Strategic thinking, org-wide impact, technical vision, complex trade-offs
  Do NOT ask senior-level architecture or system design questions for junior/mid roles.

RESPONSE FORMAT (JSON only):
{
  "question": "the actual question",
  "targetAreas": ["area"],
  "reasoning": "why this question",
  "expectedOutcomes": ["what we learn"],
  "followUpStrategy": "approach",
  "questionStyle": "${questionStyle?.id || 'direct'}"
}`;

      const recentContext = session.conversation.slice(-6).map(entry =>
        `${entry.type}: ${entry.content}`
      ).join('\n');

      const allAskedQuestions = session.conversation
        .filter(e => e.type === 'interviewer')
        .map(e => `- ${e.content}`)
        .join('\n');

      const coverageSummary = Object.fromEntries(
        Object.entries(session.coverage?.areas || {}).map(([a, d]) => [a, `${d.percentage}% (${d.questionsAsked || 0}q)`])
      );

      // Build explored topics summary per area to prevent theme repetition
      const exploredTopicsSummary = Object.entries(session.coverage?.areas || {})
        .filter(([_, d]) => d.topicsExplored?.length > 0)
        .map(([area, d]) => `${area}: ${d.topicsExplored.join(', ')}`)
        .join('\n') || 'none yet';

      // Detect overused themes: bigrams that appear 2+ times in questions
      const allQuestionTexts = session.conversation
        .filter(e => e.type === 'interviewer')
        .map(e => e.content.toLowerCase());
      const themeFrequency = {};
      for (const q of allQuestionTexts) {
        const words = q.split(/\s+/).filter(w => w.length > 3);
        for (let i = 0; i < words.length - 1; i++) {
          const bigram = `${words[i]} ${words[i+1]}`;
          themeFrequency[bigram] = (themeFrequency[bigram] || 0) + 1;
        }
      }
      const overusedThemes = Object.entries(themeFrequency)
        .filter(([_, count]) => count >= 2)
        .map(([theme]) => theme);

      // RAG context from JD (if available)
      const ragBlock = session.ragContext ? `
RELEVANT JD CONTEXT (use this to align questions with job requirements):
${session.ragContext}` : '';

      // JD skills tracking — show which skills are uncovered vs covered
      const checklist = session.jdSkillsChecklist || [];
      const uncoveredSkills = checklist.filter(s => !s.asked).map(s => s.skill);
      const coveredSkills = checklist.filter(s => s.asked).map(s =>
        `${s.skill} ${s.covered ? '(demonstrated)' : '(asked, not demonstrated)'}`
      );
      const skillTrackingBlock = checklist.length > 0 ? `
JD SKILLS NOT YET ASKED ABOUT (PRIORITIZE these — ask about a different skill each question):
${uncoveredSkills.join(', ') || 'all skills covered'}

JD SKILLS ALREADY EXPLORED:
${coveredSkills.join(', ') || 'none yet'}` : '';

      const userPrompt = `Role: ${session.config.context.targetRole} at ${session.config.context.targetCompany}

COVERAGE: ${JSON.stringify(coverageSummary)}
WEAKEST: ${JSON.stringify(coverageAnalysis?.overallAssessment?.weakestAreas || Object.entries(session.coverage?.areas || {}).filter(([_,d]) => d.percentage < 50).map(([a]) => a))}
${skillTrackingBlock}

TOPICS ALREADY EXPLORED (do NOT revisit these — pick a DIFFERENT sub-topic):
${exploredTopicsSummary}
${overusedThemes.length > 0 ? `\nOVERUSED THEMES (AVOID these completely — pick a fresh topic):\n${overusedThemes.join(', ')}` : ''}
${ragBlock}

ALREADY ASKED (DO NOT repeat or rephrase these):
${allAskedQuestions || '(none yet)'}

RECENT CONVERSATION:
${recentContext}

Generate the next question.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
        maxTokens: 300,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'generateIntelligentQuestion');
    } catch (error) {
      console.error('Error generating intelligent question:', error);
      throw error;
    }
  }

  async generateTargetedQuestionForArea(areaName, areaData, candidateHistory, roleContext) {
    try {
      const systemPrompt = `Generate a specific, targeted question to explore a particular competency area in depth.

REQUIREMENTS:
- Focus specifically on the target competency area
- Consider candidate's previous responses about this area
- Ask for concrete examples and specific experiences
- Progress from general to specific based on what's already known
- Be engaging and allow candidate to showcase their expertise

CRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

RESPONSE FORMAT (JSON only):
{
  "question": "targeted question for the specific area",
  "focus": "specific aspect of the area being explored",
  "expectedEvidence": ["types of evidence this should reveal"],
  "probeLevel": "surface|moderate|deep",
  "followUpQuestions": ["potential follow-up questions"]
}`;

      const relevantHistory = candidateHistory.filter(entry =>
        entry.type === 'candidate' &&
        (entry.content.toLowerCase().includes(areaName.toLowerCase()) ||
         entry.aiAnalysis?.topicsDiscussed?.includes(areaName))
      );

      const askedQuestions = candidateHistory
        .filter(e => e.type === 'interviewer')
        .map(e => `- ${e.content}`)
        .join('\n');

      const userPrompt = `TARGET COMPETENCY AREA: ${areaName}

AREA COVERAGE DATA:
${JSON.stringify(areaData, null, 2)}

ROLE CONTEXT:
${JSON.stringify(roleContext, null, 2)}

ALREADY ASKED (generate something COMPLETELY DIFFERENT):
${askedQuestions || '(none yet)'}

CANDIDATE'S PREVIOUS RESPONSES ABOUT THIS AREA:
${relevantHistory.map(entry => entry.content).join('\n---\n')}

Generate a targeted question to explore this competency area more deeply. Respond with ONLY valid JSON.`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.6,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true
      });

      const responseContent = aiResponse.content;

      // Validate response is not suspiciously short or malformed
      if (responseContent.length < 10 || !responseContent.includes('{')) {
        console.error('❌ Malformed AI response for generateTargetedQuestionForArea:', responseContent);
        console.error('   Area:', areaName);
        console.error('   Response length:', responseContent.length);
        throw new Error(`AI returned malformed response: "${responseContent}"`);
      }

      const parsedResponse = AIUtils.parseJSONResponse(responseContent, 'generateTargetedQuestionForArea');

      // Validate the parsed response has required fields
      if (!parsedResponse.question || parsedResponse.question.length < 5) {
        console.error('❌ Parsed response missing valid question field:', parsedResponse);
        throw new Error('AI response missing valid question field');
      }

      return parsedResponse;
    } catch (error) {
      console.error('❌ Error generating targeted question for area:', areaName);
      console.error('   Error message:', error.message);
      console.error('   Error type:', error.constructor.name);
      throw error;
    }
  }
}

/**
 * Decision Engine AI - Makes intelligent interview flow decisions
 */
class DecisionEngineAI {
  constructor(sessionManager, serviceInstance) {
    this.sessionManager = sessionManager;
    this.service = serviceInstance; // Reference to parent IntelligentInterviewService
  }

  async makeIntelligentDecision(session, candidateResponse, allAnalyses) {
    try {
      // DYNAMIC QUESTION LIMITS based on response quality for time efficiency
      const QUALITY_THRESHOLDS = {
        EXCELLENT: 75,    // Skip after 2 questions - candidate clearly competent
        GOOD: 60,         // Skip after 3 questions - good evidence gathered
        MODERATE: 40,     // Ask up to 4 questions - need more evidence
        POOR: 30          // Skip after 2 questions - no point continuing on this topic
      };

      const QUESTIONS_PER_QUALITY = {
        EXCELLENT: 2,     // Quick validation, move on (save time)
        GOOD: 3,          // Standard exploration
        MODERATE: 4,      // Need more evidence
        POOR: 2           // Don't waste time on weak areas
      };

      // Check question counts per area to enforce dynamic limits
      const areaQuestionCounts = {};
      const MAX_QUESTIONS_PER_AREA = 5; // Absolute maximum fallback

      if (session.coverage && session.coverage.areas) {
        Object.keys(session.coverage.areas).forEach(areaName => {
          const area = session.coverage.areas[areaName];
          areaQuestionCounts[areaName] = area.questionsAsked || 0;
        });
      }

      // Determine current topic area from recent conversation
      const recentInterviewerMessages = session.conversation
        .filter(entry => entry.type === 'interviewer')
        .slice(-2);

      let currentArea = null;
      if (recentInterviewerMessages.length > 0) {
        const lastQuestion = recentInterviewerMessages[recentInterviewerMessages.length - 1];
        currentArea = lastQuestion.metadata?.targetAreas?.[0];
      }

      // TIME BUDGET CHECK: Force advance if area time budget exhausted
      if (currentArea && session.timeBudgetPerAreaMs) {
        const areaData = session.coverage?.areas?.[currentArea];
        if (areaData?.startTime) {
          const areaElapsed = Date.now() - areaData.startTime;
          if (areaElapsed >= session.timeBudgetPerAreaMs) {
            console.log(`⏰ [Time Budget] Exhausted for area "${currentArea}" (${Math.round(areaElapsed/1000)}s >= ${Math.round(session.timeBudgetPerAreaMs/1000)}s budget)`);
            const nextArea = this.service.findLeastAskedArea(session.coverage.areas, currentArea);
            return {
              decision: 'explore_new_area',
              targetArea: nextArea,
              reasoning: `Time budget for "${currentArea}" exhausted (${Math.round(areaElapsed/1000)}s). Moving to "${nextArea}".`,
              forceAdvance: true,
              confidence: 95
            };
          }
        }
      }

      // SMART DECISION: Calculate quality-based limit for current area
      let forcedDecision = null;
      let maxQuestionsForArea = MAX_QUESTIONS_PER_AREA;

      if (currentArea && areaQuestionCounts[currentArea] > 0) {
        // Calculate average quality for responses in this area
        const currentAreaQuality = this.service.calculateAreaQualityAverage(
          session.conversation,
          currentArea,
          areaQuestionCounts[currentArea]
        );

        // Determine dynamic limit based on quality
        if (currentAreaQuality >= QUALITY_THRESHOLDS.EXCELLENT) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.EXCELLENT;
          console.log(`⚡ [Smart Limit] Excellent responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else if (currentAreaQuality >= QUALITY_THRESHOLDS.GOOD) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.GOOD;
          console.log(`✅ [Smart Limit] Good responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else if (currentAreaQuality >= QUALITY_THRESHOLDS.MODERATE) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.MODERATE;
          console.log(`📊 [Smart Limit] Moderate responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.POOR;
          console.log(`⚠️  [Smart Limit] Poor responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions, moving on`);
        }

        // Force move to new area if dynamic limit reached
        if (areaQuestionCounts[currentArea] >= maxQuestionsForArea) {
          console.log(`🚫 [Smart Question Limit] Area "${currentArea}" has ${areaQuestionCounts[currentArea]} questions (dynamic max: ${maxQuestionsForArea} based on quality ${currentAreaQuality.toFixed(1)}/100)`);
          forcedDecision = {
            decision: "explore_new_area",
            reasoning: `Asked ${areaQuestionCounts[currentArea]} questions on ${currentArea} with ${currentAreaQuality.toFixed(1)}/100 average quality. ` +
                      (currentAreaQuality >= QUALITY_THRESHOLDS.GOOD
                        ? 'Good performance - moving on efficiently.'
                        : 'Limited value from additional questions - exploring other areas.'),
            targetArea: this.service.findLeastAskedArea(session.coverage.areas, currentArea),
            strategy: "Move to fresh topic for time efficiency",
            confidence: 95,
            expectedDuration: "2-3 minutes",
            forcedBySmartLimit: true,
            areaQuality: currentAreaQuality
          };
          console.log(`✅ [Forced Decision] Moving to area: ${forcedDecision.targetArea}`);
          return forcedDecision;
        }
      }

      const systemPrompt = `You are an expert interview decision engine. Make intelligent decisions about interview flow based on comprehensive analysis.

DECISION OPTIONS:
1. "continue_probing" - Ask follow-up on current topic
2. "explore_new_area" - Move to different competency area
3. "seek_examples" - Ask for specific examples/evidence
4. "wrap_up_area" - Complete current area exploration
5. "end_interview" - Interview objectives achieved

DECISION FACTORS:
- Coverage gaps and priorities
- Conversation flow and natural progression
- Time management and efficiency
- Candidate engagement and communication style
- Quality and depth of evidence gathered
- Question count per area (avoid asking too many on same topic)

IMPORTANT: Avoid asking more than 3-5 questions on the same topic to prevent repetition and maintain candidate engagement.

RESPONSE FORMAT (JSON only):
{
  "decision": "continue_probing|explore_new_area|seek_examples|wrap_up_area|end_interview",
  "reasoning": "detailed explanation of decision",
  "targetArea": "which area to focus on",
  "strategy": "approach for next interaction",
  "confidence": number,
  "expectedDuration": "estimated time for this decision path"
}`;

      const userPrompt = `SESSION DATA:
${JSON.stringify({
        coverage: session.coverage,
        recentConversation: session.conversation.slice(-5),
        config: {
          targetRole: session.config.context.targetRole,
          duration: session.config.sessionSettings.duration
        },
        questionCounts: areaQuestionCounts,
        currentArea: currentArea
      }, null, 2)}

LATEST RESPONSE: "${candidateResponse}"

ANALYSES:
${JSON.stringify(allAnalyses, null, 2)}

QUESTION COUNTS PER AREA (Max 5 recommended):
${JSON.stringify(areaQuestionCounts, null, 2)}

Current Topic Area: ${currentArea || 'N/A'}

Make the next intelligent decision for interview progression. Consider question counts to avoid over-asking on same topic.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'makeIntelligentDecision');
    } catch (error) {
      console.error('Error in intelligent decision making:', error);
      throw error;
    }
  }

}

// ═══════════════════════════════════════════════════════════
// Question Style Definitions for Diverse Question Generation
// ═══════════════════════════════════════════════════════════

const UNIVERSAL_STYLES = {
  situational: {
    id: 'situational',
    instruction: `STYLE: SITUATIONAL — Frame your question as a hypothetical scenario. Start with "Imagine..." or "Suppose you..." and place the candidate in a realistic work situation related to the target area. The scenario should require them to explain their approach, not just recall a past event.`,
    minTurn: 0,
    requiresContext: false
  },
  'problem-finding': {
    id: 'problem-finding',
    instruction: `STYLE: PROBLEM-FINDING — Present a flawed approach, design decision, or technical strategy related to the target area and ask the candidate to identify what's wrong with it. For example: "A developer proposes [X approach] for [Y problem]. What issues do you see?" The flaw should be realistic and calibrated to the candidate's assessed difficulty level.`,
    minTurn: 2,
    requiresContext: false
  },
  challenge: {
    id: 'challenge',
    instruction: `STYLE: CHALLENGE — Push back on something the candidate said in their last answer to test depth and conviction. Reference a specific claim they made and present a counterpoint or edge case. For example: "You mentioned X, but what about Y? How would you handle that?" Be respectful but probing.`,
    minTurn: 1,
    requiresContext: true
  }
};

const FRAMEWORK_STYLE_INSTRUCTIONS = {
  'scenario-based':          'STYLE: SCENARIO-BASED — Ask a question grounded in a realistic work scenario specific to the domain.',
  'code review':             'STYLE: CODE REVIEW — Describe a coding approach, design pattern, or architecture decision verbally and ask the candidate to critique it, identify potential issues, or suggest improvements. This is entirely verbal — do NOT present actual code.',
  'architecture discussion': 'STYLE: ARCHITECTURE DISCUSSION — Ask about system design, architectural trade-offs, or scaling decisions.',
  'debugging walkthrough':   'STYLE: DEBUGGING WALKTHROUGH — Describe a bug symptom and ask how they would diagnose and fix it.',
  'behavioral STAR':         'STYLE: BEHAVIORAL STAR — Ask for a specific past experience. Expect the candidate to describe the Situation, Task, Action, and Result.',
  'values-based':            'STYLE: VALUES-BASED — Ask about personal values, ethics, or principles relevant to the role.',
  'motivational':            'STYLE: MOTIVATIONAL — Ask what drives the candidate, their career goals, or what excites them about this role.',
  'role-play':               'STYLE: ROLE-PLAY — Set up a brief role-play scenario (e.g., "I\'m a client who says X. How do you respond?").',
  'deal walkthrough':        'STYLE: DEAL WALKTHROUGH — Ask the candidate to walk through a deal or project end-to-end.',
  'objection handling':      'STYLE: OBJECTION HANDLING — Present an objection and ask how they would respond.',
  'pipeline review':         'STYLE: PIPELINE REVIEW — Ask about pipeline management, forecasting, or deal qualification.',
  'portfolio review':        'STYLE: PORTFOLIO REVIEW — Ask the candidate to walk through a piece of their work or portfolio.',
  'design critique':         'STYLE: DESIGN CRITIQUE — Describe a design and ask for their critique of it.',
  'whiteboard exercise':     'STYLE: WHITEBOARD — Ask the candidate to walk through their solution design step by step, explaining each component and how they connect. This is entirely verbal — do NOT present actual code or diagrams.',
  'case study':              'STYLE: CASE STUDY — Present a business case and ask for their analysis.',
  'prioritization exercise': 'STYLE: PRIORITIZATION — Present competing priorities and ask how they would decide.',
  'metrics discussion':      'STYLE: METRICS — Ask about KPIs, success metrics, or how they measure impact.',
  'roadmap review':          'STYLE: ROADMAP REVIEW — Ask about product roadmap decisions, sequencing, or trade-offs.',
  'SQL challenge':           'STYLE: SQL CHALLENGE — Describe a data retrieval or transformation problem and ask the candidate to explain their query approach and reasoning step by step. This is entirely verbal — do NOT present actual code or SQL.',
  'analysis walkthrough':    'STYLE: ANALYSIS WALKTHROUGH — Ask the candidate to walk through an analytical approach step by step.',
  'reflective':              'STYLE: REFLECTIVE — Ask the candidate to reflect on a lesson learned or a growth experience.',
  'campaign analysis':       'STYLE: CAMPAIGN ANALYSIS — Ask the candidate to analyze a campaign\'s performance.',
  'deal storytelling':       'STYLE: DEAL STORYTELLING — Ask the candidate to tell the story of a specific deal or negotiation.',
  'portfolio discussion':    'STYLE: PORTFOLIO DISCUSSION — Ask the candidate to discuss a specific piece from their portfolio.',
};

class IntelligentInterviewService {
  constructor() {
    this.sessionManager = redisSessionManager;

    // Initialize AI service components (no longer need Together AI client)
    this.memoryAI = new MemoryAI(this.sessionManager);
    this.coverageAI = new CoverageAnalysisAI(this.sessionManager);
    this.questionAI = new QuestionGeneratorAI(this.sessionManager);
    this.decisionAI = new DecisionEngineAI(this.sessionManager, this);
  }

  /**
   * Build agent persona from job description — ONE LLM call at interview start.
   * Creates a job-aware AI profile with must-have skills, red flags, and evaluation framework.
   */
  async buildAgentPersona(jobData, interviewConfig) {
    const jobCategory = interviewConfig.jobCategory || detectJobCategory(jobData.title, jobData.description);
    const evaluationFramework = getEvaluationFramework(jobCategory, interviewConfig.interviewType);

    try {
      const analysis = await bedrock.callLLM({
        systemPrompt: "You are an expert recruiter. Analyze this job and return JSON only.",
        messages: [{ role: "user", content: `
Title: ${jobData.title}
Company: ${jobData.company || jobData.companyName || ""}
Description: ${jobData.description || ""}
Requirements: ${JSON.stringify(jobData.requirements || [])}
Responsibilities: ${JSON.stringify(jobData.responsibilities || [])}
Experience Level: ${jobData.experienceLevel || interviewConfig.context?.experienceLevel || "mid"}
Category: ${jobCategory}
Interview Type: ${interviewConfig.interviewType}

Return JSON:
{
  "mustHaveSkills": ["3-5 critical skills from JD"],
  "niceToHaveSkills": ["3-5 bonus skills from JD"],
  "keyBehaviors": ["3-5 needed behaviors"],
  "redFlags": ["3-5 disqualifying signs"],
  "seniorityExpectations": "one sentence",
  "domainSpecificTopics": ["3-5 industry topics to explore"],
  "agentTone": "description of interviewer tone for this role",
  "focusAreas": {
    "area_key_1": { "weight": 30, "description": "What this area evaluates — specific to JD", "indicators": ["3-4 specific indicators from JD"] },
    "area_key_2": { "weight": 25, "description": "...", "indicators": ["..."] },
    "area_key_3": { "weight": 25, "description": "...", "indicators": ["..."] },
    "area_key_4": { "weight": 20, "description": "...", "indicators": ["..."] }
  },
  "questionStyles": ["4 interview styles suited for this role"]
}

RULES for focusAreas:
- Generate 4 areas SPECIFIC to this JD — NOT generic areas like "technical_depth" or "problem_solving"
- Each area should map to a cluster of related skills/responsibilities from the JD
- Weights must sum to 100
- Example for Android Developer JD: "kotlin_java" (30%), "android_platform" (25%), "architecture_patterns" (25%), "testing_devops" (20%)
- Example for Solidity Developer JD: "smart_contracts" (30%), "security_auditing" (25%), "defi_protocols" (25%), "blockchain_fundamentals" (20%)
- area_key must be lowercase with underscores, max 25 chars
- questionStyles: pick 4 from: scenario-based, code review, architecture discussion, debugging walkthrough, behavioral STAR, situational, values-based, role-play, case study, portfolio review, whiteboard exercise, prioritization exercise, metrics discussion, analysis walkthrough, reflective` }],
        temperature: 0.2,
        maxTokens: 800,
        timeout: 30000,
        useFastModel: true
      });

      var parsed = AIUtils.parseJSONResponse(analysis.content, 'buildAgentPersona');
    } catch (error) {
      console.warn('⚠️ [Persona] LLM analysis failed, using defaults:', error.message);
      var parsed = AIUtils.getFallbackResponse('buildAgentPersona', '');
    }

    // Use LLM-generated focus areas if valid, otherwise fall back to static framework
    const llmFocusAreas = parsed.focusAreas;
    const llmQuestionStyles = parsed.questionStyles;
    let finalEvaluationFramework;

    if (llmFocusAreas && typeof llmFocusAreas === 'object' && Object.keys(llmFocusAreas).length >= 3) {
      const totalWeight = Object.values(llmFocusAreas).reduce((sum, a) => sum + (a?.weight || 0), 0);
      if (totalWeight >= 80 && totalWeight <= 120) {
        // Normalize weights to sum to exactly 100
        const normFactor = 100 / totalWeight;
        for (const key of Object.keys(llmFocusAreas)) {
          llmFocusAreas[key].weight = Math.round(llmFocusAreas[key].weight * normFactor);
          // Ensure indicators is an array
          if (!Array.isArray(llmFocusAreas[key].indicators)) {
            llmFocusAreas[key].indicators = [];
          }
        }
        finalEvaluationFramework = {
          focusAreas: llmFocusAreas,
          questionStyles: Array.isArray(llmQuestionStyles) && llmQuestionStyles.length > 0
            ? llmQuestionStyles
            : evaluationFramework.questionStyles
        };
        console.log(`🎯 [Persona] LLM-generated focus areas: ${Object.keys(llmFocusAreas).join(', ')}`);
      } else {
        finalEvaluationFramework = evaluationFramework;
        console.log(`⚠️ [Persona] LLM focus areas invalid weights (${totalWeight}), using static framework`);
      }
    } else {
      finalEvaluationFramework = evaluationFramework;
      console.log(`⚠️ [Persona] No LLM focus areas returned, using static framework: ${Object.keys(evaluationFramework.focusAreas).join(', ')}`);
    }

    console.log(`🎭 [Persona] Built for ${jobCategory}/${interviewConfig.interviewType}: ${parsed.mustHaveSkills?.length || 0} must-haves, ${parsed.redFlags?.length || 0} red flags, ${Object.keys(finalEvaluationFramework.focusAreas).length} focus areas`);

    return {
      job: {
        title: jobData.title,
        company: jobData.company || jobData.companyName,
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        experienceLevel: jobData.experienceLevel || interviewConfig.context?.experienceLevel || "mid",
      },
      interviewType: interviewConfig.interviewType,
      jobCategory,
      idealCandidate: parsed,
      evaluationFramework: finalEvaluationFramework,
      agentBehavior: {
        tone: parsed.agentTone || "professional and conversational",
        domainTopics: parsed.domainSpecificTopics || [],
      },
    };
  }

  /**
   * Combined Analysis — ONE LLM call replaces analyzeResponseIntelligence + analyzeResponseQuality
   * + analyzeCoverageIntelligently + shouldEndInterview (LLM part).
   */
  async combinedAnalysis(candidateResponse, session, lastQuestion, targetArea) {
    const persona = session.agentPersona || {};
    const personaContext = persona.job ? `
=== AGENT PERSONA ===
Role: ${persona.job.title} at ${persona.job.company}
Category: ${persona.jobCategory} (${persona.interviewType})
Must-Have Skills: ${persona.idealCandidate?.mustHaveSkills?.join(", ") || "N/A"}
Red Flags: ${persona.idealCandidate?.redFlags?.join(", ") || "N/A"}
=== FOCUS AREAS ===
${Object.entries(session.coverage?.areas || {}).map(([a, d]) => `${a} (${d.weight || 0}%): ${d.description || a}`).join("\n")}
` : `
=== FOCUS AREAS ===
${Object.entries(session.coverage?.areas || {}).map(([a, d]) => `${a}: ${d.percentage || 0}%`).join("\n")}
`;

    const systemPrompt = `You are an expert interview analyst. Analyze this candidate response comprehensively in ONE pass.
${personaContext}
Return ONLY valid JSON with ALL of these fields:
{
  "quality": { "score": 0-100, "answeredQuestion": true/false, "depthLevel": "surface|moderate|deep", "isOffTopic": true/false, "completeness": "complete|partial|minimal|avoided" },
  "skills": { "demonstrated": ["skill1"], "hinted": ["skill2"], "gaps": ["skill3"] },
  "coverage": { "areasImpacted": [{ "area": "focus_area_name", "increase": 5-25, "evidence": "brief evidence" }] },
  "style": { "verbosity": "concise|detailed|rambling", "confidence": "hesitant|moderate|confident", "usesExamples": true/false },
  "interestingTopics": [{ "topic": "what they mentioned", "unexplored": ["angle1"], "relevantArea": "focus_area" }],
  "shouldEnd": { "shouldEnd": false, "reason": "ONLY set true if candidate had 8+ poor responses OR all areas >80% covered. For early interviews (< 6 exchanges), ALWAYS false." }
}

COVERAGE INCREASE GUIDE (use these ranges — do NOT default to low values):
- Deep answer with specific examples and technical detail: increase 18-25
- Good answer showing solid understanding: increase 12-17
- Surface-level or partial answer: increase 5-11
- Off-topic, avoided, or no useful signal: increase 0
The goal is to complete coverage of 4 areas in ~12-15 total questions (roughly 3-4 questions per area).

QUALITY SCORE CALIBRATION (score MUST reflect actual answer quality — do NOT default to 50-60):
- 80-100: Excellent — deep technical detail, specific examples, demonstrates mastery
- 60-79: Good — solid understanding, some examples, shows competence
- 40-59: Fair — basic understanding, vague or generic, lacks depth
- 20-39: Weak — significant gaps, confusion, wrong information
- 0-19: No answer / completely off-topic / "I don't know"
A good answer with real examples MUST score 70+. Only score below 50 if the answer is truly weak.

DEPTH LEVEL CALIBRATION:
- "deep": Specific technical details, real examples, trade-offs, or internals explained
- "moderate": Shows understanding with some specifics but stays conceptual
- "surface": Vague or generic response without specifics
Default to "moderate" if the answer shows any real understanding. Only use "surface" for truly vague responses.

SKILL DETECTION: Extract ALL specific technologies, tools, frameworks, and concepts the candidate mentions.
Map them to the JD Must-Have Skills listed above. If JD says "Kotlin" and candidate discusses Kotlin features, list "Kotlin" in demonstrated.`;

    const coverageSummary = Object.fromEntries(
      Object.entries(session.coverage?.areas || {}).map(([a, d]) => [a, d.percentage + "%"])
    );

    const userPrompt = `INTERVIEWER QUESTION: "${lastQuestion || "N/A"}"
TARGET AREA: ${targetArea || "General"}
CANDIDATE RESPONSE: "${candidateResponse}"
CURRENT COVERAGE: ${JSON.stringify(coverageSummary)}
CONVERSATION LENGTH: ${session.conversation?.length || 0} exchanges`;

    try {
      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.2,
        maxTokens: 800,
        timeout: 25000,
        useFastModel: false // gpt-oss — strong model for critical analysis
      });

      return AIUtils.parseJSONResponse(response.content, 'combinedAnalysis');
    } catch (error) {
      console.warn('⚠️ [Combined Analysis] Failed, using fallback:', error.message);
      return AIUtils.getFallbackResponse('combinedAnalysis', '');
    }
  }

  /**
   * Update candidate profile with analysis results. Pure logic — no LLM call.
   */
  updateCandidateProfile(profile, analysis, turnNumber) {
    if (!profile) {
      profile = {
        communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
        revealedExpertise: [], revealedGaps: [], mentionedProjects: [], anchors: [],
        currentDifficulty: "intermediate", responseQualities: [],
      };
    }

    if (analysis.style) {
      profile.communicationStyle.verbosity = analysis.style.verbosity;
      profile.communicationStyle.confidenceLevel = analysis.style.confidence;
      profile.communicationStyle.usesExamples = analysis.style.usesExamples;
    }

    if (analysis.skills?.demonstrated) {
      for (const s of analysis.skills.demonstrated) {
        if (!profile.revealedExpertise.includes(s)) profile.revealedExpertise.push(s);
      }
    }
    if (analysis.skills?.gaps) {
      for (const s of analysis.skills.gaps) {
        if (!profile.revealedGaps.includes(s)) profile.revealedGaps.push(s);
      }
    }

    if (analysis.interestingTopics) {
      for (const topic of analysis.interestingTopics) {
        profile.anchors.push({
          turn: turnNumber,
          topic: topic.topic,
          unexplored: topic.unexplored || [],
          relevantArea: topic.relevantArea
        });
      }
      profile.anchors = profile.anchors.slice(-10);
    }

    profile.responseQualities.push(analysis.quality?.score || 50);
    const avg = profile.responseQualities.reduce((a, b) => a + b, 0) / profile.responseQualities.length;
    profile.currentDifficulty = avg >= 75 ? "advanced" : avg >= 50 ? "intermediate" : "foundational";

    return profile;
  }

  /**
   * Decide question strategy based on analysis + profile + coverage. Pure logic — no LLM call.
   * Returns one of 4 modes: bridge, probe, transition, validate.
   */
  decideQuestionStrategy(analysis, candidateProfile, coverage, session) {
    const areas = coverage.areas || {};
    const currentArea = session.currentFocusArea;
    const questionsInArea = areas[currentArea]?.questionsAsked || 0;

    // PASS/SKIP: If candidate just passed, immediately transition to different area
    const lastCandidateEntry = session.conversation?.filter(e => e.type === 'candidate').slice(-1)[0];
    const lastMeta = lastCandidateEntry?.metadata;
    if (lastMeta?.answeredQuestion === false || lastMeta?.completeness === 'avoided') {
      const weakest = Object.entries(areas)
        .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed)
        .sort((a, b) => a[1].percentage - b[1].percentage)[0];
      if (weakest) {
        return {
          mode: "transition",
          targetArea: weakest[0],
          context: `Candidate passed on ${currentArea} — moving to ${weakest[0]}`
        };
      }
    }

    // HARD CAP: After 2 questions in current area, always transition to weakest area
    if (questionsInArea >= 2 && currentArea) {
      const weakest = Object.entries(areas)
        .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed)
        .sort((a, b) => a[1].percentage - b[1].percentage)[0];
      if (weakest) {
        return {
          mode: "transition",
          targetArea: weakest[0],
          context: `Forced transition after ${questionsInArea} questions in ${currentArea}`
        };
      }
    }

    // Priority 1: BRIDGE — candidate mentioned something mapping to a gap
    for (const topic of (analysis.interestingTopics || [])) {
      if (topic.relevantArea && areas[topic.relevantArea] && areas[topic.relevantArea].percentage < 60) {
        return {
          mode: "bridge",
          targetArea: topic.relevantArea,
          context: `Candidate mentioned "${topic.topic}"`,
          unexploredAngles: topic.unexplored
        };
      }
    }

    // Priority 2: PROBE — only 1 follow-up before moving on
    if (currentArea && questionsInArea < 2 && areas[currentArea]?.percentage < 70 && analysis.quality?.depthLevel === "surface") {
      return {
        mode: "probe",
        targetArea: currentArea,
        context: "Answer was surface-level — ask for specific example"
      };
    }

    // Priority 3: TRANSITION — explore weakest uncovered area (threshold raised to < 70%)
    const weakest = Object.entries(areas)
      .filter(([_, d]) => d.percentage < 70 && !d.completed)
      .sort((a, b) => a[1].percentage - b[1].percentage)[0];

    if (weakest) {
      const anchor = candidateProfile?.anchors?.find(a => a.unexplored?.length > 0);
      return {
        mode: "transition",
        targetArea: weakest[0],
        context: anchor ? `Bridge from "${anchor.topic}" to ${weakest[0]}` : `Transition to ${weakest[0]}`
      };
    }

    // Priority 4: VALIDATE
    return {
      mode: "validate",
      targetArea: currentArea || Object.keys(areas)[0],
      context: "Ask a final validation question"
    };
  }

  /**
   * Select question style — pure logic, no LLM call (~0ms).
   * Picks from universal styles + framework-defined styles + direct, with rotation to avoid repeats.
   */
  selectQuestionStyle(session, analysis, questionStrategy) {
    const turnNumber = Math.floor((session.conversation?.length || 0) / 2);
    const styleHistory = session.questionStyleHistory || [];
    const lastStyle = styleHistory.length > 0 ? styleHistory[styleHistory.length - 1] : null;
    const lastTwoStyles = new Set(styleHistory.slice(-2));

    // Build available styles pool
    const frameworkStyles = session.agentPersona?.evaluationFramework?.questionStyles || [];
    const availableStyles = [];

    // Universal: situational (always eligible)
    availableStyles.push(UNIVERSAL_STYLES.situational);

    // Universal: problem-finding (after turn 2 — need context about candidate level)
    if (turnNumber >= 2) {
      availableStyles.push(UNIVERSAL_STYLES['problem-finding']);
    }

    // Universal: challenge (only when there's something worth challenging)
    const lastQuality = analysis?.quality?.score || 50;
    const lastDepth = analysis?.quality?.depthLevel;
    const lastConfidence = session.candidateProfile?.communicationStyle?.confidenceLevel;
    if (turnNumber >= 1 &&
        (lastQuality >= 55 || lastConfidence === 'confident') &&
        lastDepth !== 'surface' &&
        questionStrategy?.mode !== 'transition') {
      availableStyles.push(UNIVERSAL_STYLES.challenge);
    }

    // Framework styles (from config-manager, category-specific)
    for (const styleName of frameworkStyles) {
      if (styleName === 'situational') continue; // already in universal
      const instruction = FRAMEWORK_STYLE_INSTRUCTIONS[styleName];
      if (instruction) {
        availableStyles.push({ id: styleName, instruction, minTurn: 0, requiresContext: false });
      }
    }

    // Direct style (preserves current default behavior)
    availableStyles.push({ id: 'direct', instruction: null, minTurn: 0, requiresContext: false });

    // Hard filter: no consecutive repeats
    let eligible = availableStyles.filter(s => s.id !== lastStyle);

    // Soft filter: deprioritize styles used in last 2 turns
    const fresh = eligible.filter(s => !lastTwoStyles.has(s.id));
    const pool = fresh.length > 0 ? fresh : eligible;

    // Weighted random: universal=3, framework=2, direct=1
    const weighted = [];
    for (const style of pool) {
      const weight = UNIVERSAL_STYLES[style.id] ? 3 : (style.id === 'direct' ? 1 : 2);
      for (let i = 0; i < weight; i++) weighted.push(style);
    }

    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  /**
   * Initialize service
   */
  async initialize() {
    try {
      // Initialize Redis connection with timeout to prevent blocking
      console.log('🔌 [Service] Attempting to connect to Redis...');
      const redisInitialized = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout after 5 seconds')), 5000)
        )
      ]).catch(err => {
        console.error('⚠️  [Service] Redis initialization failed:', err.message);
        console.warn('⚠️  [Service] Interview service will continue WITHOUT Redis (in-memory mode)');
        console.warn('⚠️  [Service] Sessions will not persist across server restarts');
        console.warn('💡 [Service] To fix: Run `redis-server` or `sudo service redis-server start` in WSL');
        return false;
      });

      if (redisInitialized) {
        console.log('✅ [Service] Intelligent Interview Service initialized with Redis');
        console.log('💾 [Service] Sessions will be stored in Redis with 2-hour TTL');

        // Test Redis connection with ping
        try {
          const pingTest = await this.sessionManager.client.ping();
          console.log('🏓 [Service] Redis connectivity test:', pingTest);
          console.log('📊 [Service] Redis status:', {
            isConnected: this.sessionManager.isConnected,
            isReady: this.sessionManager.isReady()
          });
        } catch (pingError) {
          console.error('❌ [Service] Redis ping test failed:', pingError.message);
          console.warn('⚠️  [Service] Redis may not be fully operational');
        }
      } else {
        console.log('⚠️  [Service] Intelligent Interview Service initialized WITHOUT Redis (degraded mode)');
        console.log('⚠️  [Service] Interview features may be limited');
      }

      return true;  // Always return true to not block server startup
    } catch (error) {
      console.error('❌ [Service] Failed to initialize Intelligent Interview Service:', error.message);
      console.warn('⚠️  [Service] Server will continue without interview service');
      return true;  // Don't block server startup
    }
  }

  /**
   * Calculate average response quality for a specific area
   * Used for smart question limit decisions
   * @param {Array} conversation - Full conversation history
   * @param {string} areaName - Area to analyze
   * @param {number} questionCount - Number of questions asked in this area
   * @returns {number} Average quality score (0-100)
   */
  calculateAreaQualityAverage(conversation, areaName, questionCount) {
    if (!areaName || questionCount === 0) return 50; // Default to moderate

    // Find all candidate responses related to this area
    const areaResponses = [];

    for (let i = 0; i < conversation.length; i++) {
      const entry = conversation[i];

      // Look for interviewer questions targeting this area
      if (entry.type === 'interviewer' &&
          entry.metadata?.targetAreas?.includes(areaName)) {

        // Get the candidate's response (next entry)
        if (i + 1 < conversation.length && conversation[i + 1].type === 'candidate') {
          const candidateResponse = conversation[i + 1];

          // Extract quality score if available
          if (candidateResponse.metadata?.qualityScore !== undefined) {
            areaResponses.push(candidateResponse.metadata.qualityScore);
          } else if (candidateResponse.aiAnalysis?.qualityScore !== undefined) {
            areaResponses.push(candidateResponse.aiAnalysis.qualityScore);
          }
        }
      }
    }

    // Calculate average
    if (areaResponses.length === 0) return 50; // Default

    const average = areaResponses.reduce((sum, score) => sum + score, 0) / areaResponses.length;

    console.log(`📊 [Quality Analysis] ${areaName}: ${areaResponses.length} responses, avg quality: ${average.toFixed(1)}/100`);

    return average;
  }

  /**
   * Update quality counters for consecutive bad/good answers
   * Used to determine early termination (8 bad or 8 good answers)
   */
  async updateQualityCounters(sessionId, qualityScore) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.qualityTracking) return;

      const tracking = session.qualityTracking;

      const BAD_THRESHOLD = 40;
      const GOOD_THRESHOLD = 75;

      if (qualityScore < BAD_THRESHOLD) {
        // Bad answer: increment bad counter, reset good counter
        tracking.consecutiveBadAnswers++;
        tracking.consecutiveGoodAnswers = 0;
        tracking.totalBadAnswers++;
        console.log(`❌ [Quality Counter] Bad answer ${tracking.consecutiveBadAnswers}/8 (score: ${qualityScore})`);
      } else if (qualityScore >= GOOD_THRESHOLD) {
        // Good answer: increment good counter, reset bad counter
        tracking.consecutiveGoodAnswers++;
        tracking.consecutiveBadAnswers = 0;
        tracking.totalGoodAnswers++;
        console.log(`✅ [Quality Counter] Good answer ${tracking.consecutiveGoodAnswers}/8 (score: ${qualityScore})`);
      } else {
        // Medium quality (40-74): reset both counters
        tracking.consecutiveBadAnswers = 0;
        tracking.consecutiveGoodAnswers = 0;
        console.log(`📊 [Quality Counter] Medium answer (score: ${qualityScore}) - counters reset`);
      }

      tracking.lastQualityScore = qualityScore;

      await this.sessionManager.updateSession(sessionId, { qualityTracking: tracking });
    } catch (error) {
      console.error('❌ Failed to update quality counters:', error.message);
    }
  }

  /**
   * Find area with least questions asked (excluding current area)
   */
  findLeastAskedArea(coverageAreas, excludeArea = null) {
    let minQuestions = Infinity;
    let selectedArea = null;

    Object.keys(coverageAreas).forEach(areaName => {
      if (areaName === excludeArea) return; // Skip current area

      const questionsAsked = coverageAreas[areaName].questionsAsked || 0;
      if (questionsAsked < minQuestions) {
        minQuestions = questionsAsked;
        selectedArea = areaName;
      }
    });

    // If all areas have same count, pick first one that's not excluded
    if (!selectedArea) {
      selectedArea = Object.keys(coverageAreas).find(name => name !== excludeArea);
    }

    return selectedArea || Object.keys(coverageAreas)[0];
  }

  async shouldEndInterview(session, totalDuration) {
    try {
      // 🕐 TIME LIMIT CHECK (hard cap = target × 1.5, e.g., 45 min)
      if (session.interviewStartTime) {
        const elapsedMinutes = (Date.now() - session.interviewStartTime) / 60000;
        const maxDuration = session.maxDurationMinutes || 45;

        if (elapsedMinutes >= maxDuration) {
          console.log(`⏰ [Time Limit] ${elapsedMinutes.toFixed(1)} minutes elapsed (max: ${maxDuration}) - ending interview`);
          return {
            shouldEnd: true,
            confidence: 100,
            reasoning: `Interview time limit of ${maxDuration} minutes has been reached.`,
            completedObjectives: ['Time-based completion'],
            remainingGaps: [],
            recommendedAction: 'End interview - time limit reached',
            terminationReason: 'time_limit_reached',
            message: 'Thank you for your time. We\'ve completed our scheduled time for today.',
            elapsedTime: elapsedMinutes,
            score: 'time_limit'
          };
        }
      }

      // 📊 QUALITY-BASED TERMINATION: Check consecutive answer quality
      if (session.qualityTracking) {
        const tracking = session.qualityTracking;

        // 8 CONSECUTIVE BAD ANSWERS → End with poor score
        if (tracking.consecutiveBadAnswers >= 8) {
          console.log(`🚫 [Poor Quality Termination] 8 consecutive bad answers - ending interview`);
          return {
            shouldEnd: true,
            confidence: 95,
            reasoning: `Candidate provided 8 consecutive low-quality responses (quality < 40), indicating consistent difficulty with technical questions.`,
            completedObjectives: ['Performance assessment completed - insufficient technical competency'],
            remainingGaps: [],
            recommendedAction: 'End interview - insufficient technical competency demonstrated',
            terminationReason: 'poor_quality',
            message: 'Thank you for your time. Let\'s conclude our interview here.',
            badAnswerCount: tracking.consecutiveBadAnswers,
            score: 'poor'
          };
        }

        // 8 CONSECUTIVE GOOD ANSWERS → End only if coverage is also adequate
        const overallCoverage = session.coverage?.overall || 0;
        if (tracking.consecutiveGoodAnswers >= 8 && overallCoverage >= 60) {
          console.log(`✅ [Excellent Quality Termination] 8 consecutive good answers + ${overallCoverage}% coverage - ending interview`);
          return {
            shouldEnd: true,
            confidence: 95,
            reasoning: `Candidate demonstrated 8 consecutive high-quality responses (quality >= 75), showing strong technical competency.`,
            completedObjectives: ['Technical competency validated', 'Strong performance demonstrated', 'Sufficient evidence of expertise'],
            remainingGaps: [],
            recommendedAction: 'End interview - candidate clearly qualified',
            terminationReason: 'excellent_quality',
            message: 'Excellent! You\'ve demonstrated strong understanding. Thank you for your time.',
            goodAnswerCount: tracking.consecutiveGoodAnswers,
            score: 'excellent'
          };
        }
      }

      // EARLY TERMINATION: Calculate overall response quality across all areas
      const allQualityScores = session.conversation
        .filter(entry => entry.type === 'candidate')
        .map(entry => entry.metadata?.qualityScore || entry.aiAnalysis?.qualityScore)
        .filter(score => score !== undefined);

      const overallQualityAverage = allQualityScores.length > 0
        ? allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length
        : 50;

      const candidateResponseCount = Math.floor(session.conversation.length / 2);

      // EARLY TERMINATION: Consistently poor performance after 6+ responses (5-8 minutes)
      if (candidateResponseCount >= 6 && overallQualityAverage < 35) {
        console.log(`❌ [Early Termination - Poor Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses`);
        return {
          shouldEnd: true,
          confidence: 95,
          reasoning: `Candidate consistently provides insufficient technical responses (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Early termination to save time. Technical competency below threshold.`,
          completedObjectives: ['Performance assessment completed - insufficient technical depth'],
          remainingGaps: [],
          recommendedAction: 'End interview - insufficient technical competency demonstrated',
          earlyTermination: true,
          terminationReason: 'poor_performance',
          message: 'Thank you for your time. Let\'s conclude our interview here.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'poor'
        };
      }

      // EARLY EXCELLENCE: Consistently outstanding performance after 6+ responses (symmetric with poor exit)
      if (candidateResponseCount >= 6 && overallQualityAverage >= 85) {
        console.log(`🌟 [Early Excellence] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses — ending early`);
        return {
          shouldEnd: true,
          confidence: 95,
          reasoning: `Candidate consistently demonstrates excellent competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Clear signal of strong capability — further questioning provides diminishing returns.`,
          completedObjectives: ['Technical competency validated', 'Consistently excellent responses'],
          remainingGaps: [],
          recommendedAction: 'End interview - candidate clearly qualified',
          earlySuccess: true,
          terminationReason: 'early_excellence',
          message: 'Excellent! You\'ve demonstrated outstanding understanding across all topics. Thank you for your time.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'excellent'
        };
      }

      // EARLY SUCCESS: Consistently excellent performance after 8+ responses — only if coverage adequate
      const overallCov = session.coverage?.overall || 0;
      if (candidateResponseCount >= 8 && overallQualityAverage >= 80 && overallCov >= 60) {
        console.log(`✅ [Early Success - Excellent Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality, ${overallCov}% coverage over ${candidateResponseCount} responses`);
        return {
          shouldEnd: true,
          confidence: 90,
          reasoning: `Candidate consistently demonstrates strong technical competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Sufficient evidence gathered across multiple focus areas. Further questioning provides diminishing returns.`,
          completedObjectives: ['Technical competency validated', 'Strong performance across technical focus areas', 'Sufficient evidence of expertise'],
          remainingGaps: [],
          recommendedAction: 'End interview - candidate clearly qualified',
          earlySuccess: true,
          terminationReason: 'excellent_performance',
          message: 'Excellent! You\'ve demonstrated strong understanding. Thank you for your time.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'excellent'
        };
      }

      // Coverage-based guard: skip LLM if insufficient evidence to assess the candidate
      const currentOverallCoverage = session.coverage?.overall || 0;
      const areasExplored = Object.values(session.coverage?.areas || {})
        .filter(a => a.percentage > 0).length;
      const totalAreas = Object.keys(session.coverage?.areas || {}).length;

      if (currentOverallCoverage < 40 || areasExplored < Math.min(2, totalAreas)) {
        console.log(`⏳ [shouldEndInterview] Coverage ${currentOverallCoverage}%, ${areasExplored}/${totalAreas} areas explored — insufficient data, continuing`);
        return {
          shouldEnd: false,
          confidence: 0,
          reasoning: `Coverage at ${currentOverallCoverage}% with ${areasExplored}/${totalAreas} areas explored — insufficient data to assess candidate`
        };
      }

      // Continue with LLM evaluation now that we have enough evidence
      const systemPrompt = `Determine if an interview should end based on coverage completeness and interview objectives.

EVALUATION CRITERIA:
- Overall coverage percentage and quality
- All critical areas adequately explored
- Time constraints and efficiency
- Diminishing returns from continued questioning
- Interview objectives achievement

CRITICAL RULES:
- Do NOT recommend ending if overall coverage is below 50% — the agent needs more data to reliably score the candidate.
- Do NOT recommend ending if fewer than half the focus areas have been explored.
- Only recommend ending when there is SUFFICIENT evidence to evaluate the candidate's competency across the key areas.
- The goal is to gather enough data for a reliable assessment, not to end quickly.

RESPONSE FORMAT (JSON only):
{
  "shouldEnd": boolean,
  "confidence": number,
  "reasoning": "why end or continue",
  "completedObjectives": ["achieved objectives"],
  "remainingGaps": ["important gaps if continuing"],
  "recommendedAction": "specific next steps",
  "message": "a professional closing message to the candidate if shouldEnd is true, otherwise empty string"
}`;

      const userPrompt = `INTERVIEW EVALUATION:
Elapsed: ${totalDuration} minutes
Target Duration: ${session.targetDurationMinutes || session.config.sessionSettings.duration} minutes
Maximum Duration: ${session.maxDurationMinutes || 45} minutes

COVERAGE STATUS:
${JSON.stringify(session.coverage, null, 2)}

FOCUS AREAS:
${JSON.stringify(session.config.intelligenceContext.focusAreas, null, 2)}

CONVERSATION LENGTH: ${session.conversation.length} exchanges
Determine if interview objectives have been sufficiently met to end the session.`;


      const response = await bedrock.callLLM({
        systemPrompt,

        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1,
        maxTokens: 500,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'shouldEndInterview');
    } catch (error) {
      console.error('Error determining interview end:', error);
      return { shouldEnd: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }

  /**
   * Start new interview session
   */
  async startInterview(sessionId, userConfig, candidateId, onGreetingChunk = null) {
    try {
      console.log(`🚀 [Service] Starting interview session: ${sessionId} for candidate: ${candidateId}`);

      // Check Redis connection status before proceeding
      console.log('🔍 [Service] Checking Redis connection status...');
      console.log('📊 [Service] Redis state:', {
        isConnected: this.sessionManager.isConnected,
        isReady: this.sessionManager.isReady(),
        clientExists: !!this.sessionManager.client
      });

      if (!this.sessionManager.isConnected || !this.sessionManager.client) {
        console.error('❌ [Service] Redis is NOT connected - Cannot start interview');
        throw new Error('Redis connection not available. Please ensure Redis is running.');
      }

      // Create intelligent configuration
      const config = configManager.createIntelligentConfig(userConfig);
      configManager.validateConfig(config);
      console.log('✅ [Service] Config validated');

      // Create session in Redis with time tracking and quality counters
      console.log('💾 [Service] Calling createSession...');
      const session = await this.sessionManager.createSession(sessionId, config, candidateId);
      console.log('✅ [Service] Session created in Redis');

      // Fetch full job description from Post model and cache in session
      let jobDescription = null;
      try {
        const jobId = userConfig.context?.jobId || userConfig.jobId;
        if (jobId) {
          const post = await Post.findById(jobId)
            .populate({ path: 'user', populate: { path: 'profile', select: 'companyDetails' } });
          if (post?.jobDetails) {
            const companyName = post.user?.profile?.companyDetails?.name || config.context.targetCompany || 'the company';
            jobDescription = {
              title: post.jobDetails?.title || config.context.targetRole,
              companyName: companyName,
              description: post.jobDetails.description,
              requirements: post.jobDetails.requirements || [],
              responsibilities: post.jobDetails.responsibilities || []
            };
            // Propagate real company name to all downstream uses (greeting, prompts, result)
            config.context.targetCompany = companyName;
            console.log(`✅ [Service] Full JD loaded: ${jobDescription.title} at ${companyName} (${jobDescription.requirements.length} requirements, ${jobDescription.responsibilities.length} responsibilities)`);

            // Index JD for RAG (runs once, skips if already indexed)
            ragService.indexJobDescription(jobId, jobDescription).catch(err =>
              console.warn('⚠️ [RAG] JD indexing failed (non-blocking):', err.message)
            );
          }
        }
      } catch (jdError) {
        console.warn('⚠️ [Service] Failed to load JD from DB:', jdError.message);
      }

      // Fallback: load JD from config context (sent by getJobInterviewConfig endpoint)
      if (!jobDescription && userConfig.context?.jobDescription) {
        jobDescription = {
          title: userConfig.context.targetRole || 'Position',
          companyName: userConfig.context.targetCompany || 'the company',
          description: userConfig.context.jobDescription,
          requirements: Array.isArray(userConfig.context.requirements)
            ? userConfig.context.requirements
            : [],
          responsibilities: Array.isArray(userConfig.context.responsibilities)
            ? userConfig.context.responsibilities
            : []
        };
        console.log(`✅ [Service] JD loaded from config context: ${jobDescription.title} at ${jobDescription.companyName}`);
      }

      // Build agent persona from JD (ONE LLM call — sets evaluation framework + ideal candidate)
      let agentPersona = null;
      if (jobDescription) {
        try {
          agentPersona = await this.buildAgentPersona(jobDescription, config);
          await this.sessionManager.updateSession(sessionId, { agentPersona });

          // Override coverage areas with evaluation framework from persona
          const frameworkAreas = {};
          for (const [area, areaConfig] of Object.entries(agentPersona.evaluationFramework.focusAreas)) {
            frameworkAreas[area] = {
              percentage: 0,
              weight: areaConfig.weight,
              questionsAsked: 0,
              completed: false,
              indicators: [],
              description: areaConfig.description,
            };
          }
          await this.sessionManager.updateCoverage(sessionId, {
            overall: 0,
            areas: frameworkAreas,
            completedAreas: [],
            lastUpdated: new Date().toISOString()
          });
          console.log(`✅ [Service] Persona-driven coverage initialized: ${Object.keys(frameworkAreas).length} areas from ${agentPersona.jobCategory} framework`);

          // Sync intelligenceContext.focusAreas with persona-driven areas (so analysis prompts use JD-specific areas)
          const syncedFocusAreas = Object.entries(agentPersona.evaluationFramework.focusAreas).map(
            ([area, cfg]) => ({
              area,
              weight: (cfg.weight || 25) / 100,
              indicators: cfg.indicators || [],
              depth: cfg.description || ""
            })
          );
          config.intelligenceContext.focusAreas = syncedFocusAreas;
          await this.sessionManager.updateSession(sessionId, { config });
          console.log(`🔄 [Service] intelligenceContext.focusAreas synced: ${syncedFocusAreas.map(a => a.area).join(', ')}`);

          // Build JD skills checklist for tracking question coverage
          const jdSkillsChecklist = [
            ...(agentPersona.idealCandidate?.mustHaveSkills || []),
            ...(agentPersona.idealCandidate?.niceToHaveSkills || [])
          ].map(skill => ({ skill, asked: false, covered: false }));
          await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist });
          console.log(`📋 [Service] JD skills checklist initialized: ${jdSkillsChecklist.length} skills to track`);

        } catch (personaError) {
          console.warn('⚠️ [Service] Persona building failed (non-blocking):', personaError.message);
        }
      }

      // Initialize candidate profile for adaptive behavior
      await this.sessionManager.updateSession(sessionId, {
        candidateProfile: {
          communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
          revealedExpertise: [],
          revealedGaps: [],
          mentionedProjects: [],
          anchors: [],
          currentDifficulty: "intermediate",
          responseQualities: [],
        }
      });

      // Initialize interview timing and quality tracking
      // Re-fetch session to get updated coverage (may have been overridden by persona)
      const updatedSessionForTiming = await this.sessionManager.getSession(sessionId);
      const coverageAreas = Object.keys(updatedSessionForTiming.coverage?.areas || {});
      const totalMinutes = config.sessionSettings?.duration || 30;
      const maxDurationMinutes = Math.ceil(totalMinutes * 1.5); // 30 → 45
      const timeBudgetPerAreaMs = coverageAreas.length > 0
        ? (totalMinutes * 60 * 1000) / coverageAreas.length
        : totalMinutes * 60 * 1000;

      await this.sessionManager.updateSession(sessionId, {
        interviewStartTime: Date.now(),
        targetDurationMinutes: totalMinutes,     // target duration (e.g., 30 min)
        maxDurationMinutes: maxDurationMinutes,   // hard cap (e.g., 45 min)
        timeBudgetPerAreaMs,
        coverageAreaCount: coverageAreas.length,
        jobDescription,
        qualityTracking: {
          consecutiveBadAnswers: 0,
          consecutiveGoodAnswers: 0,
          totalBadAnswers: 0,
          totalGoodAnswers: 0,
          lastQualityScore: null
        }
      });
      console.log(`✅ [Service] Interview timing: target ${totalMinutes}min, max ${maxDurationMinutes}min, ${Math.round(timeBudgetPerAreaMs/1000)}s per area (${coverageAreas.length} areas)`);

      // Generate intelligent greeting with error handling
      let greeting;
      try {
        console.log('🤖 Generating AI greeting...');
        greeting = await this.generateIntelligentGreeting(config, onGreetingChunk, agentPersona);
        console.log('✅ AI greeting generated');
      } catch (greetingError) {
        console.error('⚠️ AI greeting failed, using fallback:', greetingError.message);
        // Use fallback greeting immediately
        greeting = {
          content: `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`,
          metadata: { fallback: true, error: greetingError.message }
        };
      }

      // Add greeting to conversation
      console.log('💬 [Service] Adding greeting to conversation...');
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: greeting.content,
        model: config.models.fastModel,
        metadata: greeting.metadata
      });
      console.log('✅ [Service] Greeting added to conversation');

      // Save greeting as current question (simple complexity)
      await this.sessionManager.saveCurrentQuestion(sessionId, greeting.content, 'simple');
      console.log('💾 [Greeting] Saved as current question');

      // Update session status
      console.log('📊 [Service] Updating session status to active...');
      await this.sessionManager.updateSession(sessionId, { status: 'active' });
      console.log('✅ [Service] Session status updated to active');

      console.log('📤 [Service] Preparing to return result to controller...');
      console.log(`✅ [Service] Interview ${sessionId} started successfully - returning to controller`);

      const result = {
        success: true,
        sessionId,
        greeting: greeting.content,
        config: {
          interviewType: config.interviewType,
          duration: config.sessionSettings.duration,
          silenceTimeout: config.sessionSettings.silenceTimeout
        },
        jobDetails: jobDescription ? {
          title: jobDescription.title,
          companyName: jobDescription.companyName,
          description: jobDescription.description,
          requirements: jobDescription.requirements,
          responsibilities: jobDescription.responsibilities
        } : null,
        targetRole: config.context.targetRole,
        targetCompany: config.context.targetCompany
      };

      console.log('✅ [Service] Result prepared:', {
        success: result.success,
        sessionId: result.sessionId,
        greetingLength: result.greeting.length,
        configType: result.config.interviewType
      });

      return result;
    } catch (error) {
      console.error('❌ [Service] CRITICAL: Failed to start interview:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      console.error('❌ [Service] Full error object:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent greeting based on context
   */
  async generateIntelligentGreeting(config, onChunk = null, persona = null) {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const prompt = this.buildGreetingPrompt(config, persona);

        console.log(`🤖 [Greeting] Attempt ${attempt}/${maxRetries} - Generating greeting...`);

        const llmOptions = {
          systemPrompt: "You are a professional interviewer. Your task is to generate ONLY the greeting text - nothing else. Do not include labels, explanations, or formatting. Just write the natural greeting sentences.",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          maxTokens: 400,
          timeout: 30000
        };

        // Use streaming if onChunk callback is provided
        const response = onChunk
          ? await bedrock.callLLMStreaming({ ...llmOptions, onChunk })
          : await bedrock.callLLM(llmOptions);

        const processingTime = Date.now() - startTime;
        const greeting = response.content.trim();

        // Log the actual response for debugging
        console.log('✅ [Greeting] AI response received:', {
          length: greeting.length,
          preview: greeting.substring(0, 100) + (greeting.length > 100 ? '...' : ''),
          processingTime: `${processingTime}ms`
        });

        // Validate the greeting is not malformed
        if (greeting.length < 20) {
          console.error('❌ [Greeting] Response too short:', greeting);
          throw new Error(`Malformed greeting (too short): "${greeting}"`);
        }

        if (!greeting.match(/[.!?]$/)) {
          console.warn('⚠️  [Greeting] Response missing proper punctuation:', greeting);
          // Add punctuation if missing
          const fixedGreeting = greeting + '.';
          console.log('🔧 [Greeting] Fixed punctuation:', fixedGreeting);
        }

        // Check for common malformed patterns
        if (/^[a-z]\d+$/i.test(greeting) || greeting.length < 15 || !greeting.includes(' ')) {
          console.error('❌ [Greeting] Malformed response detected:', greeting);
          throw new Error(`Invalid greeting format: "${greeting}"`);
        }

        return {
          content: greeting,
          metadata: {
            model: config.models.fastModel,
            processingTime,
            prompt: "greeting_generation",
            interviewType: config.interviewType,
            attempt
          }
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ [Greeting] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type,
          model: config.models.fastModel
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`🔄 [Greeting] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('❌ [Greeting] All attempts failed, using fallback');
    console.error('❌ [Greeting] Last error:', lastError?.message);

    const fallbackGreeting = `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`;

    console.log('⚠️  [Greeting] Using fallback greeting:', fallbackGreeting);

    return {
      content: fallbackGreeting,
      metadata: {
        fallback: true,
        error: lastError?.message,
        errorCode: lastError?.code,
        attemptedModel: config.models.fastModel,
        attempts: maxRetries
      }
    };
  }

  /**
   * Process candidate response — NEW PIPELINE (target: <5s per turn)
   *
   * Step 1: combinedAnalysis()              — Nova Lite (~2-3s)
   * Step 2: updateCandidateProfile()        — Pure logic (0ms)
   * Step 3: Apply coverage updates          — Pure logic (0ms)
   * Step 4: Quality filter + termination    — Pure logic (0ms)
   * Step 5: decideQuestionStrategy()        — Pure logic (0ms)
   * Step 5.5: selectQuestionStyle()         — Pure logic (0ms)
   * Step 6: generateIntelligentQuestion()   — Nova Lite (~2-3s)
   * Step 7: Quick dedup (RAG vector)        — ~50ms
   * Step 8: Emit + background updates       — Immediate
   */
  async processCandidateResponse(sessionId, transcript, audioMetadata = {}) {
    try {
      const pipelineStart = Date.now();
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      console.log('🧠 [Pipeline] Processing candidate response...');

      // Store conversation entry (without separate AI analysis — combined analysis handles it)
      const candidateEntry = {
        type: 'candidate',
        content: transcript,
        timestamp: new Date().toISOString(),
        metadata: audioMetadata
      };
      await this.sessionManager.addConversationEntry(sessionId, candidateEntry);

      // Get last interviewer question context
      const recentInterviewerMessages = session.conversation
        .filter(entry => entry.type === 'interviewer')
        .slice(-1);
      const lastQuestion = recentInterviewerMessages[0]?.content || null;
      const targetArea = recentInterviewerMessages[0]?.metadata?.targetAreas?.[0] || null;

      // ── STEP 1: Combined Analysis (ONE Nova Lite call, ~2-3s) ──
      const step1Start = Date.now();
      const analysis = await this.combinedAnalysis(transcript, session, lastQuestion, targetArea);
      console.log(`⚡ [Step 1] Combined analysis: ${Date.now() - step1Start}ms — quality: ${analysis.quality?.score}/100, depth: ${analysis.quality?.depthLevel}`);

      // ── STEP 2: Update Candidate Profile (pure logic, ~0ms) ──
      const turnNumber = Math.floor((session.conversation?.length || 0) / 2);
      const updatedProfile = this.updateCandidateProfile(
        session.candidateProfile || null,
        analysis,
        turnNumber
      );
      await this.sessionManager.updateSession(sessionId, { candidateProfile: updatedProfile });

      // Store quality metadata on the candidate entry
      candidateEntry.metadata = {
        ...candidateEntry.metadata,
        qualityScore: analysis.quality?.score,
        answeredQuestion: analysis.quality?.answeredQuestion,
        completeness: analysis.quality?.completeness,
        depthLevel: analysis.quality?.depthLevel || 'moderate',
        targetArea
      };

      // ── STEP 3: Apply coverage updates from analysis (pure logic, ~0ms) ──
      let finalCoverage = { ...session.coverage };
      if (analysis.coverage?.areasImpacted?.length > 0) {
        for (const impact of analysis.coverage.areasImpacted) {
          if (finalCoverage.areas[impact.area]) {
            const area = finalCoverage.areas[impact.area];
            let increase = impact.increase || 0;

            // PASS/SKIP HANDLING: Candidate can't answer = gap recorded, coverage still increases
            const isPassSkip = analysis.quality?.answeredQuestion === false ||
              analysis.quality?.completeness === 'avoided';
            if (isPassSkip && increase === 0) {
              increase = 15;
              console.log(`⏭️ [Coverage] Pass/skip detected for "${impact.area}" — forcing +15% coverage (gap recorded)`);
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `Gap: candidate passed on ${impact.area}`,
                covered: true,
                evidence: ['Candidate could not answer / requested to skip'],
                quality: 0,
                aiGenerated: true,
                reasoning: 'Candidate explicitly passed or could not answer'
              });
            }

            // CODE-LEVEL BOOST: LLM returns conservative values, amplify based on answer quality
            const qualityScore = analysis.quality?.score || 50;
            const depth = analysis.quality?.depthLevel || 'surface';
            if (increase > 0 && !isPassSkip) {
              if (depth === 'deep' && qualityScore >= 70) {
                increase = Math.max(increase, 25);
              } else if (depth === 'moderate' && qualityScore >= 50) {
                increase = Math.max(increase, 18);
              } else if (qualityScore >= 40) {
                increase = Math.max(increase, 12);
              } else {
                increase = Math.max(increase, 5);
              }
            }

            area.percentage = Math.min(100, (area.percentage || 0) + increase);
            area.lastUpdated = new Date().toISOString();
            if (impact.evidence) {
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `AI-detected: ${impact.area}`,
                covered: true,
                evidence: [impact.evidence],
                quality: Math.min(10, Math.round((analysis.quality?.score || 50) / 10)),
                aiGenerated: true
              });
            }

            // Mark area completed when coverage is sufficient
            if (area.percentage >= 80 && !area.completed) {
              area.completed = true;
              console.log(`✅ [Coverage] Area "${impact.area}" marked completed at ${area.percentage}%`);
            }

            // Track explored sub-topics to prevent theme repetition
            const topicsFromResponse = (analysis.skills?.demonstrated || [])
              .concat(analysis.interestingTopics?.map(t => t.topic) || []);
            if (topicsFromResponse.length > 0) {
              area.topicsExplored = area.topicsExplored || [];
              for (const topic of topicsFromResponse) {
                if (!area.topicsExplored.includes(topic)) {
                  area.topicsExplored.push(topic);
                }
              }
            }

            // Update JD skills checklist — mark covered skills based on demonstrated
            const checklist = session.jdSkillsChecklist || [];
            const demonstratedSkills = analysis.skills?.demonstrated || [];
            for (const item of checklist) {
              if (!item.covered && demonstratedSkills.some(d => {
                const dLower = d.toLowerCase();
                const sLower = item.skill.toLowerCase();
                return dLower.includes(sLower) || sLower.includes(dLower) ||
                  sLower.split(/[\s,/]+/).some(w => w.length > 2 && dLower.includes(w)) ||
                  dLower.split(/[\s,/]+/).some(w => w.length > 2 && sLower.includes(w));
              })) {
                item.covered = true;
              }
            }

            // SCORE BONUS: Reward candidates who cover an area before time budget expires
            if (session.timeBudgetPerAreaMs && area.percentage >= 60 && !area.earlyCompletionBonus) {
              const areaStartTime = area.startTime;
              if (areaStartTime) {
                const elapsed = Date.now() - areaStartTime;
                const timeBudget = session.timeBudgetPerAreaMs;
                if (elapsed < timeBudget) {
                  const timeRemainingRatio = (timeBudget - elapsed) / timeBudget;
                  const bonus = Math.round(timeRemainingRatio * 15);
                  area.percentage = Math.min(100, area.percentage + bonus);
                  area.earlyCompletionBonus = bonus;
                  console.log(`🎁 [Score Bonus] +${bonus}% for "${impact.area}"`);
                }
              }
            }
          }
        }

        // Recalculate overall coverage
        const areaEntries = Object.values(finalCoverage.areas);
        const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
        finalCoverage.overall = totalWeight > 0
          ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
          : 0;
        finalCoverage.lastUpdated = new Date().toISOString();

        await this.sessionManager.updateCoverage(sessionId, finalCoverage);
      } else {
        // No areasImpacted from LLM — but if it's a pass/skip, still record the gap
        const isPassSkipNoAreas = analysis.quality?.answeredQuestion === false ||
          analysis.quality?.completeness === 'avoided';
        if (isPassSkipNoAreas && targetArea && finalCoverage.areas[targetArea]) {
          const area = finalCoverage.areas[targetArea];
          area.percentage = Math.min(100, (area.percentage || 0) + 15);
          area.lastUpdated = new Date().toISOString();
          area.indicators = area.indicators || [];
          area.indicators.push({
            name: `Gap: candidate passed on ${targetArea}`,
            covered: true,
            evidence: ['Candidate could not answer / requested to skip'],
            quality: 0,
            aiGenerated: true,
            reasoning: 'Candidate explicitly passed or could not answer'
          });
          console.log(`⏭️ [Coverage] Pass/skip (no areas from LLM) for "${targetArea}" — forcing +15% coverage (gap recorded)`);

          // Recalculate overall
          const areaEntries = Object.values(finalCoverage.areas);
          const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
          finalCoverage.overall = totalWeight > 0
            ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
            : 0;
          finalCoverage.lastUpdated = new Date().toISOString();
          await this.sessionManager.updateCoverage(sessionId, finalCoverage);
        }
      }

      // Save updated JD skills checklist
      if (session.jdSkillsChecklist?.length > 0) {
        await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: session.jdSkillsChecklist });
      }

      // ── STEP 4: Quality filter + termination check (pure logic, ~0ms) ──
      const qualityScore = analysis.quality?.score || 50;
      await this.updateQualityCounters(sessionId, qualityScore);

      // LOW QUALITY FILTER: If off-topic/garbage, generate from gaps only
      const isLowQuality = qualityScore < 30 || (analysis.quality?.completeness === 'avoided' && qualityScore < 50);

      // Check rule-based termination (time, consecutive bad/good, avg quality)
      const updatedSessionForEnd = { ...session, coverage: finalCoverage, qualityTracking: session.qualityTracking };
      const endCheck = await this.shouldEndInterview(updatedSessionForEnd);
      if (endCheck.shouldEnd) {
        console.log(`🛑 [Pipeline] Ending interview: ${endCheck.terminationReason}`);
        return {
          action: 'end_interview',
          content: endCheck.message || 'Thank you for your time. This concludes our interview.',
          reasoning: endCheck.reason || endCheck.reasoning,
          metadata: { terminationReason: endCheck.terminationReason, score: endCheck.score }
        };
      }

      // AI-suggested termination from combined analysis (only trusted after 6+ turns)
      const turnCount = Math.floor((session.conversation?.length || 0) / 2);
      if (analysis.shouldEnd?.shouldEnd && turnCount >= 6) {
        console.log(`🛑 [Pipeline] AI suggests ending at turn ${turnCount}: ${analysis.shouldEnd.reason}`);
        return {
          action: 'end_interview',
          content: 'Thank you for your time. This concludes our interview.',
          reasoning: analysis.shouldEnd.reason,
          metadata: { terminationReason: 'ai_determined', score: 'ai' }
        };
      } else if (analysis.shouldEnd?.shouldEnd && turnCount < 6) {
        console.log(`⚠️ [Pipeline] LLM suggested ending at turn ${turnCount} — IGNORED (min 6 turns required)`);
      }

      if (isLowQuality) {
        console.log(`🚫 [Pipeline] Low quality (${qualityScore}) — generating from gaps only`);
      }

      // ── STEP 5: Decide question strategy (pure logic, ~0ms) ──
      const finalSession = { ...session, coverage: finalCoverage, candidateProfile: updatedProfile, currentFocusArea: targetArea };
      const strategy = this.decideQuestionStrategy(analysis, updatedProfile, finalCoverage, finalSession);
      console.log(`🎯 [Step 5] Strategy: ${strategy.mode} → ${strategy.targetArea} (${strategy.context})`);

      // ── STEP 5.5: Select question style (pure logic, ~0ms) ──
      const questionStyle = this.selectQuestionStyle(finalSession, analysis, strategy);
      console.log(`🎨 [Step 5.5] Style: ${questionStyle.id} | Strategy: ${strategy.mode} → ${strategy.targetArea}`);

      // ── STEP 5.7: Retrieve RAG context from JD (async, ~100ms) ──
      let ragContext = '';
      try {
        const jobId = session.jobDescription?._id || session.config?.jobId;
        if (jobId) {
          const rag = await ragService.retrieveContext(jobId, sessionId, transcript);
          ragContext = rag.jdContext || '';
          if (ragContext) {
            console.log(`📚 [Step 5.7] RAG context retrieved: ${ragContext.length} chars`);
          }
        }
      } catch (ragErr) {
        console.warn('⚠️ [Step 5.7] RAG context retrieval failed (non-blocking):', ragErr.message);
      }
      finalSession.ragContext = ragContext;

      // ── STEP 6: Generate question with strategy + style context (Nova Lite, ~2-3s) ──
      const step6Start = Date.now();

      // Build a lightweight coverage analysis object for question generator
      const coverageForQGen = {
        overallAssessment: {
          weakestAreas: Object.entries(finalCoverage.areas)
            .filter(([_, d]) => d.percentage < 50)
            .sort((a, b) => a[1].percentage - b[1].percentage)
            .map(([a]) => a),
          strongestAreas: Object.entries(finalCoverage.areas)
            .filter(([_, d]) => d.percentage >= 60)
            .map(([a]) => a)
        }
      };

      const proposedQuestion = await AIUtils.withTimeout(
        this.questionAI.generateIntelligentQuestion(
          finalSession,
          coverageForQGen,
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer').slice(-5) },
          strategy,       // Pass strategy for adaptive prompting
          questionStyle   // Pass style for diverse question phrasing
        ),
        15000,
        'generateIntelligentQuestion'
      ).catch(err => {
        console.warn('⚠️ Question generation failed, using fallback:', err.message);
        const areaLabel = strategy.targetArea?.replace(/_/g, ' ') || 'your background';
        const fallbackQuestions = {
          bridge: `Can you tell me more about how your experience relates to ${areaLabel}?`,
          probe: `Could you walk me through a specific example related to ${areaLabel}?`,
          transition: `Let's shift gears — can you share your experience with ${areaLabel}?`,
          validate: `How would you rate your confidence in ${areaLabel}?`
        };
        return {
          question: fallbackQuestions[strategy.mode] || 'Can you tell me about a challenging project you worked on recently?',
          targetAreas: [strategy.targetArea || 'General'],
          reasoning: 'Fallback question due to AI timeout',
          fallback: true
        };
      });

      console.log(`⚡ [Step 6] Question generated: ${Date.now() - step6Start}ms`);

      // ── STEP 7: Quick dedup via RAG vector search (~50ms) ──
      let finalQuestion = proposedQuestion;
      try {
        const similarityCheck = await AIUtils.withTimeout(
          this.memoryAI.analyzeQuestionSimilarity(proposedQuestion.question, finalSession.conversation, sessionId),
          8000,
          'analyzeQuestionSimilarity'
        );

        if (similarityCheck.isSimilar && similarityCheck.confidence > 70) {
          console.log('🔄 [Step 7] Similar question detected — regenerating once');
          try {
            const altQuestion = await this.questionAI.generateTargetedQuestionForArea(
              strategy.targetArea,
              finalCoverage.areas[strategy.targetArea] || {},
              finalSession.conversation,
              finalSession.config.context
            );
            finalQuestion = { ...altQuestion, targetAreas: [strategy.targetArea] };
          } catch (altErr) {
            console.warn('⚠️ Alt question failed, using original:', altErr.message);
          }
        }
      } catch (simError) {
        console.warn('⚠️ Dedup check failed, proceeding:', simError.message);
      }

      // ── STEP 8: Store question + background updates ──
      const questionContent = finalQuestion.question || finalQuestion.content;
      const questionTargetAreas = finalQuestion.targetAreas || [strategy.targetArea];

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: questionContent,
        timestamp: new Date().toISOString(),
        metadata: {
          aiGenerated: true,
          targetAreas: questionTargetAreas,
          reasoning: finalQuestion.reasoning,
          strategy: strategy.mode,
          questionStyle: questionStyle.id,
          ignoredPreviousResponse: isLowQuality
        }
      });

      // Track question style history for rotation (capped at 10)
      const currentStyleHistory = finalSession.questionStyleHistory || [];
      currentStyleHistory.push(questionStyle.id);
      await this.sessionManager.updateSession(sessionId, {
        questionStyleHistory: currentStyleHistory.slice(-10)
      });

      // Track area and question count
      if (strategy.targetArea && finalCoverage.areas[strategy.targetArea]) {
        await this.incrementAreaQuestionCount(sessionId, strategy.targetArea);
        await this.sessionManager.setAreaStartTime(sessionId, strategy.targetArea);
        await this.sessionManager.updateSession(sessionId, { currentFocusArea: strategy.targetArea });
      }

      // Mark JD skills as "asked" based on question content
      const skillChecklist = finalSession.jdSkillsChecklist || [];
      if (skillChecklist.length > 0) {
        const questionLower = questionContent.toLowerCase();
        for (const item of skillChecklist) {
          if (!item.asked) {
            const sLower = item.skill.toLowerCase();
            if (questionLower.includes(sLower) ||
              sLower.split(/[\s,/]+/).some(w => w.length > 2 && questionLower.includes(w))) {
              item.asked = true;
            }
          }
        }
        await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: skillChecklist });
      }

      // Detect complexity for silence handling
      const complexity = await this.detectQuestionComplexity(questionContent);
      await this.sessionManager.saveCurrentQuestion(sessionId, questionContent, complexity);

      // Fire-and-forget: index question in RAG + update report
      ragService.indexAskedQuestion(sessionId, questionContent).catch(err =>
        console.warn('⚠️ [RAG] Question indexing failed (non-blocking):', err.message)
      );

      const coverageAnalysisForReport = {
        overallAssessment: coverageForQGen.overallAssessment,
        coverageUpdates: analysis.coverage?.areasImpacted || []
      };
      this.updateRealTimeReportIntelligently(finalSession, transcript, coverageAnalysisForReport, { decision: strategy.mode, targetArea: strategy.targetArea })
        .then(reportUpdate => this.sessionManager.updateRealTimeReport(sessionId, reportUpdate))
        .catch(err => console.warn('⚠️ [Report] Background update failed:', err.message));

      const totalTime = Date.now() - pipelineStart;
      console.log(`✅ [Pipeline] Complete in ${totalTime}ms (target: <5000ms) — strategy: ${strategy.mode}, quality: ${qualityScore}/100`);

      return {
        action: strategy.mode === 'validate' ? 'wrap_up_area' : 'continue_probing',
        content: questionContent,
        reasoning: finalQuestion.reasoning,
        targetArea: strategy.targetArea,
        confidence: analysis.quality?.score || 50,
        coverageUpdate: coverageForQGen.overallAssessment,
        metadata: {
          strategy: strategy.mode,
          questionStyle: questionStyle.id,
          pipelineTimeMs: totalTime,
          qualityScore,
          coverageAnalysis: coverageForQGen.overallAssessment,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Failed to process candidate response:', error);
      throw error;
    }
  }

  /**
   * Make intelligent decision for next interviewer action
   */
  async makeIntelligentDecision(session, candidateResponse) {
    try {
      const startTime = Date.now();
      const config = session.config;

      const prompt = this.buildDecisionPrompt(session, candidateResponse);

      const response = await bedrock.callLLM({
        systemPrompt: this.getDecisionSystemPrompt(config),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        maxTokens: 800,
        timeout: 30000,
        useFastModel: true
      });

      const processingTime = Date.now() - startTime;
      const decisionContent = response.content.trim();

      // Parse AI decision (expecting JSON format)
      let decision;
      try {
        decision = JSON.parse(decisionContent);
      } catch (parseError) {
        // Fallback if AI doesn't return valid JSON
        decision = {
          action: "question",
          content: decisionContent,
          reasoning: "AI provided unstructured response",
          nextFocus: "continue_current_area"
        };
      }

      // Add metadata
      decision.metadata = {
        model: config.models.thinkingModel,
        processingTime,
        timestamp: new Date().toISOString()
      };

      // Add decision to conversation if it's a question
      if (decision.action === "question") {
        await this.sessionManager.addConversationEntry(session.sessionId, {
          type: 'interviewer',
          content: decision.content,
          model: config.models.thinkingModel,
          metadata: decision.metadata
        });
      }

      return decision;
    } catch (error) {
      console.error('❌ Failed to make intelligent decision:', error.message);
      // Fallback decision
      return {
        action: "question",
        content: "That's interesting. Can you tell me more about that experience?",
        reasoning: "Fallback question due to AI processing error",
        nextFocus: "continue_current_area",
        metadata: { fallback: true }
      };
    }
  }

  /**
   * Analyze coverage intelligently
   */
  async analyzeCoverage(session, candidateResponse) {
    try {
      const config = session.config;
      const focusAreas = config.intelligenceContext.focusAreas;

      const prompt = `
        Analyze this candidate response for coverage of our focus areas:

        Focus Areas: ${JSON.stringify(focusAreas)}
        Current Coverage: ${JSON.stringify(session.coverage)}
        Latest Response: "${candidateResponse}"

        For each focus area, determine:
        1. Does this response provide evidence for any indicators?
        2. What percentage coverage increase should we assign?
        3. Quality of evidence (1-10 scale)
        4. Specific indicators that were addressed

        Return JSON format with coverage updates.
      `;

      const response = await bedrock.callLLM({
        systemPrompt: "You are an expert interview analyst. Analyze responses for evidence of competencies and skills. Return structured JSON data.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true
      });

      const analysisContent = response.content.trim();

      let coverageAnalysis;
      try {
        coverageAnalysis = JSON.parse(analysisContent);
      } catch (parseError) {
        // Fallback coverage analysis
        coverageAnalysis = this.generateFallbackCoverage(candidateResponse, focusAreas);
      }

      // Calculate overall coverage
      const areas = session.coverage.areas;
      const totalWeight = focusAreas.reduce((sum, area) => sum + area.weight, 0);
      let weightedCoverage = 0;

      Object.keys(areas).forEach(areaKey => {
        const area = areas[areaKey];
        if (coverageAnalysis[areaKey]) {
          area.percentage = Math.min(100, area.percentage + coverageAnalysis[areaKey].increase);
          area.lastEvidence = candidateResponse;
          area.lastUpdated = new Date().toISOString();
        }
        weightedCoverage += (area.percentage / 100) * area.weight;
      });

      const overallCoverage = Math.round((weightedCoverage / totalWeight) * 100);

      return {
        overall: overallCoverage,
        areas,
        lastUpdated: new Date().toISOString(),
        analysisMetadata: {
          model: config.models.thinkingModel,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Failed to analyze coverage:', error.message);
      return session.coverage; // Return existing coverage on error
    }
  }

  /**
   * Update candidate behavior analysis
   */
  async updateCandidateBehavior(sessionId, transcript, audioMetadata) {
    try {
      const responseLength = transcript.length;
      const timestamp = new Date().toISOString();

      const behaviorUpdate = {
        responseLength: responseLength,
        lastResponseTime: timestamp,
        communicationStyle: this.analyzeCommunicationStyle(transcript),
        engagement: this.analyzeEngagement(transcript, audioMetadata)
      };

      await this.sessionManager.updateCandidateBehavior(sessionId, {
        responseLength: [responseLength],
        lastAnalysis: behaviorUpdate,
        lastUpdated: timestamp
      });
    } catch (error) {
      console.error('❌ Failed to update candidate behavior:', error.message);
    }
  }

  /**
   * Update real-time report
   */
  async updateRealTimeReport(session, candidateResponse, decision) {
    try {
      const config = session.config;

      const prompt = `
        Update the real-time interview report based on this exchange:

        Current Report: ${JSON.stringify(session.realTimeReport)}
        Latest Response: "${candidateResponse}"
        Interview Decision: ${JSON.stringify(decision)}
        Coverage: ${JSON.stringify(session.coverage)}

        Provide:
        1. Updated strengths list
        2. Updated weaknesses list
        3. New recommendations
        4. Updated scores for each criteria
        5. Overall progress assessment

        Return JSON format.
      `;

      const response = await bedrock.callLLM({
        systemPrompt: "You are an expert interview evaluator. Provide constructive, actionable feedback in real-time. Be specific and evidence-based.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        maxTokens: 800,
        timeout: 30000,
        useFastModel: true
      });

      const reportContent = response.content.trim();

      let reportUpdate;
      try {
        reportUpdate = JSON.parse(reportContent);
      } catch (parseError) {
        // Fallback report update
        reportUpdate = {
          strengths: session.realTimeReport.strengths || [],
          weaknesses: session.realTimeReport.weaknesses || [],
          recommendations: session.realTimeReport.recommendations || [],
          scores: session.realTimeReport.scores || {},
          overallProgress: session.coverage.overall || 0
        };
      }

      return {
        ...reportUpdate,
        lastUpdated: new Date().toISOString(),
        metadata: {
          model: config.models.analysisModel,
          updateTrigger: 'candidate_response'
        }
      };
    } catch (error) {
      console.error('❌ Failed to update real-time report:', error.message);
      return session.realTimeReport;
    }
  }

  /**
   * Handle silence detection - SIMPLIFIED VERSION
   * Only acts on extended silence (15s+) to move to next question
   * NO encouragement messages, NO patience prompts
   */
  async handleSilence(sessionId, silenceDuration) {
    try {
      console.log(`🔇 [Silence] Detected ${silenceDuration}s of silence`);

      // IGNORE short pauses - let candidate think naturally
      if (silenceDuration < 20) {
        console.log(`✓ [Silence] Ignoring short pause (< 20s)`);
        return {
          action: 'ignore',
          content: null,
          reasoning: 'Short pause - allowing natural thinking time'
        };
      }

      // Extended silence (20s+) - Move to next question automatically
      console.log(`⏭️  [Silence] Extended silence (${silenceDuration}s) - generating next question`);

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Get updated session for coverage analysis
      const updatedSession = await this.sessionManager.getSession(sessionId);

      // Perform coverage analysis to determine next question
      const coverageAnalysis = await this.coverageAI.analyzeCoverageIntelligently(
        "[SILENCE - NO RESPONSE]",
        updatedSession.coverage,
        updatedSession.config.intelligenceContext.focusAreas,
        updatedSession.conversation
      );

      // Make decision for next area
      const decisionAnalysis = await this.decisionAI.makeIntelligentDecision(
        updatedSession,
        "[EXTENDED SILENCE]",
        { coverage: coverageAnalysis }
      );

      // Generate next question
      const nextQuestion = await this.questionAI.generateIntelligentQuestion(
        updatedSession,
        coverageAnalysis,
        { previousQuestions: updatedSession.conversation.filter(e => e.type === 'interviewer') }
      );

      // Store the new question
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: nextQuestion.question,
        timestamp: new Date().toISOString(),
        metadata: {
          aiGenerated: true,
          targetAreas: nextQuestion.targetAreas,
          reasoning: 'Extended silence - moving forward',
          silenceDuration: silenceDuration
        }
      });

      console.log(`✅ [Silence] Moving to next question: "${nextQuestion.question.substring(0, 60)}..."`);

      return {
        action: 'next_question',
        content: nextQuestion.question,
        reasoning: `Extended silence (${silenceDuration}s) - automatically moving forward`,
        targetAreas: nextQuestion.targetAreas,
        silenceDuration
      };

    } catch (error) {
      console.error('❌ [Silence] Failed to handle silence:', error.message);

      // Fallback: just move forward with generic question
      return {
        action: 'next_question',
        content: "Let's move on to the next topic. Can you tell me about your experience with problem-solving?",
        reasoning: 'Silence handling failed - using fallback',
        error: error.message
      };
    }
  }

  /**
   * Generate intelligent silence prompt
   */
  async generateSilencePrompt(session, silenceData) {
    const maxRetries = 2;
    let lastError = null;

    // Extract recent context without large JSON
    const recentMessages = session.conversation.slice(-3).map(entry =>
      `${entry.type === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${entry.content?.substring(0, 100) || '[no content]'}`
    ).join('\n');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const config = session.config;

        const prompt = `Generate a supportive, encouraging message for a candidate who has been silent for ${silenceData.silenceDuration} seconds during an interview.

CONTEXT:
- This is silence instance #${silenceData.silenceCount}
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Interview Type: ${config.interviewType}

RECENT CONVERSATION:
${recentMessages}

REQUIREMENTS:
- Write 1-2 natural, encouraging sentences
- Be warm and supportive, not pushy
- Help the candidate feel comfortable to continue
- DO NOT use labels, bullet points, or explanations
- ONLY output the encouraging text itself

Example: "Take your time - there's no rush. Would you like me to rephrase the question in a different way?"`;

        console.log(`🔇 [Silence] Attempt ${attempt}/${maxRetries} - Generating silence prompt...`);

        const response = await bedrock.callLLM({
          systemPrompt: "You are a supportive interviewer. Your task is to generate ONLY the encouraging text - nothing else. Be empathetic and natural.",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          maxTokens: 300,
          timeout: 30000,
          useFastModel: true
        });

        const silencePrompt = response.content.trim();

        // Log the response for debugging
        console.log('✅ [Silence] AI response received:', {
          length: silencePrompt.length,
          preview: silencePrompt.substring(0, 80) + (silencePrompt.length > 80 ? '...' : ''),
          silenceCount: silenceData.silenceCount
        });

        // Validate the silence prompt is not malformed
        if (silencePrompt.length < 15) {
          console.error('❌ [Silence] Response too short:', silencePrompt);
          throw new Error(`Malformed silence prompt (too short): "${silencePrompt}"`);
        }

        // Check for common malformed patterns (like "s1", "safe", etc.)
        if (/^[a-z]+\d*$/i.test(silencePrompt) || !silencePrompt.includes(' ')) {
          console.error('❌ [Silence] Malformed response detected:', silencePrompt);
          throw new Error(`Invalid silence prompt format: "${silencePrompt}"`);
        }

        return {
          content: silencePrompt,
          metadata: {
            model: config.models.fastModel,
            silenceCount: silenceData.silenceCount,
            silenceDuration: silenceData.silenceDuration,
            type: 'silence_prompt',
            attempt
          }
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ [Silence] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          silenceCount: silenceData.silenceCount
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`🔄 [Silence] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('❌ [Silence] All attempts failed, using fallback');
    console.error('❌ [Silence] Last error:', lastError?.message);

    const fallbacks = [
      "Take your time to think about it. I'm here when you're ready to continue.",
      "No rush at all. Would you like me to rephrase the question?",
      "Feel free to take a moment to gather your thoughts. How would you like to approach this?"
    ];

    const fallbackMessage = fallbacks[silenceData.silenceCount % fallbacks.length];
    console.log('⚠️  [Silence] Using fallback:', fallbackMessage);

    return {
      content: fallbackMessage,
      metadata: {
        fallback: true,
        silenceCount: silenceData.silenceCount,
        error: lastError?.message,
        attempts: maxRetries
      }
    };
  }

  /**
   * Detect question complexity using AI
   */
  async detectQuestionComplexity(questionText) {
    try {
      const systemPrompt = `Analyze this interview question and determine its complexity level.

COMPLEXITY LEVELS:
- simple: Yes/no questions, basic factual questions, straightforward queries (1 sentence)
- medium: Standard behavioral/situational questions requiring examples (2-3 sentences)
- complex: Multi-part questions, technical deep-dives, requiring detailed analysis (3+ sentences)

RESPONSE FORMAT (JSON only):
{
  "complexity": "simple|medium|complex",
  "reasoning": "brief explanation",
  "estimatedThinkingTime": number (in seconds)
}`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Analyze this question: "${questionText}"` }],
        temperature: 0.2,
        maxTokens: 200,
        timeout: 30000,
        useFastModel: true
      });

      const parsed = AIUtils.parseJSONResponse(response.content, 'detectQuestionComplexity');

      console.log(`🔍 [Complexity] Detected:`, {
        complexity: parsed.complexity,
        estimatedThinkingTime: parsed.estimatedThinkingTime
      });

      return parsed.complexity || 'medium';
    } catch (error) {
      console.error('❌ Error detecting question complexity:', error.message);
      return 'medium'; // Default to medium if detection fails
    }
  }

  /**
   * REMOVED: No patience prompts for MVP - using manual "Next" button only
   */
  async generatePatiencePrompt(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion || 'the question';

      const systemPrompt = `Generate a brief, warm encouragement for a candidate who has been silent for ${silenceData.silenceDuration} seconds.

REQUIREMENTS:
- Write 1 short, natural sentence
- Be patient and supportive, NOT pushy
- Signal that thinking time is okay
- DO NOT offer to rephrase or help yet - just encouragement
- ONLY output the encouragement text itself

Examples:
- "Take your time to think through this."
- "No rush - I'm listening."
- "Whenever you're ready."`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Generate patience prompt for: "${currentQuestion.substring(0, 100)}..."` }],
        temperature: 0.7,
        maxTokens: 100,
        timeout: 30000,
        useFastModel: true
      });

      const patiencePrompt = response.content.trim();

      // Validation
      if (patiencePrompt.length < 10 || /^[a-z]+\d*$/i.test(patiencePrompt)) {
        throw new Error('Malformed patience prompt');
      }

      console.log(`✅ [Patience] Generated prompt:`, patiencePrompt);

      return {
        content: patiencePrompt,
        metadata: { silenceStage: 1, type: 'patience_prompt' }
      };
    } catch (error) {
      console.error('❌ Error generating patience prompt:', error.message);
      // AI-like fallback (varied responses)
      const fallbacks = [
        "Take your time - there's no rush to answer.",
        "I'm here when you're ready to share your thoughts.",
        "Feel free to take a moment to think about this."
      ];
      return {
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        metadata: { silenceStage: 1, type: 'patience_prompt', fallback: true }
      };
    }
  }

  /**
   * REMOVED: No help offers for MVP - using manual "Next" button only
   */
   async generateHelpOffer(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion || 'the question';

      const systemPrompt = `Generate a supportive offer to help a candidate who has been silent for ${silenceData.silenceDuration} seconds.

REQUIREMENTS:
- Write 1-2 natural sentences
- Offer to rephrase or clarify
- Be supportive and professional
- Suggest specific ways to help
- ONLY output the help offer text itself

Examples:
- "Would it help if I rephrased the question?"
- "Can I break this into smaller parts for you?"
- "Would you like me to provide a specific example?"`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Generate help offer for: "${currentQuestion.substring(0, 100)}..."` }],
        temperature: 0.7,
        maxTokens: 150,
        timeout: 30000,
        useFastModel: true
      });

      const helpOffer = response.content.trim();

      // Validation
      if (helpOffer.length < 15 || /^[a-z]+\d*$/i.test(helpOffer)) {
        throw new Error('Malformed help offer');
      }

      console.log(`✅ [HelpOffer] Generated:`, helpOffer);

      return {
        content: helpOffer,
        metadata: { silenceStage: 2, type: 'help_offer' }
      };
    } catch (error) {
      console.error('❌ Error generating help offer:', error.message);
      const fallbacks = [
        "Would you like me to rephrase the question in a different way?",
        "Can I break this down into smaller, more specific questions?",
        "Would it help if I provided an example of what I'm looking for?"
      ];
      return {
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        metadata: { silenceStage: 2, type: 'help_offer', fallback: true }
      };
    }
  }

  /**
   * REMOVED: No question rephrasing for MVP - using manual "Next" button only
   */
   async rephraseCurrentQuestion(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion;

      if (!currentQuestion) {
        throw new Error('No current question to rephrase');
      }

      const recentContext = session.conversation.slice(-3).map(entry =>
        `${entry.type}: ${entry.content?.substring(0, 100)}`
      ).join('\n');

      const systemPrompt = `Rephrase this interview question to make it clearer and easier to answer.

REQUIREMENTS:
- SAME intent and topic as original question
- Simpler, clearer wording
- Can break into 2-3 smaller sub-questions if helpful
- More concrete and specific
- Natural and conversational
- ONLY output the rephrased question(s) - no explanations

APPROACH OPTIONS:
1. Simpler wording of same question
2. Break into sequential sub-questions
3. Add scaffolding example then ask`;

      const userPrompt = `ORIGINAL QUESTION: "${currentQuestion}"

CONTEXT:
- Candidate has been silent for ${silenceData.silenceDuration} seconds
- This is silence #${silenceData.silenceCount}
- Interview Type: ${session.config.interviewType}
- Position: ${session.config.context.targetRole}

RECENT CONVERSATION:
${recentContext}

Rephrase this question to help the candidate answer it.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.6,
        maxTokens: 400,
        timeout: 30000,
        useFastModel: true
      });

      const rephrasedQuestion = response.content.trim();

      // Validation
      if (rephrasedQuestion.length < 20 || /^[a-z]+\d*$/i.test(rephrasedQuestion)) {
        throw new Error('Malformed rephrased question');
      }

      console.log(`✅ [Rephrase] Generated rephrased question`);

      // Save rephrase to history
      const rephraseHistory = session.currentQuestionContext.rephraseHistory || [];
      rephraseHistory.push({
        original: currentQuestion,
        rephrased: rephrasedQuestion,
        timestamp: Date.now()
      });

      await this.sessionManager.updateSession(session.sessionId, {
        'currentQuestionContext.hasBeenRephrased': true,
        'currentQuestionContext.rephraseHistory': rephraseHistory
      });

      return {
        content: rephrasedQuestion,
        metadata: {
          silenceStage: 3,
          type: 'rephrased_question',
          originalQuestion: currentQuestion
        }
      };
    } catch (error) {
      console.error('❌ Error rephrasing question:', error.message);
      // Generate simpler version if rephrasing fails
      return {
        content: "Let me ask this more simply: Can you share any relevant experience you have with this?",
        metadata: { silenceStage: 3, type: 'rephrased_question', fallback: true }
      };
    }
  }

  /**
   * End interview and generate final report
   */
  async endInterview(sessionId) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Generate comprehensive final report
      const finalReport = await this.generateFinalReport(session);

      // End session in Redis
      await this.sessionManager.endSession(sessionId, finalReport);

      return {
        success: true,
        finalReport,
        sessionAnalytics: await this.sessionManager.getSessionAnalytics(sessionId)
      };
    } catch (error) {
      console.error('❌ Failed to end interview:', error.message);
      throw error;
    }
  }

  /**
   * Helper method to build greeting prompt
   */
  buildGreetingPrompt(config, persona = null) {
    // Extract only the essential information, avoid large JSON objects
    const interviewerStyle = config.interviewerPersona?.style || 'professional';
    const interviewerTone = persona?.agentBehavior?.tone || config.interviewerPersona?.tone || 'friendly';
    const cultureTrait = config.companyProfile?.culture?.values?.[0] || 'innovation';

    // Build persona-specific context for the greeting
    let personaContext = '';
    if (persona?.idealCandidate) {
      const domainTopics = persona.agentBehavior?.domainTopics?.slice(0, 3).join(', ') || '';
      const mustHaves = persona.idealCandidate?.mustHaveSkills?.slice(0, 3).join(', ') || '';
      personaContext = `
JOB-SPECIFIC CONTEXT (use to make greeting relevant):
- Job Category: ${persona.jobCategory}
- Key Skills to Explore: ${mustHaves}
- Domain Topics: ${domainTopics}
- Tone: ${persona.agentBehavior?.tone || 'professional'}
- Seniority: ${persona.idealCandidate?.seniorityExpectations || 'standard'}`;
    }

    // INTERVIEW TYPE SPECIFIC FOCUS
    let interviewFocus = '';
    let exampleGreeting = '';

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

    } else if (config.interviewType === 'HR_INTERVIEW') {
      interviewFocus = `This is a BEHAVIORAL and CULTURAL FIT interview focusing on soft skills, teamwork, and alignment with company values.`;
      exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's have a great conversation about your experience and how you can contribute to our team."`;

    } else if (config.interviewType === 'SOFT_SKILL') {
      interviewFocus = `This is a SOFT SKILLS and COMMUNICATION assessment focusing on interpersonal abilities, emotional intelligence, and collaboration.`;
      exampleGreeting = `"Hello! Today we'll be discussing your communication style and collaboration experiences. I'm looking forward to understanding how you work with others and handle various workplace scenarios."`;

    } else {
      interviewFocus = `Standard professional interview.`;
      exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position. Let's have a great conversation."`;
    }

    return `Generate a warm, professional greeting for this ${config.interviewType} interview:

INTERVIEW TYPE & FOCUS:
${interviewFocus}
${personaContext}

INTERVIEW CONTEXT:
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Candidate Experience Level: ${config.context.experienceLevel}
- Interview Style: ${interviewerStyle}, ${interviewerTone}
- Company Values: ${cultureTrait}

REQUIREMENTS:
- Write 2-3 natural, conversational sentences
- Welcome the candidate warmly
- Briefly mention the position and set expectations for the interview type
- If persona context is available, reference specific aspects of the role (domain, key topics)
- Set a comfortable, professional tone appropriate for ${config.interviewType}
- DO NOT use labels, bullet points, or structured format
- DO NOT include explanations or meta-text
- ONLY output the greeting text itself

Example format for ${config.interviewType}: ${exampleGreeting}`;
  }

  /**
   * Helper method to build decision prompt
   */
  buildDecisionPrompt(session, candidateResponse) {
    const recentConversation = session.conversation.slice(-5).map(msg =>
      `${msg.type}: ${msg.content}`
    ).join('\n');

    return `
      Interview Context: ${JSON.stringify(session.config.context)}
      Focus Areas: ${JSON.stringify(session.config.intelligenceContext.focusAreas)}
      Current Coverage: ${JSON.stringify(session.coverage)}
      Interviewer Style: ${JSON.stringify(session.config.interviewerPersona)}

      Recent Conversation:
      ${recentConversation}

      Latest Candidate Response: "${candidateResponse}"

      Based on this context, decide the next best action. Return JSON with:
      {
        "action": "question|probe_deeper|change_topic|wrap_up",
        "content": "the actual question or response",
        "reasoning": "why you chose this action",
        "nextFocus": "which area to focus on next",
        "adaptations": "any style adaptations needed"
      }

      Be intelligent and adaptive. Consider:
      - Coverage gaps that need attention
      - Candidate's communication style
      - Depth of current area exploration
      - Interview flow and time management
    `;
  }

  /**
   * Helper method to get decision system prompt
   */
  getDecisionSystemPrompt(config) {
    return `
      You are an intelligent ${config.interviewerPersona.experience} conducting a ${config.interviewType} interview.

      Your expertise: ${config.interviewerPersona.expertise.join(', ')}
      Your style: ${config.interviewerPersona.style}, ${config.interviewerPersona.tone}
      Your approach: ${config.interviewerPersona.approach}

      Company: ${config.context.targetCompany}
      Role: ${config.context.targetRole}

      You make intelligent decisions about:
      1. What questions to ask next
      2. When to probe deeper vs move on
      3. How to adapt to the candidate's style
      4. Which focus areas need more coverage

      Always respond with valid JSON. Be natural, not robotic.
    `;
  }

  /**
   * Helper methods for analysis
   */
  analyzeCommunicationStyle(transcript) {
    const words = transcript.split(' ').length;
    const sentences = transcript.split(/[.!?]+/).length;

    if (words > 100) return 'verbose';
    if (words < 20) return 'concise';
    if (sentences > words / 8) return 'structured';
    return 'balanced';
  }

  analyzeEngagement(transcript, audioMetadata) {
    // Simple engagement analysis
    const hasQuestions = transcript.includes('?');
    const hasExamples = transcript.includes('example') || transcript.includes('for instance');
    const isDetailed = transcript.length > 200;

    let engagement = 'medium';
    if ((hasQuestions || hasExamples) && isDetailed) engagement = 'high';
    if (transcript.length < 50) engagement = 'low';

    return engagement;
  }

  generateFallbackCoverage(response, focusAreas) {
    const fallback = {};
    focusAreas.forEach(area => {
      fallback[area.area] = {
        increase: Math.min(10, response.length / 50), // Simple fallback scoring
        evidence: [response.substring(0, 100)],
        quality: 5
      };
    });
    return fallback;
  }

  async generateFinalReport(session) {
    const persona = session.agentPersona || {};
    const candidateProfile = session.candidateProfile || {};
    const coverage = session.coverage || { overall: 0, areas: {} };
    const conversation = session.conversation || [];

    // ── 1. Quality score: average of per-response quality scores ──
    const responseQualities = candidateProfile.responseQualities || [];
    const qualityScore = responseQualities.length > 0
      ? Math.round(responseQualities.reduce((a, b) => a + b, 0) / responseQualities.length)
      : 50;

    // ── 2. Coverage score: weighted area coverage ──
    const coverageScore = coverage.overall || 0;

    // ── 3. Skills score: must-have skills covered vs total (fuzzy matching) ──
    const mustHaves = persona.idealCandidate?.mustHaveSkills || [];
    const demonstrated = candidateProfile.revealedExpertise || [];
    const gaps = candidateProfile.revealedGaps || [];
    let skillsScore;
    if (mustHaves.length > 0) {
      const mustHavesCovered = mustHaves.filter(s => {
        const skillLower = s.toLowerCase();
        return demonstrated.some(d => {
          const dLower = d.toLowerCase();
          // Exact match or substring in either direction
          return dLower.includes(skillLower) || skillLower.includes(dLower) ||
            // Word-level overlap (e.g., "Android" matches "Android Studio")
            skillLower.split(/[\s,/]+/).some(word => word.length > 2 && dLower.includes(word)) ||
            dLower.split(/[\s,/]+/).some(word => word.length > 2 && skillLower.includes(word));
        });
      });
      skillsScore = Math.round((mustHavesCovered.length / mustHaves.length) * 100);
      console.log(`📊 [FinalReport] Skills: ${mustHavesCovered.length}/${mustHaves.length} must-haves covered (${mustHavesCovered.map(s => s).join(', ') || 'none'})`);
    } else {
      skillsScore = qualityScore;
    }

    // ── 4. Depth score: from deep/moderate/surface per response ──
    const depths = conversation
      .filter(e => e.type === 'candidate' && e.metadata?.depthLevel)
      .map(e => e.metadata.depthLevel);
    const depthValues = { deep: 100, moderate: 80, surface: 40 };
    const depthScore = depths.length > 0
      ? Math.round(depths.reduce((sum, d) => sum + (depthValues[d] || 50), 0) / depths.length)
      : 50;

    // ── 5. Communication score: from style analysis ──
    const commStyle = candidateProfile.communicationStyle || {};
    let communicationScore = 50;
    if (commStyle.confidenceLevel === 'confident') communicationScore += 20;
    else if (commStyle.confidenceLevel === 'moderate') communicationScore += 10;
    if (commStyle.usesExamples) communicationScore += 15;
    if (commStyle.verbosity === 'detailed') communicationScore += 10;
    else if (commStyle.verbosity === 'concise') communicationScore += 5;
    communicationScore = Math.min(100, communicationScore);

    // ── 6. Composite final score ──
    const finalScore = Math.round(
      (qualityScore * 0.40) +      // primary signal — answer quality
      (coverageScore * 0.10) +     // interview structure, not candidate quality
      (skillsScore * 0.25) +       // must-have skills demonstrated
      (depthScore * 0.15) +        // depth of technical detail
      (communicationScore * 0.10)  // communication effectiveness
    );

    console.log(`📊 [FinalReport] Score breakdown: quality=${qualityScore}, coverage=${coverageScore}, skills=${skillsScore}, depth=${depthScore}, communication=${communicationScore} → overall=${finalScore}`);

    // ── 7. LLM-generated intelligent summary ──
    let aiSummary = { summary: '', strengths: [], weaknesses: [], recommendation: 'maybe', reasoning: '' };
    try {
      const areaScores = Object.entries(coverage.areas || {}).map(([a, d]) =>
        `${a.replace(/_/g, ' ')}: ${d.percentage}% coverage, quality: ${d.aiAnalysis?.qualityScore || 'N/A'}/100`
      ).join('\n');

      // Build conversation summary for the LLM (last 10 Q&A pairs)
      const conversationSummary = conversation
        .slice(-20)
        .map(e => `${e.type === 'interviewer' ? 'Q' : 'A'}: ${e.content.substring(0, 200)}`)
        .join('\n');

      const summaryResponse = await bedrock.callLLM({
        systemPrompt: `You are an expert recruiter writing a concise interview assessment.
Based on the actual conversation and scores, identify SPECIFIC strengths and weaknesses.
Strengths/weaknesses MUST reference specific topics discussed, not generic traits like "good communication".
Return ONLY valid JSON.`,
        messages: [{ role: "user", content: `Role: ${persona.job?.title || 'Unknown'} at ${persona.job?.company || 'Unknown'}
Must-Have Skills: ${mustHaves.join(', ') || 'Not specified'}

CANDIDATE DATA:
- Overall Score: ${finalScore}/100
- Quality Average: ${qualityScore}/100 (across ${responseQualities.length} responses)
- Coverage: ${coverageScore}%
- Skills Demonstrated: ${demonstrated.join(', ') || 'None identified'}
- Skills Gaps: ${gaps.join(', ') || 'None identified'}
- Communication: ${commStyle.verbosity || 'unknown'} speaker, ${commStyle.confidenceLevel || 'unknown'} confidence, ${commStyle.usesExamples ? 'uses examples' : 'rarely uses examples'}
- Difficulty Level: ${candidateProfile.currentDifficulty || 'intermediate'}

AREA SCORES:
${areaScores}

CONVERSATION HIGHLIGHTS:
${conversationSummary}

Write JSON:
{
  "summary": "2-3 sentence assessment referencing specific topics discussed in the interview",
  "strengths": ["top 3 SPECIFIC strengths based on actual answers given — reference topics/skills"],
  "weaknesses": ["top 3 SPECIFIC areas to improve based on actual gaps observed — reference topics/skills"],
  "recommendation": "strong_hire | hire | maybe | no_hire",
  "reasoning": "1 sentence justification referencing specific evidence from the conversation"
}` }],
        temperature: 0.3,
        maxTokens: 700,
        timeout: 25000,
        useFastModel: false // gpt-oss — strong model for final report
      });

      aiSummary = AIUtils.parseJSONResponse(summaryResponse.content, 'generateFinalReport');
    } catch (err) {
      console.warn('⚠️ [FinalReport] LLM summary failed, using computed data only:', err.message);
      aiSummary.summary = `Candidate scored ${finalScore}/100 overall. Quality: ${qualityScore}/100, Coverage: ${coverageScore}%, Depth: ${depthScore}/100.`;
      aiSummary.recommendation = finalScore >= 75 ? 'hire' : finalScore >= 55 ? 'maybe' : 'no_hire';
      aiSummary.reasoning = `Based on composite score of ${finalScore}/100.`;
    }

    return {
      summary: aiSummary.summary,
      coverage,
      scores: {
        overall: finalScore,
        quality: qualityScore,
        coverage: coverageScore,
        skills: skillsScore,
        depth: depthScore,
        communication: communicationScore,
      },
      strengths: aiSummary.strengths || session.realTimeReport?.strengths || [],
      weaknesses: aiSummary.weaknesses || session.realTimeReport?.weaknesses || [],
      recommendation: aiSummary.recommendation,
      reasoning: aiSummary.reasoning,
      recommendations: session.realTimeReport?.recommendations || [],
      candidateProfile: {
        communicationStyle: commStyle,
        revealedExpertise: demonstrated,
        revealedGaps: gaps,
        difficultyLevel: candidateProfile.currentDifficulty || 'intermediate',
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update coverage intelligently based on AI analysis
   */
  async updateCoverageIntelligently(sessionId, currentCoverage, coverageAnalysis) {
    try {
      const updatedCoverage = { ...currentCoverage };
      const session = await this.sessionManager.getSession(sessionId);

      if (coverageAnalysis.coverageUpdates) {
        Object.keys(coverageAnalysis.coverageUpdates).forEach(areaName => {
          const update = coverageAnalysis.coverageUpdates[areaName];

          if (updatedCoverage.areas[areaName]) {
            const area = updatedCoverage.areas[areaName];

            // Update percentage with AI-determined increase
            area.percentage = Math.min(100, area.percentage + update.percentageIncrease);

            // Add evidence from AI analysis
            if (update.evidence && update.evidence.length > 0) {
              area.indicators = area.indicators || [];
              update.evidence.forEach(evidence => {
                if (!area.indicators.some(ind => ind.evidence.includes(evidence))) {
                  area.indicators.push({
                    name: `AI-detected: ${update.indicators?.[0] || 'competency'}`,
                    covered: true,
                    evidence: [evidence],
                    quality: Math.min(10, Math.round((update.qualityScore || 50) / 10)),
                    aiGenerated: true,
                    reasoning: update.reasoning
                  });
                }
              });
            }

            // SCORE BONUS: Reward candidates who cover an area before time budget expires
            if (session?.timeBudgetPerAreaMs && area.percentage >= 60 && !area.earlyCompletionBonus) {
              const areaStartTime = area.startTime;
              if (areaStartTime) {
                const elapsed = Date.now() - areaStartTime;
                const timeBudget = session.timeBudgetPerAreaMs;
                if (elapsed < timeBudget) {
                  const timeRemainingRatio = (timeBudget - elapsed) / timeBudget;
                  const bonus = Math.round(timeRemainingRatio * 15); // Up to 15 bonus points
                  area.percentage = Math.min(100, area.percentage + bonus);
                  area.earlyCompletionBonus = bonus;
                  console.log(`🎁 [Score Bonus] Early completion: +${bonus}% for "${areaName}" (${Math.round(timeRemainingRatio*100)}% time remaining)`);
                }
              }
            }

            area.lastUpdated = new Date().toISOString();
            area.aiAnalysis = {
              qualityScore: update.qualityScore,
              reasoning: update.reasoning,
              indicators: update.indicators
            };
          }
        });
      }

      // Update overall coverage from AI assessment
      if (coverageAnalysis.overallAssessment?.totalCoverage) {
        updatedCoverage.overall = coverageAnalysis.overallAssessment.totalCoverage;
      }

      updatedCoverage.lastUpdated = new Date().toISOString();
      updatedCoverage.aiAnalysis = coverageAnalysis.overallAssessment;

      return updatedCoverage;
    } catch (error) {
      console.error('Error updating coverage intelligently:', error);
      return currentCoverage;
    }
  }

  /**
   * Build a clarification message when candidate didn't fully answer the question
   */
  buildClarificationMessage(missingElements, suggestedFollowUp, targetArea) {
    const intro = "I notice you didn't fully address ";

    if (missingElements && missingElements.length > 0) {
      const elementsText = missingElements.length === 1
        ? missingElements[0]
        : missingElements.slice(0, -1).join(', ') + ' and ' + missingElements[missingElements.length - 1];

      const message = `${intro}${elementsText}. `;

      if (suggestedFollowUp) {
        return message + suggestedFollowUp;
      } else {
        return message + `Could you elaborate on that?`;
      }
    } else if (suggestedFollowUp) {
      return suggestedFollowUp;
    } else {
      return `I'd like to hear more about that. Could you provide more details or specific examples?`;
    }
  }

  /**
   * Increment question count for a coverage area (max 5 per area to avoid repetition)
   */
  async incrementAreaQuestionCount(sessionId, areaName) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.coverage.areas[areaName]) {
        return;
      }

      const area = session.coverage.areas[areaName];
      area.questionsAsked = (area.questionsAsked || 0) + 1;
      area.lastQuestionTime = new Date().toISOString();

      await this.sessionManager.updateCoverage(sessionId, session.coverage);

      console.log(`📊 Area "${areaName}" now has ${area.questionsAsked} questions asked`);
    } catch (error) {
      console.error('Error incrementing area question count:', error);
    }
  }

  /**
   * Get current number of questions asked for an area
   */
  async getAreaQuestionCount(sessionId, areaName) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.coverage.areas[areaName]) {
        return 0;
      }
      return session.coverage.areas[areaName].questionsAsked || 0;
    } catch (error) {
      console.error('Error getting area question count:', error);
      return 0;
    }
  }

  /**
   * Update real-time report with AI intelligence
   */
  async updateRealTimeReportIntelligently(session, candidateResponse, coverageAnalysis, decisionAnalysis) {
    try {
      const systemPrompt = `You are an expert interview evaluator providing real-time feedback with AI insights.

INTELLIGENCE INTEGRATION:
- Use coverage analysis insights to identify strengths/weaknesses
- Consider decision analysis for recommendations
- Build on previous report while adding new insights
- Be specific and evidence-based
- Provide actionable feedback

RESPONSE FORMAT (JSON only):
{
  "strengths": ["updated list of candidate strengths"],
  "weaknesses": ["areas needing improvement"],
  "recommendations": ["specific recommendations for improvement"],
  "scores": {"area": score},
  "overallProgress": number,
  "aiInsights": ["key insights from AI analysis"],
  "trends": ["observed trends in performance"]
}`;

      // Trim inputs to prevent token overflow → truncated JSON output
      const trimmedReport = {
        strengths: (session.realTimeReport?.strengths || []).slice(-5),
        weaknesses: (session.realTimeReport?.weaknesses || []).slice(-5),
        overallProgress: session.realTimeReport?.overallProgress || 0
      };
      const trimmedDecision = {
        decision: decisionAnalysis?.decision,
        reasoning: decisionAnalysis?.reasoning,
        targetArea: decisionAnalysis?.targetArea
      };

      const userPrompt = `CURRENT REPORT:
${JSON.stringify(trimmedReport)}

LATEST RESPONSE: "${candidateResponse.substring(0, 500)}"

COVERAGE ANALYSIS:
${JSON.stringify(coverageAnalysis?.overallAssessment || {})}

DECISION ANALYSIS:
${JSON.stringify(trimmedDecision)}

Update the real-time report with new AI-powered insights.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.4,
        maxTokens: 1500,
        timeout: 30000,
        useFastModel: false // gpt-oss — strong model for report insights
      });

      const reportUpdate = AIUtils.parseJSONResponse(response.content, 'updateRealTimeReport');

      return {
        ...reportUpdate,
        lastUpdated: new Date().toISOString(),
        aiPowered: true,
        metadata: {
          basedOnCoverageAnalysis: true,
          basedOnDecisionAnalysis: true,
          updateTrigger: 'ai_intelligence_processing'
        }
      };

    } catch (error) {
      console.error('Error updating real-time report intelligently:', error);
      return session.realTimeReport;
    }
  }

  // REMOVED: shouldDoFullAnalysis — every response now gets full AI analysis

  // REMOVED: quickCoverageUpdate — every response now gets full AI coverage analysis

  /**
   * Process candidate response — always uses full AI analysis.
   * Legacy alias kept for backward compatibility with controller.
   */
  async processCandidateResponseIntelligently(sessionId, transcript, audioMetadata = {}) {
    return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
  }
}

module.exports = new IntelligentInterviewService();