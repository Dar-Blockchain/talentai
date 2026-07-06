import React from 'react';
import { User, Mail, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Input } from '@/modules/shared/ui/shadcn/input';
import { Label } from '@/modules/shared/ui/shadcn/label';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { ModuleMeta } from './types';
import { SessionShell } from './SessionShell';

interface Props {
  campaign:      Campaign | null;
  modMeta:       ModuleMeta | null;
  name:          string;
  email:         string;
  nameErr:       string;
  emailErr:      string;
  onNameChange:  (v: string) => void;
  onEmailChange: (v: string) => void;
  onContinue:    () => void;
  onSignIn:      () => void;
}

export const IdentityGate: React.FC<Props> = ({
  campaign, modMeta, name, email, nameErr, emailErr,
  onNameChange, onEmailChange, onContinue, onSignIn,
}) => (
  <SessionShell>
    <Card className="w-full max-w-sm gap-0 py-0 overflow-hidden">
      <div
        className="px-6 pt-6 pb-5 border-b border-border"
        style={{ background: modMeta ? `linear-gradient(160deg, ${modMeta.bg} 0%, hsl(var(--card)) 80%)` : undefined }}
      >
        <div
          className="size-11 rounded-xl flex items-center justify-center mb-3 border"
          style={{ background: modMeta?.bg, borderColor: modMeta?.border }}
        >
          {modMeta && <modMeta.Icon className="size-5" style={{ color: modMeta.color }} />}
        </div>
        <p className="font-extrabold text-base text-card-foreground leading-tight">{campaign?.title}</p>
        <p className="text-xs text-muted-foreground mt-1.5">
          This campaign collects your name and email for result attribution.
        </p>
      </div>

      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9" placeholder="Your full name" value={name}
              onChange={(e) => onNameChange(e.target.value)}
              aria-invalid={!!nameErr}
            />
          </div>
          {nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9" type="email" placeholder="you@example.com" value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              aria-invalid={!!emailErr}
            />
          </div>
          {emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
        </div>

        <Button
          className="w-full gap-2 mt-1"
          style={modMeta ? { background: modMeta.color } : undefined}
          onClick={onContinue}
        >
          Continue <ArrowRight className="size-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Have an account?{' '}
          <button
            onClick={onSignIn}
            className="font-semibold hover:underline underline-offset-2 text-primary"
          >
            Sign in instead
          </button>
        </p>
      </CardContent>
    </Card>
  </SessionShell>
);
