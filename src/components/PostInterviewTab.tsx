import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Feedback as FeedbackIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface PostInterviewData {
  _id: string;
  post?: {
    jobDetails?: {
      title: string;
    };
    company?: string;
  };
  overallScore?: number;
  recommendations?: string[];
  createdAt?: string;
  updatedAt?: string;
  type: string;
  skillDetails?: Array<{
    name: string;
    proficiencyLevel: string;
    confidenceScore: number;
  }>;
}

interface PostInterviewTabProps {
  data: PostInterviewData[];
  loading: boolean;
  error: string | null;
}

interface CandidateProgress {
  _id: string;
  idCandidate: {
    _id: string;
    username: string;
    email: string;
    FirstName?: string;
    LastName?: string;
    role?: string;
    Localisation?: string;
    lastLogin?: string;
  };
  idPost: {
    _id: string;
    jobDetails: {
      title: string;
      description?: string;
      location?: string;
      employmentType?: string;
      experienceLevel?: string;
      salary?: {
        min: number;
        max: number;
        currency: string;
      };
      status?: string;
    };
    status?: string;
    skillAnalysis?: {
      skillSummary?: {
        mainTechnologies?: string[];
        stackComplexity?: string;
      };
    };
  };
  currentStep: {
    _id: string;
    status?: string;
    data: {
      label: string;
      type: string;
      subtitle?: string;
      config?: {
        nodeNumber: number;
        title?: string;
        configured?: boolean;
      };
    };
  };
  steps: Array<{
    stepId: {
      _id: string;
      status?: string;
      data: {
        label: string;
        type: string;
        subtitle?: string;
        config?: {
          nodeNumber: number;
          title?: string;
          configured?: boolean;
        };
      };
    };
    status: string;
    completedAt?: string;
    _id: string;
    score?: number;
    results?: string;
    feedback?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// CSS Animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const PostInterviewTab: React.FC<PostInterviewTabProps> = ({ data, loading, error }) => {
  const router = useRouter();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<PostInterviewData | null>(null);
  const [feedback, setFeedback] = useState({
    overallExperience: '',
    easeOfUse: '',
    questionQuality: '',
    interfaceRating: '',
    evaluationRating: '',
    recommendation: '',
  });

  // New state for candidate progress
  const [candidateProgress, setCandidateProgress] = useState<CandidateProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  

  // Fetch candidate progress data
  const fetchCandidateProgress = async () => {
    try {
      setProgressLoading(true);
      setProgressError(null);
      
      const token = localStorage.getItem('api_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
      const apiUrl = `${apiBaseUrl}candidate-progress/getUserProgress`;
      console.log('Fetching from:', apiUrl);
      console.log('Token exists:', !!token);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error response, but handle cases where it might not be JSON
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON, using status text');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        // Handle both single object and array responses
        const progressData = Array.isArray(result.data) ? result.data : [result.data];
        setCandidateProgress(progressData);
        console.log('Candidate Progress Data:', progressData);
      } else {
        // Check if it's a "no progress found" error (which is not a real error)
        if (result.message && result.message.includes('Progrès non trouvé')) {
          // This is not an error - just no progress data yet
          console.log('No progress data found - this is normal for new users');
          setCandidateProgress([]);
          setProgressError(null);
        } else {
          throw new Error(result.message || 'Failed to fetch progress data');
        }
      }
    } catch (error) {
      console.error('Error fetching candidate progress:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setProgressError('Request timed out. Please try again.');
        } else if (error.message.includes('Progrès non trouvé')) {
          // This is not a real error - just no data
          setProgressError(null);
          setCandidateProgress([]);
        } else {
          setProgressError(error.message);
        }
      } else {
        setProgressError('An unexpected error occurred');
      }
    } finally {
      setProgressLoading(false);
    }
  };

  // Fetch progress on component mount
  useEffect(() => {
    fetchCandidateProgress();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('PostInterviewTab - Props data:', data);
    console.log('PostInterviewTab - Candidate progress:', candidateProgress);
    console.log('PostInterviewTab - Progress loading:', progressLoading);
    console.log('PostInterviewTab - Progress error:', progressError);
  }, [data, candidateProgress, progressLoading, progressError]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 70) return '#2196f3';
    if (score >= 60) return '#ff9800';
    if (score >= 50) return '#f44336';
    return '#9e9e9e';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Loading post interview data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

    // Check if we have any data (either post interview data or candidate progress)
  const hasAnyData = data.length > 0 || candidateProgress.length > 0;
  
  if (!hasAnyData && !progressLoading) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px dashed #dee2e6',
        }}
      >
        <AssessmentIcon sx={{ fontSize: 64, color: '#dee2e6', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {progressLoading ? 'Loading your data...' : 'No interview data or application progress available yet.'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/candidate/dashboard')}
          sx={{
            backgroundColor: '#02E2FF',
            color: 'white',
            '&:hover': {
              backgroundColor: '#02C2E0',
            },
          }}
        >
          Browse Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Post Interview Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Review your interview performance, feedback, and next steps
        </Typography>
      </Box>

                           {/* Summary Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {data.length + candidateProgress.length}
                    </Typography>
                    <Typography variant="body2">Total Applications</Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {data.filter(item => item.overallScore && item.overallScore >= 70).length}
                    </Typography>
                    <Typography variant="body2">Passed Interviews</Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {candidateProgress.length}
                    </Typography>
                    <Typography variant="body2">Active Applications</Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {data.filter(item => item.recommendations && item.recommendations.length > 0).length}
                    </Typography>
                    <Typography variant="body2">With Feedback</Typography>
                  </Box>
                  <FeedbackIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

      {/* Candidate Progress Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
          My Application Progress
        </Typography>
        
        {progressLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary" textAlign="center">
                Loading your progress data...
              </Typography>
            </Box>
          </Box>
        ) : progressError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {progressError}
            <Button 
              size="small" 
              onClick={fetchCandidateProgress}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        ) : candidateProgress.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px dashed #dee2e6' 
          }}>
            <AssignmentIcon sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Progress Data Available
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Your application progress will appear here once you start applying to positions.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/candidate/dashboard')}
              sx={{
                backgroundColor: '#02E2FF',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#02C2E0',
                },
              }}
            >
              Browse Jobs
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {candidateProgress.map((progress) => (
              <Accordion key={progress._id} sx={{ 
                border: '1px solid #e0e0e0',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: '8px 0' }
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: '#f8f9fa',
                    '&:hover': { backgroundColor: '#e9ecef' }
                  }}
                >
                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                       <Box sx={{ flex: 1 }}>
                         <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                           {progress.idPost?.jobDetails?.title || 'Unknown Position'}
                         </Typography>
                         <Typography variant="body2" color="textSecondary">
                           {progress.idPost?.jobDetails?.location || 'Location not specified'} • {progress.idPost?.jobDetails?.employmentType || 'Employment type not specified'}
                         </Typography>
                         <Typography variant="caption" color="textSecondary">
                           {progress.idPost?.jobDetails?.experienceLevel || 'Experience level not specified'} • {progress.idPost?.status || 'Status not specified'}
                         </Typography>
                       </Box>
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       {/* Progress Indicator */}
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                         <Box sx={{ 
                           width: 60, 
                           height: 60, 
                           borderRadius: '50%', 
                           border: '3px solid #e9ecef',
                           position: 'relative',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           backgroundColor: '#f8f9fa'
                         }}>
                           <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                             {progress.steps ? Math.round((progress.steps.filter(step => step.status === 'done').length / progress.steps.length) * 100) : 0}%
                           </Typography>
                           <Box sx={{
                             position: 'absolute',
                             top: 0,
                             left: 0,
                             right: 0,
                             bottom: 0,
                             borderRadius: '50%',
                                                           background: `conic-gradient(#02E2FF ${progress.steps ? (progress.steps.filter(step => step.status === 'done').length / progress.steps.length) * 360 : 0}deg, #e9ecef 0deg)`,
                             mask: 'radial-gradient(transparent 55%, black 55%)',
                             WebkitMask: 'radial-gradient(transparent 55%, black 55%)'
                           }} />
                         </Box>
                       </Box>
                       
                       <Chip
                         label={`Step ${progress.currentStep?.data?.config?.nodeNumber || 'N/A'}`}
                         size="small"
                         sx={{
                           backgroundColor: '#02E2FF20',
                           color: '#02E2FF',
                           fontWeight: 500,
                         }}
                       />
                       <Chip
                         label={progress.currentStep?.data?.type || 'Unknown'}
                         size="small"
                         sx={{
                           backgroundColor: '#8310FF20',
                           color: '#8310FF',
                           fontWeight: 500,
                         }}
                       />
                     </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2 }}>
                                         {/* Candidate Info */}
                     <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                         Candidate Information
                       </Typography>
                                               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Name:</strong> {progress.idCandidate?.FirstName || 'N/A'} {progress.idCandidate?.LastName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Username:</strong> {progress.idCandidate?.username || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Email:</strong> {progress.idCandidate?.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Role:</strong> {progress.idCandidate?.role || 'N/A'}
                          </Typography>
                          {progress.idCandidate?.Localisation && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Location:</strong> {progress.idCandidate.Localisation}
                            </Typography>
                          )}
                          {progress.idCandidate?.lastLogin && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Last Login:</strong> {new Date(progress.idCandidate.lastLogin).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                     </Box>

                     {/* Current Step Info */}
                     <Box sx={{ mb: 3 }}>
                       <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                         Current Step: {progress.currentStep?.data?.label || 'Unknown Step'}
                       </Typography>
                       <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                         Type: {progress.currentStep?.data?.type || 'Unknown Type'}
                       </Typography>
                       {progress.currentStep?.data?.subtitle && (
                         <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                           Subtitle: {progress.currentStep.data.subtitle}
                         </Typography>
                       )}
                      
                                            {/* Overall Application Progress */}
                      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 2, border: '1px solid #b3d9ff' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#0066cc' }}>
                          Overall Application Progress
                        </Typography>
                        
                        {/* Progress Bar */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              Application Progress
                            </Typography>
                                                         <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                               {progress.steps?.filter(step => step.status === 'done').length || 0} / {progress.steps?.length || 0} completed
                             </Typography>
                           </Box>
                           <LinearProgress
                             variant="determinate"
                             value={progress.steps ? (progress.steps.filter(step => step.status === 'done').length / progress.steps.length) * 100 : 0}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: '#e9ecef',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#02E2FF',
                                borderRadius: 6,
                                background: 'linear-gradient(90deg, #02E2FF 0%, #00B8D4 100%)',
                              },
                            }}
                          />
                                                     <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                             {progress.steps ? Math.round((progress.steps.filter(step => step.status === 'done').length / progress.steps.length) * 100) : 0}% Complete
                           </Typography>
                        </Box>

                        {/* Progress Stats */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#02E2FF' }}>
                              {progress.steps?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Total Steps
                            </Typography>
                          </Box>
                                                     <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                             <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                               {progress.steps?.filter(step => step.status === 'done').length || 0}
                             </Typography>
                             <Typography variant="caption" color="textSecondary">
                               Completed
                             </Typography>
                           </Box>
                          <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                              {progress.steps?.filter(step => step.status === 'pending').length || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Pending
                            </Typography>
                          </Box>
                                                     <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                             <Typography variant="h6" sx={{ fontWeight: 700, color: '#9e9e9e' }}>
                               {progress.steps?.filter(step => step.status === 'inProgress').length || 0}
                             </Typography>
                             <Typography variant="caption" color="textSecondary">
                               In Progress
                             </Typography>
                           </Box>
                        </Box>
                      </Box>

                      {/* Current Step Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Current Step Progress
                          </Typography>
                        </Box>
                                                 <LinearProgress
                           variant="determinate"
                           value={progress.currentStep?.status === 'done' ? 100 : progress.currentStep?.status === 'inProgress' ? 50 : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e9ecef',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progress.currentStep?.status === 'completed' ? '#4caf50' : '#ff9800',
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Status: {progress.currentStep?.status || 'Not Started'}
                        </Typography>
                      </Box>
                    </Box>

                                                               {/* Steps Breakdown */}
                      {progress.steps && progress.steps.length > 0 && (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                              Application Steps
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                             <Box sx={{ 
                                 width: 32, 
                                 height: 32, 
                                 borderRadius: '50%', 
                                 backgroundColor: '#02E2FF',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 color: 'white',
                                 fontSize: '0.75rem',
                                 fontWeight: 600
                               }}>
                                 {progress.steps?.filter(step => step.status === 'done').length || 0}
                               </Box>
                              <Typography variant="body2" color="textSecondary">
                                of {progress.steps?.length || 0} completed
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Steps Timeline */}
                          <Box sx={{ position: 'relative' }}>
                            {/* Vertical Timeline Line */}
                            <Box sx={{
                              position: 'absolute',
                              left: 24,
                              top: 0,
                              bottom: 0,
                              width: 2,
                              backgroundColor: '#e0e0e0',
                              zIndex: 1
                            }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {progress.steps
                                .sort((a, b) => (a.stepId?.data?.config?.nodeNumber || 0) - (b.stepId?.data?.config?.nodeNumber || 0))
                                .map((step, index) => (
                                                                     <Box key={step.stepId?._id || index} sx={{ 
                                     position: 'relative', 
                                     zIndex: 2,
                                     animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`
                                   }}>
                                     {/* Step Timeline Item */}
                                     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                      {/* Step Number Circle */}
                                      <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                                                                 backgroundColor: step.status === 'done' ? '#4caf50' : 
                                                        step.status === 'inProgress' ? '#ff9800' : '#e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        border: '3px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        zIndex: 3
                                      }}>
                                                                                 {step.status === 'done' ? (
                                           <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
                                         ) : (
                                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {index + 1}
                                          </Typography>
                                        )}
                                      </Box>
                                      
                                      {/* Step Content */}
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                                 <Card sx={{ 
                                           p: 3, 
                                           border: step.status === 'done' ? '2px solid #4caf50' : 
                                                  step.status === 'inProgress' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                                           backgroundColor: step.status === 'done' ? '#f8fff8' : 
                                                         step.status === 'inProgress' ? '#fff8e1' : '#ffffff',
                                           boxShadow: step.status === 'done' ? '0 4px 20px rgba(76, 175, 80, 0.15)' :
                                                     step.status === 'inProgress' ? '0 4px 20px rgba(255, 152, 0, 0.15)' :
                                                     '0 2px 8px rgba(0,0,0,0.08)',
                                          transition: 'all 0.3s ease',
                                                                                     '&:hover': {
                                             transform: 'translateY(-2px)',
                                             boxShadow: step.status === 'done' ? '0 8px 30px rgba(76, 175, 80, 0.25)' :
                                                       step.status === 'inProgress' ? '0 8px 30px rgba(255, 152, 0, 0.25)' :
                                                       '0 4px 15px rgba(0,0,0,0.12)',
                                           }
                                        }}>
                                          {/* Step Header */}
                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Box>
                                                                                             <Typography variant="h6" sx={{ 
                                                 fontWeight: 600, 
                                                 color: step.status === 'done' ? '#2e7d32' : 
                                                        step.status === 'inProgress' ? '#f57c00' : '#333',
                                                 mb: 0.5
                                               }}>
                                                {step.stepId?.data?.label || `Step ${index + 1}`}
                                              </Typography>
                                              <Typography variant="body2" color="textSecondary">
                                                {step.stepId?.data?.type || 'Unknown Type'}
                                              </Typography>
                                            </Box>
                                            
                                            {/* Status Badge */}
                                                                                         <Chip
                                               label={step.status === 'done' ? 'Completed' : 
                                                      step.status === 'inProgress' ? 'In Progress' : 'Pending'}
                                               size="small"
                                               sx={{
                                                 backgroundColor: step.status === 'done' ? '#4caf5020' : 
                                                                step.status === 'inProgress' ? '#ff980020' : '#9e9e9e20',
                                                 color: step.status === 'done' ? '#2e7d32' : 
                                                        step.status === 'inProgress' ? '#f57c00' : '#757575',
                                                 fontWeight: 600,
                                                 textTransform: 'capitalize'
                                               }}
                                             />
                                          </Box>
                                          
                                          {/* Step Progress Bar */}
                                          <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                                                Progress
                                              </Typography>
                                                                                             <Typography variant="caption" sx={{ 
                                                 fontWeight: 600,
                                                 color: step.status === 'done' ? '#2e7d32' : 
                                                        step.status === 'inProgress' ? '#f57c00' : '#757575'
                                               }}>
                                                 {step.status === 'done' ? '100%' : 
                                                    step.status === 'inProgress' ? '50%' : '0%'}
                                               </Typography>
                                            </Box>
                                                                                         <LinearProgress
                                               variant="determinate"
                                               value={step.status === 'done' ? 100 : step.status === 'inProgress' ? 50 : 0}
                                              sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#e9ecef',
                                                                                                 '& .MuiLinearProgress-bar': {
                                                   backgroundColor: step.status === 'done' ? '#4caf50' : 
                                                                step.status === 'inProgress' ? '#ff9800' : '#9e9e9e',
                                                   borderRadius: 4,
                                                   background: step.status === 'done' ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)' :
                                                              step.status === 'inProgress' ? 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)' :
                                                              'linear-gradient(90deg, #9e9e9e 0%, #757575 100%)',
                                                 },
                                              }}
                                            />
                                          </Box>

                                                                                     {/* Step Results - Show for completed steps */}
                                           {step.status === 'done' && (
                                            <Box sx={{ 
                                              mt: 2, 
                                              p: 2, 
                                              backgroundColor: '#e8f5e8', 
                                              borderRadius: 2, 
                                              border: '1px solid #c8e6c9',
                                              position: 'relative',
                                              overflow: 'hidden'
                                            }}>
                                              <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: 0,
                                                height: 0,
                                                borderStyle: 'solid',
                                                borderWidth: '0 20px 20px 0',
                                                borderColor: 'transparent #4caf50 transparent transparent'
                                              }} />
                                              <Typography variant="subtitle2" sx={{ 
                                                fontWeight: 600, 
                                                color: '#2e7d32', 
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                              }}>
                                                <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                                                Step Completed Successfully
                                              </Typography>
                                              
                                              {/* Step Score if available */}
                                              {step.score !== undefined && (
                                                <Box sx={{ 
                                                  display: 'flex', 
                                                  alignItems: 'center', 
                                                  gap: 2, 
                                                  mb: 2,
                                                  p: 1.5,
                                                  backgroundColor: 'white',
                                                  borderRadius: 1,
                                                  border: '1px solid #c8e6c9'
                                                }}>
                                                  <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#4caf50',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem'
                                                  }}>
                                                    {step.score}%
                                                  </Box>
                                                  <Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                      Final Score
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                                      {step.score >= 80 ? 'Excellent' : 
                                                       step.score >= 70 ? 'Good' : 
                                                       step.score >= 60 ? 'Average' : 'Below Average'}
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                              )}
                                              
                                              {/* Step Results/Feedback if available */}
                                              {step.results && (
                                                <Box sx={{ mt: 2 }}>
                                                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, display: 'block', mb: 1 }}>
                                                    📊 Results Summary
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ color: '#2e7d32', lineHeight: 1.5 }}>
                                                    {step.results}
                                                  </Typography>
                                                </Box>
                                              )}
                                              
                                              {/* Step Feedback if available */}
                                              {step.feedback && (
                                                <Box sx={{ mt: 2 }}>
                                                  <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, display: 'block', mb: 1 }}>
                                                    💬 Feedback
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ color: '#2e7d32', lineHeight: 1.5 }}>
                                                    {step.feedback}
                                                  </Typography>
                                                </Box>
                                              )}
                                              
                                              {/* Completion Time */}
                                              <Box sx={{ 
                                                mt: 2, 
                                                pt: 2, 
                                                borderTop: '1px solid #c8e6c9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                              }}>
                                                <ScheduleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                                <Typography variant="caption" color="textSecondary">
                                                  Completed: {step.completedAt ? new Date(step.completedAt).toLocaleString() : 'N/A'}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          )}

                                                                                     {/* Step Details for In Progress */}
                                           {step.status === 'inProgress' && (
                                            <Box sx={{ 
                                              mt: 2, 
                                              p: 2, 
                                              backgroundColor: '#fff8e1', 
                                              borderRadius: 2, 
                                              border: '1px solid #ffcc02',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 2
                                            }}>
                                              <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: '#ff9800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                animation: 'pulse 2s infinite'
                                              }}>
                                                <TimelineIcon sx={{ fontSize: 20 }} />
                                              </Box>
                                              <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00', mb: 0.5 }}>
                                                  🔄 Step in Progress
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                  This step is currently being processed...
                                                </Typography>
                                              </Box>
                                            </Box>
                                          )}

                                          {/* Step Details for Pending */}
                                          {step.status === 'pending' && (
                                            <Box sx={{ 
                                              mt: 2, 
                                              p: 2, 
                                              backgroundColor: '#f5f5f5', 
                                              borderRadius: 2, 
                                              border: '1px solid #e0e0e0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 2
                                            }}>
                                              <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: '#9e9e9e',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                              }}>
                                                <ScheduleIcon sx={{ fontSize: 20 }} />
                                              </Box>
                                              <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#757575', mb: 0.5 }}>
                                                  ⏳ Step Pending
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                  Waiting to start this step...
                                                </Typography>
                                              </Box>
                                            </Box>
                                          )}
                                        </Card>
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                            </Box>
                          </Box>
                        </Box>
                      )}

                                                               {/* Skill Analysis Information */}
                      {progress.idPost?.skillAnalysis && (
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1565c0' }}>
                            Skill Analysis
                          </Typography>
                          {progress.idPost.skillAnalysis.skillSummary && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                <strong>Stack Complexity:</strong> {progress.idPost.skillAnalysis.skillSummary.stackComplexity || 'N/A'}
                              </Typography>
                              {progress.idPost.skillAnalysis.skillSummary.mainTechnologies && (
                                <Box>
                                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                    <strong>Main Technologies:</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {progress.idPost.skillAnalysis.skillSummary.mainTechnologies.map((tech, index) => (
                                      <Chip
                                        key={index}
                                        label={tech}
                                        size="small"
                                        sx={{
                                          backgroundColor: '#1976d2',
                                          color: 'white',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Debug Information */}
                      <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#856404' }}>
                          Debug Information
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#856404', fontFamily: 'monospace' }}>
                          <strong>Current Step Status:</strong> {progress.currentStep?.status || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#856404', fontFamily: 'monospace' }}>
                          <strong>Total Steps:</strong> {progress.steps?.length || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#856404', fontFamily: 'monospace' }}>
                          <strong>Job Status:</strong> {progress.idPost?.status || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#856404', fontFamily: 'monospace' }}>
                          <strong>Created:</strong> {new Date(progress.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                     {/* Action Buttons */}
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                       <Button
                         variant="outlined"
                         size="small"
                         startIcon={<VisibilityIcon />}
                         onClick={() => router.push(`/candidate/interview/${progress._id}`)}
                         sx={{
                           borderColor: '#02E2FF',
                           color: '#02E2FF',
                           textTransform: 'none',
                           fontWeight: 500,
                         }}
                       >
                         View Details
                       </Button>
                                               <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => {
                                                         // Find the next pending step or current step
                             const nextStep = progress.steps?.find(step => step.status === 'pending') || 
                                            progress.steps?.find(step => step.status === 'inProgress');
                            
                            if (nextStep) {
                              // Navigate with step ID from steps
                              router.push(`/interview-post/${progress.idPost?._id}?stepId=${nextStep.stepId?._id || nextStep._id}`);
                            } else if (progress.currentStep) {
                              // Use current step ID
                              router.push(`/interview-post/${progress.idPost?._id}?stepId=${progress.currentStep._id}`);
                            } else {
                              // Fallback to just the post ID
                              router.push(`/interview-post/${progress.idPost?._id}`);
                            }
                          }}
                          sx={{
                            backgroundColor: '#02E2FF',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: '#02C2E0',
                            },
                          }}
                        >
                          Continue Application
                        </Button>
                     </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      {/* Interview List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.map((interview) => (
          <Card key={interview._id} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
          }}>
            <CardContent>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                 <Box sx={{ flex: 1 }}>
                   <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                     {interview.post?.jobDetails?.title || 'Unknown Position'}
                   </Typography>
                   
                   {/* Interview Progress Bar */}
                   <Box sx={{ mb: 2 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                       <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                         Interview Progress
                       </Typography>
                       <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                         {interview.type === 'HR Interview 1' && interview.overallScore ? '100% Complete' : 'In Progress'}
                       </Typography>
                     </Box>
                     <LinearProgress
                       variant="determinate"
                       value={interview.type === 'HR Interview 1' && interview.overallScore ? 100 : 0}
                       sx={{
                         height: 8,
                         borderRadius: 4,
                         backgroundColor: '#e9ecef',
                         '& .MuiLinearProgress-bar': {
                           backgroundColor: interview.type === 'HR Interview 1' && interview.overallScore ? '#4caf50' : '#02E2FF',
                           borderRadius: 4,
                           background: interview.type === 'HR Interview 1' && interview.overallScore 
                             ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                             : 'linear-gradient(90deg, #02E2FF 0%, #00B8D4 100%)',
                         },
                       }}
                     />
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                       <Typography variant="caption" color="textSecondary">
                         Status: {interview.type === 'HR Interview 1' && interview.overallScore ? 'Completed' : 'In Progress'}
                       </Typography>
                       {interview.type === 'HR Interview 1' && interview.overallScore && (
                         <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                           ✅ Interview Done
                         </Typography>
                       )}
                     </Box>
                   </Box>
                   
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                     <Chip
                       label={interview.type || "Post Interview"}
                       size="small"
                       sx={{
                         backgroundColor: interview.type === 'HR Interview 1' && interview.overallScore 
                           ? '#4caf5020' 
                           : '#02E2FF20',
                         color: interview.type === 'HR Interview 1' && interview.overallScore 
                           ? '#4caf50' 
                           : '#02E2FF',
                         fontWeight: 500,
                       }}
                     />
                     {interview.post?.company && (
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                         <BusinessIcon sx={{ fontSize: 16, color: '#666' }} />
                         <Typography variant="body2" color="textSecondary">
                           {interview.post.company}
                         </Typography>
                       </Box>
                     )}
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                       <ScheduleIcon sx={{ fontSize: 16, color: '#666' }} />
                       <Typography variant="body2" color="textSecondary">
                         {interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'N/A'}
                       </Typography>
                     </Box>
                     {interview.updatedAt && (
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                         <TimelineIcon sx={{ fontSize: 16, color: '#666' }} />
                         <Typography variant="body2" color="textSecondary">
                           Updated: {new Date(interview.updatedAt).toLocaleDateString()}
                         </Typography>
                       </Box>
                     )}
                   </Box>
                 </Box>
                
                <Box sx={{ textAlign: 'right', ml: 2 }}>
                  {interview.overallScore !== null && interview.overallScore !== undefined ? (
                    <Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: getScoreColor(interview.overallScore),
                        mb: 0.5 
                      }}>
                        {interview.overallScore}%
                      </Typography>
                      <Chip
                        label={getScoreLabel(interview.overallScore)}
                        size="small"
                        sx={{
                          backgroundColor: `${getScoreColor(interview.overallScore)}20`,
                          color: getScoreColor(interview.overallScore),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  ) : (
                    <Chip label="Pending" size="small" color="default" />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

                             {/* Skills Analysis */}
               {interview.skillDetails && interview.skillDetails.length > 0 && (
                 <Box sx={{ mb: 2 }}>
                   <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
                     Skills Assessment
                   </Typography>
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                     {interview.skillDetails.slice(0, 4).map((skill, index) => (
                       <Box key={index} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                         <Box sx={{ 
                           p: 1.5, 
                           backgroundColor: '#f8f9fa', 
                           borderRadius: 1,
                           border: '1px solid #e9ecef'
                         }}>
                           <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                             {skill.name}
                           </Typography>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Typography variant="caption" color="textSecondary">
                               {skill.proficiencyLevel}
                             </Typography>
                             <Box sx={{ flex: 1 }}>
                               <LinearProgress
                                 variant="determinate"
                                 value={skill.confidenceScore}
                                 sx={{
                                   height: 4,
                                   borderRadius: 2,
                                   backgroundColor: '#e9ecef',
                                   '& .MuiLinearProgress-bar': {
                                     backgroundColor: getScoreColor(skill.confidenceScore),
                                   },
                                 }}
                               />
                             </Box>
                           </Box>
                         </Box>
                       </Box>
                     ))}
                   </Box>
                 </Box>
               )}

              {/* Recommendations */}
              {interview.recommendations && interview.recommendations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
                    Key Recommendations
                  </Typography>
                  <List dense>
                    {interview.recommendations.map((rec, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={rec}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'textSecondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => router.push(`/candidate/interview/${interview._id}`)}
                    sx={{
                      borderColor: '#02E2FF',
                      color: '#02E2FF',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#02E2FF',
                        backgroundColor: '#02E2FF10',
                      },
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FeedbackIcon />}
                    onClick={() => {
                      setSelectedInterview(interview);
                      setFeedbackDialogOpen(true);
                    }}
                    sx={{
                      borderColor: '#8310FF',
                      color: '#8310FF',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#8310FF',
                        backgroundColor: '#8310FF10',
                      },
                    }}
                  >
                    Provide Feedback
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialogOpen} 
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FeedbackIcon sx={{ color: '#02E2FF' }} />
            <Typography variant="h6">Interview Feedback</Typography>
          </Box>
        </DialogTitle>
                 <DialogContent sx={{ pt: 3 }}>
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
               <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                 <FormControl fullWidth required>
                   <InputLabel>Overall Experience</InputLabel>
                   <Select
                     value={feedback.overallExperience}
                     onChange={(e) => setFeedback(prev => ({ ...prev, overallExperience: e.target.value }))}
                     label="Overall Experience"
                   >
                     <MenuItem value="Excellent">Excellent</MenuItem>
                     <MenuItem value="Very Good">Very Good</MenuItem>
                     <MenuItem value="Good">Good</MenuItem>
                     <MenuItem value="Fair">Fair</MenuItem>
                     <MenuItem value="Poor">Poor</MenuItem>
                   </Select>
                 </FormControl>
               </Box>
               <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                 <FormControl fullWidth required>
                   <InputLabel>Ease of Use</InputLabel>
                   <Select
                     value={feedback.easeOfUse}
                     onChange={(e) => setFeedback(prev => ({ ...prev, easeOfUse: e.target.value }))}
                     label="Ease of Use"
                   >
                     <MenuItem value="Excellent">Excellent</MenuItem>
                     <MenuItem value="Very Good">Very Good</MenuItem>
                     <MenuItem value="Good">Good</MenuItem>
                     <MenuItem value="Fair">Fair</MenuItem>
                     <MenuItem value="Poor">Poor</MenuItem>
                   </Select>
                 </FormControl>
               </Box>
             </Box>
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
               <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                 <FormControl fullWidth required>
                   <InputLabel>Question Quality</InputLabel>
                   <Select
                     value={feedback.questionQuality}
                     onChange={(e) => setFeedback(prev => ({ ...prev, questionQuality: e.target.value }))}
                     label="Question Quality"
                   >
                     <MenuItem value="Excellent">Excellent</MenuItem>
                     <MenuItem value="Very Good">Very Good</MenuItem>
                     <MenuItem value="Good">Good</MenuItem>
                     <MenuItem value="Fair">Fair</MenuItem>
                     <MenuItem value="Poor">Poor</MenuItem>
                   </Select>
                 </FormControl>
               </Box>
               <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                 <FormControl fullWidth required>
                   <InputLabel>Interface Rating</InputLabel>
                   <Select
                     value={feedback.interfaceRating}
                     onChange={(e) => setFeedback(prev => ({ ...prev, interfaceRating: e.target.value }))}
                     label="Interface Rating"
                   >
                     <MenuItem value="Excellent">Excellent</MenuItem>
                     <MenuItem value="Very Good">Very Good</MenuItem>
                     <MenuItem value="Good">Good</MenuItem>
                     <MenuItem value="Fair">Fair</MenuItem>
                     <MenuItem value="Poor">Poor</MenuItem>
                   </Select>
                 </FormControl>
               </Box>
             </Box>
             <Box>
               <FormControl fullWidth required>
                 <InputLabel>Evaluation Rating</InputLabel>
                 <Select
                   value={feedback.evaluationRating}
                   onChange={(e) => setFeedback(prev => ({ ...prev, evaluationRating: e.target.value }))}
                   label="Evaluation Rating"
                 >
                   <MenuItem value="Excellent">Excellent</MenuItem>
                   <MenuItem value="Very Good">Very Good</MenuItem>
                   <MenuItem value="Good">Good</MenuItem>
                   <MenuItem value="Fair">Fair</MenuItem>
                   <MenuItem value="Poor">Poor</MenuItem>
                 </Select>
               </FormControl>
             </Box>
             <Box>
               <TextField
                 fullWidth
                 multiline
                 rows={4}
                 label="Additional Comments or Suggestions"
                 value={feedback.recommendation}
                 onChange={(e) => setFeedback(prev => ({ ...prev, recommendation: e.target.value }))}
                 placeholder="Share your thoughts about the interview experience..."
               />
             </Box>
           </Box>
         </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setFeedbackDialogOpen(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
        
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostInterviewTab;
