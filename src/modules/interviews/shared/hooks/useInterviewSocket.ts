import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  InterviewMessage,
  ConnectionStatus,
  InterviewStatus,
} from '../types/interview';
import type {
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
  UseInterviewSocketCallbacks,
  UseInterviewSocketReturn,
} from '../types/hooks';

export type {
  InterviewStartedData,
  InterviewEndedData,
  SilenceResponseData,
  UseInterviewSocketCallbacks,
  UseInterviewSocketReturn,
};

export const useInterviewSocket = (callbacks: UseInterviewSocketCallbacks): UseInterviewSocketReturn => {
  const socketRef = useRef<any>(null);
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
      console.log('🔄 Connection already initialized, skipping...');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    connectionInitialized.current = true;

    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!rawBase) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not set — cannot connect to interview server');
      callbacksRef.current.onNotification('Interview server URL is not configured.', 'error');
      return;
    }
    const baseUrl = rawBase.replace(/\/$/, '');
    console.log('🔗 Attempting to connect to:', `${baseUrl}${namespace}`);
    console.log('🔗 Socket.IO will connect to namespace:', namespace);

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
      console.log('✅ Connected to interview WebSocket');
      console.log('🔗 Connection ID:', socket.id);
      console.log('🚀 Transport:', socket.io.engine.transport.name);
      setIsConnected(true);
      setConnectionStatus('connected');
      callbacksRef.current.onNotification('Connected to interview system', 'success');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from interview WebSocket:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setInterviewStatus('idle');
      callbacksRef.current.onNotification('Connection lost. Attempting to reconnect...', 'warning');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: (error as any).description,
        type: (error as any).type,
        transport: (error as any).transport
      });
      setIsConnected(false);
      setConnectionStatus('error');

      if (error.message?.includes('Invalid namespace')) {
        console.log('🔄 Namespace error detected - Interview service not available');
        callbacksRef.current.onNotification('Interview namespace not available. Retrying...', 'warning');
      } else if ((error as any).type === 'TransportError') {
        console.log('🚛 Transport error - trying different transport method');
        callbacksRef.current.onNotification('Connection transport failed, retrying...', 'warning');
      } else {
        callbacksRef.current.onNotification(`Connection failed: ${error.message || 'Unknown error'}`, 'error');
      }
    });

    // Interview event handlers
    socket.on('interview_started', (data: any) => {
      console.log('🚀 Interview started:', data);
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      setInterviewStatus('active');
      callbacksRef.current.onInterviewStarted(data);
    });

    socket.on('interviewer_message', (message: InterviewMessage) => {
      console.log('💬 Received interviewer message:', message);
      callbacksRef.current.onInterviewMessage(message);
    });

    socket.on('coverage_update', (data: any) => {
      console.log('📊 Coverage update:', data);
      callbacksRef.current.onCoverageUpdate(data.coverage);
    });

    socket.on('report_update', (data: any) => {
      console.log('📋 Report update:', data);
      callbacksRef.current.onReportUpdate?.(data.report);
    });

    socket.on('silence_response', (data: any) => {
      console.log('🔇 Enhanced silence response:', data);
      callbacksRef.current.onSilenceResponse(data);
    });

    socket.on('voice_activity', (data: any) => {
      callbacksRef.current.onVoiceActivity(data);
    });

    socket.on('interview_ended', (data: any) => {
      console.log('🏁 Interview ended:', data);
      // Status transition is the callback's responsibility — it may need to delay
      // the change (e.g. to keep the farewell message visible for a few seconds).
      callbacksRef.current.onInterviewEnded(data);
    });

    socket.on('assessment_saved', (data: any) => {
      console.log('💾 Assessment saved:', data?.assessmentId);
      setAssessmentId(data?.assessmentId ?? null);
      callbacksRef.current.onAssessmentSaved?.(data);
    });

    socket.on('interview_error', (error: any) => {
      console.error('❌ Interview error:', error);
      callbacksRef.current.onInterviewError(error);
      callbacksRef.current.onNotification(`Interview error: ${error.message}`, 'error');
    });

    // ── Previously unhandled events ──────────────────────────────────────────

    socket.on('greeting_chunk', (data: any) => {
      callbacksRef.current.onGreetingChunk?.(data);
    });

    socket.on('greeting_complete', (data: any) => {
      console.log('👋 Greeting complete');
      callbacksRef.current.onGreetingComplete?.(data);
    });

    socket.on('interviewer_typing', (data: any) => {
      callbacksRef.current.onInterviewerTyping?.(data);
    });

    socket.on('response_processed', (data: any) => {
      console.log('✔️ Response processed by server:', data?.sessionId);
    });

    socket.on('topic_change', (data: any) => {
      console.log('🔀 Topic change:', data?.from, '→', data?.to);
      callbacksRef.current.onTopicChange?.(data);
    });

    socket.on('interview_wrap_up', (data: any) => {
      console.log('🏁 Interview entering wrap-up phase');
      callbacksRef.current.onInterviewWrapUp?.(data);
    });

    socket.on('silence_reset', () => {
      console.log('🔇 Silence counter reset by server');
      callbacksRef.current.onSilenceReset?.();
    });

    socket.on('session_status', (data: any) => {
      console.log('💓 Session health ping:', data?.status);
    });

    socket.on('interview_paused', () => {
      console.log('⏸️ Interview paused');
      setInterviewStatus('paused');
    });

    socket.on('interview_resumed', () => {
      console.log('▶️ Interview resumed');
      setInterviewStatus('active');
    });

    socket.on('reconnect', () => {
      console.log('🔄 Reconnected to interview WebSocket');
      setIsConnected(true);
      setConnectionStatus('connected');
      callbacksRef.current.onNotification('Reconnected to interview system', 'success');
    });

    return () => {
      if (socketRef.current && socketRef.current === socket) {
        console.log('🧹 Cleaning up WebSocket connection');
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
