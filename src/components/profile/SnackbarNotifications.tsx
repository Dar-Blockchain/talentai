import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SnackbarNotificationsProps {
  error: string | null;
  saveSuccess: boolean;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

const SnackbarNotifications: React.FC<SnackbarNotificationsProps> = ({
  error,
  saveSuccess,
  onDismissError,
  onDismissSuccess,
}) => {
  return (
    <>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={onDismissError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={onDismissError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={onDismissSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={onDismissSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(SnackbarNotifications);
