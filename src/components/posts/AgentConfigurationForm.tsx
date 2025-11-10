import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  Tooltip,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

export interface AgentConfigurationFormValues {
  agentId: string;
  postId: string;
  thresholdPercent?: number;
  bidBudgetMin?: number;
  bidBudgetMax?: number;
  bidStep?: number;
  maxCandidatesToBid?: number;
  agentLifetimeDays?: number;
  bidLifetimeDays?: number;
  autoSubmitTopMatch: boolean;
  maxDailySpending?: number;
  isActive: boolean;
}

export interface AgentConfigurationFormProps {
  value: AgentConfigurationFormValues;
  onChange: (update: Partial<AgentConfigurationFormValues>) => void;
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  agentSummary?: {
    agentName?: string;
    createdAt?: string;
  };
}

const numberFields: Array<{
  key: keyof AgentConfigurationFormValues;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
}> = [
  {
    key: 'thresholdPercent',
    label: 'Match Threshold (%)',
    helper: 'Minimum candidate score required to trigger automated actions',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: 'bidBudgetMin',
    label: 'Minimum Bid Budget ($)',
    helper: 'Lowest amount your agent can bid for a candidate interaction',
    min: 0,
    step: 1,
  },
  {
    key: 'bidBudgetMax',
    label: 'Maximum Bid Budget ($)',
    helper: 'Highest bid amount allowed per candidate interaction',
    min: 0,
    step: 1,
  },
  {
    key: 'bidStep',
    label: 'Bid Increment ($)',
    helper: 'Incremental step used when increasing bids',
    min: 1,
    step: 1,
  },
  {
    key: 'maxCandidatesToBid',
    label: 'Max Candidates to Bid',
    helper: 'Number of concurrent candidates the agent can engage with',
    min: 1,
    step: 1,
  },
  {
    key: 'maxDailySpending',
    label: 'Daily Spending Limit ($)',
    helper: 'Cap the daily budget allocation for this agent',
    min: 0,
    step: 1,
  },
  {
    key: 'agentLifetimeDays',
    label: 'Agent Lifetime (days)',
    helper: 'Auto-deactivation period for the agent',
    min: 1,
    step: 1,
  },
  {
    key: 'bidLifetimeDays',
    label: 'Bid Lifetime (days)',
    helper: 'How long each bid remains valid before expiring',
    min: 1,
    step: 1,
  },
];

const Wrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(5),
  background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 50%, #e8eef5 100%)',
  overflowY: 'auto',
  minHeight: '100vh',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '600px',
    background: 'radial-gradient(circle at top center, rgba(99, 102, 241, 0.08), transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const HeroCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 32,
  padding: theme.spacing(5),
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.15) 45%, rgba(99, 102, 241, 0.12) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
  marginBottom: theme.spacing(5),
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 20,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 25px 70px -25px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
    [theme.breakpoints.down('sm')]: {
      transform: 'none',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.25), transparent 60%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.4), transparent)',
    pointerEvents: 'none',
  },
}));

const HeroInner = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const HeroIconBubble = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  boxShadow: '0 20px 40px -20px rgba(14, 165, 233, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
  color: '#ffffff',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: '0 25px 50px -15px rgba(14, 165, 233, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.4) inset',
    [theme.breakpoints.down('sm')]: {
      transform: 'scale(1.02)',
    },
  },
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  borderRadius: 28,
  padding: theme.spacing(4.5),
  backgroundColor: '#ffffff',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 10px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 20,
    padding: theme.spacing(3),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #10b981, #0ea5e9, #6366f1)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 50px -20px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(255, 255, 255, 1) inset',
    [theme.breakpoints.down('sm')]: {
      transform: 'translateY(-1px)',
    },
    '&::before': {
      opacity: 1,
    },
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#0f172a',
  fontSize: '1.3rem',
  letterSpacing: '-0.01em',
  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const SubtleText = styled(Typography)(({ theme }) => ({
  color: '#64748b',
  fontSize: '0.9rem',
  lineHeight: 1.6,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent',
    '& fieldset': {
      borderColor: 'rgba(226, 232, 240, 0.8)',
      borderWidth: '1px',
    },
    '&:hover': {
      backgroundColor: '#fafbfc',
      transform: 'translateY(-1px)',
      '& fieldset': {
        borderColor: '#0ea5e9',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      transform: 'translateY(-1px)',
      '& fieldset': {
        borderColor: '#10b981',
        borderWidth: '2px',
      },
      boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1), 0 4px 12px -2px rgba(16, 185, 129, 0.15)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    color: '#475569',
    '&.Mui-focused': {
      color: '#10b981',
      fontWeight: 700,
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#64748b',
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
}));

const ToggleContainer = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(3),
  backgroundColor: 'rgba(248, 250, 252, 0.5)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 16,
  },
  '&:hover': {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    border: '1px solid rgba(203, 213, 225, 0.8)',
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.1)',
    [theme.breakpoints.down('sm')]: {
      transform: 'translateX(2px)',
    },
  },
}));

const ToggleIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.25) 100%)',
  color: '#0ea5e9',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 0 0 1px rgba(14, 165, 233, 0.1) inset',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(14, 165, 233, 0.35) 100%)',
    transform: 'scale(1.1) rotate(-5deg)',
  },
}));

const StatBadge = styled(Box)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(3),
  backgroundColor: 'rgba(248, 250, 252, 0.5)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'linear-gradient(180deg, #10b981, #0ea5e9)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(203, 213, 225, 0.8)',
    transform: 'translateX(2px)',
    boxShadow: '0 8px 20px -8px rgba(15, 23, 42, 0.15)',
    '&::before': {
      opacity: 1,
    },
  },
}));

const StatIcon = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  borderRadius: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(37, 99, 235, 0.2) 100%)',
  color: '#10b981',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.1) inset',
  flexShrink: 0,
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 999,
  backgroundColor: 'rgba(226, 232, 240, 0.5)',
  boxShadow: '0 0 0 1px rgba(203, 213, 225, 0.3) inset',
  overflow: 'hidden',
  '& .MuiLinearProgress-bar': {
    borderRadius: 999,
    background: 'linear-gradient(90deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)',
    boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const HeroActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1.5),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const HeroTitleGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const MainLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  alignItems: 'start',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const FieldGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2.5),
  },
}));

const AgentConfigurationForm: React.FC<AgentConfigurationFormProps> = ({
  value,
  onChange,
  disabled = false,
  loading = false,
  errorMessage,
  agentSummary,
}) => {
  const renderNumericField = (key: keyof AgentConfigurationFormValues) => {
    const config = numberFields.find((field) => field.key === key);
    if (!config) return null;

    return (
      <StyledTextField
        key={config.key as string}
        type="number"
        label={config.label}
        fullWidth
        value={(value[key] ?? '') as number | string}
        onChange={handleNumberChange(key)}
        inputProps={{
          min: config.min,
          max: config.max,
          step: config.step,
        }}
        disabled={disabled || loading}
        helperText={config.helper}
      />
    );
  };

  const handleNumberChange =
    (key: keyof AgentConfigurationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const parsed = raw === '' ? undefined : Number(raw);
      onChange({ [key]: Number.isNaN(parsed as number) ? undefined : parsed } as Partial<AgentConfigurationFormValues>);
    };

  const handleStringChange =
    (key: keyof AgentConfigurationFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [key]: event.target.value } as Partial<AgentConfigurationFormValues>);
    };

  const handleBooleanChange =
    (key: keyof AgentConfigurationFormValues) =>
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onChange({ [key]: checked } as Partial<AgentConfigurationFormValues>);
    };

  const thresholdValue = Math.min(Math.max(Number(value.thresholdPercent ?? 0), 0), 100);
  const minBudget = Number.isFinite(Number(value.bidBudgetMin))
    ? Number(value.bidBudgetMin)
    : undefined;
  const maxBudget = Number.isFinite(Number(value.bidBudgetMax))
    ? Number(value.bidBudgetMax)
    : undefined;
  const bidStep = Number.isFinite(Number(value.bidStep)) ? Number(value.bidStep) : undefined;
  const dailyCap = Number.isFinite(Number(value.maxDailySpending))
    ? Number(value.maxDailySpending)
    : undefined;
  const agentLifetimeDays = Number.isFinite(Number(value.agentLifetimeDays))
    ? Number(value.agentLifetimeDays)
    : undefined;
  const bidLifetimeDays = Number.isFinite(Number(value.bidLifetimeDays))
    ? Number(value.bidLifetimeDays)
    : undefined;
  const maxCandidates = Number.isFinite(Number(value.maxCandidatesToBid))
    ? Number(value.maxCandidatesToBid)
    : undefined;

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || Number.isNaN(amount)) {
      return '—';
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <Wrapper>
      <HeroCard>
        <HeroInner>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <HeroTitleGroup>
              <HeroIconBubble>
                <SmartToyIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
              </HeroIconBubble>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                  }}
                >
                  Agent Control Center
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.7)',
                    maxWidth: 560,
                    mt: 1.5,
                    lineHeight: 1.7,
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  }}
                >
                  Fine-tune bidding guardrails, pacing, and automation rules to align your AI recruiter
                  with the budget envelope and experience you promise candidates.
                </Typography>
              </Box>
            </HeroTitleGroup>
            <HeroActions>
              <Chip
                label={value.isActive ? 'Status: Active' : 'Status: Paused'}
                sx={{
                  borderRadius: 999,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.8, sm: 1 },
                  height: 'auto',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  backgroundColor: value.isActive
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(148, 163, 184, 0.2)',
                  color: value.isActive ? '#047857' : '#334155',
                  border: value.isActive
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(148, 163, 184, 0.3)',
                  boxShadow: value.isActive
                    ? '0 4px 12px -4px rgba(16, 185, 129, 0.4)'
                    : '0 2px 8px -2px rgba(148, 163, 184, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: value.isActive
                      ? '0 6px 16px -4px rgba(16, 185, 129, 0.5)'
                      : '0 4px 12px -2px rgba(148, 163, 184, 0.4)',
                  },
                }}
              />
              <Chip
                label={value.autoSubmitTopMatch ? 'Automation: Enabled' : 'Automation: Manual review'}
                sx={{
                  borderRadius: 999,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.8, sm: 1 },
                  height: 'auto',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  backgroundColor: value.autoSubmitTopMatch
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'rgba(148, 163, 184, 0.15)',
                  color: value.autoSubmitTopMatch ? '#0e7490' : '#475569',
                  border: value.autoSubmitTopMatch
                    ? '1px solid rgba(6, 182, 212, 0.3)'
                    : '1px solid rgba(148, 163, 184, 0.25)',
                  boxShadow: value.autoSubmitTopMatch
                    ? '0 4px 12px -4px rgba(6, 182, 212, 0.4)'
                    : '0 2px 8px -2px rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: value.autoSubmitTopMatch
                      ? '0 6px 16px -4px rgba(6, 182, 212, 0.5)'
                      : '0 4px 12px -2px rgba(148, 163, 184, 0.3)',
                  },
                }}
              />
              {agentSummary?.agentName && (
                <Chip
                  label={`Agent Persona: ${agentSummary.agentName}`}
                  sx={{
                    borderRadius: 999,
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 0.8, sm: 1 },
                    height: 'auto',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    color: '#4338ca',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    boxShadow: '0 4px 12px -4px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px -4px rgba(99, 102, 241, 0.5)',
                    },
                  }}
                />
              )}
            </HeroActions>
          </Stack>
        </HeroInner>
      </HeroCard>

      <MainLayout>
        <Box>
          <Stack spacing={3}>
            <SectionCard elevation={0}>
              <SectionHeader>
                <Box>
                  <SectionTitle>Identity & Safeguards</SectionTitle>
                  <SubtleText>
                    Tie the configuration to the originating post and define qualification thresholds that
                    gate automated actions.
                  </SubtleText>
                </Box>
                <Tooltip
                  title="Agent ID is generated automatically during registration. You can override it to connect an existing agent."
                  placement="left"
                  arrow
                >
                  <InfoOutlinedIcon sx={{ color: '#0f172a', opacity: 0.65 }} />
                </Tooltip>
              </SectionHeader>

              <FieldGrid>
                <StyledTextField
                  label="Agent ID"
                  fullWidth
                  value={value.agentId || ''}
                  onChange={handleStringChange('agentId')}
                  disabled={disabled || loading}
                  helperText="Identifier for the AI agent orchestrating this post."
                />
                <StyledTextField
                  label="Post ID"
                  fullWidth
                  value={value.postId || ''}
                  disabled
                  helperText="Linked automatically after the job creation step."
                />
                {renderNumericField('thresholdPercent')}
                {renderNumericField('maxCandidatesToBid')}
              </FieldGrid>

              {!value.agentId && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(251, 191, 36, 0.5)',
                    backgroundColor: 'rgba(254, 249, 195, 0.5)',
                    backdropFilter: 'blur(10px)',
                    color: '#92400e',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px -4px rgba(251, 191, 36, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#f59e0b',
                    },
                  }}
                >
                  Agent ID will populate automatically once the AI agent finishes provisioning. Paste an
                  existing ID if you want to reuse a previously deployed agent.
                </Alert>
              )}
            </SectionCard>

            <SectionCard elevation={0}>
              <SectionHeader>
                <Box>
                  <SectionTitle>Bidding Envelope</SectionTitle>
                  <SubtleText>
                    Control how aggressively the agent bids per candidate interaction and align daily spend
                    with your commercial model.
                  </SubtleText>
                </Box>
                <AutoGraphIcon sx={{ color: '#0f172a', opacity: 0.6 }} />
              </SectionHeader>
              <FieldGrid>
                {renderNumericField('bidBudgetMin')}
                {renderNumericField('bidBudgetMax')}
                {renderNumericField('bidStep')}
                {renderNumericField('maxDailySpending')}
              </FieldGrid>
            </SectionCard>

            <SectionCard elevation={0}>
              <SectionHeader>
                <Box>
                  <SectionTitle>Lifecycle Policies</SectionTitle>
                  <SubtleText>
                    Define how long the agent operates and when each bid expires to keep campaigns fresh
                    and compliant.
                  </SubtleText>
                </Box>
                <TrendingUpIcon sx={{ color: '#0f172a', opacity: 0.6 }} />
              </SectionHeader>

              <FieldGrid>
                {renderNumericField('agentLifetimeDays')}
                {renderNumericField('bidLifetimeDays')}
              </FieldGrid>
            </SectionCard>
          </Stack>
        </Box>

        <Box>
          <Stack spacing={3}>
            <SectionCard elevation={0}>
              <SectionHeader>
                <Box>
                  <SectionTitle>Automation Controls</SectionTitle>
                  <SubtleText>Toggle smart actions on or off as you ramp confidence.</SubtleText>
                </Box>
              </SectionHeader>

              <Stack spacing={2.5}>
                <ToggleContainer>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ToggleIcon>
                        <BoltIcon />
                      </ToggleIcon>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                          Auto-submit top matches
                        </Typography>
                        <SubtleText>
                          Seamlessly advance standout candidates into the next recruitment step.
                        </SubtleText>
                      </Box>
                    </Box>
                    <Switch
                      checked={Boolean(value.autoSubmitTopMatch)}
                      onChange={handleBooleanChange('autoSubmitTopMatch')}
                      disabled={disabled || loading}
                      inputProps={{ 'aria-label': 'Toggle auto submit top matches' }}
                      sx={{
                        width: 58,
                        height: 34,
                        padding: 0,
                        '& .MuiSwitch-switchBase': {
                          padding: 0,
                          margin: 0.5,
                          transitionDuration: '300ms',
                          '&.Mui-checked': {
                            transform: 'translateX(24px)',
                            color: '#fff',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#0ea5e9',
                              opacity: 1,
                              border: 0,
                              boxShadow: '0 0 0 1px rgba(14, 165, 233, 0.3) inset',
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          boxSizing: 'border-box',
                          width: 26,
                          height: 26,
                          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 34 / 2,
                          backgroundColor: '#cbd5e1',
                          opacity: 1,
                          transition: 'background-color 300ms',
                        },
                      }}
                    />
                  </Box>
                </ToggleContainer>

                <ToggleContainer>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ToggleIcon>
                        <SmartToyIcon />
                      </ToggleIcon>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                          Activate agent immediately
                        </Typography>
                        <SubtleText>
                          Launch bidding for the configured post as soon as the flow goes live.
                        </SubtleText>
                      </Box>
                    </Box>
                    <Switch
                      checked={Boolean(value.isActive)}
                      onChange={handleBooleanChange('isActive')}
                      disabled={disabled || loading}
                      inputProps={{ 'aria-label': 'Toggle agent active state' }}
                      sx={{
                        width: 58,
                        height: 34,
                        padding: 0,
                        '& .MuiSwitch-switchBase': {
                          padding: 0,
                          margin: 0.5,
                          transitionDuration: '300ms',
                          '&.Mui-checked': {
                            transform: 'translateX(24px)',
                            color: '#fff',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#10b981',
                              opacity: 1,
                              border: 0,
                              boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.3) inset',
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          boxSizing: 'border-box',
                          width: 26,
                          height: 26,
                          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 34 / 2,
                          backgroundColor: '#cbd5e1',
                          opacity: 1,
                          transition: 'background-color 300ms',
                        },
                      }}
                    />
                  </Box>
                </ToggleContainer>
              </Stack>
            </SectionCard>

            <SectionCard elevation={0}>
              <SectionHeader>
                <Box>
                  <SectionTitle>Health Snapshot</SectionTitle>
                  <SubtleText>
                    Real-time view of how your guardrails translate into operating ranges.
                  </SubtleText>
                </Box>
              </SectionHeader>

              <Stack spacing={2.2}>
                <StatBadge>
                  <StatIcon>
                    <TrendingUpIcon />
                  </StatIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Match threshold
                    </Typography>
                    <SubtleText>Minimum score candidates must achieve for automation.</SubtleText>
                    <StyledLinearProgress value={thresholdValue} variant="determinate" sx={{ mt: 1.2 }} />
                    <Typography sx={{ mt: 0.8, fontWeight: 600, color: '#0f172a' }}>
                      {thresholdValue}% required
                    </Typography>
                  </Box>
                </StatBadge>

                <StatBadge>
                  <StatIcon>
                    <AutoGraphIcon />
                  </StatIcon>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Bid envelope
                    </Typography>
                    <SubtleText>
                      {formatCurrency(minBudget)} – {formatCurrency(maxBudget)} per candidate, step{' '}
                      {bidStep !== undefined ? `$${bidStep.toLocaleString()}` : '—'}
                    </SubtleText>
                    <SubtleText sx={{ mt: 0.6 }}>
                      Daily cap: {formatCurrency(dailyCap)} · Concurrent candidates:{' '}
                      {maxCandidates ?? '—'}
                    </SubtleText>
                  </Box>
                </StatBadge>

                <StatBadge>
                  <StatIcon>
                    <SmartToyIcon />
                  </StatIcon>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Lifecycle horizon
                    </Typography>
                    <SubtleText>
                      Agent retires after {agentLifetimeDays ?? '—'} days · bids expire after{' '}
                      {bidLifetimeDays ?? '—'} days.
                    </SubtleText>
                  </Box>
                </StatBadge>
              </Stack>
            </SectionCard>
          </Stack>
        </Box>
      </MainLayout>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mt: 5,
            borderRadius: 4,
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(254, 226, 226, 0.5)',
            backdropFilter: 'blur(10px)',
            color: '#991b1b',
            fontWeight: 500,
            maxWidth: 960,
            boxShadow: '0 8px 20px -8px rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': {
              color: '#dc2626',
            },
          }}
        >
          {errorMessage}
        </Alert>
      )}
    </Wrapper>
  );
};

export default AgentConfigurationForm;

