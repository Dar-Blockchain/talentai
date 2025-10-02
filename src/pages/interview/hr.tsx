'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  Container,
  LinearProgress,
  Paper,
  styled,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ErrorIcon from '@mui/icons-material/Error';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ProcessingIcon from '@mui/icons-material/Autorenew';
import ReadyIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';

// Interview Configuration Types
interface InterviewConfig {
  interviewType: 'HR_INTERVIEW' | 'SALARY_INTERVIEW' | 'TECHNICAL_SKILL' | 'SOFT_SKILL' | 'PSYCHOTECHNIC';
  testReason: string;
  context: {
    targetCompany: string;
    targetRole: string;
    experienceLevel: string;
    interviewGoal: string;
  };
  models?: {
    fastModel?: string;
    thinkingModel?: string;
    analysisModel?: string;
  };
  sessionSettings?: {
    duration?: number;
    language?: string;
    difficulty?: string;
    silenceTimeout?: number;
  };
}

interface InterviewMessage {
  type: 'greeting' | 'question' | 'follow_up' | 'silence_prompt' | 'system';
  content: string;
  timestamp: string;
  sessionId?: string;
  reasoning?: string;
  nextFocus?: string;
}

interface CoverageArea {
  area: string;
  percentage: number;
  indicators: Array<{
    name: string;
    covered: boolean;
    evidence: string[];
    quality: number;
  }>;
  weight: number;
  completed: boolean;
}

interface Coverage {
  overall: number;
  areas: { [key: string]: CoverageArea };
  completedAreas: string[];
  nextRecommendedArea: string | null;
  lastUpdated: string;
}

interface RealTimeReport {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scores: { [key: string]: number };
  overallProgress: number;
  lastUpdated: string;
}

// Add this after imports
const GREEN_MAIN = '#8310FF';

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  background: GREEN_MAIN,
}));

const RecordingControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  zIndex: 2,
  background: 'rgba(0, 0, 0, 0.5)',
  padding: theme.spacing(2),
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  minWidth: '280px', // Base width for mobile
  maxWidth: '90%', // Limit width on mobile
  [theme.breakpoints.up('sm')]: {
    minWidth: '300px',
    maxWidth: '300px',
  },
}));

const RecordingButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const TranscriptDisplay = styled(Typography)(({ theme }) => ({
  color: '#fff',
  textAlign: 'center',
  maxWidth: '90%',
  background: 'rgba(0, 0, 0, 0.6)',
  padding: theme.spacing(2),
  borderRadius: '12px',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: theme.spacing(1),
  maxHeight: '150px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
  },
}));

// New prominent Question Panel styled component
const QuestionPanel = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
  backdropFilter: 'blur(15px)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '0 0 20px 20px',
  padding: theme.spacing(3, 2),
  marginBottom: theme.spacing(3),
  color: '#fff',
  boxShadow: '0 8px 32px rgba(131, 16, 255, 0.3)',
  transition: 'all 0.3s ease',
  animation: 'slideInFromTop 0.5s ease-out',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4, 3),
    borderRadius: '0 0 24px 24px',
  },
  '&.question-highlight': {
    transform: 'translateY(2px)',
    boxShadow: '0 12px 40px rgba(131, 16, 255, 0.4)',
    animation: 'questionPulse 0.6s ease-out',
  },
  '@keyframes questionPulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 8px 32px rgba(131, 16, 255, 0.3)',
    },
    '50%': {
      transform: 'scale(1.01)',
      boxShadow: '0 16px 48px rgba(131, 16, 255, 0.5)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 8px 32px rgba(131, 16, 255, 0.3)',
    },
  },
}));

const QuestionContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minHeight: '60px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const QuestionText = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: '1.3rem',
  fontWeight: 600,
  lineHeight: 1.4,
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const ReadingTimeIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  minWidth: '120px',
  [theme.breakpoints.down('sm')]: {
    alignSelf: 'flex-end',
    minWidth: 'auto',
  },
}));

// Agent State & Silence Detection Panel
const AgentStatusPanel = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: 80, // Below the sticky question panel
  right: 16,
  minWidth: 280,
  maxWidth: 320,
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  zIndex: 999, // Below question panel
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('md')]: {
    position: 'relative',
    top: 0,
    right: 0,
    left: 0,
    minWidth: 'auto',
    maxWidth: '100%',
    margin: theme.spacing(2, 0),
  },
}));

const AgentStateIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&.thinking': {
    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1))',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  },
  '&.waiting': {
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(3, 169, 244, 0.1))',
    border: '1px solid rgba(33, 150, 243, 0.3)',
  },
  '&.processing': {
    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(233, 30, 99, 0.1))',
    border: '1px solid rgba(156, 39, 176, 0.3)',
  },
  '&.ready': {
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.1))',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  '&.idle': {
    background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.2), rgba(97, 97, 97, 0.1))',
    border: '1px solid rgba(158, 158, 158, 0.3)',
  },
}));

const SilenceProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #00ff9d 0%, #00b8d4 50%, #8310ff 100%)',
    transition: 'transform 0.1s linear',
  },
  '&.complete .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
    boxShadow: '0 0 12px rgba(76, 175, 80, 0.5)',
  },
}));

const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#fff',
  textAlign: 'center',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  '&.reading-time': {
    color: '#ffb74d',
  },
  '&.silence-active': {
    color: '#64b5f6',
  },
  '&.silence-complete': {
    color: '#81c784',
  },
}));

// Add keyframe animations
const GlobalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadeInUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInFromTop {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(0); }
  }

  /* Smooth scrolling for better UX */
  html {
    scroll-behavior: smooth;
  }

  /* Enhanced focus outline for accessibility */
  .MuiButton-root:focus-visible {
    outline: 2px solid #00ff9d;
    outline-offset: 2px;
  }
`;

const NavigationBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'center', // Center the buttons on mobile
  alignItems: 'center',
  gap: theme.spacing(2), // Add gap between buttons
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'space-between',
  },
}));

// Add new styled components for the guidelines modal
const GuidelinesModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

const GuidelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  border: '1px solid #000',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
}));

// Add new styled components for the security modal
const SecurityModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

// Add new styled components for the first violation modal
const FirstViolationModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

// Add Voice Activity Indicator components
const VoiceActivityIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  position: 'relative',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: isActive ? '#02E2FF' : 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
}));

const VoiceWaves = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '2px solid #02E2FF',
    animation: 'wave 1.5s ease-out infinite',
  },
  '&::before': {
    width: '100%',
    height: '100%',
    animationDelay: '0s',
  },
  '&::after': {
    width: '100%',
    height: '100%',
    animationDelay: '0.75s',
  },
  '@keyframes wave': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(1.5)',
      opacity: 0,
    },
  },
}));

const VoiceIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'pulse 1s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
}));

// Assembly AI is now used for transcription instead of browser Speech Recognition

// Add back necessary interfaces
interface Question {
  id: string;
  text: string;
  skill: string;
  level: string;
}

interface JobQuestionsResponse {
  jobId: string;
  requiredSkills: Array<{
    name: string;
    level: string;
  }>;
  questions: string[];
  totalQuestions: number;
  testedSkills: any[];
}

const IntelligentInterviewTest = () => {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = useSelector((state: RootState) => state.user.userType);

  // WebSocket and Connection States
  const socketRef = useRef<any>(null);
  const connectionInitialized = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Interview Configuration with Silence Intelligence
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>({
    interviewType: 'HR_INTERVIEW',
    testReason: 'Preparing for software engineer behavioral interview',
    context: {
      targetCompany: 'Google',
      targetRole: 'Software Engineer',
      experienceLevel: 'Mid-Level',
      interviewGoal: 'Assess behavioral competencies and cultural fit'
    },
    models: {
      fastModel: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      thinkingModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      analysisModel: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
    },
    sessionSettings: {
      duration: 30,
      language: 'en',
      difficulty: 'intermediate',
      silenceTimeout: 5,
      silenceIntelligence: {
        enabled: true,
        adaptiveThresholds: true,
        maxSilencePrompts: 3,
        naturalPauseDetection: true,
        contextAwareThresholds: true
      }
    }
  });

  // Backend Silence Intelligence State
  const [backendSilenceConfig, setBackendSilenceConfig] = useState<any>(null);

  // Interview States
  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'connecting' | 'active' | 'paused' | 'ended'>('idle');
  const [currentMessage, setCurrentMessage] = useState<InterviewMessage | null>(null);
  const [conversationHistory, setConversationHistory] = useState<InterviewMessage[]>([]);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [realTimeReport, setRealTimeReport] = useState<RealTimeReport | null>(null);

  // Audio and Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState(''); // Full answer accumulation
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Assembly AI States
  const [streamingToken, setStreamingToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Enhanced Transcript Management
  const [transcriptChunks, setTranscriptChunks] = useState<string[]>([]);
  const [finalTranscriptSent, setFinalTranscriptSent] = useState(false);
  const [lastFinalTranscriptTime, setLastFinalTranscriptTime] = useState<number>(0);
  const transcriptDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Camera States
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [cameraError, setCameraError] = useState<string>('');

  // Agent State Tracking
  const [agentState, setAgentState] = useState<'idle' | 'thinking' | 'waiting' | 'processing' | 'ready'>('idle');
  const [agentMessage, setAgentMessage] = useState<string>('');

  // Silence Detection States
  const [silenceCount, setSilenceCount] = useState(0);
  const [lastVoiceActivity, setLastVoiceActivity] = useState<number>(Date.now());

  // Enhanced Silence Detection
  const [currentSilenceDuration, setCurrentSilenceDuration] = useState(0);
  const [silenceStartTime, setSilenceStartTime] = useState<number | null>(null);
  const [isTrueSilence, setIsTrueSilence] = useState(false);
  const [questionReadingTime, setQuestionReadingTime] = useState<number | null>(null);
  const [speechPhase, setSpeechPhase] = useState<'reading' | 'thinking' | 'speaking' | 'paused' | 'complete'>('reading');
  const [naturalPauseCount, setNaturalPauseCount] = useState(0);
  const [audioLevelHistory, setAudioLevelHistory] = useState<number[]>([]);

  // Adaptive Silence Thresholds
  const [baseSilenceThreshold] = useState(5000); // 5 seconds base
  const [adaptiveSilenceThreshold, setAdaptiveSilenceThreshold] = useState(5000);
  const readingTimeBuffer = 10000; // 10 seconds reading time after new question
  const naturalPauseThreshold = 2000; // 2 seconds for natural pauses
  const maxNaturalPauses = 3; // Maximum natural pauses before considering complete

  // Reading Time States
  const [isInReadingTime, setIsInReadingTime] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);

  // Question Display States
  const [questionHighlight, setQuestionHighlight] = useState(false);
  const [coverageDashboardExpanded, setCoverageDashboardExpanded] = useState(false);

  // UI States
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Debug States
  const [debugMode, setDebugMode] = useState(false);
  const [silenceDebugLog, setSilenceDebugLog] = useState<string[]>([]);
  const [transcriptDebugLog, setTranscriptDebugLog] = useState<string[]>([]);

  // Security States
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);

  // Generate temporary token for Assembly AI streaming
  const generateStreamingToken = async (): Promise<string> => {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'generate_token' }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate streaming token');
    }

    const { token } = await response.json();
    return token;
  };

  // Setup Assembly AI streaming transcription
  const setupStreamingTranscription = async (stream: MediaStream) => {
    try {
      setIsConnecting(true);

      // Generate token
      const token = await generateStreamingToken();
      setStreamingToken(token);

      // Setup audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect WebSocket
      const ws = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🎤 Assembly AI streaming connection opened');
        setIsConnecting(false);

        // Connect audio processing
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputBuffer = event.inputBuffer.getChannelData(0);

            // Convert float32 to int16
            const int16Buffer = new Int16Array(inputBuffer.length);
            for (let i = 0; i < inputBuffer.length; i++) {
              int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
            }

            ws.send(int16Buffer.buffer);
          }
        };
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.message_type === 'PartialTranscript' || data.message_type === 'FinalTranscript') {
          const text = data.text?.trim();
          if (text) {
            // Reset silence detection when we hear speech
            if (silenceStartTime) {
              setSilenceStartTime(null);
              setCurrentSilenceDuration(0);
              setIsTrueSilence(false);
              setSpeechPhase('speaking');
              console.log('🎤 Speech detected, resetting silence timer');
            }

            const now = Date.now();
            const isInReadingTime = questionReadingTime && (now - questionReadingTime < readingTimeBuffer);

            if (data.message_type === 'FinalTranscript') {
              addTranscriptDebugLog(`🎯 Final transcript segment: "${text}"`);

              // Add to transcript chunks for better management
              setTranscriptChunks(prev => {
                const newChunks = [...prev, text];
                addTranscriptDebugLog(`📦 Total chunks: ${newChunks.length}`);
                return newChunks;
              });

              // Update accumulated transcript
              setAccumulatedTranscript(prev => {
                const newAccumulated = prev ? `${prev} ${text}` : text;
                addTranscriptDebugLog(`📝 Accumulated length: ${newAccumulated.length} chars`);
                return newAccumulated;
              });

              // Update current transcript for display (show recent chunks)
              setCurrentTranscript(prev => {
                const combined = prev ? `${prev} ${text}` : text;
                // Keep only last 200 characters for display
                return combined.length > 200 ? '...' + combined.slice(-200) : combined;
              });

              // Update last final transcript time for debouncing
              setLastFinalTranscriptTime(now);
              setFinalTranscriptSent(false);

              if (isInReadingTime) {
                console.log('📖 Still in reading time, transcript saved but not sent');
                setAgentState('waiting');
                setAgentMessage(`Reading time: ${Math.ceil((readingTimeBuffer - (now - questionReadingTime)) / 1000)}s remaining`);
                setSpeechPhase('reading');
              } else {
                // Start silence detection for this response with debouncing
                if (transcriptDebounceRef.current) {
                  clearTimeout(transcriptDebounceRef.current);
                }

                transcriptDebounceRef.current = setTimeout(() => {
                  if (!finalTranscriptSent) {
                    setSilenceStartTime(Date.now());
                    setAgentState('ready');
                    setAgentMessage('Listening for your complete response...');
                    setSpeechPhase('thinking');
                    console.log('🔊 Starting silence detection for response');
                  }
                }, 1000); // 1 second debounce for final transcripts
              }

            } else {
              // For partial transcripts, just update current display
              setCurrentTranscript(prev => {
                // Show accumulated + current partial
                const fullText = accumulatedTranscript ? `${accumulatedTranscript} ${text}` : text;
                return fullText.length > 200 ? '...' + fullText.slice(-200) : fullText;
              });

              // Indicate active speech
              setSpeechPhase('speaking');
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Assembly AI WebSocket error:', error);
        setIsConnecting(false);
        showNotification('Transcription service error', 'error');
      };

      ws.onclose = () => {
        console.log('🔌 Assembly AI WebSocket connection closed');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('❌ Assembly AI streaming setup error:', error);
      setIsConnecting(false);
      showNotification('Failed to setup transcription service', 'error');
      throw error;
    }
  };

  // Cleanup Assembly AI connections
  const cleanupAssemblyAI = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        console.log('🔌 Assembly AI WebSocket closed');
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setStreamingToken(null);
      setIsConnecting(false);
    } catch (error) {
      console.error('⚠️ Error during Assembly AI cleanup:', error);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    // Prevent duplicate connections in React StrictMode
    if (connectionInitialized.current) {
      console.log('🔄 Connection already initialized, skipping...');
      return;
    }

    // WebSocket connection independent of auth status for testing
    console.log('🔍 Auth status:', { isAuthenticated, sessionData: !!session });

    console.log('🔌 Initializing WebSocket connection...');
    connectionInitialized.current = true;

    // Use WSL IP for Windows to WSL communication
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.23.207.114:5000';
    console.log('🔗 Attempting to connect to:', `${baseUrl}/interview`);

    const socket = io(`${baseUrl}/interview`, {
      transports: ['polling', 'websocket'], // Start with polling for stability
      forceNew: false, // Allow connection reuse
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: false, // Don't remember upgrades in dev mode
      autoConnect: true
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to interview WebSocket');
      console.log('🔗 Connection ID:', socket.id);
      console.log('🚀 Transport:', socket.io.engine.transport.name);
      setIsConnected(true);
      setConnectionStatus('connected');
      showNotification('Connected to interview system', 'success');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from interview WebSocket:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setInterviewStatus('idle');
      showNotification('Connection lost. Attempting to reconnect...', 'warning');
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

      // If namespace error, provide specific guidance
      if (error.message?.includes('Invalid namespace')) {
        console.log('🔄 Namespace error detected - Interview service not available');
        console.log('💡 Backend may not have initialized the /interview namespace');
        showNotification('Interview namespace not available. Retrying...', 'warning');
      } else if ((error as any).type === 'TransportError') {
        console.log('🚛 Transport error - trying different transport method');
        showNotification('Connection transport failed, retrying...', 'warning');
      } else {
        showNotification(`Connection failed: ${error.message || 'Unknown error'}`, 'error');
      }
    });

    // Interview event handlers
    socket.on('interview_started', (data) => {
      console.log('🚀 Interview started:', data);
      setSessionId(data.sessionId);
      setInterviewStatus('active');
      setDuration(data.config.duration * 60 * 1000); // Convert to milliseconds

      // Configure backend silence intelligence
      if (data.config.silenceIntelligence) {
        setBackendSilenceConfig(data.config.silenceIntelligence);

        // Update adaptive threshold based on interview type
        const typeThreshold = data.config.silenceIntelligence.threshold || baseSilenceThreshold;
        setAdaptiveSilenceThreshold(typeThreshold);

        console.log('🧠 Silence intelligence configured:', {
          threshold: typeThreshold,
          interviewType: data.config.interviewType,
          maxPrompts: data.config.silenceIntelligence.maxPrompts
        });
      }

      showNotification('Interview started successfully!', 'success');
    });

    socket.on('interviewer_message', (message: InterviewMessage) => {
      console.log('💬 Received interviewer message:', message);
      setCurrentMessage(message);
      setConversationHistory(prev => [...prev, message]);

      // Reset transcript when new question comes
      setCurrentTranscript('');

      // Trigger question highlight animation
      setQuestionHighlight(true);
      setTimeout(() => setQuestionHighlight(false), 600); // Match animation duration

      // Start reading time buffer for new questions
      if (message.type === 'question' || message.type === 'follow_up') {
        setQuestionReadingTime(Date.now());
        setAgentState('waiting');
        setAgentMessage('Waiting for you to read the question...');

        // Reset all silence detection state
        resetSilenceDetection();

        // Adjust adaptive threshold based on previous response if available
        if (accumulatedTranscript) {
          adjustAdaptiveThreshold(accumulatedTranscript.length, naturalPauseCount);
        }

        console.log('📖 Starting reading time buffer for new question');
      }
    });

    socket.on('coverage_update', (data) => {
      console.log('📊 Coverage update:', data);
      setCoverage(data.coverage);
    });

    socket.on('report_update', (data) => {
      console.log('📋 Report update:', data);
      setRealTimeReport(data.report);
    });

    socket.on('silence_response', (data) => {
      console.log('🔇 Enhanced silence response:', data);
      setSilenceCount(data.silenceCount);

      if (data.action === 'silence_prompt') {
        showNotification('Take your time to think...', 'info');

        // Update agent state for silence prompt
        setAgentState('waiting');
        setAgentMessage(data.content || 'AI provided encouragement');

        // Add the silence prompt to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'system',
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString()
        }]);
      } else if (data.action === 'move_forward') {
        // Backend decided to move forward due to max silence prompts
        setAgentState('thinking');
        setAgentMessage('Moving to next topic...');

        console.log('⏭️ Moving forward due to max silence prompts reached');
      }

      // Update silence intelligence state if provided
      if (data.silenceIntelligence) {
        console.log('🧠 Updated silence intelligence:', data.silenceIntelligence);

        // Adjust thresholds based on backend intelligence
        if (data.silenceIntelligence.adaptiveThreshold) {
          setAdaptiveSilenceThreshold(data.silenceIntelligence.adaptiveThreshold);
        }
      }
    });

    socket.on('voice_activity', (data) => {
      setIsVoiceActive(data.isActive);
      if (data.isActive) {
        setLastVoiceActivity(Date.now());
      }
    });

    socket.on('interview_ended', (data) => {
      console.log('🏁 Interview ended:', data);
      setInterviewStatus('ended');
      setIsRecording(false);
      showNotification('Interview completed!', 'success');

      // Navigate to report page with final report
      setTimeout(() => {
        router.push({
          pathname: '/interview/report/hr',
          query: { sessionId: data.sessionId }
        });
      }, 2000);
    });

    socket.on('interview_error', (error) => {
      console.error('❌ Interview error:', error);
      showNotification(`Interview error: ${error.message}`, 'error');
    });

    // Additional connection handlers for status management
    socket.on('reconnect', () => {
      console.log('🔄 Reconnected to interview WebSocket');
      setIsConnected(true);
      setConnectionStatus('connected');
      showNotification('Reconnected to interview system', 'success');
    });

    return () => {
      // Only cleanup if this is the actual cleanup, not React StrictMode double-invoke
      if (socketRef.current && socketRef.current === socket) {
        console.log('🧹 Cleaning up WebSocket connection');
        socket.disconnect();
        socketRef.current = null;
        connectionInitialized.current = false;
      }
    };
  }, []); // Remove dependency to prevent unnecessary re-initializations

  // Handle hydration to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setCameraStatus('requesting');
        setCameraError('');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });

        streamRef.current = stream;
        setCameraStatus('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }

        console.log('✅ Camera initialized successfully');
      } catch (error) {
        console.error('❌ Camera initialization error:', error);

        if (error.name === 'NotAllowedError') {
          setCameraStatus('denied');
          setCameraError('Camera access was denied');
          showNotification('Please allow camera access to use this feature', 'warning');
        } else if (error.name === 'NotFoundError') {
          setCameraStatus('error');
          setCameraError('No camera found');
          showNotification('No camera device found', 'error');
        } else {
          setCameraStatus('error');
          setCameraError(error.message);
          showNotification('Camera access error: ' + error.message, 'error');
        }
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup Assembly AI connections on component unmount
      cleanupAssemblyAI();
    };
  }, []);

  // Smart Silence Detection Timer
  useEffect(() => {
    let silenceTimer: NodeJS.Timeout | null = null;

    if (silenceStartTime && interviewStatus === 'active') {
      silenceTimer = setInterval(() => {
        const now = Date.now();
        const duration = now - silenceStartTime;
        setCurrentSilenceDuration(duration);

        // Check if we've reached true silence threshold
        if (duration >= adaptiveSilenceThreshold && !isTrueSilence) {
          setIsTrueSilence(true);
          setAgentState('processing');
          setAgentMessage('Processing your response...');

          // Send the COMPLETE accumulated response to the backend
          if (socketRef.current && socketRef.current.connected && accumulatedTranscript.trim()) {
            console.log('✅ True silence detected, sending COMPLETE response:', accumulatedTranscript);
            console.log('📊 Response length:', accumulatedTranscript.length, 'characters');

            socketRef.current.emit('candidate_response', {
              sessionId,
              transcript: accumulatedTranscript, // Send accumulated, not just current
              timestamp: new Date().toISOString(),
              isFinal: true,
              silenceDuration: duration
            });

            // Update agent state
            setAgentState('thinking');
            setAgentMessage('AI is analyzing your response...');

            // Reset silence detection and clear accumulated transcript for next question
            setSilenceStartTime(null);
            setCurrentSilenceDuration(0);
            setAccumulatedTranscript(''); // Clear for next response
            setCurrentTranscript(''); // Clear display
          }
        }
      }, 100); // Check every 100ms for smooth UI updates
    }

    return () => {
      if (silenceTimer) {
        clearInterval(silenceTimer);
      }
    };
  }, [silenceStartTime, isTrueSilence, accumulatedTranscript, sessionId, interviewStatus, adaptiveSilenceThreshold, speechPhase, naturalPauseCount, finalTranscriptSent]);

  // Reading Time Management
  useEffect(() => {
    let readingTimer: NodeJS.Timeout | null = null;

    if (questionReadingTime) {
      const now = Date.now();
      const timeElapsed = now - questionReadingTime;
      const timeRemaining = readingTimeBuffer - timeElapsed;

      if (timeRemaining > 0) {
        setIsInReadingTime(true);
        setReadingTimeLeft(timeRemaining);

        readingTimer = setInterval(() => {
          const currentTime = Date.now();
          const elapsed = currentTime - questionReadingTime;
          const remaining = readingTimeBuffer - elapsed;

          if (remaining > 0) {
            setReadingTimeLeft(remaining);
          } else {
            setIsInReadingTime(false);
            setReadingTimeLeft(0);
            setQuestionReadingTime(null);
          }
        }, 100); // Update every 100ms for smooth countdown
      } else {
        setIsInReadingTime(false);
        setReadingTimeLeft(0);
        setQuestionReadingTime(null);
      }
    } else {
      setIsInReadingTime(false);
      setReadingTimeLeft(0);
    }

    return () => {
      if (readingTimer) {
        clearInterval(readingTimer);
      }
    };
  }, [questionReadingTime, readingTimeBuffer]);

  // Timer for interview duration
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (interviewStatus === 'active' && duration > 0) {
      timer = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1000;
          if (newElapsed >= duration) {
            endInterview();
            return duration;
          }
          return newElapsed;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewStatus, duration]);

  // Start interview function
  const startInterview = async () => {
    if (!socketRef.current || !isConnected) {
      showNotification('Not connected to interview system', 'error');
      return;
    }

    try {
      setInterviewStatus('connecting');
      console.log('🚀 Starting interview with config:', interviewConfig);

      // Get user info for candidate ID
      const candidateId = session?.user?.email || 'anonymous';

      // Initialize audio for recording
      await initializeAudio();

      // Send start interview request with enhanced silence configuration
      socketRef.current.emit('start_interview', {
        config: {
          ...interviewConfig,
          silenceIntelligence: {
            interviewType: interviewConfig.interviewType,
            candidateBehavior: {
              interactionStyle: 'balanced', // Will be updated based on behavior
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
      showNotification('Failed to start interview', 'error');
      setInterviewStatus('idle');
    }
  };

  // Initialize audio for recording and voice activity detection
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      audioStreamRef.current = stream;

      // Setup audio context for voice activity detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      startVoiceActivityDetection();

      // Initialize Assembly AI transcription with the same audio stream
      try {
        await setupStreamingTranscription(stream);
        console.log('✅ Assembly AI transcription initialized');
      } catch (transcriptionError) {
        console.error('⚠️ Assembly AI setup failed, continuing without transcription:', transcriptionError);
        showNotification('Transcription service unavailable, but interview can continue', 'warning');
      }

      console.log('✅ Audio initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      throw error;
    }
  };

  // Debug logging functions
  const addSilenceDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setSilenceDebugLog(prev => [...prev.slice(-19), logEntry]); // Keep last 20 entries
    console.log('🔍 SILENCE DEBUG:', logEntry);
  };

  const addTranscriptDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setTranscriptDebugLog(prev => [...prev.slice(-19), logEntry]); // Keep last 20 entries
    console.log('🔍 TRANSCRIPT DEBUG:', logEntry);
  };

  // Reset silence detection state
  const resetSilenceDetection = () => {
    setSilenceStartTime(null);
    setCurrentSilenceDuration(0);
    setIsTrueSilence(false);
    setNaturalPauseCount(0);
    setSpeechPhase('reading');
    setAccumulatedTranscript('');
    setCurrentTranscript('');
    setTranscriptChunks([]);
    setFinalTranscriptSent(false);

    // Clear any pending debounce timers
    if (transcriptDebounceRef.current) {
      clearTimeout(transcriptDebounceRef.current);
      transcriptDebounceRef.current = null;
    }

    addSilenceDebugLog('🔄 Silence detection state reset');
  };

  // Adaptive threshold adjustment based on speech patterns
  const adjustAdaptiveThreshold = (responseLength: number, pauseCount: number) => {
    let newThreshold = baseSilenceThreshold;

    // Longer responses need longer silence confirmation
    if (responseLength > 500) {
      newThreshold += 2000; // +2 seconds for long responses
    } else if (responseLength > 200) {
      newThreshold += 1000; // +1 second for medium responses
    }

    // More pauses suggest thoughtful speaker, give more time
    if (pauseCount > 2) {
      newThreshold += 1500; // +1.5 seconds for thoughtful speakers
    }

    setAdaptiveSilenceThreshold(Math.min(newThreshold, 10000)); // Max 10 seconds
    console.log('🎯 Adaptive threshold adjusted to:', newThreshold, 'ms');
  };

  // Enhanced Voice Activity Detection
  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectVoiceActivity = () => {
      if (interviewStatus !== 'active') return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const isCurrentlyActive = average > 30; // Threshold for voice activity

      // Update voice activity state
      if (isCurrentlyActive !== isVoiceActive) {
        setIsVoiceActive(isCurrentlyActive);

        // Send voice activity to WebSocket
        if (socketRef.current) {
          socketRef.current.emit('audio_stream', {
            audioData: dataArray,
            isActive: isCurrentlyActive
          });
        }
      }

      // Handle silence detection
      if (isCurrentlyActive) {
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setLastVoiceActivity(Date.now());
      } else if (!silenceTimerRef.current) {
        // Start silence timer
        const silenceTimeout = (interviewConfig.sessionSettings?.silenceTimeout || 5) * 1000;

        silenceTimerRef.current = setTimeout(() => {
          const silenceDuration = Date.now() - lastVoiceActivity;
          handleSilenceDetected(silenceDuration);
        }, silenceTimeout);
      }

      // Continue monitoring
      requestAnimationFrame(detectVoiceActivity);
    };

    detectVoiceActivity();
  };

  // Handle silence detection
  const handleSilenceDetected = (silenceDuration: number) => {
    console.log(`🔇 Silence detected: ${silenceDuration}ms`);

    if (socketRef.current && interviewStatus === 'active') {
      socketRef.current.emit('silence_detected', {
        silenceDuration: silenceDuration / 1000 // Convert to seconds
      });
    }

    // Reset silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Process speech input (would be connected to speech-to-text)
  const processSpeechInput = (transcript: string) => {
    if (!transcript.trim() || !socketRef.current || interviewStatus !== 'active') {
      return;
    }

    console.log('🎤 Processing speech input:', transcript);

    setCurrentTranscript(transcript);

    // Add candidate response to conversation
    const candidateMessage: InterviewMessage = {
      type: 'system',
      content: transcript,
      timestamp: new Date().toISOString()
    };

    setConversationHistory(prev => [...prev, candidateMessage]);

    // Send to WebSocket for AI processing
    socketRef.current.emit('candidate_response', {
      transcript,
      audioMetadata: {
        duration: transcript.length * 100, // Rough estimate
        confidence: 0.9 // Placeholder
      }
    });
  };

  // End interview
  const endInterview = () => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('end_interview', { sessionId });
    }

    // Stop audio recording
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Stop voice activity detection
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Reset silence detection state
    resetSilenceDetection();

    // Cleanup Assembly AI connections
    cleanupAssemblyAI();

    setIsRecording(false);
    setInterviewStatus('ended');
  };

  // Utility function to show notifications
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  // Format time display
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (elapsedTime / duration) * 100;
  };

  // Security violation handler
  const handleSecurityViolation = () => {
    setSecurityViolationCount((prev) => {
      const next = prev + 1;
      if (next === 1) {
        // First violation: show intelligent popup
        setShowFirstViolationModal(true);
      } else if (next === 2) {
        // Second violation: redirect and show modal
        setShowSecurityModal(true);
        endInterview();
        setTimeout(() => {
          router.push('/dashboard/candidate');
        }, 2000); // Give time for modal to show
      }
      return next;
    });
  };

  // Security monitoring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (interviewStatus === 'active' && !violationHandledRef.current) {
        // Check for PrintScreen key
        if (e.key === 'PrintScreen') {
          handleSecurityViolation();
        }
        // Check for Alt + PrintScreen
        if (e.altKey && e.key === 'PrintScreen') {
          handleSecurityViolation();
        }
        // Check for Windows + Shift + S
        if (e.key === 'S' && e.shiftKey && e.metaKey) {
          handleSecurityViolation();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && interviewStatus === 'active' && !violationHandledRef.current) {
        handleSecurityViolation();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (interviewStatus === 'active' && !violationHandledRef.current) {
        handleSecurityViolation();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStatus]);

  // Temporarily bypass auth check for testing
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Connection Status */}
      {isHydrated && connectionStatus !== 'connected' && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography variant="h6" color="text.primary">
              {connectionStatus === 'connecting' && 'Connecting to Interview System...'}
              {connectionStatus === 'error' && 'Connection Error - Please refresh the page'}
              {connectionStatus === 'disconnected' && 'Disconnected - Attempting to reconnect...'}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Prominent Question Panel - Always visible during interview */}
      {interviewStatus === 'active' && currentMessage && (
        <QuestionPanel
          elevation={6}
          className={questionHighlight ? 'question-highlight' : ''}
        >
          <QuestionContent>
            <QuestionText variant="body1">
              {currentMessage.content || "Getting next question..."}
            </QuestionText>
            {isInReadingTime && (
              <ReadingTimeIndicator>
                <TimerIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                <Typography variant="body2" sx={{
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'monospace'
                }}>
                  {Math.ceil(readingTimeLeft / 1000)}s
                </Typography>
              </ReadingTimeIndicator>
            )}
          </QuestionContent>
          {currentMessage.reasoning && (
            <Typography variant="caption" sx={{
              display: 'block',
              mt: 1,
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              💡 {currentMessage.reasoning}
            </Typography>
          )}
        </QuestionPanel>
      )}

      {/* Compact Camera Preview */}
      <Paper elevation={2} sx={{
        p: 2,
        mb: 3,
        ...(interviewStatus === 'active' ? {
          position: 'relative',
          maxWidth: '300px',
          ml: 'auto',
          mr: 0
        } : {})
      }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1rem' }}>
          Camera Preview
        </Typography>
        <Box sx={{
          position: 'relative',
          width: '100%',
          maxWidth: interviewStatus === 'active' ? '280px' : '400px',
          aspectRatio: '4/3',
          mx: interviewStatus === 'active' ? 0 : 'auto',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
          border: '1px solid #e0f7fa',
          bgcolor: '#f5f5f5',
          transition: 'all 0.3s ease'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror the video
              display: cameraStatus === 'granted' ? 'block' : 'none'
            }}
          />

          {/* Camera Status Overlays */}
          {cameraStatus === 'idle' && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#666'
            }}>
              <Typography variant="body2">Camera will initialize when page loads</Typography>
            </Box>
          )}

          {cameraStatus === 'requesting' && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              color: '#666'
            }}>
              <CircularProgress size={24} />
              <Typography variant="caption">Requesting camera permission...</Typography>
            </Box>
          )}

          {cameraStatus === 'denied' && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#f44336'
            }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Camera access denied</Typography>
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                Please allow camera access and try again
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.location.reload()}
                sx={{ mt: 1 }}
              >
                Refresh Page
              </Button>
            </Box>
          )}

          {cameraStatus === 'error' && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#f44336'
            }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Camera error</Typography>
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                {cameraError || 'Unable to access camera'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.location.reload()}
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Box>
          )}

          {isConnecting && cameraStatus === 'granted' && (
            <Box sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              p: 1,
              borderRadius: 1
            }}>
              <CircularProgress size={16} sx={{ color: 'white' }} />
              <Typography variant="caption">Connecting transcription...</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Agent Status & Silence Detection Panel */}
      {(interviewStatus === 'active' || agentState !== 'idle') && (
        <AgentStatusPanel>
          <CardContent sx={{ pb: '16px !important' }}>
            {/* Agent State Display */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                AI AGENT STATUS
              </Typography>
              <AgentStateIndicator className={agentState}>
                {/* Agent State Icon */}
                {agentState === 'thinking' && (
                  <PsychologyIcon sx={{ color: '#ffc107', fontSize: 20 }} />
                )}
                {agentState === 'waiting' && (
                  <HourglassEmptyIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                )}
                {agentState === 'processing' && (
                  <ProcessingIcon sx={{ color: '#9c27b0', fontSize: 20, animation: 'spin 2s linear infinite' }} />
                )}
                {agentState === 'ready' && (
                  <ReadyIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                )}
                {agentState === 'idle' && (
                  <TimerIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {agentState === 'thinking' && 'AI Thinking...'}
                    {agentState === 'waiting' && 'Waiting for Response'}
                    {agentState === 'processing' && 'Processing Answer'}
                    {agentState === 'ready' && 'Ready'}
                    {agentState === 'idle' && 'Idle'}
                  </Typography>
                  {agentMessage && (
                    <Typography variant="caption" sx={{
                      color: '#bbb',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {agentMessage}
                    </Typography>
                  )}
                </Box>
              </AgentStateIndicator>
            </Box>

            {/* Reading Time Display */}
            {isInReadingTime && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                  READING TIME
                </Typography>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: 'rgba(255, 183, 77, 0.15)',
                  border: '1px solid rgba(255, 183, 77, 0.3)'
                }}>
                  <TimerDisplay className="reading-time">
                    {Math.ceil(readingTimeLeft / 1000)}s remaining
                  </TimerDisplay>
                  <Typography variant="caption" sx={{ color: '#ffb74d', textAlign: 'center', display: 'block', mt: 0.5 }}>
                    Please read the question
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Silence Detection Display */}
            {interviewStatus === 'active' && !isInReadingTime && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                  SILENCE DETECTION
                </Typography>

                {/* Silence Timer */}
                <Box sx={{ mb: 1 }}>
                  <TimerDisplay className={isTrueSilence ? 'silence-complete' : 'silence-active'}>
                    {(currentSilenceDuration / 1000).toFixed(1)}s / 5.0s
                  </TimerDisplay>
                </Box>

                {/* Progress Bar */}
                <SilenceProgressBar
                  variant="determinate"
                  value={(currentSilenceDuration / adaptiveSilenceThreshold) * 100}
                  className={isTrueSilence ? 'complete' : ''}
                />

                {/* Status Message */}
                <Typography variant="caption" sx={{
                  color: isTrueSilence ? '#81c784' : (silenceStartTime ? '#64b5f6' : '#bbb'),
                  textAlign: 'center',
                  display: 'block',
                  mt: 1,
                  fontSize: '0.7rem'
                }}>
                  {isTrueSilence ? '✓ Response sent!' :
                   silenceStartTime ? 'Detecting silence...' :
                   'Waiting for silence...'}
                </Typography>
              </Box>
            )}

            {/* Current Transcript Preview */}
            {currentTranscript && interviewStatus === 'active' && (
              <Box sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                  CURRENT RESPONSE
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#fff',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  display: 'block',
                  maxHeight: '60px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  lineHeight: 1.4
                }}>
                  "{currentTranscript.slice(-150)}{currentTranscript.length > 150 ? '...' : ''}"
                </Typography>
              </Box>
            )}

            {/* Debug Panel (only show in development or when debug mode is enabled) */}
            {(debugMode || process.env.NODE_ENV === 'development') && (
              <Box sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600 }}>
                    DEBUG LOGS
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setDebugMode(!debugMode)}
                    sx={{
                      fontSize: '0.6rem',
                      padding: '2px 8px',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#fff'
                    }}
                  >
                    {debugMode ? 'Hide' : 'Show'}
                  </Button>
                </Box>
                {debugMode && (
                  <Box sx={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    fontSize: '0.6rem',
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '6px',
                    borderRadius: '4px',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)' }
                  }}>
                    {silenceDebugLog.map((log, index) => (
                      <Box key={index} sx={{ color: '#64b5f6', marginBottom: '2px' }}>
                        {log}
                      </Box>
                    ))}
                    {transcriptDebugLog.map((log, index) => (
                      <Box key={index} sx={{ color: '#81c784', marginBottom: '2px' }}>
                        {log}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </AgentStatusPanel>
      )}

      {/* Collapsible AI Coverage Intelligence Dashboard */}
      {(interviewStatus === 'active' || coverage) && (
        <Paper elevation={3} sx={{
          mt: 3,
          background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.1) 0%, rgba(0, 184, 212, 0.1) 100%)',
          border: '1px solid rgba(131, 16, 255, 0.2)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.8) 0%, rgba(0, 184, 212, 0.8) 100%)',
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={() => setCoverageDashboardExpanded(!coverageDashboardExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <AssessmentIcon />
                  AI Coverage Intelligence Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Real-time intelligent analysis of interview coverage
                </Typography>
              </Box>
              <IconButton sx={{ color: 'white' }}>
                {coverageDashboardExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Collapsible Content */}
          {coverageDashboardExpanded && (
            <Grid container spacing={2} sx={{ p: 3 }}>
            {/* Overall Coverage */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                    Overall Coverage
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" sx={{ color: '#00ff9d', fontWeight: 700 }}>
                      {coverage?.overall || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Interview Completion
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={coverage?.overall || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #8310FF 0%, #00ff9d 100%)',
                        borderRadius: 4,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* AI Insights */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                    AI Intelligence Insights
                  </Typography>
                  {realTimeReport?.aiInsights ? (
                    <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                      {realTimeReport.aiInsights.map((insight: string, index: number) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PsychologyIcon sx={{ fontSize: 16, color: '#00ff9d' }} />
                          <Typography variant="body2" sx={{ color: '#333' }}>
                            {insight}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      AI insights will appear as the interview progresses...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Coverage Areas Breakdown */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 3 }}>
                    Competency Coverage Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    {coverage?.areas && Object.entries(coverage.areas).map(([areaName, areaData]: [string, any]) => (
                      <Grid item xs={12} sm={6} md={4} key={areaName}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(131, 16, 255, 0.1)',
                          border: '1px solid rgba(131, 16, 255, 0.2)',
                          height: '100%'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                              {areaName}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${areaData.percentage || 0}%`}
                              sx={{
                                backgroundColor: areaData.percentage >= 80 ? '#4caf50' : areaData.percentage >= 50 ? '#ff9800' : '#f44336',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={areaData.percentage || 0}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': {
                                background: areaData.percentage >= 80 ?
                                  'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)' :
                                  areaData.percentage >= 50 ?
                                  'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)' :
                                  'linear-gradient(90deg, #f44336 0%, #e57373 100%)',
                                borderRadius: 3,
                              },
                            }}
                          />
                          {areaData.aiAnalysis && (
                            <Typography variant="caption" sx={{
                              color: '#666',
                              display: 'block',
                              mt: 1,
                              fontSize: '0.7rem',
                              fontStyle: 'italic'
                            }}>
                              AI: {areaData.aiAnalysis.reasoning?.substring(0, 60)}...
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Real-time Recommendations */}
            {realTimeReport?.recommendations && realTimeReport.recommendations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                      AI Recommendations
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                      {realTimeReport.recommendations.map((rec: string, index: number) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#00ff9d',
                            mt: 0.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.4 }}>
                            {rec}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Performance Trends */}
            {realTimeReport?.trends && realTimeReport.trends.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                      Performance Trends
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                      {realTimeReport.trends.map((trend: string, index: number) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                          <Box sx={{
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderBottom: '6px solid #00b8d4',
                            mt: 0.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.4 }}>
                            {trend}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* AI Decision History */}
            {interviewStatus === 'active' && (
              <Grid item xs={12}>
                <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 2 }}>
                      AI Decision Intelligence
                    </Typography>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(0, 255, 157, 0.1)',
                      border: '1px solid rgba(0, 255, 157, 0.2)'
                    }}>
                      <Typography variant="body2" sx={{ color: '#333', mb: 1, fontWeight: 500 }}>
                        Current AI Focus: {agentMessage || 'Analyzing conversation flow...'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        The AI is continuously analyzing responses, preventing question repetition, and ensuring comprehensive coverage of all competency areas.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
            </Grid>
          )}
        </Paper>
      )}

      {/* Interview Container */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom>
            HR Interview Simulation
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Intelligent Real-time Interview with AI
          </Typography>

          {/* Status Indicators */}
          <Box display="flex" justifyContent="center" gap={2} mt={2} flexWrap="wrap">
            <Chip
              icon={interviewStatus === 'active' ? <RecordVoiceOverIcon /> : <MicOffIcon />}
              label={interviewStatus === 'active' ? 'Active' : 'Inactive'}
              color={interviewStatus === 'active' ? 'success' : 'default'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <Chip
              icon={isVoiceActive ? <MicIcon /> : <MicOffIcon />}
              label={isVoiceActive ? 'Speaking' : 'Listening'}
              color={isVoiceActive ? 'success' : 'default'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <Chip
              icon={
                cameraStatus === 'granted' ? <VideocamIcon /> :
                cameraStatus === 'requesting' ? <VideocamOffIcon /> :
                <ErrorIcon />
              }
              label={
                cameraStatus === 'granted' ? 'Camera Ready' :
                cameraStatus === 'requesting' ? 'Camera Loading' :
                cameraStatus === 'denied' ? 'Camera Denied' :
                'Camera Error'
              }
              color={cameraStatus === 'granted' ? 'success' : cameraStatus === 'requesting' ? 'warning' : 'error'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            {interviewStatus === 'active' && (
              <Chip
                icon={
                  agentState === 'thinking' ? <PsychologyIcon /> :
                  agentState === 'waiting' ? <HourglassEmptyIcon /> :
                  agentState === 'processing' ? <ProcessingIcon /> :
                  agentState === 'ready' ? <ReadyIcon /> :
                  <MicOffIcon />
                }
                label={
                  agentState === 'thinking' ? 'AI Thinking' :
                  agentState === 'waiting' ? 'Waiting' :
                  agentState === 'processing' ? 'Processing' :
                  agentState === 'ready' ? 'Ready' :
                  'Idle'
                }
                color={
                  agentState === 'thinking' ? 'info' :
                  agentState === 'waiting' ? 'warning' :
                  agentState === 'processing' ? 'info' :
                  agentState === 'ready' ? 'success' :
                  'default'
                }
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
          </Box>
        </Box>

        {/* Interview Content */}
        <Box sx={{ p: 4 }}>
          {interviewStatus === 'idle' && (
            <Box textAlign="center" py={4}>
              <Typography variant="h5" gutterBottom>
                Ready to Start Your Interview?
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                This is an AI-powered interview simulation that adapts to your responses and provides real-time feedback.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={startInterview}
                disabled={!isHydrated || connectionStatus !== 'connected' || cameraStatus !== 'granted'}
                startIcon={<PlayArrowIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Interview
              </Button>
              {(cameraStatus !== 'granted' && cameraStatus !== 'requesting') && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                  Camera access required to start interview
                </Typography>
              )}
            </Box>
          )}

          {interviewStatus === 'active' && (
            <Box>
              {/* Enhanced Transcript Display */}
              <Paper elevation={3} sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,249,250,1) 100%)',
                border: '2px solid #e3f2fd'
              }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <MicIcon sx={{ color: isVoiceActive ? '#4caf50' : '#9e9e9e' }} />
                  <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                    Your Response
                  </Typography>
                  {isVoiceActive && (
                    <Chip
                      size="small"
                      label="Speaking"
                      sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        ml: 1,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{
                  minHeight: 120,
                  border: currentTranscript ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 3,
                  bgcolor: currentTranscript ? 'rgba(76, 175, 80, 0.05)' : '#fafafa',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}>
                  <Typography variant="body1" sx={{
                    fontStyle: currentTranscript ? 'normal' : 'italic',
                    color: currentTranscript ? 'text.primary' : 'text.secondary',
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}>
                    {currentTranscript || "Speak your response..."}
                  </Typography>
                  {/* Voice Activity Indicator */}
                  {isVoiceActive && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      animation: 'pulse 1s ease-in-out infinite'
                    }} />
                  )}
                </Box>
              </Paper>

              {/* Controls */}
              <Box display="flex" justifyContent="center" gap={2} mb={3}>
                <Button
                  variant="outlined"
                  onClick={endInterview}
                  startIcon={<StopIcon />}
                  color="error"
                >
                  End Interview
                </Button>
              </Box>

              {/* Progress Indicators */}
              {coverage && (
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Interview Coverage
                  </Typography>
                  <Box mt={2}>
                    {Object.entries(coverage).map(([topic, progress]) => (
                      <Box key={topic} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            {topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(progress * 100)}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress * 100} />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {interviewStatus === 'ended' && (
            <Box textAlign="center" py={4}>
              <Typography variant="h5" gutterBottom color="success.main">
                Interview Completed!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Thank you for participating. Your responses have been recorded and analyzed.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/interview/report/hr')}
                startIcon={<AssessmentIcon />}
              >
                View Report
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Security Violation Modals */}
      <Dialog open={showFirstViolationModal} onClose={() => setShowFirstViolationModal(false)}>
        <DialogTitle sx={{ color: 'warning.main' }}>
          Security Warning
        </DialogTitle>
        <DialogContent>
          <Typography>
            We detected a potential security violation (screen capture or tab switching).
            Please stay focused on the interview. This is your first warning.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFirstViolationModal(false)} color="primary">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSecurityModal} onClose={() => setShowSecurityModal(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          Interview Terminated
        </DialogTitle>
        <DialogContent>
          <Typography>
            Multiple security violations detected. The interview has been terminated for security reasons.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => router.push('/dashboard/candidate')} color="primary">
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(IntelligentInterviewTest), {
  ssr: false
});
