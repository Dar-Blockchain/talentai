import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { RewardInfo } from './types';

interface RewardNotificationProps {
  rewardInfo: RewardInfo;
  claimingReward: boolean;
  onClaimReward: () => void;
}

export default function RewardNotification({
  rewardInfo,
  claimingReward,
  onClaimReward,
}: RewardNotificationProps) {
  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 1)',
        px: 5,
        py: 3,
        mb: 2,
        borderRadius: '12px',
        border: '1px solid rgba(84,98,116,0.1)',
        textAlign: 'center',
      }}
    >
      {rewardInfo.success ? (
        <>
          <TrophyIcon sx={{ fontSize: 60, color: '#ffd700', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
            Congratulations!
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000', mb: 2 }}>
            You earned {rewardInfo.amount?.toFixed(2)} TAI tokens!
          </Typography>
          <Alert severity="success" sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Reward distributed successfully!
            </Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              TX: {rewardInfo.transactionId}
            </Typography>
          </Alert>
        </>
      ) : (
        <>
          <WarningIcon sx={{ fontSize: 60, color: '#fa709a', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Reward Claim Issue
          </Typography>
          <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
            {rewardInfo.error || 'Failed to distribute reward automatically'}
          </Alert>
          {rewardInfo.canRetry && (
            <Button
              variant="contained"
              startIcon={claimingReward ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <TrophyIcon />}
              onClick={onClaimReward}
              disabled={claimingReward}
              sx={{
                background: 'rgba(163, 98, 239, 1)',
                borderRadius: '38px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {claimingReward ? 'Claiming...' : 'Claim Reward'}
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
