import React from 'react';
import { Box, Typography, Container, Button, Divider } from '@mui/material';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from '@/components/layout/Header';
import { GlobalStyles } from './styles';

const PURPLE = 'rgba(163,98,239,1)';
const PURPLE_DARK = '#8310FF';
const PURPLE_BG = 'rgba(244,235,255,1)';
const PURPLE_BORDER = 'rgba(189,133,255,0.35)';

interface InterviewIntroProps {
  interviewConfig: any;
  hasJobId: boolean;
  totalSteps: number; // 2 if no jobId, 3 if jobId
  onNext: () => void;
}

const steps = [
  {
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'AI-Powered Interview',
    desc: 'Our AI interviewer will ask you questions adapted to your profile and the role. It listens, understands context, and follows up naturally.',
  },
  {
    icon: <QuizOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'Adaptive Questions',
    desc: 'Questions are tailored to your experience level. The AI adjusts difficulty and topics based on your answers in real-time.',
  },
  {
    icon: <MicNoneOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'Voice-Based Answers',
    desc: 'Speak your answers naturally — no typing needed. The AI transcribes and analyzes your responses automatically.',
  },
  {
    icon: <TimerOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'Timed Session',
    desc: 'The interview has a set duration. A timer will be visible so you can pace yourself. Try to answer each question within 2–3 minutes.',
  },
];

const tips = [
  'Find a quiet place with good lighting',
  'Make sure your microphone and camera are working',
  'Speak clearly and take your time to think before answering',
  'You can ask the AI to repeat or clarify a question',
];

const InterviewIntro: React.FC<InterviewIntroProps> = ({
  interviewConfig,
  hasJobId,
  totalSteps,
  onNext,
}) => {
  const duration = interviewConfig?.sessionSettings?.duration || 20;
  const interviewType =
    interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW'
      ? 'Technical Interview'
      : interviewConfig?.interviewType === 'ASSESSMENT'
      ? 'Soft Skills Assessment'
      : interviewConfig?.interviewType === 'EVALUATION'
      ? 'Psychotechnic Assessment'
      : 'HR Interview';

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>

          {/* Step indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            {/* Step 1 — active */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>1</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: PURPLE }}>Introduction</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 2, bgcolor: '#e8e2f5', borderRadius: 1 }} />
            {/* Step 2 */}
            {hasJobId && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#e8e2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>2</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: '#9ca3af' }}>Job Overview</Typography>
                </Box>
                <Box sx={{ flex: 1, height: 2, bgcolor: '#e8e2f5', borderRadius: 1 }} />
              </>
            )}
            {/* Last step */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#e8e2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>{totalSteps}</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: '#9ca3af' }}>AI Interview</Typography>
            </Box>
          </Box>

          {/* Main card */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', boxShadow: '0 8px 32px rgba(131,16,255,0.08)', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 2.5, borderBottom: '1px solid rgba(232,232,232,1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    bgcolor: PURPLE_BG,
                    border: `1px solid ${PURPLE_BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <VideocamOutlinedIcon sx={{ color: PURPLE, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#000', lineHeight: 1.25 }}>
                    {interviewType}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                    <TimerOutlinedIcon sx={{ fontSize: 13, color: 'rgba(100,113,131,1)' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'rgba(100,113,131,1)' }}>
                      ~{duration} minutes · AI-powered · Voice-based
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Body */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5, display: 'flex', flexDirection: 'column', gap: 3.5 }}>

              {/* How it works */}
              <Box>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#000', mb: 2, position: 'relative', display: 'inline-block', '&::after': { content: '""', position: 'absolute', bottom: -4, left: 0, width: 28, height: 3, bgcolor: PURPLE_DARK, borderRadius: 1 } }}>
                  How it works
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 0.5 }}>
                  {steps.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.5,
                        p: 2, borderRadius: '12px',
                        bgcolor: PURPLE_BG,
                        border: `1px solid ${PURPLE_BORDER}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                          bgcolor: '#fff',
                          border: `1px solid ${PURPLE_BORDER}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {s.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: '#111827', mb: 0.3 }}>
                          {s.title}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.55 }}>
                          {s.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Tips */}
              <Box sx={{ bgcolor: 'rgba(250,246,255,1)', border: '1px solid rgba(189,133,255,0.25)', borderRadius: '12px', p: 2.5 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem', color: '#000', mb: 1.5 }}>
                  Before you start
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                  {tips.map((tip, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE_DARK, flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'rgba(84,98,116,1)' }}>{tip}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(232,232,232,1)' }} />

              {/* CTA */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onNext}
                  sx={{
                    background: PURPLE,
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    px: 3.5,
                    py: 1.2,
                    borderRadius: '38px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(163,98,239,0.3)',
                    '&:hover': { background: PURPLE_DARK, boxShadow: '0 6px 18px rgba(131,16,255,0.35)' },
                  }}
                >
                  {hasJobId ? 'Next: Job Overview' : 'Start Interview'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default InterviewIntro;
