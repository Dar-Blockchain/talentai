'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  styled,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
  demonstratedLevel?: string;
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

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
  onSkip: () => void;
}

const FeedbackModal = ({ open, onClose, onSubmit, onSkip }: FeedbackModalProps) => {
  const [feedback, setFeedback] = useState({
    overallExperience: '',
    easeOfUse: '',
    questionQuality: '',
    interfaceRating: '',
    evaluationRating: '',
    recommendation: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFeedbackChange = (field: string, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const required = ['overallExperience', 'easeOfUse', 'questionQuality', 'interfaceRating', 'evaluationRating'];
      const missing = required.filter(f => !feedback[f as keyof typeof feedback]);
      if (missing.length) {
        setErrorMessage('Please complete all required fields');
        return;
      }

      const token = localStorage.getItem('api_token');
      if (!token) throw new Error('No authentication token found');

      const feedbackData = {
        feedback: [
          feedback.overallExperience,
          feedback.easeOfUse,
          feedback.questionQuality,
          feedback.interfaceRating,
          feedback.evaluationRating,
        ],
        comment: feedback.recommendation || '',
      };

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}feedback/addFeedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(feedbackData),
      });
      if (!resp.ok) throw new Error('Failed to submit feedback');
      onSubmit(feedbackData);
    } catch (e) {
      setErrorMessage('An error occurred while submitting feedback. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ color: '#000', fontWeight: 600 }}>Help Us Improve</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box>
              <FormLabel sx={{ color: '#000', mb: 1, display: 'block' }}>How would you rate your overall experience? *</FormLabel>
              <FormControl fullWidth required>
                <Select value={feedback.overallExperience} onChange={(e) => handleFeedbackChange('overallExperience', e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormLabel sx={{ color: '#000', mb: 1, display: 'block' }}>How easy was it to use our platform? *</FormLabel>
              <FormControl fullWidth required>
                <Select value={feedback.easeOfUse} onChange={(e) => handleFeedbackChange('easeOfUse', e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Very Easy">Very Easy</MenuItem>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Difficult">Difficult</MenuItem>
                  <MenuItem value="Very Difficult">Very Difficult</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormLabel sx={{ color: '#000', mb: 1, display: 'block' }}>How would you rate the quality of the questions? *</FormLabel>
              <FormControl fullWidth required>
                <Select value={feedback.questionQuality} onChange={(e) => handleFeedbackChange('questionQuality', e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormLabel sx={{ color: '#000', mb: 1, display: 'block' }}>How would you rate the user interface? *</FormLabel>
              <FormControl fullWidth required>
                <Select value={feedback.interfaceRating} onChange={(e) => handleFeedbackChange('interfaceRating', e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormLabel sx={{ color: '#000', mb: 1, display: 'block' }}>How would you rate the evaluation results? *</FormLabel>
              <FormControl fullWidth required>
                <Select value={feedback.evaluationRating} onChange={(e) => handleFeedbackChange('evaluationRating', e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Any additional comments or suggestions?"
              multiline rows={4}
              value={feedback.recommendation}
              onChange={(e) => handleFeedbackChange('recommendation', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={onSkip} sx={{ background: 'rgba(0, 255, 157, 1)', color: '#fff' }}>Go To Dashboard</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSubmit} sx={{ background: '#02E2FF', color: '#000' }}>Submit Feedback</Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default function ReportInterview() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const hasRun = useRef(false);

  const goHome = () => router.push('/dashboardCandidate');

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

        const jobId = (router.query.postId as string) || (router.query.jobId as string);
        if (jobId) {
          const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/analyze-job-test-results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ jobId, questions: testData.results, testedSkills: testData.testedSkills })
          });
          if (!jobResponse.ok) {
            const errorText = await jobResponse.text();
            throw new Error(errorText || 'Failed to analyze results');
          }
          const analysisData = await jobResponse.json();
          setResults(analysisData.result);
        } else {
          // Fallback to profile-based analysis like report.tsx
          const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          if (!profileResponse.ok) throw new Error('Failed to fetch user profile');
          const profileData = await profileResponse.json();
          const userSkills = profileData?.skills || [];

          const requestBody = {
            type: testData.metadata?.type || 'interview',
            skill: userSkills.map((s: any) => ({ name: s.name, proficiencyLevel: parseInt(s.proficiencyLevel) || 1 })),
            questions: testData.results,
          };

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/analyze-profile-answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to analyze results');
          }
          const analysisData = await response.json();
          setResults(analysisData.result);
        }
      } catch (e) {
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
  }, [router.isReady, router.query.postId, router.query.jobId]);

  const handleFeedbackOpen = () => setFeedbackOpen(true);
  const handleFeedbackClose = () => setFeedbackOpen(false);
  const handleFeedbackSubmit = () => {
    handleFeedbackClose();
    router.push('/dashboardCandidate');
  };
  const handleSkipFeedback = () => {
    handleFeedbackClose();
    router.push('/dashboardCandidate');
  };

  if (loading || analyzing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 3 }}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
        <Typography variant="h6" sx={{ color: '#000' }}>
          {analyzing ? 'Analyzing Your Results...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper>
          <Typography variant="h5" color="error" gutterBottom>Error</Typography>
          <Typography variant="body1" sx={{ color: '#000' }}>{error}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={goHome} variant="contained" sx={{ mt: 3 }}>Return to Dashboard</Button>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBackIcon />} onClick={goHome} sx={{ color: '#000', mb: 2 }}>
          Back to Home
        </Button>

        <StyledPaper>
          <Typography variant="h4" sx={{ mb: 3, background: '#8310FF', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
            Interview Assessment Results
          </Typography>

          {results ? (
            <>
              <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
                <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>Overall Performance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <TrendingUpIcon sx={{ color: '#02E2FF' }} />
                  <Typography variant="h5" sx={{ color: '#000' }}>
                    Score: {Number(results.analysis.overallScore).toFixed(2)}%
                  </Typography>
                  <Chip label={results.analysis.technicalLevel} sx={{ backgroundColor: 'rgba(2, 226, 255, 0.2)', color: '#02E2FF', ml: 'auto' }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#000', mb: 2 }}>
                  {results.analysis.generalAssessment}
                </Typography>
              </Box>

              <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
                <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>Skill Analysis</Typography>
                {results.analysis.skillAnalysis.map((skill, i) => (
                  <TranscriptSection key={i}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: 'white' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#8310FF' }}>{skill.skillName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#000' }}>
                            Level: {(() => {
                              const level = skill.demonstratedExperienceLevel || skill.demonstratedLevel;
                              if (!level) return 'N/A';
                              const num = Number(level);
                              switch (num) {
                                case 1: return 'Entry Level';
                                case 2: return 'Junior';
                                case 3: return 'Mid Level';
                                case 4: return 'Senior';
                                case 5: return 'Expert';
                                default: return String(level);
                              }
                            })()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ color: '#00FFC3', mb: 1 }}>Strengths:</Typography>
                          {skill.strengths.map((s, j) => (
                            <Typography key={j} sx={{ color: '#000', ml: 2 }}>• {s}</Typography>
                          ))}
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ color: '#FF6B6B', mb: 1 }}>Areas for Improvement:</Typography>
                          {skill.weaknesses.map((w, j) => (
                            <Typography key={j} sx={{ color: '#000', ml: 2 }}>• {w}</Typography>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </TranscriptSection>
                ))}
              </Box>

              <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
                <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>Recommendations</Typography>
                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
                  {results.analysis.recommendations.map((rec, i) => (
                    <Typography key={i} sx={{ color: '#000', mb: 1 }}>• {rec}</Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 4, padding: '10px', border: '1px solid black' }}>
                <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>Next Steps</Typography>
                <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2 }}>
                  {results.analysis.nextSteps.map((step, i) => (
                    <Typography key={i} sx={{ color: '#000', mb: 1 }}>• {step}</Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pt: 4, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Button variant="contained" size="large" onClick={handleFeedbackOpen} startIcon={<PersonIcon />} sx={{ background: '#8310FF', color: '#fff', px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 500 }}>
                  Go to My Dashboard
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#000', textAlign: 'center' }}>
              No results available. Please complete the assessment first.
            </Typography>
          )}
        </StyledPaper>

        <FeedbackModal open={feedbackOpen} onClose={handleFeedbackClose} onSubmit={handleFeedbackSubmit} onSkip={handleSkipFeedback} />
      </Container>
    </Box>
  );
}


