// pages/report.tsx
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import Cookies from 'js-cookie';

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

// Add new styled component for feedback modal
const FeedbackModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'white',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: theme.spacing(2),
    padding: theme.spacing(3),
  },
}));

interface SkillAnalysis {
  skillName: string;
  currentProficiency: number;
  demonstratedProficiency: number;
  currentExperienceLevel: string;
  demonstratedExperienceLevel: string;
  demonstratedLevel: string;
  strengths: string[];
  weaknesses: string[];
  confidenceScore: number;
  improvement: string;
}

interface TechnicalData {
  track: string;
  techStack: Array<{
    title: string;
    componentType: string;
    choiceExplanation: string[];
    complexity: string;
    modernity: string;
    strengths: string[];
    weaknesses: string[];
    recommendation?: string;
    score: number;
  }>;
  architecture: {
    title: string;
    type: string;
    choiceExplanation: string[];
    strengths: string[];
    weaknesses: string[];
    recommendation?: string;
    score: number;
  };
  scalabilityApproach: {
    strategy: string;
    choiceExplanation: string[];
    strengths: string[];
    weaknesses: string[];
    recommendation?: string;
    score: number;
  };
  summary: string;
  overallScore: number;
}

interface AnalysisResult {
  timestamp?: string;
  assessmentType?: string;
  skillsAssessed?: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
  }>;
  analysis: {
    overallScore?: number;
    experienceLevels?: string[];
    skillAnalysis?: SkillAnalysis[];
    generalAssessment?: string;
    recommendations?: string[];
    technicalLevel?: string;
    nextSteps?: string[];
    technicalData?: TechnicalData;
  };
}

// Feedback Modal Component
interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
  onSkip: () => void;
}

const FeedbackModalComponent = ({ open, onClose, onSubmit, onSkip }: FeedbackModalProps) => {
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
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Check if all required fields are filled
      const requiredFields = ['overallExperience', 'easeOfUse', 'questionQuality', 'interfaceRating', 'evaluationRating'];
      const missingFields = requiredFields.filter(field => !feedback[field as keyof typeof feedback]);

      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(field => {
          switch (field) {
            case 'overallExperience': return 'Overall Experience';
            case 'easeOfUse': return 'Ease of Use';
            case 'questionQuality': return 'Question Quality';
            case 'interfaceRating': return 'Interface Rating';
            case 'evaluationRating': return 'Evaluation Rating';
            default: return field;
          }
        }).join(', ');

        setErrorMessage(`Please complete all required fields: ${missingFieldNames}`);
        return;
      }

      const token = localStorage.getItem('api_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Transform feedback data into the required format
      const feedbackData = {
        feedback: [
          feedback.overallExperience,
          feedback.easeOfUse,
          feedback.questionQuality,
          feedback.interfaceRating,
          feedback.evaluationRating
        ],
        comment: feedback.recommendation || ''
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}feedback/addFeedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to submit feedback';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || 'Failed to submit feedback';
        }
        throw new Error(errorMessage);
      }

      onSubmit(feedbackData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('An error occurred while submitting feedback. Please try again.');
    }
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  return (
    <>
      <FeedbackModal
        open={open}
        onClose={onClose}
      >
        <DialogTitle sx={{ color: '#000000', fontWeight: 600 }}>
          Help Us Improve
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Overall Experience */}
            <Box>
              <FormLabel sx={{ color: '#000000', mb: 1, display: 'block' }}>
                How would you rate your overall experience? *
              </FormLabel>
              <FormControl fullWidth required>
                <Select
                  value={feedback.overallExperience}
                  onChange={(e) => handleFeedbackChange('overallExperience', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Ease of Use */}
            <Box>
              <FormLabel sx={{ color: '#000000', mb: 1, display: 'block' }}>
                How easy was it to use our platform? *
              </FormLabel>
              <FormControl fullWidth required>
                <Select
                  value={feedback.easeOfUse}
                  onChange={(e) => handleFeedbackChange('easeOfUse', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Very Easy">Very Easy</MenuItem>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Difficult">Difficult</MenuItem>
                  <MenuItem value="Very Difficult">Very Difficult</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Question Quality */}
            <Box>
              <FormLabel sx={{ color: '#000000', mb: 1, display: 'block' }}>
                How would you rate the quality of the questions? *
              </FormLabel>
              <FormControl fullWidth required>
                <Select
                  value={feedback.questionQuality}
                  onChange={(e) => handleFeedbackChange('questionQuality', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Interface Rating */}
            <Box>
              <FormLabel sx={{ color: '#000000', mb: 1, display: 'block' }}>
                How would you rate the user interface? *
              </FormLabel>
              <FormControl fullWidth required>
                <Select
                  value={feedback.interfaceRating}
                  onChange={(e) => handleFeedbackChange('interfaceRating', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Evaluation Rating */}
            <Box>
              <FormLabel sx={{ color: '#000000', mb: 1, display: 'block' }}>
                How would you rate the evaluation results? *
              </FormLabel>
              <FormControl fullWidth required>
                <Select
                  value={feedback.evaluationRating}
                  onChange={(e) => handleFeedbackChange('evaluationRating', e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#02E2FF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>Select your rating</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Additional Comments */}
            <TextField
              label="Any additional comments or suggestions?"
              multiline
              rows={4}
              value={feedback.recommendation}
              onChange={(e) => handleFeedbackChange('recommendation', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#02E2FF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#02E2FF',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.7)',
                  '&.Mui-focused': {
                    color: '#02E2FF',
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            onClick={onSkip}
            sx={{
              background: 'rgba(0, 255, 157, 1)',
              color: '#fff',
              '&:hover': {
                background: 'rgba(0, 255, 157, 0.9)',
              },
            }}
          >
            Go To Dashboard
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: '#02E2FF',
                color: '#000000',
                '&:hover': {
                  background: 'rgba(2, 226, 255, 0.9)',
                },
              }}
            >
              Submit Feedback
            </Button>
          </Box>
        </DialogActions>
      </FeedbackModal>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{
            width: '100%',
            backgroundColor: '#FF6B6B',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default function hackathonreport() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentType, setAssessmentType] = useState<string>('technical');
  const hasRun = useRef(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [businessAlreadyAssessed, setBusinessAlreadyAssessed] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const previousPath = (router.query.from as string) || localStorage.getItem('previousPath');
    const type = (router.query.type as string) ||
      (previousPath?.includes('test') || previousPath?.includes('technical') ? 'technical' : 'soft-skills');

    setAssessmentType(type);

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
        // Always do Hackathon Project Analysis
        const projectId = router.query.projectId;
        const type = router.query.type;
        if (!projectId || !type) throw new Error('Missing projectId or assessment type');
        // Prepare questions array as array of {question, answer} objects
        let questions = [];
        if (Array.isArray(testData.results) && testData.results.length > 0) {
          if (testData.results[0].hasOwnProperty('question') && testData.results[0].hasOwnProperty('answer')) {
            questions = testData.results;
          } else {
            throw new Error('Results format invalid for project analysis');
          }
        } else {
          throw new Error('No results to analyze');
        }
        // Call the project/analyzeAnswers endpoint with questions as array of objects
        const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/analyzeAnswers/${projectId}/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ questions })
        });
        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          let errorMessage = 'Failed to analyze project answers';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || 'Failed to analyze project answers';
          }
          // Custom handling for business already assessed error
          if (errorMessage && errorMessage.toLowerCase().includes('business data already asssessed')) {
            setBusinessAlreadyAssessed(true);
            setError('Business evaluation for this project has already been submitted. You cannot submit another.');
            return;
          }
          throw new Error(`Failed to analyze project answers: ${errorMessage}`);
        }
        const analysisData = await projectResponse.json();
        setResults(analysisData.result || analysisData);
        return;
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
  }, [router.isReady, router.query.from, router.query.type, router.query.skill, router.query.subcategory, router.query.proficiency]);
  const goHome = () => router.push(`/hackathon/projects/${router.query.projectId}`);

  const handleFeedbackOpen = () => {
    setFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      console.log('Feedback submitted:', feedbackData);
      handleFeedbackClose();
      router.push(`/hackathon/projects/${router.query.projectId}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSkipFeedback = () => {
    handleFeedbackClose();
    router.push(`/hackathon/projects/${router.query.projectId}`);
  };

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
        <Typography variant="h6" sx={{
          color: '#000',
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
              color: '#000',
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

  let businessData: any = undefined;
  if (results?.analysis && typeof results.analysis === 'object' && 'businessData' in results.analysis) {
    businessData = (results.analysis as any).businessData;
  } else if (results && typeof results === 'object' && 'businessData' in results) {
    businessData = (results as any).businessData;
  } else if (results && typeof results === 'object' && 'assessment' in results && (results as any).assessment?.businessData) {
    businessData = (results as any).assessment.businessData;
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
          Back to Project Dashboard
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
              background: 'rgba(0, 255, 157, 1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
           Meeting Results
          </Typography>

          {results ? (
            <>
              {/* --- Technical Data Section --- */}
              {results && results.analysis && results.analysis.technicalData && (
                <Box sx={{ mb: 4, p: 3, border: '2px solid #02E2FF', borderRadius: 3, background: '#f7faff' }}>
                  <Typography variant="h5" sx={{ color: '#02E2FF', fontWeight: 700, mb: 2 }}>
                    Technical Analysis
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#000', mb: 1 }}>
                    Track: <b>{results.analysis.technicalData.track}</b>
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
                    Overall Score: <b>{results.analysis.technicalData.overallScore}</b>
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
                    Summary
                  </Typography>
                  <Typography sx={{ color: '#333', mb: 3 }}>{results.analysis.technicalData.summary}</Typography>

                  {/* Tech Stack */}
                  <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>
                    Technology Stack
                  </Typography>
                  {results.analysis.technicalData.techStack.map((tech: any, i: number) => (
                    <Box key={i} sx={{ mb: 2, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{tech.title} ({tech.componentType})</Typography>
                      <Typography>Complexity: {tech.complexity}</Typography>
                      <Typography>Modernity: {tech.modernity}</Typography>
                      <Typography>Score: {tech.score}</Typography>
                      <Typography>Choice Explanation: {tech.choiceExplanation?.join(', ') ?? ''}</Typography>
                      <Typography sx={{ color: 'green', mt: 1 }}>Strengths:</Typography>
                      <ul>
                        {(tech.strengths ?? []).map((s: string, j: number) => <li key={j}>{s}</li>)}
                      </ul>
                      <Typography sx={{ color: 'red', mt: 1 }}>Weaknesses:</Typography>
                      <ul>
                        {(tech.weaknesses ?? []).map((w: string, j: number) => <li key={j}>{w}</li>)}
                      </ul>
                      {tech.recommendation && (
                        <Typography sx={{ color: 'blue', mt: 1 }}>Recommendation: {tech.recommendation}</Typography>
                      )}
                    </Box>
                  ))}

                  {/* Architecture */}
                  <Typography variant="h6" sx={{ color: '#000', mt: 3, mb: 2 }}>
                    Architecture
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{results.analysis.technicalData.architecture.title} ({results.analysis.technicalData.architecture.type})</Typography>
                    <Typography>Choice Explanation: {results.analysis.technicalData.architecture.choiceExplanation?.join(', ') ?? ''}</Typography>
                    <Typography sx={{ color: 'green', mt: 1 }}>Strengths:</Typography>
                    <ul>
                      {(results.analysis.technicalData.architecture.strengths ?? []).map((s: string, j: number) => <li key={j}>{s}</li>)}
                    </ul>
                    <Typography sx={{ color: 'red', mt: 1 }}>Weaknesses:</Typography>
                    <ul>
                      {(results.analysis.technicalData.architecture.weaknesses ?? []).map((w: string, j: number) => <li key={j}>{w}</li>)}
                    </ul>
                    {results.analysis.technicalData.architecture.recommendation && (
                      <Typography sx={{ color: 'blue', mt: 1 }}>Recommendation: {results.analysis.technicalData.architecture.recommendation}</Typography>
                    )}
                    <Typography>Score: {results.analysis.technicalData.architecture.score}</Typography>
                  </Box>

                  {/* Scalability Approach */}
                  <Typography variant="h6" sx={{ color: '#000', mt: 3, mb: 2 }}>
                    Scalability Approach
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, background: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography>Strategy: {results.analysis.technicalData.scalabilityApproach.strategy}</Typography>
                    <Typography>Choice Explanation: {results.analysis.technicalData.scalabilityApproach.choiceExplanation?.join(', ') ?? ''}</Typography>
                    <Typography sx={{ color: 'green', mt: 1 }}>Strengths:</Typography>
                    <ul>
                      {(results.analysis.technicalData.scalabilityApproach.strengths ?? []).map((s: string, j: number) => <li key={j}>{s}</li>)}
                    </ul>
                    <Typography sx={{ color: 'red', mt: 1 }}>Weaknesses:</Typography>
                    <ul>
                      {(results.analysis.technicalData.scalabilityApproach.weaknesses ?? []).map((w: string, j: number) => <li key={j}>{w}</li>)}
                    </ul>
                    {results.analysis.technicalData.scalabilityApproach.recommendation && (
                      <Typography sx={{ color: 'blue', mt: 1 }}>Recommendation: {results.analysis.technicalData.scalabilityApproach.recommendation}</Typography>
                    )}
                    <Typography>Score: {results.analysis.technicalData.scalabilityApproach.score}</Typography>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#fff', textAlign: 'center' }}>
              No results available. Please complete the assessment first.
            </Typography>
          )}

          {assessmentType === 'business' && businessData && (
            <Box sx={{ mt: 4, p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 24px #FFD60022' }}>
              <Typography variant="h5" sx={{ color: '#7C4DFF', fontWeight: 900, mb: 2 }}>
                Business Evaluation
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Problem</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.problem}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Target Users</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.targetUsers?.join(', ')}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Added Values</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.addedValues?.join(', ')}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Business Model</Typography>
              <Typography sx={{ mb: 1 }}>Model: {businessData.businessModel?.model}</Typography>
              <Typography sx={{ mb: 1 }}>Explanation: {businessData.businessModel?.choiceExplanation?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Strengths: {businessData.businessModel?.strengths?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Weaknesses: {businessData.businessModel?.weaknesses?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Recommendations: {businessData.businessModel?.recommendation?.join(', ')}</Typography>
              <Typography sx={{ mb: 2 }}>Score: {businessData.businessModel?.score}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Competitors</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.competitors?.join(', ')}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Market Potential</Typography>
              <Typography sx={{ mb: 1 }}>Range: {businessData.marketPotential?.range}</Typography>
              <Typography sx={{ mb: 1 }}>Estimated Market Size: {businessData.marketPotential?.estimatedMarketSize}</Typography>
              <Typography sx={{ mb: 1 }}>Target Region: {businessData.marketPotential?.targetRegion}</Typography>
              <Typography sx={{ mb: 1 }}>Explanation: {businessData.marketPotential?.choiceExplanation?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Strengths: {businessData.marketPotential?.strengths?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Weaknesses: {businessData.marketPotential?.weaknesses?.join(', ')}</Typography>
              <Typography sx={{ mb: 1 }}>Recommendations: {businessData.marketPotential?.recommendation?.join(', ')}</Typography>
              <Typography sx={{ mb: 2 }}>Score: {businessData.marketPotential?.score}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Summary</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.summary}</Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Overall Score</Typography>
              <Typography sx={{ mb: 2 }}>{businessData.overallScore}</Typography>
            </Box>
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
              onClick={handleFeedbackOpen}
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
              Go to My Project Dashboard
            </Button>
          </Box>
        </MotionPaper>
      </Container>

      {/* Feedback Modal Component */}
      <FeedbackModalComponent
        open={feedbackOpen}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleSkipFeedback}
      />
    </Box>
  );
}
