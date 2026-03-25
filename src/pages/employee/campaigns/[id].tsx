'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  Container,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import dynamic from 'next/dynamic';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrow';
import StopOutlined from '@mui/icons-material/Stop';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';

// Types
import { InterviewMessage, Coverage, RealTimeReport } from '@/types/interview';
import { Campaign } from '@/types/campaign';

// Redux
import {
  fetchCampaignById,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
} from '@/store/slices/campaignSlice';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useCamera } from '@/hooks/useCamera';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useInterviewConfig } from '@/hooks/useInterviewConfig';
import {
  useInterviewSocket,
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
} from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// Interview components
import QuestionPanel from '@/components/features/interview/start/QuestionPanel';
import CameraPreview from '@/components/features/interview/start/CameraPreview';
import AgentStatusPanel from '@/components/features/interview/start/AgentStatusPanel';
import CoverageDashboard from '@/components/features/interview/start/CoverageDashboard';
import SecurityModals from '@/components/features/interview/start/SecurityModals';
import InterviewTimer from '@/components/features/interview/start/InterviewTimer';
import GDPRConsentModal from '@/components/features/interview/start/GDPRConsentModal';
import { GlobalStyles } from '@/components/features/interview/start/styles';

// ─── Module metadata ──────────────────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; gradient: string; shadow: string; accent: string; icon: React.ElementType }> = {
  AI_INTERVIEW: {
    label: 'AI Interview',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
    shadow: 'rgba(13,148,136,0.4)',
    accent: '#0D9488',
    icon: PsychologyOutlined,
  },
  SKILL_TEST: {
    label: 'Skill Test',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    shadow: 'rgba(124,58,237,0.4)',
    accent: '#7C3AED',
    icon: CodeOutlined,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInterviewType(moduleType: string): 'HR_INTERVIEW' | 'TECHNICAL_INTERVIEW' {
  return moduleType === 'SKILL_TEST' ? 'TECHNICAL_INTERVIEW' : 'HR_INTERVIEW';
}

// ─── Campaign Interview Header ────────────────────────────────────────────────

interface HeaderProps {
  campaign: Campaign;
  moduleType: string;
  interviewStatus: string;
  isVoiceActive: boolean;
  cameraStatus: string;
  agentState: string;
  coverage: Coverage | null;
  onBack: () => void;
  onEnd: () => void;
}

const CampaignHeader: React.FC<HeaderProps> = ({
  campaign, moduleType, interviewStatus, isVoiceActive, cameraStatus,
  agentState, coverage, onBack, onEnd,
}) => {
  const meta = MODULE_META[moduleType] ?? MODULE_META.AI_INTERVIEW;
  const ModIcon = meta.icon;
  const isActive = interviewStatus === 'active';

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        px: { xs: 2, md: 4 },
        py: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Module color bar */}
      <Box sx={{ height: 3, background: meta.gradient, mx: -4 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, gap: 2, flexWrap: 'wrap' }}>
        {/* Left: back + campaign info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={onBack}
            disabled={isActive}
            sx={{ color: '#6B7280', '&:hover': { color: '#111827' } }}
          >
            <ArrowBackOutlined sx={{ fontSize: 18 }} />
          </IconButton>

          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: meta.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ModIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {campaign.title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
              {meta.label}
              {moduleType === 'SKILL_TEST' && (campaign.module as any)?.config?.skill
                ? ` · ${(campaign.module as any).config.skill}`
                : ''}
            </Typography>
          </Box>
        </Box>

        {/* Right: live chips + end button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Status chip */}
          <Chip
            label={
              interviewStatus === 'idle' ? 'Ready' :
              interviewStatus === 'connecting' ? 'Connecting…' :
              isActive ? '● Live' :
              interviewStatus === 'ended' ? 'Completed' : interviewStatus
            }
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 11,
              height: 22,
              bgcolor: isActive ? '#ECFDF5' : '#F3F4F6',
              color: isActive ? '#059669' : '#6B7280',
              border: isActive ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
            }}
          />

          {isVoiceActive && (
            <Chip size="small" label="🎤 Speaking" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: 11, height: 22 }} />
          )}
          {agentState === 'thinking' && (
            <Chip size="small" label="🧠 AI Thinking" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontSize: 11, height: 22 }} />
          )}

          {/* Coverage badge */}
          {isActive && coverage && (
            <Chip
              icon={<AssignmentTurnedInOutlined sx={{ fontSize: '13px !important' }} />}
              label={`${Math.round(coverage.overall ?? 0)}%`}
              size="small"
              sx={{ bgcolor: '#F5F3FF', color: '#7C3AED', fontWeight: 700, fontSize: 11, height: 22, '& .MuiChip-icon': { color: '#7C3AED' } }}
            />
          )}

          {/* End button */}
          {isActive && (
            <Button
              size="small"
              startIcon={<StopOutlined sx={{ fontSize: 14 }} />}
              onClick={onEnd}
              sx={{
                bgcolor: '#FEF2F2', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.2)',
                fontWeight: 700, fontSize: 12, textTransform: 'none',
                borderRadius: 2, px: 2, py: 0.6,
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              End
            </Button>
          )}
        </Box>
      </Box>

      {/* Progress bar */}
      {isActive && (
        <LinearProgress
          variant="determinate"
          value={Math.min(coverage?.overall ?? 0, 100)}
          sx={{
            height: 3,
            bgcolor: 'rgba(0,0,0,0.04)',
            '& .MuiLinearProgress-bar': { background: meta.gradient },
          }}
        />
      )}
    </Box>
  );
};

// ─── Idle/Ended State Panel ───────────────────────────────────────────────────

const StatusPanel: React.FC<{
  interviewStatus: string;
  moduleType: string;
  isHydrated: boolean;
  connectionStatus: string;
  cameraStatus: string;
  onStart: () => void;
  onViewResults: () => void;
}> = ({ interviewStatus, moduleType, isHydrated, connectionStatus, cameraStatus, onStart, onViewResults }) => {
  const meta = MODULE_META[moduleType] ?? MODULE_META.AI_INTERVIEW;
  const ModIcon = meta.icon;
  const canStart = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  if (interviewStatus === 'connecting') {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <CircularProgress size={44} sx={{ color: meta.accent, mb: 3 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
          Initializing Assessment…
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 1 }}>
          Setting up your AI session
        </Typography>
      </Box>
    );
  }

  if (interviewStatus === 'ended') {
    return (
      <Box
        sx={{
          textAlign: 'center', py: 8,
          bgcolor: '#ECFDF5', borderRadius: 3,
          border: '1.5px solid #A7F3D0',
        }}
      >
        <CheckCircleOutlined sx={{ fontSize: 56, color: '#10B981', mb: 2, opacity: 0.9 }} />
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', mb: 1 }}>
          Assessment Complete!
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4, maxWidth: 460, mx: 'auto', lineHeight: 1.7 }}>
          Your responses have been recorded and are being analyzed. Results will be available shortly.
        </Typography>
        <Button
          variant="contained"
          startIcon={<VisibilityOutlined />}
          onClick={onViewResults}
          sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            fontWeight: 700, fontSize: 14, textTransform: 'none',
            borderRadius: 2.5, px: 4, py: 1.4,
            '&:hover': { boxShadow: '0 6px 20px rgba(16,185,129,0.45)', transform: 'translateY(-1px)' },
            transition: 'all 0.25s',
          }}
        >
          View Results
        </Button>
      </Box>
    );
  }

  // idle
  return (
    <Box
      sx={{
        textAlign: 'center', py: 7, px: 3,
        background: 'linear-gradient(135deg, rgba(102,126,234,0.04) 0%, rgba(118,75,162,0.04) 100%)',
        borderRadius: 3, border: '2px dashed rgba(102,126,234,0.2)',
      }}
    >
      <Box
        sx={{
          width: 72, height: 72, borderRadius: 3,
          background: meta.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3,
          boxShadow: `0 8px 24px ${meta.shadow}`,
        }}
      >
        <ModIcon sx={{ fontSize: 36, color: '#fff' }} />
      </Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', mb: 1 }}>
        Ready to Begin?
      </Typography>
      <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.75 }}>
        {moduleType === 'SKILL_TEST'
          ? 'This is an AI-powered skill assessment. Answer each question clearly — the AI adapts to your technical level in real time.'
          : 'This is an AI-powered interview. Answer openly and take your time — the AI adapts to your responses in real time.'}
      </Typography>

      {/* Requirements */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Connection', ok: connectionStatus === 'connected' },
          { label: 'Camera', ok: cameraStatus === 'granted' },
          { label: 'Microphone', ok: isHydrated },
        ].map(({ label, ok }) => (
          <Box
            key={label}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6, borderRadius: 5,
              bgcolor: ok ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ok ? '#22C55E' : '#EF4444' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: ok ? '#16A34A' : '#DC2626' }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowOutlined />}
        onClick={onStart}
        disabled={!canStart}
        sx={{
          background: canStart ? meta.gradient : undefined,
          boxShadow: canStart ? `0 4px 18px ${meta.shadow}` : 'none',
          fontWeight: 700, fontSize: 15, textTransform: 'none',
          borderRadius: 2.5, px: 5, py: 1.5,
          '&:hover': { boxShadow: `0 8px 24px ${meta.shadow}`, transform: 'translateY(-1px)' },
          '&:disabled': { bgcolor: '#D1D5DB', color: '#9CA3AF' },
          transition: 'all 0.25s',
        }}
      >
        Start Assessment
      </Button>

      {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
        <Typography sx={{ mt: 2, fontSize: 12, fontWeight: 500, color: '#F59E0B' }}>
          ⚠️ Camera access is required to start
        </Typography>
      )}
    </Box>
  );
};

// ─── Unsupported module ───────────────────────────────────────────────────────

const UnsupportedModule: React.FC<{ moduleType: string; onBack: () => void }> = ({ moduleType, onBack }) => (
  <Box sx={{ textAlign: 'center', py: 10 }}>
    <WarningAmberOutlined sx={{ fontSize: 52, color: '#F59E0B', mb: 2 }} />
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#111827', mb: 1 }}>
      Module not supported here
    </Typography>
    <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4 }}>
      The <strong>{moduleType}</strong> module cannot be taken through this interface.
    </Typography>
    <Button
      variant="outlined"
      startIcon={<ArrowBackOutlined />}
      onClick={onBack}
      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
    >
      Back to Campaigns
    </Button>
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const EmployeeCampaignInterview: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = router.query as { id?: string };

  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const campaign = useSelector(selectSelectedCampaign);
  const campaignLoading = useSelector(selectDetailLoading);
  const campaignError = useSelector(selectDetailError);

  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [realTimeReport, setRealTimeReport] = useState<RealTimeReport | null>(null);

  // Fetch campaign on mount
  useEffect(() => {
    if (id) dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  const moduleType: string = campaign?.module?.type ?? 'AI_INTERVIEW';
  const participantId = authUser?._id ?? '';

  const { notification, showNotification, hideNotification } = useNotification();
  const notify = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    showNotification(message, severity);
  }, [showNotification]);

  // Get default config and override type based on module
  const { interviewConfig, setInterviewConfig, pipelineLoading, showBlockedModal, showFailedModal, blockMessage } =
    useInterviewConfig({ showNotification: notify });

  // Sync interviewType from campaign module
  useEffect(() => {
    if (!campaign) return;
    const derivedType = buildInterviewType(moduleType);
    if (interviewConfig.interviewType !== derivedType) {
      const skillCfg = (campaign.module as any)?.config?.skill;
      setInterviewConfig({
        ...interviewConfig,
        interviewType: derivedType,
        context: {
          ...interviewConfig.context,
          ...(skillCfg ? { skill: skillCfg } : {}),
        },
      });
    }
  }, [campaign, moduleType]);

  const endInterviewRef = useRef<() => void>(() => {});

  // ── Socket callbacks ──────────────────────────────────────────────────────

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

  const handleCoverageUpdate = useCallback((c: Coverage) => setCoverage(c), []);
  const handleReportUpdate = useCallback((r: RealTimeReport) => setRealTimeReport(r), []);

  const handleSilenceResponse = useCallback((data: SilenceResponseData) => {
    audio.setSilenceCount(data.silenceCount);
    if (data.action === 'silence_prompt') {
      notify('Take your time to think...', 'info');
      audio.setAgentState('waiting');
      audio.setAgentMessage(data.content || '');
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
        campaignId: id,
        participantId,
        timestamp: new Date().toISOString(),
      }));
    }
  }, [interviewConfig, id, participantId]);

  const handleInterviewError = useCallback(() => {
    audio.setAgentState('waiting');
    audio.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
  }, []);

  // ── Hooks ─────────────────────────────────────────────────────────────────

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

  // ── Actions ───────────────────────────────────────────────────────────────

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
          campaignId: id,
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
  }, [socket, interviewConfig, authUser, audio.initializeAudio, notify, id, participantId, moduleType]);

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

  const handleBack = useCallback(() => {
    router.push('/employee/campaigns');
  }, [router]);

  const handleViewResults = useCallback(() => {
    router.push(
      id
        ? `/interview/results?campaignId=${id}&participantId=${participantId}`
        : '/interview/results'
    );
  }, [router, id, participantId]);

  const isActive = socket.interviewStatus === 'active';

  // ── Loading/Error states ──────────────────────────────────────────────────

  if (!router.isReady || campaignLoading) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#0D9488' }} />
        </Box>
      </>
    );
  }

  if (campaignError || !campaign) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <WarningAmberOutlined sx={{ fontSize: 52, color: '#EF4444', mb: 2 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>Campaign not found</Typography>
            <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 3 }}>{campaignError}</Typography>
            <Button variant="contained" onClick={handleBack} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#0D9488', '&:hover': { bgcolor: '#0b7a6e' } }}>
              Back to Campaigns
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  if (moduleType !== 'AI_INTERVIEW' && moduleType !== 'SKILL_TEST') {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Container maxWidth="sm" sx={{ py: 10 }}>
            <UnsupportedModule moduleType={moduleType} onBack={handleBack} />
          </Container>
        </Box>
      </>
    );
  }

  // ── Full interview layout ─────────────────────────────────────────────────

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', flexDirection: 'column' }}>

        {/* Sticky header */}
        <CampaignHeader
          campaign={campaign}
          moduleType={moduleType}
          interviewStatus={socket.interviewStatus}
          isVoiceActive={audio.isVoiceActive}
          cameraStatus={camera.cameraStatus}
          agentState={audio.agentState}
          coverage={coverage}
          onBack={handleBack}
          onEnd={endInterview}
        />

        {/* Connection warning banner */}
        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Box sx={{ bgcolor: '#FFFBEB', borderBottom: '1px solid #FDE68A', px: { xs: 2, md: 4 }, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#D97706' }} />
            <Typography sx={{ fontSize: 12, color: '#92400E' }}>
              {socket.connectionStatus === 'connecting' ? 'Connecting to interview system…' :
               socket.connectionStatus === 'error' ? 'Connection error — please refresh' :
               'Disconnected — attempting to reconnect…'}
            </Typography>
          </Box>
        )}

        {/* Main content */}
        <Box sx={{ flex: 1 }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>

            {/* Two-column layout: camera (left) + controls (right) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 3fr' }, gap: 3 }}>

              {/* LEFT column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Question panel — active only */}
                {isActive && lastInterviewerMessage && (
                  <QuestionPanel
                    currentMessage={lastInterviewerMessage}
                    isInReadingTime={audio.isInReadingTime}
                    readingTimeLeft={audio.readingTimeLeft}
                    questionHighlight={audio.questionHighlight}
                  />
                )}

                {/* Camera preview */}
                <CameraPreview
                  videoRef={camera.videoRef}
                  cameraStatus={camera.cameraStatus}
                  cameraError={camera.cameraError}
                  isConnecting={audio.isConnecting}
                  interviewStatus={socket.interviewStatus}
                  audioContextRef={audio.audioContextRef}
                  attachStream={camera.attachStream}
                />

                {/* Coverage dashboard */}
                <CoverageDashboard
                  interviewStatus={socket.interviewStatus}
                  coverage={coverage}
                  realTimeReport={realTimeReport}
                  agentMessage={audio.agentMessage}
                  coverageDashboardExpanded={audio.coverageDashboardExpanded}
                  onToggleExpand={() => audio.setCoverageDashboardExpanded(!audio.coverageDashboardExpanded)}
                />
              </Box>

              {/* RIGHT column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Idle / Connecting / Ended state panel */}
                {socket.interviewStatus !== 'active' && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #E5E7EB', p: 3 }}>
                    <StatusPanel
                      interviewStatus={socket.interviewStatus}
                      moduleType={moduleType}
                      isHydrated={socket.isHydrated}
                      connectionStatus={socket.connectionStatus}
                      cameraStatus={camera.cameraStatus}
                      onStart={startInterview}
                      onViewResults={handleViewResults}
                    />
                  </Box>
                )}

                {/* Agent status — always visible while active */}
                {isActive && (
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
                )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* GDPR consent modal */}
        <GDPRConsentModal
          open={!camera.consentGiven}
          onAccept={camera.giveConsent}
          onDecline={handleBack}
        />

        {/* Notifications */}
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

        {/* Security modals */}
        <SecurityModals
          showFirstViolationModal={security.showFirstViolationModal}
          showSecurityModal={security.showSecurityModal}
          onDismissFirst={() => security.setShowFirstViolationModal(false)}
          onDismissSecond={() => security.setShowSecurityModal(false)}
          onReturnToDashboard={handleBack}
        />

        {/* Fixed timer */}
        {isActive && (
          <InterviewTimer elapsedTime={timer.elapsedTime} timeWarning={timer.timeWarning} />
        )}
      </Box>
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignInterview), { ssr: false });
