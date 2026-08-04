import React from 'react';
import { Clock, Users, Link2, Lock, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { cn } from '@/lib/utils';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { ModuleMeta, DeadlineBadge } from './types';

interface Props {
  campaign:      Campaign | null;
  modMeta:       ModuleMeta | null;
  isAnon:        boolean;
  deadlineBadge: DeadlineBadge | null;
}

export const CampaignMetaBadges: React.FC<Props> = ({ campaign, modMeta, isAnon, deadlineBadge }) => (
  <div className="px-6 py-3.5 border-b border-border bg-muted/20 flex flex-wrap gap-2">
    {modMeta && (
      <Badge variant="outline" className="gap-1.5 h-7 px-3 text-[12px] font-semibold"
        style={{ color: modMeta.color, borderColor: `${modMeta.color}50`, background: modMeta.bg }}>
        <modMeta.Icon className="size-3.5" />
        {modMeta.label}
      </Badge>
    )}

    <Badge variant="outline" className="gap-1.5 h-7 px-3 text-[12px] font-semibold"
      style={{
        color:       isAnon ? '#7C3AED' : '#0369A1',
        borderColor: isAnon ? '#C4B5FD' : '#93C5FD',
        background:  isAnon ? '#F5F3FF' : '#EFF6FF',
      }}>
      {isAnon ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      {isAnon ? 'Anonymous' : 'Nominative'}
    </Badge>

    <Badge variant="outline" className="gap-1.5 h-7 px-3 text-[12px] font-semibold"
      style={{
        color:       campaign?.accessMethod === 'LINK' ? '#059669' : '#4F46E5',
        borderColor: campaign?.accessMethod === 'LINK' ? '#6EE7B7' : '#A5B4FC',
        background:  campaign?.accessMethod === 'LINK' ? '#ECFDF5' : '#EEF2FF',
      }}>
      {campaign?.accessMethod === 'LINK' ? <Link2 className="size-3.5" /> : <Lock className="size-3.5" />}
      {campaign?.accessMethod === 'LINK' ? 'Public link' : 'Account only'}
    </Badge>

    {campaign?.deadline && deadlineBadge && (
      <Badge variant="outline" className={cn('gap-1.5 h-7 px-3 text-[12px] font-semibold',
        deadlineBadge.urgent
          ? 'text-destructive border-destructive/40 bg-destructive/5'
          : 'text-muted-foreground border-border bg-muted/40')}>
        <Clock className="size-3.5" />
        {deadlineBadge.text}
      </Badge>
    )}

    {campaign?.targetEmployeeCount != null && (
      <Badge variant="outline" className="gap-1.5 h-7 px-3 text-[12px] font-semibold text-muted-foreground border-border bg-muted/40">
        <Users className="size-3.5" />
        {campaign.targetEmployeeCount} participants
      </Badge>
    )}
  </div>
);
