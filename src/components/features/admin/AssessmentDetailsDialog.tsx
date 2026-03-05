import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  WorkOutline as WorkIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Quiz as QuizIcon,
  Repeat as RepeatIcon,
} from '@mui/icons-material';

const PRIMARY = '#8310FF';

interface AssessmentDetailsDialogProps {
  open: boolean;
  assessment: any | null;
  onClose: () => void;
  onEdit?: (assessment: any) => void;
}

const AssessmentDetailsDialog: React.FC<AssessmentDetailsDialogProps> = ({
  open,
  assessment,
  onClose,
}) => {
  if (!assessment) return null;

  const score = assessment.averageScore ?? 0;
  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 70 ? 'Excellent' : score >= 50 ? 'Satisfactory' : 'Needs Work';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
          px: 3,
          pt: 3,
          pb: 4,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
          Assessment Details
        </Typography>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mt: 0.5, pr: 4 }}>
          {assessment.jobId?.title || assessment.jobName || 'Unnamed Job'}
        </Typography>
        {assessment.jobId?.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {assessment.jobId.location}
            </Typography>
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Score Card - overlapping header */}
        <Box sx={{ px: 3, mt: -2.5 }}>
          <Box
            sx={{
              background: 'white',
              borderRadius: '12px',
              p: 2.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #ece6fa',
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '12px',
                background: `${scoreColor}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: scoreColor }}>
                {score.toFixed(0)}%
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  Average Score
                </Typography>
                <Chip
                  label={scoreLabel}
                  size="small"
                  sx={{
                    backgroundColor: `${scoreColor}14`,
                    color: scoreColor,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: scoreColor,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: 2, px: 3, mt: 2.5 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              textAlign: 'center',
            }}
          >
            <RepeatIcon sx={{ color: PRIMARY, fontSize: 22, mb: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {assessment.numberOfAttempts || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c6c80' }}>
              Attempts
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              textAlign: 'center',
            }}
          >
            <QuizIcon sx={{ color: PRIMARY, fontSize: 22, mb: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {assessment.totalQuestions || 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c6c80' }}>
              Questions
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              textAlign: 'center',
            }}
          >
            <TrendingUpIcon sx={{ color: PRIMARY, fontSize: 22, mb: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {score >= 70 ? 'High' : score >= 50 ? 'Mid' : 'Low'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c6c80' }}>
              Performance
            </Typography>
          </Box>
        </Box>

        {/* Job Details */}
        <Box sx={{ px: 3, mt: 2.5, pb: 3 }}>
          <Typography variant="overline" sx={{ color: '#6c6c80', letterSpacing: 1.2, fontSize: '0.7rem' }}>
            Job Information
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {assessment.jobId?.description && (
              <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.7 }}>
                {assessment.jobId.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              {assessment.jobId?.employmentType && (
                <Chip
                  icon={<WorkIcon sx={{ fontSize: '16px !important' }} />}
                  label={assessment.jobId.employmentType}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#ece6fa', color: '#6c6c80', textTransform: 'capitalize' }}
                />
              )}
              {assessment.jobId?.experienceLevel && (
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: '16px !important' }} />}
                  label={assessment.jobId.experienceLevel}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#ece6fa', color: '#6c6c80' }}
                />
              )}
              {assessment.createdAt && (
                <Chip
                  icon={<TimeIcon sx={{ fontSize: '16px !important' }} />}
                  label={new Date(assessment.createdAt).toLocaleDateString()}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#ece6fa', color: '#6c6c80' }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, backgroundColor: '#fafafa', borderTop: '1px solid #ece6fa' }}>
          <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.7rem' }}>
            ID: {assessment._id}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AssessmentDetailsDialog);
