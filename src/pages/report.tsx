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
import PersonIcon from '@mui/icons-material/Person';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}));

const TranscriptSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  background: 'rgba(0,0,0,0.2)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.05)',
}));

const MotionPaper = motion(StyledPaper);
const MotionBox = motion(TranscriptSection);

export default function Report() {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('test_transcripts') || '[]');
      const filtered = Array.isArray(saved) ? saved.filter((t: string) => t.trim() !== '') : [];
      setTranscripts(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const goHome = () => router.push('/');

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
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 50%)
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
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
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
            transcripts.map((t, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Typography variant="h6" sx={{ color: '#02E2FF', mb: 1 }}>
                  Question {i + 1}
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {t}
                </Typography>
              </MotionBox>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: '#fff', textAlign: 'center' }}>
              No transcripts available. Please complete the interview first.
            </Typography>
          )}

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/dashboardCandidate')}
              startIcon={<PersonIcon />}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                }
              }}
            >
              Go to My Dashboard
            </Button>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
}
