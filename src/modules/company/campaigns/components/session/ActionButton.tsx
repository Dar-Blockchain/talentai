import React from 'react';
import { Loader2, RefreshCw, LogIn, CheckCheck, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';
import type { EligibilityStatus, ModuleMeta } from './types';

interface Props {
  eligibility:   EligibilityStatus;
  modMeta:       ModuleMeta | null;
  joining:       boolean;
  joinError:     string | null;
  isLoggedIn:    boolean;
  isAnon:        boolean;
  hasIdentity:   boolean;
  onStart:       () => void;
  onSignIn:      () => void;
  onRetry:       () => void;
  onViewResults: () => void;
}

export const ActionButton: React.FC<Props> = ({
  eligibility, modMeta, joining, joinError,
  isLoggedIn, isAnon, hasIdentity,
  onStart, onSignIn, onRetry, onViewResults,
}) => {
  if (joining) {
    return (
      <div className="flex flex-col items-center gap-2.5 py-6">
        <Loader2 className="size-5 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-[13.5px] font-semibold text-foreground">
            Starting {modMeta?.label ?? 'assessment'}…
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (joinError) {
    return (
      <Button variant="outline" className="w-full gap-2 h-11 font-semibold" onClick={onRetry}>
        <RefreshCw className="size-4" /> Try Again
      </Button>
    );
  }

  if (eligibility === 'login_required') {
    return (
      <Button className="w-full gap-2 h-11 font-bold text-[13.5px]" onClick={onSignIn}>
        <LogIn className="size-4" /> Sign In to Participate
      </Button>
    );
  }

  if (eligibility === 'already_completed') {
    return (
      <Button variant="outline" className="w-full gap-2 h-11 font-bold text-[13.5px]" onClick={onViewResults}>
        <CheckCheck className="size-4" /> View My Results
      </Button>
    );
  }

  if (eligibility === 'campaign_inactive' || eligibility === 'expired') {
    return (
      <Button disabled className="w-full h-11 gap-2 font-bold text-[13.5px]">
        <XCircle className="size-4" />
        {eligibility === 'expired' ? 'Campaign has expired' : 'Campaign unavailable'}
      </Button>
    );
  }

  if (eligibility === 'eligible') {
    const needsIdentity = !isAnon && !isLoggedIn && !hasIdentity;
    return (
      <Button
        className="w-full h-12 gap-2 text-[13.5px] font-bold tracking-wide"
        disabled={needsIdentity}
        onClick={onStart}
        style={modMeta && !needsIdentity
          ? { background: modMeta.color, boxShadow: `0 4px 20px ${modMeta.color}40` }
          : undefined}
      >
        {needsIdentity
          ? 'Enter your details above to continue'
          : <> Start {modMeta?.label ?? 'Assessment'} <ArrowRight className="size-4" /></>
        }
      </Button>
    );
  }

  return null;
};
