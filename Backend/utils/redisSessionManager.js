/**
 * Redis Session Manager for Intelligent Interviews
 * Manages interview sessions, state, and real-time data
 */

const redis = require('redis');
require('dotenv').config();

class RedisSessionManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.sessionPrefix = 'interview:';
    this.coveragePrefix = 'coverage:';
    this.reportPrefix = 'report:';
    this.sessionTTL = 7200; // 2 hours

    // AI-specific prefixes
    this.aiAnalysisPrefix = 'ai_analysis:';
    this.memoryPrefix = 'memory:';
    this.questionHistoryPrefix = 'questions:';
    this.decisionHistoryPrefix = 'decisions:';
    this.intelligencePrefix = 'intelligence:';
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis server connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
        this.isConnected = true;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error.message);
      return false;
    }
  }

  /**
   * Create new interview session
   */
  async createSession(sessionId, config, candidateId) {
    try {
      const sessionData = {
        sessionId,
        candidateId,
        config,
        conversation: [],
        coverage: this.initializeCoverage(config.intelligenceContext.focusAreas),
        currentContext: null,
        questions: [],
        answers: [],
        silenceCount: 0,
        candidateBehavior: {
          responseLength: [],
          silenceDuration: [],
          interactionStyle: 'unknown',
          adaptationNeeded: false
        },
        realTimeReport: {
          strengths: [],
          weaknesses: [],
          recommendations: [],
          scores: {},
          overallProgress: 0
        },
        status: 'initialized',
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        endTime: null,
        metadata: {
          version: '1.0',
          systemInfo: {
            userAgent: '',
            platform: '',
            language: config.sessionSettings.language || 'en'
          }
        }
      };

      const key = this.sessionPrefix + sessionId;
      await this.client.setEx(key, this.sessionTTL, JSON.stringify(sessionData));

      console.log(`✅ Created interview session: ${sessionId}`);
      return sessionData;
    } catch (error) {
      console.error('❌ Failed to create session:', error.message);
      throw error;
    }
  }

  /**
   * Get interview session
   */
  async getSession(sessionId) {
    try {
      const key = this.sessionPrefix + sessionId;
      const sessionData = await this.client.get(key);

      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      console.error('❌ Failed to get session:', error.message);
      return null;
    }
  }

  /**
   * Update interview session
   */
  async updateSession(sessionId, updates) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedSession = {
        ...session,
        ...updates,
        lastActivity: new Date().toISOString()
      };

      const key = this.sessionPrefix + sessionId;
      await this.client.setEx(key, this.sessionTTL, JSON.stringify(updatedSession));

      return updatedSession;
    } catch (error) {
      console.error('❌ Failed to update session:', error.message);
      throw error;
    }
  }

  /**
   * Add conversation entry
   */
  async addConversationEntry(sessionId, entry) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const conversationEntry = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: entry.type, // 'interviewer', 'candidate', 'system'
        content: entry.content,
        metadata: {
          model: entry.model || null,
          processingTime: entry.processingTime || null,
          confidence: entry.confidence || null,
          ...entry.metadata
        }
      };

      session.conversation.push(conversationEntry);

      // Keep conversation manageable (last 50 messages)
      if (session.conversation.length > 50) {
        session.conversation = session.conversation.slice(-50);
      }

      await this.updateSession(sessionId, { conversation: session.conversation });
      return conversationEntry;
    } catch (error) {
      console.error('❌ Failed to add conversation entry:', error.message);
      throw error;
    }
  }

  /**
   * Update coverage tracking
   */
  async updateCoverage(sessionId, coverageUpdate) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedCoverage = {
        ...session.coverage,
        ...coverageUpdate,
        lastUpdated: new Date().toISOString()
      };

      await this.updateSession(sessionId, { coverage: updatedCoverage });

      // Also store coverage separately for analytics
      const coverageKey = this.coveragePrefix + sessionId;
      await this.client.setEx(coverageKey, this.sessionTTL, JSON.stringify(updatedCoverage));

      return updatedCoverage;
    } catch (error) {
      console.error('❌ Failed to update coverage:', error.message);
      throw error;
    }
  }

  /**
   * Update real-time report
   */
  async updateRealTimeReport(sessionId, reportUpdate) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedReport = {
        ...session.realTimeReport,
        ...reportUpdate,
        lastUpdated: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      await this.updateSession(sessionId, { realTimeReport: updatedReport });

      // Store report separately for faster access
      const reportKey = this.reportPrefix + sessionId;
      await this.client.setEx(reportKey, this.sessionTTL, JSON.stringify(updatedReport));

      return updatedReport;
    } catch (error) {
      console.error('❌ Failed to update real-time report:', error.message);
      throw error;
    }
  }

  /**
   * Track silence event
   */
  async trackSilence(sessionId, silenceDuration) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const silenceCount = (session.silenceCount || 0) + 1;
      const candidateBehavior = {
        ...session.candidateBehavior,
        silenceDuration: [...(session.candidateBehavior.silenceDuration || []), silenceDuration]
      };

      await this.updateSession(sessionId, {
        silenceCount,
        candidateBehavior
      });

      return { silenceCount, candidateBehavior };
    } catch (error) {
      console.error('❌ Failed to track silence:', error.message);
      throw error;
    }
  }

  /**
   * Update candidate behavior analysis
   */
  async updateCandidateBehavior(sessionId, behaviorUpdate) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedBehavior = {
        ...session.candidateBehavior,
        ...behaviorUpdate,
        lastAnalyzed: new Date().toISOString()
      };

      await this.updateSession(sessionId, { candidateBehavior: updatedBehavior });
      return updatedBehavior;
    } catch (error) {
      console.error('❌ Failed to update candidate behavior:', error.message);
      throw error;
    }
  }

  /**
   * End interview session
   */
  async endSession(sessionId, finalReport) {
    try {
      const endTime = new Date().toISOString();
      const updates = {
        status: 'completed',
        endTime,
        finalReport: finalReport || null
      };

      const session = await this.updateSession(sessionId, updates);

      // Extend TTL for completed sessions (24 hours)
      const key = this.sessionPrefix + sessionId;
      await this.client.expire(key, 86400);

      console.log(`✅ Ended interview session: ${sessionId}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to end session:', error.message);
      throw error;
    }
  }

  /**
   * Get active sessions count
   */
  async getActiveSessionsCount() {
    try {
      const keys = await this.client.keys(this.sessionPrefix + '*');
      const activeSessions = [];

      for (const key of keys) {
        const sessionData = await this.client.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.status === 'active' || session.status === 'initialized') {
            activeSessions.push(session);
          }
        }
      }

      return activeSessions.length;
    } catch (error) {
      console.error('❌ Failed to get active sessions count:', error.message);
      return 0;
    }
  }

  /**
   * Initialize coverage structure
   */
  initializeCoverage(focusAreas) {
    const coverage = {
      overall: 0,
      areas: {},
      completedAreas: [],
      nextRecommendedArea: null,
      lastUpdated: new Date().toISOString()
    };

    focusAreas.forEach(area => {
      coverage.areas[area.area] = {
        percentage: 0,
        indicators: area.indicators.map(indicator => ({
          name: indicator,
          covered: false,
          evidence: [],
          quality: 0
        })),
        weight: area.weight,
        depth: area.depth,
        completed: false
      };
    });

    return coverage;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const keys = await this.client.keys(this.sessionPrefix + '*');
      let cleanedCount = 0;

      for (const key of keys) {
        const ttl = await this.client.ttl(key);
        if (ttl === -2) { // Key doesn't exist
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup expired sessions:', error.message);
      return 0;
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return null;
      }

      const analytics = {
        duration: session.endTime
          ? new Date(session.endTime) - new Date(session.startTime)
          : new Date() - new Date(session.startTime),
        messageCount: session.conversation.length,
        silenceEvents: session.silenceCount || 0,
        coveragePercentage: session.coverage.overall || 0,
        completedAreas: session.coverage.completedAreas.length,
        totalAreas: Object.keys(session.coverage.areas).length,
        averageResponseLength: this.calculateAverageResponseLength(session.candidateBehavior),
        interactionStyle: session.candidateBehavior.interactionStyle
      };

      return analytics;
    } catch (error) {
      console.error('❌ Failed to get session analytics:', error.message);
      return null;
    }
  }

  /**
   * Helper method to calculate average response length
   */
  calculateAverageResponseLength(behavior) {
    if (!behavior.responseLength || behavior.responseLength.length === 0) {
      return 0;
    }

    const total = behavior.responseLength.reduce((sum, length) => sum + length, 0);
    return Math.round(total / behavior.responseLength.length);
  }

  /**
   * Check if Redis is connected
   */
  isReady() {
    return this.isConnected && this.client && this.client.isReady;
  }

  /**
   * Graceful shutdown
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        console.log('✅ Redis disconnected gracefully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error.message);
    }
  }

  // ===== AI-ENHANCED REDIS METHODS =====

  /**
   * Store AI analysis result with reasoning and context
   */
  async storeAIAnalysis(sessionId, analysisType, analysisResult) {
    try {
      const key = `${this.aiAnalysisPrefix}${sessionId}:${analysisType}:${Date.now()}`;
      const analysisData = {
        sessionId,
        type: analysisType,
        result: analysisResult,
        timestamp: new Date().toISOString(),
        ttl: this.sessionTTL
      };

      await this.client.setEx(key, this.sessionTTL, JSON.stringify(analysisData));
      return key;
    } catch (error) {
      console.error('❌ Failed to store AI analysis:', error);
      throw error;
    }
  }

  /**
   * Get AI analysis history for a session and type
   */
  async getAIAnalysisHistory(sessionId, analysisType = '*', limit = 10) {
    try {
      const pattern = `${this.aiAnalysisPrefix}${sessionId}:${analysisType}:*`;
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return [];

      // Sort by timestamp (most recent first)
      keys.sort().reverse();
      const limitedKeys = keys.slice(0, limit);

      const results = [];
      for (const key of limitedKeys) {
        const data = await this.client.get(key);
        if (data) {
          results.push(JSON.parse(data));
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Failed to get AI analysis history:', error);
      return [];
    }
  }

  /**
   * Store question with AI-generated metadata and similarity analysis
   */
  async storeIntelligentQuestion(sessionId, questionData) {
    try {
      const key = `${this.questionHistoryPrefix}${sessionId}`;
      const existing = await this.client.get(key);
      const questions = existing ? JSON.parse(existing) : [];

      const questionEntry = {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        question: questionData.question,
        targetAreas: questionData.targetAreas || [],
        reasoning: questionData.reasoning,
        aiMetadata: {
          generated: true,
          model: questionData.model,
          confidence: questionData.confidence,
          similarityChecked: questionData.similarityChecked || false,
          expectedOutcomes: questionData.expectedOutcomes
        },
        timestamp: new Date().toISOString()
      };

      questions.push(questionEntry);

      // Keep last 100 questions
      if (questions.length > 100) {
        questions.splice(0, questions.length - 100);
      }

      await this.client.setEx(key, this.sessionTTL, JSON.stringify(questions));
      return questionEntry;
    } catch (error) {
      console.error('❌ Failed to store intelligent question:', error);
      throw error;
    }
  }

  /**
   * Get question history for similarity analysis
   */
  async getQuestionHistory(sessionId, limit = 50) {
    try {
      const key = `${this.questionHistoryPrefix}${sessionId}`;
      const data = await this.client.get(key);

      if (!data) return [];

      const questions = JSON.parse(data);
      return questions.slice(-limit); // Return most recent questions
    } catch (error) {
      console.error('❌ Failed to get question history:', error);
      return [];
    }
  }

  /**
   * Store AI decision with full reasoning chain
   */
  async storeAIDecision(sessionId, decisionData) {
    try {
      const key = `${this.decisionHistoryPrefix}${sessionId}`;
      const existing = await this.client.get(key);
      const decisions = existing ? JSON.parse(existing) : [];

      const decisionEntry = {
        id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        decision: decisionData.decision,
        reasoning: decisionData.reasoning,
        targetArea: decisionData.targetArea,
        confidence: decisionData.confidence,
        context: {
          coverageState: decisionData.coverageState,
          conversationLength: decisionData.conversationLength,
          candidateEngagement: decisionData.candidateEngagement
        },
        aiMetadata: {
          model: decisionData.model,
          processingTime: decisionData.processingTime,
          alternativesConsidered: decisionData.alternativesConsidered
        },
        timestamp: new Date().toISOString()
      };

      decisions.push(decisionEntry);

      // Keep last 50 decisions
      if (decisions.length > 50) {
        decisions.splice(0, decisions.length - 50);
      }

      await this.client.setEx(key, this.sessionTTL, JSON.stringify(decisions));
      return decisionEntry;
    } catch (error) {
      console.error('❌ Failed to store AI decision:', error);
      throw error;
    }
  }

  /**
   * Get decision history for pattern analysis
   */
  async getDecisionHistory(sessionId, limit = 20) {
    try {
      const key = `${this.decisionHistoryPrefix}${sessionId}`;
      const data = await this.client.get(key);

      if (!data) return [];

      const decisions = JSON.parse(data);
      return decisions.slice(-limit);
    } catch (error) {
      console.error('❌ Failed to get decision history:', error);
      return [];
    }
  }

  /**
   * Store intelligent memory context with compression
   */
  async storeMemoryContext(sessionId, contextData) {
    try {
      const key = `${this.memoryPrefix}${sessionId}:context`;
      const memoryEntry = {
        compressedContext: contextData.compressedContext,
        keyTopics: contextData.keyTopics || [],
        candidateProfile: contextData.candidateProfile || {},
        importantInsights: contextData.importantInsights || [],
        compressionRatio: contextData.compressionRatio || '1:1',
        lastCompression: new Date().toISOString(),
        aiMetadata: {
          compressionModel: contextData.compressionModel,
          intelligenceLevel: contextData.intelligenceLevel || 'standard'
        }
      };

      await this.client.setEx(key, this.sessionTTL, JSON.stringify(memoryEntry));
      return memoryEntry;
    } catch (error) {
      console.error('❌ Failed to store memory context:', error);
      throw error;
    }
  }

  /**
   * Get compressed memory context for efficient LLM processing
   */
  async getMemoryContext(sessionId) {
    try {
      const key = `${this.memoryPrefix}${sessionId}:context`;
      const data = await this.client.get(key);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get memory context:', error);
      return null;
    }
  }

  /**
   * Store coverage intelligence with AI reasoning
   */
  async storeCoverageIntelligence(sessionId, coverageData) {
    try {
      const key = `${this.intelligencePrefix}${sessionId}:coverage`;
      const intelligenceEntry = {
        coverageAnalysis: coverageData.analysis,
        aiInsights: coverageData.insights || [],
        inferredCompetencies: coverageData.inferredCompetencies || [],
        qualityScores: coverageData.qualityScores || {},
        gapAnalysis: coverageData.gapAnalysis || {},
        recommendedActions: coverageData.recommendedActions || [],
        confidenceMetrics: coverageData.confidenceMetrics || {},
        lastAnalysis: new Date().toISOString(),
        aiMetadata: {
          analysisModel: coverageData.analysisModel,
          processingDepth: coverageData.processingDepth || 'standard'
        }
      };

      await this.client.setEx(key, this.sessionTTL, JSON.stringify(intelligenceEntry));
      return intelligenceEntry;
    } catch (error) {
      console.error('❌ Failed to store coverage intelligence:', error);
      throw error;
    }
  }

  /**
   * Get coverage intelligence for smart decision making
   */
  async getCoverageIntelligence(sessionId) {
    try {
      const key = `${this.intelligencePrefix}${sessionId}:coverage`;
      const data = await this.client.get(key);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get coverage intelligence:', error);
      return null;
    }
  }

  /**
   * Get comprehensive AI state for session
   */
  async getAIState(sessionId) {
    try {
      const [
        analysisHistory,
        questionHistory,
        decisionHistory,
        memoryContext,
        coverageIntelligence
      ] = await Promise.all([
        this.getAIAnalysisHistory(sessionId, '*', 5),
        this.getQuestionHistory(sessionId, 10),
        this.getDecisionHistory(sessionId, 10),
        this.getMemoryContext(sessionId),
        this.getCoverageIntelligence(sessionId)
      ]);

      return {
        sessionId,
        analysisHistory,
        questionHistory,
        decisionHistory,
        memoryContext,
        coverageIntelligence,
        retrievedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get AI state:', error);
      return null;
    }
  }

  /**
   * Clean up AI data for session
   */
  async cleanupAIData(sessionId) {
    try {
      const patterns = [
        `${this.aiAnalysisPrefix}${sessionId}:*`,
        `${this.questionHistoryPrefix}${sessionId}`,
        `${this.decisionHistoryPrefix}${sessionId}`,
        `${this.memoryPrefix}${sessionId}:*`,
        `${this.intelligencePrefix}${sessionId}:*`
      ];

      let deletedCount = 0;
      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
          deletedCount += keys.length;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} AI data entries for session ${sessionId}`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup AI data:', error);
      return 0;
    }
  }
}

module.exports = new RedisSessionManager();