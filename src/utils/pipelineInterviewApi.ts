/**
 * Pipeline Interview API Utilities
 * Functions for fetching interview configuration from pipeline steps
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface PipelineInterviewParams {
  stepId: string;
  stepNumber: number;
  stepType: string;
  stepTitle: string;
  interviewParams: {
    type: string;
    skill?: string;
    category?: string;
    proficiency: string | number;
    company: string;
    role: string;
    difficulty?: string;
    duration: string;
  };
  queryString: string;
  fullUrl: string;
  jobDetails: {
    jobId: string;
    title: string;
    company: string;
  };
  hasNextStep: boolean;
  totalSteps: number;
}

export interface CandidateProgress {
  _id: string;
  idCandidate: string;
  idPost: string;
  currentStep: any;
  steps: Array<{
    stepId: string;
    status: 'pending' | 'inProgress' | 'done';
    interviewDetails: string | null;
    completedAt: Date | null;
  }>;
  stats?: {
    completedSteps: number;
    totalSteps: number;
    completionPercentage: number;
    currentStepNumber: number;
  };
}

/**
 * Fetch interview parameters for a specific pipeline step
 */
export async function fetchPipelineInterviewParams(
  jobId: string,
  stepNumber: number,
  token: string
): Promise<PipelineInterviewParams> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/params/${jobId}/${stepNumber}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch pipeline interview params');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Initialize or get candidate progress for a job
 */
export async function initializeCandidateProgress(
  candidateId: string,
  jobId: string,
  token: string
): Promise<{ progress: CandidateProgress; isNew: boolean; currentStepNumber?: number }> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/progress/initialize`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ candidateId, jobId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize progress');
  }

  const result = await response.json();
  return {
    progress: result.data,
    isNew: result.isNew,
    currentStepNumber: result.currentStepNumber,
  };
}

/**
 * Get current progress for a candidate on a job
 */
export async function getCandidateProgress(
  candidateId: string,
  jobId: string,
  token: string
): Promise<CandidateProgress> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/progress/${candidateId}/${jobId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch progress');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update step status after interview completion
 */
export async function updateStepStatus(
  candidateId: string,
  jobId: string,
  stepId: string,
  interviewDetailsId: string,
  status: 'done' | 'inProgress',
  token: string
): Promise<CandidateProgress> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/progress/update-step`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        candidateId,
        jobId,
        stepId,
        interviewDetailsId,
        status,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update step status');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Move to next interview step in pipeline
 */
export async function moveToNextStep(
  candidateId: string,
  jobId: string,
  token: string
): Promise<{
  progress: CandidateProgress;
  hasNextStep: boolean;
  pipelineComplete: boolean;
  nextStepNumber?: number;
  nextStepId?: string;
}> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/progress/next-step`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ candidateId, jobId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to move to next step');
  }

  const result = await response.json();
  return {
    progress: result.data,
    hasNextStep: result.hasNextStep,
    pipelineComplete: result.pipelineComplete,
    nextStepNumber: result.nextStepNumber,
    nextStepId: result.nextStepId,
  };
}

/**
 * Get all interview steps for a job (for navigation/preview)
 */
export async function getInterviewSteps(
  jobId: string,
  token: string
): Promise<{
  jobId: string;
  jobTitle: string;
  company: string;
  totalSteps: number;
  interviewSteps: Array<{
    stepId: string;
    stepNumber: number;
    stepType: string;
    stepTitle: string;
    configured: boolean;
  }>;
  interviewCount: number;
}> {
  const response = await fetch(
    `${BACKEND_URL}/api/pipeline-interview/steps/${jobId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch interview steps');
  }

  const result = await response.json();
  return result.data;
}
