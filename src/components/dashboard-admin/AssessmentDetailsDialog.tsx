import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

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
  onEdit,
}) => {
  if (!assessment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #6a0dad 100%)`,
          color: 'white',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Job Assessment Details
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {assessment.jobId?.title || assessment.jobName || 'Assessment Review'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Score Header */}
        {assessment.averageScore !== undefined && (
          <Box
            sx={{
              background: '#f5f3ff',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: '1px solid #ece6fa',
            }}
          >
            <Chip
              label={`${assessment.averageScore.toFixed(0)}%`}
              color={assessment.averageScore >= 70 ? 'success' : assessment.averageScore >= 50 ? 'warning' : 'error'}
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                height: 56,
                width: 80,
                '& .MuiChip-label': { px: 0 },
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                Average Score
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c6c80' }}>
                {assessment.averageScore >= 70
                  ? 'Excellent Performance'
                  : assessment.averageScore >= 50
                  ? 'Satisfactory Performance'
                  : 'Needs Improvement'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Two Column Layout */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Job Information */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, borderRight: { md: '1px solid #ece6fa' } }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #ece6fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                Job Information
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Job Title</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {assessment.jobId?.title || assessment.jobName || 'Unnamed Job'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c6c80' }}>Description</Typography>
                  <Typography variant="body2" sx={{ color: '#1a1a2e', lineHeight: 1.6 }}>
                    {assessment.jobId?.description || assessment.jobDescription || 'No description available'}
                  </Typography>
                </Box>
                {assessment.jobId?.location && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Location</Typography>
                    <Typography variant="body1">{assessment.jobId.location}</Typography>
                  </Box>
                )}
                {assessment.jobId?.employmentType && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Employment Type</Typography>
                    <Chip label={assessment.jobId.employmentType} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                  </Box>
                )}
                {assessment.jobId?.experienceLevel && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Experience Level</Typography>
                    <Typography variant="body1">{assessment.jobId.experienceLevel}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Assessment Statistics */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #ece6fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: PRIMARY, mb: 2 }}>
                Assessment Statistics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, backgroundColor: '#f5f3ff', minWidth: 80 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                    {assessment.numberOfAttempts || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c6c80' }}>Attempts</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, borderRadius: 2, backgroundColor: '#f5f3ff', minWidth: 80 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY }}>
                    {assessment.totalQuestions || 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c6c80' }}>Questions</Typography>
                </Box>
              </Box>
              <Stack spacing={1.5}>
                {assessment.createdAt && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Created</Typography>
                    <Typography variant="body1">{new Date(assessment.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                )}
                {assessment.updatedAt && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c6c80' }}>Last Updated</Typography>
                    <Typography variant="body1">{new Date(assessment.updatedAt).toLocaleDateString()}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* ID Footer */}
        <Box sx={{ p: 2, backgroundColor: '#fafafa', borderTop: '1px solid #ece6fa' }}>
          <Typography variant="caption" sx={{ color: '#6c6c80', fontFamily: 'monospace' }}>
            ID: {assessment._id}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderColor: '#ece6fa', color: '#6c6c80' }}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => onEdit(assessment)}
            sx={{
              textTransform: 'none',
              backgroundColor: PRIMARY,
              '&:hover': { backgroundColor: '#6a0dad' },
            }}
          >
            Edit Assessment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AssessmentDetailsDialog);
