'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress, TextField, InputAdornment } from '@mui/material';
import dynamic from 'next/dynamic';
import {
  ErrorOutline as ErrorIcon,
  LockOutlined as LockIcon,
  PlayArrowOutlined as PlayIcon,
  LoginOutlined as LoginIcon,
  AssignmentOutlined as QuestionnaireIcon,
  PsychologyOutlined as AIIcon,
  AssignmentTurnedInOutlined as SkillIcon,
  PersonOutlined as PersonIcon,
  EmailOutlined as EmailIcon,
  CheckCircleOutline as CheckIcon,
  ArrowForwardOutlined as ArrowIcon,
  TimerOutlined as TimerIcon,
  GroupOutlined as GroupIcon,
  BusinessOutlined as CompanyIcon,
} from '@mui/icons-material';
import { fetchCampaignByLinkToken, joinCampaignByLink } from '@/store/slices/campaignSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Campaign } from '@/types/campaign';
import { fmtDate } from '@/utils/functions';

/* ── palette ──────────────────────────────────────────────────────────────── */
const P = {
  indigo:    '#6366F1',
  indigoSoft:'#EEF2FF',
  indigoBdr: '#C7D2FE',
  violet:    '#8B5CF6',
  violetSoft:'#F5F3FF',
  amber:     '#D97706',
  amberSoft: '#FFFBEB',
  slate50:   '#F8FAFC',
  slate100:  '#F1F5F9',
  slate200:  '#E2E8F0',
  slate400:  '#94A3B8',
  slate500:  '#64748B',
  slate700:  '#334155',
  slate900:  '#0F172A',
  red:       '#E11D48',
  redSoft:   '#FFF1F2',
  redBdr:    '#FECDD3',
  green:     '#16A34A',
  greenSoft: '#F0FDF4',
  white:     '#fff',
};

const MODULE_META: Record<string, { icon: React.ElementType; label: string; accent: string; soft: string; bdr: string; desc: string }> = {
  QUESTIONNAIRE: { icon: QuestionnaireIcon, label: 'Questionnaire',   accent: P.violet,  soft: P.violetSoft, bdr: '#DDD6FE', desc: 'Answer a series of questions at your own pace.' },
  AI_INTERVIEW:  { icon: AIIcon,           label: 'AI Interview',    accent: P.indigo,  soft: P.indigoSoft, bdr: P.indigoBdr, desc: 'Have a dynamic conversation with our AI interviewer.' },
  SKILL_TEST:    { icon: SkillIcon,        label: 'Skill Assessment', accent: P.amber,   soft: P.amberSoft,  bdr: '#FDE68A', desc: 'Demonstrate your skills through practical tasks.' },
};

/* ── page ─────────────────────────────────────────────────────────────────── */
const CampaignJoinPage: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = router.query as { token?: string };
  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [joining,  setJoining]  = useState(false);
  const [joinErr,  setJoinErr]  = useState<string | null>(null);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [nameErr,  setNameErr]  = useState('');
  const [emailErr, setEmailErr] = useState('');

  useEffect(() => {
    if (!router.isReady || !token) return;
    setLoading(true);
    dispatch(fetchCampaignByLinkToken(token))
      .unwrap().then(setCampaign).catch(setError).finally(() => setLoading(false));
  }, [router.isReady, token, dispatch]);

  useEffect(() => {
    if (!campaign || !user || joining || joinErr) return;
    if (campaign.anonymityMode === 'NOMINATIVE') handleJoin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign, user]);

  const handleJoin = async (opts?: { name?: string; email?: string }) => {
    if (!token) return;
    setJoining(true); setJoinErr(null);
    try {
      const r = await dispatch(joinCampaignByLink({ token, ...opts })).unwrap();
      if (r.anonymousToken || r.linkAccessToken) router.push(`/campaign/assessment/${r.campaignId}`);
      else router.push(`/employee/campaigns/${r.campaignId}/assessment`);
    } catch (e: any) { setJoinErr(e); setJoining(false); }
  };

  const handleFormSubmit = () => {
    let valid = true;
    if (!name.trim()) { setNameErr('Please enter your name'); valid = false; } else setNameErr('');
    if (!email.trim()) { setEmailErr('Please enter your email'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailErr('Please enter a valid email'); valid = false; }
    else setEmailErr('');
    if (!valid) return;
    handleJoin({ name: name.trim(), email: email.trim() });
  };

  const goSignIn = () => router.push(`/signin?returnUrl=${encodeURIComponent(router.asPath)}`);

  /* loading */
  if (!router.isReady || loading) return (
    <Shell bg={`linear-gradient(160deg, ${P.indigoSoft} 0%, ${P.white} 60%, ${P.violetSoft} 100%)`}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{
          px: 2.5, py: 1.25, borderRadius: '14px', mx: 'auto', mb: 3,
          bgcolor: P.white, border: `1px solid ${P.slate200}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'inline-flex', alignItems: 'center',
        }}>
          <Box component="img" src="/logo-purple.svg" alt="TalentAI" sx={{ height: 24, display: 'block' }} />
        </Box>
        <CircularProgress size={20} thickness={4} sx={{ color: P.indigo }} />
        <Typography sx={{ fontSize: '0.8rem', color: P.slate400, mt: 1.5, fontWeight: 500 }}>Loading campaign…</Typography>
      </Box>
    </Shell>
  );

  /* error */
  if (error || !campaign) return (
    <Shell bg={`linear-gradient(160deg, ${P.indigoSoft} 0%, ${P.white} 60%, ${P.redSoft} 100%)`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400, width: '100%', gap: 2 }}>
        <Box sx={{
          px: 2.5, py: 1.25, borderRadius: '14px',
          bgcolor: P.white, border: `1px solid ${P.slate200}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'inline-flex',
        }}>
          <Box component="img" src="/logo-purple.svg" alt="TalentAI" sx={{ height: 22, display: 'block' }} />
        </Box>
        <Box sx={{
          width: '100%', textAlign: 'center',
          bgcolor: P.white, borderRadius: '24px', p: 5,
          border: `1px solid ${P.redBdr}`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
        }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 3,
            bgcolor: P.redSoft, border: `1px solid ${P.redBdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ErrorIcon sx={{ fontSize: 30, color: P.red }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: P.slate900, mb: 1 }}>Campaign Not Found</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: P.slate500, lineHeight: 1.65 }}>
            {error ?? 'This link is invalid or the campaign is no longer available.'}
          </Typography>
        </Box>
      </Box>
    </Shell>
  );

  const isExpired   = campaign.deadline ? new Date(campaign.deadline).getTime() < Date.now() : false;
  const isAnon      = campaign.anonymityMode === 'ANONYMOUS';
  const isAccounts  = campaign.accessMethod === 'ACCOUNTS';
  const mod         = MODULE_META[campaign.module?.type] ?? MODULE_META.QUESTIONNAIRE;
  const ModIcon     = mod.icon;
  const companyName = campaign.company && typeof campaign.company === 'object' ? (campaign.company as any).name : null;

  return (
    <Shell bg={`linear-gradient(160deg, ${P.indigoSoft} 0%, ${P.white} 55%, ${P.violetSoft} 100%)`}>

      {/* subtle dot grid */}
      <Box sx={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(${P.slate200} 1px, transparent 1px)`,
        backgroundSize: '28px 28px', opacity: 0.55,
      }} />

      <Box sx={{ maxWidth: 460, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
          <Box sx={{
            px: 2.5, py: 1.25, borderRadius: '16px',
            bgcolor: P.white, border: `1px solid ${P.slate200}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'inline-flex', alignItems: 'center',
          }}>
            <Box component="img" src="/logo-purple.svg" alt="TalentAI" sx={{ height: 26, display: 'block' }} />
          </Box>
        </Box>

        {/* card */}
        <Box sx={{
          bgcolor: P.white, borderRadius: '24px',
          border: `1px solid ${P.slate200}`,
          boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>

          {/* ── header ── */}
          <Box sx={{
            px: { xs: 3, sm: 4 }, pt: { xs: 3.5, sm: 4 }, pb: 3,
            borderBottom: `1px solid ${P.slate100}`,
            background: `linear-gradient(160deg, ${mod.soft} 0%, ${P.white} 100%)`,
          }}>
            {/* icon */}
            <Box sx={{
              width: 52, height: 52, borderRadius: '15px', mb: 2.5,
              bgcolor: P.white, border: `1px solid ${mod.bdr}`,
              boxShadow: `0 2px 10px ${mod.bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ModIcon sx={{ fontSize: 26, color: mod.accent }} />
            </Box>

            {/* type badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.6,
              px: 1.125, py: '4px', borderRadius: '999px',
              bgcolor: mod.soft, border: `1px solid ${mod.bdr}`, mb: 1.5,
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: mod.accent }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: mod.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {mod.label}
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.35rem' }, color: P.slate900, lineHeight: 1.3, mb: campaign.description ? 0.75 : 0 }}>
              {campaign.title}
            </Typography>
            {campaign.description && (
              <Typography sx={{ fontSize: '0.825rem', color: P.slate500, lineHeight: 1.65 }}>
                {campaign.description}
              </Typography>
            )}
          </Box>

          {/* ── meta row ── */}
          <Box sx={{
            px: { xs: 3, sm: 4 }, py: 2.25,
            display: 'flex', flexWrap: 'wrap', gap: 0.875,
            borderBottom: `1px solid ${P.slate100}`,
          }}>
            {companyName && <Chip icon={<CompanyIcon sx={{ fontSize: 12 }} />} label={companyName} />}
            {campaign.deadline && (
              <Chip
                icon={<TimerIcon sx={{ fontSize: 12 }} />}
                label={isExpired ? 'Expired' : `Until ${fmtDate(campaign.deadline)}`}
                danger={isExpired}
              />
            )}
            <Chip icon={<LockIcon sx={{ fontSize: 12 }} />} label={isAnon ? 'Anonymous' : 'Nominative'} />
          </Box>

          {/* ── what to expect ── */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2.5, borderBottom: `1px solid ${P.slate100}` }}>
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              p: 2, borderRadius: '12px',
              bgcolor: mod.soft, border: `1px solid ${mod.bdr}`,
            }}>
              <CheckIcon sx={{ fontSize: 17, color: mod.accent, mt: '1px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.8rem', color: P.slate700, lineHeight: 1.6 }}>
                {mod.desc}
              </Typography>
            </Box>
          </Box>

          {/* ── action ── */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>

            {isExpired ? (
              <StatusBox icon={<TimerIcon sx={{ fontSize: 22, color: P.red }} />} danger>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: P.red }}>Campaign has expired</Typography>
                <Typography sx={{ fontSize: '0.775rem', color: '#FB7185', mt: 0.25 }}>The deadline has passed. Please contact the organiser.</Typography>
              </StatusBox>

            ) : isAccounts ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StatusBox icon={<GroupIcon sx={{ fontSize: 20, color: P.indigo }} />}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: P.slate900 }}>Account required</Typography>
                  <Typography sx={{ fontSize: '0.775rem', color: P.slate500, mt: 0.25 }}>Sign in with your TalentAI account to participate.</Typography>
                </StatusBox>
                <Btn label="Sign In to Participate" icon={<LoginIcon sx={{ fontSize: 17 }} />} onClick={goSignIn} accent={mod.accent} />
              </Box>

            ) : joinErr ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StatusBox icon={<ErrorIcon sx={{ fontSize: 20, color: P.red }} />} danger>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: P.red }}>{joinErr}</Typography>
                </StatusBox>
                <Btn label="Try Again" onClick={() => handleJoin()} loading={joining} accent={mod.accent} />
              </Box>

            ) : isAnon ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.5, borderRadius: '10px', bgcolor: P.greenSoft, border: '1px solid #BBF7D0' }}>
                  <CheckIcon sx={{ fontSize: 15, color: P.green, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 500 }}>No account needed — participate anonymously</Typography>
                </Box>
                <Btn label={joining ? 'Starting…' : 'Start Assessment'} icon={<PlayIcon sx={{ fontSize: 17 }} />} onClick={() => handleJoin()} loading={joining} accent={mod.accent} />
              </Box>

            ) : user ? (
              <Box sx={{ textAlign: 'center', py: 2.5 }}>
                <CircularProgress size={28} thickness={3} sx={{ color: mod.accent, mb: 1.5 }} />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: P.slate900 }}>Joining campaign…</Typography>
                <Typography sx={{ fontSize: '0.775rem', color: P.slate400, mt: 0.5 }}>You will be redirected shortly</Typography>
              </Box>

            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: P.slate900, mb: 0.25 }}>Enter your details</Typography>
                  <Typography sx={{ fontSize: '0.775rem', color: P.slate400 }}>No account needed — just your name and email.</Typography>
                </Box>

                <Field
                  placeholder="Full name *"
                  value={name}
                  onChange={(v) => { setName(v); setNameErr(''); }}
                  error={nameErr}
                  icon={<PersonIcon sx={{ fontSize: 16, color: P.slate400 }} />}
                  accent={mod.accent}
                />
                <Field
                  placeholder="Email address *"
                  value={email}
                  onChange={(v) => { setEmail(v); setEmailErr(''); }}
                  type="email"
                  error={emailErr}
                  icon={<EmailIcon sx={{ fontSize: 16, color: P.slate400 }} />}
                  accent={mod.accent}
                />

                <Btn label={joining ? 'Joining…' : 'Start Assessment'} icon={<ArrowIcon sx={{ fontSize: 17 }} />} onClick={handleFormSubmit} loading={joining} accent={mod.accent} />

                <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: P.slate400 }}>
                  Have an account?{' '}
                  <Typography component="span" onClick={goSignIn}
                    sx={{ color: mod.accent, fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Sign in instead
                  </Typography>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* footer */}
        <Box sx={{
          mt: 3.5, px: 2, py: 2, borderRadius: '16px',
          bgcolor: P.white, border: `1px solid ${P.slate100}`,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src="/logo-purple.svg" alt="TalentAI" sx={{ height: 18, opacity: 0.55 }} />
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: P.slate400, fontWeight: 500 }}>
            © {new Date().getFullYear()} TalentAI · All rights reserved
          </Typography>
        </Box>
      </Box>
    </Shell>
  );
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

const Shell: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
  <Box sx={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, p: { xs: 2, sm: 3 }, position: 'relative', overflow: 'hidden',
  }}>
    {children}
  </Box>
);

const Chip: React.FC<{ icon: React.ReactNode; label: string; danger?: boolean }> = ({ icon, label, danger }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 0.5,
    px: 1.125, py: '4px', borderRadius: '999px',
    bgcolor: danger ? P.redSoft : P.slate50,
    border: `1px solid ${danger ? P.redBdr : P.slate200}`,
  }}>
    <Box sx={{ color: danger ? P.red : P.slate400, display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: danger ? P.red : P.slate500 }}>{label}</Typography>
  </Box>
);

const StatusBox: React.FC<{ icon: React.ReactNode; children: React.ReactNode; danger?: boolean }> = ({ icon, children, danger }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', gap: 1.5,
    p: 2.25, borderRadius: '12px',
    bgcolor: danger ? P.redSoft : P.indigoSoft,
    border: `1px solid ${danger ? P.redBdr : P.indigoBdr}`,
  }}>
    <Box sx={{ flexShrink: 0, mt: '1px' }}>{icon}</Box>
    <Box>{children}</Box>
  </Box>
);

const Field: React.FC<{
  placeholder: string; value: string; onChange: (v: string) => void;
  error?: string; icon: React.ReactNode; type?: string; accent: string;
}> = ({ placeholder, value, onChange, error, icon, type, accent }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    error={!!error}
    helperText={error}
    type={type}
    InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '11px', fontSize: '0.875rem', bgcolor: P.slate50,
        '& fieldset': { borderColor: P.slate200 },
        '&:hover fieldset': { borderColor: P.slate400 },
        '&.Mui-focused fieldset': { borderColor: accent, borderWidth: '1.5px' },
      },
    }}
  />
);

const Btn: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void; loading?: boolean; accent: string }> = ({
  label, icon, onClick, loading, accent,
}) => (
  <Box
    onClick={!loading ? onClick : undefined}
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
      py: 1.5, borderRadius: '12px',
      cursor: loading ? 'default' : 'pointer',
      bgcolor: loading ? P.slate100 : accent,
      boxShadow: loading ? 'none' : `0 4px 16px ${accent}40`,
      transition: 'all 0.18s ease',
      ...(!loading && {
        '&:hover': { filter: 'brightness(1.08)', boxShadow: `0 6px 22px ${accent}50`, transform: 'translateY(-1px)' },
        '&:active': { transform: 'translateY(0)', filter: 'brightness(0.97)' },
      }),
    }}
  >
    {loading
      ? <CircularProgress size={18} thickness={4} sx={{ color: P.slate400 }} />
      : <>
          {icon && <Box sx={{ color: P.white, display: 'flex' }}>{icon}</Box>}
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: P.white }}>{label}</Typography>
        </>
    }
  </Box>
);

export default dynamic(() => Promise.resolve(CampaignJoinPage), { ssr: false });
