import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import WalletConnect from './WalletConnect';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

// Styled Components with animations - Fullscreen responsive
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    animation: 'backdropFadeIn 0.4s ease-out',
  },
  '& .MuiDialog-paper': {
    borderRadius: 0,
    maxWidth: 'none',
    width: '100vw',
    height: '100vh',
    margin: 0,
    maxHeight: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'none',
    animation: 'modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    flexDirection: 'column',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
      animation: 'shimmer 3s ease-in-out infinite',
    },
    [theme.breakpoints.up('md')]: {
      borderRadius: '24px',
      width: '95vw',
      height: '95vh',
      margin: '2.5vh auto',
    },
    [theme.breakpoints.up('lg')]: {
      width: '90vw',
      height: '90vh',
      margin: '5vh auto',
      borderRadius: '32px',
    },
  },
  '@keyframes backdropFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes modalSlideIn': {
    from: {
      opacity: 0,
      transform: 'translateY(-50px) scale(0.9)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
  '@keyframes shimmer': {
    '0%, 100%': { opacity: 0.3 },
    '50%': { opacity: 0.8 },
  },
}));

const GradientTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  minHeight: 56,
  minWidth: '120px',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  '&.Mui-selected': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    borderRadius: '12px',
    margin: '4px',
  },
  '&:active': {
    transform: 'scale(0.98)',
    transition: 'transform 0.1s ease',
  },
  [theme.breakpoints.down('md')]: {
    minHeight: 48,
    fontSize: '0.9rem',
    padding: '8px 16px',
  },
}));

interface PlanCardProps {
  selected?: boolean;
}

const PlanCard = styled(Card)<PlanCardProps>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: selected ? '3px solid #FFD700' : '2px solid rgba(255, 255, 255, 0.2)',
  background: selected
    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  color: selected ? '#000' : '#333',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: selected
    ? '0 20px 40px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2)'
    : '0 10px 30px rgba(0, 0, 0, 0.1)',
  '&:hover, &:focus, &:active': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: selected
      ? '0 25px 50px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3)'
      : '0 15px 40px rgba(102, 126, 234, 0.2)',
    border: selected ? '3px solid #FFD700' : '2px solid rgba(102, 126, 234, 0.5)',
    outline: 'none',
  },
  '@media (hover: none)': {
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'transform 0.1s ease',
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 1) 100%)',
  color: '#667eea',
  borderRadius: '16px',
  padding: '14px 40px',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '1.1rem',
  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
  border: '2px solid rgba(255, 255, 255, 0.5)',
  minHeight: '48px',
  minWidth: '120px',
  '&:hover, &:focus': {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(255, 255, 255, 0.4)',
    outline: 'none',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
    transition: 'transform 0.1s ease',
  },
  [theme.breakpoints.down('md')]: {
    padding: '16px 32px',
    fontSize: '1rem',
    minHeight: '52px',
    width: '100%',
  },
}));

// Types
interface PricingPlan {
  id: string;
  name: string;
  priceUsd: number;
  hbarPrice: number;
  gasFeeHbar: number;
  totalHbar: number;
  gasFeeUsd: number;
  popular?: boolean;
  currentHbarRate: number;
  lastUpdated: string;
}

interface TAITokenConfig {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description: string;
}

interface PricingData {
  plans: PricingPlan[];
  taiToken: TAITokenConfig;
  hbarPrice: number;
  lastUpdated: string;
}

interface PaymentGatewayTAIProps {
  open: boolean;
  onClose: () => void;
  onPurchaseComplete: (tokens: number) => void;
}

const PaymentGatewayTAI: React.FC<PaymentGatewayTAIProps> = ({
  open,
  onClose,
  onPurchaseComplete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    'Select TAI Token Plan',
    'Choose Payment Method',
    'Complete Payment',
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setActiveStep(1);
  };

  const handlePaymentMethodSelect = () => {
    setActiveStep(2);
  };

  // Fetch pricing plans when component opens
  useEffect(() => {
    if (open) {
      fetchPricingPlans();
    }
  }, [open]);

  const fetchPricingPlans = async () => {
    try {
      setLoadingPlans(true);
      setError(null);

      const apiUrl = `${API_BASE_URL}/payment/plans`;
      console.log('📊 Fetching pricing plans from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
      }

      const result = await response.json();
      if (result.success) {
        setPricingData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch pricing plans');
      }
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pricing plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const calculateTaiTokens = (usdAmount: number) => {
    // 1 USD = 1000 TAI tokens (same calculation as backend)
    return Math.floor(usdAmount * 1000);
  };

  const handlePaymentComplete = async (planId: string) => {
    setLoading(true);
    try {
      const plan = pricingData?.plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Selected plan not found');
      }

      const taiTokens = calculateTaiTokens(plan.priceUsd);
      setSuccess(true);
      onPurchaseComplete(taiTokens);

      setTimeout(() => {
        onClose();
        handleReset();
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPlan(null);
    setPricingData(null);
    setActiveStep(0);
    setLoading(false);
    setLoadingPlans(true);
    setError(null);
    setSuccess(false);
    setActiveTab(0);
  };

  const renderPricingPlans = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (loadingPlans) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#ffffff' }} />
          <Typography sx={{ ml: 2, color: '#ffffff' }}>Loading pricing plans...</Typography>
        </Box>
      );
    }

    if (!pricingData?.plans) {
      return (
        <Alert severity="error" sx={{ mx: 2 }}>
          Failed to load pricing plans. Please try again.
          <Button onClick={fetchPricingPlans} sx={{ ml: 2 }} size="small">
            Retry
          </Button>
        </Alert>
      );
    }

    return (
      <Box>
        {/* TAI Token Info */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
            Purchase TAI Tokens
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            {pricingData.taiToken.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Token ID: ${pricingData.taiToken.tokenId}`}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
            />
            <Chip
              label={`Symbol: ${pricingData.taiToken.symbol}`}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
            />
            <Chip
              label={`1 USD = 1,000 TAI`}
              sx={{ backgroundColor: 'rgba(255, 215, 0, 0.2)', color: '#FFD700' }}
            />
          </Box>
        </Box>

        {/* Current HBAR Rate */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Current HBAR Rate: ${pricingData.hbarPrice.toFixed(6)} USD
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Last updated: {new Date(pricingData.lastUpdated).toLocaleString()}
          </Typography>
          <IconButton
            onClick={fetchPricingPlans}
            size="small"
            sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            maxWidth: '1200px',
            margin: '0 auto',
            px: isMobile ? 2 : 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 2 : 3,
          }}
        >
          {pricingData.plans.map((plan) => (
            <Box
              key={plan.id}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 12px)',
                  md: 'calc(33.333% - 16px)',
                },
              }}
            >
              <PlanCard
                selected={selectedPlan?.id === plan.id}
                onClick={() => handlePlanSelect(plan)}
                sx={{
                  width: '100%',
                  maxWidth: '320px',
                  minHeight: isMobile ? '320px' : '450px',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <CardContent sx={{
                  p: isMobile ? 3 : 4,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    {plan.popular && (
                      <Box sx={{ position: 'absolute', top: -20, right: -20, zIndex: 3 }}>
                        <Chip
                          label="MOST POPULAR"
                          sx={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            boxShadow: '0 4px 15px rgba(238, 90, 36, 0.4)',
                            transform: 'rotate(12deg)',
                          }}
                        />
                      </Box>
                    )}

                    {/* Plan Icon */}
                    <Box sx={{
                      width: 80,
                      height: 80,
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      background: selectedPlan?.id === plan.id
                        ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    }}>
                      <AccountBalanceWalletIcon sx={{
                        fontSize: 40,
                        color: selectedPlan?.id === plan.id ? '#000' : '#ffffff'
                      }} />
                    </Box>

                    <Typography variant="h5" sx={{
                      fontWeight: 700,
                      mb: 2,
                      background: selectedPlan?.id === plan.id
                        ? 'linear-gradient(135deg, #000 0%, #333 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {plan.name}
                    </Typography>

                    <Typography variant="h2" sx={{
                      fontWeight: 900,
                      color: selectedPlan?.id === plan.id ? '#000' : '#667eea',
                      mb: 1,
                      textShadow: selectedPlan?.id === plan.id ? '2px 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      {calculateTaiTokens(plan.priceUsd).toLocaleString()}
                      <Typography component="span" variant="h6" sx={{
                        color: '#10b981',
                        ml: 1,
                        fontWeight: 600,
                        display: 'block',
                        fontSize: '1rem'
                      }}>
                        TAI TOKENS
                      </Typography>
                    </Typography>

                    <Box sx={{
                      background: selectedPlan?.id === plan.id
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '12px',
                      p: 2,
                      mb: 2
                    }}>
                      <Typography variant="h3" sx={{
                        fontWeight: 800,
                        color: selectedPlan?.id === plan.id ? '#000' : '#667eea'
                      }}>
                        ${plan.priceUsd}
                      </Typography>

                      <Typography variant="body2" sx={{
                        color: selectedPlan?.id === plan.id ? 'rgba(0,0,0,0.6)' : 'rgba(102, 126, 234, 0.7)',
                        fontWeight: 500,
                        mb: 1
                      }}>
                        ≈ {plan.totalHbar.toFixed(2)} HBAR
                      </Typography>

                      <Typography variant="caption" sx={{
                        color: selectedPlan?.id === plan.id ? 'rgba(0,0,0,0.5)' : 'rgba(102, 126, 234, 0.6)',
                        fontWeight: 500
                      }}>
                        (includes {plan.gasFeeHbar.toFixed(4)} HBAR gas fee)
                      </Typography>
                    </Box>

                    {/* Value indicator */}
                    <Typography variant="caption" sx={{
                      color: selectedPlan?.id === plan.id ? 'rgba(0,0,0,0.5)' : 'rgba(102, 126, 234, 0.6)',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {(plan.priceUsd / calculateTaiTokens(plan.priceUsd)).toFixed(4)} USD per TAI
                    </Typography>
                  </Box>
                </CardContent>
              </PlanCard>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderPaymentMethods = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
      <Box sx={{ px: isMobile ? 1 : 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            mb: isMobile ? 2 : 3,
            '& .MuiTabs-flexContainer': {
              gap: isMobile ? 1 : 2,
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <GradientTab
            icon={<AccountBalanceWalletIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
            label={isMobile ? "Wallet" : "HashPack Wallet"}
            iconPosition="start"
          />
        </Tabs>

        {selectedPlan && (
          <WalletConnect
            amount={selectedPlan.totalHbar}
            tokens={calculateTaiTokens(selectedPlan.priceUsd)}
            priceUsd={selectedPlan.priceUsd}
            planId={selectedPlan.id}
            onPaymentComplete={() => handlePaymentComplete(selectedPlan.id)}
          />
        )}
      </Box>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPricingPlans();
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
              Selected Plan: {selectedPlan?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
              {selectedPlan ? calculateTaiTokens(selectedPlan.priceUsd).toLocaleString() : 0} TAI tokens for ${selectedPlan?.priceUsd}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
              Total: {selectedPlan?.totalHbar.toFixed(4)} HBAR (includes {selectedPlan?.gasFeeHbar.toFixed(4)} HBAR gas fee)
            </Typography>
            <PrimaryButton onClick={handlePaymentMethodSelect}>
              Continue to Payment
            </PrimaryButton>
          </Box>
        );
      case 2:
        return renderPaymentMethods();
      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        position: 'relative',
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#ffffff' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Buy TAI Tokens
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              Choose your TAI token package
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="large"
          sx={{
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        pb: 3,
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        margin: { xs: '0 16px 16px', md: '0 24px 24px' },
        borderRadius: { xs: '16px', md: '20px' },
        border: '1px solid rgba(255, 255, 255, 0.1)',
        flex: 1,
        overflow: 'auto',
        maxHeight: { xs: 'calc(100vh - 200px)', md: 'none' },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.5)',
          },
        },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 3 }}
          >
            Payment successful! TAI tokens have been added to your account.
          </Alert>
        )}

        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            '& .MuiStepLabel-root': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
            '& .MuiStepLabel-label': {
              fontSize: '1.1rem',
              fontWeight: 600,
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: '#ffffff',
              fontWeight: 700,
            },
            '& .MuiStepIcon-root': {
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '2rem',
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: '#FFD700',
              animation: 'pulse 2s ease-in-out infinite',
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: '#10b981',
            },
            '& .MuiStepConnector-line': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: '2px',
            },
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)',
              },
              '70%': {
                transform: 'scale(1.1)',
                boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)',
              },
              '100%': {
                transform: 'scale(1)',
                boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)',
              },
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{
                  animation: activeStep === index ? 'fadeInUp 0.5s ease-out' : 'none',
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}>
                  {renderStepContent(index)}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Processing payment...</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{
        p: { xs: 2, md: 3 },
        pt: 0,
        gap: 2,
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {activeStep > 0 && !loading && !success && (
          <Button
            onClick={() => setActiveStep(activeStep - 1)}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              minHeight: { xs: '44px', md: '48px' },
              px: { xs: 2, md: 3 },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              },
              '&:active': {
                transform: 'scale(0.98)',
                transition: 'transform 0.1s ease',
              },
            }}
          >
            Back
          </Button>
        )}
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            minHeight: { xs: '44px', md: '48px' },
            px: { xs: 2, md: 3 },
            marginLeft: activeStep === 0 ? 'auto' : 0,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            },
            '&:active': {
              transform: 'scale(0.98)',
              transition: 'transform 0.1s ease',
            },
          }}
        >
          {success ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PaymentGatewayTAI;