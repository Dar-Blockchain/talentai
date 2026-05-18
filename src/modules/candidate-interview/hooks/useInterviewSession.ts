import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import { Coverage, InterviewConfig, InterviewMessage } from '../types/interview';
import { useInterviewSocket, InterviewStartedData, InterviewEndedData, SilenceResponseData } from './useInterviewSocket';
import { useAudioTranscription } from './useAudioTranscription';
import { useInterviewTimer } from './useInterviewTimer';
import { useCamera } from './useCamera';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { updatePipelineStep, fetchPipelineProgress } from '../api/pipelineProgress.api';

export interface UseInterviewSessionOptions {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  isPipelineJob: boolean;
  profile: any;
  authUser: any;
  jobData: any;
  notify: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useInterviewSession({
  interviewConfig,
  setInterviewConfig,
  isPipelineJob,
  profile,
  authUser,
  jobData,
  notify,
}: UseInterviewSessionOptions) {
  const router = useRouter();
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(true);
  const endInterviewRef = useRef<() => void>(() => {});

  // Refs to break forward-reference: handlers are defined before audio/timer hooks are called,
  // but the callbacks only execute after all hooks have initialized.
  const timerRef = useRef<any>(null);
  const audioRef = useRef<any>(null);

  const handleInterviewStarted = useCallback((data: InterviewStartedData) => {
    timerRef.current?.startTimer(data.config.duration || 20);
    timerRef.current?.setDuration(data.config.duration * 60 * 1000);
    if (data.targetCompany) {
      setInterviewConfig({ ...interviewConfig, context: { ...interviewConfig.context, targetCompany: data.targetCompany } });
    }
    if (data.config.silenceIntelligence) {
      audioRef.current?.setBackendSilenceConfig(data.config.silenceIntelligence);
      audioRef.current?.setAdaptiveSilenceThreshold(data.config.silenceIntelligence.threshold || 5000);
    }
  }, [interviewConfig, setInterviewConfig]);

  const handleInterviewMessage = useCallback((message: InterviewMessage) => {
    audioRef.current?.setConversationHistory((prev: InterviewMessage[]) => [...prev, message]);
    audioRef.current?.setQuestionHighlight(true);
    setTimeout(() => audioRef.current?.setQuestionHighlight(false), 600);
    if (message.type === 'question' || message.type === 'follow_up') {
      audioRef.current?.setQuestionReadingTime(Date.now());
      audioRef.current?.setAgentState('waiting');
      audioRef.current?.setAgentMessage('Waiting for you to read the question...');
      audioRef.current?.resetSilenceDetection();
    }
  }, []);

  const handleCoverageUpdate = useCallback((newCoverage: Coverage) => { setCoverage(newCoverage); }, []);

  const handleSilenceResponse = useCallback((data: SilenceResponseData) => {
    audioRef.current?.setSilenceCount(data.silenceCount);
    if (data.action === 'silence_prompt') {
      notify('Take your time to think...', 'info');
      audioRef.current?.setAgentState('waiting');
      audioRef.current?.setAgentMessage(data.content || 'AI provided encouragement');
      audioRef.current?.setConversationHistory((prev: InterviewMessage[]) => [
        ...prev,
        { type: 'system' as const, content: data.content || '', timestamp: data.timestamp || new Date().toISOString() },
      ]);
    } else if (data.action === 'move_forward') {
      audioRef.current?.setAgentState('thinking');
      audioRef.current?.setAgentMessage('Moving to next topic...');
    }
    if (data.silenceIntelligence?.adaptiveThreshold) {
      audioRef.current?.setAdaptiveSilenceThreshold(data.silenceIntelligence.adaptiveThreshold);
    }
  }, [notify]);

  const handleVoiceActivity = useCallback((data: { isActive: boolean }) => {
    audioRef.current?.setIsVoiceActive(data.isActive);
    if (data.isActive) audioRef.current?.setLastVoiceActivity(Date.now());
  }, []);

  const handleInterviewEnded = useCallback(async (data: InterviewEndedData) => {
    audioRef.current?.setIsRecording(false);
    timerRef.current?.stopTimer();
    if (data.sessionId) localStorage.setItem('last_interview_id', data.sessionId);
    if (data.finalReport || data.analytics) {
      localStorage.setItem('last_interview_analysis', JSON.stringify({
        finalReport: data.finalReport,
        analytics: data.analytics,
        sessionId: data.sessionId,
        interviewType: interviewConfig?.interviewType || 'HR_INTERVIEW',
        timestamp: new Date().toISOString(),
      }));
    }
    const candidateId = profile?.userId?._id || profile?.userId || authUser?._id;
    if (isPipelineJob && candidateId) {
      try {
        const jobId = localStorage.getItem('interview_jobId');
        const stepId = localStorage.getItem('interview_stepId');
        const passThreshold = parseInt(localStorage.getItem('interview_passThreshold') || '70');
        const finalScore = data.finalReport?.overallScore || data.analytics?.overallScore || data.analytics?.totalScore || 0;
        const passed = finalScore >= passThreshold;
        if (jobId && stepId) {
          await updatePipelineStep({ candidateId: String(candidateId), jobId, stepId, passed, finalScore });
          const progressData = await fetchPipelineProgress(String(candidateId), jobId);
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
      } catch (error) {
        console.error('Error updating pipeline progress:', error);
      }
    }
  }, [interviewConfig, isPipelineJob, profile, authUser]);

  const handleInterviewError = useCallback((error: { message: string }) => {
    audioRef.current?.setAgentState('waiting');
    audioRef.current?.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
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

  // Sync refs after all hooks initialize so forward-reference callbacks resolve correctly
  audioRef.current = audio;
  timerRef.current = timer;

  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) { notify('Not connected to interview system', 'error'); return; }
    try {
      socket.setInterviewStatus('connecting');
      const candidateId = authUser?.email || 'anonymous';
      await audio.initializeAudio();
      socket.socketRef.current.emit('start_interview', {
        config: {
          ...interviewConfig,
          silenceIntelligence: {
            interviewType: interviewConfig.interviewType,
            candidateBehavior: { interactionStyle: 'balanced', confidenceLevel: 'medium', communicationStyle: 'mixed' },
            adaptiveMode: true,
            contextualAdjustments: true,
          },
        },
        candidateId,
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      notify('Failed to start interview', 'error');
      socket.setInterviewStatus('idle');
    }
  }, [socket.socketRef, socket.isConnected, socket.setInterviewStatus, interviewConfig, authUser, audio.initializeAudio, notify]);

  const endInterview = useCallback(() => {
    if (socket.socketRef.current && socket.sessionId) socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionId });
    if (audio.audioStreamRef.current) audio.audioStreamRef.current.getTracks().forEach(track => track.stop());
    audio.resetSilenceDetection();
    audio.cleanupAssemblyAI();
    audio.setIsRecording(false);
    socket.setInterviewStatus('ended');
    if (socket.sessionId) localStorage.setItem('last_interview_id', socket.sessionId);
  }, [socket.socketRef, socket.sessionId, socket.setInterviewStatus, audio]);

  endInterviewRef.current = endInterview;

  const handleViewResults = useCallback(() => {
    const jId = localStorage.getItem('interview_jobId');
    router.push(jId ? `/candidate/interview/results?jobId=${jId}` : '/candidate/interview/results');
  }, [router]);

  return {
    socket,
    audio,
    timer,
    camera,
    security,
    coverage,
    coverageDashboardExpanded,
    setCoverageDashboardExpanded,
    startInterview,
    endInterview,
    handleViewResults,
  };
}
