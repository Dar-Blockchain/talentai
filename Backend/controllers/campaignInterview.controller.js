/**
 * Campaign Interview WebSocket Controller
 * Handles real-time campaign-based AI interview sessions.
 * Connects on namespace: /campaign-interview
 *
 * Emits the same events as /interview so the frontend hook works unchanged
 * (just point it at the new namespace via the `namespace` prop).
 */

const campaignInterviewService = require('../services/campaignInterview.service');
const { v4: uuidv4 } = require('uuid');

class CampaignInterviewController {
  constructor() {
    this.activeSessions = new Map(); // sessionId → socketId
    this.service = campaignInterviewService;
  }

  // ── Safe emit ────────────────────────────────────────────────────────────────

  safeEmit(socket, event, data) {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`[CampaignInterview] Socket disconnected — ${event} lost (session ${data?.sessionId || '?'})`);
    }
  }

  // ── Register handlers ────────────────────────────────────────────────────────

  initializeHandlers(io) {
    const ns = io.of('/campaign-interview');

    ns.on('connection', (socket) => {
      console.log(`🔌 [CampaignInterview] New connection: ${socket.id}`);

      // ── start_interview ────────────────────────────────────────────────────
      socket.on('start_interview', async (data) => {
        try {
          const { config, candidateId } = data;
          const sessionId = uuidv4();

          console.log(`🚀 [CampaignInterview] Starting session ${sessionId} for ${candidateId}`);
          console.log(`📋 [CampaignInterview] Config:`, {
            campaignId:  config.campaignId,
            moduleType:  config.moduleType,
            duration:    config.duration,
          });

          this.activeSessions.set(sessionId, socket.id);
          socket.sessionId = sessionId;

          // Stream greeting chunks to the client as they arrive
          const onGreetingChunk = (chunk) => {
            if (socket.connected) socket.emit('greeting_chunk', { content: chunk, sessionId });
          };

          const result = await this.service.startInterview(sessionId, config, candidateId, onGreetingChunk);

          if (socket.connected) socket.emit('greeting_complete', { sessionId });

          this.safeEmit(socket, 'interview_started', {
            success:   true,
            sessionId,
            greeting:  result.greeting,
            config:    result.config,
          });

          // Full greeting message (for clients that don't handle streaming)
          this.safeEmit(socket, 'interviewer_message', {
            type:      'greeting',
            content:   result.greeting,
            timestamp: new Date().toISOString(),
            sessionId,
          });

          console.log(`✅ [CampaignInterview] Session ${sessionId} started`);
        } catch (err) {
          console.error('❌ [CampaignInterview] start_interview error:', err.message);
          this.safeEmit(socket, 'interview_error', {
            error:   'Failed to start interview',
            message: err.message,
          });
        }
      });

      // ── candidate_response ─────────────────────────────────────────────────
      socket.on('candidate_response', async (data) => {
        const { transcript } = data;
        const sessionId = socket.sessionId;

        if (!sessionId) {
          this.safeEmit(socket, 'interview_error', { error: 'No active session' });
          return;
        }

        try {
          console.log(`💬 [CampaignInterview] Processing response in session ${sessionId}`);

          this.safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });

          const decision = await this.service.processCandidateResponse(sessionId, transcript);

          // Emit coverage update
          if (decision.coverage) {
            this.safeEmit(socket, 'coverage_update', { coverage: decision.coverage, sessionId });
          }

          // Emit real-time report update
          if (decision.report) {
            this.safeEmit(socket, 'report_update', { report: decision.report, sessionId });
          }

          if (decision.type === 'end_interview') {
            // Generate and send final report
            const endResult = await this.service.endInterview(sessionId);
            this.activeSessions.delete(sessionId);

            this.safeEmit(socket, 'interviewer_message', {
              type:      'closing',
              content:   decision.content,
              timestamp: new Date().toISOString(),
              sessionId,
            });

            // Small delay before sending ended event so client renders the closing message first
            setTimeout(() => {
              this.safeEmit(socket, 'interview_ended', {
                sessionId,
                finalReport: endResult.finalReport,
                analytics:   endResult.analytics,
              });
            }, 1500);
          } else {
            // next_question or follow_up
            const messageType = decision.type === 'follow_up' ? 'follow_up' : 'question';
            this.safeEmit(socket, 'interviewer_message', {
              type:      messageType,
              content:   decision.content,
              timestamp: new Date().toISOString(),
              sessionId,
              metadata: { analysis: decision.analysis },
            });
          }

          // Acknowledge successful processing
          this.safeEmit(socket, 'response_processed', {
            status:    'success',
            transcript: (transcript || '').substring(0, 100),
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error('❌ [CampaignInterview] candidate_response error:', err.message);
          this.safeEmit(socket, 'interview_error', {
            error:   'Failed to process response',
            message: err.message,
          });
          this.safeEmit(socket, 'response_processed', {
            status:    'error',
            error:     err.message,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // ── end_interview ──────────────────────────────────────────────────────
      socket.on('end_interview', async (data) => {
        const sessionId = data?.sessionId || socket.sessionId;
        if (!sessionId) return;

        try {
          console.log(`🏁 [CampaignInterview] Ending session ${sessionId}`);
          const result = await this.service.endInterview(sessionId);
          this.activeSessions.delete(sessionId);

          this.safeEmit(socket, 'interview_ended', {
            sessionId,
            finalReport: result.finalReport,
            analytics:   result.analytics,
          });
        } catch (err) {
          console.error('❌ [CampaignInterview] end_interview error:', err.message);
          this.safeEmit(socket, 'interview_error', {
            error:   'Failed to end interview',
            message: err.message,
          });
        }
      });

      // ── get_session_status ─────────────────────────────────────────────────
      socket.on('get_session_status', async () => {
        const sessionId = socket.sessionId;
        if (!sessionId) {
          this.safeEmit(socket, 'session_status', { hasSession: false });
          return;
        }
        try {
          const session = await this.service.sessionManager.getSession(sessionId);
          this.safeEmit(socket, 'session_status', {
            hasSession:     !!session,
            sessionId,
            questionsAsked: session?.questionsAsked || 0,
            coverage:       session?.coverage || null,
          });
        } catch (err) {
          this.safeEmit(socket, 'session_status', { hasSession: false, error: err.message });
        }
      });

      // ── disconnect ─────────────────────────────────────────────────────────
      socket.on('disconnect', (reason) => {
        console.log(`🔌 [CampaignInterview] Disconnected: ${socket.id} (${reason})`);
        if (socket.sessionId) {
          this.activeSessions.delete(socket.sessionId);
        }
      });
    });

    console.log('✅ [CampaignInterview] Namespace /campaign-interview registered');
  }
}

module.exports = new CampaignInterviewController();
