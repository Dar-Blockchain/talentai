'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter }        from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState }   from '@/store/store';
import { Box, Snackbar, Alert, CircularProgress, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

import { Campaign }         from '@/types/campaign';
import axiosInstance        from '@/utils/axiosInstance';
import { InterviewMessage, Coverage } from '@/types/interview';
import {
  fetchCampaignById,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
} from '@/store/slices/campaignSlice';

// ─── Campaign-only components ─────────────────────────────────────────────────
import { GlobalStyles }           from '@/components/features/campaign/interview/start/styles';
import InterviewPageHeader        from '@/components/features/campaign/interview/start/InterviewPageHeader';
import InterviewStatusPanel       from '@/components/features/campaign/interview/start/InterviewStatusPanel';
import InterviewConnectionBanner  from '@/components/features/campaign/interview/start/InterviewConnectionBanner';
import InterviewUnsupportedModule from '@/components/features/campaign/interview/start/InterviewUnsupportedModule';
import { InterviewSpinner, InterviewErrorState } from '@/components/features/campaign/interview/start/InterviewLoadingState';
import QuestionnaireForm          from '@/components/features/campaign/interview/start/QuestionnaireForm';
import QuestionPanel              from '@/components/features/campaign/interview/start/QuestionPanel';
import CameraPreview              from '@/components/features/campaign/interview/start/CameraPreview';
import AgentStatusPanel           from '@/components/features/campaign/interview/start/AgentStatusPanel';
import LiveStatusPanel            from '@/components/features/campaign/interview/start/LiveStatusPanel';
import InterviewScoresPanel       from '@/components/features/campaign/interview/start/InterviewScoresPanel';
import SecurityModals             from '@/components/features/campaign/interview/start/SecurityModals';
import GDPRConsentModal           from '@/components/features/campaign/interview/start/GDPRConsentModal';

// ─── Hooks ────────────────────────────────────────────────────────────────────
import { useNotification }              from '@/hooks/useNotification';
import { useInterviewTimer }            from '@/hooks/useInterviewTimer';
import { useCamera }                    from '@/hooks/useCamera';
import { useSecurityMonitoring }        from '@/hooks/useSecurityMonitoring';
import { useCampaignInterviewConfig }   from '@/hooks/useCampaignInterviewConfig';
import {
  useInterviewSocket,
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
} from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// ─────────────────────────────────────────────────────────────────────────────
// Questionnaire assessment — no sockets, no camera, no audio
// ─────────────────────────────────────────────────────────────────────────────

const QuestionnaireAssessment: React.FC<{
  campaign:      Campaign;
  participantId: string;
  onBack:        () => void;
  onComplete:    () => void;
}> = ({ campaign, participantId, onBack, onComplete }) => {
  const questions = (campaign.module as any)?.config?.questions ?? [];

  useEffect(() => {
    if (!participantId) return;
    axiosInstance.patch(`internal-campaigns/${campaign._id}/start/${participantId}`).catch(() => {});
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
      <InterviewPageHeader
        campaign={campaign}
        moduleType="QUESTIONNAIRE"
        interviewStatus="idle"
        isVoiceActive={false}
        agentState="waiting"
        coverage={null}
        elapsedTime={0}
        timeWarning={false}
        onBack={onBack}
        onEnd={() => {}}
      />
      <Box sx={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxWidth: 760, width: '100%', mx: 'auto',
        px: { xs: 2, md: 0 }, py: 2,
      }}>
        <Box sx={{
          flex: 1, overflow: 'hidden',
          bgcolor: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <QuestionnaireForm
            campaignId={campaign._id}
            participantId={participantId}
            questions={questions}
            onComplete={onComplete}
            onBack={onBack}
          />
        </Box>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Interview / Skill Test assessment — full socket + audio + camera stack
// ─────────────────────────────────────────────────────────────────────────────

const InterviewAssessment: React.FC<{
  campaign:      Campaign;
  participantId: string;
  campaignId:    string;
  onBack:        () => void;
}> = ({ campaign, participantId, campaignId, onBack }) => {
  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';

  const [coverage,    setCoverage]    = useState<Coverage | null>(null);
  const [finalReport, setFinalReport] = useState<any>(null);

  const { notification, showNotification, hideNotification } = useNotification();
  const { interviewConfig } = useCampaignInterviewConfig(campaign);

  const endInterviewRef = useRef<() => void>(() => {});
  const handlersRef = useRef({
    onInterviewStarted: (_: InterviewStartedData)      => {},
    onInterviewMessage: (_: InterviewMessage)           => {},
    onSilenceResponse:  (_: SilenceResponseData)        => {},
    onVoiceActivity:    (_: { isActive: boolean })      => {},
    onInterviewEnded:   (_: InterviewEndedData)         => {},
    onInterviewError:   ()                              => {},
  });

  const socket = useInterviewSocket({
    namespace:          '/campaign-interview',
    onNotification:     showNotification,
    onInterviewStarted: useCallback((d: InterviewStartedData)  => handlersRef.current.onInterviewStarted(d), []),
    onInterviewMessage: useCallback((m: InterviewMessage)       => handlersRef.current.onInterviewMessage(m), []),
    onCoverageUpdate:   useCallback((c: Coverage)               => setCoverage(c),                            []),
    onReportUpdate:     useCallback(() => {},                                                                  []),
    onSilenceResponse:  useCallback((d: SilenceResponseData)    => handlersRef.current.onSilenceResponse(d),  []),
    onVoiceActivity:    useCallback((d: { isActive: boolean })  => handlersRef.current.onVoiceActivity(d),    []),
    onInterviewEnded:   useCallback((d: InterviewEndedData)     => handlersRef.current.onInterviewEnded(d),   []),
    onInterviewError:   useCallback(()                          => handlersRef.current.onInterviewError(),     []),
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

  const handleViewResults = useCallback(() => {
    window.location.assign(`/interview/results?campaignId=${campaignId}&participantId=${participantId}`);
  }, [campaignId, participantId]);

  const isActive             = socket.interviewStatus === 'active';
  const lastMessage          = audio.conversationHistory.filter(m => m.type !== 'system').at(-1) ?? null;
  const showConnectionBanner = socket.isHydrated && socket.connectionStatus !== 'connected';

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

        {/* ── Idle / Connecting ── */}
        {(socket.interviewStatus === 'idle' || socket.interviewStatus === 'connecting') && (
          <Box sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 1.5, p: 1.5, overflow: 'auto',
          }}>
            <Box sx={{ width: '100%' }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
              <InterviewStatusPanel
                interviewStatus={socket.interviewStatus}
                moduleType={moduleType}
                isHydrated={socket.isHydrated}
                connectionStatus={socket.connectionStatus}
                cameraStatus={camera.cameraStatus}
                onStart={startInterview}
                onViewResults={handleViewResults}
              />
            </Box>
          </Box>
        )}

        {/* ── Active ── */}
        {isActive && (
          <Box sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 1.5, p: 1.5, overflow: 'auto',
          }}>
            <Box sx={{ width: '100%' }}>
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
                      isInReadingTime={audio.isInReadingTime}
                      readingTimeLeft={audio.readingTimeLeft}
                      questionHighlight={audio.questionHighlight}
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
                    interviewStatus={socket.interviewStatus}
                    agentState={audio.agentState}
                    onSubmitAnswer={audio.sendAccumulatedAnswer}
                  />
                </Box>
              </Box>
              <Box sx={{ flex: '0 0 auto' }}>
                <LiveStatusPanel
                  agentState={audio.agentState}
                  isVoiceActive={audio.isVoiceActive}
                  cameraStatus={camera.cameraStatus}
                  connectionStatus={socket.connectionStatus}
                  coverage={coverage}
                  elapsedTime={timer.elapsedTime}
                  isRecording={audio.isRecording}
                  moduleType={moduleType}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Ended ── */}
        {socket.interviewStatus === 'ended' && (
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
                onViewResults={handleViewResults}
              />
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
          </Box>
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

// ─────────────────────────────────────────────────────────────────────────────
// Root page — loads campaign, routes to the right assessment component
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeCampaignAssessment: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id }   = router.query as { id?: string };

  const authUser        = useSelector((state: RootState) => state.user.connectedUser.user);
  const campaign        = useSelector(selectSelectedCampaign);
  const campaignLoading = useSelector(selectDetailLoading);
  const campaignError   = useSelector(selectDetailError);

  const participantId = authUser?._id ?? '';

  useEffect(() => {
    if (id) dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  const handleBack = useCallback(
    () => router.push(`/employee/campaigns/${id}`),
    [router, id],
  );

  const handleResults = useCallback(
    () => router.push(`/employee/campaigns/${id}/results`),
    [router, id],
  );

  if (!router.isReady || campaignLoading) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewSpinner />
      </>
    );
  }

  if (campaignError || !campaign) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewErrorState message={campaignError} onBack={handleBack} />
      </>
    );
  }

  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      {moduleType === 'QUESTIONNAIRE' ? (
        <QuestionnaireAssessment
          campaign={campaign}
          participantId={participantId}
          onBack={handleBack}
          onComplete={handleResults}
        />
      ) : moduleType === 'AI_INTERVIEW' || moduleType === 'SKILL_TEST' ? (
        <InterviewAssessment
          campaign={campaign}
          participantId={participantId}
          campaignId={id ?? ''}
          onBack={handleBack}
        />
      ) : (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
          <Box sx={{ maxWidth: 600, mx: 'auto', py: 10, px: 3 }}>
            <InterviewUnsupportedModule moduleType={moduleType} onBack={handleBack} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignAssessment), { ssr: false });
