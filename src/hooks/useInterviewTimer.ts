import { useState, useRef, useCallback, useEffect } from 'react';
import { InterviewStatus } from '@/types/interview';

export interface UseInterviewTimerReturn {
  elapsedTime: number;
  timeWarning: boolean;
  duration: number;
  setDuration: (ms: number) => void;
  startTimer: (maxMinutes: number) => void;
  stopTimer: () => void;
  formatTime: (milliseconds: number) => string;
  getProgressPercentage: () => number;
}

export interface UseInterviewTimerOptions {
  interviewStatus: InterviewStatus;
  onTimeUp: () => void;
  showNotification: (message: string, severity: 'warning') => void;
}

export const useInterviewTimer = ({
  interviewStatus,
  onTimeUp,
  showNotification,
}: UseInterviewTimerOptions): UseInterviewTimerReturn => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeWarning, setTimeWarning] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((maxMinutes: number) => {
    setElapsedTime(0);
    setTimeWarning(false);

    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const twoMinuteThreshold = (maxMinutes - 2) * 60;
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;

        if (newTime === twoMinuteThreshold) {
          setTimeWarning(true);
          showNotification('2 minutes remaining', 'warning');
        }

        return newTime;
      });
    }, 1000);

    console.log(`⏱️ Interview timer started (max: ${maxMinutes} minutes)`);
  }, [showNotification]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const formatTime = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (duration === 0) return 0;
    const durationInSeconds = duration / 1000;
    return (elapsedTime / durationInSeconds) * 100;
  }, [duration, elapsedTime]);

  // Auto-end interview when duration is reached
  useEffect(() => {
    if (interviewStatus === 'active' && duration > 0) {
      const durationInSeconds = Math.floor(duration / 1000);
      if (elapsedTime >= durationInSeconds) {
        onTimeUp();
      }
    }
  }, [elapsedTime, interviewStatus, duration, onTimeUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    elapsedTime,
    timeWarning,
    duration,
    setDuration,
    startTimer,
    stopTimer,
    formatTime,
    getProgressPercentage,
  };
};
