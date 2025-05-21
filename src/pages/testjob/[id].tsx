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

// Remove hardcoded questions
const NEXTJS_QUESTIONS: string[] = [];

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

// Add new styled components for the guidelines modal
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

export default function Test() {
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
              ((profileData.type === 'Candidate' && profileData.skills && profileData.skills.length > 0) ||
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

  // Interval used to finalize each chunk
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);

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

  const stopRecording = () => {
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
    setHasStartedTest(false);
  };

  const handleGuidelinesAccept = () => {
    setGuidelinesAccepted(true);
    setShowGuidelines(false);
  };

  // Modify startTest to check guidelines acceptance
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
          sampleRate: 48000,
          channelCount: 1,
        },
      });
      audioStreamRef.current = stream;

      // Create first recorder
      mediaRecorderRef.current = createMediaRecorder(stream);
      mediaRecorderRef.current.start(); // Start recording

      // Process chunks more frequently (every 2 seconds)
      chunkIntervalRef.current = setInterval(() => {
        finalizeChunk();
      }, 2000);

      setIsRecording(true);
      setHasStartedTest(true);
      setTimeLeft(120); // Start with 120 seconds (2 minutes)
    } catch (error) {
      console.error('Recording setup error:', error);
      setIsRecording(false);
      setHasStartedTest(false);
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
        <DialogActions sx={{
          padding: theme.spacing(3),
          borderTop: '1px solid rgba(255,255,255,0.1)',
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={() => router.push('/dashboardCandidate')}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff' }
            }}
          >
            I'm Not Ready
          </Button>
          <Button
            variant="contained"
            onClick={handleGuidelinesAccept}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#fff',
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
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
              onClick={hasStartedTest ? undefined : startTest}
              disabled={isGenerating || hasStartedTest}
              sx={{
                backgroundColor: '#02E2FF',
                '&:hover': {
                  backgroundColor: '#00C3FF',
                },
                '&.Mui-disabled': {
                  backgroundColor: hasStartedTest ? '#ff4444' : 'rgba(255, 255, 255, 0.12)',
                  color: hasStartedTest ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              {hasStartedTest ? `Recording in progress (${timeLeft}s)` : 'Start Test'}
            </RecordingButton>
            <TranscriptDisplay variant="body2">
              {isTranscribing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#02E2FF' }} />
                  <span>Processing audio...</span>
                </Box>
              ) : (
                currentTranscript || 'Speak now...'
              )}
            </TranscriptDisplay>
          </RecordingControls>

          <QuestionOverlay>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              {isGenerating ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
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
    </Box>
  );
}