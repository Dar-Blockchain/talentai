import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';

export const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Card className={cn('rounded-[16px] gap-0 py-0', className)}>
    <CardContent className="p-5 md:p-6">
      {children}
    </CardContent>
  </Card>
);

// Lightweight section label for the stacked sub-sections inside a card.
export const SubHeading: React.FC<{ title: string }> = ({ title }) => (
  <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-[0.6px] font-sans mb-3">
    {title}
  </p>
);
