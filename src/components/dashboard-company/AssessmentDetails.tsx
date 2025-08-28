import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Assessment {
  _id: string;
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    skills: Array<{ name: string; level: string; proficiency: number }>;
  };
  job: {
    _id: string;
    title: string;
    company: string;
    requiredSkills: string[];
  };
  results: {
    overallScore: number;
    technicalScore: number;
    softSkillScore: number;
    questions: Array<{
      question: string;
      answer: string;
      score: number;
      feedback: string;
    }>;
  };
  status: 'completed' | 'in-progress' | 'failed';
  completedAt: string;
  duration: number; // in minutes
  matchScore: number;
}

interface AssessmentDetailsProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onDownloadReport?: (assessmentId: string) => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
  },
}));

const ScoreCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.1)',
  background: 'rgba(255,255,255,0.8)',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  },
}));

const SkillChip = styled(Chip)<{ level: string }>(({ theme, level }) => ({
  fontWeight: 600,
  ...(level === 'Expert' && {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#2e7d32',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  }),
  ...(level === 'Advanced' && {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    color: '#1565c0',
    border: '1px solid rgba(33, 150, 243, 0.3)',
  }),
  ...(level === 'Intermediate' && {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    color: '#f57c00',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  }),
  ...(level === 'Beginner' && {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
    color: '#616161',
    border: '1px solid rgba(158, 158, 158, 0.3)',
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #7A0AFF 0%, #00D2FF 100%)',
  },
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AssessmentDetails Component
 * 
 * Displays detailed assessment information for candidates
 */
const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({
  open,
  onClose,
  assessment,
  onDownloadReport,
}) => {
  if (!assessment) return null;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#f57c00';
    return '#c62828';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderScoreSection = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Overall Score */}
      <Grid item xs={12} md={4}>
        <ScoreCard>
          <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(assessment.results.overallScore) }}>
            {assessment.results.overallScore}%
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Overall Score
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getScoreLabel(assessment.results.overallScore)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={assessment.results.overallScore}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(assessment.results.overallScore),
                borderRadius: 4,
              },
            }}
          />
        </ScoreCard>
      </Grid>

      {/* Technical Score */}
      <Grid item xs={12} md={4}>
        <ScoreCard>
          <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(assessment.results.technicalScore) }}>
            {assessment.results.technicalScore}%
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Technical Skills
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getScoreLabel(assessment.results.technicalScore)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={assessment.results.technicalScore}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(assessment.results.technicalScore),
                borderRadius: 4,
              },
            }}
          />
        </ScoreCard>
      </Grid>

      {/* Soft Skills Score */}
      <Grid item xs={12} md={4}>
        <ScoreCard>
          <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor(assessment.results.softSkillScore) }}>
            {assessment.results.softSkillScore}%
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Soft Skills
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getScoreLabel(assessment.results.softSkillScore)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={assessment.results.softSkillScore}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(assessment.results.softSkillScore),
                borderRadius: 4,
              },
            }}
          />
        </ScoreCard>
      </Grid>
    </Grid>
  );

  const renderCandidateInfo = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Candidate Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={assessment.candidate.avatar}
              sx={{ width: 64, height: 64 }}
            >
              {assessment.candidate.firstName[0]}{assessment.candidate.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {assessment.candidate.firstName} {assessment.candidate.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assessment.candidate.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Match Score:
                </Typography>
                <Chip
                  label={`${assessment.matchScore}%`}
                  size="small"
                  sx={{
                    backgroundColor: assessment.matchScore >= 80 ? 'rgba(76, 175, 80, 0.1)' : 
                                   assessment.matchScore >= 60 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: assessment.matchScore >= 80 ? '#2e7d32' : 
                           assessment.matchScore >= 60 ? '#f57c00' : '#c62828',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Skills Assessment
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {assessment.candidate.skills.map((skill, index) => (
                <SkillChip
                  key={index}
                  label={skill.name}
                  level={skill.level}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderJobInfo = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Job Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(131, 16, 255, 0.05)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {assessment.job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {assessment.job.company}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(2, 226, 255, 0.05)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {assessment.job.requiredSkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#02E2FF', color: '#02E2FF' }}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderQuestionResults = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Question Results
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(131, 16, 255, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Answer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Feedback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessment.results.questions.map((question, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {question.question}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    {question.answer}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {question.score}%
                    </Typography>
                    <Rating
                      value={question.score / 20}
                      readOnly
                      size="small"
                      sx={{ '& .MuiRating-iconFilled': { color: getScoreColor(question.score) } }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    {question.feedback}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAssessmentMeta = () => (
    <Box sx={{ p: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Status
            </Typography>
            <Chip
              label={assessment.status}
              color={assessment.status === 'completed' ? 'success' : 
                     assessment.status === 'in-progress' ? 'warning' : 'error'}
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Duration
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatDuration(assessment.duration)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Completed
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatDate(assessment.completedAt)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        pb: 2,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ color: '#8310FF', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
              Assessment Details
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              '&:hover': {
                color: 'rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Score Section */}
        {renderScoreSection()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Candidate Info */}
        {renderCandidateInfo()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Job Info */}
        {renderJobInfo()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Question Results */}
        {renderQuestionResults()}
        
        <Divider sx={{ my: 3 }} />
        
        {/* Assessment Meta */}
        {renderAssessmentMeta()}
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        gap: 2,
      }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        
        {onDownloadReport && (
          <PrimaryButton
            variant="contained"
            onClick={() => onDownloadReport(assessment._id)}
            startIcon={<DownloadIcon />}
          >
            Download Report
          </PrimaryButton>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default AssessmentDetails;
