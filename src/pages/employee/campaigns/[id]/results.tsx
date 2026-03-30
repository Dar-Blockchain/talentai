'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import dynamic from 'next/dynamic';
import CampaignResultsView from '@/components/features/campaign/results/CampaignResultsView';

const EmployeeCampaignResults: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query as { id?: string };
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  if (!id || !authUser?._id) return null;

  return (
    <CampaignResultsView
      campaignId={id}
      participantId={authUser._id}
      breadcrumbs={[
        { label: 'Dashboard',    href: '/employee/dashboard' },
        { label: 'My Campaigns', href: '/employee/campaigns' },
        { label: '…',            href: `/employee/campaigns/${id}` },
        { label: 'Results' },
      ]}
      backHref={`/employee/campaigns/${id}`}
    />
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignResults), { ssr: false });
