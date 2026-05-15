import { CandidateProgress, Step } from '../types/postInterview';

/**
 * Get color based on score value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50';
  if (score >= 70) return '#2196f3';
  if (score >= 60) return '#ff9800';
  if (score >= 50) return '#f44336';
  return '#9e9e9e';
};

/**
 * Get label based on score value
 */
export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 50) return 'Below Average';
  return 'Poor';
};


/**
 * Calculate progress percentage based on completed steps
 */
export const calculateProgressPercentage = (steps: Step[]): number => {
  if (!steps || steps.length === 0) return 0;
  const completedSteps = steps.filter(step => step.status === 'done').length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Get the next step to process (inProgress first, then pending in order)
 */
export const getNextStep = (steps: Step[]): Step | null => {
  if (!steps || steps.length === 0) return null;

  // Sort steps by order to ensure correct sequence
  const sortedSteps = [...steps].sort((a, b) =>
    (a.stepId?.order || 0) - (b.stepId?.order || 0)
  );

  // First, look for inProgress steps (current step to continue)
  const inProgressStep = sortedSteps.find(step => step.status === 'inProgress');
  if (inProgressStep) return inProgressStep;

  // If no inProgress step, find the first pending step in order
  const pendingStep = sortedSteps.find(step => step.status === 'pending');
  return pendingStep || null;
};

/**
 * Check if a step is a task step (not an interview)
 */
export const isTaskStep = (step: Step | null): boolean => {
  if (!step) return false;
  return step.stepId?.data?.type?.toLowerCase().includes('task') || false;
};


/**
 * Get candidate full name or fallback to username
 */
export const getCandidateName = (candidate: CandidateProgress['idCandidate']): string => {
  const fullName = `${candidate?.FirstName || ''} ${candidate?.LastName || ''}`.trim();
  return fullName || candidate?.username || 'Candidate';
};


