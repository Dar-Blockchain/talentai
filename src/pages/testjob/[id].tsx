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

// Remove hardcoded questions
const NEXTJS_QUESTIONS: string[] = [];

// Add this after imports
const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
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
  minWidth: '300px',
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

const QuestionOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
  color: '#fff',
  padding: theme.spacing(3),
  backdropFilter: 'blur(5px)',
}));

const NavigationBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  // background: 'rgba(0, 7, 45, 0.8)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
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
}

const Test = () => {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();
  const { id } = router.query;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
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

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  useEffect(() => {
    if(!isAuthenticated && id){
      router.push(`/signin?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`)
    }
  }, [isAuthenticated, id])


  // Add useEffect for authentication and profile check
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const token = Cookies.get('api_token');
      if (!token) {
        console.log('No token found, redirecting to signin');
        router.push(`/signin?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // If profile exists and is valid, proceed with test
        if (response.ok) {
          const profileData = await response.json();
          console.log('Profile data:', profileData);

          // Check if profile has required data
          if (profileData && profileData.type &&
            ((profileData.type === 'Candidate') ||
              (profileData.type === 'Company' && profileData.requiredSkills && profileData.requiredSkills.length > 0))) {
            console.log('Profile is complete, proceeding with test');
            setIsProfileComplete(true);
            return;
          }
        }

        // If we get here, either profile doesn't exist or is invalid
        console.log('Profile not found or invalid, redirecting to preferences');
        router.push(`/preferences?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`);
      } catch (error) {
        console.error('Error checking profile:', error);
        router.push(`/preferences?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`);
      }
    };

    if (router.isReady && id) {
      checkAuthAndProfile();
    }
  }, [router.isReady, id]);

  // Fetch questions when profile is complete
  useEffect(() => {
    if (isProfileComplete && id) {
      const fetchQuestions = async () => {
        try {
          setIsGenerating(true);
          const token = Cookies.get('api_token');
          if (!token) {
            console.log('No token found, redirecting to signin');
            router.push(`/signin?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`);
            return;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/job/${id}/generate-technique-questions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              jobId: id
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch questions');
          }

          const data: JobQuestionsResponse = await response.json();

          const formattedQuestions: Question[] = data.questions.map((question, index) => {
            const skillIndex = index % data.requiredSkills.length;
            const skill = data.requiredSkills[skillIndex];

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
        } catch (error) {
          console.error('Error fetching questions:', error);
          router.push('/');
        } finally {
          setIsGenerating(false);
        }
      };

      fetchQuestions();
    }
  }, [isProfileComplete, id]);



  // Timer only runs when test has started
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStartedTest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (current < questions.length - 1) {
              setCurrent(c => c + 1);
              return 120; // Reset timer to 120 seconds (2 minutes)
            } else {
              stopRecording();
              saveTestResults();
              router.push('/report');
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
    setTimeLeft(120); // Reset to 120 seconds (2 minutes)
    setCurrentTranscript(''); // Clear current transcript
  }, [current]);

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

  const handleGuidelinesAccept = () => {
    setGuidelinesAccepted(true);
    setShowGuidelines(false);
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
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      saveTestResults();
      router.push('/report');
    }
  };

  const goHome = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (hasStartedTest) {
      saveTestResults();
    }
    router.push('/dashboardCandidate');
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
        pathname: '/report',
        query: { jobId: id }
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      // Still redirect to report page even if saving fails
      router.push({
        pathname: '/report',
        query: { jobId: id }
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
          router.push('/dashboardCandidate');
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

  if(!isAuthenticated){
    return null
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
          borderRadius: 4,
          background: 'white',
          backgroundColor: 'white',
          p: { xs: 2, md: 4 },
          minHeight: '80vh',
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
              onClick={() => router.push('/dashboardCandidate')}
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
                  background: 'rgba(0, 255, 157, 0.8)',
                }
              }}
            >
              I Understand & I'm Ready
            </Button>
          </DialogActions>
        </GuidelinesModal>

        <StyledAppBar position="static" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                background: GREEN_MAIN,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Skill Test ({current + 1}/{questions.length || '-'})
            </Typography>
            {hasStartedTest && (
              <Typography variant="subtitle1" sx={{ color: '#fff', mr: 2 }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
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
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
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
          maxWidth="md"
          sx={{
            flexGrow: 1,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Paper
            elevation={12}
            sx={{
              position: 'relative',
              width: '100%',
              pt: '56.25%', // 16:9
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            }}
          >
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
                borderRadius: '24px',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                border: '2px solid #e0f7fa',
              }}
            />

            <RecordingControls>
              <RecordingButton
                variant="contained"
                onClick={hasStartedTest ? undefined : startTest}
                disabled={isGenerating || hasStartedTest || isConnecting}
                sx={{
                  backgroundColor: GREEN_MAIN,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 157, 0.8)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: hasStartedTest ? '#ff4444' : 'rgba(255, 255, 255, 0.12)',
                    color: hasStartedTest ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                {isConnecting
                  ? 'Connecting...'
                  : hasStartedTest
                    ? `Recording in progress (${timeLeft}s)`
                    : 'Start Test'
                }
              </RecordingButton>
              {hasStartedTest && (
                <VoiceActivityIndicator isActive={currentTranscript.length > 0}>
                  <VoiceWaves />
                  <VoiceIcon />
                </VoiceActivityIndicator>
              )}
            </RecordingControls>

            <QuestionOverlay>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                {isGenerating ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'center',
                    background: GREEN_MAIN,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    <span>Generating your interview questions</span>
                    <Box component="span" sx={{ display: 'inline-block', animation: 'dots 1.4s infinite' }}>
                      ...
                    </Box>
                  </Box>
                ) : questions[current]?.text}
              </Typography>
            </QuestionOverlay>
          </Paper>
        </Container>

        <NavigationBar>
          <IconButton onClick={handlePrev} disabled={current === 0} sx={{ color: '#fff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={isGenerating}
            sx={{
              textTransform: 'none',
              background: GREEN_MAIN,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 2px 8px 0 rgba(0,255,157,0.10)',
              '&:hover': {
                background: GREEN_MAIN,
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            {current < questions.length - 1 ? 'Next Question' : 'Finish Test'}
          </Button>
        </NavigationBar>
      </Box>
    </Box>
  );
}

const DynamicContent = dynamic(() => Promise.resolve(Test), { ssr: false })

const TestJob: React.FC = () => {
  return <DynamicContent />
}

export default TestJob