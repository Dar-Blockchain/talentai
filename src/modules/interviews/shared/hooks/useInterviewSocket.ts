import { useState, useRef, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  InterviewMessage,
  ConnectionStatus,
  InterviewStatus,
  type Coverage,
  type RealTimeReport,
} from '../types/interview';
import type {
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
  UseInterviewSocketCallbacks,
  UseInterviewSocketReturn,
} from '../types/hooks';

/** Engine.IO sometimes attaches extra diagnostic fields to `connect_error`
 *  beyond the standard `Error` shape socket.io-client declares. */
interface SocketConnectError extends Error {
  description?: string;
  type?: string;
  transport?: string;
}

export type {
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
  UseInterviewSocketCallbacks,
  UseInterviewSocketReturn,
};

export const useInterviewSocket = (callbacks: UseInterviewSocketCallbacks): UseInterviewSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const connectionInitialized = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>('idle');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const namespace = callbacks.namespace ?? '/interview';

  // Store callbacks in refs to avoid stale closures
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (connectionInitialized.current) {
      return;
    }

    connectionInitialized.current = true;

    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!rawBase) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not set — cannot connect to interview server');
      callbacksRef.current.onNotification('Interview server URL is not configured.', 'error');
      return;
    }
    const baseUrl = rawBase.replace(/\/$/, '');

    const socket = io(`${baseUrl}${namespace}`, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: false,
      autoConnect: true,
      withCredentials: false,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      callbacksRef.current.onNotification('Connected to interview system', 'success');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setInterviewStatus('idle');
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        callbacksRef.current.onNotification('Connection lost. Attempting to reconnect...', 'warning');
      }
    });

    socket.on('connect_error', (error: SocketConnectError) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        type: error.type,
        transport: error.transport
      });
      setIsConnected(false);
      setConnectionStatus('error');

      if (error.message?.includes('Invalid namespace')) {
        callbacksRef.current.onNotification('Interview namespace not available. Retrying...', 'warning');
      } else if (error.type === 'TransportError') {
        callbacksRef.current.onNotification('Connection transport failed, retrying...', 'warning');
      } else {
        callbacksRef.current.onNotification(`Connection failed: ${error.message || 'Unknown error'}`, 'error');
      }
    });

    // Interview event handlers
    socket.on('interview_started', (data: InterviewStartedData) => {
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      setInterviewStatus('active');
      callbacksRef.current.onInterviewStarted(data);
    });

    socket.on('interviewer_message', (message: InterviewMessage) => {
      callbacksRef.current.onInterviewMessage(message);
    });

    socket.on('coverage_update', (data: { coverage: Coverage }) => {
      callbacksRef.current.onCoverageUpdate(data.coverage);
    });

    socket.on('report_update', (data: { report: RealTimeReport }) => {
      callbacksRef.current.onReportUpdate?.(data.report);
    });

    socket.on('silence_response', (data: SilenceResponseData) => {
      callbacksRef.current.onSilenceResponse(data);
    });

    socket.on('voice_activity', (data: { isActive: boolean }) => {
      callbacksRef.current.onVoiceActivity(data);
    });

    socket.on('interview_ended', (data: InterviewEndedData) => {
      // Status transition is the callback's responsibility — it may need to delay
      // the change (e.g. to keep the farewell message visible for a few seconds).
      callbacksRef.current.onInterviewEnded(data);
    });

    socket.on('assessment_saved', (data: { assessmentId: string }) => {
      setAssessmentId(data?.assessmentId ?? null);
      callbacksRef.current.onAssessmentSaved?.(data);
    });

    socket.on('interview_error', (error: { message: string }) => {
      console.error('❌ Interview error:', error);
      callbacksRef.current.onInterviewError(error);
      callbacksRef.current.onNotification(`Interview error: ${error.message}`, 'error');
    });

    // ── Previously unhandled events ──────────────────────────────────────────

    socket.on('greeting_chunk', (data: { chunk: string; sessionId?: string }) => {
      callbacksRef.current.onGreetingChunk?.(data);
    });

    socket.on('greeting_complete', (data: { text: string; sessionId?: string }) => {
      callbacksRef.current.onGreetingComplete?.(data);
    });

    socket.on('interviewer_typing', (data: { typing: boolean }) => {
      callbacksRef.current.onInterviewerTyping?.(data);
    });

    socket.on('response_processed', () => {
    });

    socket.on('topic_change', (data: { from?: string; to?: string }) => {
      callbacksRef.current.onTopicChange?.(data);
    });

    socket.on('interview_wrap_up', (data: { sessionId?: string }) => {
      callbacksRef.current.onInterviewWrapUp?.(data);
    });

    socket.on('silence_reset', () => {
      callbacksRef.current.onSilenceReset?.();
    });

    socket.on('session_status', () => {
    });

    socket.on('interview_paused', () => {
      setInterviewStatus('paused');
    });

    socket.on('interview_resumed', () => {
      setInterviewStatus('active');
    });

    socket.on('reconnect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      callbacksRef.current.onNotification('Reconnected to interview system', 'success');
    });

    return () => {
      if (socketRef.current && socketRef.current === socket) {
        socket.disconnect();
        socketRef.current = null;
        connectionInitialized.current = false;
      }
    };
  }, []);

  return {
    socketRef,
    isConnected,
    connectionStatus,
    sessionId,
    sessionIdRef,
    isHydrated,
    setSessionId,
    setInterviewStatus,
    interviewStatus,
    assessmentId,
  };
};
