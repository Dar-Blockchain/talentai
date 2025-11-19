/**
 * Response Quality Analyzer
 * Lightweight heuristic analysis of candidate responses (NO LLM required)
 * Analyzes: length, structure, relevance, confidence, hesitation
 */

class ResponseQualityAnalyzer {

  /**
   * Extract keywords from text (remove stop words)
   */
  static extractKeywords(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'i', 'you', 'we',
      'they', 'he', 'she', 'it', 'this', 'that', 'these', 'those'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Calculate overlap between two keyword sets
   */
  static calculateOverlap(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));

    return intersection.size / Math.max(set1.size, set2.size);
  }

  /**
   * Main analysis function - analyzes response quality without LLM
   */
  static analyzeResponseQuality(transcript, currentQuestion) {
    if (!transcript || transcript.trim().length === 0) {
      return {
        type: 'empty',
        quality: 0,
        wordCount: 0,
        needsSupport: true,
        supportType: 'encouragement',
        confidence: 'none',
        signals: {}
      };
    }

    const cleanTranscript = transcript.trim();
    const words = cleanTranscript.split(/\s+/);
    const wordCount = words.length;
    const sentences = cleanTranscript.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Extract intelligence signals
    const signals = {
      // Length indicators
      tooShort: wordCount < 15,
      adequate: wordCount >= 15 && wordCount < 100,
      verbose: wordCount >= 100 && wordCount <= 200,
      rambling: wordCount > 200,

      // Structure indicators
      hasSentences: sentences.length > 1,
      hasExamples: /for example|for instance|when I|once I|in my experience|such as|like when/i.test(cleanTranscript),
      hasSpecifics: /specifically|particular|detail|exactly|precisely/i.test(cleanTranscript),
      hasNumbers: /\d+/.test(cleanTranscript),
      hasTimeframes: /year|month|week|day|recently|ago|last|previous/i.test(cleanTranscript),

      // Confidence indicators
      hasHesitation: (cleanTranscript.match(/\b(um|uh|like|you know|I mean|sort of|kind of)\b/gi) || []).length >= 3,
      hasUncertainty: /maybe|perhaps|I think|I guess|not sure|I don't know|unclear|unsure/i.test(cleanTranscript),
      hasConfidence: /definitely|certainly|absolutely|clearly|obviously|without a doubt/i.test(cleanTranscript),

      // Quality indicators
      hasTechnicalTerms: /\b(api|database|framework|algorithm|architecture|system|design|implement|develop|debug|test)\b/i.test(cleanTranscript),
      hasActionVerbs: /\b(led|managed|created|built|designed|implemented|developed|solved|improved|optimized)\b/i.test(cleanTranscript),

      // Relevance indicators
      questionKeywords: currentQuestion ? this.extractKeywords(currentQuestion) : [],
      responseKeywords: this.extractKeywords(cleanTranscript)
    };

    // Calculate relevance score
    signals.relevanceScore = currentQuestion ?
      this.calculateOverlap(signals.questionKeywords, signals.responseKeywords) : 0.5;

    // Determine response type and quality
    let type = 'unknown';
    let quality = 50;
    let needsSupport = false;
    let supportType = null;
    let confidence = 'medium';

    // INSUFFICIENT: Very short response
    if (signals.tooShort) {
      type = 'insufficient';
      quality = wordCount < 5 ? 10 : 20;
      needsSupport = true;
      supportType = signals.relevanceScore < 0.3 ? 'clarification' : 'elaboration';
      confidence = signals.hasUncertainty ? 'low' : 'medium';
    }

    // STRUGGLING: Hesitation + uncertainty
    else if (signals.hasHesitation && signals.hasUncertainty) {
      type = 'struggling';
      quality = 30;
      needsSupport = true;
      supportType = 'encouragement';
      confidence = 'low';
    }

    // OFF-TOPIC: Adequate length but irrelevant
    else if (signals.relevanceScore < 0.3 && (signals.adequate || signals.verbose)) {
      type = 'off_topic';
      quality = 35;
      needsSupport = true;
      supportType = 'redirect';
      confidence = 'medium';
    }

    // RAMBLING: Too long + unfocused
    else if (signals.rambling && signals.relevanceScore < 0.5) {
      type = 'rambling';
      quality = 40;
      needsSupport = true;
      supportType = 'refocus';
      confidence = signals.hasConfidence ? 'medium' : 'low';
    }

    // ADEQUATE: Decent response, could be better
    else if (signals.adequate && signals.relevanceScore > 0.5) {
      type = signals.hasExamples || signals.hasSpecifics ? 'good' : 'adequate';
      quality = signals.hasExamples ? 65 : 55;
      needsSupport = !signals.hasExamples;
      supportType = needsSupport ? 'probe' : null;
      confidence = signals.hasConfidence ? 'high' : 'medium';
    }

    // GOOD: Strong response with examples
    else if ((signals.adequate || signals.verbose) &&
             signals.hasExamples &&
             signals.relevanceScore > 0.6) {
      type = 'good';
      quality = 75;
      needsSupport = false;
      supportType = null;
      confidence = signals.hasConfidence ? 'high' : 'medium';
    }

    // EXCELLENT: Comprehensive, specific, relevant
    else if ((signals.verbose && !signals.rambling) &&
             signals.hasExamples &&
             signals.hasSpecifics &&
             signals.relevanceScore > 0.6) {
      type = 'excellent';
      quality = 90;
      needsSupport = false;
      supportType = null;
      confidence = 'high';
    }

    // VERY GOOD: Verbose, relevant, with details
    else if (signals.verbose && signals.relevanceScore > 0.5) {
      type = signals.hasExamples ? 'very_good' : 'good';
      quality = signals.hasExamples ? 80 : 70;
      needsSupport = false;
      supportType = null;
      confidence = signals.hasConfidence ? 'high' : 'medium';
    }

    // DEFAULT: Adequate
    else {
      type = 'adequate';
      quality = 50;
      needsSupport = wordCount < 30;
      supportType = needsSupport ? 'elaboration' : null;
      confidence = 'medium';
    }

    return {
      type,
      quality,
      wordCount,
      sentenceCount: sentences.length,
      signals,
      needsSupport,
      supportType,
      confidence,
      relevanceScore: signals.relevanceScore,
      hasExamples: signals.hasExamples,
      hasTechnicalContent: signals.hasTechnicalTerms || signals.hasActionVerbs
    };
  }

  /**
   * Quick check if response needs deep AI analysis
   */
  static needsDeepAnalysis(analysis) {
    // Skip AI for obviously good responses
    if (analysis.quality >= 75) return false;

    // Skip AI for obviously insufficient responses
    if (analysis.wordCount < 10) return false;

    // Need AI for medium-quality responses that might have nuance
    if (analysis.quality >= 50 && analysis.quality < 75) return true;

    // Need AI for struggling/off-topic to get better understanding
    if (['struggling', 'off_topic', 'rambling'].includes(analysis.type)) return true;

    // Need AI for longer responses that need interpretation
    if (analysis.wordCount > 80) return true;

    return false;
  }
}

module.exports = ResponseQualityAnalyzer;
