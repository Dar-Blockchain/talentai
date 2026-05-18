import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
  Container,
  Button,
} from '@mui/material';
import Header from '@/components/layout/Header';
import { GlobalStyles } from '../../styles/globalStyles';
import QuestionPanel from './QuestionPanel';
import CameraPreview from './CameraPreview';
import AgentStatusPanel from './AgentStatusPanel';
import InterviewContainer from './InterviewContainer';
import PipelineModals from '../modals/PipelineModals';
import SecurityModals from '../modals/SecurityModals';
import InterviewTimer from './InterviewTimer';
import CoverageDashboard from './CoverageDashboard';
import GDPRConsentModal from '../modals/GDPRConsentModal';
import { PURPLE } from '../../constants/colors';
import { type InterviewConfig, type Coverage, type InterviewMessage } from '../../types/interview';
import { type JobPost, type PipelineProgress } from '../../types/api';
import { type UseInterviewSocketReturn } from '../../hooks/useInterviewSocket';
import { type UseAudioTranscriptionReturn } from '../../hooks/useAudioTranscription';
import { type UseInterviewTimerReturn } from '../../hooks/useInterviewTimer';
import { type UseCameraReturn } from '../../hooks/useCamera';
import { type UseSecurityMonitoringReturn } from '../../hooks/useSecurityMonitoring';

interface InterviewScreenProps {
  session: {
    socket: UseInterviewSocketReturn;
    audio: UseAudioTranscriptionReturn;
    timer: UseInterviewTimerReturn;
    camera: UseCameraReturn;
    security: UseSecurityMonitoringReturn;
    coverage: Coverage | null;
    coverageDashboardExpanded: boolean;
    setCoverageDashboardExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
    startInterview: () => Promise<void>;
    endInterview: () => void;
    handleViewResults: () => void;
  };
  configData: {
    interviewConfig: InterviewConfig;
    isPipelineJob: boolean;
    candidateProgress: PipelineProgress | null;
    currentPipelineStep: number | null;
    pipelineLoading: boolean;
    showBlockedModal: boolean;
    showFailedModal: boolean;
    blockMessage: string;
    jobData: JobPost | null;
  };
  notification: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' };
  hideNotification: () => void;
}

export default function InterviewScreen({ session, configData, notification, hideNotification }: InterviewScreenProps) {
  const router = useRouter();
  const { t } = useTranslation('modules/interview/hr');

  const {
    socket, audio, timer, camera, security,
    coverage, coverageDashboardExpanded, setCoverageDashboardExpanded,
    startInterview, endInterview, handleViewResults,
  } = session;

  const {
    interviewConfig, isPipelineJob, candidateProgress, currentPipelineStep,
    pipelineLoading, showBlockedModal, showFailedModal, blockMessage, jobData,
  } = configData;

  const isActive = socket.interviewStatus === 'active';

  const interviewLabel = useMemo(() => {
    const jobTitle = jobData?.jobDetails?.title || jobData?.title;
    if (jobTitle) return jobTitle;
    switch (interviewConfig?.interviewType) {
      case 'TECHNICAL_INTERVIEW': return t('interview_types.technical_role', { role: interviewConfig.context?.targetRole || 'Technical' });
      case 'ASSESSMENT':          return t('interview_types.assessment');
      case 'EVALUATION':          return t('interview_types.evaluation');
      default:                    return t('interview_types.hr');
    }
  }, [jobData, interviewConfig, t]);

  const connectionBannerText = useMemo(() => {
    switch (socket.connectionStatus) {
      case 'connecting':    return t('connection.connecting');
      case 'error':         return t('connection.error');
      default:              return t('connection.reconnecting');
    }
  }, [socket.connectionStatus, t]);

  const lastQuestion = useMemo((): InterviewMessage | null => {
    const visible = audio.conversationHistory.filter((m) => m.type !== 'system');
    return visible.at(-1) ?? null;
  }, [audio.conversationHistory]);

  const questionCount = useMemo(
    () => audio.conversationHistory.filter((m) => m.type === 'question' || m.type === 'follow_up').length,
    [audio.conversationHistory],
  );

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', userSelect: 'none', WebkitUserSelect: 'none', pt: '64px' }}>
        <Header />

        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Box sx={{ bgcolor: '#fefce8', borderBottom: '1px solid #fde047', px: { xs: 2, md: 4 }, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ca8a04', flexShrink: 0 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#854d0e' }}>
              {connectionBannerText}
            </Typography>
          </Box>
        )}

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

          {/* Header bar — interview label, pipeline step, timer, end button */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', px: { xs: 2.5, md: 3.5 }, py: { xs: 2, md: 2.5 }, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
              <Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.2 }}>
                  {interviewLabel}
                </Typography>
                {(jobData?.companyName || interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW') && (
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#6B7280', mt: 0.25 }}>
                    {jobData?.companyName
                      ? `${jobData.companyName} · ${t('ai_powered')}`
                      : `${router.query.skill || 'Technical'} · ${interviewConfig.context?.experienceLevel || ''}`}
                  </Typography>
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                {isPipelineJob && currentPipelineStep && candidateProgress && (
                  <Chip
                    label={t('step', { current: currentPipelineStep, total: candidateProgress.steps.length })}
                    size="small"
                    sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', bgcolor: 'rgba(131,16,255,0.08)', color: PURPLE, border: '1px solid rgba(131,16,255,0.2)', height: 24 }}
                  />
                )}
                {isActive && <InterviewTimer elapsedTime={timer.elapsedTime} timeWarning={timer.timeWarning} />}
                {isActive && (
                  <Button
                    variant="contained"
                    onClick={endInterview}
                    sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', textTransform: 'none', bgcolor: '#fef2f2', color: '#ef4444', borderRadius: '12px', px: 3, py: 1.25, boxShadow: 'none', border: '1px solid rgba(239,68,68,0.2)', '&:hover': { bgcolor: '#fee2e2', boxShadow: 'none' } }}
                  >
                    {t('end_interview')}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Coverage progress bar */}
          {isActive && (
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e2f5', px: { xs: 2.5, md: 3.5 }, py: 2, mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
                  {t('interview_completion')}
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: PURPLE }}>
                  {Math.round(coverage?.overall ?? 0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(coverage?.overall ?? 0, 100)}
                sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(131,16,255,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#8310FF,#a855f7)', borderRadius: 4 } }}
              />
            </Box>
          )}

          {/* Main interview panel */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5' }}>
            {isActive && lastQuestion && (
              <QuestionPanel
                currentMessage={lastQuestion}
                isInReadingTime={audio.isInReadingTime}
                readingTimeLeft={audio.readingTimeLeft}
                questionHighlight={audio.questionHighlight}
                questionNumber={lastQuestion.type === 'question' || lastQuestion.type === 'follow_up' ? questionCount : 0}
              />
            )}

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
                  onViewResults={handleViewResults}
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

          {coverage && (
            <CoverageDashboard
              interviewStatus={socket.interviewStatus}
              coverage={coverage}
              realTimeReport={null}
              agentMessage=""
              coverageDashboardExpanded={coverageDashboardExpanded}
              onToggleExpand={() => setCoverageDashboardExpanded((p) => !p)}
            />
          )}

        </Container>

        <GDPRConsentModal
          open={!camera.consentGiven}
          onAccept={camera.giveConsent}
          onDecline={() => router.back()}
        />

        <Snackbar open={notification.open} autoHideDuration={4000} onClose={hideNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={notification.severity} onClose={hideNotification}>{notification.message}</Alert>
        </Snackbar>

        <PipelineModals
          pipelineLoading={pipelineLoading}
          showBlockedModal={showBlockedModal}
          showFailedModal={showFailedModal}
          blockMessage={blockMessage}
          onReturnToDashboard={() => router.push('/dashboard')}
        />

        <SecurityModals
          showFirstViolationModal={security.showFirstViolationModal}
          showSecurityModal={security.showSecurityModal}
          violationType={security.violationType}
          securityViolationCount={security.securityViolationCount}
          onDismissFirst={() => security.setShowFirstViolationModal(false)}
          onDismissSecond={() => security.setShowSecurityModal(false)}
          onReturnToDashboard={() => router.push('/candidate/dashboard')}
        />

      </Box>
    </>
  );
}
