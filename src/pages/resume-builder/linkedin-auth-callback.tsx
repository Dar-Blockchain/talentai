import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function AuthSuccess() {
  const router = useRouter();
  const { token, provider } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    // Debug info
    console.log('Router ready:', router.isReady);
    console.log('Token present:', !!token);
    console.log('Token length:', token ? (token as string).length : 0);
    
    if (!token) {
      // If no token is found after router is ready, show error
      if (router.isReady) {
        setStatus('error');
        setMessage('No authentication token was provided. Please try again.');
      }
      return;
    }
    
    // Set a timeout to show feedback before closing
    const timeout = setTimeout(() => {
      // Save token to localStorage if needed
      // Assume LinkedIn if no provider is specified
      if ((provider === 'linkedin' || !provider) && typeof token === 'string') {
        try {
          localStorage.setItem('linkedin_token', token);
          console.log('LinkedIn token saved to localStorage');
          
          // Post message to parent window (if this was opened in a popup)
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              provider: 'linkedin',
              token
            }, window.location.origin);
            
            // Close the popup if we're in one
            setTimeout(() => window.close(), 2000);
          } else {
            // Redirect back to resume builder if not in a popup
            router.push('/resume-builder?linkedin=success');
          }
          
          setStatus('success');
          setMessage('Authentication successful! You can close this window.');
        } catch (error) {
          console.error('Error saving token:', error);
          setStatus('error');
          setMessage('There was an error saving your authentication token.');
        }
      }
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [token, provider, router]);
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f7fb',
        p: 3
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={60} sx={{ my: 3, color: '#4285f4' }} />
            <Typography variant="h5" gutterBottom>
              Processing Authentication
            </Typography>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 70, my: 3, color: '#34a853' }} />
            <Typography variant="h5" gutterBottom>
              Authentication Successful
            </Typography>
          </>
        )}
        
        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 70, my: 3, color: '#ea4335' }} />
            <Typography variant="h5" gutterBottom>
              Authentication Error
            </Typography>
          </>
        )}
        
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        
        {status === 'success' && (
          <Typography variant="body2" sx={{ mt: 4 }}>
            You can now close this window and return to the resume builder.
          </Typography>
        )}
      </Paper>
    </Box>
  );
} 