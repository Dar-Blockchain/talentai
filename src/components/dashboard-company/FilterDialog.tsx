import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface FilterDialogProps {
  open: boolean;
  selectedJob: string;
  myJobs: Array<{ _id: string; jobDetails: { title: string } }>;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onJobChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onApply: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  selectedJob,
  myJobs,
  isLoading,
  error,
  onClose,
  onJobChange,
  onClear,
  onApply
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', background: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } }}>
    <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', color: '#000' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Filter by Job</Typography>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#000' }}>Select Job</Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} sx={{ color: '#000' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ backgroundColor: 'rgba(211,47,47,0.1)', color: '#ff8a80', border: '1px solid rgba(211,47,47,0.3)', '& .MuiAlert-icon': { color: '#ff8a80' } }}>
          {error}
        </Alert>
      ) : (
        <TextField select fullWidth value={selectedJob} onChange={onJobChange} sx={{ color: 'black', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, backgroundColor: 'white', '& .MuiSelect-select': { color: 'black' }, '& .MuiInputLabel-root': { color: 'black' } }} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300, backgroundColor: 'white', '& .MuiMenuItem-root': { color: 'black', '&:hover': { backgroundColor: 'rgba(0, 255, 157, 0.1)' }, '&.Mui-selected': { backgroundColor: 'rgba(0, 255, 157, 0.2)', '&:hover': { backgroundColor: 'rgba(0, 255, 157, 0.3)' } } } } } } }}>
          <MenuItem value="">All Jobs</MenuItem>
          {myJobs.map(job => (
            <MenuItem key={job._id} value={job._id}>{job.jobDetails.title}</MenuItem>
          ))}
        </TextField>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <Button onClick={onClear} sx={{ borderColor: 'black', color: 'black', '&:hover': { borderColor: 'rgba(0, 255, 157, 1)', background: 'rgba(0, 255, 157, 0.08)' } }}>
        Cancel
      </Button>
      <Button variant="contained" onClick={onApply} sx={{ background: 'rgba(0, 255, 157, 1)', '&:hover': { background: 'rgba(0, 255, 157, 1)' } }}>
        Apply Filter
      </Button>
    </DialogActions>
  </Dialog>
);