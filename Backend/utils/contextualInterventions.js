/**
 * Contextual Interventions Generator
 * Generates appropriate AI-powered intervention messages based on context
 * 6 intervention types: encouragement, elaboration, clarification, refocus, probe, continuation
 *
 * NOTE: Disabled for MVP - using manual "Next" button flow only
 */

// REMOVED: Module doesn't exist - not needed for MVP manual flow
// const togetherAI = require('../services/togetherAI');

class ContextualInterventions {

  /**
   * ENCOURAGEMENT: When candidate is struggling or uncertain
   * Use case: Low confidence, hesitation detected, consistently struggling
   */
  static async generateEncouragement(context) {
    const { currentQuestion, lastResponse, behaviorProfile } = context;

    const systemPrompt = `You are a supportive interviewer conducting a professional interview. The candidate seems uncertain or struggling with their current response. Generate a brief, encouraging message that:
- Acknowledges their effort
- Reassures them there's no rush
- Maintains professional but warm tone
- Keeps it under 25 words
- Output ONLY the encouragement message as plain text (no JSON, no labels)`;

    const userPrompt = `Current question: "${currentQuestion}"

Candidate's last response quality: ${lastResponse.quality}/100
Response type: ${lastResponse.type}
Word count: ${lastResponse.wordCount}
Confidence level: ${lastResponse.confidence}

Generate a brief encouraging message.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 10 || message.length > 200) {
        throw new Error(`Invalid encouragement length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '.';
      }

      return {
        type: 'encouragement',
        content: message,
        shouldWaitForResponse: false // Just encourage, don't expect response
      };

    } catch (error) {
      console.error('❌ Error generating encouragement:', error);
      // Emergency fallback (ONLY if AI completely fails)
      return {
        type: 'encouragement',
        content: 'Take your time. I\'m here when you\'re ready to continue.',
        shouldWaitForResponse: false
      };
    }
  }

  /**
   * ELABORATION: When response is too short but relevant
   * Use case: Insufficient response, unusual brevity, adequate but could be better
   */
  static async generateElaborationRequest(context) {
    const { currentQuestion, lastResponse, behaviorProfile } = context;

    const systemPrompt = `You are an interviewer who received a brief answer that needs more detail. Generate a follow-up request that:
- Asks for more specifics or examples
- References what they already said
- Sounds natural and conversational
- Keeps it under 30 words
- Output ONLY the elaboration request as plain text (no JSON, no labels)`;

    const userPrompt = `Question asked: "${currentQuestion}"

Candidate's response summary:
- Word count: ${lastResponse.wordCount}
- Quality: ${lastResponse.quality}/100
- Has examples: ${lastResponse.hasExamples ? 'Yes' : 'No'}
- Relevance: ${Math.round(lastResponse.relevanceScore * 100)}%

Generate a natural request for more detail.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 15 || message.length > 250) {
        throw new Error(`Invalid elaboration length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '?';
      }

      return {
        type: 'elaboration',
        content: message,
        shouldWaitForResponse: true // Expecting more detail
      };

    } catch (error) {
      console.error('❌ Error generating elaboration request:', error);
      return {
        type: 'elaboration',
        content: 'Could you elaborate on that a bit more?',
        shouldWaitForResponse: true
      };
    }
  }

  /**
   * CLARIFICATION: When response is confusing or off-topic
   * Use case: Off-topic response, low relevance, sudden quality drop
   */
  static async generateClarification(context) {
    const { currentQuestion, lastResponse, behaviorProfile } = context;

    const systemPrompt = `You are an interviewer who received a confusing or off-topic answer. Generate a gentle clarification request that:
- Politely redirects back to the original question
- Doesn't make the candidate feel bad
- Keeps it under 35 words
- Sounds helpful, not critical
- Output ONLY the clarification request as plain text (no JSON, no labels)`;

    const userPrompt = `Original question: "${currentQuestion}"

Candidate's response analysis:
- Relevance score: ${Math.round(lastResponse.relevanceScore * 100)}%
- Response type: ${lastResponse.type}
- Word count: ${lastResponse.wordCount}

Generate a gentle clarification request.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 15 || message.length > 300) {
        throw new Error(`Invalid clarification length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '?';
      }

      return {
        type: 'clarification',
        content: message,
        shouldWaitForResponse: true // Need clearer answer
      };

    } catch (error) {
      console.error('❌ Error generating clarification:', error);
      return {
        type: 'clarification',
        content: 'I want to make sure I understand. Could you clarify how this relates to the question?',
        shouldWaitForResponse: true
      };
    }
  }

  /**
   * REFOCUS: When candidate is rambling or going off track
   * Use case: Rambling response, verbose and unfocused, rambling tendency pattern
   */
  static async generateRefocus(context) {
    const { currentQuestion, lastResponse, behaviorProfile } = context;

    const systemPrompt = `You are an interviewer who needs to politely refocus a rambling candidate. Generate a gentle interruption that:
- Thanks them for the detail
- Redirects to the core question
- Keeps it professional and kind
- Under 30 words
- Output ONLY the refocus message as plain text (no JSON, no labels)`;

    const userPrompt = `Question asked: "${currentQuestion}"

Candidate's response:
- Word count: ${lastResponse.wordCount}
- Relevance: ${Math.round(lastResponse.relevanceScore * 100)}%
- Type: ${lastResponse.type}

Generate a polite refocusing message.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 15 || message.length > 250) {
        throw new Error(`Invalid refocus length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '.';
      }

      return {
        type: 'refocus',
        content: message,
        shouldWaitForResponse: true // Expecting more focused answer
      };

    } catch (error) {
      console.error('❌ Error generating refocus:', error);
      return {
        type: 'refocus',
        content: 'Thank you for that detail. Let me refocus the question for you.',
        shouldWaitForResponse: false
      };
    }
  }

  /**
   * PROBE: When response is adequate but could have more depth
   * Use case: Adequate response without examples, good but could be excellent
   */
  static async generateProbe(context) {
    const { currentQuestion, lastResponse, behaviorProfile } = context;

    const systemPrompt = `You are an interviewer who wants to dig deeper into an adequate answer. Generate a probing follow-up that:
- Asks for specific examples or experiences
- Builds on what they said
- Encourages deeper thinking
- Under 30 words
- Output ONLY the probe question as plain text (no JSON, no labels)`;

    const userPrompt = `Question asked: "${currentQuestion}"

Candidate's response:
- Quality: ${lastResponse.quality}/100
- Has examples: ${lastResponse.hasExamples ? 'Yes' : 'No'}
- Has technical content: ${lastResponse.hasTechnicalContent ? 'Yes' : 'No'}
- Word count: ${lastResponse.wordCount}

Generate a probing follow-up question.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 15 || message.length > 250) {
        throw new Error(`Invalid probe length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '?';
      }

      return {
        type: 'probe',
        content: message,
        shouldWaitForResponse: true // Expecting deeper answer
      };

    } catch (error) {
      console.error('❌ Error generating probe:', error);
      return {
        type: 'probe',
        content: 'Can you give me a specific example of that?',
        shouldWaitForResponse: true
      };
    }
  }

  /**
   * CONTINUATION: After silence, invite candidate to continue
   * Use case: Normal silence monitoring, candidate hasn't responded
   */
  static async generateContinuationPrompt(context) {
    const { currentQuestion, silenceDuration, behaviorProfile } = context;

    const systemPrompt = `You are an interviewer checking in after silence. Generate a natural continuation prompt that:
- Acknowledges the pause
- Invites them to continue when ready
- Maintains supportive tone
- Under 25 words
- Output ONLY the continuation prompt as plain text (no JSON, no labels)`;

    const userPrompt = `Question asked: "${currentQuestion}"

Silence duration: ${Math.round(silenceDuration / 1000)} seconds
Candidate's communication style: ${behaviorProfile?.style || 'medium'}

Generate a natural continuation prompt.`;

    try {
      const response = await togetherAI.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        max_tokens: 150,
        temperature: 0.7
      });

      let message = response.content.trim();

      // Validation
      if (message.length < 10 || message.length > 200) {
        throw new Error(`Invalid continuation length: ${message.length}`);
      }

      // Ensure proper punctuation
      if (!/[.!?]$/.test(message)) {
        message += '.';
      }

      return {
        type: 'continuation',
        content: message,
        shouldWaitForResponse: false // Just checking in
      };

    } catch (error) {
      console.error('❌ Error generating continuation prompt:', error);
      return {
        type: 'continuation',
        content: 'Take your time. I\'m listening.',
        shouldWaitForResponse: false
      };
    }
  }

  /**
   * Route to appropriate intervention type
   */
  static async generate(interventionType, context) {
    switch (interventionType) {
      case 'encouragement':
        return await this.generateEncouragement(context);
      case 'elaboration':
        return await this.generateElaborationRequest(context);
      case 'clarification':
        return await this.generateClarification(context);
      case 'refocus':
        return await this.generateRefocus(context);
      case 'probe':
        return await this.generateProbe(context);
      case 'continuation':
        return await this.generateContinuationPrompt(context);
      default:
        console.warn(`⚠️ Unknown intervention type: ${interventionType}`);
        return await this.generateContinuationPrompt(context);
    }
  }
}

module.exports = ContextualInterventions;
