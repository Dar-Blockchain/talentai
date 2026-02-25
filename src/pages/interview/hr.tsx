'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Types
import {
  InterviewMessage,
  Coverage,
  RealTimeReport,
} from '@/types/interview';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useInterviewTimer } from '@/hooks/useInterviewTimer';
import { useCamera } from '@/hooks/useCamera';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useInterviewConfig } from '@/hooks/useInterviewConfig';
import { useInterviewSocket, InterviewStartedData, InterviewEndedData, SilenceResponseData } from '@/hooks/useInterviewSocket';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';

// Components
import {
  QuestionPanel,
  CameraPreview,
  AgentStatusPanel,
  CoverageDashboard,
  InterviewContainer,
  PipelineModals,
  SecurityModals,
  InterviewTimer,
} from '@/components/interview';

// Styles
import { GlobalStyles } from '@/components/interview/styles';

const IntelligentInterviewTest = () => {
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  // Coverage & Report state (managed at orchestrator level since socket events feed them)
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [realTimeReport, setRealTimeReport] = useState<RealTimeReport | null>(null);

  // --- Initialize Hooks ---

  // Notification hook (reuse existing project hook)
  const { notification, showNotification, hideNotification } = useNotification();

  // Adapter: bridge existing useNotification API to the simple (message, severity) signature used by other hooks
  const notify = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    showNotification(message, severity);
  }, [showNotification]);

  // Interview config (URL params + pipeline)
  const {
    interviewConfig,
    isPipelineJob,
    candidateProgress,
    currentPipelineStep,
    pipelineLoading,
    showBlockedModal,
    showFailedModal,
    blockMessage,
  } = useInterviewConfig({ showNotification: notify });

  // Forward declaration refs for cross-hook dependencies
  const endInterviewRef = useRef<() => void>(() => {});

  // Interview socket callbacks
  const handleInterviewStarted = useCallback((data: InterviewStartedData) => {
    // Start timer
    timer.startTimer(data.config.duration || 20);
    timer.setDuration(data.config.duration * 60 * 1000);

    // Configure backend silence intelligence
    if (data.config.silenceIntelligence) {
      audio.setBackendSilenceConfig(data.config.silenceIntelligence);
      const typeThreshold = data.config.silenceIntelligence.threshold || 5000;
      audio.setAdaptiveSilenceThreshold(typeThreshold);

      console.log('🧠 Silence intelligence configured:', {
        threshold: typeThreshold,
        interviewType: data.config.interviewType,
        maxPrompts: data.config.silenceIntelligence.maxPrompts
      });
    }
  }, []);

  const handleInterviewMessage = useCallback((message: InterviewMessage) => {
    audio.setConversationHistory(prev => [...prev, message]);

    // Trigger question highlight animation
    audio.setQuestionHighlight(true);
    setTimeout(() => audio.setQuestionHighlight(false), 600);

    // Start reading time buffer for new questions
    if (message.type === 'question' || message.type === 'follow_up') {
      audio.setQuestionReadingTime(Date.now());
      audio.setAgentState('waiting');
      audio.setAgentMessage('Waiting for you to read the question...');
      audio.resetSilenceDetection();

      console.log('📖 Starting reading time buffer for new question');
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
        timestamp: data.timestamp || new Date().toISOString()
      }]);
    } else if (data.action === 'move_forward') {
      audio.setAgentState('thinking');
      audio.setAgentMessage('Moving to next topic...');
      console.log('⏭️ Moving forward due to max silence prompts reached');
    }

    if (data.silenceIntelligence?.adaptiveThreshold) {
      audio.setAdaptiveSilenceThreshold(data.silenceIntelligence.adaptiveThreshold);
    }
  }, [notify]);

  const handleVoiceActivity = useCallback((data: { isActive: boolean }) => {
    audio.setIsVoiceActive(data.isActive);
    if (data.isActive) {
      audio.setLastVoiceActivity(Date.now());
    }
  }, []);

  const handleInterviewEnded = useCallback(async (data: InterviewEndedData) => {
    audio.setIsRecording(false);
    timer.stopTimer();

    // Store session ID for results page
    if (data.sessionId) {
      localStorage.setItem('last_interview_id', data.sessionId);
    }

    // Store the complete analysis data for the results page
    if (data.finalReport || data.analytics) {
      console.log('💾 Storing interview analysis in localStorage:', {
        hasFinalReport: !!data.finalReport,
        hasAnalytics: !!data.analytics,
        sessionId: data.sessionId
      });

      const analysisData = {
        finalReport: data.finalReport,
        analytics: data.analytics,
        sessionId: data.sessionId,
        interviewType: interviewConfig?.interviewType || 'HR_INTERVIEW',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('last_interview_analysis', JSON.stringify(analysisData));
      console.log('✅ Analysis data stored successfully');
    } else {
      console.warn('⚠️ No analysis data received from socket event');
    }

    // Pipeline progress: Update pass/fail and score
    const candidateId = profile?.userId?._id || profile?.userId || authUser?._id;
    if (isPipelineJob && candidateId) {
      try {
        const token = Cookies.get('api_token');
        const jobId = localStorage.getItem('interview_jobId');
        const stepId = localStorage.getItem('interview_stepId');
        const passThreshold = parseInt(localStorage.getItem('interview_passThreshold') || '70');

        const finalScore = data.finalReport?.overallScore ||
                          data.analytics?.overallScore ||
                          data.analytics?.totalScore ||
                          0;

        const passed = finalScore >= passThreshold;
        console.log(`📊 Interview Result: ${finalScore}% (threshold: ${passThreshold}%) - ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
        if (jobId && stepId) {
          console.log('📊 Updating pipeline step pass/fail status...');

          const updateResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/update-step`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                candidateId: candidateId,
                jobId,
                stepId,
                passed: passed,
                finalScore: finalScore
              })
            }
          );

          const updateResult = await updateResponse.json();
          console.log('✅ Pipeline step pass/fail updated:', updateResult);

          const progressResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/${candidateId}/${jobId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            const completedSteps = progressData.stats?.completedSteps || 0;
            const totalSteps = progressData.stats?.totalSteps || 0;

            if (passed) {
              if (completedSteps < totalSteps) {
                console.log(`✅ Next step available (${completedSteps}/${totalSteps} completed)`);
                localStorage.setItem('pipeline_has_next_step', 'true');
                localStorage.setItem('pipeline_next_step', progressData.currentStep?.stepNumber?.toString() || '');
              } else {
                console.log('🎉 Pipeline complete!');
                localStorage.setItem('pipeline_has_next_step', 'false');
                localStorage.setItem('pipeline_complete', 'true');
              }
            } else {
              console.log('❌ Step failed - pipeline cannot continue');
              localStorage.setItem('pipeline_has_next_step', 'false');
              localStorage.setItem('pipeline_failed', 'true');
              localStorage.setItem('pipeline_failed_score', finalScore.toString());
              localStorage.setItem('pipeline_required_score', passThreshold.toString());
            }
          }
        }
      } catch (error) {
        console.error('❌ Error updating pipeline progress:', error);
      }
    }
  }, [interviewConfig, isPipelineJob, profile, authUser]);

  const handleInterviewError = useCallback((error: { message: string }) => {
    // Reset agentState so the user is not stuck on "AI Thinking..."
    audio.setAgentState('waiting');
    audio.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
    console.error('Interview error received:', error.message);
  }, []);

  // Socket hook
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

  // Audio transcription hook (derives currentMessage internally from its own conversationHistory)
  const audio = useAudioTranscription({
    socketRef: socket.socketRef,
    sessionIdRef: socket.sessionIdRef,
    interviewConfig,
    interviewStatus: socket.interviewStatus,
    showNotification: notify,
  });

  // Derive lastInterviewerMessage from audio's conversation history for UI display
  const lastInterviewerMessage = audio.conversationHistory
    .filter(m => m.type !== 'system')
    .slice(-1)[0] || null;

  // Timer hook
  const timer = useInterviewTimer({
    interviewStatus: socket.interviewStatus,
    onTimeUp: useCallback(() => {
      endInterviewRef.current();
    }, []),
    showNotification: notify as any,
  });

  // Camera hook
  const camera = useCamera({ showNotification: notify as any });

  // Security monitoring
  const security = useSecurityMonitoring({
    interviewStatus: socket.interviewStatus,
  });

  // --- Orchestration Functions ---

  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) {
      notify('Not connected to interview system', 'error');
      return;
    }

    try {
      socket.setInterviewStatus('connecting');
      console.log('🚀 Starting interview with config:', interviewConfig);

      const candidateId = authUser?.email || 'anonymous';
      console.log('Testiiiiiiiiiiiiiiiiiiiiiiiiiing', candidateId);

      await audio.initializeAudio();

      socket.socketRef.current.emit('start_interview', {
        config: {
          ...interviewConfig,
          silenceIntelligence: {
            interviewType: interviewConfig.interviewType,
            candidateBehavior: {
              interactionStyle: 'balanced',
              confidenceLevel: 'medium',
              communicationStyle: 'mixed'
            },
            adaptiveMode: true,
            contextualAdjustments: true
          }
        },
        candidateId
      });

    } catch (error) {
      console.error('❌ Failed to start interview:', error);
      notify('Failed to start interview', 'error');
      socket.setInterviewStatus('idle');
    }
  }, [socket.socketRef, socket.isConnected, interviewConfig, authUser, audio.initializeAudio, notify]);

  const endInterview = useCallback(() => {
    if (socket.socketRef.current && socket.sessionId) {
      socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionId });
    }

    // Stop audio recording
    if (audio.audioStreamRef.current) {
      audio.audioStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Stop voice activity detection
    audio.resetSilenceDetection();

    // Cleanup Assembly AI connections
    audio.cleanupAssemblyAI();

    audio.setIsRecording(false);
    socket.setInterviewStatus('ended');

    // Store session ID for results page
    if (socket.sessionId) {
      localStorage.setItem('last_interview_id', socket.sessionId);
    }
  }, [socket.socketRef, socket.sessionId, audio]);

  // Wire the endInterview ref for timer callback
  endInterviewRef.current = endInterview;

  const handleViewResults = useCallback(() => {
    const jobId = localStorage.getItem('interview_jobId');
    if (jobId) {
      router.push(`/interview/results?jobId=${jobId}`);
    } else {
      router.push('/interview/results');
    }
  }, [router]);

  // --- Render ---

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Alert Snackbar */}
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

        {/* Connection Status */}
        {socket.isHydrated && socket.connectionStatus !== 'connected' && (
          <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" color="text.primary">
                {socket.connectionStatus === 'connecting' && 'Connecting to Interview System...'}
                {socket.connectionStatus === 'error' && 'Connection Error - Please refresh the page'}
                {socket.connectionStatus === 'disconnected' && 'Disconnected - Attempting to reconnect...'}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Pipeline Progress Indicator */}
        {isPipelineJob && currentPipelineStep && candidateProgress && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5ff', borderLeft: '4px solid #8310FF' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={`Step ${currentPipelineStep}`}
                  color="primary"
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                />
                <Typography variant="body1" color="text.primary">
                  Pipeline Interview
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  {candidateProgress.steps.filter((s: any) => s.status === 'done').length + 1} / {candidateProgress.steps.length} completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(candidateProgress.steps.filter((s: any) => s.status === 'done').length + 1 / candidateProgress.steps.length) * 100}
                  sx={{ width: 100, ml: 1 }}
                />
              </Box>
            </Box>
          </Paper>
        )}

        {/* Prominent Question Panel */}
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

        {/* Interview Container (main card) */}
        <InterviewContainer
          interviewStatus={socket.interviewStatus}
          interviewConfig={interviewConfig}
          isHydrated={socket.isHydrated}
          connectionStatus={socket.connectionStatus}
          cameraStatus={camera.cameraStatus}
          isVoiceActive={audio.isVoiceActive}
          agentState={audio.agentState}
          onStartInterview={startInterview}
          onEndInterview={endInterview}
          onViewResults={handleViewResults}
          routerQuery={router.query}
        />

        {/* Security Modals */}
        <SecurityModals
          showFirstViolationModal={security.showFirstViolationModal}
          showSecurityModal={security.showSecurityModal}
          onDismissFirst={() => security.setShowFirstViolationModal(false)}
          onDismissSecond={() => security.setShowSecurityModal(false)}
          onReturnToDashboard={() => router.push('/dashboard/candidate')}
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

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(IntelligentInterviewTest), {
  ssr: false
});
