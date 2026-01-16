'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { logInterviewDataToConsole } from '@/utils/exportInterviewData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { notifySkillTestPassed, notifySkillLevelUp, notifySkillTestCompleted } from '@/utils/notificationHelpers';
import { updateProfileQuota } from '@/store/slices/userSlice';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';

interface SkillScore {
  skill: string;
  score: number;
  level: string;
  strengths: string[];
  improvements: string[];
}

interface InterviewAnalysis {
  overallScore: number;
  overallLevel: string;
  interviewType: string;
  duration: number;
  completedAt: string;
  skillScores: SkillScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  conversationQuality: {
    clarity: number;
    relevance: number;
    depth: number;
    engagement: number;
  };
  coverage: {
    [key: string]: number;
  };
}

export default function InterviewResults() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [rewardInfo, setRewardInfo] = useState<{
    success: boolean;
    amount?: number;
    transactionId?: string;
    canRetry?: boolean;
    error?: string;
    interviewId?: string;
  } | null>(null);
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
      if (showStatus) setSaveStatus('saving');

      const storedAnalysis = localStorage.getItem('last_interview_analysis');
      if (!storedAnalysis) {
        console.log('⚠️ [Save] No interview data to save');
        if (showStatus) setSaveStatus('error');
        return;
      }

      const parsedData = JSON.parse(storedAnalysis);

      // Get metadata from URL params first, then localStorage as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = localStorage.getItem('interview_jobId');
      // If jobId exists, type is "post", otherwise use localStorage value or default to "hr"
      const type = jobId ? 'post' : (urlParams.get('type') || localStorage.getItem('interview_type') || 'hr');
      const role = urlParams.get('role') || localStorage.getItem('interview_role');
      const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
      const category = urlParams.get('category') || localStorage.getItem('interview_category');
      const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');

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
        let hasWeights = false;

        Object.values(areas).forEach((area: any) => {
          const weight = area.weight || 1;
          const percentage = area.percentage || 0;

          if (area.weight && area.weight !== 1) {
            hasWeights = true;
          }

          weightedSum += percentage * weight;
          totalWeight += weight;
        });

        if (totalWeight > 0) {
          parsedData.finalReport.coverage.overall = Math.round(weightedSum / totalWeight);
        }
      }

      const effectiveSkill = role || skill || 'N/A';
      const effectiveRole = role || skill || 'N/A';

      const payload = {
        metadata: {
          exportedAt: new Date().toISOString(),
          type: type || 'hr',
          skill: effectiveSkill,
          role: effectiveRole,
          category: category || 'N/A',
          proficiency: proficiency || 'N/A'
        },
        interviewData: parsedData
      };

      const token = localStorage.getItem('api_token') || Cookies.get('api_token');
      if (!token) {
        console.error('❌ [Save] No authentication token found');
        if (showStatus) setSaveStatus('error');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}InterviewAssessment/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Save] Failed to save interview:', response.status, errorData);
        if (showStatus) setSaveStatus('error');
        throw new Error(`Failed to save: ${response.status}`);
      }

      const result = await response.json();
      dispatch(updateProfileQuota(result.data.candidateId.quota));

      if (result.data?._id) {
        localStorage.setItem('last_interview_id', result.data._id);
      }

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
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }

      return result;
    } catch (error) {
      console.error('❌ [Save] Error saving interview:', error);
      if (showStatus) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
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
      const token = localStorage.getItem('api_token') || Cookies.get('api_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}interviewDetails/${rewardInfo.interviewId}/claim-reward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        setRewardInfo({
          success: true,
          amount: result.reward.amount,
          transactionId: result.reward.transactionId,
          interviewId: rewardInfo.interviewId
        });
      } else {
        setRewardInfo({
          ...rewardInfo,
          success: false,
          error: result.error,
          canRetry: result.canRetry !== false
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}interview-details/getInterviewDetailsById/${interviewId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data) {
            const transformedAnalysis = transformAPIAnalysis(data.data);

            if (transformedAnalysis) {
              setAnalysis(transformedAnalysis);
              setLoading(false);
              return;
            }
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
    const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');

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
    } else if (interviewType === 'TECHNICAL_SKILL') {
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

  const determineLevel = (score: number): string => {
    if (score === 0) return 'Not Assessed';
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 60) return 'Developing';
    return 'Beginner';
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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#667eea';
    if (score >= 60) return '#43e97b';
    return '#fa709a';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return '#f3e7ff';
    if (score >= 60) return '#e8f5e9';
    return '#fff3e0';
  };

  const getPerformanceMessage = (score: number): string => {
    if (score >= 90) return 'Outstanding performance! You demonstrate expert-level knowledge.';
    if (score >= 80) return 'Excellent work! You show advanced proficiency.';
    if (score >= 70) return 'Good performance! You have solid intermediate skills.';
    if (score >= 60) return 'Developing well! Continue practicing to improve.';
    if (score >= 50) return 'Basic understanding shown. Focus on strengthening fundamentals.';
    return 'Needs improvement. Consider additional study and practice.';
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 12,
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: '#667eea', mb: 3 }}
          />
          <Typography variant="h6" sx={{ color: '#6b7280' }}>
            Loading your results...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error || !analysis) {
    return (
      <PageContainer>
        <Header />
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 1)',
            px: 5,
            py: 4,
            borderRadius: '12px',
            border: '1px solid rgba(84,98,116,0.1)',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: '#fff3e0',
              margin: '0 auto 16px',
            }}
          >
            <WarningIcon sx={{ fontSize: 40, color: '#fa709a' }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
            No Analysis Data Available
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, maxWidth: 400, mx: 'auto' }}>
            {error || 'No interview data found. This could be because the interview was not completed or the session has expired.'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
              Return to Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/interview')}
              sx={{
                border: '1px solid rgba(25, 25, 25, 1)',
                color: '#000000',
                fontWeight: 600,
                borderRadius: '38px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(25, 25, 25, 1)',
                  background: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Take New Interview
            </Button>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />

      {/* Welcome/Results Header */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 1)',
          px: 5,
          py: 3,
          mb: 2,
          borderRadius: '12px',
          border: '1px solid rgba(84,98,116,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
            <Typography
              variant="h4"
              sx={{
                color: '#000000',
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontFamily: 'Poppins',
                fontWeight: 600,
              }}
            >
              Interview Complete!
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              fontSize: '14px',
              mb: 3,
              fontWeight: 400,
            }}
          >
            {analysis.skillScores.length > 0 && analysis.skillScores[0].skill !== 'General Interview'
              ? `${analysis.skillScores[0].skill} Assessment Results`
              : `${analysis.interviewType.replace('_', ' ')} Assessment Results`}
          </Typography>

          {/* Info Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 3 },
              mb: 3,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
              <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
                {new Date(analysis.completedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
              <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
                {(() => {
                  const totalSeconds = Math.floor(analysis.duration / 1000);
                  const minutes = Math.floor(totalSeconds / 60);
                  const seconds = totalSeconds % 60;
                  return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
                })()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
              <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
                Level: {analysis.overallLevel}
              </Typography>
            </Box>
          </Box>


        </Box>

        {/* Right Section - Score Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={100}
                thickness={5}
                sx={{ color: '#f0f0f0' }}
              />
              <CircularProgress
                variant="determinate"
                value={analysis.overallScore}
                size={100}
                thickness={5}
                sx={{
                  position: 'absolute',
                  left: 0,
                  color: '#667eea',
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#667eea' }}>
                  {Math.round(analysis.overallScore)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600 }}>
                  SCORE
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Reward Notification */}
      {rewardInfo && (
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 1)',
            px: 5,
            py: 3,
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(84,98,116,0.1)',
            textAlign: 'center',
          }}
        >
          {rewardInfo.success ? (
            <>
              <TrophyIcon sx={{ fontSize: 60, color: '#ffd700', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
                Congratulations!
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 2 }}>
                You earned {rewardInfo.amount?.toFixed(2)} TAI tokens!
              </Typography>
              <Alert severity="success" sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Reward distributed successfully!
                </Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  TX: {rewardInfo.transactionId}
                </Typography>
              </Alert>
            </>
          ) : (
            <>
              <WarningIcon sx={{ fontSize: 60, color: '#fa709a', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Reward Claim Issue
              </Typography>
              <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
                {rewardInfo.error || 'Failed to distribute reward automatically'}
              </Alert>
              {rewardInfo.canRetry && (
                <Button
                  variant="contained"
                  startIcon={claimingReward ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <TrophyIcon />}
                  onClick={handleClaimReward}
                  disabled={claimingReward}
                  sx={{
                    background: 'rgba(163, 98, 239, 1)',
                    borderRadius: '38px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {claimingReward ? 'Claiming...' : 'Claim Reward'}
                </Button>
              )}
            </>
          )}
        </Box>
      )}



      {/* Key Strengths */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 1)',
          px: 5,
          py: 3,
          mb: 2,
          borderRadius: '12px',
          border: '1px solid rgba(84,98,116,0.1)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#000000',
            fontSize: '20px',
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: 0,
              width: '38px',
              height: '5px',
              background: '#43e97b',
              borderRadius: '2px',
            },
          }}
        >
          Key Strengths
        </Typography>

        <Stack spacing={2}>
          {analysis.strengths.slice(0, 5).map((strength, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(67, 233, 123, 0.15)',
                },
              }}
            >
              <CheckCircleIcon sx={{ color: '#43e97b', fontSize: 20, mt: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
                {strength}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Areas for Improvement */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 1)',
          px: 5,
          py: 3,
          mb: 2,
          borderRadius: '12px',
          border: '1px solid rgba(84,98,116,0.1)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#000000',
            fontSize: '20px',
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: 0,
              width: '38px',
              height: '5px',
              background: '#fa709a',
              borderRadius: '2px',
            },
          }}
        >
          Areas for Improvement
        </Typography>

        <Stack spacing={2}>
          {analysis.weaknesses.slice(0, 5).map((weakness, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(250, 112, 154, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'rgba(250, 112, 154, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#fa709a',
                  mt: 0.5,
                }}
              >
                {index + 1}
              </Box>
              <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
                {weakness}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Coverage Details */}
      {analysis.coverage && Object.keys(analysis.coverage).length > 0 && (
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 1)',
            px: 5,
            py: 3,
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(84,98,116,0.1)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#000000',
              fontSize: '20px',
              mb: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: '38px',
                height: '5px',
                background: '#667eea',
                borderRadius: '2px',
              },
            }}
          >
            Detailed Coverage Analysis
          </Typography>

          <Stack spacing={3}>
            {Object.entries(analysis.coverage).map(([areaName, areaData]: [string, any]) => (
              <Box key={areaName}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                    {areaName.replace(/_/g, ' ')}
                  </Typography>
                  <Chip
                    label={`${Math.round(areaData.percentage || 0)}%`}
                    size="small"
                    sx={{
                      background: getScoreBg(areaData.percentage || 0),
                      color: '#1a1a1a',
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={areaData.percentage || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(areaData.percentage || 0),
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </PageContainer>
  );
}
