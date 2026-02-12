import { useState, useRef, useEffect } from 'react';
import { InterviewStatus } from '@/types/interview';

export interface UseSecurityMonitoringReturn {
  securityViolationCount: number;
  showSecurityModal: boolean;
  showFirstViolationModal: boolean;
  setShowSecurityModal: (show: boolean) => void;
  setShowFirstViolationModal: (show: boolean) => void;
}

export interface UseSecurityMonitoringOptions {
  interviewStatus: InterviewStatus;
}

export const useSecurityMonitoring = ({
  interviewStatus,
}: UseSecurityMonitoringOptions): UseSecurityMonitoringReturn => {
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const violationHandledRef = useRef(false);

  // Security violation handler (currently disabled in original code)
  const handleSecurityViolation = () => {
    // setSecurityViolationCount((prev) => {
    //   const next = prev + 1;
    //   if (next === 1) {
    //     setShowFirstViolationModal(true);
    //   } else if (next === 2) {
    //     setShowSecurityModal(true);
    //     endInterview();
    //     setTimeout(() => {
    //       router.push('/dashboard/candidate');
    //     }, 2000);
    //   }
    //   return next;
    // });
  };

  // Security monitoring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (interviewStatus === 'active' && !violationHandledRef.current) {
        if (e.key === 'PrintScreen') {
          handleSecurityViolation();
        }
        if (e.altKey && e.key === 'PrintScreen') {
          handleSecurityViolation();
        }
        if (e.key === 'S' && e.shiftKey && e.metaKey) {
          handleSecurityViolation();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && interviewStatus === 'active' && !violationHandledRef.current) {
        handleSecurityViolation();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (interviewStatus === 'active' && !violationHandledRef.current) {
        handleSecurityViolation();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStatus]);

  return {
    securityViolationCount,
    showSecurityModal,
    showFirstViolationModal,
    setShowSecurityModal,
    setShowFirstViolationModal,
  };
};
