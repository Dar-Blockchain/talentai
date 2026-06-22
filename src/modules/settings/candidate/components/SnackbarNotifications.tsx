import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface SnackbarNotificationsProps {
  error: string | null;
  saveSuccess: boolean;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

const Toast = ({
  open,
  variant,
  message,
  onClose,
  autoHideDuration,
}: {
  open: boolean;
  variant: 'success' | 'error';
  message: string | null;
  onClose: () => void;
  autoHideDuration: number;
}) => {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(id);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const isSuccess = variant === 'success';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 shadow-lg text-sm font-medium ${
          isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}
      >
        {isSuccess ? <CheckCircle2 size={18} className="text-green-600" /> : <XCircle size={18} className="text-red-600" />}
        <span>{message}</span>
        <button type="button" onClick={onClose} className="ml-2 text-current opacity-60 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const SnackbarNotifications: React.FC<SnackbarNotificationsProps> = ({ error, saveSuccess, onDismissError, onDismissSuccess }) => (
  <>
    <Toast open={!!error} variant="error" message={error} onClose={onDismissError} autoHideDuration={6000} />
    <Toast open={saveSuccess} variant="success" message="Profile updated successfully!" onClose={onDismissSuccess} autoHideDuration={3000} />
  </>
);

export default React.memo(SnackbarNotifications);
