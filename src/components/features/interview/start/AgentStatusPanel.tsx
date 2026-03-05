import React from 'react';
import { Box, Typography, Button, CardContent } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ProcessingIcon from '@mui/icons-material/Autorenew';
import ReadyIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import { InterviewStatus, AgentState } from '@/types/interview';
import { StyledAgentStatusPanel, AgentStateIndicator, TimerDisplay } from './styles';

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
  if (!(interviewStatus === 'active' || agentState !== 'idle')) {
    return null;
  }

  return (
    <StyledAgentStatusPanel>
      <CardContent sx={{ pb: '16px !important' }}>
        {/* Agent State Display */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
            AI AGENT STATUS
          </Typography>
          <AgentStateIndicator className={agentState}>
            {/* Agent State Icon */}
            {agentState === 'thinking' && (
              <PsychologyIcon sx={{ color: '#ffc107', fontSize: 20 }} />
            )}
            {agentState === 'waiting' && (
              <HourglassEmptyIcon sx={{ color: '#2196f3', fontSize: 20 }} />
            )}
            {agentState === 'processing' && (
              <ProcessingIcon sx={{ color: '#9c27b0', fontSize: 20, animation: 'spin 2s linear infinite' }} />
            )}
            {agentState === 'ready' && (
              <ReadyIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            )}
            {agentState === 'idle' && (
              <TimerIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{
                color: '#fff',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {agentState === 'thinking' && 'AI Thinking...'}
                {agentState === 'waiting' && 'Waiting for Response'}
                {agentState === 'processing' && 'Processing Answer'}
                {agentState === 'ready' && 'Ready'}
                {agentState === 'idle' && 'Idle'}
              </Typography>
              {agentMessage && (
                <Typography variant="caption" sx={{
                  color: '#bbb',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {agentMessage}
                </Typography>
              )}
            </Box>
          </AgentStateIndicator>
        </Box>

        {/* Reading Time Display */}
        {isInReadingTime && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
              READING TIME
            </Typography>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 183, 77, 0.15)',
              border: '1px solid rgba(255, 183, 77, 0.3)'
            }}>
              <TimerDisplay className="reading-time">
                {Math.ceil(readingTimeLeft / 1000)}s remaining
              </TimerDisplay>
              <Typography variant="caption" sx={{ color: '#ffb74d', textAlign: 'center', display: 'block', mt: 0.5 }}>
                Please read the question
              </Typography>
            </Box>
          </Box>
        )}

        {/* Manual Next Button - Always clickable when interview active */}
        {interviewStatus === 'active' && !isInReadingTime && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
              {agentState === 'thinking' || agentState === 'processing'
                ? 'AI PROCESSING'
                : agentState === 'waiting' && accumulatedTurns.length > 0
                ? 'SUBMIT ANSWER'
                : 'ACTIONS'
              }
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                console.log('🎯 [MANUAL] User clicked Next Question button');
                onSubmitAnswer();
              }}
              disabled={agentState === 'thinking' || agentState === 'processing'}
              sx={{
                background: agentState === 'thinking' || agentState === 'processing'
                  ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                  : accumulatedTurns.length > 0
                  ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 1.5,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: agentState === 'thinking' || agentState === 'processing'
                    ? 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)'
                    : accumulatedTurns.length > 0
                    ? 'linear-gradient(135deg, #45a049 0%, #388e3c 100%)'
                    : 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
                '&:disabled': {
                  color: '#fff',
                  opacity: 0.7
                }
              }}
            >
              {agentState === 'thinking'
                ? '⏳ AI is Thinking...'
                : agentState === 'processing'
                ? '⚙️ Processing Your Answer...'
                : agentState === 'waiting' && accumulatedTurns.length > 0
                ? `✓ Submit Answer (${accumulatedTurns.length} ${accumulatedTurns.length === 1 ? 'turn' : 'turns'} recorded)`
                : accumulatedTurns.length > 0
                ? `Next Question (${accumulatedTurns.length} ${accumulatedTurns.length === 1 ? 'turn' : 'turns'} recorded)`
                : isVoiceActive
                ? '🎤 Speaking... Click when done'
                : ' Next Question'
              }
            </Button>
            <Typography variant="caption" sx={{
              color: '#bbb',
              textAlign: 'center',
              display: 'block',
              mt: 1,
              fontSize: '0.7rem'
            }}>
              {agentState === 'thinking'
                ? 'Please wait while the AI prepares the next question'
                : agentState === 'processing'
                ? 'Your answer is being analyzed'
                : agentState === 'waiting' && accumulatedTurns.length > 0
                ? 'Click to submit your answer and continue'
                : accumulatedTurns.length > 0
                ? 'Click when you\'re done answering'
                : isVoiceActive
                ? 'Listening to your response...'
                : 'Click to skip this question'
              }
            </Typography>
          </Box>
        )}

        {/* Current Transcript Preview */}
        {currentTranscript && interviewStatus === 'active' && (
          <Box sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
              CURRENT RESPONSE
            </Typography>
            <Typography variant="caption" sx={{
              color: '#fff',
              opacity: 0.8,
              fontStyle: 'italic',
              display: 'block',
              maxHeight: '60px',
              overflowY: 'auto',
              padding: '8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              fontSize: '0.7rem',
              lineHeight: 1.4
            }}>
              "{currentTranscript.slice(-150)}{currentTranscript.length > 150 ? '...' : ''}"
            </Typography>
          </Box>
        )}

        {/* Debug Panel (only show in development or when debug mode is enabled) */}
        {(debugMode || process.env.NODE_ENV === 'development') && (
          <Box sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600 }}>
                DEBUG LOGS
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setDebugMode(!debugMode)}
                sx={{
                  fontSize: '0.6rem',
                  padding: '2px 8px',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff'
                }}
              >
                {debugMode ? 'Hide' : 'Show'}
              </Button>
            </Box>
            {debugMode && (
              <Box sx={{
                maxHeight: '120px',
                overflowY: 'auto',
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '4px',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)' }
              }}>
                {silenceDebugLog.map((log, index) => (
                  <Box key={index} sx={{ color: '#64b5f6', marginBottom: '2px' }}>
                    {log}
                  </Box>
                ))}
                {transcriptDebugLog.map((log, index) => (
                  <Box key={index} sx={{ color: '#81c784', marginBottom: '2px' }}>
                    {log}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </StyledAgentStatusPanel>
  );
};

export default AgentStatusPanel;
