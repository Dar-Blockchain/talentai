import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import AccessTimeOutlined   from '@mui/icons-material/AccessTimeOutlined';
import PauseCircleOutlined  from '@mui/icons-material/PauseCircleOutlined';
import StopCircleOutlined   from '@mui/icons-material/StopCircleOutlined';
import BlockedScreen from '@/components/ui/BlockedScreen';

// ─── Full-screen spinner ───────────────────────────────────────────────────────

export const InterviewSpinner: React.FC = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress sx={{ color: '#0D9488' }} />
  </Box>
);

// ─── Shared action helper ─────────────────────────────────────────────────────

const backAction = (onBack: () => void, color: string, hoverColor: string) => ([
  { label: 'Back to Campaign', onClick: onBack, color, hoverColor },
]);

// ─── Campaign error / not found ───────────────────────────────────────────────

interface ErrorProps {
  message?: string | null;
  onBack: () => void;
}

export const InterviewErrorState: React.FC<ErrorProps> = ({ message, onBack }) => (
  <BlockedScreen
    showHeader={false}
    variant="plain"
    icon={<WarningAmberOutlined sx={{ fontSize: 40, color: '#EF4444' }} />}
    iconBg="#FEF2F2"
    iconBorderColor="#FECACA"
    title="Campaign not found"
    description={message ?? undefined}
    actions={backAction(onBack, '#0D9488', '#0b7a6e')}
  />
);

// ─── Expired campaign ─────────────────────────────────────────────────────────

export const InterviewExpiredState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <BlockedScreen
    showHeader={false}
    variant="plain"
    icon={<AccessTimeOutlined sx={{ fontSize: 34, color: '#EF4444' }} />}
    iconBg="#FEF2F2"
    iconBorderColor="#FECACA"
    title="Deadline Passed"
    description="The deadline for this campaign has passed. You can no longer start or continue this assessment."
    actions={backAction(onBack, '#EF4444', '#DC2626')}
  />
);

// ─── Paused campaign ──────────────────────────────────────────────────────────

export const InterviewPausedState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <BlockedScreen
    showHeader={false}
    variant="plain"
    icon={<PauseCircleOutlined sx={{ fontSize: 34, color: '#D97706' }} />}
    iconBg="#FFFBEB"
    iconBorderColor="#FDE68A"
    title="Campaign Paused"
    description="This campaign is currently paused. You won't be able to start or continue your assessment until it's resumed."
    actions={backAction(onBack, '#D97706', '#B45309')}
  />
);

// ─── Closed campaign ──────────────────────────────────────────────────────────

export const InterviewClosedState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <BlockedScreen
    showHeader={false}
    variant="plain"
    icon={<StopCircleOutlined sx={{ fontSize: 34, color: '#2563EB' }} />}
    iconBg="#EFF6FF"
    iconBorderColor="#BFDBFE"
    title="Campaign Closed"
    description="This campaign has been closed and is no longer accepting responses."
    actions={backAction(onBack, '#2563EB', '#1D4ED8')}
  />
);
