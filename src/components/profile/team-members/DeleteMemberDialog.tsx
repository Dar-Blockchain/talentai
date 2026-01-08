import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from '@mui/material';

interface DeleteMemberDialogProps {
  open: boolean;
  memberName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteMemberDialog: React.FC<DeleteMemberDialogProps> = ({
  open,
  memberName,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1a1a1a',
          pb: 1,
        }}
      >
        Remove Team Member
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Are you sure you want to remove{' '}
          <strong>{memberName}</strong>{' '}
          from your team? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            '&:hover': {
              backgroundColor: '#f8fafc',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
            },
          }}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DeleteMemberDialog);
