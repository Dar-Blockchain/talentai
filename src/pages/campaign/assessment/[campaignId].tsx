'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
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

  const [campaign,          setCampaign]          = useState<Campaign | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [waitingResults,    setWaitingResults]    = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleBack = () => router.push('/');

  const handleResults = useCallback(() => {
    if (!campaignId || !participantId) return;
    setWaitingResults(true);
    const poll = async () => {
      try {
        const res = await axiosInstance.get(
          `internal-campaigns/${campaignId}/results/${participantId}`
        );
        if (res.data?.data?.participant?.status === 'COMPLETED') {
          router.push(`/campaign/results/${campaignId}`);
          return;
        }
      } catch { /* keep polling */ }
      pollRef.current = setTimeout(poll, 2000);
    };
    poll();
  }, [campaignId, participantId, router]);

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  if (!router.isReady || loading) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <InterviewSpinner />
      </>
    );
  }

  if (waitingResults) {
    return (
      <>
        <style jsx global>{GlobalStyles}</style>
        <Box sx={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: '#F8FAFC',
        }}>
          <CircularProgress size={40} sx={{ color: '#0D9488' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>
            Saving your results…
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
            You'll be redirected automatically once they're ready.
          </Typography>
        </Box>
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
          onComplete={() => router.push(`/campaign/results/${campaignId}`)}
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
