import React from 'react';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import { CameraStatus, InterviewStatus } from '@/types/interview';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  isConnecting: boolean;
  interviewStatus: InterviewStatus;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  cameraStatus,
  cameraError,
  isConnecting,
  interviewStatus,
}) => {
  return (
    <Paper elevation={2} sx={{
      p: 2,
      mb: 3,
      ...(interviewStatus === 'active' ? {
        position: 'relative',
        maxWidth: '300px',
        ml: 'auto',
        mr: 0
      } : {})
    }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1rem' }}>
        Camera Preview
      </Typography>
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: interviewStatus === 'active' ? '280px' : '400px',
        aspectRatio: '4/3',
        mx: interviewStatus === 'active' ? 0 : 'auto',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
        border: '1px solid #e0f7fa',
        bgcolor: '#f5f5f5',
        transition: 'all 0.3s ease'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror the video
            display: cameraStatus === 'granted' ? 'block' : 'none'
          }}
        />

        {/* Camera Status Overlays */}
        {cameraStatus === 'idle' && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666'
          }}>
            <Typography variant="body2">Camera will initialize when page loads</Typography>
          </Box>
        )}

        {cameraStatus === 'requesting' && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            color: '#666'
          }}>
            <CircularProgress size={24} />
            <Typography variant="caption">Requesting camera permission...</Typography>
          </Box>
        )}

        {cameraStatus === 'denied' && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#f44336'
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Camera access denied</Typography>
            <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
              Please allow camera access and try again
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ mt: 1 }}
            >
              Refresh Page
            </Button>
          </Box>
        )}

        {cameraStatus === 'error' && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#f44336'
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Camera error</Typography>
            <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
              {cameraError || 'Unable to access camera'}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Box>
        )}

        {isConnecting && cameraStatus === 'granted' && (
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            p: 1,
            borderRadius: 1
          }}>
            <CircularProgress size={16} sx={{ color: 'white' }} />
            <Typography variant="caption">Connecting transcription...</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CameraPreview;
