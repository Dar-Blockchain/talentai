import React from 'react';
import { Typography } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import { InterviewMessage } from '@/types/interview';
import { StyledQuestionPanel, QuestionContent, QuestionText, ReadingTimeIndicator } from './styles';

interface QuestionPanelProps {
  currentMessage: InterviewMessage;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionHighlight: boolean;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage,
  isInReadingTime,
  readingTimeLeft,
  questionHighlight,
}) => {
  return (
    <StyledQuestionPanel
      elevation={6}
      className={questionHighlight ? 'question-highlight' : ''}
    >
      <QuestionContent>
        <QuestionText variant="body1">
          {currentMessage.content || "Getting next question..."}
        </QuestionText>
        {isInReadingTime && (
          <ReadingTimeIndicator>
            <TimerIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
            <Typography variant="body2" sx={{
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'monospace'
            }}>
              {Math.ceil(readingTimeLeft / 1000)}s
            </Typography>
          </ReadingTimeIndicator>
        )}
      </QuestionContent>
      {currentMessage.reasoning && (
        <Typography variant="caption" sx={{
          display: 'block',
          mt: 1,
          opacity: 0.8,
          fontStyle: 'italic'
        }}>
          💡 {currentMessage.reasoning}
        </Typography>
      )}
    </StyledQuestionPanel>
  );
};

export default QuestionPanel;
