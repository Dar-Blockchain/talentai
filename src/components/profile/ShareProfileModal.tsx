import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';

interface ShareProfileModalProps {
  open: boolean;
  onClose: () => void;
  shareMessage: string;
  profileUrl: string;
  profileName: string;
  linkedInConnected: boolean;
  onLinkedInConnect: () => void;
  onDirectPost: () => void;
  isPosting: boolean;
}

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  open,
  onClose,
  shareMessage,
  profileUrl,
  profileName,
  linkedInConnected,
  onLinkedInConnect,
  onDirectPost,
  isPosting,
}) => {
  const [copied, setCopied] = useState(false);

  // Debug: Log when linkedInConnected prop changes
  React.useEffect(() => {
    console.log('📊 ShareProfileModal - linkedInConnected prop:', linkedInConnected);
    console.log('📊 ShareProfileModal - open:', open);

    // Additional check: When modal opens, verify token in localStorage
    if (open && typeof window !== 'undefined') {
      const token = localStorage.getItem('linkedin_token');
      console.log('📊 ShareProfileModal - Token in localStorage:', !!token);
      if (token) {
        console.log('📊 ShareProfileModal - Token exists but linkedInConnected is:', linkedInConnected);
        if (!linkedInConnected) {
          console.warn('⚠️ MISMATCH: Token exists but prop is false!');
        }
      }
    }
  }, [linkedInConnected, open]);

  const handleCopyMessage = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenLinkedIn = () => {
    if (typeof window !== 'undefined') {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=600');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
          Share Your Profile
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!linkedInConnected ? (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Connect your LinkedIn account to post directly with your verified statistics!
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            ✓ LinkedIn Connected - Ready to post!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#000' }}>
            Your Profile URL
          </Typography>
          <TextField
            fullWidth
            value={profileUrl}
            InputProps={{
              readOnly: true,
              sx: {
                backgroundColor: '#f5f5f5',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000' }}>
              Share Message
            </Typography>
            <Button
              startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
              onClick={handleCopyMessage}
              size="small"
              sx={{
                textTransform: 'none',
                color: copied ? '#4caf50' : '#8310FF',
                fontWeight: 600,
              }}
            >
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={shareMessage}
            InputProps={{
              readOnly: true,
              sx: {
                backgroundColor: '#f5f5f5',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
            <strong>{linkedInConnected ? 'Direct Posting:' : 'How to share:'}</strong>
          </Typography>
          {linkedInConnected ? (
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              Click "Post to LinkedIn" below to automatically share your profile with all verified statistics!
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              1. Click "Connect LinkedIn" to authenticate<br />
              2. Then click "Post to LinkedIn" for direct sharing<br />
              3. Or use "Copy Message" for manual posting
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: '#666',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        {!linkedInConnected ? (
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={onLinkedInConnect}
            sx={{
              textTransform: 'none',
              background: '#0077B5',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: '#006399',
              },
            }}
          >
            Connect LinkedIn
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={isPosting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <LinkedInIcon />}
            onClick={onDirectPost}
            disabled={isPosting}
            sx={{
              textTransform: 'none',
              background: '#0077B5',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: '#006399',
              },
              '&:disabled': {
                background: '#99bfdc',
                color: '#fff',
              },
            }}
          >
            {isPosting ? 'Posting...' : 'Post to LinkedIn'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareProfileModal;
