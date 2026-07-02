import { Tab, Tabs, styled } from '@mui/material';
import { ADMIN_ACCENT } from '../theme';

export const PillTabs = styled(Tabs)({
  minHeight: 44,
  borderBottom: '1px solid #E5E7EB',
  '& .MuiTabs-indicator': {
    height: 2,
    borderRadius: '2px 2px 0 0',
    backgroundColor: ADMIN_ACCENT,
  },
  '& .MuiTabs-flexContainer': {
    gap: 0,
  },
});

export const PillTab = styled(Tab)({
  minHeight: 44,
  minWidth: 0,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: '#6B7280',
  padding: '0 18px',
  borderRadius: 0,
  transition: 'color 0.15s ease',
  '&:hover': {
    color: ADMIN_ACCENT,
    backgroundColor: 'transparent',
  },
  '&.Mui-selected': {
    color: ADMIN_ACCENT,
    fontWeight: 600,
    backgroundColor: 'transparent',
  },
});
