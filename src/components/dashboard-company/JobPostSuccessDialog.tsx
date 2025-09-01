import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

interface JobPostSuccessDialogProps {
  open: boolean;
  onClose: () => void;
}

const JobPostSuccessDialog: React.FC<JobPostSuccessDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const router = useRouter();

  const handleViewDashboard = () => {
    onClose();
    router.push('/dashboard/company');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
          }
        }
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Box
            sx={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(2, 226, 255, 0.1), rgba(0, 255, 195, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-2px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #02E2FF, #00FFC3)',
                opacity: 0.5,
                animation: 'pulse 2s infinite',
              }
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: '#00FFC3' }} />
          </Box>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 600,
              mb: 2,
              background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Job Posted Successfully!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 3,
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            Your job has been posted and is now visible to potential candidates. You can manage it from your dashboard.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: '#02E2FF',
                borderColor: 'rgba(2, 226, 255, 0.3)',
                '&:hover': {
                  borderColor: '#02E2FF',
                  background: 'rgba(2, 226, 255, 0.1)',
                },
                px: 3,
                py: 1,
                borderRadius: '12px',
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleViewDashboard}
              sx={{
                background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                color: '#1E293B',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(90deg, #00FFC3, #02E2FF)',
                },
                px: 3,
                py: 1,
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 255, 195, 0.3)',
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostSuccessDialog;
