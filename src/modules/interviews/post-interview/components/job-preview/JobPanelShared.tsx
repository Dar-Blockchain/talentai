import React from 'react';
import { Card, CardContent } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';

export const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="rounded-[16px] gap-0 py-0">
    <CardContent className="p-5 md:p-6">
      {children}
    </CardContent>
  </Card>
);

export const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="w-7 h-7 rounded-[6px] shrink-0 flex items-center justify-center border border-primary/20 bg-primary/8 text-primary"
    >
      {icon}
    </div>
    <span className="font-[Poppins] text-[12px] font-bold text-[#374151] uppercase tracking-[0.5px]">
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
    className="rounded-[8px] px-3 py-[6px] h-auto font-[Poppins] text-[12px] font-semibold gap-[6px]"
    style={{ background: bg, borderColor: border, color }}
  >
    <span className="flex text-[14px]" style={{ color }}>{icon}</span>
    {label}
  </Badge>
);
