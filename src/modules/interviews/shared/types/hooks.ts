import type React from 'react';
import type {
  InterviewConfig, InterviewMessage, AgentState, SpeechPhase,
  Coverage, RealTimeReport, ConnectionStatus, InterviewStatus, CameraStatus,
} from './interview';
import type { Socket } from 'socket.io-client';
import type { ConnectedUserEntity } from '@/store/slices/userSlice';

export type AuthUser = ConnectedUserEntity;

/** Shape that the backend sends inside silenceIntelligence on silence events. */
export interface BackendSilenceConfig {
  threshold?: number;
  adaptiveThreshold?: number;
  interviewType?: string;
  candidateBehavior?: {
    interactionStyle?: string;
    confidenceLevel?: string;
    communicationStyle?: string;
  };
  adaptiveMode?: boolean;
  contextualAdjustments?: boolean;
}

/** Post-interview final report from the backend. */
export interface FinalReport {
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  summary?: string;
  [key: string]: unknown;
}

/** Session analytics from the backend. */
export interface SessionAnalytics {
  duration?: number;
  questionsAnswered?: number;
  silenceCount?: number;
  averageResponseTime?: number;
  [key: string]: unknown;
}

// ─── useAudioTranscription ──────────────────────────────────────────────────────

export interface UseAudioTranscriptionReturn {
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  isMuted: boolean;
  isVoiceActive: boolean;
  setIsVoiceActive: (val: boolean) => void;
  currentTranscript: string;
  accumulatedTranscript: string;
  isConnecting: boolean;
  accumulatedTurns: string[];
  speechPhase: SpeechPhase;
  currentSilenceDuration: number;
  adaptiveSilenceThreshold: number;
  silenceCount: number;
  setSilenceCount: (val: number) => void;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionReadingTime: number | null;
  setQuestionReadingTime: (val: number | null) => void;
  agentState: AgentState;
  setAgentState: (val: AgentState) => void;
  agentMessage: string;
  setAgentMessage: (val: string) => void;
  canSubmit: boolean;
  debugMode: boolean;
  setDebugMode: (val: boolean) => void;
  silenceDebugLog: string[];
  transcriptDebugLog: string[];
  initializeAudio: () => Promise<void>;
  cleanupAssemblyAI: () => Promise<void>;
  sendAccumulatedAnswer: () => void;
  resetSilenceDetection: () => void;
  audioStreamRef: React.RefObject<MediaStream | null>;
  audioContextRef: React.RefObject<AudioContext | null>;
  questionHighlight: boolean;
  setQuestionHighlight: (val: boolean) => void;
  backendSilenceConfig: BackendSilenceConfig | null;
  setBackendSilenceConfig: (val: BackendSilenceConfig | null) => void;
  setAdaptiveSilenceThreshold: (val: number) => void;
  conversationHistory: InterviewMessage[];
  setConversationHistory: React.Dispatch<React.SetStateAction<InterviewMessage[]>>;
  lastVoiceActivity: number;
  setLastVoiceActivity: (val: number) => void;
  coverageDashboardExpanded: boolean;
  setCoverageDashboardExpanded: (val: boolean) => void;
  skipQuestion: () => void;
  resetSkipGuard: () => void;
  silenceWarning: number | null;
  questionAnswerElapsed: number;
  questionAnswerRemaining: number;
}

export interface UseAudioTranscriptionOptions {
  socketRef: React.RefObject<Socket | null>;
  sessionIdRef: React.RefObject<string | null>;
  interviewConfig: InterviewConfig;
  interviewStatus: string;
  showNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  jobData?: any;
}

// ─── useCamera ─────────────────────────────────────────────────────────────────

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraError: string;
  streamRef: React.RefObject<MediaStream | null>;
  attachStream: () => void;
  stopCamera: () => void;
  consentGiven: boolean;
  giveConsent: () => void;
}

export interface UseCameraOptions {
  showNotification: (message: string, severity: 'warning' | 'error') => void;
}

// ─── useInterviewSocket ────────────────────────────────────────────────────────

export interface InterviewStartedData {
  sessionId: string;
  targetCompany?: string;
  config: {
    duration: number;
    interviewType: string;
    silenceIntelligence?: BackendSilenceConfig;
  };
}

export interface InterviewEndedData {
  sessionId?: string;
  finalReport?: FinalReport;
  analytics?: SessionAnalytics;
}

export interface SilenceResponseData {
  silenceCount: number;
  action: string;
  content?: string;
  timestamp?: string;
  silenceIntelligence?: BackendSilenceConfig;
}

export interface UseInterviewSocketCallbacks {
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  onInterviewStarted: (data: InterviewStartedData) => void;
  onInterviewMessage: (message: InterviewMessage) => void;
  onCoverageUpdate: (coverage: Coverage) => void;
  onReportUpdate?: (report: RealTimeReport) => void;
  onSilenceResponse: (data: SilenceResponseData) => void;
  onVoiceActivity: (data: { isActive: boolean }) => void;
  onInterviewEnded: (data: InterviewEndedData) => void;
  onInterviewError: (error: { message: string }) => void;
  /** Streaming greeting text received chunk by chunk before interview_started. */
  onGreetingChunk?: (data: { chunk: string; sessionId?: string }) => void;
  /** Full greeting is ready — add it as a message to the conversation. */
  onGreetingComplete?: (data: { text: string; sessionId?: string }) => void;
  /** AI is processing the candidate's response (show "thinking" indicator). */
  onInterviewerTyping?: (data: { typing: boolean }) => void;
  /** Backend confirmed a topic change — useful for analytics / logging. */
  onTopicChange?: (data: { from?: string; to?: string }) => void;
  /** Interview entering wrap-up phase — final questions inbound. */
  onInterviewWrapUp?: (data: { sessionId?: string }) => void;
  /** Server reset the silence counter (sync frontend state). */
  onSilenceReset?: () => void;
  /** Backend saved the assessment — provides its MongoDB ObjectId for feedback linking. */
  onAssessmentSaved?: (data: { assessmentId: string }) => void;
  /** Socket.IO namespace to connect to. Defaults to '/interview'. */
  namespace?: string;
}

export interface UseInterviewSocketReturn {
  socketRef: React.RefObject<Socket | null>;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  sessionIdRef: React.RefObject<string | null>;
  isHydrated: boolean;
  setSessionId: (id: string | null) => void;
  setInterviewStatus: (status: InterviewStatus) => void;
  interviewStatus: InterviewStatus;
  assessmentId: string | null;
}

// ─── useInterviewTimer ─────────────────────────────────────────────────────────

export interface UseInterviewTimerReturn {
  elapsedTime: number;
  timeWarning: boolean;
  duration: number;
  setDuration: (ms: number) => void;
  startTimer: (maxMinutes: number) => void;
  stopTimer: () => void;
  formatTime: (milliseconds: number) => string;
  getProgressPercentage: () => number;
}

export interface UseInterviewTimerOptions {
  interviewStatus: InterviewStatus;
  onTimeUp: () => void;
  showNotification: (message: string, severity: 'warning') => void;
}

export interface UseInterviewSessionOptions {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  authUser: ConnectedUserEntity | null;
  jobData?: any;
  notify: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  /** Socket.IO namespace to connect to. Defaults to '/interview'. */
  namespace?: string;
  /** Overrides the computed candidateId (e.g. an anonymous/link token for unauthenticated campaign participants). */
  candidateIdOverride?: string | null;
}

// ─── useSecurityMonitoring ─────────────────────────────────────────────────────

export interface UseSecurityMonitoringReturn {
  securityViolationCount: number;
  showSecurityModal: boolean;
  showFirstViolationModal: boolean;
  violationType: string;
  setShowSecurityModal: (show: boolean) => void;
  setShowFirstViolationModal: (show: boolean) => void;
}

export interface UseSecurityMonitoringOptions {
  interviewStatus: InterviewStatus;
  onTerminate?: () => void;
  /** Defaults to true — set false to disable all monitoring. */
  enabled?: boolean;
}

