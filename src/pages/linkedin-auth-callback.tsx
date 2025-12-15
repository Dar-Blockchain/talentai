import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Box, CircularProgress, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function LinkedInAuthCallback() {
  const router = useRouter();
  const { token, provider } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    // Debug info
    console.log('LinkedIn Auth Callback - Router ready:', router.isReady);
    console.log('LinkedIn Auth Callback - Token present:', !!token);
    console.log('LinkedIn Auth Callback - Token length:', token ? (token as string).length : 0);

    if (!token) {
      // If no token is found after router is ready, show error
      if (router.isReady) {
        setStatus('error');
        setMessage('No authentication token was provided. Please try again.');
      }
      return;
    }

    // Process immediately - no delay
    if ((provider === 'linkedin' || !provider) && typeof token === 'string') {
      try {
        // CRITICAL FIX: Decode the token before saving
        // The API encodes it for URL safety, but we need the raw token
        const decodedToken = decodeURIComponent(token);
        console.log('Decoded token from URL encoding');

        localStorage.setItem('linkedin_token', decodedToken);
        console.log('✅ LinkedIn token saved to localStorage (decoded)');

        // Post message to parent window IMMEDIATELY (if this was opened in a popup)
        if (window.opener) {
          console.log('🔍 window.opener exists:', !!window.opener);
          console.log('🔍 window.location.origin:', window.location.origin);
          console.log('🔍 Decoded token length:', decodedToken.length);

          // Send message multiple times to ensure delivery
          const sendAuthMessage = () => {
            // Try sending to parent's origin first, then wildcard as fallback
            try {
              window.opener.postMessage({
                type: 'AUTH_SUCCESS',
                provider: 'linkedin',
                token: decodedToken
              }, window.location.origin);

              // Also send to wildcard to ensure delivery if origin mismatch
              window.opener.postMessage({
                type: 'AUTH_SUCCESS',
                provider: 'linkedin',
                token: decodedToken
              }, '*');
            } catch (error) {
              console.error('❌ Error posting message:', error);
            }
          };

          // Send immediately
          sendAuthMessage();
          console.log('📤 Posted AUTH_SUCCESS message to parent window (both specific origin and wildcard)');

          // Retry every 300ms for 2 seconds to ensure message is received
          const retryInterval = setInterval(sendAuthMessage, 300);
          setTimeout(() => {
            clearInterval(retryInterval);
            console.log('Stopped retry messages');
          }, 2000);

          // Show success UI briefly, then close popup
          setTimeout(() => {
            setStatus('success');
            setMessage('Authentication successful! Closing...');
          }, 500);

          // Close the popup after showing success
          const closeTimeout = setTimeout(() => {
            console.log('Closing popup window...');
            window.close();
          }, 2500);

          return () => {
            clearInterval(retryInterval);
            clearTimeout(closeTimeout);
          };
        } else {
          // Not in a popup - show success and redirect
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          console.log('Not in popup, redirecting to home...');
          const redirectTimeout = setTimeout(() => router.push('/'), 1500);
          return () => clearTimeout(redirectTimeout);
        }
      } catch (error) {
        console.error('❌ Error saving LinkedIn token:', error);
        setStatus('error');
        setMessage('There was an error saving your authentication token.');
      }
    }
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
            <CircularProgress size={60} sx={{ my: 3, color: '#8310FF' }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Processing Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connecting your LinkedIn account...
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 70, my: 3, color: '#34a853' }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Authentication Successful
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Your LinkedIn account has been connected successfully.
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 70, my: 3, color: '#ea4335' }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Authentication Error
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {message}
            </Typography>
          </>
        )}

        {status === 'success' && (
          <Typography variant="body2" sx={{ mt: 4, color: '#666' }}>
            This window will close automatically. You can now use LinkedIn features in the app.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
