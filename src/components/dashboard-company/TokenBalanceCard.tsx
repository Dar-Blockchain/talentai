import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

// Styled Components to match other info cards
const CompactBuyButton = styled(Button)(({ theme }) => ({
  background: '#10b981',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '4px 12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  minHeight: 'auto',
  '&:hover': {
    background: '#059669',
  },
}));

interface TokenBalanceCardProps {
  balance: number;
  onBuyTokens: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({
  balance = 0,
  onBuyTokens,
  onRefresh,
  loading = false
}) => {
  return (
    <Box sx={{
      background: '#ffffff',
      padding: 2.5,
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: 'auto'
    }}>
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
      }}>
        <AccountBalanceWalletIcon sx={{ color: '#667eea', fontSize: 24 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
          TOKEN BALANCE
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
            {loading ? '...' : balance.toLocaleString()}
          </Typography>
          <CompactBuyButton
            onClick={onBuyTokens}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            size="small"
          >
            Buy
          </CompactBuyButton>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenBalanceCard;