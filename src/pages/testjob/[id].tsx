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

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(0, 7, 45, 0.8)',
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
  background: 'rgba(0, 7, 45, 0.8)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const GuidelinesModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(15, 23, 42, 0.95)',
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

const SecurityModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(244, 67, 54, 0.95)',
    color: '#fff',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxWidth: '480px',
    margin: theme.spacing(2),
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
}));

const FirstViolationModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#00072D',
    backgroundImage: `
      radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
    `,
    color: '#fff',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '420px',
    margin: theme.spacing(2),
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'rgba(0, 7, 45, 0.8)',
  backdropFilter: 'blur(10px)',
  borderLeft: '1px solid rgba(255,255,255,0.1)',
  padding: theme.spacing(3),
}));

const QuestionBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const AnswerBox = styled(Box)(({ theme }) => ({
  background: 'rgba(2, 226, 255, 0.1)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  border: '1px solid rgba(2, 226, 255, 0.2)',
  flex: 1,
  overflowY: 'auto',
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

interface Question {
  id: string;
  text: string;
  skill: string;
  level: string;
}

export default function TestJob() {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();
  const { id } = router.query;

  const fetchJobQuestions = async () => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}jobs/${id}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching job questions:', error);
    }
  };

  // Add authentication check
  useEffect(() => {
    if (router.isReady) {
      const token = localStorage.getItem('api_token');
      if (!token) {
        // Construct the return URL with the current job ID
        const returnUrl = encodeURIComponent(`/testjob/${router.query.id}`);
        router.push(`/signin?returnUrl=${returnUrl}`);
        return;
      }
      // Continue with fetching job questions if token exists
      fetchJobQuestions();
    }
  }, [router.isReady, router.query.id]);

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
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

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

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
          channelCount: 1,
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
      streamRef.current = stream;
      setIsRecording(true);
      setTimeLeft(120);
      startSpeechRecognition();
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    stopSpeechRecognition();
  };

  // Speech recognition setup
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setCurrentTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        stopRecording();
      }
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.stop();
    }
  };

  // Add visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStartedTest && !violationHandledRef.current) {
        handleSecurityViolation(['visibility_change']);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasStartedTest && !violationHandledRef.current) {
        handleSecurityViolation(['page_leave']);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Add screenshot detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasStartedTest && !violationHandledRef.current) {
        // Check for PrintScreen key
        if (e.key === 'PrintScreen') {
          handleSecurityViolation(['screenshot']);
        }
        // Check for Alt + PrintScreen
        if (e.altKey && e.key === 'PrintScreen') {
          handleSecurityViolation(['screenshot']);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStartedTest]);

  // Update security violation handling
  const handleSecurityViolation = (violations: string[]) => {
    violationHandledRef.current = true;
    setSecurityViolationCount(prev => prev + 1);

    if (securityViolationCount === 0) {
      setShowFirstViolationModal(true);
    } else {
      setShowSecurityModal(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  // Update modal close handlers
  const handleCloseSecurityModal = () => {
    setShowSecurityModal(false);
    router.push('/');
  };

  const handleCloseFirstViolationModal = () => {
    setShowFirstViolationModal(false);
    violationHandledRef.current = false;
  };

  // Update start test function
  const startTest = () => {
    setHasStartedTest(true);
    startRecording();
  };

  // Save answer when moving to next question
  const handleNext = async () => {
    if (current < questions.length - 1) {
      try {
        const token = localStorage.getItem('api_token');
        
        if (!token) {
          console.error('Missing token');
          return;
        }

        // Stop only the audio recording and speech recognition
        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach(track => track.stop());
        }
        stopSpeechRecognition();

        // Save current answer
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/save-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId: questions[current].id,
            answer: transcriptions[questions[current].id] || '',
            skill: questions[current].skill,
            level: questions[current].level,
          }),
        });

        // Move to next question
        setCurrent(prev => prev + 1);
        setTimeLeft(120);
        setCurrentTranscript('');
        violationHandledRef.current = false;

        // Restart audio recording if it was active
        if (isRecording) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
          startSpeechRecognition();
        }
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    } else {
      // This is the last question, save the final answer and redirect to report
      try {
        const token = localStorage.getItem('api_token');
        
        if (!token) {
          console.error('Missing token');
          return;
        }

        // Stop recording and speech recognition
        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach(track => track.stop());
        }
        stopSpeechRecognition();

        // Save final answer
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/save-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId: questions[current].id,
            answer: transcriptions[questions[current].id] || '',
            skill: questions[current].skill,
            level: questions[current].level,
          }),
        });

        // Store test metadata in localStorage
        const testData = {
          results: questions.map((q, index) => ({
            question: q.text,
            answer: transcriptions[q.id] || ''
          })),
          metadata: {
            type: 'job',
            jobId: id,
            timestamp: new Date().toISOString()
          }
        };
        localStorage.setItem('test_results', JSON.stringify(testData));

        // Redirect to report page with job ID
        router.push({
          pathname: '/report',
          query: {
            from: 'testjob',
            jobId: id
          }
        });
      } catch (error) {
        console.error('Error saving final answer:', error);
      }
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (current > 0) {
      // Stop only the audio recording and speech recognition
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => track.stop());
      }
      stopSpeechRecognition();

      setCurrent(prev => prev - 1);
      setTimeLeft(120);
      setCurrentTranscript('');
      violationHandledRef.current = false;

      // Restart audio recording if it was active
      if (isRecording) {
        startRecording();
      }
    }
  };

  // Guidelines handling
  const handleAcceptGuidelines = () => {
    setGuidelinesAccepted(true);
    setShowGuidelines(false);
    setHasStartedTest(true);
  };

  if (isGenerating) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#00072D' }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#00072D',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
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
              router.push('/dashboardCandidate');
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
              backgroundImage: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            },
          }}
        />
      </StyledAppBar>

      <Container 
        maxWidth={false}
        sx={{
          flexGrow: 1,
          py: 4,
          display: 'flex',
          gap: 3,
          height: 'calc(100vh - 128px)',
        }}
      >
        <Paper
          elevation={12}
          sx={{
            position: 'relative',
            width: '60%',
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <video
            ref={videoRef}
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
            }}
          />

          {hasStartedTest && (
            <RecordingControls>
              <RecordingButton
                variant="contained"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={timeLeft === 0}
                sx={{
                  backgroundColor: '#02E2FF',
                  '&:hover': {
                    backgroundColor: '#00C3FF',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: isRecording ? '#ff4444' : 'rgba(255, 255, 255, 0.12)',
                    color: isRecording ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                {isRecording ? `Recording in progress (${timeLeft}s)` : 'Start Recording'}
              </RecordingButton>
              <TranscriptDisplay variant="body2">
                {currentTranscript || 'Speak now...'}
              </TranscriptDisplay>
            </RecordingControls>
          )}
        </Paper>

        <ChatContainer>
          <QuestionBox>
            <Typography variant="h6" sx={{ 
              color: '#fff',
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              mb: 1
            }}>
              Current Question
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {isGenerating ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'center',
                }}>
                  <span>Generating your interview questions</span>
                  <Box component="span" sx={{ display: 'inline-block', animation: 'dots 1.4s infinite' }}>
                    ...
                  </Box>
                </Box>
              ) : questions[current]?.text}
            </Typography>
          </QuestionBox>

          <AnswerBox>
            <Typography variant="h6" sx={{ 
              color: '#02E2FF',
              fontWeight: 600,
              mb: 2
            }}>
              Your Answer
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {currentTranscript || 'Your answer will appear here as you speak...'}
            </Typography>
          </AnswerBox>
        </ChatContainer>
      </Container>

      <NavigationBar>
        <IconButton 
          onClick={handlePrevious} 
          disabled={current === 0} 
          sx={{ color: '#fff' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNext}
          disabled={isGenerating}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
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

      {/* Guidelines Modal */}
      <GuidelinesModal
        open={showGuidelines}
        onClose={() => {}}
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
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Important Test Guidelines
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: theme.spacing(4) }}>
          <Typography variant="body1" sx={{ color: '#fff', mb: 3, opacity: 0.9 }}>
            Please ensure you meet the following requirements before starting the test:
          </Typography>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>⏱️</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                Time Commitment
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Set aside 30 minutes of uninterrupted time. The test cannot be paused once started.
              </Typography>
            </Box>
          </GuidelineItem>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>🔇</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                Quiet Environment
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Find a quiet room with no background noise. Background sounds can affect your test results.
              </Typography>
            </Box>
          </GuidelineItem>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>🎥</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                Camera and Microphone
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Ensure your camera and microphone are working properly. Test will use both for recording.
              </Typography>
            </Box>
          </GuidelineItem>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>👤</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                Individual Assessment
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Complete the test alone. No other people should be present or helping during the assessment.
              </Typography>
            </Box>
          </GuidelineItem>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>💻</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                Technical Setup
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Use a stable internet connection. Close other applications that might use your camera or microphone.
              </Typography>
            </Box>
          </GuidelineItem>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            onClick={handleAcceptGuidelines}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#00072D',
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
              },
            }}
          >
            I Accept
          </Button>
        </DialogActions>
      </GuidelinesModal>

      {/* Security Violation Modal */}
      <SecurityModal
        open={showSecurityModal}
        onClose={handleCloseSecurityModal}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#fff', fontSize: '1.5rem' }}>
          Security Violation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
            You have attempted to leave or capture the test page more than once. For security reasons, your test has ended and you are being redirected to the dashboard.
          </Typography>
        </DialogContent>
      </SecurityModal>

      {/* First Violation Modal */}
      <FirstViolationModal
        open={showFirstViolationModal}
        onClose={handleCloseFirstViolationModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#fff', pt: 3 }}>
          Heads Up!
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
            For security reasons, leaving or capturing the test page is not allowed.<br />
            <b>If you do this again, your test will end and you will be redirected.</b>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleCloseFirstViolationModal}
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
    </Box>
  );
} 