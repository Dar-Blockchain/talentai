import React from 'react';
import { Box } from '@mui/material';
import { PostInterviewData } from '../../../types/postInterview';
import InterviewCard from './InterviewCard';

interface InterviewListSectionProps {
  interviews: PostInterviewData[];
  onViewDetails: (id: string) => void;
  onProvideFeedback: (interview: PostInterviewData) => void;
}

const InterviewListSection: React.FC<InterviewListSectionProps> = ({
  interviews,
  onViewDetails,
  onProvideFeedback,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {interviews.map((interview) => (
        <InterviewCard
          key={interview._id}
          interview={interview}
          onViewDetails={onViewDetails}
          onProvideFeedback={onProvideFeedback}
        />
      ))}
    </Box>
  );
};

export default React.memo(InterviewListSection);
