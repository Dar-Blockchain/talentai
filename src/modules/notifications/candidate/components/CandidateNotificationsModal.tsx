import React from 'react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CandidateNotificationsPanel from './CandidateNotificationsPanel';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CandidateNotificationsModal: React.FC<Props> = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: { borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.14)' },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1.5 }}>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' }, borderRadius: '10px' }}
      >
        <CloseIcon sx={{ fontSize: 18, color: '#6B7280' }} />
      </IconButton>
    </Box>
    <DialogContent sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
      <CandidateNotificationsPanel variant="tab" />
    </DialogContent>
  </Dialog>
);

export default CandidateNotificationsModal;
