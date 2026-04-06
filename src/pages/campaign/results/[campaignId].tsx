'use client';

import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import CampaignResultsView from '@/components/features/campaign/results/CampaignResultsView';

/**
 * Public results page for LINK-based campaigns (anonymous or nominative without account).
 * Reads participantId from localStorage (set during join/assessment).
 */
const PublicCampaignResults: React.FC = () => {
  const router = useRouter();
  const { campaignId } = router.query as { campaignId?: string };

  const participantId = (() => {
    if (typeof window === 'undefined' || !campaignId) return '';
    return (
      localStorage.getItem(`anon_token_${campaignId}`) ||
      localStorage.getItem(`link_token_${campaignId}`) ||
      ''
    );
  })();

  if (!router.isReady || !campaignId || !participantId) return null;

  return (
    <CampaignResultsView
      campaignId={campaignId}
      participantId={participantId}
      breadcrumbs={[{ label: 'Results' }]}
      backHref="/"
      noLayout
    />
  );
};

export default dynamic(() => Promise.resolve(PublicCampaignResults), { ssr: false });
