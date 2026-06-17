'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axiosInstance from '@/utils/axiosInstance';
import { Campaign } from '@/types/campaign';
import { GlobalStyles, InterviewSpinner, InterviewErrorState, QuestionnaireAssessment } from '@/modules/interviews/questionnaire';
import { buildInterviewUrl }      from '@/lib/interviewSession';

/**
 * Public questionnaire page for LINK-based campaigns (QUESTIONNAIRE module only).
 * AI_INTERVIEW and SKILL_TEST campaigns are redirected to /interviews/[sessionId].
 */
const CampaignQuestionnairePage: React.FC = () => {
  const router         = useRouter();
  const { campaignId } = router.query as { campaignId?: string };

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

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
      .then((res) => {
        const c = res.data.data as Campaign;
        const modType = c.module?.type;
        if (modType === 'AI_INTERVIEW' || modType === 'SKILL_TEST') {
          router.replace(buildInterviewUrl({ type: 'campaign', campaignId, moduleType: modType }));
          return;
        }
        setCampaign(c);
      })
      .catch((e) => setError(e.response?.data?.error ?? e.message))
      .finally(() => setLoading(false));
  }, [router.isReady, campaignId]);

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
          onBack={() => router.push('/')}
        />
      </>
    );
  }

  return (
    <>
      <style jsx global>{GlobalStyles}</style>
      <QuestionnaireAssessment
        campaign={campaign}
        participantId={participantId}
        onBack={() => router.push('/')}
        onComplete={() => console.log('[Campaign] Questionnaire completed', { campaignId, participantId })}
      />
    </>
  );
};

export default dynamic(() => Promise.resolve(CampaignQuestionnairePage), { ssr: false });
