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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Remove hardcoded questions
const NEXTJS_QUESTIONS: string[] = [];

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
  '@keyframes slideInFromTop': {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' },
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

// --- SpeechRecognition Types ---
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => any) | null;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

// Add back necessary interfaces
interface Question {
  id: string;
  text: string;

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

const Test = () => {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { id, stepId } = router.query;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [testedSkills, setTestedSkills] = useState<any[]>([]);
  const currentIndexRef = useRef(0);
  const [hasStartedTest, setHasStartedTest] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ [key: string]: string }>({});
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [questionHighlight, setQuestionHighlight] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);

  // Add new state for button timer
  const [nextButtonDisabled, setNextButtonDisabled] = useState(true);
  const [buttonTimer, setButtonTimer] = useState(2);
  const userRole = useSelector((state: RootState) => state.user.userType);
  const GREEN_MAIN = userRole === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF';

  // Add streaming state
  const [streamingToken, setStreamingToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const lastTranscriptTimeRef = useRef<number>(Date.now());
  const audioLevelRef = useRef<number>(0);
  const lastFinalTranscriptRef = useRef<string>(''); // Track last final transcript to prevent duplicates
  const transcriptCountRef = useRef<number>(0); // Track transcript count for rate limiting
  const lastTranscriptBatchTimeRef = useRef<number>(Date.now()); // Track batch time
  const websocketHealthCheckRef = useRef<NodeJS.Timeout | null>(null); // WebSocket health check interval
  const lastWebSocketActivityRef = useRef<number>(Date.now()); // Track last WS activity
  
  // Add question session ID to filter stale transcripts
  const questionSessionIdRef = useRef<number>(0);
  const isTransitioningRef = useRef(false);
  const isTimerTransitioning = useRef(false); // Prevent double timer transitions
  
  // Add sequence tracking for transcript ordering
  const transcriptSequenceRef = useRef<number>(0);
  const pendingUpdateRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>(''); // Track accumulated text for current question
  
  // Word-by-word streaming state
  const lastPartialWordsRef = useRef<string[]>([]);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Cleanup effect - close AssemblyAI session when leaving the page
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up interview session...');
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Stop audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Disconnect processor
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      
      // Stop audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      
      console.log('✅ Interview session cleaned up');
    };
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated && id) {
      const target = `/posts/${id}/interview${stepId ? `?stepId=${stepId}` : ''}`;
      router.push(`/signin?returnUrl=${encodeURIComponent(target)}`);
    }
  }, [isAuthenticated, id, stepId]);

  // Fetch questions when profile is complete
  useEffect(() => {
    // Check if stepId is missing
    if (isProfileComplete && !stepId && router.isReady) {
      console.error('❌ Missing stepId in URL');
      setError('Missing stepId parameter in URL. This interview requires a stepId to load questions.');
      setIsGenerating(false);
      return;
    }

    if (isProfileComplete && stepId) {
      const fetchQuestions = async () => {
        try {
          setIsGenerating(true);
          const token = Cookies.get('api_token');
          console.log('🔑 Token check:', { 
            exists: !!token, 
            length: token?.length,
            preview: token?.substring(0, 20) + '...'
          });

          if (!token) {
            console.log('❌ No token found, redirecting to signin');
            const target = `/posts/${id}/interview${stepId ? `?stepId=${stepId}` : ''}`;
            router.push(`/signin?returnUrl=${encodeURIComponent(target)}`);
            return;
          }

          console.log(`📥 Fetching questions for stepId: ${stepId}`);
          
          // Use the new recruitment step API endpoint
          const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}recruitementStep/generate-questions/${stepId}`;
          console.log('📡 Request URL:', url);
          console.log('📡 Request headers:', { Authorization: `Bearer ${token.substring(0, 20)}...` });
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 API Response status: ${response.status}`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.error || errorData.message || `Failed to fetch questions (${response.status})`);
          }

          const data: JobQuestionsResponse = await response.json();
          console.log('✅ Questions received:', data.questions?.length || 0);
          setTestedSkills(data.testedSkills || []);

          const formattedQuestions: Question[] = data.questions.map((question, index) => {
            // Handle case where requiredSkills might not be available
            const skillIndex = data.requiredSkills ? index % data.requiredSkills.length : 0;
            const skill = data.requiredSkills?.[skillIndex] || { name: 'General', level: 'Intermediate' };

            return {
              id: `q_${index + 1}`,
              text: question,
            };
          });

          setQuestions(formattedQuestions);
          setTranscriptions(
            formattedQuestions.reduce((acc: any, _: any, index: number) => ({
              ...acc,
              [index]: ''
            }), {})
          );
        } catch (error) {
          console.error('❌ Error fetching questions:', error);
          setError(`Failed to load questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Don't redirect - let user see the error
        } finally {
          setIsGenerating(false);
        }
      };

      fetchQuestions();
    }
  }, [isProfileComplete, stepId, router.isReady, id]);



  // Timer only runs when test has started
  useEffect(() => {
    if (!hasStartedTest) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Prevent double execution
          if (isTimerTransitioning.current) {
            return 120; // Already transitioning, just reset timer
          }
          
          isTimerTransitioning.current = true;
          
          // Use currentIndexRef to avoid stale closure
          setCurrent(c => {
            const nextQuestion = c + 1;
            if (nextQuestion < questions.length) {
              console.log(`⏱️ Timer finished - Moving from question ${c + 1} to ${nextQuestion + 1}`);
              // Reset the lock after a delay to allow next transition
              setTimeout(() => {
                isTimerTransitioning.current = false;
              }, 1000);
              return nextQuestion;
            } else {
              console.log('⏱️ Timer finished - All questions completed');
              stopRecording();
              saveTestResults();
              router.push(`/posts/${id}/report?postId=${id}${stepId ? `&stepId=${stepId}` : ''}`);
              return c;
            }
          });
          return 120; // Reset timer for next question
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      isTimerTransitioning.current = false;
    };
  }, [hasStartedTest, questions.length]);

  // Reset timer when question changes
  useEffect(() => {
    currentIndexRef.current = current;
    setTimeLeft(120); // Reset to 120 seconds (2 minutes)
    
    // Clear ALL transcript-related state IMMEDIATELY
    setCurrentTranscript('');
    lastFinalTranscriptRef.current = '';
    accumulatedTranscriptRef.current = '';
    lastPartialWordsRef.current = [];
    
    // Reset sequence tracking for new question
    transcriptSequenceRef.current = 0;
    pendingUpdateRef.current = false;
    
    // Session ID already incremented in handleNext, just log it
    const currentQuestionSession = questionSessionIdRef.current;
    
    console.log(`📋 Question ${current + 1} - Session ID: ${currentQuestionSession} - ALL transcript state cleared`);
    
    // Keep blocking transcripts during transition (already set in handleNext)
    isTransitioningRef.current = true;
    
    // Reset transcription connection when changing questions
    if (hasStartedTest && current > 0 && audioStreamRef.current) {
      console.log('🔄 Question changed - resetting transcription connection...');
      
      // Close existing WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Stop and disconnect audio processor
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Reconnect with fresh WebSocket after a brief delay
      setTimeout(async () => {
        if (audioStreamRef.current && isRecording) {
          try {
            await setupStreamingTranscription(audioStreamRef.current);
            console.log(`✅ Transcription reset - Now accepting session ${questionSessionIdRef.current}`);
            // Allow transcripts after successful reconnection
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 500);
          } catch (error) {
            console.error('❌ Failed to reset transcription:', error);
            isTransitioningRef.current = false;
          }
        }
      }, 300); // Small delay to ensure clean disconnection
    } else {
      // For first question, allow transcripts immediately
      isTransitioningRef.current = false;
    }
    
    // Trigger question highlight animation
    setQuestionHighlight(true);
    setTimeout(() => setQuestionHighlight(false), 600);
  }, [current]);

  // Initialize camera
  useEffect(() => {
    (async () => {
      try {
        console.log('🎥 Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
        console.log('✅ Camera access granted');
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('📹 Video metadata loaded, starting playback');
            videoRef.current?.play().then(() => {
              console.log('▶️ Video playing successfully');
            }).catch((err) => {
              console.error('❌ Video play error:', err);
            });
          };
        }
      } catch (e) {
        console.error('❌ Camera error:', e);
        alert('Camera access denied. Please enable camera permissions in your browser settings.');
      }
    })();
    return () => {
      console.log('🛑 Stopping camera stream');
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Generate temporary token for streaming
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

  // Setup streaming transcription
  const setupStreamingTranscription = async (stream: MediaStream) => {
    try {
      setIsConnecting(true);

      // Generate token
      const token = await generateStreamingToken();
      setStreamingToken(token);

      // Setup audio context with optimal settings for accent recognition
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // AssemblyAI's optimal sample rate
        latencyHint: 'interactive', // Prioritize low latency for real-time
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Use optimal buffer size for real-time streaming (4096 is best for AssemblyAI)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect WebSocket with enhanced accent recognition for all global accents
      const ws = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
      );
      wsRef.current = ws;
      
      // Track connection quality and accent detection
      let audioPacketsSent = 0;
      ws.addEventListener('open', () => {
        console.log('🌍 WebSocket connected - AssemblyAI ready with GLOBAL ACCENT RECOGNITION');
        console.log('🎯 Enhanced features enabled: Language detection, accent detection, punctuation, formatting, word boost');
        console.log('✨ Optimized for: American, British, Australian, Indian, African, European, Asian, and ALL non-native speakers');
        console.log('ℹ️ Session info: 16kHz audio, 4096 buffer size, real-time streaming with enhanced accent understanding');
      });

      ws.onopen = () => {
        console.log('🌍 Recording started - Capturing speech from ANY accent worldwide');
        console.log('🎯 AI will understand: American, British, Australian, Indian, African, European, Asian accents');
        setIsConnecting(false);
        lastWebSocketActivityRef.current = Date.now();

        // Start WebSocket health monitoring
        websocketHealthCheckRef.current = setInterval(() => {
          const timeSinceActivity = Date.now() - lastWebSocketActivityRef.current;
          
          // If no activity for 30 seconds and WebSocket is open, warn
          if (timeSinceActivity > 30000 && ws.readyState === WebSocket.OPEN) {
            console.warn('⚠️ WebSocket inactive for 30s - connection may be stale');
          }
          
          // If no activity for 60 seconds, attempt reconnection
          if (timeSinceActivity > 60000 && ws.readyState === WebSocket.OPEN && audioStreamRef.current) {
            console.error('❌ WebSocket inactive for 60s - forcing reconnection');
            ws.close();
            setTimeout(() => {
              if (audioStreamRef.current) {
                setupStreamingTranscription(audioStreamRef.current).catch(err => {
                  console.error('❌ Health check reconnection failed:', err);
                });
              }
            }, 1000);
          }
        }, 10000); // Check every 10 seconds

        // Connect audio processing with minimal interference
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputBuffer = event.inputBuffer.getChannelData(0);

            // Calculate audio level for monitoring
            let sum = 0;
            for (let i = 0; i < inputBuffer.length; i++) {
              sum += inputBuffer[i] * inputBuffer[i];
            }
            const rms = Math.sqrt(sum / inputBuffer.length);
            audioLevelRef.current = rms;

            // Send pristine audio to AssemblyAI - no processing
            // AssemblyAI's AI handles all audio enhancement internally
            const processedBuffer = inputBuffer;

            // Convert float32 to int16 with proper scaling for AssemblyAI
            const int16Buffer = new Int16Array(processedBuffer.length);
            for (let i = 0; i < processedBuffer.length; i++) {
              // Proper conversion with clamping
              const sample = Math.max(-1, Math.min(1, processedBuffer[i]));
              int16Buffer[i] = sample < 0 
                ? Math.max(-32768, Math.floor(sample * 32768))
                : Math.min(32767, Math.floor(sample * 32767));
            }

            // Send audio data to AssemblyAI
            if (int16Buffer.byteLength > 0) {
              try {
                ws.send(int16Buffer.buffer);
                audioPacketsSent++;
                
                // Log streaming status every 100 packets (~10 seconds) with audio level
                if (audioPacketsSent % 100 === 0) {
                  const timeSinceLastTranscript = (Date.now() - lastTranscriptTimeRef.current) / 1000;
                  console.log(`📡 Streaming: ${audioPacketsSent} packets | Audio level: ${(rms * 100).toFixed(2)}% | Last transcript: ${timeSinceLastTranscript.toFixed(1)}s ago`);
                  
                  // Warn if no transcripts received for a while despite audio
                  if (timeSinceLastTranscript > 15 && rms > 0.01) {
                    console.warn('⚠️ Audio is being sent but no transcripts received! Check microphone or try speaking louder.');
                  }
                }
              } catch (error) {
                console.error('❌ Error sending audio:', error);
                console.error('WebSocket state:', ws.readyState);
              }
            }
          } else {
            // Log connection issues
            if (audioPacketsSent % 50 === 0) {
              console.warn(`⚠️ WebSocket not ready (state: ${ws.readyState}), cannot send audio`);
            }
          }
        };
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Update WebSocket activity timestamp
        lastWebSocketActivityRef.current = Date.now();
        
        // Handle session begins
        if (data.message_type === 'SessionBegins') {
          console.log('🟢 AssemblyAI session started:', data);
          return;
        }
        
        // Handle session information
        if (data.message_type === 'SessionInformation') {
          console.log('ℹ️ Session info:', data);
          return;
        }

        if (data.message_type === 'PartialTranscript' || data.message_type === 'FinalTranscript') {
          // CRITICAL: Block transcripts during question transitions
          if (isTransitioningRef.current) {
            console.log('⏸️ Blocking stale transcript during transition:', data.text?.substring(0, 30));
            return; // Reject this transcript completely
          }
          
          // CRITICAL: Verify this transcript belongs to current question session
          const currentSessionId = questionSessionIdRef.current;
          if (!data.text || data.text.trim() === '') {
            console.log('⏸️ Blocking empty transcript');
            return;
          }
          
          // Update last transcript time
          lastTranscriptTimeRef.current = Date.now();
          
          const text = data.text;
          if (text?.trim()) {
            // Keep AssemblyAI's output with minimal changes
            let cleanedText = text.trim().replace(/\s+/g, ' ');
            
            // Only fix obvious spacing issues in technical terms
            const essentialCorrections: { [key: string]: string } = {
              'java script': 'JavaScript',
              'react js': 'React',
              'node js': 'Node.js',
              'type script': 'TypeScript',
              'mongo db': 'MongoDB',
              'my sql': 'MySQL',
              'git hub': 'GitHub',
              'talent ei': 'TalentAI',
              'talent ai': 'TalentAI',
              'talent a i': 'TalentAI',
              'talent e i': 'TalentAI',
            };
            
            // Apply corrections
            Object.entries(essentialCorrections).forEach(([wrong, correct]) => {
              const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
              cleanedText = cleanedText.replace(regex, correct);
            });
            
            // Indicate speech is active
            setIsSpeechActive(true);
            
            if (data.message_type === 'FinalTranscript') {
              // SIMPLIFIED & ROBUST DEDUPLICATION
              // Increment sequence to track order
              const currentSequence = ++transcriptSequenceRef.current;
              
              // Basic validation
              if (cleanedText.length < 1) {
                console.log('🚫 Empty transcript, ignoring');
                return;
              }
              
              // Check 1: Exact duplicate of last final transcript
              if (cleanedText === lastFinalTranscriptRef.current) {
                console.log('🚫 Exact duplicate blocked:', cleanedText.substring(0, 50));
                return;
              }
              
              // Check 2: AGGRESSIVE real-time duplicate detection
              const currentAccumulated = accumulatedTranscriptRef.current.toLowerCase().trim();
              const currentTextLower = cleanedText.toLowerCase().trim();
              
              if (currentAccumulated.length > 0 && cleanedText.length > 5) {
                // Check 2.1: Exact substring match (case-insensitive)
                if (currentAccumulated.includes(currentTextLower)) {
                  console.log('🚫 Text already in transcript, blocking duplicate:', cleanedText.substring(0, 50));
                  return;
                }
                
                // Check 2.2: Accumulated ends with this text
                if (currentAccumulated.endsWith(currentTextLower)) {
                  console.log('🚫 Text already at end, blocking:', cleanedText.substring(0, 50));
                  return;
                }
                
                // Check 2.3: Current contains accumulated (superset)
                if (currentTextLower.includes(currentAccumulated) && currentAccumulated.length > 15) {
                  console.log('🚫 Current contains accumulated transcript (superset), blocking:', cleanedText.substring(0, 50));
                  return;
                }
                
                // Check 2.4: AGGRESSIVE Jaccard similarity for near-duplicates (lowered threshold for real-time)
                const accWords = new Set(currentAccumulated.split(/\s+/));
                const currWords = new Set(currentTextLower.split(/\s+/));
                const intersection = new Set([...accWords].filter(w => currWords.has(w)));
                const union = new Set([...accWords, ...currWords]);
                const jaccardSimilarity = intersection.size / union.size;
                
                // More aggressive: 70%+ similar (down from 80%) and not significantly longer
                if (jaccardSimilarity > 0.7 && cleanedText.length < currentAccumulated.length * 1.4) {
                  console.log(`🚫 High similarity (${(jaccardSimilarity * 100).toFixed(1)}%) detected, blocking duplicate:`, cleanedText.substring(0, 50));
                  return;
                }
                
                // Check 2.5: AGGRESSIVE word-level overlap detection (check up to 10 words)
                const accWordsArray = currentAccumulated.split(/\s+/);
                const currWordsArray = currentTextLower.split(/\s+/);
                
                // Check last 3-10 words of accumulated vs first 3-10 words of current
                for (let checkSize = 3; checkSize <= Math.min(10, accWordsArray.length, currWordsArray.length); checkSize++) {
                  const lastAccWords = accWordsArray.slice(-checkSize).join(' ');
                  const firstCurrWords = currWordsArray.slice(0, checkSize).join(' ');
                  
                  if (lastAccWords === firstCurrWords) {
                    console.log(`🚫 Word-level overlap detected (${checkSize} words), blocking:`, cleanedText.substring(0, 50));
                    return;
                  }
                }
                
                // Check 2.6: Sliding window overlap detection (catches partial duplicates anywhere)
                // Check if any 4+ word sequence from current appears in accumulated
                if (currWordsArray.length >= 4) {
                  for (let i = 0; i <= currWordsArray.length - 4; i++) {
                    const window = currWordsArray.slice(i, i + 4).join(' ');
                    if (currentAccumulated.includes(window)) {
                      console.log('🚫 Sliding window duplicate detected (4-word match):', window);
                      return;
                    }
                  }
                }
                
                // Check 2.7: Reverse overlap check - check if accumulated ends with start of current
                if (accWordsArray.length >= 3 && currWordsArray.length >= 3) {
                  // Check last 50% of accumulated vs first 50% of current for overlaps
                  const lastHalfAcc = accWordsArray.slice(-Math.ceil(accWordsArray.length / 2)).join(' ');
                  const firstHalfCurr = currWordsArray.slice(0, Math.ceil(currWordsArray.length / 2)).join(' ');
                  
                  if (lastHalfAcc.includes(firstHalfCurr) || firstHalfCurr.includes(lastHalfAcc)) {
                    console.log('🚫 Half-text overlap detected, blocking:', cleanedText.substring(0, 50));
                    return;
                  }
                }
                
                // Check 2.8: Character-level similarity for very short phrases
                if (cleanedText.length <= 30 && currentAccumulated.length > 0) {
                  const similarity = 1 - (Math.abs(currentTextLower.length - currentAccumulated.length) / Math.max(currentTextLower.length, currentAccumulated.length));
                  if (similarity > 0.85) {
                    // Check edit distance
                    let matches = 0;
                    const minLen = Math.min(currentTextLower.length, currentAccumulated.length);
                    for (let i = 0; i < minLen; i++) {
                      if (currentTextLower[i] === currentAccumulated[i]) matches++;
                    }
                    if (matches / minLen > 0.8) {
                      console.log('🚫 Character-level similarity detected for short phrase, blocking:', cleanedText.substring(0, 50));
                      return;
                    }
                  }
                }
              }
              
              // Check 2.5: Detect if current is a correction/completion of incomplete previous text
              let shouldRemoveIncomplete = false;
              let wordsToRemove = 0;
              
              if (accumulatedTranscriptRef.current.length > 0 && cleanedText.length > 15) {
                const accumulatedWords = accumulatedTranscriptRef.current.split(/\s+/);
                const currentWords = cleanedText.toLowerCase().split(/\s+/);
                
                // Check if first 3-5 words of current match last 3-5 words of accumulated
                const checkLength = Math.min(5, Math.min(accumulatedWords.length, currentWords.length));
                
                if (checkLength >= 3) {
                  const lastAccWords = accumulatedWords.slice(-checkLength).map(w => w.toLowerCase());
                  const firstCurrWords = currentWords.slice(0, checkLength);
                  
                  // Count matching words
                  let matchCount = 0;
                  for (let i = 0; i < checkLength; i++) {
                    if (lastAccWords[i] === firstCurrWords[i]) {
                      matchCount++;
                    }
                  }
                  
                  // If 60%+ words match AND current is longer, this is likely a correction
                  if (matchCount / checkLength >= 0.6 && cleanedText.split(/\s+/).length > checkLength) {
                    shouldRemoveIncomplete = true;
                    // Remove the last few words that are being corrected
                    wordsToRemove = checkLength;
                    console.log(`🔄 Detected correction - removing last ${wordsToRemove} incomplete words`);
                  }
                }
              }
              
              // Check 3: If pending update, wait for it
              if (pendingUpdateRef.current) {
                console.log('⏳ Pending update in progress, queuing...');
                // Queue this update to happen after the pending one
                setTimeout(() => {
                  // Recursive call after pending is done
                  ws.onmessage?.(event);
                }, 50);
                return;
              }
              
              // Mark as pending
              pendingUpdateRef.current = true;
              
              // Update refs FIRST (synchronous)
              lastFinalTranscriptRef.current = cleanedText;
              
              // If this is a correction, remove the incomplete words first
              let baseText = accumulatedTranscriptRef.current;
              if (shouldRemoveIncomplete && wordsToRemove > 0) {
                const words = baseText.split(/\s+/);
                baseText = words.slice(0, -wordsToRemove).join(' ').trim();
                console.log(`✂️ Removed ${wordsToRemove} words. Before: "${accumulatedTranscriptRef.current.substring(Math.max(0, accumulatedTranscriptRef.current.length - 60))}" After: "${baseText.substring(Math.max(0, baseText.length - 60))}"`);
              }
              
              const newAccumulated = baseText 
                ? baseText + ' ' + cleanedText 
                : cleanedText;
              accumulatedTranscriptRef.current = newAccumulated.trim();
              
              // Log
              const confidence = data.confidence || 0;
              const confidencePercent = (confidence * 100).toFixed(1);
              const confidenceEmoji = confidence >= 0.9 ? '🟢' : confidence >= 0.7 ? '🟡' : '🔴';
              console.log(`${confidenceEmoji} [Seq:${currentSequence}][${confidencePercent}%] "${cleanedText}"`);
              
              console.log('✅ ADDING:', {
                new: cleanedText.substring(0, 50),
                accumulated: newAccumulated.substring(Math.max(0, newAccumulated.length - 80)),
                questionIndex: currentIndexRef.current,
                sequence: currentSequence
              });
              
              // Use queueMicrotask for atomic state update
              queueMicrotask(() => {
                const currentIndex = currentIndexRef.current;
                const textToSet = accumulatedTranscriptRef.current;
                
                // Update both states atomically
                setTranscriptions(prevT => ({
                  ...prevT,
                  [currentIndex]: textToSet
                }));
                
                setCurrentTranscript(textToSet);
                
                // Clear pending flag
                pendingUpdateRef.current = false;
                
                console.log('💾 State updated [Seq:' + currentSequence + ']:', textToSet.substring(Math.max(0, textToSet.length - 60)));
              });
              
              // Clear partial and word tracking
              lastPartialWordsRef.current = [];
              
              // Reset speech active indicator
              setTimeout(() => setIsSpeechActive(false), 1500);
            } else {
              // ⚡ PARTIAL TRANSCRIPT - Stream words one by one as user speaks
              
              // Split into words to detect new words
              const newWords = cleanedText.split(/\s+/);
              const lastWords = lastPartialWordsRef.current;
              
              // Find newly added words
              const addedWords: string[] = [];
              for (let i = 0; i < newWords.length; i++) {
                if (i >= lastWords.length || newWords[i] !== lastWords[i]) {
                  // This is a new or changed word
                  addedWords.push(...newWords.slice(i));
                  break;
                }
              }
              
              // Update last words reference
              lastPartialWordsRef.current = newWords;
              
              // Show full display immediately (word-by-word effect happens naturally with partials)
              const displayText = accumulatedTranscriptRef.current 
                ? (accumulatedTranscriptRef.current + ' ' + cleanedText).trim() 
                : cleanedText;
              
              // Log new words appearing
              if (addedWords.length > 0) {
                console.log(`⚡ [WORD-BY-WORD] New words: "${addedWords.join(' ')}"`);
              }
              
              // Update display immediately - AssemblyAI already sends partials word-by-word
              setCurrentTranscript(displayText);
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log(`🔴 WebSocket closed [${event.code}]: ${event.reason || 'Normal closure'}`);
        setIsConnecting(false);
        
        // Clear health check interval
        if (websocketHealthCheckRef.current) {
          clearInterval(websocketHealthCheckRef.current);
          websocketHealthCheckRef.current = null;
        }
        
        // Auto-reconnect if closed unexpectedly (not normal closure)
        if (event.code !== 1000 && event.code !== 1001 && audioStreamRef.current && isRecording) {
          console.log('🔄 Reconnecting to AssemblyAI...');
          setTimeout(() => {
            if (audioStreamRef.current) {
              setupStreamingTranscription(audioStreamRef.current).catch(err => {
                console.error('❌ Reconnection failed:', err);
              });
            }
          }, 1000);
        }
      };

    } catch (error) {
      console.error('Streaming setup error:', error);
      setIsConnecting(false);
      throw error;
    }
  };

  // Modify the recorder.ondataavailable handler inside createMediaRecorder
  const createMediaRecorder = (stream: MediaStream) => {
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000,
    };
    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        try {
          setIsTranscribing(true);
          const formData = new FormData();
          formData.append('audio', event.data, 'recording.webm');

          const response = await fetch('/api/session', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Transcription failed');
          }

          const { text } = await response.json();
          if (text?.trim()) {
            // Update both current transcript and stored transcriptions
            const newText = text.trim();
            setCurrentTranscript(prev => {
              const updated = (prev + ' ' + newText).trim();
              // Update stored transcriptions
              setTranscriptions(prevT => ({
                ...prevT,
                [currentIndexRef.current]: updated
              }));
              return updated;
            });
          }
        } catch (error) {
          console.error('Chunk processing error:', error);
        } finally {
          setIsTranscribing(false);
        }
      }
    };

    return recorder;
  };

  // Every time we finalize a chunk, we stop the recorder, then immediately create a new one
  const finalizeChunk = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;

    // Re-create the recorder for the next chunk
    if (audioStreamRef.current) {
      mediaRecorderRef.current = createMediaRecorder(audioStreamRef.current);
      mediaRecorderRef.current.start(); // Start next chunk
    }
  };

  // Calculate text similarity using Levenshtein distance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calculate Levenshtein distance
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    // Convert distance to similarity (0-1)
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - matrix[len1][len2] / maxLen;
  };

  // Update stopRecording function
  const stopRecording = () => {
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Disconnect processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Stop audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);
    setHasStartedTest(false);
    setIsConnecting(false);
  };

  const handleGuidelinesAccept = async () => {
    try {
      setIsGenerating(true);
      const token = Cookies.get('api_token');
      if (!token) {
        console.log('No token found, redirecting to signin');
        const target = `/posts/${id}/interview${stepId ? `?stepId=${stepId}` : ''}`;
        router.push(`/signin?returnUrl=${encodeURIComponent(target)}`);
        return;
      }

      // Use the new recruitment step API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}recruitementStep/generate-questions/${stepId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ API Error Response:', errorData);
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to fetch questions`);
          }

          const data: JobQuestionsResponse = await response.json();
          console.log('✅ Questions loaded:', data.questions?.length || 0);
      setTestedSkills(data.testedSkills || []);
      const formattedQuestions: Question[] = data.questions.map((question, index) => {
        // Handle case where requiredSkills might not be available
        const skillIndex = data.requiredSkills ? index % data.requiredSkills.length : 0;
        const skill = data.requiredSkills?.[skillIndex] || { name: 'General', level: 'Intermediate' };

        return {
          id: `q_${index + 1}`,
          text: question,
          skill: skill.name,
          level: skill.level
        };
      });

      setQuestions(formattedQuestions);
      setTranscriptions(
        formattedQuestions.reduce((acc: any, _: any, index: number) => ({
          ...acc,
          [index]: ''
        }), {})
      );
      setGuidelinesAccepted(true);
      setShowGuidelines(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      router.push('/');
    } finally {
      setIsGenerating(false);
    }
  };

  // Modify startTest function
  const startTest = async () => {
    if (!guidelinesAccepted) {
      setShowGuidelines(true);
      return;
    }

    try {
      // Initialize transcriptions for all questions
      setTranscriptions(
        questions.reduce((acc: any, _: any, index: number) => ({
          ...acc,
          [index]: ''
        }), {})
      );
      setCurrentTranscript(''); // Clear current transcript

      // Get audio stream with optimal settings for AssemblyAI
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
          // Request highest quality audio for AssemblyAI
          sampleSize: 16,
          // Advanced constraints for best quality
          ...(typeof navigator !== 'undefined' && 'mediaDevices' in navigator && {
            advanced: [
              { echoCancellation: true },
              { noiseSuppression: true },
              { autoGainControl: true },
            ]
          })
        } as MediaTrackConstraints,
      });
      audioStreamRef.current = stream;

      // Setup streaming transcription
      await setupStreamingTranscription(stream);

      setIsRecording(true);
      setHasStartedTest(true);
      setTimeLeft(120); // Start with 120 seconds (2 minutes)
    } catch (error) {
      console.error('Recording setup error:', error);
      setIsRecording(false);
      setHasStartedTest(false);
      setIsConnecting(false);
    }
  };

  const handlePrev = () => setCurrent(c => Math.max(0, c - 1));
  const handleNext = () => {
    // IMMEDIATELY block all incoming transcripts before state changes
    console.log('🛑 NEXT CLICKED - Blocking all transcripts immediately');
    isTransitioningRef.current = true;
    
    // Increment session ID IMMEDIATELY to reject any pending transcripts
    questionSessionIdRef.current = questionSessionIdRef.current + 1;
    
    // Clear ALL transcript buffers and refs immediately to prevent race conditions
    accumulatedTranscriptRef.current = '';
    lastFinalTranscriptRef.current = '';
    lastPartialWordsRef.current = [];
    pendingUpdateRef.current = false;
    transcriptSequenceRef.current = 0;
    
    // Clear the displayed transcript immediately
    setCurrentTranscript('');
    
    console.log(`🔒 Session locked. New session will be: ${questionSessionIdRef.current + 1}`);
    
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      saveTestResults();
      router.push(`/posts/${id}/report?postId=${id}${stepId ? `&stepId=${stepId}` : ''}`);
    }
  };

  const goHome = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (hasStartedTest) {
      // Save test results locally without navigating to report
      const results = questions.map((q, index) => ({
        question: q.text,
        answer: transcriptions[index] || '',
      }));

      const testData = {
        results,
        testedSkills,
        metadata: {
          type: 'interview',
          jobId: id,
          timestamp: new Date().toISOString()
        }
      };

      localStorage.setItem('test_results', JSON.stringify(testData));
      console.log('Test results saved locally');
    }
    // Go directly to dashboard without redirecting to report
    router.push('/dashboard/candidate');
  };

  // Function to save test results
  const saveTestResults = async () => {
    try {
      const results = questions.map((q, index) => ({
        question: q.text,
        answer: transcriptions[index] || '',
      }));

      const testData = {
        results,
        testedSkills,
        metadata: {
          type: 'interview',
          jobId: id,
          timestamp: new Date().toISOString()
        }
      };

      // Store in both localStorage and Cookies
      localStorage.setItem('test_results', JSON.stringify(testData));
      Cookies.set('test_results', JSON.stringify(testData), { expires: 7 });

      // Navigate to interview report page with post and step IDs
      router.push({
        pathname: `/posts/${id}/report`,
        query: stepId ? { postId: id as string, stepId: stepId as string } : { postId: id as string }
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      // Still redirect to interview report page even if saving fails
      router.push({
        pathname: `/posts/${id}/report`,
        query: stepId ? { postId: id as string, stepId: stepId as string } : { postId: id as string }
      });
    }
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
        stopRecording();
        setTimeout(() => {
          router.push('/dashboard/candidate');
        }, 2000); // Give time for modal to show
      }
      return next;
    });
  };

  // Add screen capture detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasStartedTest && !violationHandledRef.current) {
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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStartedTest]);

  // Add visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedTest && !violationHandledRef.current) {
        handleSecurityViolation();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasStartedTest && !violationHandledRef.current) {
        handleSecurityViolation();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasStartedTest]);

  // Add timer for next button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStartedTest && nextButtonDisabled && buttonTimer > 0) {
      timer = setInterval(() => {
        setButtonTimer(prev => {
          if (prev <= 1) {
            setNextButtonDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasStartedTest, nextButtonDisabled, buttonTimer]);

  // Reset button timer when question changes
  useEffect(() => {
    if (current > 0) {
      setNextButtonDisabled(true);
      setButtonTimer(2);
    }
  }, [current]);

  if(!isAuthenticated){
    return null
  }

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
          borderRadius: { xs: 2, sm: 4 }, // Responsive border radius
          background: 'white',
          backgroundColor: 'white',
          p: { xs: 1, sm: 2, md: 4 }, // Responsive padding
          minHeight: { xs: '90vh', sm: '80vh' }, // Responsive height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Security Modal */}
        <SecurityModal open={showSecurityModal} onClose={() => { }}>
          <DialogTitle sx={{ fontWeight: 700, color: 'black', fontSize: '1.5rem' }}>
            Security Violation
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
              You have attempted to leave or capture the test page more than once. For security reasons, your test has ended and you are being redirected to the dashboard.
            </Typography>
          </DialogContent>
        </SecurityModal>

        {/* First Violation Modal */}
        <FirstViolationModal
          open={showFirstViolationModal}
          onClose={() => setShowFirstViolationModal(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', color: 'black', pt: 3 }}>
            Heads Up!
          </DialogTitle>
          <DialogContent sx={{ pb: 0 }}>
            <Typography variant="body1" sx={{ color: 'black', mb: 2 }}>
              For security reasons, leaving or capturing the test page is not allowed.<br />
              <b>If you do this again, your test will end and you will be redirected.</b>
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setShowFirstViolationModal(false)}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                },
              }}
            >
              Got it
            </Button>
          </DialogActions>
        </FirstViolationModal>

        {/* Guidelines Modal */}
        <GuidelinesModal
          open={showGuidelines}
          onClose={() => { }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: theme.spacing(3),
          }}>
            <Typography variant="h5" sx={{
              color: '#fff',
              fontWeight: 700,
              background: GREEN_MAIN,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Important Interview Guidelines
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: theme.spacing(4) }}>
            <Typography variant="body1" sx={{ color: '#000', mb: 3, opacity: 0.9 }}>
              Please ensure you meet the following requirements before starting the interview:
            </Typography>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5  }}>⏱️</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000',  fontWeight: 600, mb: 0.5 }}>
                  Time Commitment
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Set aside 30 minutes of uninterrupted time. The interview cannot be paused once started.
                </Typography>
              </Box>
            </GuidelineItem>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5 }}>🔇</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>
                  Quiet Environment
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Find a quiet room with no background noise. Background sounds can affect your interview results.
                </Typography>
              </Box>
            </GuidelineItem>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5 }}>🎥</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>
                  Camera and Microphone
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Ensure your camera and microphone are working properly. Interview will use both for recording.
                </Typography>
              </Box>
            </GuidelineItem>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5 }}>👤</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>
                  Individual Assessment
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Complete the interview alone. No other people should be present or helping during the assessment.
                </Typography>
              </Box>
            </GuidelineItem>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5 }}>💻</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>
                  Technical Setup
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Use a stable internet connection. Close other applications that might use your camera or microphone.
                </Typography>
              </Box>
            </GuidelineItem>
          </DialogContent>
          <DialogActions sx={{
            padding: theme.spacing(3),
            borderTop: '1px solid rgba(255,255,255,0.1)',
            justifyContent: 'space-between'
          }}>
            <Button
              onClick={() => router.push('/dashboard/candidate')}
              sx={{
                color: '#000',
                '&:hover': { color: '#000' }
              }}
            >
              I'm Not Ready
            </Button>
            <Button
              variant="contained"
              onClick={handleGuidelinesAccept}
              sx={{
                background: GREEN_MAIN,
                color: '#000',
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  background: '#8310FF',
                }
              }}
            >
              I Understand & I'm Ready
            </Button>
          </DialogActions>
        </GuidelinesModal>

        <StyledAppBar position="static" elevation={0}>
          <Toolbar sx={{ 
            flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1, sm: 0 },
            py: { xs: 1, sm: 0 },
          }}>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                background: 'white',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem' }, // Responsive font size
                textAlign: { xs: 'center', sm: 'left' }, // Center on mobile
              }}
            >
              Interview ({current + 1}/{questions.length || '-'})
            </Typography>
            {hasStartedTest && (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#fff', 
                  mr: { xs: 0, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
                  textAlign: { xs: 'center', sm: 'left' }, // Center on mobile
                }}
              >
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} min
              </Typography>
            )}
            <Button
              startIcon={<CallEndIcon />}
              onClick={() => {
                stopRecording();
                goHome();
              }}
              variant="outlined"
              sx={{
                color: "white",
                borderColor: 'white',
                textTransform: 'none',
                borderRadius: 2,
                px: { xs: 2, sm: 3 }, // Responsive padding
                py: { xs: 0.5, sm: 1 }, // Responsive padding
                fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
                width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                '&:hover': { backgroundColor: 'rgba(244,67,54,0.1)' },
              }}
            >
              End Interview
            </Button>
          </Toolbar>
          <LinearProgress
            variant={isGenerating ? "indeterminate" : "determinate"}
            value={((current + 1) / (questions.length || 1)) * 100}
            sx={{
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: GREEN_MAIN,
              },
            }}
          />
        </StyledAppBar>

        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <strong>Error:</strong> {error}
              <br />
              <strong>Details:</strong>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Post ID: {id}</li>
                <li>Step ID: {stepId || '❌ Missing!'}</li>
                <li>Check browser console (F12) for more details</li>
              </ul>
              {!stepId && (
                <>
                  <br />
                  <strong>How to fix:</strong>
                  <br />
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => router.push(`/posts/${id}`)}
                    sx={{ mt: 1 }}
                  >
                    Go to Post Page to Get Correct URL
                  </Button>
                  <br />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    The correct URL should look like: <code>/posts/{id}/interview?stepId=YOUR_STEP_ID</code>
                  </Typography>
                </>
              )}
            </Alert>
          )}
          
          {/* Prominent Question Panel - Always visible during test */}
          {hasStartedTest && !isGenerating && questions[current] && (
            <QuestionPanel
              elevation={6}
              className={questionHighlight ? 'question-highlight' : ''}
            >
              <QuestionContent>
                <QuestionText 
                  variant="body1"
                  sx={{
                    filter: isConnecting ? 'blur(4px)' : 'blur(0px)',
                    opacity: isConnecting ? 0.4 : 1,
                    transition: 'all 0.5s ease-in-out',
                    pointerEvents: isConnecting ? 'none' : 'auto'
                  }}
                >
                  {questions[current]?.text || "Loading next question..."}
                </QuestionText>
              </QuestionContent>
            </QuestionPanel>
          )}

          {/* Camera and Status Indicator on Same Line */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
            {/* Status Indicator - Left Side */}
            {hasStartedTest && (
              <Box sx={{ flex: 1 }}>
                {!isConnecting && isRecording && (
                  <Paper elevation={3} sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #00ff9d 0%, #00d4ff 100%)',
                    animation: 'pulse 2s ease-in-out infinite',
                    boxShadow: '0 8px 30px rgba(0, 255, 157, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      boxShadow: '0 0 15px rgba(255,255,255,0.9)',
                      flexShrink: 0
                    }} />
                    <Typography variant="body1" sx={{ 
                      color: '#fff', 
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      🎤 You Can Speak Now!
                    </Typography>
                  </Paper>
                )}
                
                {isConnecting && (
                  <Paper elevation={3} sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #ffa726 0%, #ff7043 100%)',
                    boxShadow: '0 8px 30px rgba(255, 167, 38, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CircularProgress size={20} sx={{ color: '#fff', flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ 
                      color: '#fff', 
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      🔄 Connecting...
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Compact Camera Preview - Right Side */}
            <Paper elevation={2} sx={{
              p: 2,
              ...(hasStartedTest ? {
                position: 'relative',
                width: '300px',
                flexShrink: 0
              } : {
                flex: 1
              })
            }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1rem' }}>
              Camera Preview
            </Typography>
            <Box sx={{
              position: 'relative',
              width: '100%',
              maxWidth: hasStartedTest ? '280px' : '400px',
              aspectRatio: '4/3',
              mx: hasStartedTest ? 0 : 'auto',
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
                  transform: 'scaleX(-1)',
                }}
              />
              
              {isGenerating && (
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
                  <Typography variant="caption">Generating questions...</Typography>
                </Box>
              )}
            </Box>
          </Paper>
          </Box>

          {/* Enhanced Transcript Display */}
          {hasStartedTest && (
            <Paper elevation={3} sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,249,250,1) 100%)',
              border: '2px solid #e3f2fd'
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <MicIcon sx={{ 
                  color: isSpeechActive ? '#00ff9d' : (currentTranscript.length > 0 ? '#4caf50' : '#9e9e9e'),
                  transition: 'color 0.3s ease',
                  animation: isSpeechActive ? 'pulse 0.8s ease-in-out infinite' : 'none'
                }} />
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                  Your Response
                  {isSpeechActive && (
                    <Typography component="span" sx={{ ml: 1, color: '#00ff9d', fontSize: '0.9rem', fontWeight: 400 }}>
                      (Listening...)
                    </Typography>
                  )}
                </Typography>
                {currentTranscript.length > 0 && (
                  <>
                    <Box sx={{
                      ml: 1,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: isSpeechActive ? '#00ff9d' : '#4caf50',
                      animation: 'pulse 1s ease-in-out infinite'
                    }} />
                    <Typography sx={{ ml: 'auto', fontSize: '0.75rem', color: '#8310FF', fontStyle: 'italic' }}>
                      ✏️ Click any word to edit
                    </Typography>
                  </>
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
                {currentTranscript ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px',
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                  }}>
                    {currentTranscript.split(/\s+/).map((word, index) => (
                      <Box
                        key={index}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const editedWord = e.currentTarget.textContent || '';
                          console.log(`✏️ User edited word ${index}: "${word}" → "${editedWord}"`);
                          
                          // Reconstruct the full transcript with the edited word
                          const words = currentTranscript.split(/\s+/);
                          words[index] = editedWord;
                          const newTranscript = words.join(' ');
                          
                          // Update everything
                          setTranscriptions(prevT => ({
                            ...prevT,
                            [currentIndexRef.current]: newTranscript
                          }));
                          accumulatedTranscriptRef.current = newTranscript;
                          setCurrentTranscript(newTranscript);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.blur(); // Exit edit mode on Enter or Space
                          }
                        }}
                        onCopy={(e) => {
                          e.preventDefault();
                          console.log('🚫 Copy disabled during interview');
                        }}
                        onCut={(e) => {
                          e.preventDefault();
                          console.log('🚫 Cut disabled during interview');
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          console.log('🚫 Paste disabled during interview');
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault(); // Disable right-click menu
                          console.log('🚫 Right-click disabled during interview');
                        }}
                        sx={{
                          padding: '2px 4px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'text.primary',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(131, 16, 255, 0.08)',
                          },
                          '&:focus': {
                            backgroundColor: 'rgba(131, 16, 255, 0.15)',
                            boxShadow: '0 0 0 2px rgba(131, 16, 255, 0.3)',
                            fontWeight: 600,
                          }
                        }}
                      >
                        {word}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}>
                    Speak your response...
                  </Typography>
                )}
                {!currentTranscript && isRecording && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 255, 157, 0.05)', borderRadius: 1, border: '1px dashed rgba(0, 255, 157, 0.3)' }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 0.5 }}>
                      🎤 <strong>Ready to listen:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#666', ml: 2 }}>
                      • Just speak naturally - we'll capture EVERYTHING you say
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#666', ml: 2 }}>
                      • Any accent worldwide - American, British, Indian, African, European, Asian!
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#666', ml: 2 }}>
                      • AI is listening and will write exactly what you say
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* Start Test Button (when not started) */}
          {!hasStartedTest && !isGenerating && (
            <Box textAlign="center" py={4}>
              <Typography variant="h5" gutterBottom>
                Ready to Start Your Test?
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Make sure you're in a quiet environment with your camera and microphone ready.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={startTest}
                disabled={isConnecting}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  }
                }}
              >
                {isConnecting ? 'Connecting...' : 'Start Interview'}
              </Button>
            </Box>
          )}
        </Container>

        <NavigationBar>
          <IconButton 
            onClick={handlePrev} 
            disabled={current === 0} 
            sx={{ 
              color: '#fff',
              display: { xs: 'none', sm: 'flex' }, // Hide on mobile to save space
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={isGenerating || (current > 0 && nextButtonDisabled)}
            sx={{
              textTransform: 'none',
              background: nextButtonDisabled ? 'rgba(255, 255, 255, 0.12)' : GREEN_MAIN,
              borderRadius: 2,
              px: { xs: 3, sm: 4 }, // Responsive padding
              py: { xs: 1, sm: 1.5 }, // Responsive padding
              fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' }, // Full width on mobile
              maxWidth: { xs: '300px', sm: 'none' }, // Max width on mobile
              boxShadow: '0 2px 8px 0 rgba(0,255,157,0.10)',
              '&:hover': {
                background: nextButtonDisabled ? 'rgba(255, 255, 255, 0.12)' : GREEN_MAIN,
              },
              '&.Mui-disabled': {
                color: 'black',
              }
            }}
          >
            {current < questions.length - 1
              ? `Next Question${nextButtonDisabled ? ` (${buttonTimer}s)` : ''}`
              : 'Finish Interview'}
          </Button>
        </NavigationBar>
      </Box>
      </Box>
    </>
  );
}

const InterviewPost: React.FC = () => {
  return <Test />
}

export default InterviewPost