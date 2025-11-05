import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(255,59,48,0.10)',
          p: 0
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: '#ff3b30',
          fontSize: '1.2rem',
          fontWeight: 700,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'white',
        }}
      >
        <ErrorIcon sx={{ color: 'red', fontSize: 28 }} />
        Are you sure you want to delete this job post?
      </DialogTitle>
      <DialogContent sx={{
        background: 'white',
        color: '#fff',
        py: 3,
        px: 3,
        fontSize: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Typography sx={{ color: 'black' }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{
        px: 3,
        py: 2,
        background: 'white',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Button onClick={onClose} disabled={isDeleting}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          color="error"
          variant="contained"
          disabled={isDeleting}
          sx={{
            background: 'linear-gradient(135deg, #ff3b30 0%, #ff8a65 100%)',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff3b30 0%, #ff8a65 100%)',
              opacity: 0.9
            },
            minWidth: 100
          }}
          startIcon={<DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteJobPostDialog;
