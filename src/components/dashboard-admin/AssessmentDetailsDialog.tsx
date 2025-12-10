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

const GREEN_MAIN = '#8310FF';

interface AssessmentDetailsDialogProps {
  open: boolean;
  assessment: any | null; // Using any for now since Assessment type may vary
  onClose: () => void;
  onEdit?: (assessment: any) => void;
}

/**
 * AssessmentDetailsDialog Component
 * Displays detailed information about a selected job assessment
 * Extracted from admin.tsx for better modularity
 */
const AssessmentDetailsDialog: React.FC<AssessmentDetailsDialogProps> = ({
  open,
  assessment,
  onClose,
  onEdit,
}) => {
  if (!assessment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Job Assessment Details
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Job Information */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Job Information
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Job Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {assessment.jobId?.title || assessment.jobName || 'Unnamed Job'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Job Description
                </Typography>
                <Typography variant="body1">
                  {assessment.jobId?.description || assessment.jobDescription || 'No description available'}
                </Typography>
              </Box>

              {assessment.jobId?.location && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Location
                  </Typography>
                  <Typography variant="body1">📍 {assessment.jobId.location}</Typography>
                </Box>
              )}

              {assessment.jobId?.employmentType && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Employment Type
                  </Typography>
                  <Chip label={assessment.jobId.employmentType} size="small" sx={{ textTransform: 'capitalize' }} />
                </Box>
              )}

              {assessment.jobId?.experienceLevel && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Experience Level
                  </Typography>
                  <Typography variant="body1">{assessment.jobId.experienceLevel}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Job ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {assessment._id}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Assessment Statistics */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Assessment Statistics
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Number of Attempts
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem', color: GREEN_MAIN }}>
                  {assessment.numberOfAttempts || 0}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Questions
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {assessment.totalQuestions || 'N/A'}
                </Typography>
              </Box>

              {assessment.averageScore !== undefined && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Average Score
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: assessment.averageScore >= 70 ? '#4caf50' : '#f57c00',
                    }}
                  >
                    {assessment.averageScore.toFixed(1)}%
                  </Typography>
                </Box>
              )}

              {assessment.createdAt && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Created At
                  </Typography>
                  <Typography variant="body1">{new Date(assessment.createdAt).toLocaleDateString()}</Typography>
                </Box>
              )}

              {assessment.updatedAt && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body1">{new Date(assessment.updatedAt).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => onEdit(assessment)}
            sx={{
              backgroundColor: GREEN_MAIN,
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
