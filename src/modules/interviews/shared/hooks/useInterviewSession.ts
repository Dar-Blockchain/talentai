import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Coverage, InterviewMessage } from '../types/interview';
import type {
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
  UseAudioTranscriptionReturn,
  UseInterviewTimerReturn,
  UseInterviewSessionOptions,
} from '../types/hooks';
import { useInterviewSocket } from './useInterviewSocket';
import { useAudioTranscription } from './useAudioTranscription';
import { useInterviewTimer } from './useInterviewTimer';
import { useCamera } from './useCamera';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { useIdentityGuard } from './useIdentityGuard';
import { toast } from 'sonner';
import { getMyProfile } from '@/store/slices/userSlice';
import type { AppDispatch } from '@/store/store';
import { safeSet } from '@/utils/safeStorage';

export type { UseInterviewSessionOptions };

const notify = (message: string, severity: 'success' | 'error' | 'warning' | 'info') =>
  toast[severity](message);

export function useInterviewSession({
  interviewConfig,
  setInterviewConfig,
  authUser,
  jobData,
  namespace,
}: Omit<UseInterviewSessionOptions, 'notify'>) {
  const dispatch = useDispatch<AppDispatch>();
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(true);
  const [resultsReady, setResultsReady] = useState(false);
  const endInterviewRef = useRef<() => void>(() => {});

  const timerRef  = useRef<UseInterviewTimerReturn | null>(null);
  const audioRef  = useRef<UseAudioTranscriptionReturn | null>(null);
  const cameraRef = useRef<{ stopCamera: () => void } | null>(null);

  const isFinishingRef        = useRef(false);
  const finishTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setInterviewStatusRef = useRef<(s: any) => void>(() => {});

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
    const { reasoning: _reasoning, ...safeMessage } = message as any;

    if (safeMessage.type === 'end_interview') {
      isFinishingRef.current = true;
      audioRef.current?.setConversationHistory((prev: InterviewMessage[]) => [...prev, safeMessage]);
      audioRef.current?.setAgentState('finishing');
      audioRef.current?.setAgentMessage('Interview finishing — preparing your results…');
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      finishTimerRef.current = setTimeout(() => {
        isFinishingRef.current = false;
        finishTimerRef.current = null;
        endInterviewRef.current();
      }, 6000);
      return;
    }

    audioRef.current?.setConversationHistory((prev: InterviewMessage[]) => [...prev, safeMessage]);
    audioRef.current?.setQuestionHighlight(true);
    setTimeout(() => audioRef.current?.setQuestionHighlight(false), 600);
    if (safeMessage.type === 'question' || safeMessage.type === 'follow_up' || safeMessage.type === 'new_topic') {
      audioRef.current?.resetSkipGuard?.();
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
    cameraRef.current?.stopCamera();
    if (data.sessionId) safeSet('last_interview_id', data.sessionId);
    if (data.finalReport || data.analytics) {
      safeSet('last_interview_analysis', JSON.stringify({
        finalReport: data.finalReport,
        analytics: data.analytics,
        sessionId: data.sessionId,
        interviewType: interviewConfig?.interviewType || 'HR_INTERVIEW',
        timestamp: new Date().toISOString(),
      }));
    }
    setResultsReady(true);
    dispatch(getMyProfile());
    if (isFinishingRef.current) {
      setTimeout(() => {
        if (isFinishingRef.current) {
          isFinishingRef.current = false;
          if (finishTimerRef.current) { clearTimeout(finishTimerRef.current); finishTimerRef.current = null; }
          setInterviewStatusRef.current('ended');
        }
      }, 7000);
    } else {
      setInterviewStatusRef.current('ended');
    }
  }, [interviewConfig]);

  const handleInterviewError = useCallback((error: { message: string }) => {
    audioRef.current?.setAgentState('waiting');
    audioRef.current?.setAgentMessage('Something went wrong. You can re-submit your answer or continue.');
    console.error('Interview error received:', error.message);
  }, []);

  const handleGreetingComplete = useCallback((data: { text?: string; sessionId?: string }) => {
    if (data.text) {
      audioRef.current?.setConversationHistory((prev: InterviewMessage[]) => [
        ...prev,
        { type: 'greeting' as const, content: data.text!, timestamp: new Date().toISOString() },
      ]);
    }
    audioRef.current?.setAgentState('waiting');
    audioRef.current?.setAgentMessage('Interview is about to begin…');
  }, []);

  const handleInterviewerTyping = useCallback((data: { typing: boolean }) => {
    if (data.typing) {
      audioRef.current?.setAgentState('thinking');
      audioRef.current?.setAgentMessage('AI is processing your response…');
    }
  }, []);

  const handleInterviewWrapUp = useCallback(() => {
    notify('The interview is entering the final stage.', 'info');
  }, [notify]);

  const handleSilenceReset = useCallback(() => {
    audioRef.current?.setSilenceCount(0);
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
    onGreetingComplete: handleGreetingComplete,
    onInterviewerTyping: handleInterviewerTyping,
    onInterviewWrapUp: handleInterviewWrapUp,
    onSilenceReset: handleSilenceReset,
    namespace,
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
    enabled: true,
  });

  useIdentityGuard({
    videoRef: camera.videoRef,
    active: socket.interviewStatus === 'active',
    onTerminate: () => endInterviewRef.current(),
    showNotification: notify,
  });

  audioRef.current  = audio;
  timerRef.current  = timer;
  cameraRef.current = camera;
  setInterviewStatusRef.current = socket.setInterviewStatus;

  const skipQuestion = useCallback(() => { audioRef.current?.skipQuestion(); }, []);

  const startInterview = useCallback(async () => {
    if (!socket.socketRef.current || !socket.isConnected) { notify('Not connected to interview system', 'error'); return; }
    try {
      socket.setInterviewStatus('connecting');
      const candidateId = authUser?._id || authUser?.id || null;
      const postId = jobData?._id || null;
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
        postId,
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
    cameraRef.current?.stopCamera();
    socket.setInterviewStatus('ended');
    if (socket.sessionId) safeSet('last_interview_id', socket.sessionId);
  }, [socket.socketRef, socket.sessionId, socket.setInterviewStatus, audio]);

  endInterviewRef.current = endInterview;

  const interviewStatusRef = useRef(socket.interviewStatus);
  interviewStatusRef.current = socket.interviewStatus;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (interviewStatusRef.current !== 'active') return;
      if (socket.socketRef.current?.connected && socket.sessionIdRef.current) {
        socket.socketRef.current.emit('end_interview', { sessionId: socket.sessionIdRef.current });
      }
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket.socketRef, socket.sessionIdRef]);

  return {
    socket,
    audio,
    timer,
    camera,
    security,
    coverage,
    resultsReady,
    assessmentId: socket.assessmentId,
    coverageDashboardExpanded,
    setCoverageDashboardExpanded,
    startInterview,
    endInterview,
    skipQuestion,
  };
}
