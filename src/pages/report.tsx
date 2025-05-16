// pages/report.tsx
'use client';

import { useEffect, useState } from 'react';
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
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}));

const TranscriptSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  background: 'rgba(0,0,0,0.2)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.05)',
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

export default function Report() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentType, setAssessmentType] = useState<string>('technical');

  useEffect(() => {
    const previousPath = router.query.from as string || localStorage.getItem('previousPath');
    const type = router.query.type as string || previousPath?.includes('test') ? 'technical' :
      previousPath?.includes('technical') ? 'technical' : 'soft-skills';
    
    setAssessmentType(type);

    const analyzeResults = async () => {
      try {
        setAnalyzing(true);
        // First get the user's profile
        const token = localStorage.getItem('api_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await profileResponse.json();
        const userSkills = profileData?.skills || [];

        // Get the test results
        const savedResults = localStorage.getItem('test_results');
        if (savedResults) {
          const testData = JSON.parse(savedResults);
          
          // Validate test data format
          if (!testData || !testData.results || !Array.isArray(testData.results)) {
            throw new Error('Invalid test results format in storage');
          }

          const requestBody = {
            type: router.query.type || testData.metadata?.type || type,
            skill: router.query.skill ? [{
              name: router.query.skill as string,
              proficiencyLevel: parseInt(router.query.proficiency as string) || 1
            }] : userSkills.map((skill: any) => ({
              name: skill.name,
              proficiencyLevel: parseInt(skill.proficiencyLevel) || 1
            })),
            subcategory: router.query.subcategory as string,
            questions: testData.results
          };

          console.log('Sending analysis request:', JSON.stringify(requestBody, null, 2));

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/analyze-profile-answers`, {
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
            } catch (parseError) {
              errorMessage = errorText || 'Failed to analyze results';
            }
            throw new Error(`Failed to analyze results: ${errorMessage}`);
          }

          const analysisData = await response.json();
          console.log('Analysis response:', JSON.stringify(analysisData, null, 2));

          // Ensure all fields that should be strings are strings
          if (analysisData.result?.analysis) {
            const analysis = analysisData.result.analysis;
            
            // Convert any object recommendations to strings
            if (Array.isArray(analysis.recommendations)) {
              analysis.recommendations = analysis.recommendations.map((rec: any) => {
                if (typeof rec === 'object') {
                  // If it's an object, stringify it or extract relevant text
                  return Object.values(rec).join(': ');
                }
                return rec;
              });
            }

            // Convert any object next steps to strings
            if (Array.isArray(analysis.nextSteps)) {
              analysis.nextSteps = analysis.nextSteps.map((step: any) => {
                if (typeof step === 'object') {
                  return Object.values(step).join(': ');
                }
                return step;
              });
            }

            // Ensure skill analysis fields are properly formatted
            if (Array.isArray(analysis.skillAnalysis)) {
              analysis.skillAnalysis = analysis.skillAnalysis.map((skill: any) => ({
                ...skill,
                strengths: Array.isArray(skill.strengths) ? skill.strengths.map((s: any) => 
                  typeof s === 'object' ? Object.values(s).join(': ') : s
                ) : [],
                weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses.map((w: any) => 
                  typeof w === 'object' ? Object.values(w).join(': ') : w
                ) : []
              }));
            }
          }

          setResults(analysisData.result);
        }
      } catch (e) {
        console.error('Error analyzing test results:', e);
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    analyzeResults();
  }, [router.query.from, router.query.type, router.query.skill, router.query.subcategory]);

  const goHome = () => router.push('/dashboardCandidate');

  if (loading || analyzing) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#00072D',
        gap: 3
      }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
        <Typography variant="h6" sx={{ 
          color: '#fff',
          textAlign: 'center',
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 }
          }
        }}>
          {analyzing ? 'Analyzing Your Results...' : 'Loading...'}
        </Typography>
        {analyzing && (
          <Box sx={{ 
            maxWidth: '300px',
            textAlign: 'center',
            mt: 2
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
            }}>
              We're processing your answers and generating a detailed analysis. This may take a moment.
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#00072D',
        color: '#fff',
        textAlign: 'center',
        p: 3
      }}>
        <Typography variant="h6" sx={{ color: '#FF6B6B', mb: 2 }}>
          Error Loading Results
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={goHome}
          sx={{
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
            }
          }}
        >
          Return Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 50%)
      `,
      py: 4
    }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={goHome}
          sx={{
            color: '#fff',
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
              color: '#fff',
              mb: 3,
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            {assessmentType === 'technical' ? 'Technical' : 'Soft Skills'} Assessment Results
          </Typography>

          {results ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Overall Performance
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
                  <Typography variant="h5" sx={{ color: '#fff' }}>
                    Score: {Number(results.analysis.overallScore).toFixed(2)}%
                  </Typography>
                  <Chip
                    label={results.analysis.technicalLevel}
                    sx={{
                      backgroundColor: 'rgba(2, 226, 255, 0.2)',
                      color: '#02E2FF',
                      ml: 'auto'
                    }}
                  />
                </Box>
                <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
                  {results.analysis.generalAssessment}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Skill Analysis
                </Typography>
                {results.analysis.skillAnalysis.map((skill, i) => (
                  <MotionBox
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#02E2FF' }}>
                          {skill.skillName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Current Level: {skill.currentExperienceLevel}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Demonstrated Level: {skill.demonstratedExperienceLevel}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ color: '#00FFC3', mb: 1 }}>Strengths:</Typography>
                          {skill.strengths.map((strength, j) => (
                            <Typography key={j} sx={{ color: '#fff', ml: 2 }}>• {strength}</Typography>
                          ))}
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ color: '#FF6B6B', mb: 1 }}>Areas for Improvement:</Typography>
                          {skill.weaknesses.map((weakness, j) => (
                            <Typography key={j} sx={{ color: '#fff', ml: 2 }}>• {weakness}</Typography>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </MotionBox>
                ))}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Recommendations
                </Typography>
                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
                  {results.analysis.recommendations.map((rec, i) => (
                    <Typography key={i} sx={{ color: '#fff', mb: 1 }}>• {rec}</Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Next Steps
                </Typography>
                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
                  {results.analysis.nextSteps.map((step, i) => (
                    <Typography key={i} sx={{ color: '#fff', mb: 1 }}>• {step}</Typography>
                  ))}
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#fff', textAlign: 'center' }}>
              No results available. Please complete the assessment first.
            </Typography>
          )}

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/dashboardCandidate')}
              startIcon={<PersonIcon />}
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
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
