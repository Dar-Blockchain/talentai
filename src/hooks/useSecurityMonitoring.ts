import { useState, useRef, useEffect, useCallback } from 'react';
import { InterviewStatus } from '@/types/interview';

export interface UseSecurityMonitoringReturn {
  securityViolationCount: number;
  showSecurityModal: boolean;
  showFirstViolationModal: boolean;
  violationType: string;
  setShowSecurityModal: (show: boolean) => void;
  setShowFirstViolationModal: (show: boolean) => void;
}

export interface UseSecurityMonitoringOptions {
  interviewStatus: InterviewStatus;
  onTerminate?: () => void;
}

const MAX_WARNINGS = 2; // 3rd violation terminates

export const useSecurityMonitoring = ({
  interviewStatus,
  onTerminate,
}: UseSecurityMonitoringOptions): UseSecurityMonitoringReturn => {
  const [securityViolationCount, setSecurityViolationCount] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFirstViolationModal, setShowFirstViolationModal] = useState(false);
  const [violationType, setViolationType] = useState('');

  const violationCountRef = useRef(0);
  const terminatedRef = useRef(false);

  const handleSecurityViolation = useCallback((type: string) => {
    if (interviewStatus !== 'active' || terminatedRef.current) return;

    violationCountRef.current += 1;
    const count = violationCountRef.current;
    setSecurityViolationCount(count);
    setViolationType(type);

    if (count <= MAX_WARNINGS) {
      setShowFirstViolationModal(true);
    } else {
      terminatedRef.current = true;
      setShowSecurityModal(true);
      onTerminate?.();
    }
  }, [interviewStatus, onTerminate]);

  useEffect(() => {
    if (interviewStatus !== 'active') return;

    // ── Block copy / cut ──────────────────────────────────────────────
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleSecurityViolation('Copying text');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleSecurityViolation('Cutting text');
    };

    // ── Block paste ───────────────────────────────────────────────────
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleSecurityViolation('Pasting content');
    };

    // ── Block right-click context menu ────────────────────────────────
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleSecurityViolation('Right-click menu');
    };

    // ── Block keyboard shortcuts ──────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Copy / cut / paste
      if (ctrl && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); handleSecurityViolation('Copying text (Ctrl+C)'); return; }
      if (ctrl && (e.key === 'x' || e.key === 'X')) { e.preventDefault(); handleSecurityViolation('Cutting text (Ctrl+X)'); return; }
      if (ctrl && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); handleSecurityViolation('Pasting content (Ctrl+V)'); return; }

      // Screenshots
      if (e.key === 'PrintScreen') { e.preventDefault(); handleSecurityViolation('Screenshot attempt'); return; }
      if (e.altKey && e.key === 'PrintScreen') { e.preventDefault(); handleSecurityViolation('Screenshot attempt'); return; }
      if (ctrl && e.shiftKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); handleSecurityViolation('Screenshot attempt'); return; }
      // macOS screenshot
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) { e.preventDefault(); handleSecurityViolation('Screenshot attempt'); return; }

      // Dev tools
      if (e.key === 'F12') { e.preventDefault(); handleSecurityViolation('Opening developer tools'); return; }
      if (ctrl && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) { e.preventDefault(); handleSecurityViolation('Opening developer tools'); return; }
      if (ctrl && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); handleSecurityViolation('Opening page source'); return; }
    };

    // ── Tab / window visibility change ────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityViolation('Switching tabs or minimizing');
      }
    };

    // ── Window blur (alt-tab, switching apps) ─────────────────────────
    const handleBlur = () => {
      handleSecurityViolation('Leaving the interview window');
    };

    // ── Block text selection via mouse (drag-select) ──────────────────
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // ── Before unload warning ─────────────────────────────────────────
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leaving will end your interview session.';
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStatus, handleSecurityViolation]);

  return {
    securityViolationCount,
    showSecurityModal,
    showFirstViolationModal,
    violationType,
    setShowSecurityModal,
    setShowFirstViolationModal,
  };
};
