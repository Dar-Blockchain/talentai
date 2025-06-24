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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();

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
  const [hrTestReason, setHrTestReason] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyCulture, setCompanyCulture] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interviewFormat, setInterviewFormat] = useState('');
  const [simulationGoal, setSimulationGoal] = useState('');
  const [feedbackPreference, setFeedbackPreference] = useState('');

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

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);

 
  // Fetch questions when profile is complete
//   useEffect(() => {
//     if (isProfileComplete && id) {
//       const fetchQuestions = async () => {
//         try {
//           setIsGenerating(true);
//           const token = Cookies.get('api_token');
//           if (!token) {
//             console.log('No token found, redirecting to signin');
//             router.push(`/signin?returnUrl=${encodeURIComponent(`/testjob/${id}`)}`);
//             return;
//           }

//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/job/${id}/generate-technique-questions`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//               jobId: id
//             })
//           });

//           if (!response.ok) {
//             throw new Error('Failed to fetch questions');
//           }

//           const data: JobQuestionsResponse = await response.json();
//           setTestedSkills(data.testedSkills);

//           const formattedQuestions: Question[] = data.questions.map((question, index) => {
//             const skillIndex = index % data.requiredSkills.length;
//             const skill = data.requiredSkills[skillIndex];

//             return {
//               id: `q_${index + 1}`,
//               text: question,
//               skill: skill.name,
//               level: skill.level
//             };
//           });

//           setQuestions(formattedQuestions);
//           setTranscriptions(
//             formattedQuestions.reduce((acc: any, _: any, index: number) => ({
//               ...acc,
//               [index]: ''
//             }), {})
//           );
//         } catch (error) {
//           console.error('Error fetching questions:', error);
//           router.push('/');
//         } finally {
//           setIsGenerating(false);
//         }
//       };

//       fetchQuestions();
//     }
//   }, [isProfileComplete, id]);



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

  const handleGuidelinesAccept = async () => {
    try {
      setIsGenerating(true);
      const token = Cookies.get('api_token');
      
      // Prepare the request body with all form data
      const requestBody = {
        targetCompany: targetCompany === 'Custom' ? customCompany : targetCompany,
        companyIndustry: targetCompany === 'Custom' ? companyIndustry : null,
        companyCulture: targetCompany === 'Custom' ? companyCulture : null,
        targetRole,
        experienceLevel,
        interviewFormat,
        simulationGoal,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/generate-hr-questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      
      // Store the testInterview token (use api_token if no specific token provided)
      const testInterviewToken = data.testInterviewToken || token;
      localStorage.setItem('testInterview', testInterviewToken);
      Cookies.set('testInterview', testInterviewToken, { expires: 7 });
      
      // Handle the HR questions API response format
      const formattedQuestions: Question[] = data.questions.map((question: string, index: number) => {
        return {
          id: `q_${index + 1}`,
          text: question,
          skill: 'Communication & Collaboration', // Default skill for HR questions
          level: 'Intermediate' // Default level for HR questions
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
        testedSkills: ['Communication & Collaboration'], // Default for HR questions
        metadata: {
          type: 'hr_assessment',
          timestamp: new Date().toISOString(),
          hrTestReason: hrTestReason, // Include the user's reason
          targetCompany,
          customCompany,
          companyIndustry,
          companyCulture,
          targetRole,
          experienceLevel,
          interviewFormat,
          simulationGoal,
        }
      };

      // Store in both localStorage and Cookies
      localStorage.setItem('test_results', JSON.stringify(testData));
      Cookies.set('test_results', JSON.stringify(testData), { expires: 7 });

      // Navigate to report page
      router.push({
        pathname: '/reportInterviewTest',
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      // Still redirect to report page even if saving fails
      router.push({
        pathname: '/reportInterviewTest',
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
              You have attempted to leave or capture the assessment page more than once. For security reasons, your assessment has ended and you are being redirected to the dashboard.
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
              For security reasons, leaving or capturing the assessment page is not allowed.<br />
              <b>If you do this again, your assessment will end and you will be redirected.</b>
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
              Tell Us About Your Goals
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: theme.spacing(4) }}>
            <Typography variant="body1" sx={{ color: '#000', mb: 3, opacity: 0.9 }}>
              Let's personalize your HR interview simulation. Please answer a few questions to help us tailor the experience:
            </Typography>

            {/* Company Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                Which company are you targeting for this HR interview simulation?
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select a company</MenuItem>
                  <MenuItem value="Google">Google</MenuItem>
                  <MenuItem value="Meta">Meta</MenuItem>
                  <MenuItem value="Amazon">Amazon</MenuItem>
                  <MenuItem value="Airbnb">Airbnb</MenuItem>
                  <MenuItem value="EY">EY</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>

              {/* Custom Company Fields */}
              {targetCompany === 'Custom' && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Industry/Sector</InputLabel>
                    <Select
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      label="Industry/Sector"
                    >
                      <MenuItem value="Fintech">Fintech</MenuItem>
                      <MenuItem value="Healthcare">Healthcare</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="E-commerce">E-commerce</MenuItem>
                      <MenuItem value="Consulting">Consulting</MenuItem>
                      <MenuItem value="AI">AI</MenuItem>
                      <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                      <MenuItem value="Retail">Retail</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Company Culture/Values (e.g., fast-paced, collaborative, traditional)"
                    value={companyCulture}
                    onChange={(e) => setCompanyCulture(e.target.value)}
                    placeholder="e.g., fast-paced, collaborative, mission-driven, innovation-focused"
                  />
                </Box>
              )}
            </Box>

            {/* Target Role */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                What role are you applying for?
              </Typography>
              <TextField
                fullWidth
                label="Role Title"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager, Product Designer, Analyst"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: GREEN_MAIN,
                    },
                  },
                }}
              />
            </Box>

            {/* Experience Level */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                What level of experience are you aiming for in this role?
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select experience level</MenuItem>
                  <MenuItem value="Entry-Level">Entry-Level</MenuItem>
                  <MenuItem value="Mid-Level">Mid-Level</MenuItem>
                  <MenuItem value="Senior">Senior</MenuItem>
                  <MenuItem value="Leadership">Leadership</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Interview Format */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                What type of interview format do you want to practice?
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={interviewFormat}
                  onChange={(e) => setInterviewFormat(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select interview format</MenuItem>
                  <MenuItem value="Phone Screen">Phone Screen</MenuItem>
                  <MenuItem value="Onsite HR Interview">Onsite HR Interview</MenuItem>
                  <MenuItem value="Behavioral Round">Behavioral Round</MenuItem>
                  <MenuItem value="Cultural Fit">Cultural Fit</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Simulation Goal */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                What is your current goal for this simulation?
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={simulationGoal}
                  onChange={(e) => setSimulationGoal(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your goal</MenuItem>
                  <MenuItem value="Practice for a real interview">Practice for a real interview</MenuItem>
                  <MenuItem value="Build confidence">Build confidence</MenuItem>
                  <MenuItem value="Understand what HR looks for">Understand what HR looks for</MenuItem>
                  <MenuItem value="Test my soft skills">Test my soft skills</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Feedback Preference */}
            {/* <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 2 }}>
                Would you like real-time feedback and scoring after each response or only at the end?
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={feedbackPreference}
                  onChange={(e) => setFeedbackPreference(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GREEN_MAIN,
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select feedback preference</MenuItem>
                  <MenuItem value="Real-time feedback">Real-time feedback</MenuItem>
                  <MenuItem value="End-of-simulation report">End-of-simulation report</MenuItem>
                </Select>
              </FormControl>
            </Box> */}

            <Box sx={{ 
              background: 'rgba(131, 16, 255, 0.05)', 
              padding: theme.spacing(2), 
              borderRadius: '12px',
              border: '1px solid rgba(131, 16, 255, 0.1)'
            }}>
              <Typography variant="body2" sx={{ color: '#000', opacity: 0.8 }}>
                💡 <strong>Tip:</strong> The more specific you are, the better we can tailor the interview questions and feedback to your target role and company culture.
              </Typography>
            </Box>
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
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleGuidelinesAccept}
              disabled={!targetCompany || !targetRole || !experienceLevel || !interviewFormat || !simulationGoal  || (targetCompany === 'Custom' && (!customCompany || !companyIndustry))}
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
                },
                '&.Mui-disabled': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  color: 'rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              Start Assessment
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
              HR Assessment ({current + 1}/{questions.length || '-'})
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
              End Assessment
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
            py: { xs: 2, sm: 4 }, // Responsive padding
            px: { xs: 1, sm: 2 }, // Add horizontal padding for mobile
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            boxShadow: 'none',
            minHeight: { xs: '60vh', sm: 'auto' }, // Ensure minimum height on mobile
          }}
        >
          <Paper
            elevation={12}
            sx={{
              position: 'relative',
              width: '100%',
              pt: { xs: '75%', sm: '56.25%' }, // Responsive aspect ratio (4:3 on mobile, 16:9 on desktop)
              borderRadius: { xs: 2, sm: 4 }, // Responsive border radius
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
              maxHeight: { xs: '70vh', sm: 'none' }, // Limit height on mobile
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
                    backgroundColor: GREEN_MAIN,
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
                    ? `Recording (${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')} min)`
                    : 'Start Assessment'
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
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#fff',
                  fontSize: { xs: '1rem', sm: '1.25rem' }, // Responsive font size
                  lineHeight: { xs: 1.3, sm: 1.4 }, // Responsive line height
                  textAlign: 'center',
                  px: { xs: 1, sm: 0 }, // Add horizontal padding on mobile
                  wordBreak: 'break-word', // Prevent text overflow
                  maxWidth: '100%',
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
                    flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
                  }}>
                    <span>Generating your HR assessment questions</span>
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
              : 'Finish Assessment'}
          </Button>
        </NavigationBar>
      </Box>
    </Box>
  );
}

const DynamicContent = dynamic(() => Promise.resolve(Test), { ssr: false })

const interviewTest: React.FC = () => {
  return <DynamicContent />
}

export default interviewTest