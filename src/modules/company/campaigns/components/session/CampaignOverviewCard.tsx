import React from 'react';
import { Shield, User, AlertCircle } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Alert, AlertTitle, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { EligibilityStatus, ModuleMeta, DeadlineBadge } from './types';
import { CampaignHero } from './CampaignHero';
import { CampaignMetaBadges } from './CampaignMetaBadges';
import { EligibilityPanel } from './EligibilityPanel';
import { WhatToExpect } from './WhatToExpect';
import { ActionButton } from './ActionButton';

interface Props {
  campaign:       Campaign | null;
  modMeta:        ModuleMeta | null;
  eligibility:    EligibilityStatus;
  remaining:      number | null;
  isAnon:         boolean;
  isLoggedIn:     boolean;
  hasIdentity:    boolean;
  name:           string;
  email:          string;
  joinError:      string | null;
  joining:        boolean;
  deadlineBadge:  DeadlineBadge | null;
  onStart:        () => void;
  onSignIn:       () => void;
  onRetry:        () => void;
  onViewResults:  () => void;
  onEditIdentity: () => void;
}

export const CampaignOverviewCard: React.FC<Props> = ({
  campaign, modMeta, eligibility, remaining, isAnon, isLoggedIn,
  hasIdentity, name, email, joinError, joining, deadlineBadge,
  onStart, onSignIn, onRetry, onViewResults, onEditIdentity,
}) => (
  <Card className="w-full max-w-2xl gap-0 py-0 overflow-hidden shadow-md">
    <CampaignHero campaign={campaign} modMeta={modMeta} />
    <CampaignMetaBadges campaign={campaign} modMeta={modMeta} isAnon={isAnon} deadlineBadge={deadlineBadge} />

    <div className="p-6 flex flex-col gap-5">
      <EligibilityPanel status={eligibility} campaign={campaign} remaining={remaining} />

      {modMeta && eligibility !== 'error' && <WhatToExpect modMeta={modMeta} />}

      {/* Anonymous mode notice */}
      {isAnon && (
        <Alert className="border-[1.5px] border-violet-200 bg-violet-50/70 dark:bg-violet-950/20">
          <Shield className="size-4 text-violet-600" />
          <AlertTitle className="text-[13.5px] font-bold text-violet-900">Anonymous mode</AlertTitle>
          <AlertDescription className="text-[12.5px] text-violet-700 mt-0.5 leading-relaxed">
            Your identity will not be shared with the organiser. Responses are fully anonymised.
          </AlertDescription>
        </Alert>
      )}

      {/* Identity summary for nominative guests */}
      {!isLoggedIn && !isAnon && hasIdentity && (
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-foreground leading-snug">{name}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{email}</p>
            </div>
          </div>
          <button
            onClick={onEditIdentity}
            className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Edit
          </button>
        </div>
      )}

      {/* Join error */}
      {joinError && (
        <Alert variant="destructive" className="border-[1.5px]">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-[13.5px] font-bold">Failed to join</AlertTitle>
          <AlertDescription className="text-[12.5px] mt-0.5">{joinError}</AlertDescription>
        </Alert>
      )}

      <ActionButton
        eligibility={eligibility}
        modMeta={modMeta}
        joining={joining}
        joinError={joinError}
        isLoggedIn={isLoggedIn}
        isAnon={isAnon}
        hasIdentity={hasIdentity}
        onStart={onStart}
        onSignIn={onSignIn}
        onRetry={onRetry}
        onViewResults={onViewResults}
      />
    </div>
  </Card>
);
