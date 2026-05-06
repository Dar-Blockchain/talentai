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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('interview');

  return (
    <>
      {/* Pipeline Loading Modal */}
      <Dialog open={pipelineLoading} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('pipeline.loading_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pipeline.loading_subtitle')}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Step Blocked Modal */}
      <Dialog open={showBlockedModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          <Typography variant="h6">{t('pipeline.wrong_step_title')}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1">
            {t('pipeline.wrong_step_desc')}
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
          <Typography variant="h6">{t('pipeline.blocked_title')}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {blockMessage}
          </Alert>
          <Typography variant="body1" paragraph>
            {t('pipeline.blocked_desc')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pipeline.blocked_contact')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={onReturnToDashboard}
            fullWidth
          >
            {t('pipeline.return_dashboard')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PipelineModals;
