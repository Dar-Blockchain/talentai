'use client';

import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import CampaignResultsView from '@/components/features/campaign/results/CampaignResultsView';

const CompanyCampaignResults: React.FC = () => {
  const router = useRouter();
  const { id, userId } = router.query as { id?: string; userId?: string };

  if (!id || !userId) return null;

  return (
    <CampaignResultsView
      campaignId={id}
      participantId={userId}
      breadcrumbs={[
        { label: 'Dashboard', href: '/company/dashboard' },
        { label: 'Campaigns', href: '/company/campaigns' },
        { label: '…',         href: `/company/campaigns/${id}` },
        { label: 'Results' },
      ]}
      backHref={`/company/campaigns/${id}`}
    />
  );
};

export default dynamic(() => Promise.resolve(CompanyCampaignResults), { ssr: false });
