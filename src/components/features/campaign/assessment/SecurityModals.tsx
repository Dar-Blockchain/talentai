import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

interface SecurityModalsProps {
  showFirstViolationModal: boolean;
  showSecurityModal: boolean;
  onDismissFirst: () => void;
  onDismissSecond: () => void;
  onReturnToDashboard: () => void;
}

const SecurityModals: React.FC<SecurityModalsProps> = ({
  showFirstViolationModal,
  showSecurityModal,
  onDismissFirst,
  onDismissSecond,
  onReturnToDashboard,
}) => {
  return (
    <>
      {/* Security Violation Modals */}
      <Dialog open={showFirstViolationModal} onClose={onDismissFirst}>
        <DialogTitle sx={{ color: 'warning.main' }}>
          Security Warning
        </DialogTitle>
        <DialogContent>
          <Typography>
            We detected a potential security violation (screen capture or tab switching).
            Please stay focused on the interview. This is your first warning.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDismissFirst} color="primary">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSecurityModal} onClose={onDismissSecond}>
        <DialogTitle sx={{ color: 'error.main' }}>
          Interview Terminated
        </DialogTitle>
        <DialogContent>
          <Typography>
            Multiple security violations detected. The interview has been terminated for security reasons.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onReturnToDashboard} color="primary">
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SecurityModals;
