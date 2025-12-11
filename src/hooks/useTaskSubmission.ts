import { useState, useCallback } from 'react';
import { CandidateProgress, Step, CurrentStep, SendTaskPayload } from '../types/postInterview';
import { sendTaskEmail, submitTask as submitTaskAPI } from '../services/postInterviewService';
import { validateProgressData, getCandidateName, isValidUrl } from '../utils/postInterviewHelpers';

interface UseTaskSubmissionProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  refetchProgress: () => void;
}

/**
 * Custom hook for managing task submission and sending
 */
export const useTaskSubmission = ({ onSuccess, onError, refetchProgress }: UseTaskSubmissionProps) => {
  const [sendingTask, setSendingTask] = useState<string | null>(null);
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({});
  const [submittedTasks, setSubmittedTasks] = useState<Record<string, boolean>>({});

  /**
   * Handle sending task email with PDF
   * @param step - Can be either Step or CurrentStep
   */
  const handleSendTask = useCallback(
    async (progress: CandidateProgress, step: Step | CurrentStep) => {
      // Determine stepId and stepLabel based on step type
      const isStepType = 'stepId' in step;
      const stepId = isStepType ? step.stepId._id : step._id;
      const stepLabel = isStepType ? step.stepId.data.label : step.data.label;

      const taskId = `${progress._id}-${stepId}`;

      try {
        setSendingTask(taskId);

        // Validate progress data structure first
        const validationIssues = validateProgressData(progress);
        if (validationIssues.length > 0) {
          throw new Error(`Cannot send coding project: ${validationIssues.join(', ')}`);
        }

        const token = localStorage.getItem('api_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Validate required fields
        const postId = progress.idPost?._id;
        const candidateEmail = progress.idCandidate?.email;
        const candidateName = getCandidateName(progress.idCandidate);

        if (!postId) {
          throw new Error('Post ID is missing. Cannot send coding project.');
        }

        if (!candidateEmail) {
          throw new Error('Candidate email is missing. Cannot send coding project.');
        }

        const taskData: SendTaskPayload = {
          postId,
          stepId,
          candidateId: progress.idCandidate?._id,
          candidateEmail,
          candidateName,
          jobTitle: progress.idPost?.jobDetails?.title || 'Software Developer',
          stepLabel: stepLabel || 'Coding Project Assignment',
        };

        console.log('Sending coding project with data:', taskData);

        await sendTaskEmail(taskData, token);

        onSuccess(
          'Coding project sent successfully! The candidate will receive an email with the PDF project assignment.'
        );

        // Refresh progress to update status
        refetchProgress();
      } catch (error) {
        console.error('Error sending task:', error);
        onError(
          `Error sending coding project: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setSendingTask(null);
      }
    },
    [onSuccess, onError, refetchProgress]
  );

  /**
   * Handle candidate task submission (GitHub link)
   */
  const handleSubmitTask = useCallback(
    async (stepNodeId: string) => {
      try {
        const token = localStorage.getItem('api_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const githubLink = submissionLinks[stepNodeId]?.trim();
        if (!githubLink) {
          throw new Error('Please provide a GitHub repository link');
        }

        // Basic URL validation
        if (!isValidUrl(githubLink)) {
          throw new Error('Please provide a valid URL starting with http(s)');
        }

        setSubmittingTask(stepNodeId);

        await submitTaskAPI(stepNodeId, githubLink, token);

        onSuccess('Task submitted successfully. We will review your repository shortly.');
        setSubmittedTasks((prev) => ({ ...prev, [stepNodeId]: true }));

        // Refresh progress
        refetchProgress();
      } catch (error) {
        onError(`Error submitting task: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setSubmittingTask(null);
      }
    },
    [submissionLinks, onSuccess, onError, refetchProgress]
  );

  /**
   * Update submission link for a step
   */
  const updateSubmissionLink = useCallback((stepNodeId: string, link: string) => {
    setSubmissionLinks((prev) => ({ ...prev, [stepNodeId]: link }));
  }, []);

  return {
    sendingTask,
    submittingTask,
    submissionLinks,
    submittedTasks,
    handleSendTask,
    handleSubmitTask,
    updateSubmissionLink,
  };
};
