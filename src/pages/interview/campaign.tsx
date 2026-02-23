'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Types
import {
  InterviewMessage,
  Coverage,
  RealTimeReport,
} from '@/types/interview';

// Hooks — shared utilities, safe to import alongside hr.tsx
import { useNotification } from '@/hooks/useNotification';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useCamera } from '@/hooks/useCamera';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useInterviewConfig } from '@/hooks/useInterviewConfig';
import { useInterviewSocket, InterviewStartedData, InterviewEndedData, SilenceResponseData } from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// Shared interview UI components (display-only, no hr-specific logic)
import QuestionPanel from '@/components/interview/QuestionPanel';
import CameraPreview from '@/components/interview/CameraPreview';
import AgentStatusPanel from '@/components/interview/AgentStatusPanel';
import CoverageDashboard from '@/components/interview/CoverageDashboard';
import PipelineModals from '@/components/interview/PipelineModals';
import SecurityModals from '@/components/interview/SecurityModals';
import InterviewTimer from '@/components/interview/InterviewTimer';
import { GlobalStyles } from '@/components/interview/styles';

// MUI icons
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AssessmentIcon from '@mui/icons-material/Assessment';

// ─── Module color map ──────────────────────────────────────────────────────────
const MODULE_COLORS: Record<string, { gradient: string; shadow: string }> = {
  SKILL_TEST:    { gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', shadow: 'rgba(124,58,237,0.4)' },
  AI_INTERVIEW:  { gradient: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)', shadow: 'rgba(13,148,136,0.4)' },
  QUESTIONNAIRE: { gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', shadow: 'rgba(37,99,235,0.4)' },
  TRAINING_PATH: { gradient: 'linear-gradient(135deg, #C2410C 0%, #92400E 100%)', shadow: 'rgba(194,65,12,0.4)' },
  DEFAULT:       { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102,126,234,0.4)' },
};

// ─── Campaign Interview Header ─────────────────────────────────────────────────
interface CampaignInterviewHeaderProps {
  campaignTitle: string;
  moduleType: string;
  skill?: string;
  interviewType?: string;
  stepLabel: string;
  interviewStatus: string;
  isVoiceActive: boolean;
  cameraStatus: string;
  agentState: string;
}

const CampaignInterviewHeader: React.FC<CampaignInterviewHeaderProps> = ({
  campaignTitle,
  moduleType,
  skill,
  interviewType,
  stepLabel,
  interviewStatus,
  isVoiceActive,
  cameraStatus,
  agentState,
}) => {
  const colors = MODULE_COLORS[moduleType] ?? MODULE_COLORS.DEFAULT;

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        mb: 3,
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Gradient header */}
      <Box
        sx={{
          background: colors.gradient,
          color: '#fff',
          px: 4,
          py: 3.5,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top row: campaign badge + step */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentTurnedInOutlined sx={{ fontSize: 18, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Campaign Assessment
              </Typography>
            </Box>
            <Chip
              label={stepLabel}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '11px', height: 22, backdropFilter: 'blur(4px)' }}
            />
          </Box>

          {/* Title */}
          <Typography sx={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', mb: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            {campaignTitle || 'Campaign Interview'}
          </Typography>

          {/* Subtitle */}
          <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            {moduleType === 'SKILL_TEST' && skill
              ? `Skill Assessment · ${skill}`
              : moduleType === 'AI_INTERVIEW' && interviewType
              ? `AI Interview · ${interviewType}`
              : moduleType === 'QUESTIONNAIRE'
              ? 'Questionnaire Module'
              : moduleType === 'TRAINING_PATH'
              ? 'Training Path Module'
              : 'AI-powered assessment session'}
          </Typography>

          {/* Live status chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={
                interviewStatus === 'idle' ? 'Ready' :
                interviewStatus === 'connecting' ? 'Connecting…' :
                interviewStatus === 'active' ? '● Live' :
                interviewStatus === 'ended' ? 'Completed' : interviewStatus
              }
              sx={{
                bgcolor: interviewStatus === 'active' ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.15)',
                color: interviewStatus === 'active' ? '#4ADE80' : 'rgba(255,255,255,0.9)',
                fontWeight: 700, fontSize: '10px', height: 20,
                border: interviewStatus === 'active' ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.2)',
              }}
            />
            {cameraStatus === 'granted' && (
              <Chip size="small" label="📷 Camera" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: '10px', height: 20 }} />
            )}
            {isVoiceActive && (
              <Chip size="small" label="🎤 Speaking" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: '10px', height: 20 }} />
            )}
            {agentState === 'thinking' && (
              <Chip size="small" label="🧠 AI Thinking" sx={{ bgcolor: 'rgba(255,183,77,0.25)', color: '#FCD34D', fontSize: '10px', height: 20, border: '1px solid rgba(252,211,77,0.3)' }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Progress bar when active */}
      {interviewStatus === 'active' && (
        <LinearProgress
          sx={{
            height: 3,
            bgcolor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': { background: colors.gradient },
          }}
        />
      )}
    </Paper>
  );
};

// ─── Campaign Interview Main Card ──────────────────────────────────────────────
interface CampaignInterviewContainerProps {
  interviewStatus: string;
  moduleType: string;
  isHydrated: boolean;
  connectionStatus: string;
  cameraStatus: string;
  isVoiceActive: boolean;
  agentState: string;
  onStartInterview: () => void;
  onEndInterview: () => void;
  onViewResults: () => void;
}

const CampaignInterviewContainer: React.FC<CampaignInterviewContainerProps> = ({
  interviewStatus,
  moduleType,
  isHydrated,
  connectionStatus,
  cameraStatus,
  isVoiceActive,
  agentState,
  onStartInterview,
  onEndInterview,
  onViewResults,
}) => {
  const colors = MODULE_COLORS[moduleType] ?? MODULE_COLORS.DEFAULT;

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ p: 5 }}>

        {/* IDLE */}
        {interviewStatus === 'idle' && (
          <Box
            textAlign="center"
            py={6}
            sx={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.04) 0%, rgba(118,75,162,0.04) 100%)',
              borderRadius: 3,
              border: '2px dashed rgba(102,126,234,0.2)',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <PlayArrowIcon sx={{ fontSize: 64, color: '#667eea', opacity: 0.8 }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1F2937', mb: 1.5 }}>
              Ready to Begin?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 540, mx: 'auto', lineHeight: 1.75, fontSize: '1.05rem' }}>
              This is an AI-powered campaign assessment. Answer clearly and take your time — the AI adapts to your responses in real time.
            </Typography>

            {/* Requirements checklist */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              {[
                { label: 'Connection', ok: connectionStatus === 'connected' },
                { label: 'Camera',     ok: cameraStatus === 'granted' },
                { label: 'Microphone', ok: isHydrated },
              ].map(({ label, ok }) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.6,
                    px: 1.5, py: 0.6, borderRadius: 5,
                    bgcolor: ok ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ok ? '#22C55E' : '#EF4444' }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: ok ? '#16A34A' : '#DC2626' }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={onStartInterview}
              disabled={!isHydrated || connectionStatus !== 'connected' || cameraStatus !== 'granted'}
              startIcon={<PlayArrowIcon />}
              sx={{
                px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 700, borderRadius: 3,
                background: colors.gradient,
                boxShadow: `0 4px 18px ${colors.shadow}`,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${colors.shadow}` },
                '&:disabled': { background: '#D1D5DB', boxShadow: 'none', color: '#9CA3AF' },
              }}
            >
              Start Assessment
            </Button>

            {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
              <Typography variant="caption" sx={{ mt: 2, display: 'block', fontSize: '0.88rem', fontWeight: 500, color: '#F59E0B' }}>
                ⚠️ Camera access is required to start
              </Typography>
            )}
          </Box>
        )}

        {/* CONNECTING */}
        {interviewStatus === 'connecting' && (
          <Box textAlign="center" py={8}>
            <CircularProgress size={48} sx={{ color: '#667eea', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
              Initializing Assessment…
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Setting up the AI interview session
            </Typography>
          </Box>
        )}

        {/* ACTIVE */}
        {interviewStatus === 'active' && (
          <Box
            textAlign="center"
            py={8}
            sx={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.03) 0%, rgba(220,38,38,0.03) 100%)',
              borderRadius: 3,
              border: '2px solid rgba(239,68,68,0.12)',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <StopIcon sx={{ fontSize: 64, color: '#EF4444', opacity: 0.8 }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1F2937', mb: 3 }}>
              Assessment in Progress
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onEndInterview}
              startIcon={<StopIcon />}
              color="error"
              sx={{
                px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 700, borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(239,68,68,0.4)' },
              }}
            >
              End Assessment
            </Button>
          </Box>
        )}

        {/* ENDED */}
        {interviewStatus === 'ended' && (
          <Box
            textAlign="center"
            py={8}
            sx={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(5,150,105,0.04) 100%)',
              borderRadius: 3,
              border: '2px solid rgba(16,185,129,0.15)',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <AssessmentIcon sx={{ fontSize: 64, color: '#10B981', opacity: 0.85 }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1F2937', mb: 1.5 }}>
              Assessment Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Your responses have been recorded and analyzed. View your results below.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onViewResults}
              startIcon={<AssessmentIcon />}
              sx={{
                px: 5, py: 1.8, fontSize: '1.05rem', fontWeight: 700, borderRadius: 3,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(16,185,129,0.45)' },
              }}
            >
              View Results
            </Button>
          </Box>
        )}

      </Box>
    </Paper>
  );
};

// ─── Main Campaign Interview Page ──────────────────────────────────────────────

const CampaignInterview = () => {
  const router = useRouter();
  const {
    campaignId,
    campaignTitle,
    moduleType = 'AI_INTERVIEW',
    skill,
    interviewType,
    participantId,
  } = router.query as Record<string, string>;

  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [realTimeReport, setRealTimeReport] = useState<RealTimeReport | null>(null);

  // ── Notification ────────────────────────────────────────────────────────────
  const { notification, showNotification, hideNotification } = useNotification();
  const notify = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    showNotification(message, severity);
  }, [showNotification]);

  // ── Config ──────────────────────────────────────────────────────────────────
  const {
    interviewConfig,
    pipelineLoading,
    showBlockedModal,
    showFailedModal,
    blockMessage,
  } = useInterviewConfig({ showNotification: notify });

  // Forward ref so timer can call endInterview without circular dependency
  const endInterviewRef = useRef<() => void>(() => {});

  // ── Socket callbacks ────────────────────────────────────────────────────────
  const handleInterviewStarted = useCallback((data: InterviewStartedData) => {
    timer.startTimer(data.config.duration || 20);
    timer.setDuration(data.config.duration * 60 * 1000);
    if (data.config.silenceIntelligence) {
      audio.setBackendSilenceConfig(data.config.silenceIntelligence);
      audio.setAdaptiveSilenceThreshold(data.config.silenceIntelligence.threshold || 5000);
    }
  }, []);

  const handleInterviewMessage = useCallback((message: InterviewMessage) => {
    audio.setConversationHistory(prev => [...prev, message]);
    audio.setQuestionHighlight(true);
    setTimeout(() => audio.setQuestionHighlight(false), 600);
    if (message.type === 'question' || message.type === 'follow_up') {
      audio.setQuestionReadingTime(Date.now());
      audio.setAgentState('waiting');
      audio.setAgentMessage('Waiting for you to read the question...');
      audio.resetSilenceDetection();
    }
  }, []);

  const handleCoverageUpdate = useCallback((newCoverage: Coverage) => {
    setCoverage(newCoverage);
  }, []);

  const handleReportUpdate = useCallback((report: RealTimeReport) => {
    setRealTimeReport(report);
  }, []);

  const handleSilenceResponse = useCallback((data: SilenceResponseData) => {
    audio.setSilenceCount(data.silenceCount);
    if (data.action === 'silence_prompt') {
      notify('Take your time to think...', 'info');
      audio.setAgentState('waiting');
      audio.setAgentMessage(data.content || 'AI provided encouragement');
      audio.setConversationHistory(prev => [...prev, {
        type: 'system' as const,
        content: data.content || '',
        timestamp: data.timestamp || new Date().toISOString(),
      }]);
    } else if (data.action === 'move_forward') {
      audio.setAgentState('thinking');
      audio.setAgentMessage('Moving to next topic...');
    }
    if (data.silenceIntelligence?.adaptiveThreshold) {
      audio.setAdaptiveSilenceThreshold(data.silenceIntelligence.adaptiveThreshold);
    }
  }, [notify]);

  const handleVoiceActivity = useCallback((data: { isActive: boolean }) => {
    audio.setIsVoiceActive(data.isActive);
    if (data.isActive) audio.setLastVoiceActivity(Date.now());
  }, []);

  const handleInterviewEnded = useCallback(async (data: InterviewEndedData) => {
    audio.setIsRecording(false);
    timer.stopTimer();
    if (data.sessionId) localStorage.setItem('last_interview_id', data.sessionId);
    if (data.finalReport || data.analytics) {
      localStorage.setItem('last_interview_analysis', JSON.stringify({
        finalReport: data.finalReport,
        analytics: data.analytics,
        sessionId: data.sessionId,
        interviewType: interviewConfig?.interviewType || 'CAMPAIGN',
        campaignId,
        participantId,
        timestamp: new Date().toISOString(),
      }));
    }
  }, [interviewConfig, campaignId, participantId]);

  const handleInterviewError = useCallback((_error: { message: string }) => {
    audio.setAgentState('waiting');
    audio.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
  }, []);

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const socket = useInterviewSocket({
    onNotification: notify,
    onInterviewStarted: handleInterviewStarted,
    onInterviewMessage: handleInterviewMessage,
    onCoverageUpdate: handleCoverageUpdate,
    onReportUpdate: handleReportUpdate,
    onSilenceResponse: handleSilenceResponse,
    onVoiceActivity: handleVoiceActivity,
    onInterviewEnded: handleInterviewEnded,
    onInterviewError: handleInterviewError,
  });

  const audio = useAudioTranscription({
    socketRef: socket.socketRef,
    sessionIdRef: socket.sessionIdRef,
    interviewConfig,
    interviewStatus: socket.interviewStatus,
    showNotification: notify,
  });

  const lastInterviewerMessage = audio.conversationHistory
    .filter(m => m.type !== 'system')
    .slice(-1)[0] || null;

  const timer = useInterviewTimer({
    interviewStatus: socket.interviewStatus,
    onTimeUp: useCallback(() => { endInterviewRef.current(); }, []),
    showNotification: notify as any,
  });

  const camera = useCamera({ showNotification: notify as any });
  const security = useSecurityMonitoring({ interviewStatus: socket.interviewStatus });

  // ── Orchestration ───────────────────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) {
      notify('Not connected to interview system', 'error');
      return;
    }
    try {
      socket.setInterviewStatus('connecting');
      await audio.initializeAudio();
      socket.socketRef.current.emit('start_interview', {
        config: {
          ...interviewConfig,
          campaignId,
          participantId,
          moduleType,
          silenceIntelligence: {
            interviewType: interviewConfig.interviewType,
            candidateBehavior: { interactionStyle: 'balanced', confidenceLevel: 'medium', communicationStyle: 'mixed' },
            adaptiveMode: true,
            contextualAdjustments: true,
          },
        },
        candidateId: authUser?.email || 'anonymous',
      });
    } catch {
      notify('Failed to start assessment', 'error');
      socket.setInterviewStatus('idle');
    }
  }, [socket, interviewConfig, authUser, audio.initializeAudio, notify, campaignId, participantId, moduleType]);

  const endInterview = useCallback(() => {
    if (socket.socketRef.current && socket.sessionId) {
      socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionId });
    }
    if (audio.audioStreamRef.current) {
      audio.audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    audio.resetSilenceDetection();
    audio.cleanupAssemblyAI();
    audio.setIsRecording(false);
    socket.setInterviewStatus('ended');
    if (socket.sessionId) localStorage.setItem('last_interview_id', socket.sessionId);
  }, [socket, audio]);

  endInterviewRef.current = endInterview;

  const handleViewResults = useCallback(() => {
    router.push(
      campaignId
        ? `/interview/results?campaignId=${campaignId}&participantId=${participantId || ''}`
        : '/interview/results'
    );
  }, [router, campaignId, participantId]);

  // Step label derived from query params
  const stepLabel = router.query.step
    ? `Step ${router.query.step}`
    : moduleType === 'SKILL_TEST'    ? 'Skill Test'
    : moduleType === 'AI_INTERVIEW'  ? 'AI Interview'
    : moduleType === 'QUESTIONNAIRE' ? 'Questionnaire'
    : 'Module';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={hideNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={notification.severity} onClose={hideNotification}>
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Pipeline Modals */}
        <PipelineModals
          pipelineLoading={pipelineLoading}
          showBlockedModal={showBlockedModal}
          showFailedModal={showFailedModal}
          blockMessage={blockMessage}
          onReturnToDashboard={() => router.push('/dashboard')}
        />

        {/* Connection warning */}
        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#FFF7ED', borderLeft: '4px solid #F59E0B' }}>
            <Typography variant="h6" color="text.primary">
              {socket.connectionStatus === 'connecting'   && 'Connecting to Interview System…'}
              {socket.connectionStatus === 'error'        && 'Connection Error — Please refresh the page'}
              {socket.connectionStatus === 'disconnected' && 'Disconnected — Attempting to reconnect…'}
            </Typography>
          </Paper>
        )}

        {/* Campaign Header */}
        <CampaignInterviewHeader
          campaignTitle={campaignTitle || 'Campaign Assessment'}
          moduleType={moduleType}
          skill={skill}
          interviewType={interviewType}
          stepLabel={stepLabel}
          interviewStatus={socket.interviewStatus}
          isVoiceActive={audio.isVoiceActive}
          cameraStatus={camera.cameraStatus}
          agentState={audio.agentState}
        />

        {/* Question Panel — visible only when active */}
        {socket.interviewStatus === 'active' && lastInterviewerMessage && (
          <QuestionPanel
            currentMessage={lastInterviewerMessage}
            isInReadingTime={audio.isInReadingTime}
            readingTimeLeft={audio.readingTimeLeft}
            questionHighlight={audio.questionHighlight}
          />
        )}

        {/* Camera Preview */}
        <CameraPreview
          videoRef={camera.videoRef}
          cameraStatus={camera.cameraStatus}
          cameraError={camera.cameraError}
          isConnecting={audio.isConnecting}
          interviewStatus={socket.interviewStatus}
        />

        {/* Agent Status Panel */}
        <AgentStatusPanel
          interviewStatus={socket.interviewStatus}
          agentState={audio.agentState}
          agentMessage={audio.agentMessage}
          isInReadingTime={audio.isInReadingTime}
          readingTimeLeft={audio.readingTimeLeft}
          accumulatedTurns={audio.accumulatedTurns}
          isVoiceActive={audio.isVoiceActive}
          currentTranscript={audio.currentTranscript}
          debugMode={audio.debugMode}
          setDebugMode={audio.setDebugMode}
          silenceDebugLog={audio.silenceDebugLog}
          transcriptDebugLog={audio.transcriptDebugLog}
          onSubmitAnswer={audio.sendAccumulatedAnswer}
        />

        {/* Coverage Dashboard */}
        <CoverageDashboard
          interviewStatus={socket.interviewStatus}
          coverage={coverage}
          realTimeReport={realTimeReport}
          agentMessage={audio.agentMessage}
          coverageDashboardExpanded={audio.coverageDashboardExpanded}
          onToggleExpand={() => audio.setCoverageDashboardExpanded(!audio.coverageDashboardExpanded)}
        />

        {/* Main interview card */}
        <CampaignInterviewContainer
          interviewStatus={socket.interviewStatus}
          moduleType={moduleType}
          isHydrated={socket.isHydrated}
          connectionStatus={socket.connectionStatus}
          cameraStatus={camera.cameraStatus}
          isVoiceActive={audio.isVoiceActive}
          agentState={audio.agentState}
          onStartInterview={startInterview}
          onEndInterview={endInterview}
          onViewResults={handleViewResults}
        />

        {/* Security Modals */}
        <SecurityModals
          showFirstViolationModal={security.showFirstViolationModal}
          showSecurityModal={security.showSecurityModal}
          onDismissFirst={() => security.setShowFirstViolationModal(false)}
          onDismissSecond={() => security.setShowSecurityModal(false)}
          onReturnToDashboard={() => router.push('/dashboard/workplace')}
        />

        {/* Fixed Timer */}
        {socket.interviewStatus === 'active' && (
          <InterviewTimer
            elapsedTime={timer.elapsedTime}
            timeWarning={timer.timeWarning}
          />
        )}

      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(CampaignInterview), { ssr: false });
