'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  Container,
  LinearProgress,
  Paper,
  styled,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Remove hardcoded questions
const NEXTJS_QUESTIONS: string[] = [];

// Add this after imports
const GREEN_MAIN = 'rgba(0, 255, 157, 1)';


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
  boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
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

// --- Security Modal ---
const SecurityModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

// --- First Violation Modal ---
const FirstViolationModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
    backgroundColor: 'white',
  },
}));

// Add new TestLimitModal component
const TestLimitModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    margin: theme.spacing(2),
    backgroundColor: 'white',
  },
}));


export default function Test() {
  const theme = useTheme();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { data: session } = useSession();
  const userRole = useSelector((state: RootState) => state.user.userType);
  const GREEN_MAIN = userRole === 'company' ? 'rgba(0, 255, 157, 1)' : '#8310FF';

  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const currentIndexRef = useRef(0);
  const [hasStartedTest, setHasStartedTest] = useState(false);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(true);
  const [buttonTimer, setButtonTimer] = useState(2);

  // Add state for per-question transcriptions
  const [transcriptions, setTranscriptions] = useState<{ [key: number]: string }>(
    {}
  );

  const [currentTranscript, setCurrentTranscript] = useState('');

  // Add state for guidelines modal
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  // Streaming transcription state
  const [streamingToken, setStreamingToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const partialTranscriptRef = useRef<string>('');
  const accumulatedTranscriptRef = useRef<string>(''); // Track accumulated text for current question
  
  // Add question session ID to filter stale transcripts
  const questionSessionIdRef = useRef<number>(0);
  const isTransitioningRef = useRef(false);
  const isTimerTransitioning = useRef(false); // Prevent double timer transitions

  // --- Security Violation State ---
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false); // Prevent double handling

  // Add new state for test limit error
  const [showTestLimitError, setShowTestLimitError] = useState(false);

  // Question Display States
  const [questionHighlight, setQuestionHighlight] = useState(false);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setIsGenerating(true);
      // Add delay to ensure token is available
      await new Promise(resolve => setTimeout(resolve, 200));

      const token = Cookies.get('api_token');
      if (!token) {
        console.log('No token found, redirecting to home');
        router.push('/');
        return;
      }

      let endpoint = '';
      let fetchedQuestions: string[] = [];

      // Detect source based on URL parameters
      if (router.query.type && router.query.skill) {
        // This is from dashboardCandidate
        if (router.query.type === 'technical' || router.query.type === 'technicalSkill') {
          endpoint = 'evaluation/generate-technique-questions';

          // First fetch the user's profile to get the skill levels
          const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile data');
          }

          const profileData = await profileResponse.json();
          console.log('Profile data:', profileData);

          // Find the selected skill in the profile
          const selectedSkill = profileData.skills.find(
            (skill: any) => skill.name === router.query.skill
          );
          console.log('Selected skill:', selectedSkill);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              skill: router.query.skill,
              experienceLevel: router.query.type === 'technicalSkill' ? null : selectedSkill?.experienceLevel || 'Entry Level',
              proficiencyLevel: router.query.type === 'technicalSkill' ? null : selectedSkill?.proficiencyLevel || 1
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error === "You have reached your test limit (5)") {
              setShowTestLimitError(true);
              setIsGenerating(false);
              return;
            }
            throw new Error('Failed to fetch questions');
          }

          const data = await response.json();
          fetchedQuestions = data.questions;
        } else {
          // For soft skills
          endpoint = 'evaluation/generate-soft-skill-questions';

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              skill: router.query.skill,
              subSkills: router.query.language || router.query.subcategory
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error === "You have reached your test limit (5)") {
              setShowTestLimitError(true);
              setIsGenerating(false);
              return;
            }
            throw new Error('Failed to fetch questions');
          }

          const data = await response.json();
          fetchedQuestions = data.questions;
        }
      } else {
        // This is from preferences
        //endpoint = 'evaluation/generate-questions';
        endpoint = 'evaluation/generate-onboarding-questions';
        // Parse skills and their levels
        const skillsArray = router.query.skills ? (router.query.skills as string).split(',') : [];
        const proficiencyMap = router.query.proficiencyLevels ?
          Object.fromEntries(
            (router.query.proficiencyLevels as string).split(',').map(pair => {
              const [skill, level] = pair.split(':');
              return [skill, parseInt(level)];
            })
          ) : {};

        // Create structured skills array with the exact format required
        const structuredSkills = skillsArray.map(skill => ({
          name: skill,
          proficiencyLevel: proficiencyMap[skill] || 1,
          experienceLevel: router.query.experienceLevel || 'Entry Level'
        }));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // type: 'on-boarding',
            skills: structuredSkills
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === "You have reached your test limit (5)") {
            setShowTestLimitError(true);
            setIsGenerating(false);
            return;
          }
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        fetchedQuestions = data.questions;
      }

      // Set questions first
      setQuestions(fetchedQuestions);

      // Then initialize transcriptions with the fetched questions
      setTranscriptions(
        fetchedQuestions.reduce((acc: any, _: any, index: number) => ({
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


  // Audio context for streaming
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);


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
              router.push('/interview/report');
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
    partialTranscriptRef.current = ''; // Clear partial transcript
    accumulatedTranscriptRef.current = ''; // Clear accumulated transcript for new question
    setCurrentTranscript(''); // Clear the displayed transcript
    
    // Increment question session ID to reject old transcripts
    questionSessionIdRef.current = questionSessionIdRef.current + 1;
    const currentQuestionSession = questionSessionIdRef.current;
    
    console.log(`📋 Question ${current + 1} - Session ID: ${currentQuestionSession}`);
    
    // Block transcripts during transition
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
            console.error('❌ Failed to reset transcription connection:', error);
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
  }, [current]); // Only reset timer when question number changes

  // Update displayed transcript ONLY when transcriptions for current question update
  // Don't trigger on question change as that's handled above
  useEffect(() => {
    // Only update if we have stored transcription for this question
    if (transcriptions[current]) {
      setCurrentTranscript(transcriptions[current]);
    }
  }, [transcriptions]);

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

      // Setup audio context with optimal settings for AssemblyAI
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // AssemblyAI's optimal sample rate
        latencyHint: 'interactive', // Prioritize low latency for real-time
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Use optimal buffer size for real-time streaming (4096 is best for AssemblyAI)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect WebSocket with enhanced accent recognition
      const ws = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}&language_detection=true&accent_detection=true&punctuate=true&format_text=true&speaker_labels=false`
      );
      wsRef.current = ws;
      
      // Log connection ready and track connection quality
      let audioPacketsSent = 0;
      ws.addEventListener('open', () => {
        console.log('🌍 WebSocket connected - AssemblyAI ready with GLOBAL ACCENT RECOGNITION');
        console.log('🎯 Enhanced features: Language detection, accent detection, punctuation, formatting');
        console.log('ℹ️ Session info: 16kHz audio, real-time streaming enabled for ALL accents');
      });

      ws.onopen = () => {
        console.log('🌍 Recording started - Capturing speech from ANY accent worldwide');
        console.log('🎯 AI will understand: American, British, Australian, Indian, African, European, Asian accents');
        setIsConnecting(false);

        // Connect audio processing with minimal interference
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputBuffer = event.inputBuffer.getChannelData(0);

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
                
                // Log streaming status every 100 packets (~10 seconds)
                if (audioPacketsSent % 100 === 0) {
                  console.log(`📡 Streaming: ${audioPacketsSent} audio packets sent to AssemblyAI`);
                }
              } catch (error) {
                console.error('❌ Error sending audio:', error);
              }
            }
          }
        };
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
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
              // Use confidence threshold if available
              const confidence = data.confidence || 0;
              const words = data.words || [];
              
              // Log AssemblyAI's transcription with full details
              if (text !== cleanedText) {
                console.log(`🔧 Fixed spacing: "${text}" → "${cleanedText}"`);
              }
              
              const confidencePercent = (confidence * 100).toFixed(1);
              const confidenceEmoji = confidence >= 0.9 ? '🟢' : confidence >= 0.7 ? '🟡' : '🔴';
              console.log(`${confidenceEmoji} [${confidencePercent}%] "${cleanedText}"`);
              
              // Show word-level analysis for transparency
              if (words && words.length > 0) {
                const lowConfidenceWords = words.filter((w: any) => w.confidence < 0.8);
                if (lowConfidenceWords.length > 0) {
                  console.log('⚠️ Low confidence words:', lowConfidenceWords.map((w: any) => 
                    `"${w.text}" (${(w.confidence * 100).toFixed(0)}%)`
                  ).join(', '));
                }
              }
              
              // Update accumulated ref
              accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + cleanedText).trim();
              
              // Store in transcriptions state
              setTranscriptions(prevT => {
                return {
                  ...prevT,
                  [currentIndexRef.current]: accumulatedTranscriptRef.current
                };
              });
              
              // Update display
              setCurrentTranscript(accumulatedTranscriptRef.current);
              
              // Clear partial transcript ref after final
              partialTranscriptRef.current = '';
              
              // Reset speech active indicator after a delay
              setTimeout(() => setIsSpeechActive(false), 1500);
            } else {
              // For partial transcripts, show accumulated + partial without storing
              partialTranscriptRef.current = cleanedText;
              const displayText = accumulatedTranscriptRef.current 
                ? (accumulatedTranscriptRef.current + ' ' + cleanedText).trim() 
                : cleanedText;
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
    fetchQuestions()
    setGuidelinesAccepted(true);
    setShowGuidelines(false);
  };

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

  // Modify startTest to enable next button for first question
  const startTest = async () => {
    if (!guidelinesAccepted) {
      setShowGuidelines(true);
      return;
    }

    try {
      // Get audio stream
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
      setNextButtonDisabled(false); // Enable next button for first question
    } catch (error) {
      console.error('Recording setup error:', error);
      setIsRecording(false);
      setHasStartedTest(false);
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      saveTestResults();
      // Store current URL in localStorage before navigation
      localStorage.setItem('previousUrl', window.location.href);
      // Check if this is an on-boarding test
      if (router.query.type === 'on-boarding') {
        router.push({
          pathname: '/interview/report/on-boarding',
          query: {
            type: 'technicalSkill',
            skills: router.query.skills,
            proficiencyLevels: router.query.proficiencyLevels,
            experienceLevel: router.query.experienceLevel
          }
        });
      } else {
        // For technical type, pass the skill and proficiency parameters
        router.push({
          pathname: '/interview/report',
          query: {
            from: 'test',
            type: router.query.type || 'technical',
            skill: router.query.skill,
            proficiency: router.query.proficiency,
            subcategory: router.query.subcategory
          }
        });
      }
    }
  };

  const goHome = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (hasStartedTest) {
      // Save test results without navigating to report
      const results = questions.map((question, index) => ({
        question,
        answer: transcriptions[index] || ''
      }));

      const testData = {
        results,
        metadata: {
          type: router.query.type === 'on-boarding' ? 'technicalSkill' : (router.query.type || 'technical'),
          skill: router.query.skill,
          subcategory: router.query.subcategory,
          proficiency: router.query.proficiency,
          timestamp: new Date().toISOString()
        }
      };

      localStorage.setItem('test_results', JSON.stringify(testData));
      localStorage.setItem('last_test_type', router.query.type === 'on-boarding' ? 'technicalSkill' : (router.query.type as string || 'technical'));
      localStorage.setItem('previousUrl', window.location.href);
    }
    // Go directly to dashboard without redirecting to report
    router.push('/dashboard/candidate');
  };

  // Function to save test results
  const saveTestResults = () => {
    const results = questions.map((question, index) => ({
      question,
      answer: transcriptions[index] || ''
    }));

    // Save test results with metadata
    const testData = {
      results,
      metadata: {
        type: router.query.type === 'on-boarding' ? 'technicalSkill' : (router.query.type || 'technical'),
        skill: router.query.skill,
        subcategory: router.query.subcategory,
        proficiency: router.query.proficiency,
        timestamp: new Date().toISOString()
      }
    };

    localStorage.setItem('test_results', JSON.stringify(testData));
    localStorage.setItem('last_test_type', router.query.type === 'on-boarding' ? 'technicalSkill' : (router.query.type as string || 'technical'));

    // Only navigate if not already navigating in handleNext
    if (current < questions.length - 1) {
      router.push({
        pathname: '/interview/report',
        query: {
          from: 'test',
          type: router.query.type || 'technical',
          skill: router.query.skill,
          proficiency: router.query.proficiency,
          subcategory: router.query.subcategory
        }
      });
    }
  };

  // Security violation handler
  const handleSecurityViolation = async () => {
    setSecurityViolationCount((prev) => {
      const next = prev + 1;
      if (next === 1) {
        // First violation: show intelligent popup
        setShowFirstViolationModal(true);
        // Call warning API

      } else if (next === 2) {
        // Second violation: redirect and show modal
        setShowSecurityModal(true);
        stopRecording();
        const token = localStorage.getItem('api_token');
        if (token) {
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/warnUser`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          }).catch(error => {
            console.error('Error sending warning:', error);
          });
        }
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
  }, [hasStartedTest, handleSecurityViolation]);

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
  }, [hasStartedTest, handleSecurityViolation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
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
      `}</style>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Add Test Limit Error Modal */}
      <TestLimitModal
        open={showTestLimitError}
        onClose={() => router.push('/dashboard/candidate')}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#000000',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          Test Limit Reached
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#000000', mb: 2, textAlign: 'center' }}>
            You have reached your maximum limit of 5 tests. Please contact support if you need to take more tests.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard/candidate')}
            sx={{
              background: GREEN_MAIN,
              color: '#000000',
              '&:hover': {
                background: 'rgba(0, 255, 157, 0.9)',
              }
            }}
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </TestLimitModal>

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
              background: 'rgba(0, 255, 157, 1)',
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
          borderBottom: 'white',
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

          <GuidelineItem sx={{ color: '#000' }}>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>⏱️</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>
                Time Commitment
              </Typography>
              <Typography variant="body2" sx={{ color: '#000' }}>
                Set aside 30 minutes of uninterrupted time. The test cannot be paused once started.
              </Typography>
            </Box>
          </GuidelineItem>

          <GuidelineItem>
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>🔇</Box>
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
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>🎥</Box>
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
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>👤</Box>
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
            <Box sx={{ color: '#02E2FF', mt: 0.5 }}>💻</Box>
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
              color: 'black ',
              '&:hover': { color: 'black' }
            }}
          >
            I'm Not Ready
          </Button>
          <Button
            variant="contained"
            onClick={handleGuidelinesAccept}
            sx={{
              background: GREEN_MAIN,
              color: '#fff',
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                background: GREEN_MAIN,
              }
            }}
          >
            I Understand & I'm Ready
          </Button>
        </DialogActions>
      </GuidelinesModal>

      {/* Top Header Bar */}
      <Paper elevation={3} sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 0,
        mb: 0
      }}>
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 0 },
          py: { xs: 1, sm: 0 },
        }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Technical Skill Test ({current + 1}/{questions.length || '-'})
          </Typography>
          {hasStartedTest && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mr: { xs: 0, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textAlign: { xs: 'center', sm: 'left' },
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
              color: 'white',
              borderColor: 'white',
              textTransform: 'none',
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' },
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
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#00ff9d',
            },
          }}
        />
      </Paper>

      <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
        {/* Prominent Question Panel - Always visible during test */}
        {hasStartedTest && !isGenerating && questions[current] && (
          <QuestionPanel
            elevation={6}
            className={questionHighlight ? 'question-highlight' : ''}
          >
            <QuestionContent>
              <QuestionText variant="body1">
                {questions[current] || "Loading next question..."}
              </QuestionText>
            </QuestionContent>
          </QuestionPanel>
        )}

        {/* Compact Camera Preview */}
        <Paper elevation={2} sx={{
          p: 2,
          mb: 3,
          ...(hasStartedTest ? {
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
                <Box sx={{
                  ml: 1,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: isSpeechActive ? '#00ff9d' : '#4caf50',
                  animation: 'pulse 1s ease-in-out infinite'
                }} />
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
              disabled={isGenerating || isConnecting}
              sx={{ 
                px: 4, 
                py: 1.5,
                background: GREEN_MAIN,
                '&:hover': {
                  background: GREEN_MAIN,
                }
              }}
            >
              {isConnecting ? 'Connecting...' : 'Start Test'}
            </Button>
          </Box>
        )}
      </Container>

      {/* Bottom Navigation */}
      <Paper elevation={3} sx={{
        position: 'sticky',
        bottom: 0,
        mt: 'auto',
        borderRadius: 0,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        background: 'white',
        zIndex: 100
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          gap: 2
        }}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={isGenerating || (current > 0 && nextButtonDisabled)}
            sx={{
              textTransform: 'none',
              background: nextButtonDisabled ? 'rgba(0,0,0,0.12)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '300px', sm: 'none' },
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: nextButtonDisabled ? 'rgba(0,0,0,0.12)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
              },
              '&.Mui-disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)',
              }
            }}
          >
            {current < questions.length - 1
              ? `Next Question${nextButtonDisabled ? ` (${buttonTimer}s)` : ''}`
              : 'Finish Test'}
          </Button>
        </Box>
      </Paper>
      </Box>
    </>
  );
}