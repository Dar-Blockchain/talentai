'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useToast } from '@/hooks/useToast';
import Cookies from 'js-cookie';
import { logInterviewDataToConsole } from '@/utils/exportInterviewData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { notifySkillTestPassed, notifySkillLevelUp, notifySkillTestCompleted } from '@/utils/notificationHelpers';
import { updateProfileQuota, updateProfileSkills, updateProfileSoftSkill, getMyProfile } from '@/store/slices/userSlice';
import { savePostInterviewAssessment } from '@/store/slices/postSlice';
import { saveInterviewAssessment, fetchInterviewDetailsById, claimInterviewReward } from '@/store/slices/interviewSlice';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import {
  ResultsHeader,
  RewardNotification,
  KeyStrengths,
  AreasForImprovement,
  CoverageDetails,
  LoadingState,
  ErrorState,
  InterviewAnalysis,
  RewardInfo,
  determineLevel,
} from '@/components/features/interview/results';

export default function InterviewResults() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      fetchAnalysis();
    }
  }, [router.isReady]);

  // Auto-log interview data to console on page load
  useEffect(() => {
    if (analysis) {
      logInterviewDataToConsole();
    }
  }, [analysis]);

  // Save interview data to backend
  const saveInterviewToBackend = async (showStatus = true) => {
    try {
      const storedAnalysis = localStorage.getItem('last_interview_analysis');
      if (!storedAnalysis) {
        console.log('⚠️ [Save] No interview data to save');
        if (showStatus) showToast({ message: 'No interview data to save', severity: 'error' });
        return;
      }

      const parsedData = JSON.parse(storedAnalysis);

      // Get metadata from URL params first, then localStorage as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId') || localStorage.getItem('interview_jobId');
      const role = urlParams.get('role') || localStorage.getItem('interview_role');
      const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
      const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');
      const skillType = localStorage.getItem('interview_type');
      // Fix confidence scores in coverage areas before sending
      if (parsedData?.finalReport?.coverage?.areas) {
        const areas = parsedData.finalReport.coverage.areas;
        Object.keys(areas).forEach((key) => {
          const area = areas[key];
          if (area.percentage > 100) {
            area.percentage = Math.min(area.percentage, 100);
          }
          if (area.aiAnalysis?.qualityScore > 5) {
            area.aiAnalysis.qualityScore = Math.min(area.aiAnalysis.qualityScore, 5);
          }
        });

        let weightedSum = 0;
        let totalWeight = 0;

        Object.values(areas).forEach((area: any) => {
          const weight = area.weight || 1;
          const percentage = area.percentage || 0;
          weightedSum += percentage * weight;
          totalWeight += weight;
        });

        if (totalWeight > 0) {
          parsedData.finalReport.coverage.overall = Math.round(weightedSum / totalWeight);
        }
      }

      const effectiveSkill = role || skill || 'N/A';

      let result;

      // Use different API based on whether jobId exists
      if (jobId) {
        // Use postSlice thunk for job-based interviews
        const actionResult = await dispatch(savePostInterviewAssessment({
          postId: jobId,
          interviewData: parsedData
        }));

        if (savePostInterviewAssessment.rejected.match(actionResult)) {
          const errorMsg = actionResult.payload as string;
          console.error('❌ [Save] Failed to save post interview:', errorMsg);

          // Check for duplicate session error
          if (errorMsg?.includes('already exists') || errorMsg?.includes('DUPLICATE')) {
            if (showStatus) {
              showToast({ message: 'This interview has already been saved.', severity: 'info' });
            }
            return; // Don't throw, just return - the results are still valid
          }

          // Always show plan limit errors as a toast
          if (errorMsg?.includes('reached') && errorMsg?.includes('limit')) {
            showToast({ message: errorMsg, severity: 'warning' });
            return;
          }

          if (showStatus) {
            showToast({ message: errorMsg || 'Failed to save interview', severity: 'error' });
          }
          throw new Error(errorMsg);
        }

        result = actionResult.payload;
      } else {
        // Use interviewSlice thunk for skill interviews (SkillInterviewAssessment)
        const actionResult = await dispatch(saveInterviewAssessment({
          skill: effectiveSkill || 'General',
          proficiency: proficiency || 'Mid Level',
          skillType: skillType,
          interviewData: parsedData
        }));

        if (saveInterviewAssessment.rejected.match(actionResult)) {
          const errorMsg = actionResult.payload as string;
          console.error('❌ [Save] Failed to save interview:', errorMsg);

          // Check for duplicate session error
          if (errorMsg?.includes('already exists') || errorMsg?.includes('DUPLICATE')) {
            if (showStatus) {
              showToast({ message: 'This interview has already been saved.', severity: 'info' });
            }
            return; // Don't throw, just return - the results are still valid
          }

          // Always show plan limit errors as a toast
          if (errorMsg?.includes('reached') && errorMsg?.includes('limit')) {
            showToast({ message: errorMsg, severity: 'warning' });
            return;
          }

          if (showStatus) {
            showToast({ message: errorMsg || 'Failed to save interview', severity: 'error' });
          }
          throw new Error(errorMsg);
        }

        result = actionResult.payload;
      }
      console.log('✅ [Save] Interview saved successfully:', result.data);

      // Handle both candidateId (skill interviews) and candidate (job interviews) structures
      const candidateData = result.data?.candidateId || result.data?.candidate;
      // Profile data may be nested under candidate.profile (job interviews) or directly on candidateId (skill interviews)
      const profileData = candidateData?.profile || candidateData;
      console.log('🔄 [Save] Updating candidate profile with data:', profileData);
      if (profileData?.quota !== undefined) {
        console.log('🔄 [Save] Updating profile quota:', profileData.quota);
        dispatch(updateProfileQuota(profileData.quota));
      }
      if (profileData?.softSkills) {
        console.log('🔄 [Save] Updating profile soft skills:', profileData.softSkills);
        dispatch(updateProfileSoftSkill(profileData.softSkills));
      }
      if (profileData?.skills) {
        console.log('🔄 [Save] Updating profile skills:', profileData.skills);
        dispatch(updateProfileSkills(profileData.skills));
      }
      if (result.data?._id) {
        localStorage.setItem('last_interview_id', result.data._id);
      }

      // Refresh profile to update planUsage (monthlyInterviewsUsed)
      dispatch(getMyProfile());

      if (result.reward) {
        if (result.reward.success && !result.reward.skipped) {
          setRewardInfo({
            success: true,
            amount: result.reward.amount,
            transactionId: result.reward.transactionId,
            interviewId: result.data._id
          });
        } else if (result.reward.canRetry) {
          setRewardInfo({
            success: false,
            canRetry: true,
            error: result.reward.error,
            interviewId: result.data._id
          });
        }
      }

      try {
        const skillName = effectiveSkill !== 'N/A' ? effectiveSkill : 'Interview';
        const score = parsedData?.finalReport?.coverage?.overall || parsedData?.overallScore || 0;

        if (score > 0) {
          notifySkillTestPassed(dispatch, skillName, Math.round(score));
          if (score >= 80) {
            notifySkillLevelUp(dispatch, skillName, 'Expert');
          } else if (score >= 60) {
            notifySkillLevelUp(dispatch, skillName, 'Intermediate');
          } else if (score >= 40) {
            notifySkillLevelUp(dispatch, skillName, 'Beginner');
          }
        } else {
          notifySkillTestCompleted(dispatch, skillName);
        }
      } catch (notifError) {
        console.error('❌ [Save] Error sending notification:', notifError);
      }

      if (showStatus) {
        showToast({ message: 'Interview saved successfully', severity: 'success' });
      }

      return result;
    } catch (error) {
      console.error('❌ [Save] Error saving interview:', error);
      if (showStatus) {
        showToast({ message: 'Error saving interview', severity: 'error' });
      }
    }
  };

  // Auto-save to backend when analysis loads
  useEffect(() => {
    if (analysis) {
      saveInterviewToBackend(false);
    }
  }, [analysis]);

  const handleClaimReward = async () => {
    if (!rewardInfo?.interviewId) return;

    try {
      setClaimingReward(true);

      const actionResult = await dispatch(claimInterviewReward(rewardInfo.interviewId));

      if (claimInterviewReward.fulfilled.match(actionResult)) {
        const result = actionResult.payload;
        setRewardInfo({
          success: true,
          amount: result.reward.amount,
          transactionId: result.reward.transactionId,
          interviewId: rewardInfo.interviewId
        });
      } else {
        const errorMsg = actionResult.payload as string;
        setRewardInfo({
          ...rewardInfo,
          success: false,
          error: errorMsg,
          canRetry: true
        });
      }
    } catch (error: any) {
      setRewardInfo({
        ...rewardInfo,
        success: false,
        error: error.message || 'Failed to claim reward'
      });
    } finally {
      setClaimingReward(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      setLoading(true);

      const storedAnalysis = localStorage.getItem('last_interview_analysis');

      if (storedAnalysis) {
        try {
          const parsedAnalysis = JSON.parse(storedAnalysis);
          const transformedAnalysis = transformSocketAnalysis(parsedAnalysis);

          if (transformedAnalysis) {
            (window as any).INTERVIEW_DATA = {
              original: parsedAnalysis,
              transformed: transformedAnalysis,
              timestamp: new Date().toISOString()
            };

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
        setError('No interview data found. Please complete an interview first.');
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

      setError('No interview data available to perform analysis.');

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

    if (!hasActualData) {
      return null;
    }

    const interviewType = socketData.interviewType || 'General Interview';
    const urlParams = new URLSearchParams(window.location.search);
    const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
    const role = urlParams.get('role') || localStorage.getItem('interview_role');
    const category = urlParams.get('category') || localStorage.getItem('interview_category');

    let overallScore = 0;
    if (coverage.areas && Object.keys(coverage.areas).length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;
      Object.values(coverage.areas).forEach((area: any) => {
        const weight = area.weight || 1;
        const percentage = area.percentage || 0;
        weightedSum += percentage * weight;
        totalWeight += weight;
      });
      overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    } else {
      overallScore = scores.overall || coverage.overall || 0;
    }

    let primarySkillName = 'General Assessment';

    if (role && role !== 'N/A') {
      primarySkillName = role;
    } else if (skill && skill !== 'N/A') {
      primarySkillName = skill;
    } else if (category && category !== 'N/A') {
      primarySkillName = category;
    } else if (interviewType === 'HR_INTERVIEW') {
      primarySkillName = 'HR Interview';
    } else if (interviewType === 'TECHNICAL_INTERVIEW') {
      primarySkillName = 'Technical Assessment';
    }

    const skillScores = [{
      skill: primarySkillName,
      score: overallScore,
      level: determineLevel(overallScore),
      strengths: finalReport.recommendations?.strengths ||
        coverage.aiAnalysis?.strongestAreas?.map((a: string) => `Strong in ${a.replace('_', ' ')}`) || [],
      improvements: finalReport.recommendations?.improvements ||
        coverage.aiAnalysis?.weakestAreas?.map((a: string) => `Improve ${a.replace('_', ' ')}`) || []
    }];

    return {
      overallScore: overallScore,
      overallLevel: determineLevel(overallScore),
      interviewType: interviewType,
      duration: analytics.duration || 0,
      completedAt: socketData.timestamp || new Date().toISOString(),
      skillScores: skillScores,
      strengths: finalReport.recommendations?.strengths || extractStrengths(coverage),
      weaknesses: finalReport.recommendations?.improvements || extractWeaknesses(coverage),
      recommendations: finalReport.recommendations?.suggestions || generateRecommendations(coverage),
      feedback: finalReport.summary || 'Interview analysis in progress...',
      conversationQuality: {
        clarity: scores.clarity || 0,
        relevance: scores.relevance || 0,
        depth: scores.depth || 0,
        engagement: scores.engagement || 0,
      },
      coverage: coverage.areas || {},
    };
  };

  const transformAPIAnalysis = (apiData: any): InterviewAnalysis | null => {
    const hasActualData =
      apiData &&
      (apiData.overallScore !== undefined ||
        (apiData.skillDetails && apiData.skillDetails.length > 0) ||
        (apiData.recommendations && apiData.recommendations.length > 0));

    if (!hasActualData) {
      return null;
    }

    return {
      overallScore: apiData.overallScore || 0,
      overallLevel: determineLevel(apiData.overallScore || 0),
      interviewType: apiData.type || 'General Interview',
      duration: 30,
      completedAt: apiData.createdAt || new Date().toISOString(),
      skillScores: apiData.skillDetails?.map((skill: any) => ({
        skill: skill.name,
        score: skill.confidenceScore || 0,
        level: skill.experienceLevel || 'Not Assessed',
        strengths: [],
        improvements: []
      })) || [],
      strengths: apiData.recommendations || [],
      weaknesses: [],
      recommendations: apiData.recommendations || [],
      feedback: 'Interview analysis completed',
      conversationQuality: {
        clarity: 0,
        relevance: 0,
        depth: 0,
        engagement: 0,
      },
      coverage: {},
    };
  };

  const extractStrengths = (coverage: any): string[] => {
    const strengths: string[] = [];
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([name, area]: [string, any]) => {
        const areaNameFormatted = name.replace(/_/g, ' ');
        if (area.percentage >= 70) {
          if (area.aiAnalysis?.strengths && Array.isArray(area.aiAnalysis.strengths)) {
            area.aiAnalysis.strengths.forEach((strength: string) => {
              strengths.push(`${areaNameFormatted}: ${strength}`);
            });
          } else {
            strengths.push(`Strong performance in ${areaNameFormatted} (${Math.round(area.percentage)}%)`);
          }
        }
      });
    }
    return strengths.length > 0 ? strengths : ['No strengths data available'];
  };

  const extractWeaknesses = (coverage: any): string[] => {
    const weaknesses: string[] = [];
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([name, area]: [string, any]) => {
        const areaNameFormatted = name.replace(/_/g, ' ');
        if (area.percentage < 50) {
          if (area.aiAnalysis?.weaknesses && Array.isArray(area.aiAnalysis.weaknesses)) {
            area.aiAnalysis.weaknesses.forEach((weakness: string) => {
              weaknesses.push(`${areaNameFormatted}: ${weakness}`);
            });
          } else {
            weaknesses.push(`Needs improvement in ${areaNameFormatted} (${Math.round(area.percentage)}% coverage)`);
          }
        }
      });
    }
    return weaknesses.length > 0 ? weaknesses : ['No weaknesses data available'];
  };

  const generateRecommendations = (coverage: any): string[] => {
    const recommendations: string[] = [];

    if (coverage.aiAnalysis?.recommendedFocus) {
      recommendations.push(...coverage.aiAnalysis.recommendedFocus.map((focus: string) =>
        `Focus on improving ${focus}`
      ));
    }

    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([areaName, areaData]: [string, any]) => {
        const area = areaData;
        const areaNameFormatted = areaName.replace(/_/g, ' ');

        if (area.aiAnalysis) {
          if (area.aiAnalysis.suggestions && Array.isArray(area.aiAnalysis.suggestions)) {
            area.aiAnalysis.suggestions.forEach((suggestion: string) => {
              recommendations.push(`${areaNameFormatted}: ${suggestion}`);
            });
          }

          if (area.percentage < 60) {
            if (area.aiAnalysis.feedback) {
              recommendations.push(`${areaNameFormatted}: ${area.aiAnalysis.feedback}`);
            }
          }
        }
      });
    }

    return recommendations.length > 0 ? recommendations.slice(0, 10) : ['No recommendations available'];
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !analysis) {
    return <ErrorState error={error} />;
  }

  return (
    <PageContainer>
      <Header />
      <ResultsHeader analysis={analysis} />

      {rewardInfo && (
        <RewardNotification
          rewardInfo={rewardInfo}
          claimingReward={claimingReward}
          onClaimReward={handleClaimReward}
        />
      )}
      <KeyStrengths strengths={analysis.strengths} />
      <AreasForImprovement weaknesses={analysis.weaknesses} />
      <CoverageDetails coverage={analysis.coverage} />

      {/* Back to Dashboard Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => {
            window.location.href = '/dashboard/candidate';
          }}
          sx={{
            background: 'rgba(163, 98, 239, 1)',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '38px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(163, 98, 239, 0.8)',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </PageContainer>
  );
}
