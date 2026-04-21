import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  Dialog, DialogContent, TextField, IconButton,
  Alert, Stack, LinearProgress, Card,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { signinUser, verifyOTP, registerUser } from '@/store/slices/authSlice';
import { usePersistentCountdown } from '@/hooks/usePersistentCountdown';
import { getUserLocation } from '@/utils/api';
import { formatTimeLeft } from '@/utils/functions';
import { useRouter } from 'next/router';

const PURPLE = '#8310FF';
const PURPLE_LIGHT = 'rgba(131,16,255,0.08)';
const CODE_LENGTH = 6;
const CODE_TTL = 300;
const CODE_EXPIRY_KEY = 'job_apply_code_expires_at';

// step 'email'  → just email input (detect new vs existing)
// step 'form'   → full form for new users (name, phone, linkedin, CV)
// step 'otp'    → 6-digit code

type Step = 'email' | 'form' | 'otp';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontFamily: 'Poppins', fontSize: '0.88rem',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#9CA3AF' },
    '&.Mui-focused fieldset': { borderColor: PURPLE },
  },
  '& .MuiInputLabel-root': { fontFamily: 'Poppins', fontSize: '0.88rem' },
  '& .MuiFormHelperText-root': { fontFamily: 'Poppins' },
};

export interface OnboardingModalProps {
  open: boolean;
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: (token: string, user: any, profile: any) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, jobId, jobTitle, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', linkedin: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);

  const [code, setCode] = useState('');
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { secondsLeft, isExpired, isRunning, start: startTimer, clear: clearTimer } =
    usePersistentCountdown({ ttl: CODE_TTL, storageKey: CODE_EXPIRY_KEY });

  // CV analysis progress animation
  useEffect(() => {
    if (!analyzingCv) { setCvProgress(0); return; }
    setCvProgress(0);
    const timer = setInterval(() => {
      setCvProgress(prev => {
        if (prev >= 90) { clearInterval(timer); return 90; }
        return prev + (prev < 60 ? 4 : 1);
      });
    }, 300);
    return () => clearInterval(timer);
  }, [analyzingCv]);

  // ── Step: email ────────────────────────────────────────────────────────────

  const handleEmailContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setEmailError('Required'); return; }
    if (!validateEmail(trimmed)) { setEmailError('Invalid email'); return; }
    setEmailError('');
    setLoading(true);
    setApiError('');
    try {
      // Check if email belongs to a company/employee account — block them
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/check-role?email=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.role && data.role !== 'Candidate') {
            setApiError('This email is registered as a company account. Please use a personal email to apply.');
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore check errors, let signin handle it */ }

      // Try signin — if it works, user exists → go straight to OTP
      await dispatch(signinUser(trimmed)).unwrap();
      startTimer();
      setStep('otp');
    } catch (err: any) {
      const msg = (err || '').toString().toLowerCase();
      if (msg.includes('not found') || msg.includes('register')) {
        // New user → show full form
        setStep('form');
      } else {
        setApiError(err || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step: form (new users) ─────────────────────────────────────────────────

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!cvFile) e.cv = 'CV is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setFormErrors(p => ({ ...p, cv: 'PDF only' })); return; }
    if (file.size > 10 * 1024 * 1024) { setFormErrors(p => ({ ...p, cv: 'Max 10 MB' })); return; }
    setCvFile(file);
    setFormErrors(p => ({ ...p, cv: '' }));
  };

  const handleFormContinue = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    if (cvFile) setAnalyzingCv(true);
    try {
      const fd = new FormData();
      fd.append('email', email.trim().toLowerCase());
      fd.append('firstName', form.firstName.trim());
      fd.append('lastName', form.lastName.trim());
      fd.append('phone', form.phone.trim());
      fd.append('roleType', 'Candidate');
      if (cvFile) fd.append('resume', cvFile);
      await dispatch(registerUser(fd)).unwrap();
      startTimer();
      setStep('otp');
    } catch (err: any) {
      setApiError(err || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setAnalyzingCv(false);
    }
  };

  // ── Step: OTP ──────────────────────────────────────────────────────────────

  const handleCodeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      const arr = code.split(''); arr[index] = ''; setCode(arr.join('')); return;
    }
    const arr = code.split(''); arr[index] = raw[0]; setCode(arr.join(''));
    if (index < CODE_LENGTH - 1) codeInputsRef.current[index + 1]?.focus();
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!paste) return;
    const arr = code.split('');
    for (let i = 0; i < CODE_LENGTH; i++) arr[i] = paste[i] || arr[i] || '';
    setCode(arr.join(''));
    codeInputsRef.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeInputsRef.current[index - 1]?.focus();
  };

  const handleResend = async () => {
    setLoading(true); setApiError(''); setCode('');
    try {
      await dispatch(signinUser(email.trim().toLowerCase())).unwrap();
      startTimer();
    } catch (err: any) {
      setApiError(err || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) return;
    setLoading(true); setApiError('');
    try {
      const userLocation = await getUserLocation();
      const response = await dispatch(verifyOTP({
        email: email.trim().toLowerCase(),
        otp: code,
        location: userLocation,
      })).unwrap();
      if (!response.token) throw new Error('No token received');
      // Register as interview applicant (best-effort)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}interview-applicants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${response.token}` },
          body: JSON.stringify({
            jobId,
            firstName: form.firstName.trim() || response.profile?.firstName || '',
            lastName: form.lastName.trim() || response.profile?.lastName || '',
            email: email.trim().toLowerCase(),
            phone: form.phone.trim() || '',
            linkedin: form.linkedin.trim() || undefined,
            ref: 'link',
          }),
        });
      } catch { /* ignore */ }
      clearTimer();
      onSuccess(response.token, response.user, response.profile);
    } catch {
      setApiError('The code you entered is incorrect or expired. Please try again.');
      setLoading(false);
    }
  };

  // ── Reset / close ──────────────────────────────────────────────────────────

  const handleClose = () => {
    if (loading) return;
    setStep('email'); setEmail(''); setEmailError('');
    setForm({ firstName: '', lastName: '', phone: '', linkedin: '' });
    setFormErrors({}); setCvFile(null); setApiError(''); setCode('');
    clearTimer(); onClose();
  };

  const router = useRouter();

  // ── Render ─────────────────────────────────────────────────────────────────

  const btnSx = {
    mt: 3, textTransform: 'none' as const, fontWeight: 600, borderRadius: '38px',
    padding: '12px 24px', height: 42, maxWidth: '100%',
    background: PURPLE, color: '#ffffff', letterSpacing: 0.3, boxShadow: 'none',
    '&:hover': { background: '#6d0ee0', boxShadow: 'none' },
    '&.Mui-disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
  };

  const inputSx = {
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#666' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgb(203 203 203)' },
      '&:hover fieldset': { borderColor: 'rgb(203 203 203)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(203 203 203)' },
    },
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: '#ffffff', boxShadow: '0px 4px 50px 0px rgba(0,0,0,0.12)', overflow: 'hidden' } }}>

        {/* Close button */}
        {!loading && (
          <IconButton onClick={handleClose} size="small"
            sx={{ position: 'absolute', top: 12, right: 12, color: '#9CA3AF', zIndex: 1, '&:hover': { color: '#374151' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <DialogContent sx={{ px: { xs: 3, sm: 3.5 }, py: 3.5, textAlign: 'center' }}>

          {/* Back button row */}
          {(step === 'form' || step === 'otp') && !loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => { setStep('email'); setCode(''); setApiError(''); clearTimer(); }}
                sx={{ textTransform: 'none', color: '#666', fontWeight: 500, fontSize: '0.82rem', p: 0, minWidth: 0, '&:hover': { background: 'none', color: PURPLE } }}>
                Back
              </Button>
            </Box>
          )}

          {/* Logo + branding */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box component="img" src="/logo-purple.svg" alt="TalentAI Logo"
              sx={{ height: 32, cursor: 'pointer' }} onClick={() => router.push('/')} />
            <Typography variant="caption" sx={{ color: '#000', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.7rem', mt: 0.5 }}>
              Professional Recruitment
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight={600} sx={{ background: 'linear-gradient(135deg, rgba(131,16,255,0.33), #8310FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1, letterSpacing: '-0.01em' }}>
            {step === 'email' ? 'Apply for this role' : step === 'form' ? 'Create your profile' : 'Verify your email'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000', mb: 3, lineHeight: 1.6 }}>
            {step === 'email' ? jobTitle : step === 'form' ? `Creating account for ${email}` : `Enter the code sent to ${email}`}
          </Typography>

          {/* ── STEP: email ── */}
          {step === 'email' && (
            <Box component="form" onSubmit={e => { e.preventDefault(); handleEmailContinue(); }} sx={{ textAlign: 'left' }}>
              <TextField
                name="email" label="Email Address" type="email" value={email} autoFocus fullWidth
                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                error={!!emailError} helperText={emailError}
                InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.6)' }} /> }}
                sx={inputSx}
              />
              {apiError && <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', fontSize: '0.83rem' }}>{apiError}</Alert>}
              <Button type="submit" fullWidth variant="contained" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : undefined}
                sx={btnSx}>
                {loading ? 'Checking...' : 'Continue'}
              </Button>
            </Box>
          )}

          {/* ── STEP: form (new user) ── */}
          {step === 'form' && (
            <Box sx={{ textAlign: 'left' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5}>
                  <TextField label="First name" value={form.firstName} onChange={handleChange('firstName')}
                    error={!!formErrors.firstName} helperText={formErrors.firstName} fullWidth sx={inputSx} />
                  <TextField label="Last name" value={form.lastName} onChange={handleChange('lastName')}
                    error={!!formErrors.lastName} helperText={formErrors.lastName} fullWidth sx={inputSx} />
                </Stack>
                <TextField label="Phone number" value={form.phone} onChange={handleChange('phone')}
                  error={!!formErrors.phone} helperText={formErrors.phone} fullWidth sx={inputSx} />
                <TextField label="LinkedIn profile URL (optional)" value={form.linkedin} onChange={handleChange('linkedin')}
                  fullWidth placeholder="https://linkedin.com/in/yourname" sx={inputSx} />

                {/* CV upload */}
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', mb: 0.75 }}>
                    CV / Resume <Typography component="span" sx={{ fontWeight: 400, color: '#DC2626', fontSize: '0.78rem' }}>*</Typography>
                  </Typography>
                  <Box onClick={() => fileInputRef.current?.click()} sx={{
                    border: `2px dashed ${formErrors.cv ? '#DC2626' : cvFile ? PURPLE : '#E5E7EB'}`,
                    borderRadius: '12px', p: 2.5, textAlign: 'center', cursor: 'pointer',
                    bgcolor: cvFile ? PURPLE_LIGHT : '#FAFAFA', transition: 'border-color 0.2s',
                    '&:hover': { borderColor: PURPLE, bgcolor: PURPLE_LIGHT },
                  }}>
                    <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileChange} />
                    {cvFile ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 20, color: PURPLE }} />
                        <Typography sx={{ fontSize: '0.83rem', color: PURPLE, fontWeight: 600 }}>{cvFile.name}</Typography>
                      </Box>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 28, color: '#9CA3AF', mb: 0.5 }} />
                        <Typography sx={{ fontSize: '0.82rem', color: '#6B7280' }}>Click to upload (PDF, max 10 MB)</Typography>
                      </>
                    )}
                  </Box>
                  {formErrors.cv && <Typography sx={{ fontSize: '0.75rem', color: '#DC2626', mt: 0.5 }}>{formErrors.cv}</Typography>}
                </Box>
              </Stack>

              {apiError && <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', fontSize: '0.83rem' }}>{apiError}</Alert>}
              <Button fullWidth variant="contained" onClick={handleFormContinue} disabled={loading}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : undefined}
                sx={btnSx}>
                {loading ? (cvFile ? 'Analyzing CV...' : 'Creating account...') : 'Create Account & Continue'}
              </Button>
            </Box>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <Box>
              <Stack direction="row" spacing={1} justifyContent="center">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <TextField key={i}
                    inputRef={el => (codeInputsRef.current[i] = el)}
                    value={code[i] || ''}
                    onChange={e => handleCodeChange(i, e as React.ChangeEvent<HTMLInputElement>)}
                    onPaste={handleCodePaste}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.25rem' } }}
                    sx={{ width: 48, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgb(203 203 203)' }, '&:hover fieldset': { borderColor: 'rgb(203 203 203)' }, '&.Mui-focused fieldset': { borderColor: 'rgb(203 203 203)' } } }}
                  />
                ))}
              </Stack>

              {(isRunning || isExpired) && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontWeight: 500, color: secondsLeft > 10 ? 'text.secondary' : secondsLeft > 0 ? 'warning.main' : 'error.main', transition: 'color 0.3s ease' }}>
                  {secondsLeft > 0 ? `Code expires in ${formatTimeLeft(secondsLeft)}` : 'The verification code has expired'}
                </Typography>
              )}

              {apiError && <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', fontSize: '0.83rem' }}>{apiError}</Alert>}

              <Button fullWidth variant="contained" disabled={loading || (!isExpired && code.length < CODE_LENGTH)}
                onClick={isExpired ? handleResend : handleVerify}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : undefined}
                sx={btnSx}>
                {loading
                  ? (isExpired ? 'Resending...' : 'Verifying...')
                  : (isExpired ? 'Resend Code' : 'Verify & Start Interview')}
              </Button>

              <Button variant="text" fullWidth onClick={() => { setStep('email'); setCode(''); setApiError(''); clearTimer(); }} disabled={loading}
                sx={{ mt: 2, px: 2, py: 1, color: PURPLE, borderRadius: '38px', fontWeight: 500, textTransform: 'none', boxShadow: 'none', transition: 'all 0.3s ease-in-out', background: 'rgba(0,0,0,0.05)', ':hover': { transform: 'scale(1.02)' }, ':active': { transform: 'scale(0.98)' } }}>
                Change email
              </Button>
            </Box>
          )}

        </DialogContent>
      </Dialog>

      {/* ── CV Analysis Modal (same as register page) ── */}
      <Dialog open={analyzingCv} disableEscapeKeyDown PaperProps={{ sx: { borderRadius: 4, p: 0, minWidth: 340, maxWidth: 380, overflow: 'hidden', boxShadow: '0 24px 60px rgba(131,16,255,0.15)' } }}>
        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PURPLE} ${cvProgress}%, rgba(131,16,255,0.15) ${cvProgress}%)`, transition: 'background 0.4s ease' }} />
        <DialogContent sx={{ px: 4, py: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(131,16,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CircularProgress size={22} thickness={5} sx={{ color: PURPLE }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#111', lineHeight: 1.3, fontFamily: 'Poppins' }}>
                Analyzing your CV
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Poppins' }}>
                AI-powered extraction in progress
              </Typography>
            </Box>
          </Box>

          {[
            { label: 'Reading document', threshold: 0 },
            { label: 'Extracting skills & experience', threshold: 30 },
            { label: 'Building your profile', threshold: 65 },
          ].map(({ label, threshold }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cvProgress > threshold ? 'rgba(131,16,255,0.1)' : 'rgba(0,0,0,0.04)', transition: 'background 0.4s' }}>
                {cvProgress > threshold
                  ? <CheckCircleOutlineIcon sx={{ fontSize: 13, color: PURPLE }} />
                  : <CircularProgress size={10} thickness={5} sx={{ color: cvProgress >= threshold ? PURPLE : '#ccc' }} />
                }
              </Box>
              <Typography variant="caption" sx={{ color: cvProgress > threshold ? '#333' : '#aaa', fontWeight: cvProgress > threshold ? 600 : 400, transition: 'color 0.4s', fontFamily: 'Poppins' }}>
                {label}
              </Typography>
            </Box>
          ))}

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem', fontFamily: 'Poppins' }}>Processing...</Typography>
              <Typography variant="caption" sx={{ color: PURPLE, fontWeight: 700, fontSize: '0.65rem', fontFamily: 'Poppins' }}>{cvProgress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={cvProgress} sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(131,16,255,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, ${PURPLE}, rgba(131,16,255,0.6))` } }} />
          </Box>

          <Typography variant="caption" sx={{ color: '#bbb', textAlign: 'center', mt: -1, fontFamily: 'Poppins' }}>
            Please don&apos;t close this page
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingModal;
