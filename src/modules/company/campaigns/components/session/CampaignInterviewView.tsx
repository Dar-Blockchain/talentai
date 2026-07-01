import React from 'react';
import { CampaignInterviewFlow } from '@/modules/interviews/campaign-interview';
import InterviewHeader from '@/modules/interviews/shared/components/layout/InterviewHeader';
import type { CampaignModuleType } from '@/modules/interviews/campaign-interview';

interface Props {
  campaignId: string;
  moduleType: CampaignModuleType;
  onBack: () => void;
}

export const CampaignInterviewView: React.FC<Props> = ({ campaignId, moduleType, onBack }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <InterviewHeader />
    <div className="flex-1 flex flex-col">
      <CampaignInterviewFlow campaignId={campaignId} moduleType={moduleType} onBack={onBack} />
    </div>
  </div>
);
