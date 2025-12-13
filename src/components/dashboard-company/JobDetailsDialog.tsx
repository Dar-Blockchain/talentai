import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import JobBasicInfo from './job-details/JobBasicInfo';
import RecruitmentFlowSection from './job-details/RecruitmentFlowSection';
import SkillAnalysisSection from './job-details/SkillAnalysisSection';
import LinkedInPostSection from './job-details/LinkedInPostSection';
import AgentConfigSection from './job-details/AgentConfigSection';

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  job: any | null;
  onRefresh?: () => void;
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({ open, onClose, job, onRefresh }) => {
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 3,
        pt: 3,
        px: 4,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <Typography variant="h4" sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: '1.75rem',
            mb: 0.5,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {details?.title}
          </Typography>
          {createdAt && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
              Posted on {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.2)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              transform: 'rotate(90deg)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{
        pt: 4,
        px: 4,
        pb: 2,
        backgroundColor: 'transparent',
        maxHeight: 'calc(90vh - 200px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#10b981',
          borderRadius: '10px',
          '&:hover': {
            background: '#059669'
          }
        }
      }}>
        {/* Job Basic Information */}
        <JobBasicInfo details={details} skillAnalysis={job?.skillAnalysis} />

        {/* Recruitment Flow and Interview Link */}
        <RecruitmentFlowSection steps={steps} interviewHref={interviewHref} onCopyLink={handleCopy} />

        {/* Agent Configuration Section */}
        <AgentConfigSection job={job} onRefresh={onRefresh} />

        {/* Skill Analysis Section */}
        <SkillAnalysisSection skillAnalysis={job?.skillAnalysis} />

        {/* LinkedIn Post Section */}
        <LinkedInPostSection linkedinPost={job?.linkedinPost} />
      </DialogContent>
      
      <DialogActions sx={{
        p: 3,
        pt: 2,
        borderTop: '2px solid #e5e7eb',
        backgroundColor: '#fafbfc',
        gap: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            color: '#6b7280',
            fontWeight: 600,
            borderColor: '#d1d5db',
            borderRadius: '12px',
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f3f4f6'
            }
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<OpenInNewIcon />}
            >
              Open Interview Link
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
