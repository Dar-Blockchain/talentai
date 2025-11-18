/**
 * Intelligent Interview WebSocket Controller
 * Handles real-time interview sessions with AI decision engine
 */

const intelligentInterviewService = require('../services/intelligentInterviewService');
const { v4: uuidv4 } = require('uuid');

class IntelligentInterviewController {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> socketId mapping
    this.service = intelligentInterviewService;
  }

  /**
   * Initialize WebSocket handlers
   */
  initializeHandlers(io) {
    // Create interview namespace
    const interviewNamespace = io.of('/interview');

    interviewNamespace.on('connection', (socket) => {
      console.log(`🔌 New interview connection: ${socket.id}`);

      // Start interview session
      socket.on('start_interview', async (data) => {
        try {
          const { config, candidateId } = data;
          const sessionId = uuidv4();

          console.log(`🚀 [Controller] Starting interview session: ${sessionId} for candidate: ${candidateId}`);
          console.log(`📋 [Controller] Config received:`, {
            interviewType: config.interviewType,
            targetRole: config.context?.targetRole,
            hasModels: !!config.models
          });

          // Store session mapping
          this.activeSessions.set(sessionId, socket.id);
          socket.sessionId = sessionId;
          console.log(`✅ [Controller] Session mapping stored`);

          // Start interview with AI service
          console.log(`⏳ [Controller] Calling intelligentInterviewService.startInterview()...`);
          const result = await this.service.startInterview(sessionId, config, candidateId);
          console.log(`✅ [Controller] Service returned:`, {
            success: result.success,
            sessionId: result.sessionId,
            greetingLength: result.greeting?.length
          });

          // Send success response with greeting
          console.log(`📤 [Controller] Emitting interview_started event to client...`);
          socket.emit('interview_started', {
            success: true,
            sessionId,
            greeting: result.greeting,
            config: result.config
          });
          console.log(`✅ [Controller] interview_started event emitted`);

          // Send initial greeting message
          socket.emit('interviewer_message', {
            type: 'greeting',
            content: result.greeting,
            timestamp: new Date().toISOString(),
            sessionId
          });

          console.log(`✅ [Controller] Interview session started successfully: ${sessionId}`);

        } catch (error) {
          console.error('❌ [Controller] Failed to start interview:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall
          });
          console.error('❌ [Controller] Stack trace:', error.stack);

          // Check if it's a Redis-specific error
          const isRedisError = error.message?.includes('Redis') ||
                               error.code === 'ECONNREFUSED' ||
                               error.syscall === 'connect';

          console.error('🔍 [Controller] Error analysis:', {
            isRedisError: isRedisError,
            errorType: error.constructor.name,
            errorCode: error.code
          });

          socket.emit('interview_error', {
            error: 'Failed to start interview',
            message: error.message,
            details: error.stack,
            isRedisError: isRedisError,
            hint: isRedisError ? 'Check if Redis server is running: redis-cli ping' : null
          });
        }
      });

      // Handle candidate responses
      socket.on('candidate_response', async (data) => {
        try {
          const { transcript, audioMetadata, v3Turn, turnOrder } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) {
            socket.emit('interview_error', { error: 'No active session' });
            return;
          }

          console.log(`💬 Processing candidate response in session: ${sessionId}`);
          if (v3Turn) {
            console.log(`✅ V3 Turn ${turnOrder || 'N/A'} detected with ${transcript?.length || 0} chars`);
          }

          // Reset inter-turn pause timer when new turn is received
          this.resetInterTurnPauseTimer(socket, sessionId);

          // Reset silence stage - candidate is responding
          await this.service.sessionManager.resetSilenceStage(sessionId);
          console.log(`🔄 [Session] Silence stage reset - candidate is responding`);

          // Process response with INTELLIGENT ANALYSIS (60% cost reduction)
          const decision = await this.service.processCandidateResponseIntelligently(
            sessionId,
            transcript,
            audioMetadata
          );

          // Handle different decision types
          await this.handleAIDecision(socket, sessionId, decision);

          // Send acknowledgment that message was processed successfully
          socket.emit('response_processed', {
            status: 'success',
            transcript: transcript.substring(0, 100), // First 100 chars
            decisionType: decision.type || 'continue',
            timestamp: new Date().toISOString()
          });

          console.log(`✅ Response processed and acknowledged for session: ${sessionId}`);

          // Start INTELLIGENT silence monitoring after AI responds
          // Timing adapts based on response quality and behavior patterns
          this.startIntelligentSilenceMonitoring(socket, sessionId, decision);

        } catch (error) {
          console.error('❌ Failed to process candidate response:', error.message);
          socket.emit('interview_error', {
            error: 'Failed to process response',
            message: error.message
          });

          // Send failure acknowledgment
          socket.emit('response_processed', {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle silence detection
      socket.on('silence_detected', async (data) => {
        try {
          const { silenceDuration } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) {
            socket.emit('interview_error', { error: 'No active session' });
            return;
          }

          console.log(`🔇 Silence detected in session: ${sessionId}, duration: ${silenceDuration}s`);

          // Handle silence with AI service
          const silenceResponse = await this.service.handleSilence(sessionId, silenceDuration);

          // Send silence response to client
          socket.emit('silence_response', {
            action: silenceResponse.action,
            content: silenceResponse.content,
            silenceCount: silenceResponse.silenceCount,
            timestamp: new Date().toISOString()
          });

          // If it's a prompt, also send as interviewer message
          if (silenceResponse.action === 'silence_prompt') {
            socket.emit('interviewer_message', {
              type: 'silence_prompt',
              content: silenceResponse.content,
              timestamp: new Date().toISOString(),
              sessionId
            });
          }

        } catch (error) {
          console.error('❌ Failed to handle silence:', error.message);
          socket.emit('interview_error', {
            error: 'Failed to handle silence',
            message: error.message
          });
        }
      });

      // Handle interview end
      socket.on('end_interview', async (data) => {
        try {
          const sessionId = socket.sessionId;

          if (!sessionId) {
            socket.emit('interview_error', { error: 'No active session' });
            return;
          }

          console.log(`🏁 Ending interview session: ${sessionId}`);

          // End interview with AI service
          const result = await this.service.endInterview(sessionId);

          // Send final report
          socket.emit('interview_ended', {
            success: true,
            finalReport: result.finalReport,
            analytics: result.sessionAnalytics,
            sessionId
          });

          // Clean up session mapping
          this.activeSessions.delete(sessionId);
          socket.sessionId = null;

          console.log(`✅ Interview session ended successfully: ${sessionId}`);

        } catch (error) {
          console.error('❌ Failed to end interview:', error.message);
          socket.emit('interview_error', {
            error: 'Failed to end interview',
            message: error.message
          });
        }
      });

      // Handle real-time audio stream (for voice activity detection)
      socket.on('audio_stream', async (data) => {
        try {
          const { audioData, isActive } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) return;

          // Emit voice activity status to client
          socket.emit('voice_activity', {
            isActive,
            timestamp: new Date().toISOString(),
            sessionId
          });

          // Update session with voice activity if needed
          if (isActive) {
            // Reset any silence timers or counters
            socket.emit('silence_reset');
          }

        } catch (error) {
          console.error('❌ Failed to process audio stream:', error.message);
        }
      });

      // Handle pause/resume interview
      socket.on('pause_interview', async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) return;

          // Update session status to paused
          // Implementation depends on specific requirements

          socket.emit('interview_paused', {
            sessionId,
            timestamp: new Date().toISOString()
          });

          console.log(`⏸️ Interview paused: ${sessionId}`);

        } catch (error) {
          console.error('❌ Failed to pause interview:', error.message);
        }
      });

      socket.on('resume_interview', async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) return;

          // Update session status to active
          // Implementation depends on specific requirements

          socket.emit('interview_resumed', {
            sessionId,
            timestamp: new Date().toISOString()
          });

          console.log(`▶️ Interview resumed: ${sessionId}`);

        } catch (error) {
          console.error('❌ Failed to resume interview:', error.message);
        }
      });

      // Handle get session status
      socket.on('get_session_status', async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) {
            socket.emit('session_status', { error: 'No active session' });
            return;
          }

          // Get session analytics from service
          const analytics = await this.service.sessionManager.getSessionAnalytics(sessionId);
          const session = await this.service.sessionManager.getSession(sessionId);

          socket.emit('session_status', {
            sessionId,
            status: session?.status || 'unknown',
            analytics,
            coverage: session?.coverage,
            realTimeReport: session?.realTimeReport,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('❌ Failed to get session status:', error.message);
          socket.emit('session_status', { error: 'Failed to get session status' });
        }
      });

      // Handle socket disconnection
      socket.on('disconnect', async (reason) => {
        console.log(`🔌 Interview connection disconnected: ${socket.id}, reason: ${reason}`);

        if (socket.sessionId) {
          try {
            // Clean up inter-turn pause timer
            this.resetInterTurnPauseTimer(socket, socket.sessionId);

            // Mark session as interrupted
            const session = await this.service.sessionManager.getSession(socket.sessionId);
            if (session && session.status === 'active') {
              await this.service.sessionManager.updateSession(socket.sessionId, {
                status: 'interrupted',
                disconnectReason: reason,
                disconnectTime: new Date().toISOString()
              });
            }

            // Clean up session mapping
            this.activeSessions.delete(socket.sessionId);
            console.log(`🧹 Cleaned up session mapping for: ${socket.sessionId}`);

          } catch (error) {
            console.error('❌ Failed to handle disconnect cleanup:', error.message);
          }
        }
      });

      // Handle connection error
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error.message);
        socket.emit('interview_error', {
          error: 'Connection error',
          message: error.message
        });
      });
    });

    console.log('✅ Interview WebSocket handlers initialized');
    return interviewNamespace;
  }

  /**
   * Handle AI decision and route to appropriate response
   */
  async handleAIDecision(socket, sessionId, decision) {
    try {
      const timestamp = new Date().toISOString();

      switch (decision.action) {
        case 'immediate_intervention':
          // INTELLIGENT SYSTEM: Immediate help needed (< 1s response)
          socket.emit('interviewer_message', {
            type: 'intervention',
            subtype: decision.interventionType,
            content: decision.content,
            reasoning: decision.reasoning,
            urgency: decision.urgency,
            timestamp,
            sessionId,
            lightweight: true
          });
          console.log(`🚨 [Immediate Intervention] ${decision.interventionType} - ${decision.urgency} urgency`);
          break;

        case 'continue_probing':
          // INTELLIGENT SYSTEM or normal AI decision
          socket.emit('interviewer_message', {
            type: 'question',
            content: decision.content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId,
            lightweight: decision.metadata?.lightweight || false
          });
          console.log(`💬 [Continue Probing] ${decision.metadata?.lightweight ? '(Optimized)' : '(Full AI)'}`);
          break;

        case 'question':
          // Send new question to candidate
          socket.emit('interviewer_message', {
            type: 'question',
            content: decision.content,
            reasoning: decision.reasoning,
            nextFocus: decision.nextFocus,
            timestamp,
            sessionId
          });
          break;

        case 'probe_deeper':
          // Send follow-up question
          socket.emit('interviewer_message', {
            type: 'follow_up',
            content: decision.content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId
          });
          break;

        case 'change_topic':
          // Signal topic change and send new question
          socket.emit('topic_change', {
            newTopic: decision.nextFocus,
            reason: decision.reasoning,
            timestamp,
            sessionId
          });

          socket.emit('interviewer_message', {
            type: 'new_topic',
            content: decision.content,
            topic: decision.nextFocus,
            timestamp,
            sessionId
          });
          break;

        case 'wrap_up':
          // Signal interview wrap-up
          socket.emit('interview_wrap_up', {
            message: decision.content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId
          });
          break;

        default:
          // Default to question
          socket.emit('interviewer_message', {
            type: 'question',
            content: decision.content,
            timestamp,
            sessionId
          });
      }

      // Always emit coverage update
      const session = await this.service.sessionManager.getSession(sessionId);
      if (session) {
        socket.emit('coverage_update', {
          coverage: session.coverage,
          timestamp,
          sessionId
        });

        // Emit real-time report update
        socket.emit('report_update', {
          report: session.realTimeReport,
          timestamp,
          sessionId
        });
      }

    } catch (error) {
      console.error('❌ Failed to handle AI decision:', error.message);
      socket.emit('interview_error', {
        error: 'Failed to process AI decision',
        message: error.message
      });
    }
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.keys());
  }

  /**
   * Force end a session (admin function)
   */
  async forceEndSession(sessionId) {
    try {
      if (this.activeSessions.has(sessionId)) {
        const socketId = this.activeSessions.get(sessionId);
        // Find socket and force disconnect
        // Implementation depends on how you store socket references

        // End session in service
        await this.service.endInterview(sessionId);

        // Clean up mapping
        this.activeSessions.delete(sessionId);

        console.log(`🔨 Force ended session: ${sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to force end session:', error.message);
      return false;
    }
  }

  /**
   * Broadcast message to all active sessions (admin function)
   */
  async broadcastToActiveSessions(io, message) {
    try {
      const interviewNamespace = io.of('/interview');
      interviewNamespace.emit('system_broadcast', {
        message,
        timestamp: new Date().toISOString(),
        type: 'admin_broadcast'
      });

      console.log(`📢 Broadcasted message to ${this.activeSessions.size} active sessions`);
      return true;
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error.message);
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics() {
    try {
      const totalActive = this.activeSessions.size;
      const totalProcessed = await this.service.sessionManager.getActiveSessionsCount();

      return {
        activeSessions: totalActive,
        totalProcessed,
        sessionMappings: this.activeSessions.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get session statistics:', error.message);
      return {
        activeSessions: this.activeSessions.size,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Start monitoring inter-turn pauses (silence BETWEEN complete responses)
   * V3 handles turn detection, this monitors silence after interviewer asks next question
   */
  /**
   * INTELLIGENT SILENCE MONITORING
   * Replaces dumb fixed timers with smart, context-aware timing
   * - No timers for excellent responses (quality >= 75)
   * - Faster intervention for struggling responses
   * - Adaptive timing based on response quality
   */
  async startIntelligentSilenceMonitoring(socket, sessionId, decision) {
    // Clear any existing timers
    this.resetInterTurnPauseTimer(socket, sessionId);

    // OPTIMIZATION: Skip timers for excellent responses (move on immediately)
    if (decision.metadata?.responseQuality >= 75) {
      console.log('⚡ [Smart Silence] No monitoring needed - excellent response (quality: ' + decision.metadata.responseQuality + ')');
      return;
    }

    // OPTIMIZATION: Skip timers for immediate interventions (already handled)
    if (decision.action === 'immediate_intervention') {
      console.log('⚡ [Smart Silence] No monitoring needed - immediate intervention already sent');
      return;
    }

    // Get session for adaptive timing
    const session = await this.service.sessionManager.getSession(sessionId);
    const complexity = session?.currentQuestionContext?.complexity || 'medium';
    const responseQuality = decision.metadata?.responseQuality || 50;

    // ADAPTIVE TIMING based on response quality
    let baseThresholds;
    if (responseQuality >= 60) {
      // Good response - standard waiting (rarely needs help)
      baseThresholds = {
        stage1: 40000, // 40s - longer patience
        stage2: 70000, // 70s
        stage3: 100000 // 100s
      };
      console.log('🟢 [Smart Silence] Good quality response - extended patience');
    } else if (responseQuality >= 40) {
      // Medium response - moderate waiting
      baseThresholds = {
        stage1: 30000, // 30s - standard
        stage2: 60000, // 60s
        stage3: 90000  // 90s
      };
      console.log('🟡 [Smart Silence] Medium quality response - standard timing');
    } else {
      // Poor response - faster help
      baseThresholds = {
        stage1: 20000, // 20s - faster intervention
        stage2: 45000, // 45s
        stage3: 70000  // 70s
      };
      console.log('🔴 [Smart Silence] Poor quality response - faster help');
    }

    // Apply complexity multipliers
    const multipliers = {
      simple: 0.8,
      medium: 1.0,
      complex: 1.3
    };

    const multiplier = multipliers[complexity] || 1.0;
    const thresholds = {
      stage1: Math.floor(baseThresholds.stage1 * multiplier),
      stage2: Math.floor(baseThresholds.stage2 * multiplier),
      stage3: Math.floor(baseThresholds.stage3 * multiplier)
    };

    console.log(`⏱️ [Smart Silence] Intelligent monitoring for ${sessionId}:`, {
      quality: responseQuality,
      complexity,
      stage1: `${thresholds.stage1/1000}s`,
      stage2: `${thresholds.stage2/1000}s`,
      stage3: `${thresholds.stage3/1000}s`
    });

    // Create adaptive timers
    const timers = {
      stage1: setTimeout(() => this.handleSilenceStage(socket, sessionId, 1, thresholds.stage1/1000), thresholds.stage1),
      stage2: setTimeout(() => this.handleSilenceStage(socket, sessionId, 2, thresholds.stage2/1000), thresholds.stage2),
      stage3: setTimeout(() => this.handleSilenceStage(socket, sessionId, 3, thresholds.stage3/1000), thresholds.stage3)
    };

    // Store timers
    if (!socket.interTurnTimers) {
      socket.interTurnTimers = new Map();
    }
    socket.interTurnTimers.set(sessionId, timers);
  }

  /**
   * OLD FIXED TIMER METHOD (kept for fallback)
   */
  async startInterTurnPauseMonitoring(socket, sessionId) {
    // Clear any existing timers
    this.resetInterTurnPauseTimer(socket, sessionId);

    // Get question complexity for adaptive timing
    const session = await this.service.sessionManager.getSession(sessionId);
    const complexity = session?.currentQuestionContext?.complexity || 'medium';

    // Base thresholds - Human-like patience (30s, 60s, 90s)
    const baseThresholds = {
      stage1: 30000, // 30s - patient waiting
      stage2: 60000, // 60s - help offer
      stage3: 90000  // 90s - rephrase
    };

    // Complexity multipliers (simple questions need less time)
    const multipliers = {
      simple: 0.8,    // 24s, 48s, 72s
      medium: 1.0,    // 30s, 60s, 90s
      complex: 1.3    // 39s, 78s, 117s
    };

    const multiplier = multipliers[complexity] || 1.0;
    const thresholds = {
      stage1: Math.floor(baseThresholds.stage1 * multiplier),
      stage2: Math.floor(baseThresholds.stage2 * multiplier),
      stage3: Math.floor(baseThresholds.stage3 * multiplier)
    };

    console.log(`⏱️ [SilenceMonitoring] Starting progressive timers for ${sessionId}:`, {
      complexity,
      stage1: `${thresholds.stage1/1000}s`,
      stage2: `${thresholds.stage2/1000}s`,
      stage3: `${thresholds.stage3/1000}s`
    });

    // Create 3 independent timers (one for each stage)
    const timers = {
      stage1: setTimeout(() => this.handleSilenceStage(socket, sessionId, 1, thresholds.stage1/1000), thresholds.stage1),
      stage2: setTimeout(() => this.handleSilenceStage(socket, sessionId, 2, thresholds.stage2/1000), thresholds.stage2),
      stage3: setTimeout(() => this.handleSilenceStage(socket, sessionId, 3, thresholds.stage3/1000), thresholds.stage3)
    };

    // Store all timers on socket (not just one)
    if (!socket.interTurnTimers) {
      socket.interTurnTimers = new Map();
    }
    socket.interTurnTimers.set(sessionId, timers);
  }

  /**
   * Handle individual silence stage timer firing
   */
  async handleSilenceStage(socket, sessionId, stage, silenceDuration) {
    console.log(`🔔 [SilenceStage] Stage ${stage} triggered after ${silenceDuration}s`);

    try {
      const silenceResponse = await this.service.handleSilence(sessionId, silenceDuration);

      // Send silence response to frontend
      socket.emit('silence_response', {
        action: silenceResponse.action,
        content: silenceResponse.content,
        silenceStage: stage,
        timestamp: new Date().toISOString(),
        isInterTurnPause: true
      });

      // Also send as interviewer message (so it displays)
      if (silenceResponse.content) {
        socket.emit('interviewer_message', {
          type: `silence_stage${stage}`,
          content: silenceResponse.content,
          timestamp: new Date().toISOString(),
          sessionId,
          metadata: silenceResponse.metadata
        });
      }
    } catch (error) {
      console.error(`❌ Failed to handle silence stage ${stage}:`, error.message);
    }
  }

  /**
   * Reset inter-turn pause timer when activity is detected
   */
  resetInterTurnPauseTimer(socket, sessionId) {
    if (socket.interTurnTimers && socket.interTurnTimers.has(sessionId)) {
      const timers = socket.interTurnTimers.get(sessionId);

      // Clear all 3 stage timers
      if (timers.stage1) clearTimeout(timers.stage1);
      if (timers.stage2) clearTimeout(timers.stage2);
      if (timers.stage3) clearTimeout(timers.stage3);

      socket.interTurnTimers.delete(sessionId);
      console.log(`🔇 [SilenceMonitoring] All 3 timers cleared for session: ${sessionId} (user activity detected)`);
      console.log(`✅ Silence monitoring paused - waiting for next complete response`);
    }
  }
}

module.exports = new IntelligentInterviewController();