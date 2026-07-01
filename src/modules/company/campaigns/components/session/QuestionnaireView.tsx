import React from 'react';
import { QuestionnaireAssessment, GlobalStyles } from '@/modules/interviews/questionnaire';
import InterviewHeader from '@/modules/interviews/shared/components/layout/InterviewHeader';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';

interface Props {
  campaign:      Campaign;
  participantId: string;
  onBack:        () => void;
  onComplete:    () => void;
}

export const QuestionnaireView: React.FC<Props> = ({ campaign, participantId, onBack, onComplete }) => (
  <div className="flex flex-col bg-[#F8FAFC]" style={{ height: '100vh', overflow: 'hidden' }}>
    <style jsx global>{GlobalStyles}</style>
    <InterviewHeader />
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <QuestionnaireAssessment
        campaign={campaign}
        participantId={participantId}
        onBack={onBack}
        onComplete={onComplete}
      />
    </div>
  </div>
);
