import React from 'react';
import { CampaignInterviewFlow } from '@/modules/interviews/campaign-interview';
import type { CampaignModuleType } from '@/modules/interviews/campaign-interview';

interface Props {
  campaignId: string;
  moduleType: CampaignModuleType;
  onBack: () => void;
}

export const CampaignInterviewView: React.FC<Props> = ({ campaignId, moduleType, onBack }) => (
  <div className="flex-1 flex flex-col bg-background min-h-0">
    <CampaignInterviewFlow campaignId={campaignId} moduleType={moduleType} onBack={onBack} />
  </div>
);
