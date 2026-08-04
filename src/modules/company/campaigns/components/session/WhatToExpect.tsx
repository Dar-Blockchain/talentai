import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Separator } from '@/modules/shared/ui/shadcn/separator';
import type { ModuleMeta } from './types';

interface Props {
  modMeta: ModuleMeta;
}

export const WhatToExpect: React.FC<Props> = ({ modMeta }) => (
  <>
    <Separator />
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground mb-3">
        What to expect
      </p>
      <div className="rounded-xl border border-border overflow-hidden">

        {/* Module header */}
        <div
          className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border"
          style={{ background: `linear-gradient(135deg, ${modMeta.bg}, white)` }}
        >
          <div
            className="size-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
            style={{ background: `${modMeta.color}15`, borderColor: modMeta.border }}
          >
            <modMeta.Icon className="size-4.5" style={{ color: modMeta.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-foreground leading-snug">{modMeta.label}</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{modMeta.description}</p>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-semibold shrink-0 gap-1.5 border px-2.5"
            style={{ color: modMeta.color, borderColor: modMeta.border, background: 'white' }}
          >
            <Clock className="size-3" />
            {modMeta.duration}
          </Badge>
        </div>

        {/* Bullet list */}
        <ul className="p-4 flex flex-col gap-2.5 bg-muted/10">
          {modMeta.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13px] text-foreground/75 font-medium">
              <CheckCircle2 className="size-4 shrink-0 mt-px" style={{ color: modMeta.color }} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);
