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
  List,
  ListItem,
  ListItemText,
  Rating,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';

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
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      fetchAnalysis();
    }
  }, [router.isReady]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      console.log('📊 [Results] Fetching interview analysis...');

      // First, try to get stored analysis from localStorage (set by socket event)
      const storedAnalysis = localStorage.getItem('last_interview_analysis');

      if (storedAnalysis) {
        console.log('✅ [Results] Found stored analysis in localStorage');
        try {
          const parsedAnalysis = JSON.parse(storedAnalysis);

          // Transform the data to match our interface
          const transformedAnalysis = transformSocketAnalysis(parsedAnalysis);

          if (transformedAnalysis) {
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
    console.log('🔄 [Results] Transforming socket data:', socketData);

    const finalReport = socketData.finalReport || socketData;
    const analytics = socketData.analytics || {};

    // Extract scores from the final report
    const scores = finalReport.scores || {};
    const coverage = finalReport.coverage || {};

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

    return {
      overallScore: scores.overall || calculateOverallScore(scores),
      overallLevel: determineLevel(scores.overall || 70),
      interviewType: socketData.interviewType || 'General Interview',
      duration: analytics.duration || 0,
      completedAt: socketData.timestamp || new Date().toISOString(),
      skillScores: transformSkillScores(coverage.areas || {}),
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

  const calculateOverallScore = (scores: any): number => {
    const values = Object.values(scores).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const determineLevel = (score: number): string => {
    if (score === 0) return 'Not Assessed';
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 60) return 'Developing';
    return 'Beginner';
  };

  const transformSkillScores = (areas: any): SkillScore[] => {
    if (!areas || Object.keys(areas).length === 0) return [];

    return Object.entries(areas).map(([name, area]: [string, any]) => ({
      skill: name,
      score: area.percentage || 0,
      level: determineLevel(area.percentage || 0),
      strengths: area.indicators?.filter((i: any) => i.covered).map((i: any) => i.name).slice(0, 3) || [],
      improvements: area.indicators?.filter((i: any) => !i.covered).map((i: any) => i.name).slice(0, 3) || [],
    }));
  };

  const extractStrengths = (coverage: any): string[] => {
    const strengths: string[] = [];
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([name, area]: [string, any]) => {
        if (area.percentage >= 70) {
          strengths.push(`Strong performance in ${name}`);
        }
      });
    }
    return strengths.length > 0 ? strengths : ['No strengths data available'];
  };

  const extractWeaknesses = (coverage: any): string[] => {
    const weaknesses: string[] = [];
    if (coverage.areas) {
      Object.entries(coverage.areas).forEach(([name, area]: [string, any]) => {
        if (area.percentage < 50) {
          weaknesses.push(`Could improve in ${name}`);
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

    if (recommendations.length === 0) {
      return ['No recommendations available - interview analysis incomplete'];
    }

    return recommendations.slice(0, 5);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
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
              onClick={() => router.push('/dashboard/candidate')}
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
                  bgcolor: 'rgba(102, 126, 234, 0.04)',
                }
              }}
            >
              Take New Interview
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TrophyIcon sx={{ fontSize: 48, color: '#ffd700' }} />
            <Box flex={1}>
              <Typography variant="h3" fontWeight={700} color="primary">
                Interview Complete!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {analysis.interviewType.replace('_', ' ')} Assessment Results
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadReport}
              sx={{ borderRadius: 2 }}
            >
              Download Report
            </Button>
          </Box>

          {/* Overall Score */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white',
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
                      color: 'white',
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
                    <Typography variant="h3" fontWeight={700}>
                      {Math.round(analysis.overallScore)}
                    </Typography>
                    <Typography variant="caption">/ 100</Typography>
                  </Box>
                </Box>
              </Box>
              <Box flex="1">
                <Typography variant="h4" fontWeight={600} mb={1}>
                  {getScoreLabel(analysis.overallScore)}
                </Typography>
                <Typography variant="h6" mb={2}>
                  Level: {analysis.overallLevel}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {analysis.feedback}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Skill Breakdown */}
        {analysis.skillScores && analysis.skillScores.length > 0 && (
          <Paper elevation={6} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <AssessmentIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                Skill Assessment
              </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={3}>
              {analysis.skillScores.map((skill, index) => (
                <Box key={index} flex={{ xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                          {skill.skill}
                        </Typography>
                        <Chip
                          label={skill.level}
                          color={skill.score >= 70 ? 'success' : skill.score >= 50 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>

                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Score
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round(skill.score)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={skill.score}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getScoreColor(skill.score),
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>

                      {skill.strengths && skill.strengths.length > 0 && (
                        <Box mb={1}>
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            ✓ Strengths:
                          </Typography>
                          {skill.strengths.slice(0, 2).map((strength, i) => (
                            <Typography key={i} variant="caption" display="block" color="text.secondary">
                              • {strength}
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {skill.improvements && skill.improvements.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="warning.main" fontWeight={600}>
                            ⚠ Areas to Improve:
                          </Typography>
                          {skill.improvements.slice(0, 2).map((improvement, i) => (
                            <Typography key={i} variant="caption" display="block" color="text.secondary">
                              • {improvement}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Conversation Quality */}
        {analysis.conversationQuality && (
          <Paper elevation={6} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <StarsIcon color="primary" />
              <Typography variant="h5" fontWeight={600}>
                Conversation Quality
              </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={3}>
              {Object.entries(analysis.conversationQuality).map(([key, value]) => (
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

        {/* Strengths & Weaknesses */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
          <Box flex={{ xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}>
            <Paper elevation={6} sx={{ p: 4, height: '100%', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckCircleIcon color="success" />
                <Typography variant="h5" fontWeight={600}>
                  Key Strengths
                </Typography>
              </Box>
              <List>
                {analysis.strengths.map((strength, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={strength}
                      primaryTypographyProps={{
                        variant: 'body1',
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          <Box flex={{ xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}>
            <Paper elevation={6} sx={{ p: 4, height: '100%', borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WarningIcon color="warning" />
                <Typography variant="h5" fontWeight={600}>
                  Areas for Improvement
                </Typography>
              </Box>
              <List>
                {analysis.weaknesses.map((weakness, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={weakness}
                      primaryTypographyProps={{
                        variant: 'body1',
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>

        {/* Recommendations */}
        <Paper elevation={6} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Recommendations
            </Typography>
          </Box>
          <List>
            {analysis.recommendations.map((recommendation, index) => (
              <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </Box>
                <ListItemText
                  primary={recommendation}
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: 'text.primary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/dashboard/candidate')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/interview')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Take Another Test
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
