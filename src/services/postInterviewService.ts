import { CandidateProgress, SendTaskPayload } from '../types/postInterview';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch candidate progress data
 */
export const fetchCandidateProgress = async (token: string): Promise<CandidateProgress[]> => {
  const apiUrl = `${API_BASE_URL}candidate-progress/getUserProgress`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message if JSON parsing fails
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      // Handle both single object and array responses
      const progressData = Array.isArray(result.data) ? result.data : [result.data];
      return progressData;
    } else {
      // Check if it's a "no progress found" error (which is not a real error)
      if (result.message && result.message.includes('Progress not found')) {
        return [];
      }
      throw new Error(result.message || 'Failed to fetch progress data');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Send task email with PDF to candidate
 */
export const sendTaskEmail = async (taskData: SendTaskPayload, token: string): Promise<void> => {
  const apiUrl = `${API_BASE_URL}task/send-task`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send task');
  }

  return response.json();
};

/**
 * Submit task with GitHub link
 */
export const submitTask = async (
  stepNodeId: string,
  githubLink: string,
  token: string
): Promise<void> => {
  const apiUrl = `${API_BASE_URL}post-steps/node/${stepNodeId}/submit-task`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubLink }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit task');
  }

  return response.json();
};

/**
 * Get cached candidate progress from sessionStorage
 */
export const getCachedProgress = (): CandidateProgress[] | null => {
  const CACHE_KEY = 'candidateProgress';
  const TTL_MS = 2 * 60 * 1000; // 2 minutes

  try {
    const cachedRaw = sessionStorage.getItem(CACHE_KEY);
    if (!cachedRaw) return null;

    const cached = JSON.parse(cachedRaw);
    if (!cached || !cached.timestamp) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp < TTL_MS) {
      return Array.isArray(cached.data) ? cached.data : [cached.data];
    }

    // Cache expired
    return null;
  } catch {
    return null;
  }
};

/**
 * Cache candidate progress to sessionStorage
 */
export const cacheProgress = (data: CandidateProgress[]): void => {
  const CACHE_KEY = 'candidateProgress';

  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore cache write errors
  }
};
