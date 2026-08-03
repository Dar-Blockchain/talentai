import React from 'react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { ModuleMeta } from './types';

interface Props {
  campaign: Campaign | null;
  modMeta:  ModuleMeta | null;
}

export const CampaignHero: React.FC<Props> = ({ campaign, modMeta }) => (
  <div
    className="px-6 pt-7 pb-6 border-b border-border"
    style={{ background: modMeta ? `linear-gradient(150deg, ${modMeta.bg} 0%, hsl(var(--card)) 60%)` : undefined }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {modMeta && (
          <Badge
            variant="outline"
            className="mb-3.5 font-bold tracking-wider text-[11px] gap-1.5 border-[1.5px] uppercase"
            style={{ color: modMeta.color, borderColor: modMeta.border, background: modMeta.bg }}
          >
            <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: modMeta.color }} />
            {modMeta.label}
          </Badge>
        )}
        <h1 className="text-[1.4rem] font-black text-foreground leading-tight tracking-tight">
          {campaign?.title}
        </h1>
        {campaign?.description && (
          <p className="text-[13.5px] text-muted-foreground mt-2 leading-relaxed max-w-lg font-normal">
            {campaign.description}
          </p>
        )}
      </div>

      {modMeta && (
        <div
          className="size-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm"
          style={{ background: `linear-gradient(135deg, ${modMeta.bg}, white)`, borderColor: modMeta.border }}
        >
          <modMeta.Icon className="size-7" style={{ color: modMeta.color }} />
        </div>
      )}
    </div>
  </div>
);
