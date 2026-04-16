import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import AppButton from '@/components/ui/AppButton';
import Shell from './Shell';
import CardHeader from './CardHeader';

const InvitationResponseView: React.FC<{
  accepted: boolean;
  companyName: string;
  onDashboard: () => void;
}> = ({ accepted, companyName, onDashboard }) => (
  <Shell>
    <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <CardHeader
        gradient={accepted ? 'linear-gradient(145deg, #ECFDF5, #fff)' : 'linear-gradient(145deg, #F8FAFC, #fff)'}
        glow={accepted ? 'radial-gradient(circle at 50% 100%, #34D39915, transparent 70%)' : 'radial-gradient(circle at 50% 100%, #94A3B815, transparent 70%)'}
        iconBg={accepted ? '#D1FAE5' : '#F1F5F9'}
        icon={accepted
          ? <CheckCircleOutlined sx={{ fontSize: 28, color: '#059669' }} />
          : <CancelOutlined sx={{ fontSize: 28, color: '#64748B' }} />}
      />
      <Box sx={{ px: 3.5, pb: 3.5, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', mb: 0.75, letterSpacing: '-0.02em' }}>
          {accepted ? 'Invitation Accepted!' : 'Invitation Declined'}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.65, mb: 0.5 }}>
          {accepted ? `Welcome to ${companyName}!` : 'You have declined this invitation.'}
        </Typography>
        <Typography sx={{ color: '#CBD5E1', fontSize: '0.775rem', mb: 3 }}>
          You can now close this window.
        </Typography>
        {accepted && (
          <AppButton
            variant="primary" label="Go to Dashboard"
            size="large" fullWidth onClick={onDashboard}
            sx={{ borderRadius: '12px' }}
          />
        )}
      </Box>
    </Box>
  </Shell>
);

export default InvitationResponseView;
