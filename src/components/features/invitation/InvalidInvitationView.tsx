import React from 'react';
import { Box, Typography } from '@mui/material';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import AppButton from '@/components/ui/AppButton';
import Shell from './Shell';
import CardHeader from './CardHeader';

const InvalidInvitationView: React.FC<{
  isWarning: boolean;
  message: string;
  onAction: () => void;
}> = ({ isWarning, message, onAction }) => (
  <Shell>
    <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <CardHeader
        gradient={isWarning ? 'linear-gradient(145deg, #FFFBEB, #fff)' : 'linear-gradient(145deg, #FEF2F2, #fff)'}
        glow={isWarning ? 'radial-gradient(circle at 50% 100%, #FBBF2415, transparent 70%)' : 'radial-gradient(circle at 50% 100%, #F8717115, transparent 70%)'}
        iconBg={isWarning ? '#FEF3C7' : '#FEE2E2'}
        icon={isWarning
          ? <WarningAmberOutlined sx={{ fontSize: 28, color: '#D97706' }} />
          : <CancelOutlined sx={{ fontSize: 28, color: '#EF4444' }} />}
      />
      <Box sx={{ px: 3.5, pb: 3.5, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', mb: 0.75, letterSpacing: '-0.02em' }}>
          {isWarning ? 'Email Mismatch' : 'Invalid Invitation'}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.65, mb: 3 }}>
          {message}
        </Typography>
        <AppButton
          variant="primary" label={isWarning ? 'Go to Dashboard' : 'Go to Home'}
          size="large" fullWidth onClick={onAction}
          sx={{ borderRadius: '12px' }}
        />
      </Box>
    </Box>
  </Shell>
);

export default InvalidInvitationView;
