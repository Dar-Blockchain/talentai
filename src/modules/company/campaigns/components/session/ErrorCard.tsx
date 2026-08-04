import React from 'react';
import { XCircle } from 'lucide-react';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { SessionShell } from './SessionShell';

interface Props {
  message?: string | null;
  onHome:   () => void;
}

export const ErrorCard: React.FC<Props> = ({ message, onHome }) => (
  <SessionShell>
    <Card className="w-full max-w-sm gap-0 py-0 overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="size-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <XCircle className="size-7 text-destructive" />
        </div>
        <div>
          <p className="font-bold text-base text-card-foreground">Campaign Not Found</p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {message ?? 'This link is invalid or the campaign is no longer available.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onHome}>Go Home</Button>
      </CardContent>
    </Card>
  </SessionShell>
);
