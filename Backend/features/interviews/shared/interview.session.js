/**
 * Redis Session Manager for Intelligent Interviews
 * Manages interview sessions, state, and real-time data
 */

const redis = require('redis');
require('dotenv').config();

const TECH_LABELS = {
  reactjs: 'ReactJS', nodejs: 'Node.js', expressjs: 'ExpressJS', nextjs: 'Next.js',
  vuejs: 'Vue.js', angularjs: 'AngularJS', typescript: 'TypeScript', javascript: 'JavaScript',
  python: 'Python', java: 'Java', golang: 'Go', rust: 'Rust', ruby: 'Ruby',
  css: 'CSS', html: 'HTML', html5: 'HTML5', css3: 'CSS3',
  api: 'API', rest: 'REST', graphql: 'GraphQL', http: 'HTTP', grpc: 'gRPC',
  sql: 'SQL', nosql: 'NoSQL', mongodb: 'MongoDB', postgresql: 'PostgreSQL',
  mysql: 'MySQL', redis: 'Redis', elasticsearch: 'Elasticsearch',
  aws: 'AWS', gcp: 'GCP', azure: 'Azure', docker: 'Docker', kubernetes: 'Kubernetes',
  ci: 'CI', cd: 'CD', cicd: 'CI/CD', devops: 'DevOps',
  ui: 'UI', ux: 'UX', oop: 'OOP', ai: 'AI', ml: 'ML',
  blockchain: 'Blockchain', web3: 'Web3', defi: 'DeFi',
  kotlin: 'Kotlin', swift: 'Swift', flutter: 'Flutter', dart: 'Dart',
};

function formatAreaLabel(key) {
  return key
    .split('_')
    .map(w => TECH_LABELS[w.toLowerCase()] || (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

class RedisSessionManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.sessionPrefix = 'interview:';
    this.coveragePrefix = 'coverage:';
    this.reportPrefix = 'report:';
    this.sessionTTL = 7200; // 2 hours
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = redis.createClient({
        url: redisUrl,
        retry_strategy: (options) => {


          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('❌ [Redis] Connection refused - Redis server not running or unreachable');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('❌ [Redis] Retry time exhausted (>1 hour)');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            console.error('❌ [Redis] Max retry attempts reached (10)');
            return undefined;
          }

          const delay = Math.min(options.attempt * 100, 3000);
          return delay;
        }
      });

      // Enhanced event listeners
      this.client.on('error', (err) => {
        console.error('❌ [Redis] Client Error:', {
          message: err.message,
          code: err.code,
          errno: err.errno,
          syscall: err.syscall,
          address: err.address,
          port: err.port,
          stack: err.stack
        });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        this.isConnected = false;
      });

      this.client.on('end', () => {
        this.isConnected = false;
      });

      await this.client.connect();

      const pingResult = await this.client.ping();



      return true;
    } catch (error) {
      console.error('❌ [Redis] Failed to initialize:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        address: error.address,
        port: error.port,
        stack: error.stack
      });
      console.error('⚠️  [Redis] Redis will be unavailable - Interview service will operate in degraded mode');
      return false;
    }
  }

  /**
   * Create new interview session
   */
  async createSession(sessionId, config, candidateId) {
    try {


      if (!this.client || !this.isConnected) {
        console.error('❌ [Redis] Cannot create session - Redis client not connected');
        throw new Error('Redis client not connected');
      }

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
        // REMOVED: No silenceStage tracking for MVP - using manual "Next" button only
        // silenceStage: 0,
        currentQuestionContext: {
          originalQuestion: null,
          askedAt: null,
          complexity: 'medium', // simple, medium, complex
          hasBeenRephrased: false,
          rephraseHistory: [],
          silenceStartTime: null
        },
        candidateBehavior: {
          responseLength: [],
          silenceDuration: [],
          interactionStyle: 'unknown',
          adaptationNeeded: false
        },
        behaviorTrackerData: null, // Intelligent Response System behavior tracker state
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
      const jsonData = JSON.stringify(sessionData);
      const dataSize = Buffer.byteLength(jsonData, 'utf8');



      await this.client.setEx(key, this.sessionTTL, jsonData);

      // Verify storage with immediate read
      const storedData = await this.client.get(key);
      if (storedData) {
        const parsed = JSON.parse(storedData);

      } else {
        console.error('⚠️  [Redis] WARNING: Session data not found after storage!');
      }

      return sessionData;
    } catch (error) {
      console.error('❌ [Redis] Failed to create session:', {
        sessionId: sessionId,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
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
   * Save current question for potential rephrasing
   */
  async saveCurrentQuestion(sessionId, questionContent, complexity = 'medium') {
    try {
      const currentQuestionContext = {
        originalQuestion: questionContent,
        askedAt: Date.now(),
        complexity: complexity,
        hasBeenRephrased: false,
        rephraseHistory: [],
        silenceStartTime: null
      };

      await this.updateSession(sessionId, {
        currentQuestionContext
        // REMOVED: No silenceStage tracking for MVP
      });



      return currentQuestionContext;
    } catch (error) {
      console.error('❌ Failed to save current question:', error.message);
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

      return session;
    } catch (error) {
      console.error('❌ Failed to end session:', error.message);
      throw error;
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
        label: formatAreaLabel(area.area),
        percentage: 0,
        indicators: area.indicators.map(indicator => ({
          name: indicator,
          covered: false,
          evidence: [],
          quality: 0
        })),
        weight: area.weight,
        depth: area.depth,
        completed: false,
        skipCount: 0,
        skippedQuestions: [],
      };
    });

    return coverage;
  }

  /**
   * Set area start time if this is the first question targeting this area
   */
  async setAreaStartTime(sessionId, areaName) {
    try {
      const session = await this.getSession(sessionId);
      if (session?.coverage?.areas?.[areaName] && !session.coverage.areas[areaName].startTime) {
        session.coverage.areas[areaName].startTime = Date.now();
        await this.updateCoverage(sessionId, session.coverage);
      }
    } catch (error) {
      console.error('❌ Failed to set area start time:', error.message);
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
      }
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error.message);
    }
  }
}

module.exports = new RedisSessionManager();