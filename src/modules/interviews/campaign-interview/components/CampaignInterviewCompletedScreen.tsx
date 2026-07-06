import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { CampaignInterviewResultsPanel } from './CampaignInterviewResultsPanel';

interface Props {
  campaignId: string;
  campaignTitle?: string;
  participantId?: string;
  isLoggedIn?: boolean;
  onDone: () => void;
}

export const CampaignInterviewCompletedScreen: React.FC<Props> = ({
  campaignId, campaignTitle, participantId, isLoggedIn, onDone,
}) => (
  <div className="flex-1 flex items-start justify-center p-4 lg:pt-8">
    <div className="w-full max-w-xl bg-background border border-border rounded-2xl">
      <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
        <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_8px_32px_rgba(16,185,129,0.35)]">
          <CheckCircle2 className="size-9 text-white" strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Thank you!</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
            You have completed {campaignTitle ? `"${campaignTitle}"` : 'this interview'}. Your responses have been recorded and analyzed.
          </p>
        </div>

        {participantId && <CampaignInterviewResultsPanel campaignId={campaignId} participantId={participantId} />}

        {isLoggedIn && (
          <Button variant="outline" size="sm" className="mt-1" onClick={onDone}>
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  </div>
);
