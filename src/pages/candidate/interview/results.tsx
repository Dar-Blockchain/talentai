'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useToast } from '@/hooks/useToast';
import Cookies from 'js-cookie';
import { logInterviewDataToConsole } from '@/utils/exportInterviewData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { notifySkillTestPassed, notifySkillLevelUp, notifySkillTestCompleted } from '@/utils/notificationHelpers';
import { createNotification, broadcastSystemNotification } from '@/store/slices/notificationSlice';
import { updateProfileQuota, updateProfileSkills, updateProfileSoftSkill, getMyProfile } from '@/store/slices/userSlice';
import { savePostInterviewAssessment } from '@/store/slices/postSlice';
import { saveInterviewAssessment, fetchInterviewDetailsById } from '@/store/slices/interviewSlice';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import {
  ResultsHeader,
  KeyStrengths,
  AreasForImprovement,
  CoverageDetails,
  InterviewFeedback,
  LoadingState,
  ErrorState,
  InterviewAnalysis,
  determineLevel,
} from '@/components/features/interview/results';

export default function InterviewResults() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation('modules/interview/results');
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      fetchAnalysis();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (analysis) {
      logInterviewDataToConsole();
    }
  }, [analysis]);

  const saveInterviewToBackend = async (showStatus = true) => {
    try {
      const storedAnalysis = localStorage.getItem('last_interview_analysis');
      if (!storedAnalysis) {
        console.log('⚠️ [Save] No interview data to save');
        if (showStatus) showToast({ message: 'No interview data to save', severity: 'error' });
        return;
      }

      const parsedData = JSON.parse(storedAnalysis);

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId') || localStorage.getItem('interview_jobId');
      const role = urlParams.get('role') || localStorage.getItem('interview_role');
      const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
      const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');
      const skillType = localStorage.getItem('interview_type');

      if (parsedData?.finalReport?.coverage?.areas) {
        const areas = parsedData.finalReport.coverage.areas;
        Object.keys(areas).forEach((key) => {
          const area = areas[key];
          if (area.percentage > 100) area.percentage = Math.min(area.percentage, 100);
          if (area.aiAnalysis?.qualityScore > 5) area.aiAnalysis.qualityScore = Math.min(area.aiAnalysis.qualityScore, 5);
        });

        let weightedSum = 0;
        let totalWeight = 0;
        Object.values(areas).forEach((area: any) => {
          const weight = area.weight || 1;
          const percentage = area.percentage || 0;
          weightedSum += percentage * weight;
          totalWeight += weight;
        });
        if (totalWeight > 0) parsedData.finalReport.coverage.overall = Math.round(weightedSum / totalWeight);
      }

      const effectiveSkill = role || skill || 'N/A';

      let result;

      if (jobId) {
        const actionResult = await dispatch(savePostInterviewAssessment({ postId: jobId, interviewData: parsedData }));

        if (savePostInterviewAssessment.rejected.match(actionResult)) {
          const errorMsg = actionResult.payload as string;
          console.error('❌ [Save] Failed to save post interview:', errorMsg);
          if (errorMsg?.includes('already exists') || errorMsg?.includes('DUPLICATE')) {
            if (showStatus) showToast({ message: t('save.duplicate'), severity: 'info' });
            return;
          }
          if (errorMsg?.includes('reached') && errorMsg?.includes('limit')) {
            showToast({ message: errorMsg, severity: 'warning' });
            return;
          }
          showToast({ message: errorMsg || t('save.failed'), severity: 'error' });
          return;
        }
        result = actionResult.payload;
      } else {
        const actionResult = await dispatch(saveInterviewAssessment({ skill: effectiveSkill || 'General', proficiency: proficiency || 'Mid Level', skillType: skillType, interviewData: parsedData }));

        if (saveInterviewAssessment.rejected.match(actionResult)) {
          const errorMsg = actionResult.payload as string;
          console.error('❌ [Save] Failed to save interview:', errorMsg);
          if (errorMsg?.includes('already exists') || errorMsg?.includes('DUPLICATE')) {
            if (showStatus) showToast({ message: t('save.duplicate'), severity: 'info' });
            return;
          }
          if (errorMsg?.includes('reached') && errorMsg?.includes('limit')) {
            showToast({ message: errorMsg, severity: 'warning' });
            return;
          }
          showToast({ message: errorMsg || t('save.failed'), severity: 'error' });
          return;
        }
        result = actionResult.payload;
      }

      console.log('✅ [Save] Interview saved successfully:', result.data);

      const candidateData = result.data?.candidateId || result.data?.candidate;
      const profileData = candidateData?.profile || candidateData;
      console.log('🔄 [Save] Updating candidate profile with data:', profileData);
      if (profileData?.quota !== undefined) dispatch(updateProfileQuota(profileData.quota));
      if (profileData?.softSkills) dispatch(updateProfileSoftSkill(profileData.softSkills));
      if (profileData?.skills) dispatch(updateProfileSkills(profileData.skills));
      if (result.data?._id) localStorage.setItem('last_interview_id', result.data._id);

      dispatch(getMyProfile());

      try {
        const skillName = effectiveSkill !== 'N/A' ? effectiveSkill : null;
        notifySkillTestCompleted(dispatch, skillName || 'Interview');

        const interviewLabel = skillName ? `your ${skillName} interview` : 'your interview';
        dispatch(createNotification({ type: 'success', content: `You completed ${interviewLabel}. Your results are now available in your dashboard.` }));

        if (jobId) {
          try {
            const companyUserId = result.data?.post?.user?._id || result.data?.post?.user;
            if (companyUserId) {
              const candidateName = `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim() || 'A candidate';
              const jobTitle = result.data?.post?.jobDetails?.title || null;
              const companyInterviewLabel = jobTitle ? `the interview for "${jobTitle}"` : skillName ? `the ${skillName} interview` : 'an interview';
              dispatch(broadcastSystemNotification({ content: `${candidateName} has just completed ${companyInterviewLabel}. Check your dashboard to review their results.`, recipientIds: [companyUserId] }));
            }
          } catch (companyNotifError) {
            console.error('❌ [Save] Error notifying company:', companyNotifError);
          }
        }
      } catch (notifError) {
        console.error('❌ [Save] Error sending notification:', notifError);
      }

      if (showStatus) showToast({ message: t('save.success'), severity: 'success' });
      return result;
    } catch (error) {
      console.error('❌ [Save] Error saving interview:', error);
    }
  };

  useEffect(() => {
    if (analysis) saveInterviewToBackend(false);
  }, [analysis]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);

      const storedAnalysis = localStorage.getItem('last_interview_analysis');

      if (storedAnalysis) {
        try {
          const parsedAnalysis = JSON.parse(storedAnalysis);
          const transformedAnalysis = transformSocketAnalysis(parsedAnalysis);

          if (transformedAnalysis) {
            (window as any).INTERVIEW_DATA = { original: parsedAnalysis, transformed: transformedAnalysis, timestamp: new Date().toISOString() };
            setAnalysis(transformedAnalysis);
            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('❌ [Results] Failed to parse stored analysis:', parseError);
        }
      }

      const token = localStorage.getItem('api_token') || Cookies.get('api_token');

      if (!token) {
        router.push('/signin');
        return;
      }

      const interviewId = router.query.id || localStorage.getItem('last_interview_id');

      if (!interviewId) {
        setError(t('errors.no_data'));
        setLoading(false);
        return;
      }

      try {
        const actionResult = await dispatch(fetchInterviewDetailsById(interviewId as string));
        if (fetchInterviewDetailsById.fulfilled.match(actionResult)) {
          const transformedAnalysis = transformAPIAnalysis(actionResult.payload);
          if (transformedAnalysis) {
            setAnalysis(transformedAnalysis);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ [Results] API call failed:', apiError);
      }

      setError(t('errors.no_analysis'));
    } catch (err: any) {
      console.error('❌ [Results] Error fetching analysis:', err);
      setError(err.message || 'Failed to load interview results');
    } finally {
      setLoading(false);
    }
  };

  const transformSocketAnalysis = (socketData: any): InterviewAnalysis | null => {
    const finalReport = socketData.finalReport || socketData;
    const analytics = socketData.analytics || {};
    const scores = finalReport.scores || {};
    const coverage = finalReport.coverage || {};

    const hasActualData =
      (finalReport && Object.keys(finalReport).length > 0) ||
      (analytics && Object.keys(analytics).length > 0) ||
      (scores && Object.keys(scores).length > 0) ||
      (coverage && coverage.areas && Object.keys(coverage.areas).length > 0);

    if (!hasActualData) return null;

    const interviewType = socketData.interviewType || 'General Interview';
    const urlParams = new URLSearchParams(window.location.search);
    const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
    const role = urlParams.get('role') || localStorage.getItem('interview_role');
    const category = urlParams.get('category') || localStorage.getItem('interview_category');

    let overallScore = scores.overall || 0;
    if (!overallScore && coverage.areas && Object.keys(coverage.areas).length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;
      Object.values(coverage.areas).forEach((area: any) => {
        const weight = area.weight || 1;
        const percentage = area.percentage || 0;
        weightedSum += percentage * weight;
        totalWeight += weight;
      });
      overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    let primarySkillName = 'General Assessment';
    if (role && role !== 'N/A') primarySkillName = role;
    else if (skill && skill !== 'N/A') primarySkillName = skill;
    else if (category && category !== 'N/A') primarySkillName = category;
    else if (interviewType === 'HR_INTERVIEW') primarySkillName = 'HR Interview';
    else if (interviewType === 'TECHNICAL_INTERVIEW') primarySkillName = 'Technical Assessment';

    const skillScores = [{ skill: primarySkillName, score: overallScore, level: determineLevel(overallScore), strengths: finalReport.strengths || [], improvements: finalReport.weaknesses || [] }];

    return {
      overallScore,
      overallLevel: determineLevel(overallScore),
      interviewType,
      duration: analytics.duration || 0,
      completedAt: socketData.timestamp || new Date().toISOString(),
      skillScores,
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      recommendations: finalReport.recommendations || [],
      feedback: finalReport.summary || 'Interview analysis in progress...',
      conversationQuality: { clarity: scores.clarity || 0, relevance: scores.relevance || 0, depth: scores.depth || 0, engagement: scores.engagement || 0 },
      coverage: coverage.areas || {},
    };
  };

  const transformAPIAnalysis = (apiData: any): InterviewAnalysis | null => {
    const hasActualData = apiData && (apiData.overallScore !== undefined || (apiData.skillDetails && apiData.skillDetails.length > 0) || (apiData.recommendations && apiData.recommendations.length > 0));
    if (!hasActualData) return null;

    return {
      overallScore: apiData.overallScore || 0,
      overallLevel: determineLevel(apiData.overallScore || 0),
      interviewType: apiData.type || 'General Interview',
      duration: 30,
      completedAt: apiData.createdAt || new Date().toISOString(),
      skillScores: apiData.skillDetails?.map((skill: any) => ({ skill: skill.name, score: skill.confidenceScore || 0, level: skill.experienceLevel || 'Not Assessed', strengths: [], improvements: [] })) || [],
      strengths: apiData.recommendations || [],
      weaknesses: [],
      recommendations: apiData.recommendations || [],
      feedback: 'Interview analysis completed',
      conversationQuality: { clarity: 0, relevance: 0, depth: 0, engagement: 0 },
      coverage: {},
    };
  };

  if (loading) return <LoadingState />;
  if (error || !analysis) return <ErrorState error={error} />;

  return (
    <PageContainer>
      <Header />
      <ResultsHeader analysis={analysis} />
      <KeyStrengths strengths={analysis.strengths} />
      <AreasForImprovement weaknesses={analysis.weaknesses} />
      <CoverageDetails coverage={analysis.coverage} />
      <InterviewFeedback interviewId={localStorage.getItem('last_interview_id') || undefined} />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => { window.location.href = '/candidate/dashboard'; }}
          sx={{ bgcolor: '#8310FF', color: '#fff', fontWeight: 600, borderRadius: '10px', px: 4, py: 1.5, textTransform: 'none', boxShadow: 'none', fontFamily: 'Poppins', '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' } }}
        >
          {t('back_to_dashboard')}
        </Button>
      </Box>
    </PageContainer>
  );
}
