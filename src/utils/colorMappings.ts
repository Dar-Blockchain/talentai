export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const getRoleColor = (role: string): ChipColor => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'error';
    case 'company': return 'primary';
    case 'candidate': return 'success';
    default: return 'default';
  }
};

export const getStatusColor = (status: string): ChipColor => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'inactive': return 'error';
    case 'draft': return 'warning';
    default: return 'default';
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50';
  if (score >= 70) return '#2196f3';
  if (score >= 60) return '#ff9800';
  return '#f44336';
};
