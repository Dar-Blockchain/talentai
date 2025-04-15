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
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { motion } from 'framer-motion';

const defaultQuestions = [
    "What is hoisting in JavaScript?",
    "Explain closures in JavaScript?",
    "What is event bubbling in JavaScript?",
    "What is the difference between let, var, and const?",
    "How does prototypal inheritance work in JavaScript?",
    "What are promises in JavaScript and how do they work?",
    "Explain the concept of asynchronous programming in JavaScript.",
    "What is the event loop in JavaScript?",
    "What are arrow functions and how do they differ from regular functions?",
    "Explain JavaScript's async/await"
];
const questionDurations = [120, 600, 120, 120, 120, 120, 120, 120, 120, 120];

export default function Test() {
    const theme = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>(defaultQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(120);
    const [answers, setAnswers] = useState<string[]>([]);
    const [finished, setFinished] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(console.error);

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const skills = JSON.parse(localStorage.getItem('prefs_skills') || '[]');
        if (skills.length) {
            setQuestions(skills.map((skill: string) => `Describe a project where you used ${skill}.`));
        }
    }, []);

    useEffect(() => {
        if (finished) return;
        if (timeLeft <= 0) {
            setAnswers(prev => {
                const newAnswers = [...prev];
                newAnswers[currentIndex] = currentAnswer;
                return newAnswers;
            });
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setFinished(true);
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, currentIndex, finished, questions.length, currentAnswer]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setCurrentAnswer(prev => prev + (prev ? ' ' : '') + transcript);
            };
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event);
            };
        }
    }, []);

    useEffect(() => {
        setTimeLeft(questionDurations[currentIndex] || 120);
        setCurrentAnswer("");
        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    }, [currentIndex]);

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

    const handlePrev = () => setCurrentIndex(c => Math.max(0, c - 1));
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
        } else {
            goHome();
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
            <AppBar position="static" elevation={0} sx={{ background: 'transparent' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Skill Test ({currentIndex + 1}/{questions.length})
                    </Typography>
                    <Button
                        startIcon={<CallEndIcon />}
                        onClick={goHome}
                        variant="outlined"
                        sx={{
                            color: theme.palette.error.main,
                            borderColor: theme.palette.error.main,
                            textTransform: 'none'
                        }}
                    >
                        End Test
                    </Button>
                </Toolbar>
                {/* <LinearProgress
                    variant="determinate"
                    value={((currentIndex + 1) / questions.length) * 100}
                    sx={{ height: 4 }}
                /> */}
            </AppBar>
            {finished ? (
                <Box sx={{ p: 4, background: theme.palette.background.paper }}>
                    <h1>Interview Completed</h1>
                    <p>{answers.join(' ')}</p>
                </Box>
            ) : (
                <div>
                    <h1>Interview</h1>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Time left: {timeLeft} seconds
                    </div>
                    <div>
                        <h2>Question {currentIndex + 1}:</h2>
                        <p>{questions[currentIndex]}</p>
                        <div>Recorded Answer: {currentAnswer}</div>
                    </div>
                </div>
            )}
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
                            objectFit: 'cover'
                        }}
                    />
                    <Fade in timeout={600}>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.6)',
                                color: '#fff',
                                p: 2
                            }}
                        >
                            <Typography variant="subtitle1">
                                {questions[currentIndex]}
                            </Typography>
                        </Box>
                    </Fade>
                </Paper>
            </Container>

            <Box sx={{
                py: 2,
                px: 4,
                background: theme.palette.background.paper,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <IconButton
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    sx={{ color: theme.palette.text.primary }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{ textTransform: 'none', minWidth: 160 }}
                >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                </Button>
            </Box>
        </Box>
    );
}
