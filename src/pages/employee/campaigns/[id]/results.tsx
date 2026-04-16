'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import dynamic from 'next/dynamic';
import CampaignResultsView from '@/components/features/campaign/results/CampaignResultsView';
import { selectSelectedCampaign } from '@/store/slices/campaignSlice';

const MAX_TITLE_LENGTH = 28;

const EmployeeCampaignResults: React.FC = () => {
  const router    = useRouter();
  const { id }    = router.query as { id?: string };
  const authUser  = useSelector((state: RootState) => state.user.connectedUser.user);
  const campaign  = useSelector(selectSelectedCampaign);

  if (!id || !authUser?._id) return null;

  const title     = campaign?.title ?? '';
  const crumbLabel = title.length > MAX_TITLE_LENGTH
    ? `${title.slice(0, MAX_TITLE_LENGTH)}…`
    : title || '…';

  return (
    <CampaignResultsView
      campaignId={id}
      participantId={authUser._id}
      breadcrumbs={[
        { label: 'Dashboard',    href: '/employee/dashboard' },
        { label: 'My Campaigns', href: '/employee/campaigns' },
        { label: crumbLabel,     href: `/employee/campaigns/${id}` },
        { label: 'Results' },
      ]}
      backHref={`/employee/campaigns/${id}`}
    />
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignResults), { ssr: false });
