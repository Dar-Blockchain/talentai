import React from 'react';
import { CampaignInterviewFlow } from '@/modules/interviews/campaign-interview';
import type { CampaignModuleType } from '@/modules/interviews/campaign-interview';

interface Props {
  campaignId: string;
  moduleType: CampaignModuleType;
  campaignTitle?: string;
  participantId?: string;
  onBack: () => void;
  onComplete?: () => void;
}

export const CampaignInterviewView: React.FC<Props> = ({
  campaignId, moduleType, campaignTitle, participantId, onBack, onComplete,
}) => (
  <div className="flex-1 flex flex-col bg-background min-h-0">
    <CampaignInterviewFlow
      campaignId={campaignId}
      moduleType={moduleType}
      campaignTitle={campaignTitle}
      participantId={participantId}
      onBack={onBack}
      onComplete={onComplete}
    />
  </div>
);
