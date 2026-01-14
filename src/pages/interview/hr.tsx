'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AssemblyAI } from 'assemblyai';
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import ProcessingIcon from '@mui/icons-material/Autorenew';
import ReadyIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';
import { buildInterviewConfigFromURL, URLParams } from '@/utils/interviewConfigBuilder';
import {
  initializeCandidateProgress,
  getCandidateProgress,
  fetchPipelineInterviewParams,
  updateStepStatus,
  moveToNextStep,
  type CandidateProgress
} from '@/utils/pipelineInterviewApi';

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
    silenceIntelligence?: {
      enabled: boolean;
      adaptiveThresholds: boolean;
      maxSilencePrompts: number;
      naturalPauseDetection: boolean;
      contextAwareThresholds: boolean;
    };
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
  aiInsights?: string[];
  trends?: string[];
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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
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
      fastModel: 'meta-llama/Llama-Guard-3-11B-Vision-Turbo',
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

  // Interview Timer States
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [timeWarning, setTimeWarning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const transcriberRef = useRef<any | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null); // Ref to avoid stale closure in event handlers

  // Enhanced Transcript Management
  const [transcriptChunks, setTranscriptChunks] = useState<string[]>([]);
  const [finalTranscriptSent, setFinalTranscriptSent] = useState(false);
  const [lastFinalTranscriptTime, setLastFinalTranscriptTime] = useState<number>(0);
  const transcriptDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Speaking Duration Tracking (to prevent premature interruptions)
  const [speakingStartTime, setSpeakingStartTime] = useState<number | null>(null);
  const [lastSpeakingTime, setLastSpeakingTime] = useState<number | null>(null);
  const speakingStartTimeRef = useRef<number | null>(null); // Ref for closure access
  const minimumSpeakingDuration = 1000; // 1 second minimum (AssemblyAI handles most turn detection)

  // Answer Accumulation System (prevent mid-speech interruptions)
  const [accumulatedTurns, setAccumulatedTurns] = useState<string[]>([]);
  const [lastTurnTime, setLastTurnTime] = useState<number | null>(null);
  const accumulatedTurnsRef = useRef<string[]>([]); // Ref for closure access
  const MAX_ACCUMULATED_TURNS = 10; // Maximum turns to accumulate before forcing send

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
  const readingTimeBuffer = 10000; // 10 seconds reading time after new question - give candidate time to listen and think
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

  // Debug States
  const [debugMode, setDebugMode] = useState(false);
  const [silenceDebugLog, setSilenceDebugLog] = useState<string[]>([]);
  const [transcriptDebugLog, setTranscriptDebugLog] = useState<string[]>([]);

  // Pipeline States
  const [isPipelineJob, setIsPipelineJob] = useState(false);
  const [candidateProgress, setCandidateProgress] = useState<any>(null);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<number | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // Parse URL query parameters and build dynamic interview config
  // 🔥 ENHANCED: Fetch job interview configuration with pipeline detection
  const fetchJobInterviewConfig = async (jobId: string) => {
    try {
      const token = Cookies.get('api_token');
      setPipelineLoading(true);

      console.log('🔍 Fetching interview config for jobId:', jobId);

      // 1. Check if this is a pipeline job
      const postResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/getPostById/${jobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!postResponse.ok) {
        throw new Error('Failed to fetch job details');
      }

      const postData = await postResponse.json();
      console.log('📋 Raw post data:', postData);
      const post = postData.data || postData.post || postData;
      const isPipeline = post?.creationType === 'pipeline';

      console.log('📋 Job detection:', {
        postId: post._id,
        creationType: post.creationType,
        isPipeline: isPipeline,
        hasPostSteps: !!post.post_Steps,
        postStepsCount: post.post_Steps?.length || 0
      });
      console.log('📋 Job type:', isPipeline ? 'Pipeline ⚡' : 'Regular');
      setIsPipelineJob(isPipeline);
      console.log('Session ID:', sessionIdRef.current);

      if (isPipeline) {
        // Pipeline job - MUST have user session
        // Get candidate ID from Redux profile or auth state (not NextAuth session)
        const candidateId = profile?._id || authUser?._id;

        if (!candidateId) {
          throw new Error('Pipeline jobs require authentication. Please log in to start the interview.');
        }

        console.log('🔍 Checking candidate progress for candidateId:', candidateId);

        // Try to get existing progress
        const progressResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/${candidateId}/${jobId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        let progressData;

        if (progressResponse.ok) {
          // Progress exists - get current step config from database
          progressData = await progressResponse.json();
          console.log('✅ Progress found - resuming from step:', progressData.currentStep.stepNumber);
        } else {
          // No progress - initialize at step 1
          console.log('📝 No progress found - initializing...');
          const initResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/initialize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ candidateId, jobId })
            }
          );

          if (!initResponse.ok) {
            throw new Error('Failed to initialize progress');
          }

          progressData = await initResponse.json();
          console.log('✅ Progress initialized at step:', progressData.currentStepNumber);
        }

        // Extract current step from database
        const currentStep = progressData.currentStep;

        console.log('🎯 Current step config:', {
          stepNumber: currentStep.stepNumber,
          stepType: currentStep.stepType,
          hasSkills: !!currentStep.interviewParams.skills,
          hasSoftSkills: !!currentStep.interviewParams.softSkills,
          passThreshold: currentStep.passThreshold
        });

        // Build interview config from current step params
        const dynamicConfig = buildInterviewConfigFromURL({
          type: currentStep.stepType,
          ...currentStep.interviewParams,
          // 🔥 Pass all pipeline-specific fields
          skills: currentStep.interviewParams.skills,
          categories: currentStep.interviewParams.categories,
          assessmentLevel: currentStep.interviewParams.assessmentLevel,
          passThreshold: currentStep.interviewParams.passThreshold || currentStep.passThreshold,
          softSkills: currentStep.interviewParams.softSkills
        } as any);

        setInterviewConfig(dynamicConfig);
        setCandidateProgress(progressData.progress);
        setCurrentPipelineStep(currentStep.stepNumber);

        // Store for interview_ended handler
        localStorage.setItem('interview_jobId', jobId);
        localStorage.setItem('interview_stepId', currentStep.stepId);
        localStorage.setItem('interview_stepNumber', currentStep.stepNumber.toString());
        localStorage.setItem('interview_passThreshold', (currentStep.passThreshold || 70).toString());
        localStorage.setItem('interview_source', 'pipeline');

        console.log('✅ Pipeline interview configured');

      } else {
        // Regular job (not pipeline) - use existing logic
        console.log('📋 Regular interview - fetching standard config...');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}post/interview-config/${jobId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error from interview-config endpoint:', errorData);

          // Check if it's a pipeline job error
          if (errorData.isPipeline) {
            throw new Error('This is a pipeline job - please refresh the page. The interview configuration is being loaded from the pipeline steps.');
          }

          throw new Error(`Failed to fetch job config: ${errorData.message || errorData.error || response.statusText}`);
        }

        const config = await response.json();
        console.log('✅ Fetched standard interview config');

        setInterviewConfig(config);

        // Store jobId for saving interview results later
        localStorage.setItem('interview_jobId', jobId);
        localStorage.setItem('interview_type', 'hr');
      }

      setPipelineLoading(false);

    } catch (error) {
      console.error('❌ Error fetching job interview config:', error);
      setPipelineLoading(false);
      showNotification('Failed to load interview configuration', 'error');

      // Fallback to default HR config
      const defaultConfig = buildInterviewConfigFromURL({ type: 'hr' });
      setInterviewConfig(defaultConfig);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    // 🔥 SIMPLIFIED: Only jobId is needed - everything else from database!
    const { jobId } = router.query;

    if (jobId && typeof jobId === 'string') {
      console.log('🎯 Job-based interview detected, jobId:', jobId);
      fetchJobInterviewConfig(jobId);  // No more stepNumber or source params!
      return;
    }

    // Existing: Build config from URL params
    const urlParams: URLParams = {
      type: router.query.type as any,
      skill: router.query.skill as string,
      proficiency: router.query.proficiency as string,
      category: router.query.category as string,
      company: router.query.company as string,
      role: router.query.role as string,
      language: router.query.language as string,
      difficulty: router.query.difficulty as string,
      duration: router.query.duration as string,
    };

    console.log('📋 Building interview config from URL params:', urlParams);

    // Only rebuild config if we have URL params (skip on initial default load)
    if (urlParams.type || urlParams.skill) {
      const dynamicConfig = buildInterviewConfigFromURL(urlParams);
      console.log('✅ Generated dynamic interview config:', dynamicConfig);
      setInterviewConfig(dynamicConfig);

      // Clear old values first, then store new skill information for results page
      localStorage.removeItem('interview_type');
      localStorage.removeItem('interview_skill');
      localStorage.removeItem('interview_category');
      localStorage.removeItem('interview_proficiency');
      localStorage.removeItem('interview_role');
      localStorage.removeItem('interview_jobId');

      // Store type (technical, soft, onboarding, etc.)
      if (urlParams.type) {
        localStorage.setItem('interview_type', urlParams.type);
        console.log('💾 Stored type in localStorage:', urlParams.type);
      }
      if (urlParams.skill) {
        localStorage.setItem('interview_skill', urlParams.skill);
        console.log('💾 Stored skill in localStorage:', urlParams.skill);
      }
      if (urlParams.category) {
        localStorage.setItem('interview_category', urlParams.category);
        console.log('💾 Stored category in localStorage:', urlParams.category);
      }
      if (urlParams.proficiency) {
        localStorage.setItem('interview_proficiency', urlParams.proficiency);
        console.log('💾 Stored proficiency in localStorage:', urlParams.proficiency);
      }
      if (urlParams.role) {
        localStorage.setItem('interview_role', urlParams.role);
        console.log('💾 Stored role in localStorage:', urlParams.role);
      }
    } else {
      console.log('ℹ️  No URL params detected, using default HR interview config');
    }
  }, [router.isReady, router.query]);

  // Security States
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);

  // Generate temporary token for Assembly AI streaming
  const generateStreamingToken = async (): Promise<string> => {
    console.log('🔑 [INIT-1] Requesting AssemblyAI V3 temporary token...');

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate_token' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [INIT-1-FAIL] Token generation failed:', response.status, errorText);
        throw new Error(`Failed to generate streaming token: ${response.status} - ${errorText}`);
      }

      const { token } = await response.json();
      console.log('✅ [INIT-1-SUCCESS] Token received, length:', token?.length || 0);
      return token;
    } catch (error) {
      console.error('❌ [INIT-1-ERROR] Exception during token generation:', error);
      throw error;
    }
  };

  // Extract technical keywords for word boost
  const extractTechnicalKeywords = (config: InterviewConfig): string[] => {
    const baseKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift',
      'React', 'Angular', 'Vue', 'Node', 'Express', 'Next', 'Django', 'Flask', 'Spring',
      'API', 'REST', 'GraphQL', 'WebSocket', 'microservices', 'monolith',
      'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
      'AWS', 'Azure', 'GCP', 'cloud', 'serverless', 'Lambda',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB',
      'algorithm', 'data structure', 'design pattern', 'SOLID', 'DRY',
      'frontend', 'backend', 'fullstack', 'DevOps', 'SRE',
      'authentication', 'authorization', 'OAuth', 'JWT', 'session',
      'testing', 'unit test', 'integration test', 'TDD', 'BDD',
      'Agile', 'Scrum', 'Kanban', 'sprint', 'standup'
    ];

    // Add job-specific keywords from interview config
    const contextText = [
      config.testReason,
      config.context.targetRole,
      config.context.targetCompany
    ].filter(Boolean).join(' ');

    if (contextText) {
      const customKeywords = contextText
        .split(/\s+/)
        .filter((word: string) => word.length > 4 && word.length < 20)
        .slice(0, 20);
      return [...baseKeywords, ...customKeywords].slice(0, 100);
    }

    return baseKeywords.slice(0, 100);
  };

  // Get optimal turn detection config for AssemblyAI V3 based on question context
  const getTurnDetectionConfig = (questionType: string = 'general') => {
    // Quick responses (yes/no, simple questions) - CONSERVATIVE to prevent interruptions
    if (questionType === 'quick_response' || questionType === 'confirmation') {
      return {
        end_of_turn_confidence_threshold: 0.7,  // Increased from 0.5 to reduce false positives
        min_end_of_turn_silence_when_confident: 400,  // Increased from 200ms to allow thinking
        max_turn_silence: 2500,  // Increased from 1.5s - allow pauses even for short answers
      };
    }

    // Technical deep-dive (longer explanations expected) - VERY CONSERVATIVE turn detection
    if (questionType === 'technical' || questionType === 'system_design' || questionType === 'coding') {
      return {
        end_of_turn_confidence_threshold: 0.85,  // Increased from 0.8 for more certainty
        min_end_of_turn_silence_when_confident: 900,  // Increased from 600ms for technical thinking pauses
        max_turn_silence: 10000,  // Increased from 5s to 10s - allow very long pauses for technical thinking
      };
    }

    // Behavioral/storytelling (natural pauses in stories) - MORE CONSERVATIVE
    if (questionType === 'behavioral' || questionType === 'experience') {
      return {
        end_of_turn_confidence_threshold: 0.75,  // Increased from 0.65
        min_end_of_turn_silence_when_confident: 700,  // Increased from 500ms - stories have pauses
        max_turn_silence: 8000,  // Increased from 4s to 8s - allow longer narrative thinking time
      };
    }

    // Default VERY CONSERVATIVE settings to prevent interruptions during natural pauses
    return {
      end_of_turn_confidence_threshold: 0.78,  // Increased from 0.7 to reduce false turn detections
      min_end_of_turn_silence_when_confident: 800,  // Increased from 500ms - more buffer before declaring turn end
      max_turn_silence: 8000,  // Increased from 4.5s to 8s - allow much longer pauses without triggering turn detection
    };
  };

  // Setup Assembly AI Universal-Streaming with SDK
  const setupStreamingTranscription = async (stream: MediaStream) => {
    try {
      console.log('🔧 [INIT-B] Starting AssemblyAI V3 streaming setup...');
      setIsConnecting(true);
      mediaStreamRef.current = stream;

      // Generate secure temporary token (server-side API call)
      const tempToken = await generateStreamingToken();

      // Create AssemblyAI client (dummy API key needed for client initialization)
      // Real auth happens via token parameter in transcriber()
      console.log('🔧 [INIT-B-2] Creating AssemblyAI client...');
      const client = new AssemblyAI({
        apiKey: 'dummy' // Required by SDK, but not used (token-based auth in transcriber)
      });
      console.log('✅ [INIT-B-2] AssemblyAI client created');

      // Reuse existing audio context from initializeAudio() to avoid conflicts
      // If not available, create new one (shouldn't happen in normal flow)
      console.log('🔊 [INIT-B-3] Setting up audio context...');
      const isReusingContext = !!audioContextRef.current;
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      if (isReusingContext) {
        console.log('✅ [INIT-B-3] REUSING existing AudioContext (correct!)');
        console.log('   - Context state:', audioContext.state);
        console.log('   - Sample rate:', audioContext.sampleRate);
      } else {
        console.log('⚠️ [INIT-B-3] Creating NEW AudioContext (unexpected - may cause conflicts)');
        audioContextRef.current = audioContext;
      }

      console.log('🎚️ [INIT-B-4] Creating audio processing chain...');
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      console.log('✅ [INIT-B-4] Audio processing chain created');
      console.log('   - Buffer size:', 4096);
      console.log('   - Input channels:', 1);
      console.log('   - Output channels:', 1);

      // Get V3 turn detection config based on question type
      console.log('⚙️ [INIT-B-5] Configuring turn detection...');
      const turnDetectionConfig = getTurnDetectionConfig(currentMessage?.type || 'general');
      console.log('   - Turn detection config:', turnDetectionConfig);

      // CRITICAL: Use browser's ACTUAL sample rate, not hardcoded value
      // Browser AudioContext often defaults to 48000 Hz, not 16000 Hz
      const actualSampleRate = audioContextRef.current?.sampleRate || 16000;
      console.log('⚠️ [INIT-B-5.5] CRITICAL - Sample rate configuration:');
      console.log(`   - Browser AudioContext rate: ${audioContextRef.current?.sampleRate || 'unknown'} Hz`);
      console.log(`   - AssemblyAI will receive: ${actualSampleRate} Hz`);
      console.log('   - ⚠️ These MUST match or speech detection will fail!');

      // Configure STREAMING transcriber (V3 API) for advanced turn detection
      console.log('📡 [INIT-B-6] Creating STREAMING transcriber (V3 API)...');
      console.log('   - API: client.streaming (V3)');
      console.log('   - Auto endpoint: wss://streaming.assemblyai.com/v3/ws');
      console.log(`   - Sample rate: ${actualSampleRate} Hz (ACTUAL browser rate)`);
      console.log('   - Encoding: pcm_s16le');

      const transcriber = client.streaming.transcriber({
        token: tempToken,
        // No realtimeUrl needed - streaming uses v3 endpoint automatically
        sampleRate: actualSampleRate, // Use ACTUAL browser sample rate, not hardcoded 16000
        encoding: 'pcm_s16le',

        // Accuracy improvements - streaming uses keytermsPrompt instead of wordBoost
        keytermsPrompt: extractTechnicalKeywords(interviewConfig),

        // V3 Turn Detection parameters (native to streaming API)
        endOfTurnConfidenceThreshold: turnDetectionConfig.end_of_turn_confidence_threshold,
        minEndOfTurnSilenceWhenConfident: turnDetectionConfig.min_end_of_turn_silence_when_confident,
        maxTurnSilence: turnDetectionConfig.max_turn_silence,
      });

      transcriberRef.current = transcriber;
      console.log('✅ [INIT-B-6] Transcriber created and stored in ref');

      console.log('📎 [INIT-B-7] Attaching event handlers...');

      // 🎯 Handle turn events from V3 streaming API
      // Streaming API uses 'turn' events for both partial and final transcripts
      transcriber.on('turn', (turn: any) => {
        const text = turn.transcript?.trim();
        if (!text) return;

        console.log('📝 [TURN] Turn event received:');
        console.log('   - Text:', text.slice(0, 100));
        console.log('   - End of turn:', turn.end_of_turn);
        console.log('   - Confidence:', turn.end_of_turn_confidence);

        // Track speaking start time on first partial transcript
        // Use ref to avoid React state race condition
        if (!speakingStartTimeRef.current) {
          const now = Date.now();
          setSpeakingStartTime(now);
          speakingStartTimeRef.current = now; // Primary source of truth
          // Cancel reading time immediately when user starts speaking
          setQuestionReadingTime(null);
          setIsInReadingTime(false);
          console.log('🎤 Speaking started - reading time cancelled');
        }
        setLastSpeakingTime(Date.now());

        // Check if speaking too long (3 minutes max per response)
        const MAX_SPEAKING_DURATION = 180000; // 3 minutes
        if (speakingStartTimeRef.current) {
          const currentSpeakingDuration = Date.now() - speakingStartTimeRef.current;
          if (currentSpeakingDuration > MAX_SPEAKING_DURATION) {
            console.warn(`⏱️  Speaking too long: ${Math.round(currentSpeakingDuration / 1000)}s - sending accumulated answer + interrupt`);

            // First, send any accumulated answer
            if (accumulatedTurnsRef.current.length > 0) {
              console.log(`📤 Sending ${accumulatedTurnsRef.current.length} accumulated turns before interrupt`);
              sendAccumulatedAnswer();
            }

            // Then send event to backend to politely interrupt
            if (socketRef.current) {
              socketRef.current.emit('speaking_too_long', {
                duration: currentSpeakingDuration
              });
            }

            // Reset speaking timer to avoid multiple interrupts
            speakingStartTimeRef.current = null;
            setSpeakingStartTime(null);
            return; // Backend will handle moving to next question
          }
        }

        // Update UI with current transcript (partial or final)
        setCurrentTranscript(text.slice(-200));
        setSpeechPhase('speaking');
        setAgentState('waiting');  // Keep in waiting while speaking
        setAgentMessage('Listening to your answer...');
        addTranscriptDebugLog(`📝 Partial: "${text.slice(0, 50)}..."`);

        // Only process as final when end_of_turn is true
        if (turn.end_of_turn) {
          const finalText = text;
          const now = Date.now();
          // Use ref for accurate duration calculation (avoids React state race condition)
          const speakingDuration = speakingStartTimeRef.current ? now - speakingStartTimeRef.current : 0;

          console.log('🎯 [TURN-COMPLETE] End of turn detected!');
          console.log('   - Final text length:', finalText.length);
          console.log('   - Confidence:', turn.end_of_turn_confidence);
          console.log('   - Speaking duration:', speakingDuration, 'ms');
          addTranscriptDebugLog(`✅ Turn complete: conf=${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

          // Check minimum speaking duration to prevent premature turn detection
          if (speakingDuration < minimumSpeakingDuration) {
            console.warn('⚠️ Speaking duration too short, ignoring turn:', speakingDuration, 'ms');
            addTranscriptDebugLog(`⏱️ Too short: ${speakingDuration}ms < ${minimumSpeakingDuration}ms`);
            return; // Don't process, wait for more speech
          }

          // Filter VERY low-confidence turns with RECOVERY mechanism
          // Lowered from 60% to 20% because AssemblyAI often has correct text despite lower confidence
          if (turn.end_of_turn_confidence < 0.2) {
            console.warn('⚠️ Very low confidence turn detected:', turn.end_of_turn_confidence);
            addTranscriptDebugLog(`⚠️ Very low confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);

            // RECOVERY: Keep state to preserve speaking duration for next attempt
            // Don't reset speakingStartTime - let it accumulate across low confidence turns
            setAgentState('waiting');
            setAgentMessage('Could not clearly hear you. Please continue speaking...');

            showNotification('Speech very unclear - please speak more clearly', 'warning');
            // Don't return immediately - allow accumulation for retry
            setAccumulatedTranscript(finalText);
            return;
          }

          // Log confidence for monitoring (even if accepted)
          if (turn.end_of_turn_confidence < 0.6) {
            console.log(`ℹ️ Accepted turn with moderate confidence: ${(turn.end_of_turn_confidence * 100).toFixed(1)}%`);
            addTranscriptDebugLog(`✓ Accepted: ${(turn.end_of_turn_confidence * 100).toFixed(1)}% confidence`);
          }

          // Prevent duplicate processing
          if (finalTranscriptSent) {
            console.log('⚠️ [TURN-SKIP] Already processed this turn');
            return;
          }

          // Check if in reading time
          const isInReadingTime = questionReadingTime && (now - questionReadingTime < readingTimeBuffer);

          if (isInReadingTime) {
            console.log('📖 Still in reading time, transcript saved but not sent');
            setAccumulatedTranscript(finalText);
            setCurrentTranscript(finalText.slice(-200));
            setAgentState('waiting');
            setAgentMessage(`Reading time: ${Math.ceil((readingTimeBuffer - (now - questionReadingTime)) / 1000)}s remaining`);
            setSpeechPhase('reading');
            return;
          }

          // ========== SIMPLIFIED ACCUMULATION LOGIC ==========
          // Just accumulate turns silently - NO TIMERS
          // Silence detection (20s) will trigger sending when user truly stops
          console.log('✅ [ACCUMULATION] Turn complete - adding to accumulation buffer');
          console.log(`   - Current buffer size: ${accumulatedTurns.length} turns`);
          console.log(`   - This turn length: ${finalText.length} chars`);

          // Add this turn to the accumulation buffer
          const newTurns = [...accumulatedTurns, finalText];
          setAccumulatedTurns(newTurns); // For UI
          accumulatedTurnsRef.current = newTurns; // For closure access
          setLastTurnTime(now);
          setAccumulatedTranscript(finalText);
          setCurrentTranscript(finalText.slice(-200));

          // Visual feedback: Stay in waiting state (user may continue)
          setAgentState('waiting');
          setAgentMessage('Listening to your answer...');
          setSpeechPhase('paused');

          addTranscriptDebugLog(`📥 Turn ${accumulatedTurns.length + 1} accumulated (${finalText.length} chars)`);

          // Check if we've hit the maximum accumulated turns (force send)
          if (accumulatedTurns.length + 1 >= MAX_ACCUMULATED_TURNS) {
            console.warn(`⚠️  Max accumulated turns reached (${MAX_ACCUMULATED_TURNS}) - forcing send`);
            addTranscriptDebugLog(`⚠️ Max turns reached - forcing send`);
            sendAccumulatedAnswer();
            return;
          }

          // NO TIMER - Let silence detection handle sending after 20s of true silence
        }
      });
      console.log('   ✓ turn handler attached');

      // Handle connection events
      let audioPacketsSent = 0;
      let lastLogTime = Date.now();

      transcriber.on('open', ({ id: aaiSessionId, expires_at }: any) => {
        console.log('🎉 [CONNECTED] AssemblyAI Streaming WebSocket connected!');
        console.log('   - Session ID:', aaiSessionId);
        console.log('   - Expires at:', new Date(expires_at * 1000).toISOString());
        console.log('   - Endpoint: V3 streaming (wss://streaming.assemblyai.com/v3/ws)');
        setIsConnecting(false);

        // Connect audio processing
        console.log('🔗 [AUDIO-CHAIN] Connecting audio processing chain...');
        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log('✅ [AUDIO-CHAIN] Audio chain connected');

        processor.onaudioprocess = (event) => {
          if (transcriber) {
            const inputBuffer = event.inputBuffer.getChannelData(0);

            // Convert float32 to int16
            const int16Buffer = new Int16Array(inputBuffer.length);
            for (let i = 0; i < inputBuffer.length; i++) {
              int16Buffer[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32767));
            }

            transcriber.sendAudio(int16Buffer.buffer);
            audioPacketsSent++;

            // Log audio streaming status every 5 seconds
            const now = Date.now();
            if (now - lastLogTime > 5000) {
              console.log(`📡 [AUDIO-STREAM] Streaming active - ${audioPacketsSent} packets sent`);
              lastLogTime = now;
            }
          }
        };

        console.log('🎧 [AUDIO-PROCESS] Audio processor started - sending data to AssemblyAI');
        addTranscriptDebugLog('🎤 Streaming started');
      });
      console.log('   ✓ open handler attached');

      transcriber.on('error', (error: any) => {
        console.error('❌ [ERROR] AssemblyAI Error:', error);
        console.error('   - Message:', error.message || 'No message');
        console.error('   - Type:', error.type || 'Unknown');
        setIsConnecting(false);
        showNotification('Speech recognition error. Please try again.', 'error');
        addTranscriptDebugLog(`❌ Error: ${error.message || error}`);
      });
      console.log('   ✓ error handler attached');

      transcriber.on('close', () => {
        console.log('🔌 [CLOSED] AssemblyAI connection closed');
        console.log('   - Total packets sent:', audioPacketsSent);
        setIsConnecting(false);
        addTranscriptDebugLog('🔌 Streaming stopped');
      });
      console.log('   ✓ close handler attached');

      console.log('✅ [INIT-B-7] All event handlers attached');

      // Start transcriber
      console.log('🚀 [INIT-B-8] Connecting to AssemblyAI WebSocket...');
      await transcriber.connect();
      console.log('✅ [INIT-B-8] Connection initiated (waiting for "open" event)');

    } catch (error) {
      console.error('❌ [INIT-B-ERROR] Setup failed at some step:', error);
      console.error('   - Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('   - Error message:', error instanceof Error ? error.message : String(error));
      console.error('   - Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setIsConnecting(false);
      showNotification('Failed to setup speech recognition', 'error');
      addTranscriptDebugLog(`❌ Setup failed: ${(error as Error).message}`);
      throw error;
    }

    console.log('✅ [INIT-B-COMPLETE] AssemblyAI V3 setup complete!');
  };

  // Cleanup Assembly AI connections
  const cleanupAssemblyAI = async () => {
    try {
      // Close SDK transcriber
      if (transcriberRef.current) {
        try {
          await transcriberRef.current.close();
          console.log('✅ AssemblyAI transcriber closed');
        } catch (error) {
          console.error('Error closing transcriber:', error);
        }
        transcriberRef.current = null;
      }

      // Disconnect audio processor
      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting processor:', error);
        }
        processorRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
        audioContextRef.current = null;
      }

      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      // Clean up old WebSocket ref (if any)
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsConnecting(false);
      console.log('🧹 AssemblyAI cleanup complete');
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

    console.log('🔌 Initializing WebSocket connection...');
    connectionInitialized.current = true;

    // Use WSL IP for Windows to WSL communication
    // Remove trailing slash to prevent double slash in namespace path
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.23.207.114:5000').replace(/\/$/, '');
    console.log('🔗 Attempting to connect to:', `${baseUrl}/interview`);
    console.log('🔗 Socket.IO will connect to namespace: /interview');

    const socket = io(`${baseUrl}/interview`, {
      path: '/socket.io/', // Explicit path to match backend
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: false,
      autoConnect: true,
      withCredentials: false, // Disable credentials to match backend cookie: false
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
      sessionIdRef.current = data.sessionId; // Sync ref for event handlers
      setInterviewStatus('active');
      setDuration(data.config.duration * 60 * 1000); // Convert to milliseconds

      // Start elapsed time timer
      setElapsedTime(0);
      setTimeWarning(false);

      // Clear any existing timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Start new timer
      const maxMinutes = data.config.duration || 20;
      const twoMinuteThreshold = (maxMinutes - 2) * 60; // Convert to seconds
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;

          // Show warning exactly when crossing 2 minutes remaining threshold
          if (newTime === twoMinuteThreshold && !timeWarning) {
            setTimeWarning(true);
            showNotification('2 minutes remaining', 'warning');
          }

          return newTime;
        });
      }, 1000);

      console.log(`⏱️ Interview timer started (max: ${maxMinutes} minutes)`);

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

    socket.on('interview_ended', async (data) => {
      console.log('🏁 Interview ended:', data);
      setInterviewStatus('ended');
      setIsRecording(false);

      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      showNotification('Interview completed!', 'success');

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

      // 🔥 NEW: Update pipeline progress with pass/fail logic
      const candidateId = profile?._id || authUser?._id;
      if (isPipelineJob && candidateId) {
        try {
          const token = Cookies.get('api_token');
          const jobId = localStorage.getItem('interview_jobId');
          const stepId = localStorage.getItem('interview_stepId');
          const passThreshold = parseInt(localStorage.getItem('interview_passThreshold') || '70');

          // Extract final score from analytics/report
          const finalScore = data.finalReport?.overallScore ||
                            data.analytics?.overallScore ||
                            data.analytics?.totalScore ||
                            0;

          // 🔥 Calculate pass/fail
          const passed = finalScore >= passThreshold;

          console.log(`📊 Interview Result: ${finalScore}% (threshold: ${passThreshold}%) - ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);

          if (jobId && stepId && data.sessionId) {
            console.log('📊 Updating pipeline step progress...');

            // Update step status with pass/fail and score
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
                  interviewDetailsId: data.sessionId,
                  status: 'done',
                  passed: passed,
                  finalScore: finalScore
                })
              }
            );

            const updateResult = await updateResponse.json();
            console.log('✅ Pipeline step status updated:', updateResult);

            if (passed) {
              // Try to move to next step
              console.log('✅ Step passed - checking for next step...');

              const nextStepResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}api/pipeline-interview/progress/next-step`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    candidateId: candidateId,
                    jobId
                  })
                }
              );

              const nextStepData = await nextStepResponse.json();

              if (nextStepData.hasNextStep) {
                console.log(`✅ Next step available: ${nextStepData.nextStepNumber}`);
                localStorage.setItem('pipeline_has_next_step', 'true');
                localStorage.setItem('pipeline_next_step', nextStepData.nextStepNumber.toString());
              } else {
                console.log('🎉 Pipeline complete!');
                localStorage.setItem('pipeline_has_next_step', 'false');
                localStorage.setItem('pipeline_complete', 'true');
              }
            } else {
              // Failed - cannot continue
              console.log('❌ Step failed - pipeline cannot continue');
              localStorage.setItem('pipeline_has_next_step', 'false');
              localStorage.setItem('pipeline_failed', 'true');
              localStorage.setItem('pipeline_failed_score', finalScore.toString());
              localStorage.setItem('pipeline_required_score', passThreshold.toString());
            }
          }
        } catch (error) {
          console.error('❌ Error updating pipeline progress:', error);
          // Don't block the user - just log the error
        }
      }

      // Don't auto-redirect - let user click "View Results" button
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

        if (error instanceof DOMException) {
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
        } else {
          setCameraStatus('error');
          setCameraError('An unknown error occurred');
          showNotification('Camera access error', 'error');
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

  // Reset state when new question arrives (AssemblyAI turn detection handles silence)
  useEffect(() => {
    if (currentMessage) {
      // Reset transcript state for new question
      setAccumulatedTranscript('');
      setCurrentTranscript('');
      setFinalTranscriptSent(false);
      setAgentState('waiting');
      setAgentMessage('Listening to your answer...');
      setSpeechPhase('reading');

      // Reset speaking timers for new question
      setSpeakingStartTime(null);
      setLastSpeakingTime(null);
      speakingStartTimeRef.current = null;

      // Reset silence detection for new question
      setSilenceStartTime(null);
      setIsTrueSilence(false);
      setCurrentSilenceDuration(0);

      // Reset accumulation buffer for new question
      setAccumulatedTurns([]);
      accumulatedTurnsRef.current = [];
      setLastTurnTime(null);

      addTranscriptDebugLog(`🆕 New question received, state reset`);
    }
  }, [currentMessage]);

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
      const candidateId = authUser?.email || 'anonymous';
      console.log('Testiiiiiiiiiiiiiiiiiiiiiiiiiing', candidateId);
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
      console.log('🎤 [INIT-A] Starting audio initialization...');
      console.log('🎤 [INIT-A-1] Requesting microphone access (getUserMedia)...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      console.log('✅ [INIT-A-1] Microphone access granted');
      console.log('   - Audio tracks:', stream.getAudioTracks().length);
      console.log('   - Track label:', stream.getAudioTracks()[0]?.label || 'unknown');
      console.log('   - Track enabled:', stream.getAudioTracks()[0]?.enabled);

      audioStreamRef.current = stream;

      // Setup audio context for voice activity detection
      console.log('🔊 [INIT-A-2] Creating AudioContext for voice activity detection...');
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      console.log('✅ [INIT-A-2] AudioContext created');
      console.log('   - Sample rate:', audioContext.sampleRate);
      console.log('   - State:', audioContext.state);

      console.log('📊 [INIT-A-3] Setting up audio analyser...');
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      console.log('✅ [INIT-A-3] Audio analyser connected');

      setIsRecording(true);
      console.log('🔍 [INIT-A-4] Starting voice activity detection...');
      startVoiceActivityDetection();

      // Initialize Assembly AI transcription with the same audio stream
      console.log('🚀 [INIT-A-5] Initializing AssemblyAI V3 transcription...');
      try {
        await setupStreamingTranscription(stream);
        console.log('✅ [INIT-A-5] AssemblyAI transcription initialized successfully');
      } catch (transcriptionError) {
        console.error('❌ [INIT-A-5-FAIL] AssemblyAI setup failed:', transcriptionError);
        showNotification('Transcription service unavailable, but interview can continue', 'warning');
      }

      console.log('✅ [INIT-A-COMPLETE] Audio initialization complete');

    } catch (error) {
      console.error('❌ [INIT-A-ERROR] Failed to initialize audio:', error);
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

  // Send accumulated answer to backend (after waiting for continuation)
  const sendAccumulatedAnswer = () => {
    const turns = accumulatedTurnsRef.current; // Always get current value from ref

    if (turns.length === 0) {
      console.log('⚠️ No accumulated turns to send');
      return;
    }

    // Combine all accumulated turns into one complete answer
    const completeAnswer = turns.join(' ');

    console.log(`📤 [ACCUMULATION] Sending accumulated answer:`);
    console.log(`   - Turn count: ${turns.length}`);
    console.log(`   - Total length: ${completeAnswer.length} chars`);
    console.log(`   - Content preview: "${completeAnswer.substring(0, 100)}..."`);

    // NOW send to backend (only once with complete answer)
    if (socketRef.current?.connected && sessionIdRef.current) {
      setFinalTranscriptSent(true);

      socketRef.current.emit('candidate_response', {
        sessionId: sessionIdRef.current,
        transcript: completeAnswer,
        timestamp: new Date().toISOString(),
        isFinal: true,
        turnCount: turns.length,
        speakingDuration: speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0,
        accumulated: true
      });

      // Update UI to show AI is processing the complete answer
      setAgentState('thinking');
      setAgentMessage('AI is analyzing your complete response...');
      setSpeechPhase('thinking');

      addTranscriptDebugLog(`📤 Sent ${turns.length} accumulated turns (${completeAnswer.length} chars)`);

      // Clear accumulated turns (both state and ref)
      setAccumulatedTurns([]);
      accumulatedTurnsRef.current = [];
      setLastTurnTime(null);
      setSpeakingStartTime(null);
      speakingStartTimeRef.current = null;

      // Clear current transcript after a delay
      setTimeout(() => {
        setCurrentTranscript('');
      }, 1000);
    }
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

    // Reset speaking timers
    setSpeakingStartTime(null);
    setLastSpeakingTime(null);
    speakingStartTimeRef.current = null;

    // Clear accumulation buffer
    setAccumulatedTurns([]);
    accumulatedTurnsRef.current = [];
    setLastTurnTime(null);

    // Clear any pending debounce timers
    if (transcriptDebounceRef.current) {
      clearTimeout(transcriptDebounceRef.current);
      transcriptDebounceRef.current = null;
    }

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
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

    // REMOVED: Automatic silence detection - using manual "Next" button only for MVP
    // const detectVoiceActivity = () => { ... }
    // detectVoiceActivity();

    // Manual submission only - user clicks "Next Question" button when done speaking
  };

  // REMOVED: Automatic silence detection - using manual "Next" button only for MVP
  // const handleSilenceDetected = (silenceDuration: number) => { ... }

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

    // Store session ID for results page
    if (sessionId) {
      localStorage.setItem('last_interview_id', sessionId);
    }
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
    // setSecurityViolationCount((prev) => {
    //   const next = prev + 1;
    //   if (next === 1) {
    //     // First violation: show intelligent popup
    //     setShowFirstViolationModal(true);
    //   } else if (next === 2) {
    //     // Second violation: redirect and show modal
    //     setShowSecurityModal(true);
    //     endInterview();
    //     setTimeout(() => {
    //       router.push('/dashboard/candidate');
    //     }, 2000); // Give time for modal to show
    //   }
    //   return next;
    // });
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Pipeline Loading Modal */}
      <Dialog open={pipelineLoading} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Loading Your Interview Step...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we prepare your interview
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Step Blocked Modal */}
      <Dialog open={showBlockedModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          <Typography variant="h6">Wrong Step</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1">
            You will be redirected to your current step automatically.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Failed Previous Step Modal */}
      <Dialog
        open={showFailedModal}
        maxWidth="sm"
        fullWidth
        onClose={() => router.push('/dashboard')}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon />
          <Typography variant="h6">Cannot Continue</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1" paragraph>
            Unfortunately, you did not pass a previous step in this pipeline.
            The interview cannot be started.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact the company if you believe this is an error.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/dashboard')}
            fullWidth
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

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
                {candidateProgress.steps.filter((s: any) => s.status === 'done').length} / {candidateProgress.steps.length} completed
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(candidateProgress.steps.filter((s: any) => s.status === 'done').length / candidateProgress.steps.length) * 100}
                sx={{ width: 100, ml: 1 }}
              />
            </Box>
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

            {/* Manual Next Button - Always clickable when interview active */}
            {interviewStatus === 'active' && !isInReadingTime && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                  {agentState === 'thinking' || agentState === 'processing'
                    ? 'AI PROCESSING'
                    : agentState === 'waiting' && accumulatedTurns.length > 0
                    ? 'SUBMIT ANSWER'
                    : 'ACTIONS'
                  }
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    console.log('🎯 [MANUAL] User clicked Next Question button');
                    sendAccumulatedAnswer();
                  }}
                  disabled={agentState === 'thinking' || agentState === 'processing'}
                  sx={{
                    background: agentState === 'thinking' || agentState === 'processing'
                      ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                      : accumulatedTurns.length > 0
                      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 1.5,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: agentState === 'thinking' || agentState === 'processing'
                        ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                        : accumulatedTurns.length > 0
                        ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                        : 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                    '&:disabled': {
                      color: '#fff',
                      opacity: 0.7
                    }
                  }}
                >
                  {agentState === 'thinking'
                    ? '⏳ AI is Thinking...'
                    : agentState === 'processing'
                    ? '⚙️ Processing Your Answer...'
                    : agentState === 'waiting' && accumulatedTurns.length > 0
                    ? `✓ Submit Answer (${accumulatedTurns.length} ${accumulatedTurns.length === 1 ? 'turn' : 'turns'} recorded)`
                    : accumulatedTurns.length > 0
                    ? `Next Question (${accumulatedTurns.length} ${accumulatedTurns.length === 1 ? 'turn' : 'turns'} recorded)`
                    : isVoiceActive
                    ? '🎤 Speaking... Click when done'
                    : ' Next Question'
                  }
                </Button>
                <Typography variant="caption" sx={{
                  color: '#bbb',
                  textAlign: 'center',
                  display: 'block',
                  mt: 1,
                  fontSize: '0.7rem'
                }}>
                  {agentState === 'thinking'
                    ? 'Please wait while the AI prepares the next question'
                    : agentState === 'processing'
                    ? 'Your answer is being analyzed'
                    : agentState === 'waiting' && accumulatedTurns.length > 0
                    ? 'Click to submit your answer and continue'
                    : accumulatedTurns.length > 0
                    ? 'Click when you\'re done answering'
                    : isVoiceActive
                    ? 'Listening to your response...'
                    : 'Click to skip this question'
                  }
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 3 }}>
            {/* Overall Coverage */}
            <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 11px)' } }}>
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
            </Box>

            {/* AI Insights */}
            <Box sx={{ width: { xs: '100%', md: 'calc(66.666% - 11px)' } }}>
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
            </Box>

            {/* Coverage Areas Breakdown */}
            <Box sx={{ width: '100%' }}>
              <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#8310FF', fontWeight: 600, mb: 3 }}>
                    Competency Coverage Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {coverage?.areas && Object.entries(coverage.areas).map(([areaName, areaData]: [string, any]) => (
                      <Box key={areaName} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
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
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Real-time Recommendations */}
            {realTimeReport?.recommendations && realTimeReport.recommendations.length > 0 && (
              <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
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
              </Box>
            )}

            {/* Performance Trends */}
            {realTimeReport?.trends && realTimeReport.trends.length > 0 && (
              <Box sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
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
              </Box>
            )}

            {/* AI Decision History */}
            {interviewStatus === 'active' && (
              <Box sx={{ width: '100%' }}>
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
              </Box>
            )}
            </Box>
          )}
        </Paper>
      )}

      {/* Interview Container */}
      <Paper
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.5px',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {interviewConfig.interviewType === 'TECHNICAL_SKILL'
                ? `${interviewConfig.context.targetRole} Technical Interview`
                : interviewConfig.interviewType === 'SOFT_SKILL'
                ? 'Soft Skills Assessment'
                : interviewConfig.interviewType === 'SALARY_INTERVIEW'
                ? 'Salary Negotiation Interview'
                : interviewConfig.interviewType === 'PSYCHOTECHNIC'
                ? 'Psychotechnic Assessment'
                : 'HR Interview Simulation'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '1.1rem',
                fontWeight: 300
              }}
            >
              {interviewConfig.interviewType === 'TECHNICAL_SKILL'
                ? `Validate ${router.query.skill || 'technical'} expertise • ${interviewConfig.context.experienceLevel}`
                : interviewConfig.interviewType === 'SOFT_SKILL'
                ? `Assess ${router.query.skill || 'soft skill'} in ${router.query.category || 'general'} context • ${interviewConfig.context.experienceLevel}`
                : 'Intelligent Real-time Interview with AI'}
            </Typography>

            {/* Status Indicators */}
            <Box display="flex" justifyContent="center" gap={2} mt={3} flexWrap="wrap">
              <Chip
                icon={interviewStatus === 'active' ? <RecordVoiceOverIcon /> : <MicOffIcon />}
                label={interviewStatus === 'active' ? 'Active' : 'Inactive'}
                color={interviewStatus === 'active' ? 'success' : 'default'}
                variant="filled"
                sx={{
                  color: 'white',
                  bgcolor: interviewStatus === 'active' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 500
                }}
              />
              <Chip
                icon={isVoiceActive ? <MicIcon /> : <MicOffIcon />}
                label={isVoiceActive ? 'Speaking' : 'Listening'}
                color={isVoiceActive ? 'success' : 'default'}
                variant="filled"
                sx={{
                  color: 'white',
                  bgcolor: isVoiceActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 500
                }}
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
                variant="filled"
                sx={{
                  color: 'white',
                  bgcolor: cameraStatus === 'granted' ? 'rgba(76, 175, 80, 0.3)' :
                          cameraStatus === 'requesting' ? 'rgba(255, 152, 0, 0.3)' :
                          'rgba(244, 67, 54, 0.3)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 500
                }}
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
                  variant="filled"
                  sx={{
                    color: 'white',
                    bgcolor: agentState === 'thinking' ? 'rgba(33, 150, 243, 0.3)' :
                            agentState === 'waiting' ? 'rgba(255, 152, 0, 0.3)' :
                            agentState === 'processing' ? 'rgba(33, 150, 243, 0.3)' :
                            agentState === 'ready' ? 'rgba(76, 175, 80, 0.3)' :
                            'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    px: 2,
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Interview Content */}
        <Box sx={{ p: 5 }}>
          {interviewStatus === 'idle' && (
            <Box
              textAlign="center"
              py={6}
              sx={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                borderRadius: 3,
                border: '2px dashed rgba(102, 126, 234, 0.2)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <PlayArrowIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.8 }} />
              </Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  mb: 2
                }}
              >
                Ready to Start Your Interview?
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontSize: '1.1rem',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.7
                }}
              >
                This is an AI-powered interview simulation that adapts to your responses and provides real-time feedback.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={startInterview}
                disabled={!isHydrated || connectionStatus !== 'connected' || cameraStatus !== 'granted'}
                startIcon={<PlayArrowIcon />}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  },
                  '&:disabled': {
                    background: '#bdbdbd',
                    boxShadow: 'none'
                  }
                }}
              >
                Start Interview
              </Button>
              {(cameraStatus !== 'granted' && cameraStatus !== 'requesting') && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{
                    mt: 2,
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  ⚠️ Camera access required to start interview
                </Typography>
              )}
            </Box>
          )}

          {interviewStatus === 'active' && (
            <Box
              textAlign="center"
              py={8}
              sx={{
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(229, 57, 53, 0.03) 100%)',
                borderRadius: 3,
                border: '2px solid rgba(244, 67, 54, 0.15)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <StopIcon sx={{ fontSize: 60, color: '#f44336', opacity: 0.8 }} />
              </Box>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  mb: 4
                }}
              >
                Interview in Progress
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={endInterview}
                startIcon={<StopIcon />}
                color="error"
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  }
                }}
              >
                End Interview
              </Button>
            </Box>
          )}

          {interviewStatus === 'ended' && (
            <Box
              textAlign="center"
              py={8}
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(67, 160, 71, 0.03) 100%)',
                borderRadius: 3,
                border: '2px solid rgba(76, 175, 80, 0.15)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <AssessmentIcon sx={{ fontSize: 60, color: '#4caf50', opacity: 0.8 }} />
              </Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  mb: 2
                }}
              >
                Interview Completed!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontSize: '1.1rem' }}>
                Thank you for participating. Your responses have been recorded and analyzed.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/interview/results')}
                startIcon={<AssessmentIcon />}
                sx={{
                  px: 5,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  }
                }}
              >
                View Results
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

      {/* Fixed Timer at Bottom - Only show when interview is active */}
      {interviewStatus === 'active' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          <Chip
            icon={timeWarning ? <WarningIcon /> : <AccessTimeIcon />}
            label={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`}
            color={timeWarning ? 'warning' : 'default'}
            variant="filled"
            sx={{
              color: 'white',
              bgcolor: timeWarning ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              px: 3,
              py: 2.5,
              fontWeight: 600,
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          />
        </Box>
      )}
      </Container>
    </>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(IntelligentInterviewTest), {
  ssr: false
});
