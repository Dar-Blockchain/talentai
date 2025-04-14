// pages/report.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    Paper,
    Container,
    Button,
    styled,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

const TranscriptSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
}));

const MotionPaper = motion(StyledPaper);
const MotionBox = motion(TranscriptSection);

export default function Report() {
    const router = useRouter();
    const [transcripts, setTranscripts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // Get transcripts from localStorage
            const savedTranscripts = localStorage.getItem('test_transcripts');
            if (savedTranscripts) {
                const parsedTranscripts = JSON.parse(savedTranscripts);
                // Filter out empty transcripts
                const validTranscripts = parsedTranscripts.filter((t: string) => t && t.trim() !== '');
                setTranscripts(validTranscripts);
            }
        } catch (error) {
            console.error('Error loading transcripts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const goHome = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#00072D'
            }}>
                <CircularProgress sx={{ color: '#02E2FF' }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#00072D',
            backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
            `,
            py: 4
        }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={goHome}
                    sx={{
                        color: '#fff',
                        mb: 2,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                >
                    Back to Home
                </Button>

                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#fff',
                            mb: 3,
                            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                        }}
                    >
                        Interview Transcript
                    </Typography>

                    {transcripts.length > 0 ? (
                        transcripts.map((transcript, index) => (
                            <MotionBox
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Typography variant="h6" sx={{ color: '#02E2FF', mb: 1 }}>
                                    Question {index + 1}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                    {transcript}
                                </Typography>
                            </MotionBox>
                        ))
                    ) : (
                        <Typography variant="body1" sx={{ color: '#fff', textAlign: 'center' }}>
                            No transcripts available. Please complete the interview first.
                        </Typography>
                    )}
                </MotionPaper>
            </Container>
        </Box>
    );
}
