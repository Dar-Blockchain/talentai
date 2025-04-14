// pages/auth/signin.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  Avatar,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  LockClock as LockClockIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

type EmailFormData = { email: string };
type CodeFormData  = { code: string };

export default function SignIn() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register, handleSubmit, formState: { errors }, watch } =
    useForm<EmailFormData & CodeFormData>();

  const email = watch('email');

  const sendCode = async (emailToSend: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to send code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const onEmailSubmit = async ({ email }: EmailFormData) => {
    await sendCode(email);
  };

  // NOTE: We no longer need onCodeSubmit for routing,
  // but we keep it if you want to actually verify.
  const onCodeSubmit = async ({ code }: CodeFormData) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('email-code', {
        email,
        code,
        redirect: false
      });
      if (result?.error) throw new Error(result.error);
      // If you still want to verify before routing, keep this:
      // router.push('/preferences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

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

        {/* EMAIL FORM */}
        <Box component="form" onSubmit={handleSubmit(onEmailSubmit)} sx={{ mb: 2 }}>
          <TextField
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
            fullWidth
            variant="outlined"
            label="Email Address"
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {/* CODE INPUT */}
        <TextField
          {...register('code', {
            required: 'Code is required',
            pattern: { value: /^\d{6}$/, message: 'Enter a 6‑digit code' }
          })}
          error={!!errors.code}
          helperText={errors.code?.message}
          disabled={loading}
          fullWidth
          variant="outlined"
          label="Verification Code"
          InputProps={{
            startAdornment: <LockClockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={() => {/* no-op now */}}
                  disabled={loading || !email}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? <CircularProgress size={16} /> : 'Get Code'}
                </Button>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* VERIFY BUTTON now just navigates */}
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={() => router.push('/preferences')}   // ← go to preferences
          sx={{ py: 1.5, textTransform: 'none', mb: 2 }}
        >
          Verify
        </Button>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => signIn('google', { callbackUrl: '/preferences' })}
          disabled={loading}
          sx={{ py: 1.5, textTransform: 'none', '&:hover': { backgroundColor: theme.palette.action.hover } }}
        >
          Continue with Google
        </Button>
      </Card>
    </Box>
  );
}
