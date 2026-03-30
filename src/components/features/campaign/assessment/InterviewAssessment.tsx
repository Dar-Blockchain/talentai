import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

import { Campaign }  from '@/types/campaign';
import { InterviewMessage, Coverage, InterviewStatus, AgentState, CameraStatus, ConnectionStatus } from '@/types/interview';
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

import InterviewPageHeader       from './InterviewPageHeader';
import InterviewConnectionBanner from './InterviewConnectionBanner';
import InterviewStatusPanel      from './InterviewStatusPanel';
import CameraPreview             from './CameraPreview';
import QuestionPanel             from './QuestionPanel';
import AgentStatusPanel          from './AgentStatusPanel';
import LiveStatusPanel           from './LiveStatusPanel';
import InterviewScoresPanel      from './InterviewScoresPanel';
import GDPRConsentModal          from './GDPRConsentModal';
import SecurityModals            from './SecurityModals';
import { Snackbar, Alert }       from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────
// Layout sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface CameraProps {
  videoRef:        React.RefObject<HTMLVideoElement>;
  cameraStatus:    CameraStatus;
  cameraError:     string | null;
  isConnecting:    boolean;
  interviewStatus: InterviewStatus;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  attachStream?:   () => void;
}

interface IdleViewProps extends CameraProps {
  moduleType:       string;
  isHydrated:       boolean;
  connectionStatus: ConnectionStatus;
  onStart:          () => void;
  onViewResults:    () => void;
}

const IdleView: React.FC<IdleViewProps> = ({
  moduleType, isHydrated, connectionStatus,
  onStart, onViewResults,
  ...cam
}) => (
  <Box sx={{
    height: '100%',
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
    gap: 1.5, p: 1.5, overflow: 'auto',
  }}>
    <Box sx={{ width: '100%' }}>
      <CameraPreview {...cam} />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
      <InterviewStatusPanel
        interviewStatus={cam.interviewStatus}
        moduleType={moduleType}
        isHydrated={isHydrated}
        connectionStatus={connectionStatus}
        cameraStatus={cam.cameraStatus}
        onStart={onStart}
        onViewResults={onViewResults}
      />
    </Box>
  </Box>
);

interface ActiveViewProps extends CameraProps {
  agentState:       AgentState;
  isVoiceActive:    boolean;
  isRecording:      boolean;
  conversationHistory: InterviewMessage[];
  isInReadingTime:  boolean;
  readingTimeLeft:  number;
  questionHighlight: boolean;
  sendAccumulatedAnswer: () => void;
  connectionStatus: ConnectionStatus;
  coverage:         Coverage | null;
  elapsedTime:      number;
  moduleType:       string;
}

const ActiveView: React.FC<ActiveViewProps> = ({
  agentState, isVoiceActive, isRecording,
  conversationHistory, isInReadingTime, readingTimeLeft, questionHighlight,
  sendAccumulatedAnswer, connectionStatus, coverage, elapsedTime, moduleType,
  ...cam
}) => {
  const lastMessage = conversationHistory.filter(m => m.type !== 'system').at(-1) ?? null;

  return (
    <Box sx={{
      height: '100%',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
      gap: 1.5, p: 1.5, overflow: 'auto',
    }}>
      <Box sx={{ width: '100%' }}>
        <CameraPreview {...cam} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', overflow: 'hidden' }}>
        <Box sx={{
          flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {lastMessage ? (
              <QuestionPanel
                currentMessage={lastMessage}
                isInReadingTime={isInReadingTime}
                readingTimeLeft={readingTimeLeft}
                questionHighlight={questionHighlight}
              />
            ) : (
              <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} sx={{ color: '#0D9488', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 14, color: '#64748B' }}>
                  Preparing your first question…
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
            <AgentStatusPanel
              interviewStatus={cam.interviewStatus}
              agentState={agentState}
              onSubmitAnswer={sendAccumulatedAnswer}
            />
          </Box>
        </Box>
        <Box sx={{ flex: '0 0 auto' }}>
          <LiveStatusPanel
            agentState={agentState}
            isVoiceActive={isVoiceActive}
            cameraStatus={cam.cameraStatus}
            connectionStatus={connectionStatus}
            coverage={coverage}
            elapsedTime={elapsedTime}
            isRecording={isRecording}
            moduleType={moduleType}
          />
        </Box>
      </Box>
    </Box>
  );
};

interface EndedViewProps extends CameraProps {
  finalReport: any;
  coverage:    Coverage | null;
  moduleType:  string;
  onViewResults: () => void;
}

const EndedView: React.FC<EndedViewProps> = ({
  finalReport, coverage, moduleType, onViewResults, ...cam
}) => (
  <Box sx={{ height: '100%', overflow: 'auto', py: 4, px: { xs: 2, md: 4 } }}>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
      gap: 3, alignItems: 'start', maxWidth: 1100, mx: 'auto',
    }}>
      <InterviewScoresPanel
        finalReport={finalReport}
        coverage={coverage}
        moduleType={moduleType}
        onViewResults={onViewResults}
      />
      <CameraPreview {...cam} />
    </Box>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface InterviewAssessmentProps {
  campaign:      Campaign;
  participantId: string;
  campaignId:    string;
  onBack:        () => void;
}

const InterviewAssessment: React.FC<InterviewAssessmentProps> = ({
  campaign, participantId, campaignId, onBack,
}) => {
  const router     = useRouter();
  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';

  const [coverage,    setCoverage]    = useState<Coverage | null>(null);
  const [finalReport, setFinalReport] = useState<any>(null);

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
  const security = useSecurityMonitoring({ interviewStatus: socket.interviewStatus });

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
      if (data.finalReport) setFinalReport(data.finalReport);
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

  const handleViewResults = useCallback(
    () => router.push(`/employee/campaigns/${campaignId}/results`),
    [router, campaignId],
  );

  const showConnectionBanner = socket.isHydrated && socket.connectionStatus !== 'connected';

  const camProps: CameraProps = {
    videoRef:        camera.videoRef,
    cameraStatus:    camera.cameraStatus,
    cameraError:     camera.cameraError,
    isConnecting:    audio.isConnecting,
    interviewStatus: socket.interviewStatus,
    audioContextRef: audio.audioContextRef,
    attachStream:    camera.attachStream,
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>

      <InterviewPageHeader
        campaign={campaign}
        moduleType={moduleType}
        interviewStatus={socket.interviewStatus}
        isVoiceActive={audio.isVoiceActive}
        agentState={audio.agentState}
        coverage={coverage}
        elapsedTime={timer.elapsedTime}
        timeWarning={timer.timeWarning}
        onBack={onBack}
        onEnd={endInterview}
      />

      {showConnectionBanner && (
        <InterviewConnectionBanner connectionStatus={socket.connectionStatus} />
      )}

      <Box sx={{ flex: 1, overflow: 'hidden' }}>

        {(socket.interviewStatus === 'idle' || socket.interviewStatus === 'connecting') && (
          <IdleView
            {...camProps}
            moduleType={moduleType}
            isHydrated={socket.isHydrated}
            connectionStatus={socket.connectionStatus}
            onStart={startInterview}
            onViewResults={handleViewResults}
          />
        )}

        {socket.interviewStatus === 'active' && (
          <ActiveView
            {...camProps}
            agentState={audio.agentState}
            isVoiceActive={audio.isVoiceActive}
            isRecording={audio.isRecording}
            conversationHistory={audio.conversationHistory}
            isInReadingTime={audio.isInReadingTime}
            readingTimeLeft={audio.readingTimeLeft}
            questionHighlight={audio.questionHighlight}
            sendAccumulatedAnswer={audio.sendAccumulatedAnswer}
            connectionStatus={socket.connectionStatus}
            coverage={coverage}
            elapsedTime={timer.elapsedTime}
            moduleType={moduleType}
          />
        )}

        {socket.interviewStatus === 'ended' && (
          <EndedView
            {...camProps}
            finalReport={finalReport}
            coverage={coverage}
            moduleType={moduleType}
            onViewResults={handleViewResults}
          />
        )}

      </Box>

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

      <SecurityModals
        showFirstViolationModal={security.showFirstViolationModal}
        showSecurityModal={security.showSecurityModal}
        onDismissFirst={() => security.setShowFirstViolationModal(false)}
        onDismissSecond={() => security.setShowSecurityModal(false)}
        onReturnToDashboard={onBack}
      />
    </Box>
  );
};

export default InterviewAssessment;
