// pages/test.tsx
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
    Fade,
    IconButton,
    styled
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'rgba(0, 7, 45, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const VideoContainer = styled(Paper)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '24px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
    }
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
    }
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
    }
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

// Add new styled components for camera status
const CameraStatus = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 16,
    right: 16,
    padding: theme.spacing(1),
    borderRadius: '12px',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: '#fff',
    zIndex: 1,
}));

const CameraLoading = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    zIndex: 1,
}));

// Add type definitions for speech recognition
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
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>([]);
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [transcripts, setTranscripts] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [currentTranscript, setCurrentTranscript] = useState('');

    useEffect(() => {
        const initializeCamera = async () => {
            try {
                setCameraStatus('loading');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        facingMode: 'user',
                        aspectRatio: 16 / 9
                    },
                    audio: false
                });

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraStatus('active');
                    };
                }
            } catch (error) {
                console.error('Camera error:', error);
                setCameraStatus('error');
                if (error instanceof Error) {
                    if (error.name === 'NotAllowedError') {
                        setErrorMessage('Camera access was denied. Please allow camera access to continue.');
                    } else if (error.name === 'NotFoundError') {
                        setErrorMessage('No camera found. Please connect a camera to continue.');
                    } else {
                        setErrorMessage('Failed to access camera. Please try again.');
                    }
                }
            }
        };

        initializeCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const skills = JSON.parse(localStorage.getItem('prefs_skills') || '[]');
        const qs = skills.length
            ? skills.map((skill: string) => `Describe a project where you used ${skill}.`)
            : ['No skills found.'];
        setQuestions(qs);
    }, []);

    // Initialize transcripts array with empty strings
    useEffect(() => {
        const initialTranscripts = Array(questions.length).fill('');
        setTranscripts(initialTranscripts);
    }, []);

    useEffect(() => {
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setCurrentTranscript(transcript);
                updateTranscript(transcript);
            };

            recognition.onerror = (event: SpeechRecognitionError) => {
                console.error('Speech recognition error:', event.error);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const goHome = () => {
        stopCamera();
        router.push('/');
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrent(c => Math.max(0, c - 1));
            setIsTransitioning(false);
        }, 300);
    };

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (current < questions.length - 1) {
                setCurrent(c => c + 1);
            } else {
                // Save transcripts to localStorage before navigating
                localStorage.setItem('test_transcripts', JSON.stringify(transcripts));
                router.push('/report');
            }
            setIsTransitioning(false);
        }, 300);
    };

    // Add this function to handle transcript updates
    const updateTranscript = (text: string) => {
        const newTranscripts = [...transcripts];
        newTranscripts[current] = text;
        setTranscripts(newTranscripts);
        // Save to localStorage immediately after update
        localStorage.setItem('test_transcripts', JSON.stringify(newTranscripts));
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (!isRecording) {
            recognitionRef.current.start();
            setIsRecording(true);
        } else {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#00072D',
            backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
            `,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <StyledAppBar position="static" elevation={0}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                        }}
                    >
                        Skill Test ({current + 1}/{questions.length})
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
                            '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderColor: theme.palette.error.main,
                            }
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
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundImage: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                        }
                    }}
                />
            </StyledAppBar>

            <Container maxWidth="md" sx={{ flexGrow: 1, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper
                    elevation={12}
                    sx={{
                        position: 'relative',
                        width: '100%',
                        pt: '56.25%', // 16:9 aspect ratio
                        borderRadius: 2,
                        overflow: 'hidden'
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
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
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
                                    boxShadow: '0 4px 15px rgba(2, 226, 255, 0.4)',
                                }
                            }}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </RecordingButton>
                        {currentTranscript && (
                            <TranscriptDisplay variant="body2">
                                {currentTranscript}
                            </TranscriptDisplay>
                        )}
                    </RecordingControls>

                    <QuestionOverlay>
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                            {questions[current]}
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
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{
                        textTransform: 'none',
                        minWidth: 160,
                        background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        boxShadow: '0 4px 15px rgba(2, 226, 255, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                            boxShadow: '0 6px 20px rgba(2, 226, 255, 0.4)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease',
                        }
                    }}
                >
                    {current < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                </Button>
            </NavigationBar>
        </Box>
    );
}
