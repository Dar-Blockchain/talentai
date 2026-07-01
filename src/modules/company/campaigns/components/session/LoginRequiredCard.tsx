import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { SessionShell } from './SessionShell';

interface Props {
  onSignIn: () => void;
}

export const LoginRequiredCard: React.FC<Props> = ({ onSignIn }) => (
  <SessionShell>
    <Card className="w-full max-w-sm gap-0 py-0 overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="size-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="size-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-base text-card-foreground">Sign In Required</p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            This campaign requires a TalentAI account to participate.
          </p>
        </div>
        <Button className="w-full gap-2" onClick={onSignIn}>
          <LogIn className="size-4" /> Sign In to Participate
        </Button>
      </CardContent>
    </Card>
  </SessionShell>
);
