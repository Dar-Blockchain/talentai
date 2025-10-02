/**
 * Intelligent Silence Detection and Management
 * Handles audio activity monitoring and intelligent silence responses
 */

class SilenceIntelligence {
  constructor() {
    this.silenceThresholds = {
      HR_INTERVIEW: 5000, // 5 seconds
      TECHNICAL_SKILL: 8000, // 8 seconds (more thinking time)
      SALARY_INTERVIEW: 4000, // 4 seconds
      SOFT_SKILL: 5000, // 5 seconds
      PSYCHOTECHNIC: 10000 // 10 seconds (complex cognitive tasks)
    };

    this.maxSilencePrompts = {
      HR_INTERVIEW: 3,
      TECHNICAL_SKILL: 4,
      SALARY_INTERVIEW: 2,
      SOFT_SKILL: 3,
      PSYCHOTECHNIC: 2
    };

    this.adaptiveThresholds = {
      introvertedCandidate: 1.5, // 50% longer silence tolerance
      nervousCandidate: 1.3, // 30% longer tolerance
      extrovertedCandidate: 0.8, // 20% shorter tolerance
      overconfidentCandidate: 0.9 // 10% shorter tolerance
    };
  }

  /**
   * Get adaptive silence threshold based on interview type and candidate behavior
   */
  getAdaptiveSilenceThreshold(interviewType, candidateBehavior) {
    const baseThreshold = this.silenceThresholds[interviewType] || this.silenceThresholds.HR_INTERVIEW;

    if (!candidateBehavior || !candidateBehavior.interactionStyle) {
      return baseThreshold;
    }

    const style = candidateBehavior.interactionStyle;
    const multiplier = this.adaptiveThresholds[style] || 1.0;

    return Math.round(baseThreshold * multiplier);
  }

  /**
   * Get maximum silence prompts for interview type
   */
  getMaxSilencePrompts(interviewType) {
    return this.maxSilencePrompts[interviewType] || this.maxSilencePrompts.HR_INTERVIEW;
  }

  /**
   * Analyze silence pattern and suggest action
   */
  analyzeSilencePattern(silenceHistory, candidateBehavior) {
    if (!silenceHistory || silenceHistory.length === 0) {
      return {
        pattern: 'first_silence',
        recommendation: 'gentle_prompt',
        urgency: 'low'
      };
    }

    const recentSilences = silenceHistory.slice(-3);
    const averageSilence = recentSilences.reduce((sum, s) => sum + s, 0) / recentSilences.length;
    const isIncreasing = recentSilences.length > 1 &&
      recentSilences[recentSilences.length - 1] > recentSilences[0];

    let pattern = 'normal';
    let recommendation = 'standard_prompt';
    let urgency = 'medium';

    if (averageSilence > 8000) { // Very long silences
      pattern = 'extended_silence';
      recommendation = 'supportive_prompt';
      urgency = 'high';
    } else if (isIncreasing) {
      pattern = 'increasing_silence';
      recommendation = 'encouraging_prompt';
      urgency = 'medium';
    } else if (recentSilences.length >= 3) {
      pattern = 'frequent_silence';
      recommendation = 'adaptive_approach';
      urgency = 'high';
    }

    return { pattern, recommendation, urgency };
  }

  /**
   * Generate intelligent silence prompt based on context
   */
  generateSilencePromptContext(interviewConfig, conversationHistory, silenceAnalysis) {
    const context = {
      interviewType: interviewConfig.interviewType,
      targetRole: interviewConfig.context.targetRole,
      targetCompany: interviewConfig.context.targetCompany,
      interviewerStyle: interviewConfig.interviewerPersona.style,
      silencePattern: silenceAnalysis.pattern,
      recommendation: silenceAnalysis.recommendation,
      urgency: silenceAnalysis.urgency
    };

    // Get last few conversation entries for context
    const recentContext = conversationHistory.slice(-3).map(entry => ({
      type: entry.type,
      content: entry.content.substring(0, 100) // Truncate for context
    }));

    return {
      ...context,
      recentContext,
      promptGuidance: this.getSilencePromptGuidance(context)
    };
  }

  /**
   * Get guidance for silence prompt generation
   */
  getSilencePromptGuidance(context) {
    const baseGuidance = {
      tone: 'supportive',
      approach: 'encouraging',
      length: 'concise'
    };

    switch (context.recommendation) {
      case 'gentle_prompt':
        return {
          ...baseGuidance,
          tone: 'very_gentle',
          message: 'Offer reassurance and invite them to take their time'
        };

      case 'supportive_prompt':
        return {
          ...baseGuidance,
          tone: 'understanding',
          message: 'Acknowledge the challenge and offer help or clarification'
        };

      case 'encouraging_prompt':
        return {
          ...baseGuidance,
          tone: 'motivating',
          message: 'Provide encouragement while keeping momentum'
        };

      case 'adaptive_approach':
        return {
          ...baseGuidance,
          tone: 'flexible',
          message: 'Offer alternative approaches or rephrase the question'
        };

      default:
        return {
          ...baseGuidance,
          message: 'Standard supportive prompt to re-engage'
        };
    }
  }

  /**
   * Determine if silence intervention is needed
   */
  shouldIntervene(silenceDuration, interviewType, candidateBehavior, silenceCount) {
    const threshold = this.getAdaptiveSilenceThreshold(interviewType, candidateBehavior);
    const maxPrompts = this.getMaxSilencePrompts(interviewType);

    return {
      shouldIntervene: silenceDuration >= threshold,
      canPrompt: silenceCount < maxPrompts,
      threshold,
      maxPrompts,
      action: this.getRecommendedAction(silenceDuration, threshold, silenceCount, maxPrompts)
    };
  }

  /**
   * Get recommended action based on silence analysis
   */
  getRecommendedAction(silenceDuration, threshold, silenceCount, maxPrompts) {
    if (silenceDuration < threshold) {
      return 'wait';
    }

    if (silenceCount < maxPrompts) {
      if (silenceCount === 0) return 'gentle_prompt';
      if (silenceCount === 1) return 'clarifying_prompt';
      return 'supportive_prompt';
    }

    return 'move_forward';
  }

  /**
   * Calculate silence statistics for reporting
   */
  calculateSilenceStatistics(silenceHistory) {
    if (!silenceHistory || silenceHistory.length === 0) {
      return {
        totalSilences: 0,
        averageDuration: 0,
        longestSilence: 0,
        shortestSilence: 0,
        pattern: 'no_data'
      };
    }

    const total = silenceHistory.length;
    const sum = silenceHistory.reduce((acc, duration) => acc + duration, 0);
    const average = sum / total;
    const longest = Math.max(...silenceHistory);
    const shortest = Math.min(...silenceHistory);

    let pattern = 'consistent';
    const variance = silenceHistory.reduce((acc, duration) =>
      acc + Math.pow(duration - average, 2), 0) / total;

    if (variance > 4000) pattern = 'variable';
    if (average > 8000) pattern = 'extended';
    if (average < 2000) pattern = 'brief';

    return {
      totalSilences: total,
      averageDuration: Math.round(average),
      longestSilence: longest,
      shortestSilence: shortest,
      variance: Math.round(variance),
      pattern
    };
  }

  /**
   * Assess candidate communication style based on silence patterns
   */
  assessCommunicationStyle(silenceStatistics, responsePatterns) {
    const { averageDuration, pattern, totalSilences } = silenceStatistics;

    let style = 'balanced';
    let confidence = 'medium';

    if (averageDuration > 7000) {
      style = 'reflective';
      confidence = 'high';
    } else if (averageDuration < 3000) {
      style = 'spontaneous';
      confidence = 'high';
    }

    if (pattern === 'extended') {
      style = 'deliberate';
    } else if (pattern === 'brief') {
      style = 'responsive';
    }

    // Consider response patterns if available
    if (responsePatterns) {
      if (responsePatterns.averageLength > 200) {
        style = style === 'reflective' ? 'thorough' : 'detailed';
      } else if (responsePatterns.averageLength < 50) {
        style = style === 'spontaneous' ? 'concise' : 'brief';
      }
    }

    return {
      primaryStyle: style,
      confidence,
      adaptationSuggestions: this.getAdaptationSuggestions(style)
    };
  }

  /**
   * Get suggestions for adapting to candidate's communication style
   */
  getAdaptationSuggestions(style) {
    const suggestions = {
      reflective: [
        'Allow extra thinking time',
        'Use open-ended questions',
        'Avoid rushing responses'
      ],
      spontaneous: [
        'Maintain good pace',
        'Ask follow-up questions',
        'Probe for depth when needed'
      ],
      deliberate: [
        'Respect processing time',
        'Frame complex questions clearly',
        'Encourage thorough responses'
      ],
      responsive: [
        'Keep momentum going',
        'Ask engaging questions',
        'Balance pace with depth'
      ],
      thorough: [
        'Allow comprehensive answers',
        'Guide focus when needed',
        'Appreciate detail orientation'
      ],
      concise: [
        'Probe for examples',
        'Encourage elaboration',
        'Ask specific follow-ups'
      ],
      brief: [
        'Use targeted questions',
        'Request specific examples',
        'Encourage expansion'
      ]
    };

    return suggestions[style] || [
      'Adapt to candidate responses',
      'Maintain supportive tone',
      'Balance pace and depth'
    ];
  }

  /**
   * Monitor audio activity and detect silence periods
   */
  createSilenceMonitor(config) {
    return {
      isMonitoring: false,
      silenceStartTime: null,
      currentSilenceDuration: 0,
      threshold: this.getAdaptiveSilenceThreshold(config.interviewType, {}),
      callbacks: {
        onSilenceStart: null,
        onSilenceEnd: null,
        onSilenceThreshold: null
      },

      startMonitoring() {
        this.isMonitoring = true;
        console.log(`🔊 Silence monitoring started with ${this.threshold}ms threshold`);
      },

      stopMonitoring() {
        this.isMonitoring = false;
        this.silenceStartTime = null;
        this.currentSilenceDuration = 0;
        console.log('🔇 Silence monitoring stopped');
      },

      onVoiceActivity(isActive) {
        if (!this.isMonitoring) return;

        const now = Date.now();

        if (!isActive && !this.silenceStartTime) {
          // Silence started
          this.silenceStartTime = now;
          if (this.callbacks.onSilenceStart) {
            this.callbacks.onSilenceStart(now);
          }
        } else if (isActive && this.silenceStartTime) {
          // Voice activity resumed
          this.currentSilenceDuration = now - this.silenceStartTime;
          if (this.callbacks.onSilenceEnd) {
            this.callbacks.onSilenceEnd(this.currentSilenceDuration);
          }
          this.silenceStartTime = null;
          this.currentSilenceDuration = 0;
        } else if (!isActive && this.silenceStartTime) {
          // Ongoing silence
          this.currentSilenceDuration = now - this.silenceStartTime;

          if (this.currentSilenceDuration >= this.threshold && this.callbacks.onSilenceThreshold) {
            this.callbacks.onSilenceThreshold(this.currentSilenceDuration);
          }
        }
      },

      getCurrentSilenceDuration() {
        if (!this.silenceStartTime) return 0;
        return Date.now() - this.silenceStartTime;
      },

      updateThreshold(newThreshold) {
        this.threshold = newThreshold;
        console.log(`🔧 Silence threshold updated to ${newThreshold}ms`);
      }
    };
  }
}

module.exports = new SilenceIntelligence();