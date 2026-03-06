import React from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { InterviewStatus, AgentState } from '@/types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  agentMessage: string;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  accumulatedTurns: string[];
  isVoiceActive: boolean;
  currentTranscript: string;
  debugMode: boolean;
  setDebugMode: (val: boolean) => void;
  silenceDebugLog: string[];
  transcriptDebugLog: string[];
  onSubmitAnswer: () => void;
}

const PURPLE = '#8310FF';

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  agentMessage,
  isInReadingTime,
  readingTimeLeft,
  accumulatedTurns,
  isVoiceActive,
  currentTranscript,
  debugMode,
  setDebugMode,
  silenceDebugLog,
  transcriptDebugLog,
  onSubmitAnswer,
}) => {
  if (!(interviewStatus === 'active' || agentState !== 'idle')) return null;

  const isProcessing = agentState === 'thinking' || agentState === 'processing';
  const hasAnswer = accumulatedTurns.length > 0;

  const stateColor = isProcessing
    ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '#d97706', ring: 'rgba(245,158,11,0.3)' }
    : isVoiceActive
    ? { bg: 'rgba(131,16,255,0.1)', border: 'rgba(131,16,255,0.25)', icon: PURPLE, ring: 'rgba(131,16,255,0.3)' }
    : agentState === 'ready'
    ? { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '#22c55e', ring: 'rgba(34,197,94,0.3)' }
    : { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '#22c55e', ring: 'rgba(34,197,94,0.2)' };

  const statusLabel = isProcessing
    ? agentState === 'thinking' ? 'AI is thinking…' : 'Processing your answer…'
    : agentState === 'ready' ? 'Ready for next question'
    : isVoiceActive ? 'Listening to your response'
    : 'Recording your response';

  const statusSub = agentMessage
    ? agentMessage
    : hasAnswer
    ? `${accumulatedTurns.length} turn${accumulatedTurns.length > 1 ? 's' : ''} recorded`
    : 'Speak clearly into your microphone';

  return (
    <Box
      sx={{
        bgcolor: 'transparent',
        borderRadius: '16px',
        border: '1px solid #ede9f8',
        overflow: 'hidden',
      }}
    >
      {/* Purple top line when processing */}
      {isProcessing ? (
        <LinearProgress
          variant="indeterminate"
          sx={{
            height: 3,
            bgcolor: 'rgba(131,16,255,0.08)',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #8310FF, #a855f7)' },
          }}
        />
      ) : (
        <Box sx={{ height: 3, background: isVoiceActive ? 'linear-gradient(90deg, #8310FF, #a855f7)' : 'transparent' }} />
      )}

      <Box sx={{ p: { xs: 2.5, md: 3 } }}>

        {/* ── Status row ── */}
        <Box display="flex" alignItems="center" gap={2} mb={2.5}>
          {/* Icon circle */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: stateColor.bg,
              border: `1.5px solid ${stateColor.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {isProcessing ? (
              <AutorenewIcon
                sx={{
                  fontSize: 24,
                  color: stateColor.icon,
                  animation: 'agentSpin 1.2s linear infinite',
                  '@keyframes agentSpin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                }}
              />
            ) : agentState === 'ready' ? (
              <CheckCircleIcon sx={{ fontSize: 24, color: stateColor.icon }} />
            ) : isVoiceActive ? (
              <KeyboardVoiceIcon
                sx={{
                  fontSize: 24,
                  color: stateColor.icon,
                  animation: 'agentPulse 0.8s ease-in-out infinite',
                  '@keyframes agentPulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
                }}
              />
            ) : (
              <MicIcon sx={{ fontSize: 24, color: stateColor.icon }} />
            )}

            {/* Ripple ring */}
            {isVoiceActive && !isProcessing && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: -5,
                  borderRadius: '50%',
                  border: `2px solid ${stateColor.ring}`,
                  animation: 'agentRipple 1.4s ease-out infinite',
                  '@keyframes agentRipple': {
                    '0%': { transform: 'scale(1)', opacity: 0.6 },
                    '100%': { transform: 'scale(1.5)', opacity: 0 },
                  },
                }}
              />
            )}
          </Box>

          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: '#111827', lineHeight: 1.3 }}>
              {statusLabel}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#6b7280', mt: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {statusSub}
            </Typography>
          </Box>

          {/* Turn count badge */}
          {hasAnswer && !isProcessing && (
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>
                {accumulatedTurns.length}t
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Reading time banner ── */}
        {isInReadingTime && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '12px',
              px: 2,
              py: 1.25,
              mb: 2,
            }}
          >
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
              Take a moment to read the question
            </Typography>
            <Box sx={{ px: 1.25, py: 0.4, bgcolor: 'rgba(245,158,11,0.15)', borderRadius: '8px' }}>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.92rem', color: '#d97706' }}>
                {Math.ceil(readingTimeLeft / 1000)}s
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Live transcript ── */}
        {currentTranscript && interviewStatus === 'active' && (
          <Box
            sx={{
              bgcolor: '#fafafa',
              border: '1px solid #f0eefc',
              borderLeft: `3px solid ${PURPLE}`,
              borderRadius: '0 10px 10px 0',
              px: 2,
              py: 1.25,
              mb: 2,
              maxHeight: 68,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 3 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(131,16,255,0.2)', borderRadius: 2 },
            }}
          >
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.6 }}>
              {currentTranscript.slice(-200)}{currentTranscript.length > 200 ? '…' : ''}
            </Typography>
          </Box>
        )}

        {/* ── Submit button ── */}
        {interviewStatus === 'active' && !isInReadingTime && (
          <Button
            variant="contained"
            fullWidth
            onClick={onSubmitAnswer}
            disabled={isProcessing}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '0.9rem',
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              background: isProcessing
                ? undefined
                : hasAnswer
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
              bgcolor: isProcessing ? '#f3f4f6' : undefined,
              color: isProcessing ? '#9ca3af' : '#fff',
              boxShadow: isProcessing
                ? 'none'
                : hasAnswer
                ? '0 6px 20px rgba(34,197,94,0.35)'
                : '0 6px 20px rgba(131,16,255,0.4)',
              '&:hover': {
                background: isProcessing
                  ? undefined
                  : hasAnswer
                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  : 'linear-gradient(135deg, #6d0ee0 0%, #9333ea 100%)',
              },
              '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
            }}
          >
            {agentState === 'thinking'
              ? 'AI is thinking…'
              : agentState === 'processing'
              ? 'Processing…'
              : hasAnswer
              ? `Submit & Continue (${accumulatedTurns.length} turn${accumulatedTurns.length > 1 ? 's' : ''})`
              : isVoiceActive
              ? 'Speaking… click when done'
              : 'Submit & Continue'}
          </Button>
        )}

        {/* ── Debug panel ── */}
        {(debugMode || process.env.NODE_ENV === 'development') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f3f4f6' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Debug
              </Typography>
              <Button
                size="small"
                onClick={() => setDebugMode(!debugMode)}
                sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', textTransform: 'none', color: '#9ca3af', minWidth: 0, px: 1 }}
              >
                {debugMode ? 'Hide' : 'Show'}
              </Button>
            </Box>
            {debugMode && (
              <Box sx={{ maxHeight: 100, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.6rem', bgcolor: '#f9fafb', p: 1, borderRadius: '6px' }}>
                {silenceDebugLog.map((log, i) => <Box key={i} sx={{ color: '#3b82f6', mb: '1px' }}>{log}</Box>)}
                {transcriptDebugLog.map((log, i) => <Box key={i} sx={{ color: '#22c55e', mb: '1px' }}>{log}</Box>)}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AgentStatusPanel;
