import { Tab, Tabs, styled } from '@mui/material';
import { ADMIN_ACCENT } from '../theme';

/**
 * Segmented-control style tab bar — a row of rounded pill buttons with no
 * underline indicator. The active pill fills with the accent color instead.
 * Shared across every admin content-area tab switcher (score filters, role
 * filters, etc) so they all look and behave identically.
 */
export const PillTabs = styled(Tabs)({
  minHeight: 40,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-flexContainer': {
    gap: 6,
  },
});

export const PillTab = styled(Tab)({
  minHeight: 36,
  minWidth: 0,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.82rem',
  color: '#64748B',
  padding: '6px 16px',
  borderRadius: 999,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    backgroundColor: '#F1F5F9',
  },
  '&.Mui-selected': {
    color: '#FFFFFF',
    backgroundColor: ADMIN_ACCENT,
  },
  '&.Mui-selected:hover': {
    backgroundColor: ADMIN_ACCENT,
  },
});
