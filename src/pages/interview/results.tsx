'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Rating,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  Stars as StarsIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import {
  exportInterviewDataAsJSON,
  copyInterviewDataToClipboard,
  logInterviewDataToConsole
} from '@/utils/exportInterviewData';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { notifySkillTestPassed, notifySkillLevelUp, notifySkillTestCompleted } from '@/utils/notificationHelpers';
import { updateProfileQuota } from '@/store/slices/userSlice';

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
      const type = urlParams.get('type') || localStorage.getItem('interview_type');
      const role = urlParams.get('role') || localStorage.getItem('interview_role');
      const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
      const category = urlParams.get('category') || localStorage.getItem('interview_category');
      const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');

      // Fix confidence scores in coverage areas before sending
      // qualityScore is 0-5 scale, percentage is 0-100
      if (parsedData?.finalReport?.coverage?.areas) {
        const areas = parsedData.finalReport.coverage.areas;
        Object.keys(areas).forEach((key) => {
          const area = areas[key];
          // Ensure percentage is capped at 100
          if (area.percentage > 100) {
            area.percentage = Math.min(area.percentage, 100);
          }
          // Fix qualityScore if it's > 5 (should be 0-5 scale)
          if (area.aiAnalysis?.qualityScore > 5) {
            area.aiAnalysis.qualityScore = Math.min(area.aiAnalysis.qualityScore, 5);
          }
        });

        // Calculate coverage.overall as weighted average if weights exist, otherwise simple mean
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
          console.log('📊 [Save] Calculated coverage.overall:', parsedData.finalReport.coverage.overall,
            hasWeights ? '(weighted average)' : '(simple mean)',
            'weightedSum:', weightedSum, 'totalWeight:', totalWeight);
        }
      }

      // For technical: role is the skill (e.g., "JavaScript")
      // For soft: skill is the skill (e.g., "Communication")
      const effectiveSkill = role || skill || 'N/A';
      const effectiveRole = role || skill || 'N/A'; // Use skill as role for soft skills

      // Prepare payload for backend API
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

      console.log('📊 [Save] Fixed coverage areas:', parsedData?.finalReport?.coverage?.areas);

      console.log('💾 [Save] Saving interview to backend...');
      console.log('📤 [Save] Payload:', payload);

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
      console.log('📥 [Save] Received response from backend:', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Save] Failed to save interview:', response.status, errorData);
        if (showStatus) setSaveStatus('error');
        throw new Error(`Failed to save: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [Save] Interview saved successfully:', result.data.candidateId.quota);
      dispatch(updateProfileQuota(result.data.candidateId.quota));
      // Store the saved interview ID
      if (result.data?._id) {
        localStorage.setItem('last_interview_id', result.data._id);
        console.log('💾 [Save] Stored interview ID:', result.data._id);
      }

      // NEW: Handle reward notification
      if (result.reward) {
        console.log('🎁 [Save] Reward info received:', result.reward);

        if (result.reward.success && !result.reward.skipped) {
          // Reward distributed successfully
          setRewardInfo({
            success: true,
            amount: result.reward.amount,
            transactionId: result.reward.transactionId,
            interviewId: result.data._id
          });
          console.log(`🎉 [Save] Reward earned: ${result.reward.amount} TAI`);
        } else if (result.reward.skipped) {
          // Reward skipped (score was 0)
          console.log(`⚠️  [Save] Reward skipped: ${result.reward.reason}`);
        } else if (result.reward.canRetry) {
          // Reward failed but can retry
          setRewardInfo({
            success: false,
            canRetry: true,
            error: result.reward.error,
            interviewId: result.data._id
          });
          console.log(`❌ [Save] Reward failed (can retry): ${result.reward.error}`);
        } else {
          // Reward failed, cannot retry
          console.log(`❌ [Save] Reward failed: ${result.reward.error}`);
        }
      }

      // NEW: Send skill test notification
      try {
        // Extract skill name from metadata
        const skillName = effectiveSkill !== 'N/A' ? effectiveSkill : 'Interview';

        // Extract score from interview data
        const score = parsedData?.finalReport?.coverage?.overall ||
          parsedData?.overallScore ||
          0;

        console.log(`🎯 [Save] Sending notification for ${skillName} with score ${score}`);

        if (score > 0) {
          // Send test passed notification
          notifySkillTestPassed(dispatch, skillName, Math.round(score));

          // Send level up notification based on score
          if (score >= 80) {
            notifySkillLevelUp(dispatch, skillName, 'Expert');
          } else if (score >= 60) {
            notifySkillLevelUp(dispatch, skillName, 'Intermediate');
          } else if (score >= 40) {
            notifySkillLevelUp(dispatch, skillName, 'Beginner');
          }
        } else {
          // Send encouragement notification for score = 0
          console.log(`💡 [Save] Notifying test completion for ${skillName} with score 0`);
          notifySkillTestCompleted(dispatch, skillName);
        }
      } catch (notifError) {
        console.error('❌ [Save] Error sending notification:', notifError);
        // Don't fail the save if notification fails
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
      // Don't throw - we don't want to block the UI if save fails
    }
  };

  // Auto-save to backend when analysis loads (silent save)
  useEffect(() => {
    if (analysis) {
      saveInterviewToBackend(false); // false = don't show status for auto-save
    }
  }, [analysis]);

  // Handle copy to clipboard
  const handleCopyJSON = async () => {
    const success = await copyInterviewDataToClipboard();
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  // Handle manual reward claim
  const handleClaimReward = async () => {
    if (!rewardInfo?.interviewId) {
      console.error('❌ No interview ID found for reward claim');
      return;
    }

    try {
      setClaimingReward(true);
      console.log(`🎁 Attempting to claim reward for interview ${rewardInfo.interviewId}`);

      const token = localStorage.getItem('api_token') || Cookies.get('api_token');
      if (!token) {
        console.error('❌ No authentication token found');
        return;
      }

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
        console.log('✅ Reward claimed successfully:', result.reward);
        setRewardInfo({
          success: true,
          amount: result.reward.amount,
          transactionId: result.reward.transactionId,
          interviewId: rewardInfo.interviewId
        });
      } else {
        console.error('❌ Reward claim failed:', result.error);
        setRewardInfo({
          ...rewardInfo,
          success: false,
          error: result.error,
          canRetry: result.canRetry !== false
        });
      }
    } catch (error: any) {
      console.error('❌ Error claiming reward:', error);
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
      console.log('📊 [Results] Fetching interview analysis...');

      // First, try to get stored analysis from localStorage (set by socket event)
      const storedAnalysis = localStorage.getItem('last_interview_analysis');

      if (storedAnalysis) {
        console.log('✅ [Results] Found stored analysis in localStorage');
        console.log('📦 [Results] Raw localStorage data:', storedAnalysis);

        try {
          const parsedAnalysis = JSON.parse(storedAnalysis);
          console.log('📊 [Results] Parsed analysis object:', parsedAnalysis);
          console.log('📋 [Results] Analysis keys:', Object.keys(parsedAnalysis));
          console.log('🔍 [Results] Final Report:', parsedAnalysis.finalReport);
          console.log('📈 [Results] Analytics:', parsedAnalysis.analytics);
          console.log('🆔 [Results] Session ID:', parsedAnalysis.sessionId);
          console.log('🎯 [Results] Interview Type:', parsedAnalysis.interviewType);

          // Transform the data to match our interface
          const transformedAnalysis = transformSocketAnalysis(parsedAnalysis);

          if (transformedAnalysis) {
            console.log('✅ [Results] Successfully transformed analysis:', transformedAnalysis);
            console.log('📊 [Results] Transformed data structure:');
            console.log('  - Overall Score:', transformedAnalysis.overallScore);
            console.log('  - Overall Level:', transformedAnalysis.overallLevel);
            console.log('  - Interview Type:', transformedAnalysis.interviewType);
            console.log('  - Skill Scores:', transformedAnalysis.skillScores);
            console.log('  - Strengths:', transformedAnalysis.strengths);
            console.log('  - Weaknesses:', transformedAnalysis.weaknesses);
            console.log('  - Recommendations:', transformedAnalysis.recommendations);
            console.log('  - Feedback:', transformedAnalysis.feedback);
            console.log('  - Conversation Quality:', transformedAnalysis.conversationQuality);
            console.log('  - Coverage:', transformedAnalysis.coverage);

            // Store data globally for easy access in console
            (window as any).INTERVIEW_DATA = {
              original: parsedAnalysis,
              transformed: transformedAnalysis,
              timestamp: new Date().toISOString()
            };

            console.log('\n');
            console.log('🌐 ════════════════════════════════════════════════════════════════');
            console.log('🌐 DATA AVAILABLE IN GLOBAL VARIABLE');
            console.log('🌐 ════════════════════════════════════════════════════════════════');
            console.log('💡 Type in console: INTERVIEW_DATA');
            console.log('💡 Type in console: copy(INTERVIEW_DATA) - to copy to clipboard');
            console.log('💡 Type in console: JSON.stringify(INTERVIEW_DATA, null, 2) - for formatted JSON');
            console.log('🌐 ════════════════════════════════════════════════════════════════');
            console.log('\n');

            setAnalysis(transformedAnalysis);
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ [Results] Stored analysis has no actual data');
            // Continue to API fallback or show error
          }
        } catch (parseError) {
          console.error('❌ [Results] Failed to parse stored analysis:', parseError);
          // Continue to API fallback
        }
      }

      console.log('🔍 [Results] No stored analysis found, trying API...');

      const token = localStorage.getItem('api_token') || Cookies.get('api_token');

      if (!token) {
        console.log('❌ [Results] No auth token found');
        router.push('/signin');
        return;
      }

      // Get interview ID from query params or localStorage
      const interviewId = router.query.id || localStorage.getItem('last_interview_id');

      if (!interviewId) {
        console.log('❌ [Results] No interview ID found');
        setError('No interview data found. Please complete an interview first.');
        setLoading(false);
        return;
      }

      console.log(`🔄 [Results] Attempting API call for interview: ${interviewId}`);

      // Try to fetch from backend API (if endpoint exists)
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
          console.log('✅ [Results] Got data from API:', data);

          if (data.success && data.data) {
            const transformedAnalysis = transformAPIAnalysis(data.data);

            if (transformedAnalysis) {
              setAnalysis(transformedAnalysis);
              setLoading(false);
              return;
            } else {
              console.warn('⚠️ [Results] API data has no actual analysis');
            }
          }
        }
      } catch (apiError) {
        console.log('⚠️ [Results] API call failed:', apiError);
      }

      // If all else fails, show a helpful error
      setError('No interview data available to perform analysis. Please complete an interview first or the interview may not have generated results yet.');

    } catch (err: any) {
      console.error('❌ [Results] Error fetching analysis:', err);
      setError(err.message || 'Failed to load interview results');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Transform socket event data to InterviewAnalysis interface
   */
  const transformSocketAnalysis = (socketData: any): InterviewAnalysis | null => {
    console.log('🔄 [Results] ========================================');
    console.log('🔄 [Results] STARTING DATA TRANSFORMATION');
    console.log('🔄 [Results] ========================================');
    console.log('🔄 [Results] Transforming socket data:', socketData);
    console.log('📊 [Results] Full socket data structure:', JSON.stringify(socketData, null, 2));

    const finalReport = socketData.finalReport || socketData;
    const analytics = socketData.analytics || {};

    console.log('📋 [Results] ========================================');
    console.log('📋 [Results] FINAL REPORT BREAKDOWN');
    console.log('📋 [Results] ========================================');
    console.log('📋 [Results] Final Report Object:', finalReport);
    console.log('📋 [Results] Final Report Keys:', Object.keys(finalReport));
    console.log('📋 [Results] Final Report Summary:', finalReport.summary);
    console.log('📋 [Results] Final Report Recommendations:', finalReport.recommendations);

    // Extract scores from the final report
    const scores = finalReport.scores || {};
    const coverage = finalReport.coverage || {};

    console.log('📈 [Results] ========================================');
    console.log('📈 [Results] SCORES & COVERAGE DATA');
    console.log('📈 [Results] ========================================');
    console.log('📈 [Results] Scores Object:', scores);
    console.log('📈 [Results] Scores Keys:', Object.keys(scores));
    console.log('📈 [Results] Overall Score:', scores.overall);
    console.log('📈 [Results] Individual Scores:', {
      clarity: scores.clarity,
      relevance: scores.relevance,
      depth: scores.depth,
      engagement: scores.engagement
    });
    console.log('📈 [Results] Coverage Object:', coverage);
    console.log('📈 [Results] Coverage Keys:', Object.keys(coverage));
    console.log('📈 [Results] Coverage Areas:', coverage.areas);
    console.log('📈 [Results] Coverage Areas Keys:', coverage.areas ? Object.keys(coverage.areas) : 'N/A');

    // Log each coverage area in detail
    if (coverage.areas) {
      console.log('📊 [Results] ========================================');
      console.log('📊 [Results] DETAILED COVERAGE AREAS');
      console.log('📊 [Results] ========================================');
      Object.entries(coverage.areas).forEach(([areaName, areaData]: [string, any]) => {
        console.log(`📊 [Results] Area: ${areaName}`);
        console.log(`  - Percentage: ${areaData.percentage}`);
        console.log(`  - Indicators:`, areaData.indicators);
        console.log(`  - Questions Asked: ${areaData.questionsAsked}`);
        console.log(`  - AI Analysis:`, areaData.aiAnalysis);
      });
    }

    console.log('📈 [Results] Analytics Object:', analytics);
    console.log('📈 [Results] Analytics Keys:', Object.keys(analytics));

    // Check if we have actual data or just empty objects
    const hasActualData =
      (finalReport && Object.keys(finalReport).length > 0) ||
      (analytics && Object.keys(analytics).length > 0) ||
      (scores && Object.keys(scores).length > 0) ||
      (coverage && coverage.areas && Object.keys(coverage.areas).length > 0);

    if (!hasActualData) {
      console.warn('⚠️ [Results] No actual data found in socket analysis');
      return null;
    }

    // Extract skill information from URL parameters or interview type
    const interviewType = socketData.interviewType || 'General Interview';
    const urlParams = new URLSearchParams(window.location.search);
    const skill = urlParams.get('skill') || localStorage.getItem('interview_skill');
    const role = urlParams.get('role') || localStorage.getItem('interview_role');
    const category = urlParams.get('category') || localStorage.getItem('interview_category');
    const proficiency = urlParams.get('proficiency') || localStorage.getItem('interview_proficiency');

    console.log('🎯 [Results] Extracted skill info:', { skill, role, category, proficiency, interviewType });

    // Calculate overall score as weighted average of areas
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
      console.log('📊 [Results] Calculated weighted overall score:', overallScore);
    } else {
      overallScore = scores.overall || coverage.overall || 0;
      console.log('📊 [Results] Using fallback overall score:', overallScore);
    }

    // Determine the PRIMARY SKILL NAME from URL params (NOT from coverage areas!)
    // Coverage areas (technical_depth, problem_approach, etc.) are assessment categories, not skills
    let primarySkillName = 'General Assessment';

    // Priority: role > skill > category > interviewType
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

    console.log(`🎯 [Results] Primary skill determined: ${primarySkillName}`);
    console.log(`   - From role: ${role}, skill: ${skill}, category: ${category}`);

    // Create ONE skill score with the actual tested skill (NOT coverage area names!)
    const skillScores = [{
      skill: primarySkillName,
      score: overallScore,
      level: determineLevel(overallScore),
      strengths: finalReport.recommendations?.strengths ||
        coverage.aiAnalysis?.strongestAreas?.map((a: string) => `Strong in ${a.replace('_', ' ')}`) || [],
      improvements: finalReport.recommendations?.improvements ||
        coverage.aiAnalysis?.weakestAreas?.map((a: string) => `Improve ${a.replace('_', ' ')}`) || []
    }];

    console.log('✅ [Results] Final skill scores:', skillScores);

    const result = {
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

    console.log('🎉 [Results] ========================================');
    console.log('🎉 [Results] FINAL TRANSFORMED RESULT');
    console.log('🎉 [Results] ========================================');
    console.log('🎉 [Results] Complete Result Object:', result);
    console.log('📊 [Results] Result Summary:');
    console.log(`  ✓ Overall Score: ${result.overallScore}`);
    console.log(`  ✓ Overall Level: ${result.overallLevel}`);
    console.log(`  ✓ Interview Type: ${result.interviewType}`);
    console.log(`  ✓ Skill Scores Count: ${result.skillScores.length}`);
    console.log(`  ✓ Strengths Count: ${result.strengths.length}`);
    console.log(`  ✓ Weaknesses Count: ${result.weaknesses.length}`);
    console.log(`  ✓ Recommendations Count: ${result.recommendations.length}`);
    console.log(`  ✓ Coverage Areas Count: ${Object.keys(result.coverage).length}`);
    console.log('🎉 [Results] ========================================');

    // ============================================================================
    // 📋 COPYABLE DATA FOR BACKEND DEVELOPER
    // ============================================================================
    console.log('\n\n');
    console.log('📋 ╔════════════════════════════════════════════════════════════════╗');
    console.log('📋 ║         COPY/PASTE DATA FOR BACKEND DEVELOPER                 ║');
    console.log('📋 ╚════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('📤 ORIGINAL SOCKET DATA (What Backend Sent):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(socketData, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n');
    console.log('📥 TRANSFORMED FRONTEND DATA (What We Display):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(result, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n');
    console.log('💡 HOW TO COPY:');
    console.log('   1. Right-click on the JSON above → Select "Copy object"');
    console.log('   2. OR: Expand object → Right-click → "Store as global variable"');
    console.log('   3. OR: Select the text between ━━━ lines and copy');
    console.log('\n');
    console.log('📋 ════════════════════════════════════════════════════════════════');

    return result;
  };

  /**
   * Transform API data to InterviewAnalysis interface
   */
  const transformAPIAnalysis = (apiData: any): InterviewAnalysis | null => {
    // Check if API data has actual interview results
    const hasActualData =
      apiData &&
      (apiData.overallScore !== undefined ||
        (apiData.skillDetails && apiData.skillDetails.length > 0) ||
        (apiData.recommendations && apiData.recommendations.length > 0));

    if (!hasActualData) {
      console.warn('⚠️ [Results] No actual data found in API response');
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

  // Note: Coverage areas (technical_depth, problem_approach, etc.) are assessment categories,
  // not actual skills. The primary skill comes from URL params (role, skill, category).

  const extractStrengths = (coverage: any): string[] => {
    const strengths: string[] = [];
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([name, area]: [string, any]) => {
        const areaNameFormatted = name.replace(/_/g, ' ');

        if (area.percentage >= 70) {
          // Add AI analysis positive feedback if available
          if (area.aiAnalysis?.strengths && Array.isArray(area.aiAnalysis.strengths)) {
            area.aiAnalysis.strengths.forEach((strength: string) => {
              strengths.push(`${areaNameFormatted}: ${strength}`);
            });
          } else if (area.aiAnalysis?.feedback && area.percentage >= 80) {
            strengths.push(`${areaNameFormatted}: ${area.aiAnalysis.feedback}`);
          } else {
            strengths.push(`Strong performance in ${areaNameFormatted} (${Math.round(area.percentage)}%)`);
          }

          // Add covered indicators as strengths
          if (area.indicators && Array.isArray(area.indicators)) {
            const coveredIndicators = area.indicators.filter((ind: any) => ind.covered);
            if (coveredIndicators.length > 0) {
              const indicatorNames = coveredIndicators.slice(0, 2).map((ind: any) => ind.name || ind).join(', ');
              strengths.push(`${areaNameFormatted}: Demonstrated ${indicatorNames}`);
            }
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
          // Add AI analysis weaknesses if available
          if (area.aiAnalysis?.weaknesses && Array.isArray(area.aiAnalysis.weaknesses)) {
            area.aiAnalysis.weaknesses.forEach((weakness: string) => {
              weaknesses.push(`${areaNameFormatted}: ${weakness}`);
            });
          } else if (area.aiAnalysis?.feedback) {
            weaknesses.push(`${areaNameFormatted}: ${area.aiAnalysis.feedback}`);
          } else {
            weaknesses.push(`Needs improvement in ${areaNameFormatted} (${Math.round(area.percentage)}% coverage)`);
          }

          // Add uncovered indicators as weaknesses
          if (area.indicators && Array.isArray(area.indicators)) {
            const uncoveredIndicators = area.indicators.filter((ind: any) => !ind.covered);
            if (uncoveredIndicators.length > 0 && uncoveredIndicators.length <= 3) {
              const indicatorNames = uncoveredIndicators.map((ind: any) => ind.name || ind).join(', ');
              weaknesses.push(`${areaNameFormatted}: Missing coverage of ${indicatorNames}`);
            }
          }
        }
      });
    }
    return weaknesses.length > 0 ? weaknesses : ['No weaknesses data available'];
  };

  const generateRecommendations = (coverage: any): string[] => {
    const recommendations: string[] = [];

    // Extract recommendations from overall coverage AI analysis
    if (coverage.aiAnalysis?.recommendedFocus) {
      recommendations.push(...coverage.aiAnalysis.recommendedFocus.map((focus: string) =>
        `Focus on improving ${focus}`
      ));
    }

    // Extract detailed recommendations from each coverage area
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([areaName, areaData]: [string, any]) => {
        const area = areaData;
        const areaNameFormatted = areaName.replace(/_/g, ' ');

        // Add AI analysis insights if available
        if (area.aiAnalysis) {
          const aiAnalysis = area.aiAnalysis;

          // Add specific insights from AI analysis
          if (aiAnalysis.insights && Array.isArray(aiAnalysis.insights)) {
            aiAnalysis.insights.forEach((insight: string) => {
              recommendations.push(`${areaNameFormatted}: ${insight}`);
            });
          }

          // Add improvement suggestions
          if (aiAnalysis.suggestions && Array.isArray(aiAnalysis.suggestions)) {
            aiAnalysis.suggestions.forEach((suggestion: string) => {
              recommendations.push(`${areaNameFormatted}: ${suggestion}`);
            });
          }

          // Add areas needing attention based on percentage
          if (area.percentage < 60) {
            if (aiAnalysis.feedback) {
              recommendations.push(`${areaNameFormatted}: ${aiAnalysis.feedback}`);
            } else {
              recommendations.push(`Strengthen ${areaNameFormatted} - current coverage: ${Math.round(area.percentage)}%`);
            }
          }

          // Add quality-based recommendations
          if (aiAnalysis.qualityScore !== undefined && aiAnalysis.qualityScore < 3) {
            recommendations.push(`Improve response quality in ${areaNameFormatted} (current quality: ${aiAnalysis.qualityScore}/5)`);
          }
        }

        // Add indicator-based recommendations
        if (area.indicators && Array.isArray(area.indicators)) {
          const uncoveredIndicators = area.indicators.filter((ind: any) => !ind.covered);
          if (uncoveredIndicators.length > 0 && uncoveredIndicators.length <= 3) {
            uncoveredIndicators.forEach((indicator: any) => {
              recommendations.push(`${areaNameFormatted}: Demonstrate knowledge of ${indicator.name || indicator}`);
            });
          }
        }
      });
    }

    if (recommendations.length === 0) {
      return ['No recommendations available - interview analysis incomplete'];
    }

    // Return up to 10 recommendations for more detail
    return recommendations.slice(0, 10);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getPerformanceMessage = (score: number): string => {
    if (score >= 90) return 'Outstanding performance! You demonstrate expert-level knowledge.';
    if (score >= 80) return 'Excellent work! You show advanced proficiency.';
    if (score >= 70) return 'Good performance! You have solid intermediate skills.';
    if (score >= 60) return 'Developing well! Continue practicing to improve.';
    if (score >= 50) return 'Basic understanding shown. Focus on strengthening fundamentals.';
    return 'Needs improvement. Consider additional study and practice.';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const downloadReport = () => {
    // Generate PDF or export functionality
    console.log('Downloading report...');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center', border: '2px solid #e0e0e0', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ color: '#8310FF' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
            Loading your results...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error || !analysis) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center', border: '2px solid #e0e0e0', borderRadius: 3 }}>
          <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} mb={2}>
            No Analysis Data Available
          </Typography>
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            {error || 'No interview data found to perform analysis. This could be because:'}
          </Alert>
          <Box sx={{ textAlign: 'left', mb: 3, px: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              • The interview was not completed
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              • The interview session has expired
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              • Analysis has not been generated yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • The interview data was cleared from storage
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => {
                // Force a full page reload to refresh dashboard data
                window.location.href = '/dashboard/candidate';
              }}
              fullWidth
            >
              Return to Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/interview')}
              fullWidth
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'rgba(131, 16, 255, 0.04)',
                }
              }}
            >
              Take New Interview
            </Button>
          </Box>

          {/* Export Data Buttons */}
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} mt={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportInterviewDataAsJSON}
              fullWidth
              sx={{
                borderColor: 'success.main',
                color: 'success.main',
                '&:hover': {
                  borderColor: 'success.dark',
                  bgcolor: 'rgba(76, 175, 80, 0.04)',
                }
              }}
            >
              Download JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopyJSON}
              fullWidth
              sx={{
                borderColor: copySuccess ? 'success.main' : 'info.main',
                color: copySuccess ? 'success.main' : 'info.main',
                '&:hover': {
                  borderColor: copySuccess ? 'success.dark' : 'info.dark',
                  bgcolor: copySuccess ? 'rgba(76, 175, 80, 0.04)' : 'rgba(33, 150, 243, 0.04)',
                }
              }}
            >
              {copySuccess ? 'Copied!' : 'Copy JSON'}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
            borderRadius: 3,
            border: '2px solid',
            borderColor: '#8310FF',
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TrophyIcon sx={{ fontSize: 48, color: '#ffd700' }} />
            <Box flex={1}>
              <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                Interview Complete!
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {analysis.skillScores.length > 0 && analysis.skillScores[0].skill !== 'General Interview'
                  ? `${analysis.skillScores[0].skill} Assessment Results`
                  : `${analysis.interviewType.replace('_', ' ')} Assessment Results`}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadReport}
              sx={{
                borderRadius: 2,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Download Report
            </Button>
            <Button
              variant="contained"
              startIcon={saveStatus === 'saving' ? <CircularProgress size={20} sx={{ color: 'white' }} /> : saveStatus === 'saved' ? <CheckCircleIcon /> : <SaveIcon />}
              onClick={() => saveInterviewToBackend(true)}
              disabled={saveStatus === 'saving'}
              sx={{
                borderRadius: 2,
                bgcolor: saveStatus === 'saved' ? '#4caf50' : saveStatus === 'error' ? '#f44336' : 'white',
                color: saveStatus === 'saved' || saveStatus === 'error' ? 'white' : '#8310FF',
                '&:hover': {
                  bgcolor: saveStatus === 'saved' ? '#45a049' : saveStatus === 'error' ? '#e53935' : 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.5)',
                  color: 'rgba(131, 16, 255, 0.5)',
                }
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Results'}
            </Button>
          </Box>

          {/* Overall Score */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              background: 'white',
              borderRadius: 3,
              border: '2px solid #8310FF',
            }}
          >
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={3}>
              <Box flex={{ xs: '1 1 auto', md: '0 0 auto' }} textAlign="center">
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={analysis.overallScore}
                    size={120}
                    thickness={4}
                    sx={{
                      color: '#8310FF',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
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
                    <Typography variant="h3" fontWeight={700} sx={{ color: '#8310FF' }}>
                      {Math.round(analysis.overallScore)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>/ 100</Typography>
                  </Box>
                </Box>
              </Box>
              <Box flex="1">
                <Typography variant="h4" fontWeight={600} mb={1} sx={{ color: 'text.primary' }}>
                  {getScoreLabel(analysis.overallScore)}
                </Typography>
                <Typography variant="h6" mb={2} sx={{ color: 'text.secondary' }}>
                  Level: {analysis.overallLevel}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {analysis.feedback}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Reward Notification */}
        {rewardInfo && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
            {rewardInfo.success ? (
              <Box textAlign="center">
                <TrophyIcon sx={{ fontSize: 80, color: '#ffd700', mb: 2, animation: 'bounce 1s ease-in-out infinite' }} />
                <Typography variant="h3" fontWeight={700} mb={2} sx={{
                  background: 'linear-gradient(135deg, #8310FF 0%, #00B8D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  🎉 Congratulations!
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
                  You earned {rewardInfo.amount?.toFixed(2)} TAI tokens!
                </Typography>
                <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    ✅ Reward distributed successfully!
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace" display="block">
                    Transaction ID: {rewardInfo.transactionId}
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  TAI tokens have been sent to your Hedera wallet. Check your balance in your dashboard!
                </Typography>
              </Box>
            ) : (
              <Box textAlign="center">
                <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} mb={2}>
                  Reward Claim Issue
                </Typography>
                <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                  {rewardInfo.error || 'Failed to distribute reward automatically'}
                </Alert>
                {rewardInfo.canRetry && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={claimingReward ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <TrophyIcon />}
                    onClick={handleClaimReward}
                    disabled={claimingReward}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #8310FF 0%, #00B8D4 100%)',
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      px: 4,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6f0dd9 0%, #0099b8 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(131, 16, 255, 0.3)',
                        color: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    {claimingReward ? 'Claiming Reward...' : 'Claim Reward Now'}
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Primary Skill Summary - Only show the main tested skill */}
        {analysis.skillScores && analysis.skillScores.length > 0 && analysis.skillScores[0] && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                Primary Skill Assessment
              </Typography>
            </Box>

            <Card
              variant="outlined"
              sx={{
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%) 1',
                boxShadow: '0 4px 12px rgba(131, 16, 255, 0.15)',
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {analysis.skillScores[0].skill}
                    </Typography>
                    <Chip
                      label="Primary"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                      }}
                    />
                  </Box>
                  <Chip
                    label={analysis.skillScores[0].level}
                    color={analysis.skillScores[0].score >= 70 ? 'success' : analysis.skillScores[0].score >= 50 ? 'warning' : 'error'}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Score
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round(analysis.skillScores[0].score)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.skillScores[0].score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(analysis.skillScores[0].score),
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>

                {analysis.skillScores[0].strengths && analysis.skillScores[0].strengths.length > 0 && (
                  <Box mb={1}>
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      ✓ Strengths:
                    </Typography>
                    {analysis.skillScores[0].strengths.slice(0, 3).map((strength, i) => (
                      <Typography key={i} variant="caption" display="block" color="text.secondary">
                        • {strength}
                      </Typography>
                    ))}
                  </Box>
                )}

                {analysis.skillScores[0].improvements && analysis.skillScores[0].improvements.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="warning.main" fontWeight={600}>
                      ⚠ Areas to Improve:
                    </Typography>
                    {analysis.skillScores[0].improvements.slice(0, 3).map((improvement, i) => (
                      <Typography key={i} variant="caption" display="block" color="text.secondary">
                        • {improvement}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Paper>
        )}

        {/* Conversation Quality */}
        {analysis.conversationQuality &&
          (analysis.conversationQuality.clarity > 0 ||
            analysis.conversationQuality.relevance > 0 ||
            analysis.conversationQuality.depth > 0 ||
            analysis.conversationQuality.engagement > 0) && (
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <StarsIcon color="primary" />
                <Typography variant="h5" fontWeight={600}>
                  Conversation Quality
                </Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={3}>
                {Object.entries(analysis.conversationQuality)
                  .filter(([_, value]) => typeof value === 'number')
                  .map(([key, value]) => (
                    <Box key={key} flex={{ xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary" textTransform="capitalize" mb={1}>
                          {key}
                        </Typography>
                        <Rating value={value / 20} precision={0.5} readOnly size="large" />
                        <Typography variant="h6" fontWeight={600} mt={1}>
                          {Math.round(value)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Paper>
          )}

        {/* Key Strengths */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            border: '2px solid #4CAF50',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#2E7D32' }}>
              Key Strengths
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            {analysis.strengths.map((strength, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid #C8E6C9',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-4px)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                    borderColor: '#4CAF50',
                  }
                }}
              >
                <Box
                  sx={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    border: '2px solid #4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#2E7D32',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#424242',
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {strength}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Areas for Improvement */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            border: '2px solid #FFB74D',
            background: 'linear-gradient(135deg, rgba(255, 183, 77, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningIcon sx={{ color: '#FF9800', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#E65100' }}>
              Areas for Improvement
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            {analysis.weaknesses.map((weakness, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid #FFE0B2',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
                    borderColor: '#FFB74D',
                  }
                }}
              >
                <Box
                  sx={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                    border: '2px solid #FFB74D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#E65100',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#424242',
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {weakness}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Interview Details & Statistics */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <AssessmentIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Interview Details
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={3}>
            {/* Interview Type */}
            <Box flex={{ xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(131, 16, 255, 0.05)' }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  Interview Type
                </Typography>
                <Typography variant="h6" fontWeight={600} mt={1}>
                  {analysis.interviewType
                    .split('_')
                    .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(' ')}
                </Typography>
              </Paper>
            </Box>
            {/* 
            {/* Duration */}
            <Box flex={{ xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(131, 16, 255, 0.05)' }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  Duration
                </Typography>
                <Typography variant="h6" fontWeight={600} mt={1}>
                  {(() => {
                    // Convert milliseconds to seconds
                    const totalSeconds = Math.floor(analysis.duration / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;

                    if (hours > 0) {
                      return `${hours}h ${minutes}m`;
                    } else if (minutes > 0) {
                      return `${minutes} min ${seconds > 0 ? `${seconds}s` : ''}`.trim();
                    } else {
                      return `${seconds}s`;
                    }
                  })()}
                </Typography>
              </Paper>
            </Box>

            {/* Completed Date */}
            <Box flex={{ xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(131, 16, 255, 0.05)' }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  Completed
                </Typography>
                <Typography variant="h6" fontWeight={600} mt={1}>
                  {new Date(analysis.completedAt).toLocaleDateString()}
                </Typography>
              </Paper>
            </Box>

            {/* Areas Assessed */}
            <Box flex={{ xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(131, 16, 255, 0.05)' }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                  Areas Assessed
                </Typography>
                <Typography variant="h6" fontWeight={600} mt={1}>
                  {Object.keys(analysis.coverage || {}).length || analysis.skillScores.length}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>

        {/* Coverage Details */}
        {analysis.coverage && Object.keys(analysis.coverage).length > 0 && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <StarsIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                Detailed Coverage Analysis
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              {Object.entries(analysis.coverage).map(([areaName, areaData]: [string, any]) => (
                <Box key={areaName}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                      {areaName.replace('_', ' ')}
                    </Typography>
                    <Chip
                      label={`${Math.round(areaData.percentage || 0)}%`}
                      size="small"
                      color={areaData.percentage >= 70 ? 'success' : areaData.percentage >= 50 ? 'warning' : 'error'}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={areaData.percentage || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(areaData.percentage || 0),
                        borderRadius: 4,
                      },
                    }}
                  />

                  {/* Show indicators if available */}
                  {areaData.indicators && areaData.indicators.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {areaData.indicators.slice(0, 5).map((indicator: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={indicator.name || indicator}
                          size="small"
                          variant={indicator.covered ? 'filled' : 'outlined'}
                          color={indicator.covered ? 'success' : 'default'}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Performance Summary */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <TrophyIcon sx={{ color: '#ffd700' }} />
            <Typography variant="h5" fontWeight={600}>
              Performance Summary
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            {/* Overall Assessment */}
            <Box sx={{ p: 3, bgcolor: 'rgba(131, 16, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Overall Assessment
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {analysis.feedback}
              </Typography>
            </Box>

            {/* Performance Level */}
            <Box sx={{ p: 3, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Performance Level
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#8310FF',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                  }}
                >
                  {analysis.overallScore}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {analysis.overallLevel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPerformanceMessage(analysis.overallScore)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => {
              // Force a full page reload to refresh dashboard data
              window.location.href = '/dashboard/candidate';
            }}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
              color: 'white',
            }}
          >
            Return to Dashboard
          </Button>

        </Box>


      </Container>
    </Box>
  );
}
