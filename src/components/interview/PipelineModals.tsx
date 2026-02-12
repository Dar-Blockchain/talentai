import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface PipelineModalsProps {
  pipelineLoading: boolean;
  showBlockedModal: boolean;
  showFailedModal: boolean;
  blockMessage: string;
  onReturnToDashboard: () => void;
}

const PipelineModals: React.FC<PipelineModalsProps> = ({
  pipelineLoading,
  showBlockedModal,
  showFailedModal,
  blockMessage,
  onReturnToDashboard,
}) => {
  return (
    <>
      {/* Pipeline Loading Modal */}
      <Dialog open={pipelineLoading} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Loading Your Interview Step...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we prepare your interview
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Step Blocked Modal */}
      <Dialog open={showBlockedModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          <Typography variant="h6">Wrong Step</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1">
            You will be redirected to your current step automatically.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Failed Previous Step Modal */}
      <Dialog
        open={showFailedModal}
        maxWidth="sm"
        fullWidth
        onClose={onReturnToDashboard}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon />
          <Typography variant="h6">Cannot Continue</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1" paragraph>
            Unfortunately, you did not pass a previous step in this pipeline.
            The interview cannot be started.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact the company if you believe this is an error.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={onReturnToDashboard}
            fullWidth
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PipelineModals;
