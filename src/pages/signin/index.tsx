// pages/auth/signin.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Avatar,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  LockClock as LockClockIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { registerUser, verifyOTP } from '../../store/features/authSlice';
import type { RootState, AppDispatch } from '../../store/store';

type EmailFormData = { email: string };
type CodeFormData = { code: string };

export default function SignIn() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: reduxError } = useSelector((state: RootState) => state.auth);

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors }, watch: watchEmail } = useForm<EmailFormData>();
  const { register: registerCode, handleSubmit: handleCodeSubmit, formState: { errors: codeErrors }, watch: watchCode } = useForm<CodeFormData>();
  
  const email = watchEmail('email');
  const code = watchCode('code');

  const onEmailSubmit = async (data: EmailFormData) => {
    const emailToSend = data.email.toLowerCase().trim();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await dispatch(registerUser(emailToSend)).unwrap();
      setShowVerification(true);
      setSuccess(`Please verify your email - we've sent a code to ${emailToSend}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (data: CodeFormData) => {
    if (!code || !email) return;
    setError('');
    try {
      const response = await dispatch(verifyOTP({ 
        email: email.toLowerCase().trim(), 
        otp: code 
      })).unwrap();
      
      // Check if we have a token before redirecting
      if (response.token) {
        // Store the token in localStorage
        localStorage.setItem('api_token', response.token);
        // Also store in cookies for API requests
        document.cookie = `api_token=${response.token}; path=/; max-age=2592000`; // 30 days
        router.push('/preferences');
      } else {
        setError('Verification successful but no token received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  // Use Redux error if available
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#00072D',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(2,226,255,0.4), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(0,255,195,0.3), transparent 50%)
        `,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card elevation={8} sx={{ width: 360, p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Avatar src="/logo.svg" sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to access your recruitment dashboard
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* EMAIL FORM */}
        <Box component="form" onSubmit={handleEmailSubmit(onEmailSubmit)} sx={{ mb: 2 }}>
          <TextField
            {...registerEmail('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={!!emailErrors.email}
            helperText={emailErrors.email?.message}
            disabled={loading || isLoading}
            fullWidth
            variant="outlined"
            label="Email Address"
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* CODE INPUT */}
        <Box component="form" onSubmit={handleCodeSubmit(onVerifySubmit)}>
          <TextField
            {...registerCode('code')}
            error={!!codeErrors.code}
            helperText={codeErrors.code?.message}
            disabled={loading || isLoading || !showVerification}
            fullWidth
            variant="outlined"
            label="Verification Code"
            InputProps={{
              startAdornment: <LockClockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleEmailSubmit(onEmailSubmit)}
                    disabled={loading || isLoading || !email}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    {loading || isLoading ? <CircularProgress size={16} /> : 'Get Code'}
                  </Button>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* VERIFY BUTTON */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || isLoading || !showVerification || !code}
            sx={{ py: 1.5, textTransform: 'none', mb: 2 }}
          >
            Verify
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => signIn('google', { callbackUrl: '/preferences' })}
          disabled={loading || isLoading}
          sx={{ py: 1.5, textTransform: 'none', '&:hover': { backgroundColor: theme.palette.action.hover } }}
        >
          Continue with Google
        </Button>
      </Card>
    </Box>
  );
}
