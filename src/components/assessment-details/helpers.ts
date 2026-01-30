export const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const sectionStyle = {
  border: '1px solid rgba(98, 111, 134, 0.18)',
  backgroundColor: 'rgba(253, 253, 253, 1)',
  borderRadius: '12px',
  px: 2,
  py: 1.5,
};

export const sectionTitleStyle = (accentColor: string = 'rgba(41, 210, 145, 0.83)') => ({
  position: 'relative' as const,
  fontWeight: 600,
  fontSize: '20px',
  lineHeight: '35px',
  color: 'rgba(23, 43, 77, 1)',
  mb: 2,
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '38px',
    height: '5px',
    backgroundColor: accentColor,
    borderRadius: '2px',
  },
});

export const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export const formatAreaName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getStepStatusColor = (status: string) => {
  switch (status) {
    case 'done':
    case 'passed':
      return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981' };
    case 'inProgress':
      return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '#f59e0b' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '#6b7280' };
  }
};

export const getStepStatusLabel = (status: string) => {
  switch (status) {
    case 'done':
    case 'passed':
      return 'Completed';
    case 'inProgress':
      return 'In Progress';
    default:
      return 'Pending';
  }
};
