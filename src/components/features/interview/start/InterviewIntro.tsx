import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Container, Button, Divider, CircularProgress } from '@mui/material';
import { AppDispatch, RootState } from '@/store/store';
import { registerApplicant, selectRegisterLoading } from '@/store/slices/interviewApplicantSlice';
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

export interface ApplicantData {
  firstName: string;
  lastName: string;
  email: string;
  applicantId: string;
}

interface InterviewIntroProps {
  interviewConfig: any;
  hasJobId: boolean;
  jobId?: string;
  refParam?: string;
  totalSteps: number;
  jobData?: any;
  onNext: (applicantData: ApplicantData) => void;
}

const steps = [
  {
    icon: <PsychologyOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'AI-Powered Interview',
    desc: 'Our AI interviewer will ask you questions about the position and your experience. It listens, understands context, and follows up naturally.',
  },
  {
    icon: <QuizOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'Role-Specific Questions',
    desc: 'Questions are built around the job requirements. The AI focuses on skills, responsibilities, and competencies relevant to this position.',
  },
  {
    icon: <MicNoneOutlinedIcon sx={{ fontSize: 20, color: PURPLE_DARK }} />,
    title: 'Video & Voice-Based Answers',
    desc: 'Speak your answers naturally on camera — no typing needed. The AI records your video, transcribes your voice, and analyzes your responses automatically.',
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
  jobId,
  refParam,
  totalSteps,
  jobData,
  onNext,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const submitting = useSelector(selectRegisterLoading);
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  // Auto-register applicant on mount (no form needed — use logged-in user data)
  const registered = useRef(false);
  useEffect(() => {
    if (!jobId || registered.current) return;
    registered.current = true;

    const firstName = profile?.firstName || profile?.name?.split(' ')[0] || authUser?.username || 'Unknown';
    const lastName = profile?.lastName || profile?.name?.split(' ').slice(1).join(' ') || '';
    const email = authUser?.email || profile?.email || '';

    const payload: Parameters<typeof registerApplicant>[0] = { jobId, firstName, lastName, email };
    if (refParam) payload.ref = refParam;

    dispatch(registerApplicant(payload));
    // We intentionally don't await here — registration is fire-and-forget at mount
    // The applicantId is picked up in handleNext via the store
  }, [jobId]);

  const handleNext = async () => {
    const firstName = profile?.firstName || profile?.name?.split(' ')[0] || authUser?.username || 'Unknown';
    const lastName = profile?.lastName || profile?.name?.split(' ').slice(1).join(' ') || '';
    const email = authUser?.email || profile?.email || '';

    // If not yet registered (e.g. dispatch still in flight), dispatch now and wait
    if (!registered.current) {
      registered.current = true;
      const payload: Parameters<typeof registerApplicant>[0] = { jobId: jobId!, firstName, lastName, email };
      if (refParam) payload.ref = refParam;
      const result = await dispatch(registerApplicant(payload));
      const applicantId = registerApplicant.fulfilled.match(result) ? result.payload._id : '';
      onNext({ firstName, lastName, email, applicantId });
    } else {
      onNext({ firstName, lastName, email, applicantId: '' });
    }
  };

  const duration = interviewConfig?.sessionSettings?.duration || 20;

  // When there's a job post, show the actual job title instead of a generic type label
  const jobTitle = jobData?.jobDetails?.title || jobData?.title;
  const jobCompany = jobData?.companyName || '';
  const interviewType = jobTitle
    ? jobTitle
    : interviewConfig?.interviewType === 'TECHNICAL_INTERVIEW'
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'Poppins' }}>1</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem', color: PURPLE }}>Introduction</Typography>
            </Box>
            <Box sx={{ flex: 1, height: 2, bgcolor: '#e8e2f5', borderRadius: 1 }} />
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
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <VideocamOutlinedIcon sx={{ color: PURPLE, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#000', lineHeight: 1.25 }}>
                    {interviewType}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.3 }}>
                    <TimerOutlinedIcon sx={{ fontSize: 13, color: 'rgba(100,113,131,1)' }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: 'rgba(100,113,131,1)' }}>
                      {jobCompany ? `${jobCompany} · ` : ''}~{duration} minutes · AI-powered · Video & Voice
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
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: '12px', bgcolor: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}` }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, bgcolor: '#fff', border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: '#111827', mb: 0.3 }}>{s.title}</Typography>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.55 }}>{s.desc}</Typography>
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
                  endIcon={submitting ? undefined : <ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={submitting}
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
                    minWidth: 180,
                    '&:hover': { background: PURPLE_DARK, boxShadow: '0 6px 18px rgba(131,16,255,0.35)' },
                    '&.Mui-disabled': { background: 'rgba(163,98,239,0.5)', color: '#fff' },
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: '#fff' }} />
                      <span>Please wait…</span>
                    </Box>
                  ) : hasJobId ? 'Next: Job Overview' : 'Start Interview'}
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
