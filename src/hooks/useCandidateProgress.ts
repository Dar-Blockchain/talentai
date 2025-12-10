import { useState, useEffect, useCallback } from 'react';
import { CandidateProgress } from '../types/postInterview';
import {
  fetchCandidateProgress as fetchProgressAPI,
  getCachedProgress,
  cacheProgress,
} from '../services/postInterviewService';

/**
 * Custom hook for managing candidate progress data
 */
export const useCandidateProgress = () => {
  const [candidateProgress, setCandidateProgress] = useState<CandidateProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  const fetchCandidateProgressData = useCallback(async () => {
    try {
      setProgressLoading(true);
      setProgressError(null);

      const token = localStorage.getItem('api_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check cache first
      const cached = getCachedProgress();
      if (cached) {
        setCandidateProgress(cached);
        setProgressLoading(false);
        return;
      }

      // Fetch from API
      const progressData = await fetchProgressAPI(token);
      setCandidateProgress(progressData);

      // Cache the results
      cacheProgress(progressData);
    } catch (error) {
      console.error('Error fetching candidate progress:', error);

      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('Progrès non trouvé')) {
          // This is not a real error - just no data
          setProgressError(null);
          setCandidateProgress([]);
        } else {
          setProgressError(error.message);
        }
      } else {
        setProgressError('An unexpected error occurred');
      }
    } finally {
      setProgressLoading(false);
    }
  }, []);

  // Fetch progress on component mount
  useEffect(() => {
    fetchCandidateProgressData();
  }, [fetchCandidateProgressData]);

  // Refresh progress when returning from an interview
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCandidateProgressData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCandidateProgressData]);

  return {
    candidateProgress,
    progressLoading,
    progressError,
    refetchProgress: fetchCandidateProgressData,
  };
};
