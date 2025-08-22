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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import AvatarCanvas from '@/components/AvatarCanvas';

// Remove hardcoded questions
const NEXTJS_QUESTIONS: string[] = [];

// Add this after imports
const GREEN_MAIN = '#8310FF';

// --- ElevenLabs TTS Integration ---
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''; // Fallback for demo
const ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || ''; // Rachel (most natural female voice)

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  background: GREEN_MAIN,
}));

const RecordingControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  zIndex: 2,
  background: 'rgba(0, 0, 0, 0.6)',
  padding: theme.spacing(1),
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  minWidth: 'auto',
  maxWidth: '70%',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  [theme.breakpoints.up('sm')]: {
    top: theme.spacing(2),
  },
}));

const RecordingButton = styled(Button)(({ theme }) => ({
  width: 'auto',
  minWidth: '140px',
  padding: theme.spacing(1),
  fontSize: '0.95rem',
  fontWeight: 600,
  borderRadius: '10px',
  transition: 'all 0.2s ease',
}));

const TranscriptDisplay = styled(Typography)(({ theme }) => ({
  color: '#fff',
  textAlign: 'center',
  maxWidth: '75%',
  background: 'rgba(0, 0, 0, 0.6)',
  padding: theme.spacing(1),
  borderRadius: '10px',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  marginTop: theme.spacing(1),
  maxHeight: '100px',
  overflowY: 'auto',
  fontSize: '0.85rem',
  lineHeight: 1.4,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
  },
}));

const QuestionOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7), transparent)',
  color: '#fff',
  padding: theme.spacing(2, 1.5), // Responsive padding
  backdropFilter: 'blur(5px)',
  minHeight: '80px', // Ensure minimum height on mobile
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    minHeight: 'auto',
  },
}));

const NavigationBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2), // Add margin to account for circular camera
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'space-between',
    marginBottom: 0,
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

// Add styled components for the new layout
const CircularCamera = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  width: '10vw',
  height: '10vw',
  minWidth: '80px',
  minHeight: '80px',
  maxWidth: '150px',
  maxHeight: '150px',
  borderRadius: '50%',
  overflow: 'hidden',
  zIndex: 1000,
  border: '3px solid #8310FF',
  boxShadow: '0 8px 32px rgba(131, 16, 255, 0.3)',
  backgroundColor: '#000',
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '15vw',
    height: '15vw',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

// Controls overlay centered over the avatar area
const AvatarCenterControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const MainCanvas = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '70vh',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    height: '60vh',
    borderRadius: theme.spacing(2),
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

const Test = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id, type, projectId } = router.query;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const [testedSkills, setTestedSkills] = useState<any[]>([]);
  const currentIndexRef = useRef(0);
  const [hasStartedTest, setHasStartedTest] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ [key: string]: string }>({});
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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
    // Interval used to finalize each chunk
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Prevent double stopRecording
  const stoppedRef = useRef(false);

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Question selection logic
  const [invalidType, setInvalidType] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [showLoaderModal, setShowLoaderModal] = useState(false);

  // Add new state for TTS
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Add new state for greeting control
  const [shouldPlayGreeting, setShouldPlayGreeting] = useState(false);
  
  // Add new state for avatar question speaking
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false);

  // Add new state for warning modal
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  useEffect(() => {
    if(!isAuthenticated && id){
      router.push(`/signin?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`)
    }
  }, [isAuthenticated, id])

  // Timer only runs when test has started
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStartedTest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (current < questions.length - 1) {
              setCurrent(c => c + 1);
              // If next is last question, set to 300, else 240
              if (current + 1 === questions.length - 1) {
                return 300;
              } else {
                return 240;
              }
            } else {
              stopRecording();
              saveTestResults();
              router.push({
                pathname: '/hackathon/report',
                query: { type, projectId }
              });
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [current, timeLeft, questions.length, hasStartedTest, router]);

  // Reset timer when question changes
  useEffect(() => {
    currentIndexRef.current = current;
    if (current === questions.length - 1) {
      setTimeLeft(300); // Last question: 5 minutes
    } else {
      setTimeLeft(240); // Others: 4 minutes
    }
    setCurrentTranscript(''); // Clear current transcript
  }, [current, questions.length]);

  // Initialize camera
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        }
      } catch (e) {
        console.error('Camera error', e);
      }
    })();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
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
        console.log('Streaming connection opened');
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
          const text = data.text;
          if (text?.trim()) {
            if (data.message_type === 'FinalTranscript') {
              // For final transcripts, add to the stored transcription for this question
              setTranscriptions(prevT => {
                const currentQuestionText = prevT[currentIndexRef.current] || '';
                const updatedQuestionText = (currentQuestionText + ' ' + text).trim();

                // Also update the current transcript to show the accumulated text
                setCurrentTranscript(updatedQuestionText);

                return {
                  ...prevT,
                  [currentIndexRef.current]: updatedQuestionText
                };
              });
            } else {
              // For partial transcripts, show accumulated text + current partial
              setTranscriptions(prevT => {
                const currentQuestionText = prevT[currentIndexRef.current] || '';
                const displayText = currentQuestionText ? (currentQuestionText + ' ' + text).trim() : text;
                setCurrentTranscript(displayText);
                return prevT; // Don't update stored transcriptions for partials
              });
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnecting(false);
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

  // Enter fullscreen
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  };

  // Exit fullscreen
  const exitFullscreen = () => {
    // Only exit if in fullscreen and document is active
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    // @ts-ignore: document.hasFocus exists in browsers
    const isActive = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
    if (!isFullscreen || !isActive) return;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  // Update stopRecording function
  const stopRecording = () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    exitFullscreen();
    // Close WebSocket connection
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch (e) { /* ignore */ }

    // Stop audio context
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) { /* ignore */ }

    // Disconnect processor
    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
    } catch (e) { /* ignore */ }

    // Stop audio tracks
    try {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          try { track.stop(); } catch (e) { /* ignore */ }
        });
        audioStreamRef.current = null;
      }
    } catch (e) { /* ignore */ }

    setIsRecording(false);
    setHasStartedTest(false);
    setIsConnecting(false);
  };

  const handleGuidelinesAccept = async () => {
    try {
      setShowLoaderModal(true);
      setIsGenerating(true);
      const token = Cookies.get('api_token');
      if (!token) {
        console.log('No token found, redirecting to signin');
        router.push(`/signin?returnUrl=${encodeURIComponent(router.asPath)}`);
        return;
      }
      if (!projectId || !type) {
        throw new Error('Missing project or type');
      }
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}project/generateQuestions/${projectId}/${type}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions.map((question: string) => ({
          id: uuidv4(),
          text: question,
          skill: '',
          level: ''
        })));
        setInvalidType(false);
      } else {
        setQuestions([]);
        setInvalidType(true);
      }
      setGuidelinesAccepted(true);
      setShowGuidelines(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      router.push('/');
    } finally {
      setIsGenerating(false);
      setShowLoaderModal(false);
      // Trigger greeting AFTER the loader modal closes with a small delay
      setTimeout(() => {
        console.log('Guidelines accepted and loader finished - triggering avatar greeting');
        setShouldPlayGreeting(true);
      }, 500); // Small delay to ensure UI has updated
    }
  };

  // Modify startTest function
  const startTest = async () => {
    stoppedRef.current = false;
    if (!guidelinesAccepted) {
      setShowGuidelines(true);
      return;
    }

    try {
      enterFullscreen();
      // Initialize transcriptions for all questions
      setTranscriptions(
        questions.reduce((acc: any, _: any, index: number) => ({
          ...acc,
          [index]: ''
        }), {})
      );
      setCurrentTranscript(''); // Clear current transcript

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      audioStreamRef.current = stream;

      // Setup streaming transcription
      await setupStreamingTranscription(stream);

      setIsRecording(true);
      setHasStartedTest(true);
      setTimeLeft(240); // Start with 240 seconds (4 minutes)
      
      // Trigger avatar to speak the first question
      setTimeout(() => {
        setShouldSpeakQuestion(true);
      }, 1000); // Give time for test to start properly
    } catch (error) {
      console.error('Recording setup error:', error);
      setIsRecording(false);
      setHasStartedTest(false);
      setIsConnecting(false);
    }
  };

  const handlePrev = () => setCurrent(c => Math.max(0, c - 1));
  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      saveTestResults();
      router.push({
        pathname: '/hackathon/report',
        query: { type, projectId }
      });
    }
  };

  const goHome = () => {
    exitFullscreen();
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (hasStartedTest) {
      saveTestResults();
    }
    router.push(`/hackathon/projects/${projectId}`);
  };

  // Function to save test results
  const saveTestResults = async () => {
    try {
      const results = questions.map((q, index) => ({
        question: q.text,
        answer: transcriptions[index] || '',
        skill: q.skill,
        level: q.level
      }));

      const testData = {
        results,
        testedSkills,
        metadata: {
          type: 'job',
          jobId: id,
          timestamp: new Date().toISOString()
        }
      };

      // Store in both localStorage and Cookies
      localStorage.setItem('test_results', JSON.stringify(testData));
      Cookies.set('test_results', JSON.stringify(testData), { expires: 7 });

      // Navigate to report page with job ID
      router.push({
        pathname: '/hackathon/report',
        query: { type, projectId }
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      // Still redirect to report page even if saving fails
      router.push({
        pathname: '/hackathon/report',
        query: { type, projectId }
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
          router.push(`/hackathon/projects/${projectId}`);
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

  // Fetch TTS audio from ElevenLabs when question changes
  useEffect(() => {
    const fetchTTS = async () => {
      if (!questions[current]?.text) return;
      setIsSpeaking(false);
      setAudioUrl(null);
      
      // Remove delay for first question since avatar will handle it
      if (current === 0 && shouldSpeakQuestion) {
        return; // Let avatar handle first question TTS
      }
      
      try {
        if(hasStartedTest){
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: questions[current].text,
            voice_settings: {
              stability: 0.3, // more expressive
              similarity_boost: 0.85, // closer to real
              style: 1.0, // more natural prosody (if supported)
              use_speaker_boost: true
            },
          }),
        });
        if (!response.ok) {
          console.warn('TTS fetch failed:', response.status, response.statusText);
          return; // Fail silently instead of throwing
        }
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
      } catch (e) {
        console.error('TTS error', e);
        // Fail silently to not interrupt the interview flow
      }
      
    };
    if (hasStartedTest && questions.length > 0 && !isGenerating) {
      fetchTTS();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions, isGenerating, shouldSpeakQuestion,hasStartedTest]);

  // Play audio when audioUrl changes
  useEffect(() => {
    if (audioUrl && audioRef.current && hasStartedTest) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsSpeaking(true);
      audioRef.current.onended = () => setIsSpeaking(false);
    }
  }, [audioUrl,hasStartedTest]);

  // Listen for fullscreenchange: if test is running and fullscreen is exited, show warning and allow re-entering fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (hasStartedTest && !isFullscreen) {
        setShowFullscreenWarning(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasStartedTest]);

  // Pause timer when fullscreen is exited
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (showFullscreenWarning) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [showFullscreenWarning]);
  useEffect(() => {
  const handleCopy = (e: ClipboardEvent) => e.preventDefault();
  const handleContextMenu = (e: MouseEvent) => e.preventDefault();

  document.addEventListener('copy', handleCopy);
  document.addEventListener('contextmenu', handleContextMenu);

  return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('contextmenu', handleContextMenu);
  };
}, []);

  // Modify timer effect to pause when isPaused is true
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStartedTest && timeLeft > 0 && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (current < questions.length - 1) {
              setCurrent(c => c + 1);
              // If next is last question, set to 300, else 240
              if (current + 1 === questions.length - 1) {
                return 300;
              } else {
                return 240;
              }
            } else {
              stopRecording();
              saveTestResults();
              router.push({
                pathname: '/hackathon/report',
                query: { type, projectId }
              });
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [current, timeLeft, questions.length, hasStartedTest, router, isPaused]);

  if (fetchError) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{fetchError}</div>;
  }
  if (!type || !projectId) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Missing project or type.</div>;
  }
  

  if(!isAuthenticated){
    return null
  }

  return (
    <>
      <style jsx global>{`
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
      `}</style>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 1, sm: 4 }, // Responsive padding
          px: { xs: 0, sm: 2 }, // Add horizontal padding on larger screens
        }}
      >
      {/* No avatar, only audio will play */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}
      {/* Fullscreen warning modal */}
      <Dialog open={showFullscreenWarning} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#7C4DFF', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', pb: 0 }}>
          Fullscreen Required
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ color: '#333', fontWeight: 500, textAlign: 'center' }}>
            You exited fullscreen mode (e.g., by pressing Escape).<br />
            Please re-enter fullscreen to continue your test.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowFullscreenWarning(false);
              // Try to re-enter fullscreen
              const elem = document.documentElement;
              if (elem.requestFullscreen) {
                elem.requestFullscreen();
              } else if ((elem as any).webkitRequestFullscreen) {
                (elem as any).webkitRequestFullscreen();
              } else if ((elem as any).msRequestFullscreen) {
                (elem as any).msRequestFullscreen();
              }
            }}
            sx={{ background: '#8310FF', color: '#fff', borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600 }}
          >
            Re-enter Fullscreen and Continue Test
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setShowFullscreenWarning(false);
              stopRecording();
              router.push(`/hackathon/projects/${projectId}`);
            }}
            sx={{ borderColor: '#8310FF', color: '#8310FF', borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600, ml: 2 }}
          >
            End Test
          </Button>
        </DialogActions>
      </Dialog>
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
              Important Test Guidelines
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: theme.spacing(4) }}>
            <Typography variant="body1" sx={{ color: '#000', mb: 3, opacity: 0.9 }}>
              Please ensure you meet the following requirements before starting the test:
            </Typography>

            <GuidelineItem>
              <Box sx={{ color: GREEN_MAIN, mt: 0.5  }}>⏱️</Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#000',  fontWeight: 600, mb: 0.5 }}>
                  Time Commitment
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }}>
                  Set aside 30 minutes of uninterrupted time. The test cannot be paused once started.
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
                  Find a quiet room with no background noise. Background sounds can affect your test results.
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
                  Ensure your camera and microphone are working properly. Test will use both for recording.
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
                  Complete the test alone. No other people should be present or helping during the assessment.
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
              onClick={() => router.push(`/hackathon/projects/${projectId}`)}
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

        {/* Loader Modal for Test Preparation */}
        <Dialog open={showLoaderModal} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#7C4DFF', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', pb: 0 }}>
            Preparing Your Test
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: '#7C4DFF', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 500, textAlign: 'center' }}>
              Please wait while we prepare your questions and environment...
            </Typography>
          </DialogContent>
        </Dialog>

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
              Skill Test ({current + 1}/{questions.length || '-'})
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
              End Test
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

        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '60vh', sm: 'auto' },
          }}
        >
          {/* Main Three.js Canvas Area */}
          <MainCanvas>
            <AvatarCanvas 
              isSpeaking={isSpeaking} 
              shouldPlayGreeting={shouldPlayGreeting}
              shouldSpeakQuestion={shouldSpeakQuestion}
              firstQuestionText={questions[0]?.text || ""}
              hasStartedTest={hasStartedTest}
            />

            {/* Start Test button centered over the avatar area (before start) */}
            {!hasStartedTest && (
              <AvatarCenterControls>
                <RecordingButton
                  variant="contained"
                  onClick={startTest}
                  disabled={isGenerating || isConnecting}
                  sx={{
                    backgroundColor: isConnecting ? '#FFC107' : GREEN_MAIN,
                    color: '#000',
                    '&:hover': { backgroundColor: isConnecting ? '#FFB300' : GREEN_MAIN },
                    '&.Mui-disabled': {
                      backgroundColor: isConnecting ? '#FFC107' : GREEN_MAIN,
                      color: '#000',
                      opacity: 1,
                    },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.25 },
                  }}
                >
                  {isConnecting ? 'Connecting...' : 'Start Test'}
                </RecordingButton>
              </AvatarCenterControls>
            )}
            
            {/* Recording Controls Overlay (visible only after start) */}
            {hasStartedTest && (
              <RecordingControls>
                <RecordingButton
                  variant="contained"
                  disabled
                  sx={{
                    backgroundColor: '#E53935',
                    color: '#fff',
                    minWidth: '160px',
                    '&.Mui-disabled': {
                      backgroundColor: '#E53935',
                      color: '#fff',
                      opacity: 1,
                    },
                  }}
                >
                  {isConnecting
                    ? 'Connecting...'
                    : `Recording (${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')} min)`}
                </RecordingButton>
                <>
                  <VoiceActivityIndicator isActive={currentTranscript.length > 0}>
                    <VoiceWaves />
                    <VoiceIcon />
                  </VoiceActivityIndicator>
                  {currentTranscript && (
                    <TranscriptDisplay variant="body2">
                      {currentTranscript}
                    </TranscriptDisplay>
                  )}
                </>
              </RecordingControls>
            )}

            {/* Question Overlay */}
            <QuestionOverlay>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#fff',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  textAlign: 'center',
                  px: { xs: 1, sm: 0 },
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {isGenerating ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'center',
                    background: GREEN_MAIN,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}>
                    <span>Generating your interview questions</span>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        animation: 'dots 1.4s infinite',
                        userSelect: 'none',
                      }}
                    >
                      ...
                    </Box>
                  </Box>
                ) : questions[current]?.text}
              </Typography>
            </QuestionOverlay>
          </MainCanvas>

          {/* Circular Camera in Bottom Right */}
          <CircularCamera>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
          </CircularCamera>

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
            disabled={!hasStartedTest || isGenerating || (current > 0 && nextButtonDisabled)}
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
              : 'Finish Test'}
          </Button>
        </NavigationBar>
        </Box>
      </Box>
    </>
  );
}

const DynamicContent = dynamic(() => Promise.resolve(Test), { ssr: false })

const HackathonInterview: React.FC = () => {
  return <DynamicContent />
}

export default HackathonInterview