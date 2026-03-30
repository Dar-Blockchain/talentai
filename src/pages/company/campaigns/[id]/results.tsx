'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import CampaignResultsView from '@/components/features/campaign/results/CampaignResultsView';
import { selectSelectedCampaign } from '@/store/slices/campaignSlice';

const MAX_TITLE_LENGTH = 28;

const CompanyCampaignResults: React.FC = () => {
  const router    = useRouter();
  const { id, userId } = router.query as { id?: string; userId?: string };
  const campaign  = useSelector(selectSelectedCampaign);

  if (!id || !userId) return null;

  const title      = campaign?.title ?? '';
  const crumbLabel = title.length > MAX_TITLE_LENGTH
    ? `${title.slice(0, MAX_TITLE_LENGTH)}…`
    : title || '…';

  return (
    <CampaignResultsView
      campaignId={id}
      participantId={userId}
      breadcrumbs={[
        { label: 'Dashboard', href: '/company/dashboard' },
        { label: 'Campaigns', href: '/company/campaigns' },
        { label: crumbLabel,  href: `/company/campaigns/${id}` },
        { label: 'Results' },
      ]}
      backHref={`/company/campaigns/${id}`}
    />
  );
};

export default dynamic(() => Promise.resolve(CompanyCampaignResults), { ssr: false });
