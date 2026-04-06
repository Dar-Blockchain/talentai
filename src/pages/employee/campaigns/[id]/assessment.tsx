'use client';

import React, { useCallback, useEffect } from 'react';
import { useRouter }        from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState }   from '@/store/store';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';

import {
  fetchCampaignById,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
} from '@/store/slices/campaignSlice';

import { GlobalStyles }           from '@/components/features/campaign/assessment/styles';
import { InterviewSpinner, InterviewErrorState, InterviewExpiredState } from '@/components/features/campaign/assessment/InterviewLoadingState';
import InterviewUnsupportedModule from '@/components/features/campaign/assessment/InterviewUnsupportedModule';
import { daysLeft } from '@/utils/functions';
import QuestionnaireAssessment    from '@/components/features/campaign/assessment/QuestionnaireAssessment';
import InterviewAssessment        from '@/components/features/campaign/assessment/InterviewAssessment';

const EmployeeCampaignAssessment: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id }   = router.query as { id?: string };

  const authUser        = useSelector((state: RootState) => state.user.connectedUser.user);
  const campaign        = useSelector(selectSelectedCampaign);
  const campaignLoading = useSelector(selectDetailLoading);
  const campaignError   = useSelector(selectDetailError);

  // For ANONYMOUS campaigns use the token stored in localStorage; otherwise use the user's _id
  const participantId = (() => {
    if (!campaign || !id) return authUser?._id ?? '';
    if (campaign.anonymityMode === 'ANONYMOUS') {
      return (typeof window !== 'undefined' ? localStorage.getItem(`anon_token_${id}`) : null) ?? authUser?._id ?? '';
    }
    return authUser?._id ?? '';
  })();

  useEffect(() => {
    if (id) dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  const handleBack = useCallback(
    () => router.push(`/employee/campaigns/${id}`),
    [router, id],
  );

  const handleResults = useCallback(
    () => router.push(`/employee/campaigns/${id}/results`),
    [router, id],
  );

  if (!router.isReady || campaignLoading) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewSpinner />
      </>
    );
  }

  if (campaignError || !campaign) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewErrorState message={campaignError} onBack={handleBack} />
      </>
    );
  }

  const isExpired = campaign.deadline
    ? new Date(campaign.deadline).getTime() < Date.now()
    : false;
  const pStatus = campaign.participantStatus;

  if (isExpired && pStatus !== 'COMPLETED') {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewExpiredState onBack={handleBack} />
      </>
    );
  }

  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      {moduleType === 'QUESTIONNAIRE' ? (
        <QuestionnaireAssessment
          campaign={campaign}
          participantId={participantId}
          onBack={handleBack}
          onComplete={handleResults}
        />
      ) : moduleType === 'AI_INTERVIEW' || moduleType === 'SKILL_TEST' ? (
        <InterviewAssessment
          campaign={campaign}
          participantId={participantId}
          campaignId={id ?? ''}
          onBack={handleBack}
        />
      ) : (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
          <Box sx={{ maxWidth: 600, mx: 'auto', py: 10, px: 3 }}>
            <InterviewUnsupportedModule moduleType={moduleType} onBack={handleBack} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignAssessment), { ssr: false });
