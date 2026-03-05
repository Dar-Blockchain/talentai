import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Container,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchAssessmentDetails,
  clearAssessmentDetails,
  selectAssessmentDetails,
  selectAssessmentStepsData,
  selectAssessmentDetailsLoading,
  selectAssessmentDetailsError,
} from '@/store/slices/postSlice';
import {
  AssessmentHeader,
  PipelineSteps,
  CoverageAnalysis,
  CoverageAreas,
  AiAnalysisSection,
  SkillsSection,
  SummarySection,
  JobDetailsSection,
  RecommendationsSection,
} from '@/components/features/interview/assessment';

const AssessmentDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const assessment = useSelector(selectAssessmentDetails);
  const stepsData = useSelector(selectAssessmentStepsData);
  const loading = useSelector(selectAssessmentDetailsLoading);
  const error = useSelector(selectAssessmentDetailsError);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAssessmentDetails(id as string));

    return () => {
      dispatch(clearAssessmentDetails());
    };
  }, [id, dispatch]);

  const coverageAreas = useMemo(
    () => assessment?.interviewData?.finalReport?.coverage?.areas || {},
    [assessment]
  );

  const aiAnalysis = useMemo(
    () => assessment?.interviewData?.finalReport?.aiAnalysis || {},
    [assessment]
  );

  const requiredSkills = useMemo(
    () => assessment?.post?.skillAnalysis?.requiredSkills || [],
    [assessment]
  );

  const softSkills = useMemo(
    () => assessment?.post?.skillAnalysis?.softSkills || [],
    [assessment]
  );

  const suggestedSkills = useMemo(
    () => assessment?.post?.skillAnalysis?.suggestedSkills || {},
    [assessment]
  );

  const summary = useMemo(
    () => assessment?.interviewData?.finalReport?.summary || '',
    [assessment]
  );

  const recommendations = useMemo(
    () => assessment?.interviewData?.finalReport?.recommendations || [],
    [assessment]
  );

  const jobDescription = useMemo(
    () => assessment?.post?.jobDetails?.description || '',
    [assessment]
  );

  const jobRequirements = useMemo(
    () => assessment?.post?.jobDetails?.requirements,
    [assessment]
  );

  const jobResponsibilities = useMemo(
    () => assessment?.post?.jobDetails?.responsibilities,
    [assessment]
  );

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

  return (
    <PageContainer>
      <Header />
      <Container maxWidth="lg" sx={{ py: 2 }}>
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
          <AssessmentHeader assessment={assessment} />
          <PipelineSteps stepsData={stepsData} />
          <CoverageAnalysis coverageAreas={coverageAreas} />
          <CoverageAreas coverageAreas={coverageAreas} />
          <AiAnalysisSection aiAnalysis={aiAnalysis} />
          <SkillsSection
            requiredSkills={requiredSkills}
            softSkills={softSkills}
            suggestedSkills={suggestedSkills}
          />
          <SummarySection summary={summary} />
          <JobDetailsSection
            description={jobDescription}
            requirements={jobRequirements}
            responsibilities={jobResponsibilities}
          />
          <RecommendationsSection recommendations={recommendations} />
        </Box>
      </Container>
    </PageContainer>
  );
};

export default dynamic(() => Promise.resolve(AssessmentDetailsPage), {
  ssr: false,
});
