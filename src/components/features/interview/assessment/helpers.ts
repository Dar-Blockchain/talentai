export const CHART_COLORS = ['#0D9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

// Design tokens — keep in sync with [id].tsx
export const T      = '#0D9488';
export const TL     = '#14B8A6';
export const TBG    = '#F0FDFA';
export const TBRD   = '#99F6E4';
export const NAVY   = '#0F172A';
export const NAVY2  = '#1E293B';
export const GRAY   = '#64748B';
export const GRAY2  = '#94A3B8';
export const BORDER = '#E2E8F0';

export const sectionCardSx = {
  bgcolor: '#fff',
  borderRadius: '18px',
  border: `1px solid ${BORDER}`,
  overflow: 'hidden' as const,
  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
};

export const sectionStyle = sectionCardSx;

export const sectionTitleStyle = (_accentColor?: string) => ({
  fontWeight: 800,
  fontSize: '0.88rem',
  color: NAVY,
  letterSpacing: '-0.01em',
});

export const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${seconds}s`;
};

export const formatAreaName = (name: string) =>
  name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const getStepStatusColor = (status: string) => {
  switch (status) {
    case 'done':
    case 'passed':
      return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: '#10b981' };
    case 'inProgress':
      return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '#f59e0b' };
    default:
      return { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '#6b7280' };
  }
};

export const getStepStatusLabel = (status: string) => {
  switch (status) {
    case 'done': case 'passed': return 'Completed';
    case 'inProgress':           return 'In Progress';
    default:                     return 'Pending';
  }
};
