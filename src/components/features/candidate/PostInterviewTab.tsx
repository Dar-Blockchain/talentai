import React, { useState, useMemo, useCallback } from 'react';
import { Box, LinearProgress, Typography, Alert, Snackbar } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

// Types
import { PostInterviewData } from '../../../types/postInterview';

// Hooks
import { useCandidateProgress } from '../../../hooks/useCandidateProgress';
import { useTaskSubmission } from '../../../hooks/useTaskSubmission';
import { useNotification } from '../../../hooks/useNotification';

// Components
import DashboardHeader from './post-interview/DashboardHeader';
import SummaryCards from './post-interview/SummaryCards';
import ApplicationProgressSection from './post-interview/ApplicationProgressSection';
import InterviewListSection from './post-interview/InterviewListSection';
import FeedbackDialog from './post-interview/FeedbackDialog';
import EmptyState from './post-interview/EmptyState';

interface PostInterviewTabProps {
  data: PostInterviewData[];
  loading: boolean;
  error: string | null;
}

/**
 * Main PostInterview Dashboard Component
 * Displays interview results, application progress, and feedback options
 */
const PostInterviewTab: React.FC<PostInterviewTabProps> = ({ data, loading, error }) => {
  const router = useRouter();

  // State
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<PostInterviewData | null>(null);

  // Custom Hooks
  const { candidateProgress, progressLoading, progressError, refetchProgress } = useCandidateProgress();
  const { notification, showNotification, hideNotification } = useNotification();

  const {
    sendingTask,
    submittingTask,
    submissionLinks,
    handleSendTask,
    handleSubmitTask,
    updateSubmissionLink,
  } = useTaskSubmission({
    onSuccess: showNotification,
    onError: (msg) => showNotification(msg, 'error'),
    refetchProgress,
  });

  // Memoized Values
  const hasAnyData = useMemo(
    () => data.length > 0 || candidateProgress.length > 0,
    [data.length, candidateProgress.length]
  );

  const totalApplications = useMemo(
    () => data.length + candidateProgress.length,
    [data.length, candidateProgress.length]
  );

  const passedInterviews = useMemo(
    () => data.filter((item) => item.overallScore && item.overallScore >= 70).length,
    [data]
  );

  const activeApplications = useMemo(() => candidateProgress.length, [candidateProgress.length]);

  // Handlers
  const handleBrowseJobs = useCallback(() => {
    router.push('/posts');
  }, [router]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const handleViewDetails = useCallback(
    (id: string) => {
      router.push(`/interview/report/${id}`);
    },
    [router]
  );

  const handleProvideFeedback = useCallback((interview: PostInterviewData) => {
    setSelectedInterview(interview);
    setFeedbackDialogOpen(true);
  }, []);

  const handleCloseFeedback = useCallback(() => {
    setFeedbackDialogOpen(false);
    setSelectedInterview(null);
  }, []);

  // Loading State
  if ((loading || progressLoading) && !hasAnyData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Loading your interview data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty State
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
      </Box>
    );
  }

  // Main Render
  return (
    <Box sx={{ width: '100%' }}>
      {/* Dashboard Header */}

      {/* Summary Cards */}
      <SummaryCards
        totalApplications={totalApplications}
        passedInterviews={passedInterviews}
        activeApplications={activeApplications}
      />

      {/* Application Progress Section */}
      <ApplicationProgressSection
        candidateProgress={candidateProgress}
        loading={progressLoading}
        error={progressError}
        onRefresh={refetchProgress}
        onSendTask={handleSendTask}
        onSubmitTask={handleSubmitTask}
        onNavigate={handleNavigate}
        sendingTask={sendingTask}
        submittingTask={submittingTask}
        submissionLinks={submissionLinks}
        onUpdateLink={updateSubmissionLink}
      />

      {/* Interview List Section */}
      {data.length > 0 && (
        <InterviewListSection
          interviews={data}
          onViewDetails={handleViewDetails}
          onProvideFeedback={handleProvideFeedback}
        />
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog open={feedbackDialogOpen} interview={selectedInterview} onClose={handleCloseFeedback} />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(PostInterviewTab);
