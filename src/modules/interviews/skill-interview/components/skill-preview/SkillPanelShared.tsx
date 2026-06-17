import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';

export const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Card className={cn('rounded-[16px] gap-0 py-0', className)}>
    <CardContent className="p-6 md:p-7">
      {children}
    </CardContent>
  </Card>
);

export const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 bg-primary/8 border border-primary/20 text-primary">
      {icon}
    </div>
    <span className="text-[12px] font-bold text-foreground/70 uppercase tracking-[0.5px] font-sans">
      {title}
    </span>
  </div>
);

export const MetaBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = ({ icon, label, color, bg, border }) => (
  <Badge
    variant="outline"
    className="rounded-[8px] px-3 py-1.5 h-auto font-sans text-[12px] font-semibold gap-2"
    style={{ background: bg, borderColor: border, color }}
  >
    <span className="flex text-[14px]" style={{ color }}>{icon}</span>
    {label}
  </Badge>
);
