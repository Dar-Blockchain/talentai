'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import {
  Box, Container, LinearProgress, Typography,
  Dialog, DialogContent, DialogActions, Button,
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { AppDispatch } from '@/store/store';
import { fetchParticipantResults } from '@/store/slices/campaignSlice';

import { Campaign } from '@/types/campaign';
import { InterviewMessage, Coverage } from '@/types/interview';
import { useCampaignInterviewConfig } from '@/hooks/useCampaignInterviewConfig';
import { useNotification }            from '@/hooks/useNotification';
import { useInterviewTimer }          from '@/hooks/useInterviewTimer';
import { useCamera }                  from '@/hooks/useCamera';
import { useSecurityMonitoring }      from '@/hooks/useSecurityMonitoring';
import {
  useInterviewSocket,
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
} from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// ── Shared start components (same as hr.tsx) ──────────────────────────────────
import {
  QuestionPanel,
  CameraPreview,
  AgentStatusPanel,
  InterviewContainer,
  InterviewTimer,
  CoverageDashboard,
} from '@/components/features/interview/start';
import GDPRConsentModal from '@/components/features/interview/start/GDPRConsentModal';

// ── Campaign-specific components ──────────────────────────────────────────────
import InterviewPageHeader       from './InterviewPageHeader';
// ─────────────────────────────────────────────────────────────────────────────

interface InterviewAssessmentProps {
  campaign:      Campaign;
  participantId: string;
  campaignId:    string;
  onBack:        () => void;
  /** Called once results are confirmed saved — defaults to employee results page */
  onComplete?:   () => void;
}

const InterviewAssessment: React.FC<InterviewAssessmentProps> = ({
  campaign, participantId, campaignId, onBack, onComplete,
}) => {
  const router     = useRouter();
  const dispatch   = useDispatch<AppDispatch>();
  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';

  const [coverage,                   setCoverage]                   = useState<Coverage | null>(null);
  const [coverageDashboardExpanded,  setCoverageDashboardExpanded]  = useState(true);
  const [showEndConfirm,             setShowEndConfirm]             = useState(false);

  const { notification, showNotification, hideNotification } = useNotification();
  const { interviewConfig } = useCampaignInterviewConfig(campaign);

  const endInterviewRef = useRef<() => void>(() => {});
  const handlersRef = useRef({
    onInterviewStarted: (_: InterviewStartedData)     => {},
    onInterviewMessage: (_: InterviewMessage)          => {},
    onSilenceResponse:  (_: SilenceResponseData)       => {},
    onVoiceActivity:    (_: { isActive: boolean })     => {},
    onInterviewEnded:   (_: InterviewEndedData)        => {},
    onInterviewError:   ()                             => {},
  });

  const socket = useInterviewSocket({
    namespace:          '/campaign-interview',
    onNotification:     showNotification,
    onInterviewStarted: useCallback((d: InterviewStartedData) => handlersRef.current.onInterviewStarted(d), []),
    onInterviewMessage: useCallback((m: InterviewMessage)      => handlersRef.current.onInterviewMessage(m), []),
    onCoverageUpdate:   useCallback((c: Coverage)              => setCoverage(c),                            []),
    onReportUpdate:     useCallback(() => {},                                                                 []),
    onSilenceResponse:  useCallback((d: SilenceResponseData)   => handlersRef.current.onSilenceResponse(d),  []),
    onVoiceActivity:    useCallback((d: { isActive: boolean }) => handlersRef.current.onVoiceActivity(d),    []),
    onInterviewEnded:   useCallback((d: InterviewEndedData)    => handlersRef.current.onInterviewEnded(d),   []),
    onInterviewError:   useCallback(()                         => handlersRef.current.onInterviewError(),     []),
  });

  const audio    = useAudioTranscription({ socketRef: socket.socketRef, sessionIdRef: socket.sessionIdRef, interviewConfig, interviewStatus: socket.interviewStatus, showNotification });
  const timer    = useInterviewTimer({ interviewStatus: socket.interviewStatus, onTimeUp: useCallback(() => endInterviewRef.current(), []), showNotification: showNotification as any });
  const camera   = useCamera({ showNotification: showNotification as any });
  useSecurityMonitoring({ interviewStatus: socket.interviewStatus, enabled: false });

  handlersRef.current = {
    onInterviewStarted: (data) => {
      timer.startTimer(data.config.duration || 20);
      timer.setDuration(data.config.duration * 60 * 1000);
      if (data.config.silenceIntelligence) {
        audio.setBackendSilenceConfig(data.config.silenceIntelligence);
        audio.setAdaptiveSilenceThreshold(data.config.silenceIntelligence.threshold || 5000);
      }
    },
    onInterviewMessage: (message) => {
      audio.setConversationHistory(prev => [...prev, message]);
      audio.setQuestionHighlight(true);
      setTimeout(() => audio.setQuestionHighlight(false), 600);
      if (message.type === 'question' || message.type === 'follow_up') {
        audio.setQuestionReadingTime(Date.now());
        audio.setAgentState('waiting');
        audio.setAgentMessage('Waiting for you to read the question...');
        audio.resetSilenceDetection();
      }
    },
    onSilenceResponse: (data) => {
      audio.setSilenceCount(data.silenceCount);
      if (data.action === 'silence_prompt') {
        showNotification('Take your time to think...', 'info');
        audio.setAgentState('waiting');
        audio.setAgentMessage(data.content || '');
        audio.setConversationHistory(prev => [...prev, { type: 'system' as const, content: data.content || '', timestamp: data.timestamp || new Date().toISOString() }]);
      } else if (data.action === 'move_forward') {
        audio.setAgentState('thinking');
        audio.setAgentMessage('Moving to next topic...');
      }
      if (data.silenceIntelligence?.adaptiveThreshold) audio.setAdaptiveSilenceThreshold(data.silenceIntelligence.adaptiveThreshold);
    },
    onVoiceActivity: (data) => {
      audio.setIsVoiceActive(data.isActive);
      if (data.isActive) audio.setLastVoiceActivity(Date.now());
    },
    onInterviewEnded: (data) => {
      audio.setIsRecording(false);
      timer.stopTimer();
      if (data.sessionId) localStorage.setItem('last_interview_id', data.sessionId);
      if (data.finalReport || data.analytics) {
        localStorage.setItem('last_interview_analysis', JSON.stringify({
          finalReport: data.finalReport, analytics: data.analytics,
          sessionId: data.sessionId, interviewType: interviewConfig?.interviewType || 'CAMPAIGN',
          campaignId, participantId, timestamp: new Date().toISOString(),
        }));
      }
    },
    onInterviewError: () => {
      audio.setAgentState('waiting');
      audio.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
    },
  };

  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) {
      showNotification('Not connected to interview system', 'error');
      return;
    }
    try {
      socket.setInterviewStatus('connecting');
      await audio.initializeAudio();
      socket.socketRef.current.emit('start_interview', {
        config: {
          ...interviewConfig, campaignId, participantId, moduleType,
          silenceIntelligence: {
            interviewType: interviewConfig.interviewType,
            candidateBehavior: { interactionStyle: 'balanced', confidenceLevel: 'medium', communicationStyle: 'mixed' },
            adaptiveMode: true, contextualAdjustments: true,
          },
        },
        candidateId: participantId,
      });
    } catch {
      showNotification('Failed to start assessment', 'error');
      socket.setInterviewStatus('idle');
    }
  }, [socket, interviewConfig, audio.initializeAudio, campaignId, participantId, moduleType]);

  const endInterview = useCallback(() => {
    if (socket.socketRef.current && socket.sessionId)
      socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionId });
    audio.audioStreamRef.current?.getTracks().forEach(t => t.stop());
    audio.resetSilenceDetection();
    audio.cleanupAssemblyAI();
    audio.setIsRecording(false);
    socket.setInterviewStatus('ended');
    if (socket.sessionId) localStorage.setItem('last_interview_id', socket.sessionId);
  }, [socket, audio]);

  endInterviewRef.current = endInterview;

  const goToResults = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else {
      router.push(`/employee/campaigns/${campaignId}/results`);
    }
  }, [onComplete, router, campaignId]);

  // Poll for results in DB after interview ends, then redirect
  useEffect(() => {
    if (socket.interviewStatus !== 'ended') return;
    let cancelled = false;
    const MAX_POLLS = 20; // 40 s max — then redirect anyway
    const poll = async () => {
      for (let i = 0; i < MAX_POLLS && !cancelled; i++) {
        try {
          const result = await dispatch(fetchParticipantResults({ campaignId, participantId })).unwrap();
          if (result.participant?.status === 'COMPLETED') {
            if (!cancelled) goToResults();
            return;
          }
        } catch { /* keep polling */ }
        await new Promise(r => setTimeout(r, 2000));
      }
      // Redirect regardless after timeout so the user isn't stuck
      if (!cancelled) goToResults();
    };
    poll();
    return () => { cancelled = true; };
  }, [socket.interviewStatus, campaignId, participantId, goToResults, dispatch]);

  // Warn on page refresh / tab close while active
  useEffect(() => {
    if (socket.interviewStatus !== 'active') return;
    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [socket.interviewStatus]);

  // Warn on browser back button while active
  useEffect(() => {
    if (socket.interviewStatus !== 'active') return;
    router.beforePopState(() => {
      setShowEndConfirm(true);
      return false;
    });
    return () => router.beforePopState(() => true);
  }, [socket.interviewStatus, router]);

  const isActive = socket.interviewStatus === 'active';

  const lastMessage = audio.conversationHistory.filter(m => m.type !== 'system').at(-1) ?? null;
  const qCount      = audio.conversationHistory.filter(m => m.type === 'question' || m.type === 'follow_up').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', userSelect: 'none', WebkitUserSelect: 'none' }}>

      <InterviewPageHeader
        campaign={campaign}
        moduleType={moduleType}
        interviewStatus={socket.interviewStatus}
        isVoiceActive={audio.isVoiceActive}
        agentState={audio.agentState}
        coverage={coverage}
        onBack={onBack}
        onEnd={() => setShowEndConfirm(true)}
      />

      {/* Connection warning banner */}
      {socket.isHydrated && socket.connectionStatus !== 'connected' && (
        <Box sx={{
          bgcolor: '#fefce8', borderBottom: '1px solid #fde047',
          px: { xs: 2, md: 4 }, py: 1,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ca8a04' }} />
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#854d0e' }}>
            {socket.connectionStatus === 'connecting'
              ? 'Connecting to interview system…'
              : socket.connectionStatus === 'error'
              ? 'Connection error — please refresh'
              : 'Disconnected — attempting to reconnect…'}
          </Typography>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

        {/* Coverage progress card — active only */}
        {isActive && (
          <Box sx={{
            bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e2f5',
            px: { xs: 2.5, md: 3.5 }, py: 2, mb: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
                Interview completion
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: '#8310FF' }}>
                {Math.round(coverage?.overall ?? 0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(coverage?.overall ?? 0, 100)}
              sx={{
                height: 6, borderRadius: 4,
                bgcolor: 'rgba(131,16,255,0.08)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #8310FF, #a855f7)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Main card */}
        <Box sx={{
          bgcolor: '#fff', borderRadius: '20px',
          border: '1px solid #e8e2f5', overflow: 'hidden',
        }}>
          {/* Question panel — full width, active only */}
          {isActive && lastMessage && (
            <QuestionPanel
              currentMessage={lastMessage}
              isInReadingTime={audio.isInReadingTime}
              readingTimeLeft={audio.readingTimeLeft}
              questionHighlight={audio.questionHighlight}
              questionNumber={lastMessage.type === 'question' || lastMessage.type === 'follow_up' ? qCount : 0}
            />
          )}

          {/* Camera LEFT · Controls RIGHT */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 3fr' }, gap: 0 }}>
            <Box sx={{ borderRight: { md: '1px solid #f0edf8' }, p: 2.5 }}>
              <CameraPreview
                videoRef={camera.videoRef}
                cameraStatus={camera.cameraStatus}
                cameraError={camera.cameraError}
                isConnecting={audio.isConnecting}
                interviewStatus={socket.interviewStatus}
                audioContextRef={audio.audioContextRef}
                attachStream={camera.attachStream}
              />
            </Box>
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InterviewContainer
                interviewStatus={socket.interviewStatus}
                isHydrated={socket.isHydrated}
                connectionStatus={socket.connectionStatus}
                cameraStatus={camera.cameraStatus}
                agentState={audio.agentState}
                currentTranscript={audio.accumulatedTranscript || audio.currentTranscript}
                onStartInterview={startInterview}
                onEndInterview={endInterview}
                onViewResults={goToResults}
              />
              <AgentStatusPanel
                interviewStatus={socket.interviewStatus}
                agentState={audio.agentState}
                isVoiceActive={audio.speechPhase === 'speaking'}
                onSubmitAnswer={audio.sendAccumulatedAnswer}
              />
            </Box>
          </Box>
        </Box>

        {/* Coverage dashboard — shown once coverage data arrives */}
        {coverage && (
          <CoverageDashboard
            interviewStatus={socket.interviewStatus}
            coverage={coverage}
            realTimeReport={null}
            agentMessage=""
            coverageDashboardExpanded={coverageDashboardExpanded}
            onToggleExpand={() => setCoverageDashboardExpanded(p => !p)}
          />
        )}

      </Container>

      <GDPRConsentModal
        open={!camera.consentGiven}
        onAccept={camera.giveConsent}
        onDecline={onBack}
      />

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

      {isActive && (
        <InterviewTimer elapsedTime={timer.elapsedTime} timeWarning={timer.timeWarning} />
      )}

      {/* ── End-interview confirmation ── */}
      <Dialog
        open={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px', p: 1, maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2, px: 4 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%',
            bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2.5,
          }}>
            <WarningAmberOutlined sx={{ fontSize: 30, color: '#DC2626' }} />
          </Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 1 }}>
            End this interview?
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7 }}>
            This interview can only be taken <strong>once</strong>. Once you end it, you will not be able to retake it and your answers will be submitted for evaluation.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3.5, pt: 1, gap: 1.5, flexDirection: 'column' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => { setShowEndConfirm(false); endInterview(); }}
            sx={{
              bgcolor: '#DC2626', color: '#fff', borderRadius: '12px',
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem',
              textTransform: 'none', py: 1.25, boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
            }}
          >
            Yes, end the interview
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowEndConfirm(false)}
            sx={{
              borderColor: '#E5E7EB', color: '#374151', borderRadius: '12px',
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.9rem',
              textTransform: 'none', py: 1.25,
              '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
            }}
          >
            Continue interview
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default InterviewAssessment;
