import { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  InterviewConfig,
  InterviewMessage,
  ConnectionStatus,
  InterviewStatus,
  Coverage,
  RealTimeReport,
} from '@/types/interview';

export interface InterviewStartedData {
  sessionId: string;
  targetCompany?: string;
  config: {
    duration: number;
    interviewType: string;
    silenceIntelligence?: any;
  };
}

export interface InterviewEndedData {
  sessionId?: string;
  finalReport?: any;
  analytics?: any;
}

export interface SilenceResponseData {
  silenceCount: number;
  action: string;
  content?: string;
  timestamp?: string;
  silenceIntelligence?: any;
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
  /** Socket.IO namespace to connect to. Defaults to '/interview'. */
  namespace?: string;
}

export interface UseInterviewSocketReturn {
  socketRef: React.MutableRefObject<any>;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  sessionIdRef: React.MutableRefObject<string | null>;
  isHydrated: boolean;
  setSessionId: (id: string | null) => void;
  setInterviewStatus: (status: InterviewStatus) => void;
  interviewStatus: InterviewStatus;
}

export const useInterviewSocket = (callbacks: UseInterviewSocketCallbacks): UseInterviewSocketReturn => {
  const socketRef = useRef<any>(null);
  const connectionInitialized = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>('idle');
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

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

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
        callbacksRef.current.onNotification('Interview namespace not available. Retrying...', 'warning');
      } else if ((error as any).type === 'TransportError') {
        callbacksRef.current.onNotification('Connection transport failed, retrying...', 'warning');
      } else {
        callbacksRef.current.onNotification(`Connection failed: ${error.message || 'Unknown error'}`, 'error');
      }
    });

    // Interview event handlers
    socket.on('interview_started', (data: any) => {
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      setInterviewStatus('active');
      callbacksRef.current.onInterviewStarted(data);
    });

    socket.on('interviewer_message', (message: InterviewMessage) => {
      callbacksRef.current.onInterviewMessage(message);
    });

    socket.on('coverage_update', (data: any) => {
      callbacksRef.current.onCoverageUpdate(data.coverage);
    });

    socket.on('report_update', (data: any) => {
      callbacksRef.current.onReportUpdate?.(data.report);
    });

    socket.on('silence_response', (data: any) => {
      callbacksRef.current.onSilenceResponse(data);
    });

    socket.on('voice_activity', (data: any) => {
      callbacksRef.current.onVoiceActivity(data);
    });

    socket.on('interview_ended', (data: any) => {
      setInterviewStatus('ended');
      callbacksRef.current.onInterviewEnded(data);
    });

    socket.on('interview_error', (error: any) => {
      console.error('❌ Interview error:', error);
      callbacksRef.current.onInterviewError(error);
      callbacksRef.current.onNotification(`Interview error: ${error.message}`, 'error');
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
  };
};
