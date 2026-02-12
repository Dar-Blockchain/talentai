import {
  AppBar,
  Box,
  Button,
  Typography,
  Paper,
  styled,
  Card,
  LinearProgress,
  Dialog,
} from '@mui/material';

// Brand color constant
export const GREEN_MAIN = '#8310FF';

// --- Styled Components ---
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  background: GREEN_MAIN,
}));

export const RecordingControls = styled(Box)(({ theme }) => ({
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
  minWidth: '280px',
  maxWidth: '90%',
  [theme.breakpoints.up('sm')]: {
    minWidth: '300px',
    maxWidth: '300px',
  },
}));

export const RecordingButton = styled(Button)(({ theme }) => ({
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

export const TranscriptDisplay = styled(Typography)(({ theme }) => ({
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

// New prominent Question Panel styled component
export const StyledQuestionPanel = styled(Paper)(({ theme }) => ({
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
}));

export const QuestionContent = styled(Box)(({ theme }) => ({
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

export const QuestionText = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: '1.3rem',
  fontWeight: 600,
  lineHeight: 1.4,
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

export const ReadingTimeIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  minWidth: '120px',
  [theme.breakpoints.down('sm')]: {
    alignSelf: 'flex-end',
    minWidth: 'auto',
  },
}));

// Agent State & Silence Detection Panel
export const StyledAgentStatusPanel = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: 80,
  right: 16,
  minWidth: 280,
  maxWidth: 320,
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  zIndex: 999,
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('md')]: {
    position: 'relative',
    top: 0,
    right: 0,
    left: 0,
    minWidth: 'auto',
    maxWidth: '100%',
    margin: theme.spacing(2, 0),
  },
}));

export const AgentStateIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&.thinking': {
    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1))',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  },
  '&.waiting': {
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(3, 169, 244, 0.1))',
    border: '1px solid rgba(33, 150, 243, 0.3)',
  },
  '&.processing': {
    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(233, 30, 99, 0.1))',
    border: '1px solid rgba(156, 39, 176, 0.3)',
  },
  '&.ready': {
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.1))',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  '&.idle': {
    background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.2), rgba(97, 97, 97, 0.1))',
    border: '1px solid rgba(158, 158, 158, 0.3)',
  },
}));

export const SilenceProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #00ff9d 0%, #00b8d4 50%, #8310ff 100%)',
    transition: 'transform 0.1s linear',
  },
  '&.complete .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
    boxShadow: '0 0 12px rgba(76, 175, 80, 0.5)',
  },
}));

export const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#fff',
  textAlign: 'center',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  '&.reading-time': {
    color: '#ffb74d',
  },
  '&.silence-active': {
    color: '#64b5f6',
  },
  '&.silence-complete': {
    color: '#81c784',
  },
}));

export const NavigationBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'space-between',
  },
}));

export const GuidelinesModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

export const GuidelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  border: '1px solid #000',
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

export const StyledSecurityModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

export const FirstViolationModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
  },
}));

// Voice Activity Indicator components
export const VoiceActivityIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  position: 'relative',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: isActive ? '#02E2FF' : 'rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
}));

export const VoiceWaves = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '2px solid #02E2FF',
    animation: 'wave 1.5s ease-out infinite',
  },
  '&::before': {
    width: '100%',
    height: '100%',
    animationDelay: '0s',
  },
  '&::after': {
    width: '100%',
    height: '100%',
    animationDelay: '0.75s',
  },
  '@keyframes wave': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(1.5)',
      opacity: 0,
    },
  },
}));

export const VoiceIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'pulse 1s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.8,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
}));

// Global CSS animations
export const GlobalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadeInUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInFromTop {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(0); }
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
`;
