'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

// Icons

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
import CoverageDashboard from '@/components/features/interview/start/CoverageDashboard';

// Styles
import { GlobalStyles } from '@/components/features/interview/start/styles';

const PURPLE = '#8310FF';

const IntelligentInterviewTest = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const [step, setStep] = useState<'intro' | 'interview'>('intro');
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(true);
  const [assessmentChecking, setAssessmentChecking] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [companyBlocked, setCompanyBlocked] = useState(false);

  // Once router is ready: show overview only if jobId is in the URL, otherwise skip straight to interview
  const hasJobId = router.isReady && typeof router.query.jobId === 'string' && !!router.query.jobId;
  const jobId = router.isReady ? (router.query.jobId as string | undefined) : undefined;
  const refParam = router.isReady ? (router.query.ref as string | undefined) : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.jobId) { setStep('interview'); setAssessmentChecking(false); return; }

    const postId = router.query.jobId as string;
    const token = Cookies.get('api_token');
    const ref = router.query.ref as string | undefined;
    const isPublicLink = ref === 'link';

    // No token + public link → redirect to job landing page
    if (!token && isPublicLink) {
      router.replace(`/jobs/${postId}`);
      return;
    }

    if (authUser && token) {
      // Auto-create job application only for candidates
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
      // Guest (no token) — skip all auth-required checks
      setAssessmentChecking(false);
    }
  }, [router.isReady, router.query.jobId]);

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

    // Update config with real company name from backend
    if (data.targetCompany) {
      setInterviewConfig({
        ...interviewConfig,
        context: { ...interviewConfig.context, targetCompany: data.targetCompany }
      });
    }

    // Configure backend silence intelligence
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
    enabled: interviewConfig.enableSecurity !== false, // default ON unless explicitly false
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
    router.push(jobId ? `/interview/results?jobId=${jobId}` : '/interview/results');
  }, [router]);

  const jobPostTitle = jobData?.jobDetails?.title || jobData?.title;
  const interviewLabel = jobPostTitle
    ? jobPostTitle
    : interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW'
      ? `${interviewConfig.context?.targetRole || 'Technical'} Interview`
      : interviewConfig?.interviewType === 'ASSESSMENT'
        ? 'Soft Skills Assessment'
        : interviewConfig?.interviewType === 'EVALUATION'
          ? 'Psychotechnic Assessment'
          : 'HR Interview';

  const isActive = socket.interviewStatus === 'active';

  /* ── Checking assessment status / loading config ── */
  if (!limitReached && (assessmentChecking || (hasJobId && configLoading))) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: 2 }}>
            <CircularProgress sx={{ color: '#8310FF' }} size={40} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280' }}>
              Loading interview…
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  /* ── Company blocked ── */
  if (companyBlocked) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress sx={{ color: PURPLE, mb: 3 }} size={40} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 1 }}>
              This interview is for candidates only
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280' }}>
              Redirecting you to the dashboard…
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  /* ── Post archived ── */
  if (isArchived) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <Typography sx={{ fontSize: 32 }}>📦</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: '#111827', mb: 1 }}>
                This position is no longer available
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7, mb: 3.5 }}>
                This job post has been archived by the company and is no longer accepting new interviews.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/candidate')}
                sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', bgcolor: '#8310FF', color: '#fff', borderRadius: '10px', px: 3, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' } }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  /* ── Post expired ── */
  if (isExpired) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #FED7AA', p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <Typography sx={{ fontSize: 32 }}>⏰</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: '#111827', mb: 1 }}>
                This position is no longer accepting applications
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7, mb: 3.5 }}>
                This job post has exceeded its expiration date and is no longer open for interviews.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/candidate')}
                sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', bgcolor: '#8310FF', color: '#fff', borderRadius: '10px', px: 3, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' } }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  /* ── Already completed ── */
  if (alreadyCompleted) {
    const jobTitle = jobData?.jobDetails?.title || jobData?.title || 'this position';
    const company = jobData?.companyName || '';
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Header />
          <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', p: { xs: 4, md: 5 }, textAlign: 'center' }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(131,16,255,0.08)', border: '2px solid rgba(131,16,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 36, color: '#8310FF' }} />
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: '#111827', mb: 1 }}>
                You've already completed this interview
              </Typography>
              {company && (
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#8310FF', fontWeight: 600, mb: 1 }}>
                  {company}
                </Typography>
              )}
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7, mb: 3.5 }}>
                Your assessment for <strong style={{ color: '#111827' }}>{jobTitle}</strong> has already been submitted.
                The hiring team will review your results and get back to you.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/candidate')}
                sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', bgcolor: '#8310FF', color: '#fff', borderRadius: '10px', px: 3, py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' } }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  /* ── Interview limit reached ── */
  if (limitReached) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: { xs: 5, md: 8 } }}>
            <Box sx={{
              width: '100%', maxWidth: 480,
              bgcolor: '#fff', borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}>
              {/* Top accent bar — red gradient */}
              <Box sx={{ height: 6, background: 'linear-gradient(90deg, #EF4444 0%, #F97316 100%)' }} />

              <Box sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                {/* Icon circle */}
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FFEDD5 100%)',
                  border: '2px solid #FECACA',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2.5,
                }}>
                  <Typography sx={{ fontSize: '2rem', lineHeight: 1, userSelect: 'none' }}>🔒</Typography>
                </Box>

                {/* Status badge */}
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.8,
                  bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: '20px', px: 1.8, py: 0.5, mb: 2.5,
                }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Interviews Paused
                  </Typography>
                </Box>

                {/* Heading */}
                <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: '#0F172A', lineHeight: 1.25, mb: 1.5, letterSpacing: '-0.01em' }}>
                  Interview Unavailable
                </Typography>

                {/* Job title pill */}
                {limitJobTitle && (
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '10px', px: 2, py: 0.7, mb: 2.5,
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94A3B8', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#475569' }}>
                      {limitJobTitle}
                    </Typography>
                  </Box>
                )}

                {/* Divider */}
                <Box sx={{ height: '1px', bgcolor: '#F1F5F9', mb: 2.5 }} />

                {/* Description */}
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, mb: 1.5 }}>
                  The company has reached their monthly interview quota. New slots open at the start of next month.
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.7, mb: 4 }}>
                  If you believe this is an error, please contact the recruiter directly.
                </Typography>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    sx={{
                      textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
                      borderRadius: '12px', px: 3, py: 1.2,
                      borderColor: '#E2E8F0', color: '#475569',
                      '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                    }}
                  >
                    ← Go Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/')}
                    sx={{
                      textTransform: 'none', fontWeight: 700, fontSize: '0.875rem',
                      borderRadius: '12px', px: 3, py: 1.2,
                      background: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(13,148,136,0.25)',
                      '&:hover': { background: 'linear-gradient(135deg, #0F766E 0%, #0E7490 100%)', boxShadow: '0 6px 16px rgba(13,148,136,0.35)', color: '#fff' },
                    }}
                  >
                    Go to Home
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  /* ── Step 1: Introduction ── */
  if (step === 'intro') {
    return (
      <InterviewIntro
        interviewConfig={interviewConfig}
        hasJobId={hasJobId}
        jobId={jobId}
        refParam={refParam}
        jobData={jobData}
        checkingEligibility={false}
        onNext={(_) => setStep('interview')}
      />
    );
  }

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', userSelect: 'none', WebkitUserSelect: 'none' }}>
        <Header />

        {/* ── Connection warning banner ── */}
        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Box sx={{ bgcolor: '#fefce8', borderBottom: '1px solid #fde047', px: { xs: 2, md: 4 }, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ca8a04' }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#854d0e' }}>
              {socket.connectionStatus === 'connecting' ? 'Connecting to interview system…' : socket.connectionStatus === 'error' ? 'Connection error — please refresh' : 'Disconnected — attempting to reconnect…'}
            </Typography>
          </Box>
        )}

        {/* ── Main content ── */}
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

          {/* ── Title card ── */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: '20px',
              border: '1px solid #e8e2f5',
              boxShadow: 'none',
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 2, md: 2.5 },
              mb: 3,
            }}
          >
            {/* Top row */}
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
                        ? `${jobData.companyName} · AI-powered interview`
                        : `${router.query.skill || 'Technical'} · ${interviewConfig.context?.experienceLevel || ''}`}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                {/* Pipeline step chip */}
                {isPipelineJob && currentPipelineStep && candidateProgress && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={`Step ${currentPipelineStep} / ${candidateProgress.steps.length}`}
                      size="small"
                      sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', bgcolor: 'rgba(131,16,255,0.08)', color: PURPLE, border: '1px solid rgba(131,16,255,0.2)', height: 24 }}
                    />
                  </Box>
                )}

                {/* End button — active only */}
                {isActive && (
                  <Button
                    variant="contained"
                    onClick={endInterview}
                    sx={{
                      fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', textTransform: 'none',
                      bgcolor: '#fef2f2', color: '#ef4444', borderRadius: '12px', px: 3, py: 1.25,
                      boxShadow: 'none', border: '1px solid rgba(239,68,68,0.2)',
                      '&:hover': { bgcolor: '#fee2e2', boxShadow: 'none' },
                    }}
                  >
                    End Interview
                  </Button>
                )}
              </Box>
            </Box>

          </Box>

          {/* ── Interview completion block ── */}
          {isActive && (
            <Box sx={{
              bgcolor: '#fff',
              borderRadius: '16px',
              border: '1px solid #e8e2f5',
              boxShadow: 'none',
              px: { xs: 2.5, md: 3.5 },
              py: 2,
              mb: 3,
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
                  Interview completion
                </Typography>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: PURPLE }}>
                  {Math.round(coverage?.overall ?? 0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(coverage?.overall ?? 0, 100)}
                sx={{
                  height: 6, borderRadius: 4,
                  bgcolor: 'rgba(131,16,255,0.08)',
                  '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#8310FF,#a855f7)', borderRadius: 4 },
                }}
              />
            </Box>
          )}

          {/* ── Main card wrapping everything ── */}
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: '20px',
              border: '1px solid #e8e2f5',
              boxShadow: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Question panel (full-width, active only) */}
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

            {/* Two-column grid: camera LEFT · controls RIGHT */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '7fr 3fr' },
                gap: 0,
              }}
            >
              {/* LEFT: Camera — border-right divider */}
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

              {/* RIGHT: Interview controls + agent status */}
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

          {/* ── Coverage Dashboard (shown after interview ends) ── */}
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

        {/* ── GDPR Consent Modal ── */}
        <GDPRConsentModal
          open={!camera.consentGiven}
          onAccept={camera.giveConsent}
          onDecline={() => router.back()}
        />

        {/* ── Notifications & modals ── */}
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
          onReturnToDashboard={() => router.push('/dashboard/candidate')}
        />

        {isActive && (
          <InterviewTimer elapsedTime={timer.elapsedTime} timeWarning={timer.timeWarning} />
        )}
      </Box>
    </>
  );
};

export default dynamic(() => Promise.resolve(IntelligentInterviewTest), { ssr: false });
