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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

// --- Styled Components ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(0, 7, 45, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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

export default function Test() {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const currentIndexRef = useRef(0);

  // Interval used to finalize each chunk
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [allTranscriptions, setAllTranscriptions] = useState<string[]>([]);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = Cookies.get('api_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/generate-questions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Timer resets when question changes
  useEffect(() => {
    currentIndexRef.current = current;
    setTimeLeft(5);
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

  // Optional: fetch session data if needed
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/session');
        const data = await response.json();
        console.log('Session data:', data);
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };
    initializeSession();
  }, []);

  // Helper to create a new MediaRecorder for each chunk
  const createMediaRecorder = (stream: MediaStream) => {
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000,
    };
    const recorder = new MediaRecorder(stream, options);

    // Fired once a chunk completes (onstop or after recorder.stop())
    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        try {
          setIsTranscribing(true);
          const formData = new FormData();
          formData.append('audio', event.data, 'recording.webm');
          console.log('Sending audio chunk, size =', event.data.size);

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
            setTranscription(prev => prev + ' ' + text.trim());
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

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop chunk finalization
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
      // Stop the current recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      // Stop audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      setIsRecording(false);
    } else {
      try {
        setTranscription('');
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

        // Create first recorder
        mediaRecorderRef.current = createMediaRecorder(stream);
        mediaRecorderRef.current.start(); // Start recording

        // Example chunk every 5 seconds (adjust as needed)
        chunkIntervalRef.current = setInterval(() => {
          finalizeChunk();
        }, 5000);

        setIsRecording(true);
      } catch (error) {
        console.error('Recording setup error:', error);
        setIsRecording(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handlePrev = () => {
    // Load previous transcription when going back
    const prevIndex = current - 1;
    if (prevIndex >= 0) {
      setTranscription(allTranscriptions[prevIndex] || '');
      setCurrent(prevIndex);
    }
  };

  const handleNext = () => {
    // Save current transcription
    const newTranscriptions = [...allTranscriptions];
    newTranscriptions[current] = transcription;
    setAllTranscriptions(newTranscriptions);
    
    // Clear current transcription for next question
    setTranscription('');
    
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      // Save all transcriptions to localStorage before going to report
      localStorage.setItem('test_transcripts', JSON.stringify(newTranscriptions));
      router.push('/report');
    }
  };

  const goHome = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    router.push('/');
  };

  // Show loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#00072D'
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="white">
          Loading your interview questions...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#00072D',
          padding: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/preferences')}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
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
            Skill Test ({current + 1}/{questions.length})
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#fff', mr: 2 }}>
            0:{timeLeft.toString().padStart(2, '0')}
          </Typography>
          <Button
            startIcon={<CallEndIcon />}
            onClick={goHome}
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
          variant="determinate"
          value={((current + 1) / questions.length) * 100}
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
        maxWidth="md"
        sx={{
          flexGrow: 1,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={12}
          sx={{
            position: 'relative',
            width: '100%',
            pt: '56.25%', // 16:9
            borderRadius: 2,
            overflow: 'hidden',
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
            }}
          />

          <RecordingControls>
            <RecordingButton
              variant="contained"
              onClick={toggleRecording}
              sx={{
                backgroundColor: isRecording ? '#ff4444' : '#02E2FF',
                '&:hover': {
                  backgroundColor: isRecording ? '#cc0000' : '#00C3FF',
                },
              }}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </RecordingButton>
            {isTranscribing ? (
              <TranscriptDisplay variant="body2">
                Processing...
              </TranscriptDisplay>
            ) : (
              <TranscriptDisplay variant="body2">
                {transcription}
              </TranscriptDisplay>
            )}
          </RecordingControls>

          <QuestionOverlay>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Question {current + 1} of {questions.length}
            </Typography>
            <Typography variant="h6">
              {questions[current]}
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
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
            },
          }}
        >
          {current < questions.length - 1 ? 'Next Question' : 'Finish Test'}
        </Button>
      </NavigationBar>
    </Box>
  );
}
