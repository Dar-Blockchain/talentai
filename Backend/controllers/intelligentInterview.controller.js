/**
 * Intelligent Interview WebSocket Controller
 * Handles real-time interview sessions with AI decision engine
 */

const intelligentInterviewService = require("../services/intelligentInterview.service");
const { v4: uuidv4 } = require("uuid");

class IntelligentInterviewController {
  constructor() {
    this.activeSessions = new Map(); // sessionId -> socketId mapping
    this.service = intelligentInterviewService;
  }

  /**
   * Safe socket emit — prevents crashes when socket disconnects mid-processing.
   */
  safeEmit(socket, event, data) {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      console.error(`[Socket] Disconnected — ${event} event lost for session ${data?.sessionId || 'unknown'}`);
    }
  }

  /**
   * Initialize WebSocket handlers
   */
  initializeHandlers(io) {
    // Create interview namespace
    const interviewNamespace = io.of("/interview");

    interviewNamespace.on("connection", (socket) => {
      console.log(`🔌 New interview connection: ${socket.id}`);

      // Start interview session
      socket.on("start_interview", async (data) => {
        try {
          const { config, candidateId } = data;
          const sessionId = uuidv4();

          console.log(
            `🚀 [Controller] Starting interview session: ${sessionId} for candidate: ${candidateId}`,
          );
          console.log(`📋 [Controller] Config received:`, {
            interviewType: config.interviewType,
            targetRole: config.context?.targetRole,
            hasModels: !!config.models,
          });

          // Store session mapping
          this.activeSessions.set(sessionId, socket.id);
          socket.sessionId = sessionId;
          console.log(`✅ [Controller] Session mapping stored`);

          // Start interview with AI service (stream greeting chunks to client)
          console.log(
            `⏳ [Controller] Calling intelligentInterviewService.startInterview()...`,
          );
          const onGreetingChunk = (chunk) => {
            if (socket.connected) {
              socket.emit("greeting_chunk", { content: chunk, sessionId });
            }
          };
          const result = await this.service.startInterview(
            sessionId,
            config,
            candidateId,
            onGreetingChunk,
          );
          console.log(`✅ [Controller] Service returned:`, {
            success: result.success,
            sessionId: result.sessionId,
            greetingLength: result.greeting?.length,
          });

          // Signal greeting streaming is complete
          if (socket.connected) {
            socket.emit("greeting_complete", { sessionId });
          }

          // Send success response with full greeting + metadata
          console.log(
            `📤 [Controller] Emitting interview_started event to client...`,
          );
          this.safeEmit(socket, "interview_started", {
            success: true,
            sessionId,
            greeting: result.greeting,
            config: result.config,
            jobDetails: result.jobDetails,
            targetRole: result.targetRole,
            targetCompany: result.targetCompany,
          });
          console.log(`✅ [Controller] interview_started event emitted`);

          // Send initial greeting message (full content for clients that don't support streaming)
          this.safeEmit(socket, "interviewer_message", {
            type: "greeting",
            content: result.greeting,
            timestamp: new Date().toISOString(),
            sessionId,
          });

          console.log(
            `✅ [Controller] Interview session started successfully: ${sessionId}`,
          );
        } catch (error) {
          console.error("❌ [Controller] Failed to start interview:", {
            message: error.message,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
          });
          console.error("❌ [Controller] Stack trace:", error.stack);

          // Check if it's a Redis-specific error
          const isRedisError =
            error.message?.includes("Redis") ||
            error.code === "ECONNREFUSED" ||
            error.syscall === "connect";

          console.error("🔍 [Controller] Error analysis:", {
            isRedisError: isRedisError,
            errorType: error.constructor.name,
            errorCode: error.code,
          });

          this.safeEmit(socket, "interview_error", {
            error: "Failed to start interview",
            message: error.message,
            details: error.stack,
            isRedisError: isRedisError,
            hint: isRedisError
              ? "Check if Redis server is running: redis-cli ping"
              : null,
          });
        }
      });

      // Handle candidate responses
      socket.on("candidate_response", async (data) => {
        try {
          const { transcript, audioMetadata, v3Turn, turnOrder } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) {
            this.safeEmit(socket, "interview_error", { error: "No active session" });
            return;
          }

          console.log(
            `💬 Processing candidate response in session: ${sessionId}`,
          );
          if (v3Turn) {
            console.log(
              `✅ V3 Turn ${turnOrder || "N/A"} detected with ${transcript?.length || 0} chars`,
            );
          }

          // Emit typing indicator so frontend can show "..." while AI processes
          if (socket.connected) {
            this.safeEmit(socket, "interviewer_typing", { sessionId, status: "thinking" });
          }

          // Reset inter-turn pause timer when new turn is received
          this.resetInterTurnPauseTimer(socket, sessionId);

          // REMOVED: No silence stage tracking in MVP manual flow
          // await this.service.sessionManager.resetSilenceStage(sessionId);

          // Process response with INTELLIGENT ANALYSIS (60% cost reduction)
          const decision =
            await this.service.processCandidateResponseIntelligently(
              sessionId,
              transcript,
              audioMetadata,
            );

          // Handle different decision types
          await this.handleAIDecision(socket, sessionId, decision);

          // Send acknowledgment that message was processed successfully
          this.safeEmit(socket, "response_processed", {
            status: "success",
            transcript: transcript.substring(0, 100), // First 100 chars
            decisionType: decision.type || "continue",
            timestamp: new Date().toISOString(),
          });

          console.log(
            `✅ Response processed and acknowledged for session: ${sessionId}`,
          );

          // Start INTELLIGENT silence monitoring after AI responds
          // Timing adapts based on response quality and behavior patterns
          this.startIntelligentSilenceMonitoring(socket, sessionId, decision);
        } catch (error) {
          console.error(
            "❌ Failed to process candidate response:",
            error.message,
          );
          this.safeEmit(socket, "interview_error", {
            error: "Failed to process response",
            message: error.message,
          });

          // Send failure acknowledgment
          this.safeEmit(socket, "response_processed", {
            status: "error",
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // REMOVED: Automatic silence detection - using manual "Next" button only for MVP
      // socket.on('silence_detected', async (data) => { ... });

      // Handle speaking too long (polite interrupt after 3 minutes)
      socket.on("speaking_too_long", async (data) => {
        try {
          const { duration } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) {
            this.safeEmit(socket, "interview_error", { error: "No active session" });
            return;
          }

          console.log(
            `⏱️  Candidate speaking too long (${Math.round(duration / 1000)}s) - polite interrupt`,
          );

          const session = await this.sessionManager.getSession(sessionId);

          // Generate next question
          const coverageAnalysis =
            await this.service.coverageAI.analyzeCoverageIntelligently(
              "[LONG RESPONSE - TIME LIMIT]",
              session.coverage,
              session.config.intelligenceContext.focusAreas,
              session.conversation,
            );

          const nextQuestion =
            await this.service.questionAI.generateIntelligentQuestion(
              session,
              coverageAnalysis,
              {
                previousQuestions: session.conversation.filter(
                  (e) => e.type === "interviewer",
                ),
              },
            );

          // Send polite interrupt message
          this.safeEmit(socket, "interviewer_message", {
            type: "polite_interrupt",
            content:
              "Thank you for that detailed answer. Let's move on to the next question.",
            timestamp: new Date().toISOString(),
            sessionId,
          });

          // Wait 2 seconds, then send next question
          setTimeout(() => {
            this.safeEmit(socket, "interviewer_message", {
              type: "question",
              content: nextQuestion.question,
              timestamp: new Date().toISOString(),
              sessionId,
              metadata: {
                reason: "time_limit",
                previousDuration: duration,
                targetAreas: nextQuestion.targetAreas,
              },
            });

            // Store in conversation
            this.service.sessionManager.addConversationEntry(sessionId, {
              type: "interviewer",
              content: nextQuestion.question,
              timestamp: new Date().toISOString(),
              metadata: {
                aiGenerated: true,
                targetAreas: nextQuestion.targetAreas,
                reasoning: "Time limit reached - moving forward",
              },
            });

            console.log(`✅ Sent next question after polite interrupt`);
          }, 2000);
        } catch (error) {
          console.error("❌ Failed to handle long speaking:", error.message);
          this.safeEmit(socket, "interview_error", {
            error: "Failed to handle long response",
            message: error.message,
          });
        }
      });

      // Handle interview end
      socket.on("end_interview", async (data) => {
        try {
          const sessionId = socket.sessionId;

          if (!sessionId) {
            this.safeEmit(socket, "interview_error", { error: "No active session" });
            return;
          }

          console.log(`🏁 Ending interview session: ${sessionId}`);

          // End interview with AI service
          const result = await this.service.endInterview(sessionId);

          // Send final report
          this.safeEmit(socket, "interview_ended", {
            success: true,
            finalReport: result.finalReport,
            analytics: result.sessionAnalytics,
            sessionId,
          });

          // Clean up session mapping
          this.activeSessions.delete(sessionId);
          socket.sessionId = null;

          console.log(`✅ Interview session ended successfully: ${sessionId}`);
        } catch (error) {
          console.error("❌ Failed to end interview:", error.message);
          this.safeEmit(socket, "interview_error", {
            error: "Failed to end interview",
            message: error.message,
          });
        }
      });

      // Handle real-time audio stream (for voice activity detection)
      socket.on("audio_stream", async (data) => {
        try {
          const { audioData, isActive } = data;
          const sessionId = socket.sessionId;

          if (!sessionId) return;

          // Emit voice activity status to client
          this.safeEmit(socket, "voice_activity", {
            isActive,
            timestamp: new Date().toISOString(),
            sessionId,
          });

          // Update session with voice activity if needed
          if (isActive) {
            // Reset any silence timers or counters
            this.safeEmit(socket, "silence_reset", {});
          }
        } catch (error) {
          console.error("❌ Failed to process audio stream:", error.message);
        }
      });

      // Handle pause/resume interview
      socket.on("pause_interview", async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) return;

          // Update session status to paused
          // Implementation depends on specific requirements

          this.safeEmit(socket, "interview_paused", {
            sessionId,
            timestamp: new Date().toISOString(),
          });

          console.log(`⏸️ Interview paused: ${sessionId}`);
        } catch (error) {
          console.error("❌ Failed to pause interview:", error.message);
        }
      });

      socket.on("resume_interview", async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) return;

          // Update session status to active
          // Implementation depends on specific requirements

          this.safeEmit(socket, "interview_resumed", {
            sessionId,
            timestamp: new Date().toISOString(),
          });

          console.log(`▶️ Interview resumed: ${sessionId}`);
        } catch (error) {
          console.error("❌ Failed to resume interview:", error.message);
        }
      });

      // Handle get session status
      socket.on("get_session_status", async (data) => {
        try {
          const sessionId = socket.sessionId;
          if (!sessionId) {
            this.safeEmit(socket, "session_status", { error: "No active session" });
            return;
          }

          // Get session analytics from service
          const analytics =
            await this.service.sessionManager.getSessionAnalytics(sessionId);
          const session =
            await this.service.sessionManager.getSession(sessionId);

          this.safeEmit(socket, "session_status", {
            sessionId,
            status: session?.status || "unknown",
            analytics,
            coverage: session?.coverage,
            realTimeReport: session?.realTimeReport,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("❌ Failed to get session status:", error.message);
          this.safeEmit(socket, "session_status", {
            error: "Failed to get session status",
          });
        }
      });

      // Handle socket disconnection
      socket.on("disconnect", async (reason) => {
        console.log(
          `🔌 Interview connection disconnected: ${socket.id}, reason: ${reason}`,
        );

        if (socket.sessionId) {
          try {
            // Clean up inter-turn pause timer
            this.resetInterTurnPauseTimer(socket, socket.sessionId);

            // Mark session as interrupted
            const session = await this.service.sessionManager.getSession(
              socket.sessionId,
            );
            if (session && session.status === "active") {
              await this.service.sessionManager.updateSession(
                socket.sessionId,
                {
                  status: "interrupted",
                  disconnectReason: reason,
                  disconnectTime: new Date().toISOString(),
                },
              );
            }

            // Clean up session mapping
            this.activeSessions.delete(socket.sessionId);
            console.log(
              `🧹 Cleaned up session mapping for: ${socket.sessionId}`,
            );
          } catch (error) {
            console.error(
              "❌ Failed to handle disconnect cleanup:",
              error.message,
            );
          }
        }
      });

      // Handle connection error
      socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error.message);
        this.safeEmit(socket, "interview_error", {
          error: "Connection error",
          message: error.message,
        });
      });
    });

    console.log("✅ Interview WebSocket handlers initialized");
    return interviewNamespace;
  }

  /**
   * Handle AI decision and route to appropriate response
   */
  async handleAIDecision(socket, sessionId, decision) {
    try {
      const timestamp = new Date().toISOString();

      // Validate socket is still connected before emitting
      if (!socket.connected) {
        console.warn(`⚠️ [Controller] Socket disconnected, skipping emit for session: ${sessionId}`);
        return;
      }

      // Validate decision.content — fallback if undefined
      const content = decision.content || (decision.action === 'end_interview'
        ? 'Thank you for your time. This concludes our interview.'
        : "Can you tell me more about your experience?");
      if (!decision.content) {
        console.warn(`⚠️ [Controller] decision.content was undefined for action: ${decision.action}, using fallback`);
      }

      switch (decision.action) {
        case "immediate_intervention":
          this.safeEmit(socket, "interviewer_message", {
            type: "intervention",
            subtype: decision.interventionType,
            content,
            reasoning: decision.reasoning,
            urgency: decision.urgency,
            timestamp,
            sessionId,
          });
          console.log(
            `🚨 [Immediate Intervention] ${decision.interventionType} - ${decision.urgency} urgency`,
          );
          break;

        case "continue_probing":
          this.safeEmit(socket, "interviewer_message", {
            type: "question",
            content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId,
          });
          console.log(`💬 [Continue Probing] (Full AI)`);
          break;

        case "question":
          this.safeEmit(socket, "interviewer_message", {
            type: "question",
            content,
            reasoning: decision.reasoning,
            nextFocus: decision.nextFocus,
            timestamp,
            sessionId,
          });
          break;

        case "probe_deeper":
          this.safeEmit(socket, "interviewer_message", {
            type: "follow_up",
            content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId,
          });
          break;

        case "change_topic":
          this.safeEmit(socket, "topic_change", {
            newTopic: decision.nextFocus,
            reason: decision.reasoning,
            timestamp,
            sessionId,
          });

          if (socket.connected) {
            this.safeEmit(socket, "interviewer_message", {
              type: "new_topic",
              content,
              topic: decision.nextFocus,
              timestamp,
              sessionId,
            });
          }
          break;

        case "wrap_up":
          this.safeEmit(socket, "interview_wrap_up", {
            message: content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId,
          });
          break;

        case "end_interview":
          this.safeEmit(socket, "interviewer_message", {
            type: "end_interview",
            content,
            reasoning: decision.reasoning,
            timestamp,
            sessionId,
          });
          break;

        default:
          this.safeEmit(socket, "interviewer_message", {
            type: "question",
            content,
            timestamp,
            sessionId,
          });
      }

      // Always emit coverage update (check connected)
      if (socket.connected) {
        const session = await this.service.sessionManager.getSession(sessionId);
        if (session) {
          this.safeEmit(socket, "coverage_update", {
            coverage: session.coverage,
            timestamp,
            sessionId,
          });

          this.safeEmit(socket, "report_update", {
            report: session.realTimeReport,
            timestamp,
            sessionId,
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to handle AI decision:", error.message);
      if (socket.connected) {
        this.safeEmit(socket, "interview_error", {
          error: "Failed to process AI decision",
          message: error.message,
        });
      }
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
      console.error("❌ Failed to force end session:", error.message);
      return false;
    }
  }

  /**
   * Broadcast message to all active sessions (admin function)
   */
  async broadcastToActiveSessions(io, message) {
    try {
      const interviewNamespace = io.of("/interview");
      interviewNamespace.emit("system_broadcast", {
        message,
        timestamp: new Date().toISOString(),
        type: "admin_broadcast",
      });

      console.log(
        `📢 Broadcasted message to ${this.activeSessions.size} active sessions`,
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to broadcast message:", error.message);
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics() {
    try {
      const totalActive = this.activeSessions.size;
      const totalProcessed =
        await this.service.sessionManager.getActiveSessionsCount();

      return {
        activeSessions: totalActive,
        totalProcessed,
        sessionMappings: this.activeSessions.size,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to get session statistics:", error.message);
      return {
        activeSessions: this.activeSessions.size,
        error: error.message,
        timestamp: new Date().toISOString(),
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
      console.log(
        "⚡ [Smart Silence] No monitoring needed - excellent response (quality: " +
          decision.metadata.responseQuality +
          ")",
      );
      return;
    }

    // OPTIMIZATION: Skip timers for immediate interventions (already handled)
    if (decision.action === "immediate_intervention") {
      console.log(
        "⚡ [Smart Silence] No monitoring needed - immediate intervention already sent",
      );
      return;
    }

    // Get session for adaptive timing
    const session = await this.service.sessionManager.getSession(sessionId);
    const complexity = session?.currentQuestionContext?.complexity || "medium";
    const responseQuality = decision.metadata?.responseQuality || 50;

    // ADAPTIVE TIMING based on response quality
    let baseThresholds;
    if (responseQuality >= 60) {
      // Good response - standard waiting (rarely needs help)
      baseThresholds = {
        stage1: 40000, // 40s - longer patience
        stage2: 70000, // 70s
        stage3: 100000, // 100s
      };
      console.log(
        "🟢 [Smart Silence] Good quality response - extended patience",
      );
    } else if (responseQuality >= 40) {
      // Medium response - moderate waiting
      baseThresholds = {
        stage1: 30000, // 30s - standard
        stage2: 60000, // 60s
        stage3: 90000, // 90s
      };
      console.log(
        "🟡 [Smart Silence] Medium quality response - standard timing",
      );
    } else {
      // Poor response - faster help
      baseThresholds = {
        stage1: 20000, // 20s - faster intervention
        stage2: 45000, // 45s
        stage3: 70000, // 70s
      };
      console.log("🔴 [Smart Silence] Poor quality response - faster help");
    }

    // Apply complexity multipliers
    const multipliers = {
      simple: 0.8,
      medium: 1.0,
      complex: 1.3,
    };

    const multiplier = multipliers[complexity] || 1.0;
    const thresholds = {
      stage1: Math.floor(baseThresholds.stage1 * multiplier),
      stage2: Math.floor(baseThresholds.stage2 * multiplier),
      stage3: Math.floor(baseThresholds.stage3 * multiplier),
    };

    console.log(`⏱️ [Smart Silence] Intelligent monitoring for ${sessionId}:`, {
      quality: responseQuality,
      complexity,
      stage1: `${thresholds.stage1 / 1000}s`,
      stage2: `${thresholds.stage2 / 1000}s`,
      stage3: `${thresholds.stage3 / 1000}s`,
    });

    // REMOVED: No automatic silence stage timers for MVP - using manual "Next" button only
    // const timers = { stage1: ..., stage2: ..., stage3: ... };
    // socket.interTurnTimers.set(sessionId, timers);
  }

  /**
   * OLD FIXED TIMER METHOD (kept for fallback)
   */
  async startInterTurnPauseMonitoring(socket, sessionId) {
    // Clear any existing timers
    this.resetInterTurnPauseTimer(socket, sessionId);

    // Get question complexity for adaptive timing
    const session = await this.service.sessionManager.getSession(sessionId);
    const complexity = session?.currentQuestionContext?.complexity || "medium";

    // Base thresholds - Human-like patience (30s, 60s, 90s)
    const baseThresholds = {
      stage1: 30000, // 30s - patient waiting
      stage2: 60000, // 60s - help offer
      stage3: 90000, // 90s - rephrase
    };

    // Complexity multipliers (simple questions need less time)
    const multipliers = {
      simple: 0.8, // 24s, 48s, 72s
      medium: 1.0, // 30s, 60s, 90s
      complex: 1.3, // 39s, 78s, 117s
    };

    const multiplier = multipliers[complexity] || 1.0;
    const thresholds = {
      stage1: Math.floor(baseThresholds.stage1 * multiplier),
      stage2: Math.floor(baseThresholds.stage2 * multiplier),
      stage3: Math.floor(baseThresholds.stage3 * multiplier),
    };

    console.log(
      `⏱️ [SilenceMonitoring] Starting progressive timers for ${sessionId}:`,
      {
        complexity,
        stage1: `${thresholds.stage1 / 1000}s`,
        stage2: `${thresholds.stage2 / 1000}s`,
        stage3: `${thresholds.stage3 / 1000}s`,
      },
    );

    // REMOVED: No automatic silence stage timers for MVP - using manual "Next" button only
    // const timers = { stage1: ..., stage2: ..., stage3: ... };
    // socket.interTurnTimers.set(sessionId, timers);
  }

  /**
   * REMOVED: No automatic silence stage handling for MVP - using manual "Next" button only
   */
  // async handleSilenceStage(socket, sessionId, stage, silenceDuration) { ... }

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
      console.log(
        `🔇 [SilenceMonitoring] All 3 timers cleared for session: ${sessionId} (user activity detected)`,
      );
      console.log(
        `✅ Silence monitoring paused - waiting for next complete response`,
      );
    }
  }
}

module.exports = new IntelligentInterviewController();
