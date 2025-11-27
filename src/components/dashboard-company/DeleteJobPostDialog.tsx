import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteJobPostDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteJobPostDialog: React.FC<DeleteJobPostDialogProps> = ({
  open,
  onClose,
  onDelete,
  isDeleting,
}) => {
  const accent = 'rgba(224, 62, 92, 1)';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        },
      }}
    >
      {/* TITLE */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          fontSize: '1.2rem',
          fontWeight: 500,
          color: '#2d2d2d',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          background: 'rgba(250,250,250,0.7)',
        }}
      >
        <ErrorIcon sx={{ color: accent, fontSize: 26 }} />
        Delete Job Post
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          px: 3,
          py: 3,
          color: '#444',
          background: 'white',
        }}
      >
        <Typography sx={{ my: 1.5, fontSize: '0.95rem' }}>
          Are you sure you want to delete this job post?  
        </Typography>

        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#5c5c5c',
          }}
        >
          This action cannot be undone.
        </Typography>
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          background: 'rgba(250,250,250,0.9)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Button
          onClick={onClose}
          disabled={isDeleting}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 2.4,
            color: '#333',
            background: 'rgba(0,0,0,0.04)',
            '&:hover': {
              background: 'rgba(0,0,0,0.07)',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={onDelete}
          variant="contained"
          disabled={isDeleting}
          startIcon={<DeleteIcon />}
          sx={{
            background: accent,
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 3,
            color: '#fff',
            boxShadow: '0 4px 14px rgba(224, 62, 92, 0.25)',
            '&:hover': {
              background: accent,
              opacity: 0.9,
              boxShadow: '0 5px 18px rgba(224, 62, 92, 0.35)',
            },
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteJobPostDialog;
