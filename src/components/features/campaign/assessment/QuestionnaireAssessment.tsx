import React, { useEffect } from 'react';
import { Box } from '@mui/material';

import { Campaign } from '@/types/campaign';
import axiosInstance from '@/utils/axiosInstance';

import InterviewPageHeader from './InterviewPageHeader';
import QuestionnaireForm   from './QuestionnaireForm';

interface QuestionnaireAssessmentProps {
  campaign:      Campaign;
  participantId: string;
  onBack:        () => void;
  onComplete:    () => void;
}

const QuestionnaireAssessment: React.FC<QuestionnaireAssessmentProps> = ({
  campaign, participantId, onBack, onComplete,
}) => {
  const questions = (campaign.module as any)?.config?.questions ?? [];

  useEffect(() => {
    if (!participantId) return;
    axiosInstance.patch(`internal-campaigns/${campaign._id}/start/${participantId}`).catch(() => {});
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
      <InterviewPageHeader
        campaign={campaign}
        moduleType="QUESTIONNAIRE"
        interviewStatus="idle"
        isVoiceActive={false}
        agentState="waiting"
        coverage={null}
        elapsedTime={0}
        timeWarning={false}
        onBack={onBack}
        onEnd={() => {}}
      />
      <Box sx={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxWidth: 760, width: '100%', mx: 'auto',
        px: { xs: 2, md: 0 }, py: 2,
      }}>
        <Box sx={{
          flex: 1, overflow: 'hidden',
          bgcolor: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <QuestionnaireForm
            campaignId={campaign._id}
            participantId={participantId}
            questions={questions}
            onComplete={onComplete}
            onBack={onBack}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default QuestionnaireAssessment;
