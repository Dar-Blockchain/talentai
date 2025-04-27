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
  CircularProgress,
  Container
} from '@mui/material';
import {
  Email as EmailIcon,
  LockClock as LockClockIcon,
  Google as GoogleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { registerUser, verifyOTP } from '../../store/features/authSlice';
import type { RootState, AppDispatch } from '../../store/store';
import Cookies from 'js-cookie';
import Link from 'next/link';

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
        // First clear any existing tokens
        localStorage.removeItem('api_token');
        Cookies.remove('api_token');
        
        // Then set the new token with a small delay to ensure it's set
        localStorage.setItem('api_token', response.token);
        Cookies.set('api_token', response.token, {
          expires: 30, // 30 days
          path: '/',
          sameSite: 'lax'
        });
        
        // Add a small delay before redirecting to ensure tokens are set
        setTimeout(() => {
          router.push('/preferences');
        }, 100);
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
        background: '#00072D',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(2, 226, 255, 0.15), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(0, 255, 195, 0.15), transparent 50%)
        `,
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navigation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          background: 'rgba(0, 7, 45, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(2, 226, 255, 0.1)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              background: 'rgba(2, 226, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(2, 226, 255, 0.1)',
              '&:hover': {
                color: '#02E2FF',
                background: 'rgba(2, 226, 255, 0.1)',
                border: '1px solid rgba(2, 226, 255, 0.2)',
                transform: 'translateX(-4px)',
                '& .arrow-icon': {
                  transform: 'translateX(-4px)',
                },
                '& .text-gradient': {
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }
              },
            }}
          >
            <ArrowBackIcon 
              className="arrow-icon"
              sx={{ 
                fontSize: '1.25rem',
                transition: 'transform 0.3s ease',
              }} 
            />
            <Box
              className="text-gradient"
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.3s ease',
              }}
            >
              Back to Home
            </Box>
          </Box>
        </Link>

        {/* Optional: Add a divider or additional navigation items */}
        <Box
          sx={{
            height: '24px',
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(2, 226, 255, 0.2), transparent)',
          }}
        />
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card 
          elevation={8} 
          sx={{ 
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(2, 226, 255, 0.08)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(2, 226, 255, 0.1) inset,
              0 0 32px rgba(2, 226, 255, 0.05) inset
            `,
            transform: 'translateY(-2vh)',
          }}
        >
          <Box 
            sx={{ 
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Glow effect behind the text */}
            <Box
              sx={{
                position: 'absolute',
                width: '120px',
                height: '40px',
                background: 'rgba(2, 226, 255, 0.15)',
                filter: 'blur(20px)',
                borderRadius: '20px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
                '&::before': {
                  content: '"TalentAI"',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  background: 'linear-gradient(135deg, rgba(2, 226, 255, 0.4), rgba(0, 255, 195, 0.4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'blur(4px)',
                  zIndex: -1,
                },
              }}
            >
              TalentAI
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                mt: 0.5,
              }}
            >
              Professional Recruitment
            </Typography>
          </Box>

          <Typography 
            variant="h5" 
            fontWeight={600} 
            sx={{
              background: 'linear-gradient(135deg, #02E2FF, #00FFC3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              letterSpacing: '-0.01em',
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              mb: 4,
              maxWidth: '80%',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Sign in to access your recruitment dashboard
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(211, 47, 47, 0.08)',
                borderLeft: '4px solid #ff4444',
                '& .MuiAlert-icon': {
                  color: '#ff4444'
                }
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(46, 125, 50, 0.08)',
                borderLeft: '4px solid #00FFC3',
                '& .MuiAlert-icon': {
                  color: '#00FFC3'
                }
              }}
            >
              {success}
            </Alert>
          )}

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
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(2, 226, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(2, 226, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#02E2FF',
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
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
                startAdornment: <LockClockIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={handleEmailSubmit(onEmailSubmit)}
                      disabled={loading || isLoading || !email}
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        color: '#02E2FF',
                        '&:hover': {
                          background: 'rgba(2, 226, 255, 0.1)',
                        }
                      }}
                    >
                      {loading || isLoading ? <CircularProgress size={16} /> : 'Get Code'}
                    </Button>
                  </InputAdornment>
                ),
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(2, 226, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(2, 226, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#02E2FF',
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
              sx={{ mb: 2 }}
            />

            {/* VERIFY BUTTON */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || isLoading || !showVerification || !code}
              sx={{ 
                py: 1.5, 
                textTransform: 'none', 
                mb: 2,
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              {loading || isLoading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Verify'
              )}
            </Button>
          </Box>

          <Divider sx={{ 
            my: 2,
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            OR
          </Divider>

          {/* GOOGLE SIGN IN */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => signIn('google')}
            sx={{
              py: 1.5,
              textTransform: 'none',
              color: '#fff',
              borderColor: 'rgba(2, 226, 255, 0.2)',
              '&:hover': {
                borderColor: '#02E2FF',
                background: 'rgba(2, 226, 255, 0.1)',
              }
            }}
          >
            Continue with Google
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
