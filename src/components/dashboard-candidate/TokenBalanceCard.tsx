import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import Cookies from 'js-cookie';

interface TokenBalanceData {
  balance: number;
  hederaAccountId: string | null;
  decimals?: number;
  tokenId?: string;
  found?: boolean;
  source?: string;
  message?: string;
}

export default function TokenBalanceCard() {
  const [balanceData, setBalanceData] = useState<TokenBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem('api_token') || Cookies.get('api_token');

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      console.log('🔍 Fetching TAI token balance...');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}tokens/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Balance data received:', data);

      setBalanceData(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to fetch balance:', err);
      setError(err.message || 'Failed to load token balance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBalance(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchBalance(true);
  };

  if (loading) {
    return (
      <Card
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
          borderRadius: 3,
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
          <CircularProgress size={40} sx={{ color: 'white' }} />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(131, 16, 255, 0.95) 0%, rgba(0, 184, 212, 0.95) 100%)',
        borderRadius: 3,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(131, 16, 255, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(131, 16, 255, 0.4)',
        }
      }}
    >
      {/* Refreshing Progress Bar */}
      {refreshing && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white'
            }
          }}
        />
      )}

      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <WalletIcon sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h6" color="white" fontWeight={600}>
              TAI Token Balance
            </Typography>
            <Tooltip title="Your TAI tokens earned from interviews. Balance is fetched in real-time from Hedera network.">
              <InfoIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} />
            </Tooltip>
          </Box>

          {error ? (
            <Alert
              severity="error"
              sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.9)' }}
            >
              {error}
            </Alert>
          ) : !balanceData?.hederaAccountId ? (
            <Box>
              <Typography variant="h4" color="white" fontWeight={700} mb={1}>
                0.00 TAI
              </Typography>
              <Alert
                severity="info"
                sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.9)' }}
              >
                No Hedera wallet connected. Complete interviews to earn TAI tokens!
              </Alert>
            </Box>
          ) : (
            <Box>
              <Typography variant="h2" color="white" fontWeight={700} mb={1}>
                {balanceData.balance.toFixed(2)}
                <Typography component="span" variant="h4" sx={{ ml: 1, opacity: 0.8 }}>
                  TAI
                </Typography>
              </Typography>

              {/* Hedera Account Info */}
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                <Chip
                  label={`Account: ${balanceData.hederaAccountId}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                />
                {balanceData.source && (
                  <Chip
                    icon={<TrendingUpIcon sx={{ color: 'white !important' }} />}
                    label={balanceData.source === 'hedera_mirror_node' ? 'Live Balance' : 'Cached'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.3)',
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>

              {balanceData.message && (
                <Typography variant="caption" color="rgba(255,255,255,0.8)" display="block" mt={1}>
                  {balanceData.message}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Refresh Button */}
        <Tooltip title="Refresh balance">
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
              '&:disabled': {
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            <RefreshIcon sx={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            bgcolor: 'white',
            color: '#8310FF',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
            },
            '&:disabled': {
              bgcolor: 'rgba(255,255,255,0.5)',
              color: 'rgba(131, 16, 255, 0.5)'
            }
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Balance'}
        </Button>

        {/* Placeholder for future "View Transactions" button */}
        {/* <Button
          variant="outlined"
          sx={{
            borderColor: 'white',
            color: 'white',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          View Transactions
        </Button> */}
      </Box>

      {/* Token ID Info */}
      {balanceData?.tokenId && (
        <Typography
          variant="caption"
          color="rgba(255,255,255,0.6)"
          display="block"
          mt={2}
          fontFamily="monospace"
        >
          Token ID: {balanceData.tokenId}
        </Typography>
      )}
    </Card>
  );
}
