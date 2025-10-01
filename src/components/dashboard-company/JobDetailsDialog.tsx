import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack, Divider, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Stepper, Step, StepLabel } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Link from 'next/link';

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  job: any | null;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({ open, onClose, job }) => {
  const details = job?.jobDetails || job;
  const createdAt = job?.createdAt || job?.created_at || job?.postedAt;
  const steps: any[] = Array.isArray(job?.post_Steps) ? [...job.post_Steps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const firstStep = steps[0];
  const firstStepData = firstStep?.data;
  const postId = job?._id || job?.id;

  // Derive interview link using steps[0].data when available
  const computeInterviewHref = (): string | null => {
    if (!firstStep) return null;
    // If data is a direct URL string
    if (typeof firstStepData === 'string') {
      if (firstStepData.startsWith('http') || firstStepData.startsWith('/')) {
        return firstStepData;
      }
    }
    // If data is an object that might contain a url or id
    if (firstStepData && typeof firstStepData === 'object') {
      if (typeof firstStepData.url === 'string' && (firstStepData.url.startsWith('http') || firstStepData.url.startsWith('/'))) {
        return firstStepData.url;
      }
      const id = firstStepData.stepId || firstStepData.id || firstStep?._id || firstStep?.id;
      if (postId && id) {
        return `/posts/${postId}/interview?stepId=${id}`;
      }
    }
    // Fallback to previous route pattern using step id
    const id = firstStep?._id || firstStep?.id;
    if (postId && id) {
      return `/posts/${postId}/interview?stepId=${id}`;
    }
    return null;
  };

  const interviewHref = computeInterviewHref();

  const handleCopy = () => {
    if (!interviewHref) return;
    try {
      navigator.clipboard?.writeText(interviewHref);
    } catch (e) {
      // no-op
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Typography variant="h5" sx={{ 
          color: '#10b981', 
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {details?.title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Job Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            color: '#111827', 
            fontWeight: 600, 
            mb: 2,
            fontSize: '1.125rem'
          }}>
            Job Details
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
            {details?.location && (
              <Chip
                icon={<LocationOnIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                label={details.location}
                sx={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontWeight: 500,
                  border: '1px solid #bbf7d0',
                  '& .MuiChip-icon': { color: '#10b981' }
                }}
              />
            )}
            {!!details?.salary && (
              <Chip
                icon={<AttachMoneyIcon sx={{ fontSize: 16, color: '#f59e0b' }} />}
                label={`${details.salary?.currency} ${details.salary?.min} - ${details.salary?.currency} ${details.salary?.max}`}
                sx={{
                  backgroundColor: '#fffbeb',
                  color: '#92400e',
                  fontWeight: 500,
                  border: '1px solid #fde68a',
                  '& .MuiChip-icon': { color: '#f59e0b' }
                }}
              />
            )}
            {details?.employmentType && (
              <Chip
                icon={<WorkOutlineIcon sx={{ fontSize: 16, color: '#3b82f6' }} />}
                label={details.employmentType}
                sx={{
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  fontWeight: 500,
                  border: '1px solid #bfdbfe',
                  '& .MuiChip-icon': { color: '#3b82f6' }
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Required Skills Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            color: '#111827', 
            fontWeight: 600, 
            mb: 2,
            fontSize: '1.125rem'
          }}>
            Required Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {(job?.skillAnalysis?.requiredSkills ?? []).map((skill: any, idx: number) => (
              <Chip
                key={idx}
                label={skill.name}
                sx={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  fontWeight: 500,
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Description Section */}
        {details?.description && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              color: '#111827', 
              fontWeight: 600, 
              mb: 2,
              fontSize: '1.125rem'
            }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#6b7280', 
              lineHeight: 1.6,
              whiteSpace: 'pre-line' 
            }}>
              {details.description}
            </Typography>
          </Box>
        )}

        {/* Requirements Section */}
        {details?.requirements && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              color: '#111827', 
              fontWeight: 600, 
              mb: 2,
              fontSize: '1.125rem'
            }}>
              Requirements:
            </Typography>
            <List sx={{ py: 0 }}>
              {Array.isArray(details.requirements) ? details.requirements.map((req: string, idx: number) => (
                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary={`• ${req}`}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      }
                    }}
                  />
                </ListItem>
              )) : (
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary={`• ${details.requirements}`}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Responsibilities Section */}
        {details?.responsibilities && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              color: '#111827', 
              fontWeight: 600, 
              mb: 2,
              fontSize: '1.125rem'
            }}>
              Responsibilities:
            </Typography>
            <List sx={{ py: 0 }}>
              {Array.isArray(details.responsibilities) ? details.responsibilities.map((resp: string, idx: number) => (
                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary={`• ${resp}`}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      }
                    }}
                  />
                </ListItem>
              )) : (
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText 
                    primary={`• ${details.responsibilities}`}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Recruitment Flow Section */}
        {steps.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TimelineIcon sx={{ color: '#6b7280', fontSize: 20 }} />
              <Typography variant="h6" sx={{ 
                color: '#111827', 
                fontWeight: 600,
                fontSize: '1.125rem'
              }}>
                Recruitment Flow
              </Typography>
            </Stack>
            <Box sx={{ px: 1, py: 1 }}>
              <Stepper activeStep={-1} alternativeLabel sx={{ 
                '& .MuiStepLabel-label': { 
                  typography: 'body2',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                },
                '& .MuiStepLabel-iconContainer': {
                  color: '#d1d5db'
                }
              }}>
                {steps.map((s: any, i: number) => (
                  <Step key={s._id || s.id || i}>
                    <StepLabel
                      optional={s.data?.subtitle ? (
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{s.data.subtitle}</Typography>
                      ) : undefined}
                    >
                      {s.data?.label || `Step ${i + 1}`}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
        )}

        {/* Interview Link Section */}
        {!!interviewHref && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            backgroundColor: '#f9fafb', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>Interview link</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#111827', wordBreak: 'break-all' }}>{interviewHref}</Typography>
            </Box>
            <Link href={interviewHref} passHref legacyBehavior>
              <IconButton component="a" target="_blank" rel="noopener noreferrer" size="small" aria-label="Open interview link in new tab">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Link>
            <IconButton onClick={handleCopy} size="small" aria-label="Copy interview link">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            textTransform: 'none',
            color: '#6b7280',
            fontWeight: 500
          }}
        >
          Close
        </Button>
        {!!interviewHref && (
          <Link href={interviewHref} passHref legacyBehavior>
            <Button 
              component="a" 
              target="_blank" 
              rel="noopener noreferrer" 
              variant="contained" 
              sx={{ 
                backgroundColor: '#3b82f6',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  backgroundColor: '#2563eb'
                }
              }} 
              startIcon={<OpenInNewIcon />}
            >
              Open Interview
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
