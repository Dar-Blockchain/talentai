import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Job {
  _id: string;
  jobDetails: {
    title: string;
  };
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  selectedJob: string;
  onJobChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApply: () => void;
  onCancel: () => void;
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  color: 'black',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000000',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000000',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000000',
  },
  backgroundColor: 'white',
  '& .MuiSelect-select': {
    color: 'black',
  },
  '& .MuiInputLabel-root': {
    color: 'black',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const CancelButton = styled(ActionButton)(({ theme }) => ({
  borderColor: 'black',
  color: 'black',
  '&:hover': {
    borderColor: 'rgba(0, 255, 157, 1)',
    background: 'rgba(0, 255, 157, 0.08)',
  },
}));

const ApplyButton = styled(ActionButton)(({ theme }) => ({
  background: 'rgba(0, 255, 157, 1)',
  color: 'white',
  '&:hover': {
    background: 'rgba(0, 255, 157, 0.9)',
  },
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FilterDialog Component
 * 
 * Dialog for filtering candidates by job selection
 */
const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  selectedJob,
  onJobChange,
  onApply,
  onCancel,
  jobs,
  isLoading,
  error,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        color: '#000000',
        pb: 2,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600 }}>
            Filter by Job
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'rgba(0,0,0,0.6)',
              '&:hover': {
                color: 'rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: '#000000', fontWeight: 500 }}>
          Select Job
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress size={32} sx={{ color: 'rgba(0, 255, 157, 1)' }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{
              backgroundColor: 'rgba(211,47,47,0.1)',
              color: '#d32f2f',
              border: '1px solid rgba(211,47,47,0.3)',
              '& .MuiAlert-icon': {
                color: '#d32f2f'
              }
            }}
          >
            {error}
          </Alert>
        ) : (
          <StyledTextField
            select
            fullWidth
            value={selectedJob}
            onChange={onJobChange}
            label="Choose a job to filter candidates"
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    backgroundColor: 'white',
                    '& .MuiMenuItem-root': {
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 157, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 157, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 255, 157, 0.3)',
                        }
                      }
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.6)' }}>
                All Jobs
              </Typography>
            </MenuItem>
            {jobs.map((job) => (
              <MenuItem 
                key={job._id} 
                value={job._id} 
                sx={{ 
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 157, 0.05)',
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {job.jobDetails.title}
                </Typography>
              </MenuItem>
            ))}
          </StyledTextField>
        )}
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        gap: 2,
      }}>
        <CancelButton
          variant="outlined"
          onClick={onCancel}
          size="large"
        >
          Cancel
        </CancelButton>
        <ApplyButton
          variant="contained"
          onClick={onApply}
          size="large"
          disabled={isLoading}
        >
          Apply Filter
        </ApplyButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default FilterDialog;