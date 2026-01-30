import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Collapse,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BusinessIcon from '@mui/icons-material/Business';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

const AssessmentDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [assessment, setAssessment] = useState<any>(null);
  const [stepsData, setStepsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('api_token');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}post-interview-assessments/${id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch assessment details');
        }

        const data = await response.json();
        // Handle new response structure: { data: { assessment, stepsData } }
        const responseData = data.data || data;
        const assessmentData = responseData.assessment || responseData;
        const steps = responseData.stepsData || null;

        setAssessment(assessmentData);
        setStepsData(steps);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment');
        console.error('Error fetching assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  // Helper functions
  const getCandidateName = () => assessment?.candidate?.username || 'Unknown User';
  const getCompanyName = () => assessment?.company?.username || '';
  const getJobTitle = () => assessment?.post?.jobDetails?.title || 'Unknown Job';
  const getJobDescription = () => assessment?.post?.jobDetails?.description || '';
  const getInterviewType = () => assessment?.interviewData?.interviewType || 'HR_INTERVIEW';
  const getCoverageScore = () => assessment?.interviewData?.finalReport?.coverage?.overall || 0;
  const getSummary = () => assessment?.interviewData?.finalReport?.summary || '';
  const getRecommendations = () => assessment?.interviewData?.finalReport?.recommendations || [];
  const getTimestamp = () => assessment?.createdAt || new Date().toISOString();
  const getAnalytics = () => assessment?.interviewData?.analytics || {};
  const getCoverageAreas = () => assessment?.interviewData?.finalReport?.coverage?.areas || {};
  const getAiAnalysis = () => assessment?.interviewData?.finalReport?.aiAnalysis || {};
  const getRequiredSkills = () => assessment?.post?.skillAnalysis?.requiredSkills || [];
  const getSoftSkills = () => assessment?.post?.skillAnalysis?.softSkills || [];
  const getSuggestedSkills = () => assessment?.post?.skillAnalysis?.suggestedSkills || {};

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatAreaName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'passed':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981' };
      case 'inProgress':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '#f59e0b' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '#6b7280' };
    }
  };

  const getStepStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
      case 'passed':
        return 'Completed';
      case 'inProgress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  // Sort steps by order
  const getSortedSteps = () => {
    if (!stepsData?.steps) return [];
    return [...stepsData.steps].sort((a: any, b: any) => {
      const orderA = a.stepId?.order ?? 999;
      const orderB = b.stepId?.order ?? 999;
      return orderA - orderB;
    });
  };

  // Prepare chart data for coverage areas
  const getCoverageChartData = () => {
    const areas = getCoverageAreas();
    return Object.entries(areas).map(([areaKey, areaData]: [string, any]) => ({
      name: formatAreaName(areaKey),
      percentage: Math.round(areaData.percentage || 0),
      completed: areaData.completed,
    }));
  };

  // Prepare radar chart data
  const getRadarChartData = () => {
    const areas = getCoverageAreas();
    return Object.entries(areas).map(([areaKey, areaData]: [string, any]) => ({
      subject: formatAreaName(areaKey),
      score: Math.round(areaData.percentage || 0),
      fullMark: 100,
    }));
  };

  // Custom colors for charts
  const chartColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  // Section style
  const sectionStyle = {
    border: '1px solid rgba(98, 111, 134, 0.18)',
    backgroundColor: 'rgba(253, 253, 253, 1)',
    borderRadius: '12px',
    px: 2,
    py: 1.5,
  };

  const sectionTitleStyle = (accentColor: string = 'rgba(41, 210, 145, 0.83)') => ({
    position: 'relative' as const,
    fontWeight: 600,
    fontSize: '20px',
    lineHeight: '35px',
    color: 'rgba(23, 43, 77, 1)',
    mb: 2,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '38px',
      height: '5px',
      backgroundColor: accentColor,
      borderRadius: '2px',
    },
  });

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress sx={{ color: '#8310FF' }} />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{
              borderColor: '#8310FF',
              color: '#8310FF',
              '&:hover': {
                borderColor: '#6b0ecc',
                backgroundColor: 'rgba(131, 16, 255, 0.08)',
              },
            }}
          >
            Go Back
          </Button>
        </Container>
      </PageContainer>
    );
  }

  if (!assessment) {
    return (
      <PageContainer>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Assessment not found</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </PageContainer>
    );
  }

  const analytics = getAnalytics();
  const coverageAreas = getCoverageAreas();
  const aiAnalysis = getAiAnalysis();
  const coverageChartData = getCoverageChartData();
  const radarChartData = getRadarChartData();
  const sortedSteps = getSortedSteps();

  return (
    <PageContainer>
      <Header />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Back Button */}
        <Button
          startIcon={
            <ArrowBackIcon
              sx={{ color: '#8310FF', transition: 'transform 0.2s ease' }}
            />
          }
          onClick={() => router.back()}
          sx={{
            mt: 2,
            textTransform: 'none',
            px: 0,
            color: '#111827',
            '&:hover': { background: 'transparent', transform: 'scale(1.05)' },
          }}
        >
          Back
        </Button>

        {/* Main Content Card */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            mt: 2,
            border: '1px solid rgba(238, 240, 242, 1)',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 1)',
          }}
        >
          {/* Header Section */}
          <Box sx={sectionStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="h5" sx={sectionTitleStyle()}>
                  Interview Assessment
                </Typography>
                <Chip
                  label={getInterviewType().replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(131, 16, 255, 0.1)',
                    color: '#8310FF',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    border: '1px solid #8310FF',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={getCoverageScore()}
                    size={60}
                    thickness={5}
                    sx={{
                      color: getCoverageScore() >= 50 ? '#10b981' : '#f59e0b',
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
                    }}
                  >
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '14px',
                      }}
                    >
                      {Math.round(getCoverageScore())}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  Overall Score
                </Typography>
              </Box>
            </Box>

            {/* Candidate & Job Info */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  fontSize: '15px',
                  lineHeight: '42px',
                  color: 'rgba(98, 111, 134, 1)',
                }}
              >
                Assessment Details
              </Typography>

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: 'wrap', gap: 0.5 }}
              >
                <Chip
                  label={getCandidateName()}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(95, 168, 211, 0.1)',
                    color: 'rgba(84, 98, 116, 1)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24,
                    border: '0.25px solid rgba(95, 168, 211, 1)',
                  }}
                  icon={
                    <PersonIcon
                      sx={{
                        color: 'rgba(95, 168, 211, 1)!important',
                        width: '16px',
                        height: '16px',
                      }}
                    />
                  }
                />
                {getCompanyName() && (
                  <Chip
                    label={getCompanyName()}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(131, 16, 255, 0.08)',
                      color: '#8310FF',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24,
                      border: '0.25px solid rgba(131, 16, 255, 0.4)',
                    }}
                    icon={
                      <BusinessIcon
                        sx={{
                          color: '#8310FF!important',
                          width: '16px',
                          height: '16px',
                        }}
                      />
                    }
                  />
                )}
                <Chip
                  label={getJobTitle()}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(95, 168, 211, 0.1)',
                    color: 'rgba(84, 98, 116, 1)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24,
                    border: '0.25px solid rgba(95, 168, 211, 1)',
                  }}
                  icon={
                    <WorkIcon
                      sx={{
                        color: 'rgba(95, 168, 211, 1)!important',
                        width: '16px',
                        height: '16px',
                      }}
                    />
                  }
                />
                <Chip
                  label={new Date(getTimestamp()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(95, 168, 211, 0.1)',
                    color: 'rgba(84, 98, 116, 1)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24,
                    border: '0.25px solid rgba(95, 168, 211, 1)',
                  }}
                  icon={
                    <CalendarMonthIcon
                      sx={{
                        color: 'rgba(95, 168, 211, 1)!important',
                        width: '16px',
                        height: '16px',
                      }}
                    />
                  }
                />
                <Chip
                  label={formatDuration(analytics.duration || 0)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(95, 168, 211, 0.1)',
                    color: 'rgba(84, 98, 116, 1)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 24,
                    border: '0.25px solid rgba(95, 168, 211, 1)',
                  }}
                  icon={
                    <AccessTimeIcon
                      sx={{
                        color: 'rgba(95, 168, 211, 1)!important',
                        width: '16px',
                        height: '16px',
                      }}
                    />
                  }
                />
                {assessment?.post?.status && (
                  <Chip
                    label={assessment.post.status}
                    size="small"
                    sx={{
                      backgroundColor: assessment.post.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: assessment.post.status === 'open' ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24,
                      border: `1px solid ${assessment.post.status === 'open' ? '#10b981' : '#ef4444'}`,
                      textTransform: 'capitalize',
                    }}
                  />
                )}
              </Stack>
            </Box>

            {/* Analytics Stats */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'rgba(98, 111, 134, 1)',
                  fontSize: '15px',
                  fontWeight: 500,
                  mb: 1.5,
                }}
              >
                Interview Analytics
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <AccessTimeIcon sx={{ color: '#6366f1', fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 700, fontSize: '16px' }}>
                    {formatDuration(analytics.duration || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '11px' }}>
                    Duration
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <ChatIcon sx={{ color: '#10b981', fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>
                    {analytics.messageCount || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '11px' }}>
                    Messages
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <AssessmentIcon sx={{ color: '#f59e0b', fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '16px' }}>
                    {analytics.completedAreas || 0}/{analytics.totalAreas || 4}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '11px' }}>
                    Areas Covered
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: '#8b5cf6', fontSize: 24, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700, fontSize: '16px' }}>
                    {Math.round(analytics.coveragePercentage || 0)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '11px' }}>
                    Coverage
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Pipeline Steps Section */}
          {sortedSteps.length > 0 && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle('#8310FF')}>
                Pipeline Steps
              </Typography>

              {/* Steps Progress Summary */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  {sortedSteps.filter((s: any) => s.status === 'done' || s.status === 'passed').length} / {sortedSteps.length} Steps Completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(sortedSteps.filter((s: any) => s.status === 'done' || s.status === 'passed').length / sortedSteps.length) * 100}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#8310FF',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              {/* Step Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sortedSteps.map((step: any, index: number) => {
                  const statusColors = getStepStatusColor(step.status);
                  const stepLabel = step.stepId?.data?.label || step.stepId?.data?.config?.title || `Step ${index + 1}`;
                  const stepType = step.stepId?.data?.type || 'interview';
                  const stepKey = step._id || `step-${index}`;
                  const isExpanded = expandedSteps[stepKey] || false;
                  const interviewDetails = step.interviewDetails;
                  const hasDetails = interviewDetails?.interviewData;

                  return (
                    <Box key={stepKey}>
                      {/* Step Header Card */}
                      <Box
                        onClick={() => hasDetails && toggleStepExpand(stepKey)}
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          padding: '16px',
                          border: `1px solid ${isExpanded ? statusColors.border : 'rgba(238, 240, 242, 1)'}`,
                          cursor: hasDetails ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          '&:hover': hasDetails ? {
                            borderColor: statusColors.border,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          } : {},
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Step Number */}
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '10px',
                                backgroundColor: step.status === 'done' || step.status === 'passed'
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : step.status === 'inProgress'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'rgba(107, 114, 128, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {step.status === 'done' || step.status === 'passed' ? (
                                <CheckCircleOutlineIcon sx={{ fontSize: 22, color: '#10b981' }} />
                              ) : (
                                <Typography sx={{ fontWeight: 700, fontSize: '14px', color: statusColors.color }}>
                                  {index + 1}
                                </Typography>
                              )}
                            </Box>

                            {/* Step Info */}
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                                {stepLabel}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px', textTransform: 'capitalize' }}>
                                {stepType}
                                {step.completedAt && ` - ${new Date(step.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* Score */}
                            {step.score !== undefined && step.score !== null && (
                              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: statusColors.color }}>
                                {Math.round(step.score)}%
                              </Typography>
                            )}

                            {/* Status Chip */}
                            <Chip
                              label={getStepStatusLabel(step.status)}
                              size="small"
                              sx={{
                                backgroundColor: statusColors.bg,
                                color: statusColors.color,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 22,
                                border: `1px solid ${statusColors.border}`,
                              }}
                            />

                            {/* Expand Icon */}
                            {hasDetails && (
                              <IconButton size="small" sx={{ color: '#6b7280' }}>
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Expanded Interview Details */}
                      <Collapse in={isExpanded}>
                        {hasDetails && (
                          <Box
                            sx={{
                              ml: 3,
                              mt: 1,
                              p: 2,
                              backgroundColor: 'rgba(248, 249, 252, 1)',
                              borderRadius: '10px',
                              border: '1px solid rgba(238, 240, 242, 1)',
                            }}
                          >
                            {/* Interview Analytics Mini */}
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, color: 'rgba(23, 43, 77, 1)', fontSize: '13px', mb: 1.5 }}
                            >
                              Interview Details
                            </Typography>

                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 1.5,
                                mb: 2,
                              }}
                            >
                              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(238,240,242,1)' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#8310FF' }}>
                                  {Math.round(interviewDetails.interviewData?.finalReport?.coverage?.overall || 0)}%
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '10px' }}>
                                  Coverage
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(238,240,242,1)' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#6366f1' }}>
                                  {formatDuration(interviewDetails.interviewData?.analytics?.duration || 0)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '10px' }}>
                                  Duration
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid rgba(238,240,242,1)' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#10b981' }}>
                                  {interviewDetails.interviewData?.analytics?.messageCount || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '10px' }}>
                                  Messages
                                </Typography>
                              </Box>
                            </Box>

                            {/* Coverage Areas */}
                            {interviewDetails.interviewData?.finalReport?.coverage?.areas &&
                             Object.keys(interviewDetails.interviewData.finalReport.coverage.areas).length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', mb: 1 }}>
                                  Coverage Areas
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {Object.entries(interviewDetails.interviewData.finalReport.coverage.areas).map(
                                    ([areaKey, areaData]: [string, any], idx: number) => (
                                      <Box key={areaKey} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography sx={{ fontSize: '12px', color: '#374151', fontWeight: 500, minWidth: 120, textTransform: 'capitalize' }}>
                                          {formatAreaName(areaKey)}
                                        </Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={areaData.percentage || 0}
                                          sx={{
                                            flex: 1,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: '#e5e7eb',
                                            '& .MuiLinearProgress-bar': {
                                              backgroundColor: chartColors[idx % chartColors.length],
                                              borderRadius: 3,
                                            },
                                          }}
                                        />
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: chartColors[idx % chartColors.length], minWidth: 35 }}>
                                          {Math.round(areaData.percentage || 0)}%
                                        </Typography>
                                      </Box>
                                    )
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* AI Analysis for this step */}
                            {interviewDetails.interviewData?.finalReport?.aiAnalysis && (
                              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {interviewDetails.interviewData.finalReport.aiAnalysis.strongestAreas?.length > 0 && (
                                  <Box sx={{ flex: 1, minWidth: 150, p: 1, backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                    <Typography sx={{ fontWeight: 600, color: '#065f46', fontSize: '11px', mb: 0.5 }}>
                                      Strengths
                                    </Typography>
                                    {interviewDetails.interviewData.finalReport.aiAnalysis.strongestAreas.map((area: string, idx: number) => (
                                      <Typography key={idx} sx={{ color: '#047857', fontSize: '11px' }}>
                                        {formatAreaName(area)}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                                {interviewDetails.interviewData.finalReport.aiAnalysis.weakestAreas?.length > 0 && (
                                  <Box sx={{ flex: 1, minWidth: 150, p: 1, backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                    <Typography sx={{ fontWeight: 600, color: '#991b1b', fontSize: '11px', mb: 0.5 }}>
                                      Needs Improvement
                                    </Typography>
                                    {interviewDetails.interviewData.finalReport.aiAnalysis.weakestAreas.map((area: string, idx: number) => (
                                      <Typography key={idx} sx={{ color: '#b91c1c', fontSize: '11px' }}>
                                        {formatAreaName(area)}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            )}

                            {/* Summary */}
                            {interviewDetails.interviewData?.finalReport?.summary && (
                              <Box sx={{ mt: 1.5 }}>
                                <Typography variant="body2" sx={{ color: '#374151', fontSize: '12px', lineHeight: 1.5 }}>
                                  {interviewDetails.interviewData.finalReport.summary}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Collapse>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Charts Section */}
          {coverageChartData.length > 0 && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={{ ...sectionTitleStyle(), mb: 3 }}>
                Coverage Analysis
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Bar Chart */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 2 }}
                  >
                    Coverage by Area
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={coverageChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value}%`, 'Coverage']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {coverageChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Radar Chart */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 2 }}
                  >
                    Skills Radar
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Radar name="Coverage" dataKey="score" stroke="#8310FF" fill="#8310FF" fillOpacity={0.3} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}

          {/* Coverage Areas Details */}
          {Object.keys(coverageAreas).length > 0 && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle()}>
                Coverage Areas
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Object.entries(coverageAreas).map(([areaKey, areaData]: [string, any], index) => (
                  <Box
                    key={areaKey}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid rgba(238, 240, 242, 1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: `${chartColors[index % chartColors.length]}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <WorkIcon sx={{ fontSize: 18, color: chartColors[index % chartColors.length] }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px', textTransform: 'capitalize' }}>
                            {formatAreaName(areaKey)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>
                            {areaData.depth} | {areaData.questionsAsked || 0} questions
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          label={areaData.completed ? 'Completed' : 'In Progress'}
                          size="small"
                          sx={{
                            backgroundColor: areaData.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: areaData.completed ? '#10b981' : '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                            border: `1px solid ${areaData.completed ? '#10b981' : '#f59e0b'}`,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: chartColors[index % chartColors.length], fontSize: '16px' }}>
                          {Math.round(areaData.percentage || 0)}%
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={areaData.percentage || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e5e7eb',
                        mb: 1.5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: chartColors[index % chartColors.length],
                          borderRadius: 3,
                        },
                      }}
                    />

                    {/* Indicators */}
                    {areaData.indicators && areaData.indicators.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {areaData.indicators.map((indicator: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={indicator.name}
                            size="small"
                            sx={{
                              backgroundColor: indicator.covered ? 'rgba(16, 185, 129, 0.1)' : '#f3f4f6',
                              color: indicator.covered ? '#065f46' : '#6b7280',
                              fontWeight: 500,
                              fontSize: '0.65rem',
                              height: 20,
                              border: indicator.covered ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* AI Analysis */}
          {(aiAnalysis.strongestAreas?.length > 0 ||
            aiAnalysis.weakestAreas?.length > 0 ||
            aiAnalysis.recommendedFocus?.length > 0) && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle('rgba(131, 16, 255, 0.83)')}>
                AI Analysis
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {aiAnalysis.strongestAreas?.length > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(16, 185, 129, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#065f46', mb: 1, fontSize: '13px' }}>
                      Strongest Areas
                    </Typography>
                    {aiAnalysis.strongestAreas.map((area: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#047857', fontSize: '12px', mb: 0.5 }}>
                        {formatAreaName(area)}
                      </Typography>
                    ))}
                  </Box>
                )}

                {aiAnalysis.weakestAreas?.length > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#991b1b', mb: 1, fontSize: '13px' }}>
                      Areas for Improvement
                    </Typography>
                    {aiAnalysis.weakestAreas.map((area: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#b91c1c', fontSize: '12px', mb: 0.5 }}>
                        {formatAreaName(area)}
                      </Typography>
                    ))}
                  </Box>
                )}

                {aiAnalysis.recommendedFocus?.length > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(245, 158, 11, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400e', mb: 1, fontSize: '13px' }}>
                      Recommended Focus
                    </Typography>
                    {aiAnalysis.recommendedFocus.map((focus: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#a16207', fontSize: '12px', mb: 0.5 }}>
                        {formatAreaName(focus)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Required Skills */}
          {getRequiredSkills().length > 0 && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle('rgba(99, 102, 241, 0.83)')}>
                Required Skills
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {getRequiredSkills().map((skill: any, index: number) => (
                  <Box
                    key={skill._id || index}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(238, 240, 242, 1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                            {skill.name?.charAt(0)?.toUpperCase() || 'S'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                            {skill.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>
                            {skill.category} - {skill.level}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          label={skill.importance || skill.category}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            fontWeight: 500,
                            fontSize: '0.65rem',
                            height: 20,
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Soft Skills */}
              {getSoftSkills().length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 1.5 }}>
                    Soft Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getSoftSkills().map((skill: any, index: number) => (
                      <Chip
                        key={skill._id || index}
                        label={`${skill.name} - ${skill.level}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: 26,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Suggested Skills */}
              {(getSuggestedSkills().technical?.length > 0 ||
                getSuggestedSkills().frameworks?.length > 0 ||
                getSuggestedSkills().tools?.length > 0) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '14px', fontWeight: 500, mb: 1.5 }}>
                    Suggested Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getSuggestedSkills().technical?.map((skill: any, index: number) => (
                      <Chip
                        key={`tech-${index}`}
                        label={skill.name}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 24,
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}
                      />
                    ))}
                    {getSuggestedSkills().frameworks?.map((skill: any, index: number) => (
                      <Chip
                        key={`fw-${index}`}
                        label={skill.name}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          color: '#f59e0b',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 24,
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      />
                    ))}
                    {getSuggestedSkills().tools?.map((skill: any, index: number) => (
                      <Chip
                        key={`tool-${index}`}
                        label={skill.name}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(20, 184, 166, 0.1)',
                          color: '#14b8a6',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 24,
                          border: '1px solid rgba(20, 184, 166, 0.3)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Summary */}
          {getSummary() && (
            <Box sx={sectionStyle}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1 }}>
                Summary
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 1)', fontSize: '12px', fontWeight: 400, lineHeight: 1.6 }}>
                {getSummary()}
              </Typography>
            </Box>
          )}

          {/* Job Details */}
          {getJobDescription() && (
            <Box sx={sectionStyle}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1 }}>
                Job Description
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 1)', fontSize: '12px', fontWeight: 400, maxWidth: '600px', lineHeight: 1.6 }}>
                {getJobDescription()}
              </Typography>

              {assessment?.post?.jobDetails?.requirements?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500 }}>
                    Requirements
                  </Typography>
                  <List
                    sx={{
                      ml: 0.75,
                      maxWidth: '600px',
                      pl: 2,
                      listStyleType: 'disc',
                      '& .MuiListItem-root': { paddingTop: 0, paddingBottom: 0 },
                    }}
                  >
                    {assessment.post.jobDetails.requirements.map((req: string, index: number) => (
                      <ListItem key={index} sx={{ display: 'list-item', pl: 0 }}>
                        <ListItemText
                          primary={req}
                          sx={{ m: 0 }}
                          primaryTypographyProps={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: 'rgba(0, 0, 0, 1)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {assessment?.post?.jobDetails?.responsibilities?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500 }}>
                    Responsibilities
                  </Typography>
                  <List
                    sx={{
                      ml: 0.75,
                      maxWidth: '600px',
                      pl: 2,
                      listStyleType: 'disc',
                      '& .MuiListItem-root': { paddingTop: 0, paddingBottom: 0 },
                    }}
                  >
                    {assessment.post.jobDetails.responsibilities.map((resp: string, index: number) => (
                      <ListItem key={index} sx={{ display: 'list-item', pl: 0 }}>
                        <ListItemText
                          primary={resp}
                          sx={{ m: 0 }}
                          primaryTypographyProps={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', color: 'rgba(0, 0, 0, 1)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {/* Recommendations */}
          {getRecommendations().length > 0 && (
            <Box sx={sectionStyle}>
              <Typography variant="h5" sx={sectionTitleStyle('rgba(245, 158, 11, 0.83)')}>
                Recommendations ({getRecommendations().length})
              </Typography>

              <List sx={{ p: 0 }}>
                {getRecommendations().map((rec: string, index: number) => (
                  <ListItem
                    key={index}
                    sx={{
                      py: 1,
                      px: 0,
                      '&:not(:last-child)': { borderBottom: '1px solid rgba(238, 240, 242, 1)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography sx={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={rec}
                      sx={{
                        '& .MuiListItemText-primary': { fontWeight: 400, lineHeight: 1.5, fontSize: '13px', color: '#111827' },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default dynamic(() => Promise.resolve(AssessmentDetailsPage), {
  ssr: false,
});
