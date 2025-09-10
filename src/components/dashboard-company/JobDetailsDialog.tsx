import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack, Divider, IconButton } from '@mui/material';
import { Stepper, Step, StepLabel } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{details?.title}</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Header chips */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          {details?.location && (
            <Box sx={{ px: 1, py: 0.25, bgcolor: '#EEF2FF', color: '#4338CA', borderRadius: 1 }}>
              <Typography variant="caption">{details.location}</Typography>
            </Box>
          )}
          {details?.employmentType && (
            <Box sx={{ px: 1, py: 0.25, bgcolor: '#ECFDF5', color: '#065F46', borderRadius: 1 }}>
              <Typography variant="caption">{details.employmentType}</Typography>
            </Box>
          )}
          {!!details?.salary && (
            <Box sx={{ px: 1, py: 0.25, bgcolor: '#FFF7ED', color: '#9A3412', borderRadius: 1 }}>
              <Typography variant="caption">
                {details.salary?.currency}{details.salary?.min}{details.salary?.max != null ? ` - ${details.salary?.max}` : ''}
              </Typography>
            </Box>
          )}
          {createdAt && (
            <Typography variant="caption" sx={{ color: '#666', ml: 'auto' }}>
              Posted {(() => { const d = new Date(createdAt); return isNaN(d.getTime()) ? createdAt : d.toLocaleDateString(); })()}
            </Typography>
          )}
        </Stack>

        {/* Description */}
        {details?.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>About the role</Typography>
            <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'pre-line' }}>{details.description}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Required Skills */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Required Skills</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {(job?.skillAnalysis?.requiredSkills ?? []).map((skill: any, idx: number) => (
            <Chip
              key={idx}
              label={skill.name}
              size="small"
              icon={<StarIcon sx={{ color: '#00FFC3', fontSize: 18 }} />}
              sx={{
                backgroundColor: 'rgba(0, 255, 157, 0.15)',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.87rem',
                letterSpacing: 0.2,
                px: 1
              }}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Post Steps (Recruitment Flow) */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <TimelineIcon sx={{ color: '#8310FF' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recruitment Flow</Typography>
        </Stack>
        {steps.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#666' }}>No steps defined for this post.</Typography>
        ) : (
          <Box sx={{ px: 1, py: 1 }}>
            <Stepper activeStep={-1} alternativeLabel sx={{ '& .MuiStepLabel-label': { typography: 'body2' } }}>
              {steps.map((s: any, i: number) => (
                <Step key={s._id || s.id || i}>
                  <StepLabel
                    optional={s.data?.subtitle ? (
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>{s.data.subtitle}</Typography>
                    ) : undefined}
                  >
                    {s.data?.label || `Step ${i + 1}`}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {!!interviewHref && (
          <Box sx={{ mt: 2, p: 1.5, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>Interview link</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: '#0f172a', wordBreak: 'break-all' }}>{interviewHref}</Typography>
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
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Close</Button>
        {!!interviewHref && (
          <Link href={interviewHref} passHref legacyBehavior>
            <Button component="a" target="_blank" rel="noopener noreferrer" variant="contained" sx={{ background: '#8310FF', textTransform: 'none' }} startIcon={<OpenInNewIcon />}>
              Open Interview
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
