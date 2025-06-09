'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  styled,
  CircularProgress,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(0,0,0,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const TranscriptSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const MotionPaper = motion(StyledPaper);
const MotionBox = motion(TranscriptSection);

interface SkillAnalysis {
  skillName: string;
  currentProficiency: number;
  demonstratedProficiency: number;
  currentExperienceLevel: string;
  demonstratedExperienceLevel: string;
  strengths: string[];
  weaknesses: string[];
  confidenceScore: number;
  improvement: string;
}

interface AnalysisResult {
  timestamp: string;
  assessmentType: string;
  skillsAssessed: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
  }>;
  analysis: {
    overallScore: number;
    experienceLevels: string[];
    skillAnalysis: SkillAnalysis[];
    generalAssessment: string;
    recommendations: string[];
    technicalLevel: string;
    nextSteps: string[];
  };
}

export default function ReportOnBoarding() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;

    const analyzeResults = async () => {
      try {
        setAnalyzing(true);
        const token = localStorage.getItem('api_token');
        if (!token) throw new Error('No authentication token found');

        const savedResults = localStorage.getItem('test_results');
        if (!savedResults) return;

        const testData = JSON.parse(savedResults);
        if (!testData || !testData.results || !Array.isArray(testData.results)) {
          throw new Error('Invalid test results format in storage');
        }

        // Get skills from URL query parameters
        const skillsArray = router.query.skills ? (router.query.skills as string).split(',') : [];
        const proficiencyMap = router.query.proficiencyLevels ? 
          Object.fromEntries(
            (router.query.proficiencyLevels as string).split(',').map(pair => {
              const [skill, level] = pair.split(':');
              return [skill, parseInt(level)];
            })
          ) : {};

        // Create structured skills array
        const structuredSkills = skillsArray.map(skill => ({
          name: skill,
          proficiencyLevel: proficiencyMap[skill] || 1,
          experienceLevel: router.query.experienceLevel || 'Entry Level'
        }));

        const requestBody = {
          // type: 'technicalSkill',
          // skill: structuredSkills,
          questions: testData.results
        };

        console.log('Sending on-boarding analysis request:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/analyze-onboarding-answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to analyze results';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || 'Failed to analyze results';
          }
          throw new Error(`Failed to analyze results: ${errorMessage}`);
        }

        const analysisData = await response.json();

        // Normalize analysis data
        if (analysisData.result?.analysis) {
          const analysis = analysisData.result.analysis;

          if (Array.isArray(analysis.recommendations)) {
            analysis.recommendations = analysis.recommendations.map((rec: any) =>
              typeof rec === 'object' ? Object.values(rec).join(': ') : rec
            );
          }

          if (Array.isArray(analysis.nextSteps)) {
            analysis.nextSteps = analysis.nextSteps.map((step: any) =>
              typeof step === 'object' ? Object.values(step).join(': ') : step
            );
          }

          if (Array.isArray(analysis.skillAnalysis)) {
            analysis.skillAnalysis = analysis.skillAnalysis.map((skill: any) => ({
              ...skill,
              strengths: (skill.strengths || []).map((s: any) => typeof s === 'object' ? Object.values(s).join(': ') : s),
              weaknesses: (skill.weaknesses || []).map((w: any) => typeof w === 'object' ? Object.values(w).join(': ') : w),
            }));
          }
        }

        setResults(analysisData.result);
      } catch (e) {
        console.error('Error analyzing test results:', e);
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    if (!hasRun.current) {
      hasRun.current = true;
      analyzeResults();
    }
  }, [router.isReady]);

  const goHome = () => router.push('/dashboardCandidate');

  if (loading || analyzing) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 3
      }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
        <Typography variant="h6" sx={{ color: '#fff' }}>
          {analyzing ? 'Analyzing your responses...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper>
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {error}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goHome}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Return to Dashboard
          </Button>
        </StyledPaper>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper>
          <Typography variant="h5" sx={{ color: '#fff' }} gutterBottom>
            No Results Found
          </Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            We couldn't find any test results to analyze.
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goHome}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Return to Dashboard
          </Button>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={goHome}
          sx={{
            color: '#000',
            mb: 2,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Back to Home
        </Button>

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              background: 'rgba(0, 255, 157, 1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            On-Boarding Assessment Results
          </Typography>

          {/* Overall Score */}
          <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
            <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
              Overall Assessment
            </Typography>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2
            }}>
              <TrendingUpIcon sx={{ color: '#02E2FF' }} />
              <Typography variant="h5" sx={{ color: '#000' }}>
                Score: {Number(results.analysis.overallScore).toFixed(2)}%
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#000', mb: 2 }}>
              {results.analysis.generalAssessment}
            </Typography>
          </Box>

          {/* Skills Analysis */}
          <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
            <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
              Skills Analysis
            </Typography>
            {results.analysis.skillAnalysis.map((skill, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                sx={{ backgroundColor: 'white' }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: 'white' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)' }}>
                      {skill.skillName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#000' }}>
                        Current Level: {skill.currentExperienceLevel}
                      </Typography>
                    </Box> */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#000' }}>
                        Demonstrated Level: {skill.demonstratedExperienceLevel}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ color: '#00FFC3', mb: 1 }}>Strengths:</Typography>
                    {skill.strengths.map((strength, j) => (
                      <Typography key={j} sx={{ color: '#000', ml: 2 }}>• {strength}</Typography>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ color: '#FF6B6B', mb: 1 }}>Areas for Improvement:</Typography>
                    {skill.weaknesses.map((weakness, j) => (
                      <Typography key={j} sx={{ color: '#000', ml: 2 }}>• {weakness}</Typography>
                    ))}
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </Box>

          {/* Recommendations */}
          <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
            <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
              Recommendations
            </Typography>
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
              {results.analysis.recommendations.map((rec, i) => (
                <Typography key={i} sx={{ color: '#000', mb: 1 }}>• {rec}</Typography>
              ))}
            </Box>
          </Box>

          {/* Next Steps */}
          <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
            <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
              Next Steps
            </Typography>
            <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
              {results.analysis.nextSteps.map((step, i) => (
                <Typography key={i} sx={{ color: '#000', mb: 1 }}>• {step}</Typography>
              ))}
            </Box>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/dashboardCandidate')}
              startIcon={<PersonIcon />}
              sx={{
                background: 'rgba(0, 255, 157, 1)',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                '&:hover': {
                  background: 'rgba(0, 255, 157, 1)',
                }
              }}
            >
              Go to My Dashboard
            </Button>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
} 