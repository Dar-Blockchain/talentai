/**
 * Candidate Behavior Tracker
 * Tracks communication patterns over time to detect behavioral trends
 * Helps identify when a candidate needs immediate intervention
 */

class CandidateBehaviorTracker {
  constructor() {
    this.responses = []; // Last N responses
    this.maxResponses = 10; // Track last 10 responses
    this.averages = {
      wordCount: 0,
      quality: 0,
      relevanceScore: 0
    };
    this.communicationStyle = 'medium'; // very_concise, concise, medium, detailed, verbose
    this.patterns = {
      consistentlyStruggling: false,
      suddenQualityDrop: false,
      unusualBrevity: false,
      ramblingTendency: false
    };
  }

  /**
   * Add a new response analysis to the tracker
   */
  addResponse(analysis) {
    // Add to history
    this.responses.push({
      timestamp: Date.now(),
      wordCount: analysis.wordCount,
      quality: analysis.quality,
      type: analysis.type,
      relevanceScore: analysis.relevanceScore,
      confidence: analysis.confidence,
      needsSupport: analysis.needsSupport,
      supportType: analysis.supportType
    });

    // Keep only last N responses
    if (this.responses.length > this.maxResponses) {
      this.responses.shift();
    }

    // Update running averages
    this._updateAverages();

    // Update communication style
    this._updateCommunicationStyle();

    // Detect patterns
    this._detectPatterns();
  }

  /**
   * Calculate running averages
   */
  _updateAverages() {
    if (this.responses.length === 0) return;

    const sum = this.responses.reduce((acc, r) => ({
      wordCount: acc.wordCount + r.wordCount,
      quality: acc.quality + r.quality,
      relevanceScore: acc.relevanceScore + r.relevanceScore
    }), { wordCount: 0, quality: 0, relevanceScore: 0 });

    const count = this.responses.length;
    this.averages = {
      wordCount: sum.wordCount / count,
      quality: sum.quality / count,
      relevanceScore: sum.relevanceScore / count
    };
  }

  /**
   * Determine candidate's communication style
   */
  _updateCommunicationStyle() {
    const avgWords = this.averages.wordCount;

    if (avgWords < 20) {
      this.communicationStyle = 'very_concise';
    } else if (avgWords < 50) {
      this.communicationStyle = 'concise';
    } else if (avgWords < 100) {
      this.communicationStyle = 'medium';
    } else if (avgWords < 150) {
      this.communicationStyle = 'detailed';
    } else {
      this.communicationStyle = 'verbose';
    }
  }

  /**
   * Detect behavioral patterns that need attention
   */
  _detectPatterns() {
    if (this.responses.length < 3) return; // Need at least 3 responses

    const recent3 = this.responses.slice(-3);
    const recent5 = this.responses.slice(-5);

    // PATTERN 1: Consistently struggling (last 3 responses all low quality)
    this.patterns.consistentlyStruggling = recent3.every(r => r.quality < 40);

    // PATTERN 2: Sudden quality drop (last response is 30+ points below average)
    if (this.responses.length >= 4) {
      const lastResponse = this.responses[this.responses.length - 1];
      const previousAvg = this.responses.slice(0, -1).reduce((sum, r) => sum + r.quality, 0) / (this.responses.length - 1);
      this.patterns.suddenQualityDrop = (previousAvg - lastResponse.quality) > 30;
    }

    // PATTERN 3: Unusual brevity (last response is < 50% of average word count)
    if (this.responses.length >= 3) {
      const lastResponse = this.responses[this.responses.length - 1];
      const previousAvgWords = this.responses.slice(0, -1).reduce((sum, r) => sum + r.wordCount, 0) / (this.responses.length - 1);
      this.patterns.unusualBrevity = lastResponse.wordCount < (previousAvgWords * 0.5) && lastResponse.wordCount < 15;
    }

    // PATTERN 4: Rambling tendency (3+ of last 5 responses are rambling/verbose)
    if (recent5.length >= 5) {
      const ramblingCount = recent5.filter(r => r.type === 'rambling' || r.wordCount > 200).length;
      this.patterns.ramblingTendency = ramblingCount >= 3;
    }
  }

  /**
   * Determine if immediate intervention is needed (no waiting)
   */
  needsImmediateIntervention(currentResponse) {
    // IMMEDIATE: Empty or extremely short response
    if (currentResponse.wordCount < 5) {
      return {
        needed: true,
        reason: 'empty_response',
        urgency: 'high',
        suggestedAction: 'encouragement'
      };
    }

    // IMMEDIATE: Consistently struggling pattern detected
    if (this.patterns.consistentlyStruggling) {
      return {
        needed: true,
        reason: 'consistent_struggling',
        urgency: 'high',
        suggestedAction: 'encouragement'
      };
    }

    // IMMEDIATE: Sudden quality drop (might indicate confusion or frustration)
    if (this.patterns.suddenQualityDrop) {
      return {
        needed: true,
        reason: 'sudden_quality_drop',
        urgency: 'medium',
        suggestedAction: 'clarification'
      };
    }

    // IMMEDIATE: Off-topic response (candidate might be confused)
    if (currentResponse.type === 'off_topic' && currentResponse.relevanceScore < 0.3) {
      return {
        needed: true,
        reason: 'off_topic',
        urgency: 'medium',
        suggestedAction: 'redirect'
      };
    }

    // IMMEDIATE: Rambling detected (candidate needs refocusing)
    if (currentResponse.type === 'rambling' || (currentResponse.wordCount > 250 && currentResponse.relevanceScore < 0.5)) {
      return {
        needed: true,
        reason: 'rambling',
        urgency: 'low',
        suggestedAction: 'refocus'
      };
    }

    // No immediate intervention needed
    return {
      needed: false,
      reason: null,
      urgency: null,
      suggestedAction: null
    };
  }

  /**
   * Determine if delayed intervention should be triggered
   * (After some silence, but faster than normal)
   */
  needsDelayedIntervention(currentResponse) {
    // DELAYED: Struggling response (give help sooner than normal)
    if (currentResponse.type === 'struggling') {
      return {
        needed: true,
        reason: 'struggling',
        recommendedDelay: 15000, // 15s instead of 25s
        suggestedAction: 'encouragement'
      };
    }

    // DELAYED: Insufficient response (probe for more detail)
    if (currentResponse.type === 'insufficient' && currentResponse.relevanceScore > 0.4) {
      return {
        needed: true,
        reason: 'insufficient',
        recommendedDelay: 20000, // 20s
        suggestedAction: 'elaboration'
      };
    }

    // DELAYED: Unusual brevity pattern (might need encouragement)
    if (this.patterns.unusualBrevity) {
      return {
        needed: true,
        reason: 'unusual_brevity',
        recommendedDelay: 20000, // 20s
        suggestedAction: 'elaboration'
      };
    }

    // No delayed intervention needed
    return {
      needed: false,
      reason: null,
      recommendedDelay: null,
      suggestedAction: null
    };
  }

  /**
   * Get communication style profile for adaptive behavior
   */
  getCommunicationStyle() {
    return {
      style: this.communicationStyle,
      averages: this.averages,
      patterns: this.patterns,
      responseCount: this.responses.length,
      recentTypes: this.responses.slice(-5).map(r => r.type)
    };
  }

  /**
   * Serialize tracker state for Redis storage
   */
  toJSON() {
    return {
      responses: this.responses,
      averages: this.averages,
      communicationStyle: this.communicationStyle,
      patterns: this.patterns
    };
  }

  /**
   * Restore tracker from JSON (from Redis)
   */
  static fromJSON(data) {
    const tracker = new CandidateBehaviorTracker();
    if (data) {
      tracker.responses = data.responses || [];
      tracker.averages = data.averages || { wordCount: 0, quality: 0, relevanceScore: 0 };
      tracker.communicationStyle = data.communicationStyle || 'medium';
      tracker.patterns = data.patterns || {
        consistentlyStruggling: false,
        suddenQualityDrop: false,
        unusualBrevity: false,
        ramblingTendency: false
      };
    }
    return tracker;
  }
}

module.exports = CandidateBehaviorTracker;
