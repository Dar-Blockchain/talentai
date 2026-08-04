export const PURPLE = '#8310FF';
export const TEAL   = '#0D9488';

export const ROLE_LABELS: Record<string, string> = {
  RH: 'HR',
  TechLead: 'Technical Leader',
  Supervisor: 'Supervisor',
  Manager: 'Manager',
};

export const ROLE_STYLES: Record<string, { color: string; bg: string; lightBg: string }> = {
  RH:         { color: '#059669', bg: '#D1FAE5', lightBg: '#ECFDF5' },
  TechLead:   { color: '#2563EB', bg: '#DBEAFE', lightBg: '#EFF6FF' },
  Supervisor: { color: '#B45309', bg: '#FEF3C7', lightBg: '#FFFBEB' },
  Manager:    { color: PURPLE,    bg: '#EDE9FE', lightBg: '#F5F3FF' },
};
