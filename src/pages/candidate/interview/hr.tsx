'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockedScreen from '@/components/ui/BlockedScreen';
import Cookies from 'js-cookie';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { checkPostInterviewAssessment } from '@/store/slices/interviewSlice';


// Types
import {
  InterviewMessage,
  Coverage,
} from '@/types/interview';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useCamera } from '@/hooks/useCamera';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useInterviewConfig } from '@/hooks/useInterviewConfig';
import { useInterviewSocket, InterviewStartedData, InterviewEndedData, SilenceResponseData } from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// Layout
import Header from '@/components/layout/Header';

// Interview components
import {
  QuestionPanel,
  CameraPreview,
  AgentStatusPanel,
  InterviewContainer,
  PipelineModals,
  SecurityModals,
  InterviewTimer,
} from '@/components/features/interview/start';
import InterviewIntro from '@/components/features/interview/start/InterviewIntro';
import GDPRConsentModal from '@/components/features/interview/start/GDPRConsentModal';
import JobPreviewPanel from '@/components/features/interview/start/JobPreviewPanel';
import InterviewLanguageModal from '@/components/features/candidate/candidate-interviews/InterviewLanguageModal';
import CoverageDashboard from '@/components/features/interview/start/CoverageDashboard';

// Styles
import { GlobalStyles } from '@/components/features/interview/start/styles';

const PURPLE = '#8310FF';

const IntelligentInterviewTest = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('modules/interview/hr');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const [step, setStep] = useState<'intro' | 'interview'>('intro');
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(true);
  const [assessmentChecking, setAssessmentChecking] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [companyBlocked, setCompanyBlocked] = useState(false);
  const [isEmployeeBlocked, setIsEmployeeBlocked] = useState(false);

  const hasJobId = router.isReady && typeof router.query.jobId === 'string' && !!router.query.jobId;
  const jobId = router.isReady ? (router.query.jobId as string | undefined) : undefined;
  const refParam = router.isReady ? (router.query.ref as string | undefined) : undefined;

  useEffect(() => {
    if (!router.isReady) return;

    if (authUser?.role === 'Employee') {
      setIsEmployeeBlocked(true);
      setAssessmentChecking(false);
      return;
    }

    if (!router.query.jobId) { setStep('interview'); setAssessmentChecking(false); return; }

    const postId = router.query.jobId as string;
    const token = Cookies.get('api_token');
    const ref = router.query.ref as string | undefined;
    const isPublicLink = ref === 'link';

    if (authUser && token) {
      if (authUser.role !== 'Company' && authUser.role !== 'Employee') {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}job-applications/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ post: postId }),
        }).catch(() => {});
      }

      dispatch(checkPostInterviewAssessment(postId)).then((result) => {
        if (checkPostInterviewAssessment.fulfilled.match(result)) {
          if (result.payload.isCompanyBlocked) { setCompanyBlocked(true); setTimeout(() => router.replace('/company/dashboard'), 3000); return; }
          else if (result.payload.isArchived) setIsArchived(true);
          else if (result.payload.exists) setAlreadyCompleted(true);
        }
      }).finally(() => setAssessmentChecking(false));
    } else {
      setAssessmentChecking(false);
    }
  }, [router.isReady, router.query.jobId, authUser?.role]);

  const { notification, showNotification, hideNotification } = useNotification();

  const notify = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    showNotification(message, severity);
  }, [showNotification]);

  const {
    interviewConfig,
    setInterviewConfig,
    isPipelineJob,
    candidateProgress,
    currentPipelineStep,
    pipelineLoading,
    configLoading,
    showBlockedModal,
    showFailedModal,
    blockMessage,
    jobData,
    limitReached,
    limitMessage,
    limitJobTitle,
    isExpired,
  } = useInterviewConfig({ showNotification: notify });

  const endInterviewRef = useRef<() => void>(() => { });

  const handleInterviewStarted = useCallback((data: InterviewStartedData) => {
    timer.startTimer(data.config.duration || 20);
    timer.setDuration(data.config.duration * 60 * 1000);

    if (data.targetCompany) {
      setInterviewConfig({
        ...interviewConfig,
        context: { ...interviewConfig.context, targetCompany: data.targetCompany }
      });
    }

    if (data.config.silenceIntelligence) {
      audio.setBackendSilenceConfig(data.config.silenceIntelligence);
      const typeThreshold = data.config.silenceIntelligence.threshold || 5000;
      audio.setAdaptiveSilenceThreshold(typeThreshold);
    }
  }, [setInterviewConfig]);

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

  const handleCoverageUpdate = useCallback((newCoverage: Coverage) => { setCoverage(newCoverage); }, []);

  const handleSilenceResponse = useCallback((data: SilenceResponseData) => {
    audio.setSilenceCount(data.silenceCount);
    if (data.action === 'silence_prompt') {
      notify('Take your time to think...', 'info');
      audio.setAgentState('waiting');
      audio.setAgentMessage(data.content || 'AI provided encouragement');
      audio.setConversationHistory(prev => [...prev, { type: 'system' as const, content: data.content || '', timestamp: data.timestamp || new Date().toISOString() }]);
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
      const analysisData = { finalReport: data.finalReport, analytics: data.analytics, sessionId: data.sessionId, interviewType: interviewConfig?.interviewType || 'HR_INTERVIEW', timestamp: new Date().toISOString() };
      localStorage.setItem('last_interview_analysis', JSON.stringify(analysisData));
    }
    const candidateId = profile?.userId?._id || profile?.userId || authUser?._id;
    if (isPipelineJob && candidateId) {
      try {
        const token = Cookies.get('api_token');
        const jobId = localStorage.getItem('interview_jobId');
        const stepId = localStorage.getItem('interview_stepId');
        const passThreshold = parseInt(localStorage.getItem('interview_passThreshold') || '70');
        const finalScore = data.finalReport?.overallScore || data.analytics?.overallScore || data.analytics?.totalScore || 0;
        const passed = finalScore >= passThreshold;
        if (jobId && stepId) {
          const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/update-step`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ candidateId, jobId, stepId, passed, finalScore }) });
          await updateResponse.json();
          const progressResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/${candidateId}/${jobId}`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            const completedSteps = progressData.stats?.completedSteps || 0;
            const totalSteps = progressData.stats?.totalSteps || 0;
            if (passed) {
              if (completedSteps < totalSteps) {
                localStorage.setItem('pipeline_has_next_step', 'true');
                localStorage.setItem('pipeline_next_step', progressData.currentStep?.stepNumber?.toString() || '');
              } else {
                localStorage.setItem('pipeline_has_next_step', 'false');
                localStorage.setItem('pipeline_complete', 'true');
              }
            } else {
              localStorage.setItem('pipeline_has_next_step', 'false');
              localStorage.setItem('pipeline_failed', 'true');
              localStorage.setItem('pipeline_failed_score', finalScore.toString());
              localStorage.setItem('pipeline_required_score', passThreshold.toString());
            }
          }
        }
      } catch (error) {
        console.error('Error updating pipeline progress:', error);
      }
    }
  }, [interviewConfig, isPipelineJob, profile, authUser]);

  const handleInterviewError = useCallback((error: { message: string }) => {
    audio.setAgentState('waiting');
    audio.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
    console.error('Interview error received:', error.message);
  }, []);

  const socket = useInterviewSocket({
    onNotification: notify,
    onInterviewStarted: handleInterviewStarted,
    onInterviewMessage: handleInterviewMessage,
    onCoverageUpdate: handleCoverageUpdate,
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
    jobData,
  });

  const timer = useInterviewTimer({
    interviewStatus: socket.interviewStatus,
    onTimeUp: useCallback(() => { endInterviewRef.current(); }, []),
    showNotification: notify as any,
  });

  const camera = useCamera({ showNotification: notify as any });

  const security = useSecurityMonitoring({
    interviewStatus: socket.interviewStatus,
    onTerminate: () => endInterviewRef.current(),
    enabled: interviewConfig.enableSecurity !== false,
  });

  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) { notify('Not connected to interview system', 'error'); return; }
    try {
      socket.setInterviewStatus('connecting');
      const candidateId = authUser?.email || 'anonymous';
      await audio.initializeAudio();
      socket.socketRef.current.emit('start_interview', { config: { ...interviewConfig, silenceIntelligence: { interviewType: interviewConfig.interviewType, candidateBehavior: { interactionStyle: 'balanced', confidenceLevel: 'medium', communicationStyle: 'mixed' }, adaptiveMode: true, contextualAdjustments: true } }, candidateId });
    } catch (error) {
      console.error('Failed to start interview:', error);
      notify('Failed to start interview', 'error');
      socket.setInterviewStatus('idle');
    }
  }, [socket.socketRef, socket.isConnected, interviewConfig, authUser, audio.initializeAudio, notify]);

  const endInterview = useCallback(() => {
    if (socket.socketRef.current && socket.sessionId) socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionId });
    if (audio.audioStreamRef.current) audio.audioStreamRef.current.getTracks().forEach(track => track.stop());
    audio.resetSilenceDetection();
    audio.cleanupAssemblyAI();
    audio.setIsRecording(false);
    socket.setInterviewStatus('ended');
    if (socket.sessionId) localStorage.setItem('last_interview_id', socket.sessionId);
  }, [socket.socketRef, socket.sessionId, audio]);

  endInterviewRef.current = endInterview;

  const handleViewResults = useCallback(() => {
    const jobId = localStorage.getItem('interview_jobId');
    router.push(jobId ? `/candidate/interview/results?jobId=${jobId}` : '/candidate/interview/results');
  }, [router]);

  const jobPostTitle = jobData?.jobDetails?.title || jobData?.title;
  const interviewLabel = jobPostTitle
    ? jobPostTitle
    : interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW'
      ? t('interview_types.technical_role', { role: interviewConfig.context?.targetRole || 'Technical' })
      : interviewConfig?.interviewType === 'ASSESSMENT'
        ? t('interview_types.assessment')
        : interviewConfig?.interviewType === 'EVALUATION'
          ? t('interview_types.evaluation')
          : t('interview_types.hr');

  const isActive = socket.interviewStatus === 'active';

  if (!limitReached && (assessmentChecking || (hasJobId && configLoading))) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: 2 }}>
            <CircularProgress sx={{ color: '#8310FF' }} size={40} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280' }}>
              {t('loading')}
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  if (companyBlocked) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress sx={{ color: PURPLE, mb: 3 }} size={40} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 1 }}>
              {t('company_only.title')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280' }}>
              {t('company_only.redirecting')}
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  if (isEmployeeBlocked) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <BlockedScreen
          variant="card"
          accentGradient="linear-gradient(90deg, #8310FF 0%, #a855f7 100%)"
          icon="🔒"
          iconBg="linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)"
          iconBorderColor="rgba(131,16,255,0.15)"
          iconShadow="0 4px 16px rgba(131,16,255,0.12)"
          badge={{ label: 'Candidates only', color: PURPLE, bgColor: '#f5f3ff', borderColor: 'rgba(131,16,255,0.2)' }}
          title="This page is not available for your account"
          description={<>The interview flow is designed for <strong style={{ color: '#111827' }}>Candidate</strong> accounts. Your employee account does not have access to this section.</>}
          actions={[{ label: 'Go to my dashboard', onClick: () => router.replace('/employee/dashboard'), color: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)', hoverColor: 'linear-gradient(135deg, #6d0ee0 0%, #9333ea 100%)' }]}
        />
      </>
    );
  }

  if (isArchived) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <BlockedScreen
          variant="bordered"
          icon="📦"
          iconBg="#F3F4F6"
          iconBorderColor="transparent"
          title={t('archived.title')}
          description={t('archived.desc')}
          actions={[{ label: t('back_to_dashboard'), onClick: () => router.push('/candidate/dashboard'), color: PURPLE, hoverColor: '#6d0ee0' }]}
        />
      </>
    );
  }

  if (isExpired) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <BlockedScreen
          variant="bordered"
          icon="⏰"
          iconBg="#FFF7ED"
          iconBorderColor="#FED7AA"
          borderColor="#FED7AA"
          title={t('expired.title')}
          description={t('expired.desc')}
          actions={[{ label: t('back_to_dashboard'), onClick: () => router.push('/candidate/dashboard'), color: PURPLE, hoverColor: '#6d0ee0' }]}
        />
      </>
    );
  }

  if (alreadyCompleted) {
    const jobTitle = jobData?.jobDetails?.title || jobData?.title || 'this position';
    const company = jobData?.companyName || '';
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <BlockedScreen
          variant="bordered"
          icon={<CheckCircleIcon sx={{ fontSize: 36, color: PURPLE }} />}
          iconBg="rgba(131,16,255,0.08)"
          iconBorderColor="rgba(131,16,255,0.2)"
          title={t('completed.title')}
          subtitle={company ? <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: PURPLE, fontWeight: 600 }}>{company}</Typography> : undefined}
          description={<>{t('completed.desc_pre')} <strong style={{ color: '#111827' }}>{jobTitle}</strong> {t('completed.desc_post')}</>}
          actions={[{ label: t('back_to_dashboard'), onClick: () => router.push('/candidate/dashboard'), color: PURPLE, hoverColor: '#6d0ee0' }]}
        />
      </>
    );
  }

  if (limitReached) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <BlockedScreen
          variant="card"
          accentGradient="linear-gradient(90deg, #EF4444 0%, #F97316 100%)"
          icon="🔒"
          iconBg="linear-gradient(135deg, #FEE2E2 0%, #FFEDD5 100%)"
          iconBorderColor="#FECACA"
          iconShadow="0 4px 16px rgba(239,68,68,0.15)"
          badge={{ label: t('limit.badge'), color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA' }}
          title={t('limit.title')}
          maxWidth={480}
          actions={[
            { label: t('limit.go_back'), onClick: () => router.back(), variant: 'outlined' },
            { label: t('limit.go_home'), onClick: () => router.push('/'), color: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)', hoverColor: 'linear-gradient(135deg, #0F766E 0%, #0E7490 100%)' },
          ]}
        >
          {limitJobTitle && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', px: 2, py: 0.7, mb: 2.5, mt: 1.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94A3B8', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#475569' }}>{limitJobTitle}</Typography>
            </Box>
          )}
          <Box sx={{ height: '1px', bgcolor: '#F1F5F9', mb: 2.5 }} />
          <Typography sx={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, mb: 1.5 }}>{t('limit.desc')}</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.7 }}>{t('limit.contact')}</Typography>
        </BlockedScreen>
      </>
    );
  }

  const handleIntroNext = (_: any) => {
    const langs = jobData?.interviewLanguages as string[] | undefined;
    if (langs && langs.length > 1) {
      setLangPickerOpen(true);
      return;
    }
    const lang = langs?.[0] || 'en';
    setInterviewConfig({ ...interviewConfig, sessionSettings: { ...interviewConfig.sessionSettings, language: lang } });
    setStep('interview');
  };

  const handleLangConfirm = (lang: string) => {
    setInterviewConfig({ ...interviewConfig, sessionSettings: { ...interviewConfig.sessionSettings, language: lang } });
    setLangPickerOpen(false);
    setStep('interview');
  };

  // Unauthenticated user with a valid (non-expired) job post — show job details and sign-in prompt
  if (!authUser && hasJobId && jobData) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <JobPreviewPanel
          jobData={jobData}
          jobId={jobId as string}
          companyId={router.query.companyId as string | undefined}
        />
      </>
    );
  }

  if (step === 'intro') {
    return (
      <>
        <InterviewIntro
          interviewConfig={interviewConfig}
          hasJobId={hasJobId}
          jobId={jobId}
          refParam={refParam}
          jobData={jobData}
          checkingEligibility={false}
          onNext={handleIntroNext}
        />
        <InterviewLanguageModal
          open={langPickerOpen}
          languages={jobData?.interviewLanguages || []}
          onConfirm={handleLangConfirm}
          onClose={() => setLangPickerOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', userSelect: 'none', WebkitUserSelect: 'none', pt: '64px' }}>
        <Header />

        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Box sx={{ bgcolor: '#fefce8', borderBottom: '1px solid #fde047', px: { xs: 2, md: 4 }, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ca8a04' }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#854d0e' }}>
              {socket.connectionStatus === 'connecting' ? t('connection.connecting') : socket.connectionStatus === 'error' ? t('connection.error') : t('connection.reconnecting')}
            </Typography>
          </Box>
        )}

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', boxShadow: 'none', px: { xs: 2.5, md: 3.5 }, py: { xs: 2, md: 2.5 }, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box>
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.2 }}>
                      {interviewLabel}
                    </Typography>
                  </Box>
                  {(jobData?.companyName || interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW') && (
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#6B7280', mt: 0.25 }}>
                      {jobData?.companyName
                        ? `${jobData.companyName} · ${t('ai_powered')}`
                        : `${router.query.skill || 'Technical'} · ${interviewConfig.context?.experienceLevel || ''}`}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                {isPipelineJob && currentPipelineStep && candidateProgress && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={t('step', { current: currentPipelineStep, total: candidateProgress.steps.length })}
                      size="small"
                      sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', bgcolor: 'rgba(131,16,255,0.08)', color: PURPLE, border: '1px solid rgba(131,16,255,0.2)', height: 24 }}
                    />
                  </Box>
                )}

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

          {isActive && (
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e2f5', boxShadow: 'none', px: { xs: 2.5, md: 3.5 }, py: 2, mb: 3 }}>
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

          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', boxShadow: 'none' }}>
            {isActive && (() => {
              const allMsgs = audio.conversationHistory.filter(m => m.type !== 'system');
              const lastMsg = allMsgs.slice(-1)[0];
              if (!lastMsg) return null;
              const qCount = audio.conversationHistory.filter(m => m.type === 'question' || m.type === 'follow_up').length;
              const isQuestion = lastMsg.type === 'question' || lastMsg.type === 'follow_up';
              return (
                <QuestionPanel
                  currentMessage={lastMsg}
                  isInReadingTime={audio.isInReadingTime}
                  readingTimeLeft={audio.readingTimeLeft}
                  questionHighlight={audio.questionHighlight}
                  questionNumber={isQuestion ? qCount : 0}
                />
              );
            })()}

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
              onToggleExpand={() => setCoverageDashboardExpanded(p => !p)}
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

        {isActive && (
          <InterviewTimer elapsedTime={timer.elapsedTime} timeWarning={timer.timeWarning} />
        )}
      </Box>
    </>
  );
};

export default dynamic(() => Promise.resolve(IntelligentInterviewTest), { ssr: false });
