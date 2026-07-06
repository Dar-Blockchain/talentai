import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import { cn } from '@/lib/utils';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { EligibilityStatus } from './types';
import { ELIGIBILITY_CFG } from './constants';

interface Props {
  status:    EligibilityStatus;
  campaign:  Campaign | null;
  remaining: number | null;
}

export const EligibilityPanel: React.FC<Props> = ({ status, campaign, remaining }) => {
  const { Icon, alertCls, iconCls, title, subtitle } = ELIGIBILITY_CFG[status];
  return (
    <Alert className={cn('border-[1.5px] py-3.5 px-4', alertCls)}>
      <Icon className={cn('size-4', iconCls)} />
      <AlertTitle className="text-[13.5px] font-bold leading-snug">{title}</AlertTitle>
      <AlertDescription className="text-[12.5px] mt-0.5 leading-relaxed">
        {subtitle(campaign, remaining)}
      </AlertDescription>
    </Alert>
  );
};
