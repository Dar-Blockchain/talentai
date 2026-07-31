import React, { useEffect } from 'react';

import { Campaign } from '@/modules/company/campaigns/types/campaign';
import { Card } from '@/modules/shared/ui/shadcn/card';

import { useStartQuestionnaireMutation } from '../queries';
import QuestionnaireForm from './QuestionnaireForm';

interface QuestionnaireAssessmentProps {
  campaign:      Campaign;
  participantId: string;
  isLoggedIn?:   boolean;
  onBack:        () => void;
  onComplete:    () => void;
}

const QuestionnaireAssessment: React.FC<QuestionnaireAssessmentProps> = ({
  campaign, participantId, isLoggedIn, onBack, onComplete,
}) => {
  const questionnaireConfig = campaign.module.type === 'QUESTIONNAIRE' ? campaign.module.config : null;
  const questions = questionnaireConfig?.questions ?? [];
  const showResults = questionnaireConfig?.showResultsToParticipants !== false;

  const { mutate: startQuestionnaire } = useStartQuestionnaireMutation();

  useEffect(() => {
    if (!participantId) return;
    startQuestionnaire({ campaignId: campaign._id, participantId });
  }, []);

  return (
    <div className="flex-1 flex items-start justify-center p-4 lg:pt-8">
      <Card className="w-full max-w-3xl">
        <QuestionnaireForm
          campaignId={campaign._id}
          campaignTitle={campaign.title}
          participantId={participantId}
          questions={questions}
          showResults={showResults}
          isLoggedIn={isLoggedIn}
          onComplete={onComplete}
          onBack={onBack}
        />
      </Card>
    </div>
  );
};

export default QuestionnaireAssessment;
