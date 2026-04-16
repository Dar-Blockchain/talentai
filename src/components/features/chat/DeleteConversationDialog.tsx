import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface DeleteConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConversationDialog: React.FC<DeleteConversationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onClose()}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minWidth: 380,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: '#000', fontSize: '16px' }}>
        Delete Conversation
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'rgba(84,98,116,0.8)', fontSize: '13px' }}>
          Are you sure you want to delete this entire conversation? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isDeleting}
          sx={{
            color: 'rgba(84,98,116,0.8)',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '38px',
            '&:hover': {
              backgroundColor: 'rgba(243, 245, 247, 1)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          sx={{
            backgroundColor: 'rgba(220, 38, 38, 1)',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '38px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(185, 28, 28, 1)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(252, 165, 165, 1)',
            },
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConversationDialog;
