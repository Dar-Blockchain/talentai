'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';
import { Campaign } from '@/types/campaign';
import { GlobalStyles }           from '@/components/features/campaign/assessment/styles';
import { InterviewSpinner, InterviewErrorState } from '@/components/features/campaign/assessment/InterviewLoadingState';
import InterviewUnsupportedModule from '@/components/features/campaign/assessment/InterviewUnsupportedModule';
import QuestionnaireAssessment    from '@/components/features/campaign/assessment/QuestionnaireAssessment';
import InterviewAssessment        from '@/components/features/campaign/assessment/InterviewAssessment';

/**
 * Public assessment page for LINK-based campaigns.
 * - LINK+ANONYMOUS: reads anonymousToken from localStorage (key: anon_token_${id})
 * - LINK+NOMINATIVE (no account): reads linkAccessToken from localStorage (key: link_token_${id})
 */
const PublicAssessmentPage: React.FC = () => {
  const router      = useRouter();
  const { campaignId } = router.query as { campaignId?: string };

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Resolve participantId from localStorage once the campaignId is available
  const participantId = (() => {
    if (typeof window === 'undefined' || !campaignId) return '';
    return (
      localStorage.getItem(`anon_token_${campaignId}`) ||
      localStorage.getItem(`link_token_${campaignId}`) ||
      ''
    );
  })();

  useEffect(() => {
    if (!router.isReady || !campaignId) return;
    axiosInstance
      .get(`internal-campaigns/${campaignId}/public`)
      .then((res) => setCampaign(res.data.data as Campaign))
      .catch((e) => setError(e.response?.data?.error ?? e.message))
      .finally(() => setLoading(false));
  }, [router.isReady, campaignId]);

  const handleBack    = () => router.push('/');
  const handleResults = () => router.push(`/campaign/results/${campaignId}`);

  if (!router.isReady || loading) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewSpinner />
      </>
    );
  }

  if (error || !campaign || !participantId) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewErrorState
          message={error ?? 'Session expired. Please rejoin via the campaign link.'}
          onBack={handleBack}
        />
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
          campaignId={campaignId ?? ''}
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

export default dynamic(() => Promise.resolve(PublicAssessmentPage), { ssr: false });
