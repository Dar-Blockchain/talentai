import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
  onApplyFilter: () => void;
  onCancel: () => void;
  jobs: Job[];
  isLoadingJobs: boolean;
  jobsError: string | null;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  selectedJob,
  onJobChange,
  onApplyFilter,
  onCancel,
  jobs,
  isLoadingJobs,
  jobsError,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        color: '#000000'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#000000' }}>Filter by Job</Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#000000' }}>
          Select Job
        </Typography>
        {isLoadingJobs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ color: '#000000' }} />
          </Box>
        ) : jobsError ? (
          <Alert severity="error" sx={{
            backgroundColor: 'rgba(211,47,47,0.1)',
            color: '#ff8a80',
            border: '1px solid rgba(211,47,47,0.3)',
            '& .MuiAlert-icon': {
              color: '#ff8a80'
            }
          }}>
            {jobsError}
          </Alert>
        ) : (
          <TextField
            select
            fullWidth
            value={selectedJob}
            onChange={onJobChange}
            sx={{
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              backgroundColor: 'white',
              '& .MuiSelect-select': {
                color: 'black'
              },
              '& .MuiInputLabel-root': {
                color: 'black'
              }
            }}
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
            <MenuItem value="">All Jobs</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job._id} value={job._id} sx={{ backgroundColor: 'white' }}>
                {job.jobDetails.title}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Button
          onClick={onCancel}
          sx={{
            borderColor: 'black',
            color: 'black',
            '&:hover': {
              borderColor: 'rgba(0, 255, 157, 1)',
              background: 'rgba(0, 255, 157, 0.08)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onApplyFilter}
          sx={{
            background: 'rgba(0, 255, 157, 1)',
            '&:hover': {
              background: 'rgba(0, 255, 157, 1)',
            }
          }}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;