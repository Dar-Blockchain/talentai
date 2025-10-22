import React, { useState } from 'react';
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
  Grid,
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import QRCodePayment from './QRCodePayment';
import WalletConnect from './WalletConnect';

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
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      animation: 'rotate 6s linear infinite',
      pointerEvents: 'none',
      opacity: 0.3,
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
  '@keyframes rotate': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}));

const GradientTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  minHeight: 56,
  minWidth: '120px',
  // Enhanced touch targets for mobile
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
  // Mobile responsive adjustments
  [theme.breakpoints.down('md')]: {
    minHeight: 48,
    fontSize: '0.9rem',
    padding: '8px 16px',
  },
}));

const TokenPackageCard = styled(Card)(({ theme, selected }: { theme?: any; selected?: boolean }) => ({
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
  // Enhanced touch interactions for mobile
  '&:hover, &:focus, &:active': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: selected
      ? '0 25px 50px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3)'
      : '0 15px 40px rgba(102, 126, 234, 0.2)',
    border: selected ? '3px solid #FFD700' : '2px solid rgba(102, 126, 234, 0.5)',
    outline: 'none',
  },
  // Mobile-specific touch feedback
  '@media (hover: none)': {
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'transform 0.1s ease',
    },
  },
  // Haptic feedback simulation with visual response
  '&:active': {
    animation: 'tapFeedback 0.2s ease',
  },
  '@keyframes tapFeedback': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(0.95)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: selected
      ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)'
      : 'linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover::before, &:focus::before, &:active::before': {
    transform: 'translateX(100%)',
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
  minHeight: '48px', // Better touch target
  minWidth: '120px',
  '&:hover, &:focus': {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(255, 255, 255, 0.4)',
    outline: 'none',
  },
  // Enhanced mobile touch feedback
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
    transition: 'transform 0.1s ease',
  },
  // Mobile-specific styles
  [theme.breakpoints.down('md')]: {
    padding: '16px 32px',
    fontSize: '1rem',
    minHeight: '52px',
    width: '100%',
  },
}));

// Types
interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

interface PaymentGatewayProps {
  open: boolean;
  onClose: () => void;
  onPurchaseComplete: (tokens: number) => void;
}

const tokenPackages: TokenPackage[] = [
  { id: 'basic', name: 'Basic', tokens: 100, price: 10 },
  { id: 'popular', name: 'Popular', tokens: 500, price: 45, popular: true, bonus: 50 },
  { id: 'premium', name: 'Premium', tokens: 1000, price: 80, bonus: 150 },
  { id: 'enterprise', name: 'Enterprise', tokens: 5000, price: 350, bonus: 1000 },
];

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  open,
  onClose,
  onPurchaseComplete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    'Select Token Package',
    'Choose Payment Method',
    'Complete Payment',
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePackageSelect = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setActiveStep(1);
  };

  const handlePaymentMethodSelect = () => {
    setActiveStep(2);
  };

  const handlePaymentComplete = async (tokens: number) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      onPurchaseComplete(tokens);

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
    setSelectedPackage(null);
    setActiveStep(0);
    setLoading(false);
    setError(null);
    setSuccess(false);
    setActiveTab(0);
  };

  const renderTokenPackages = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    return (
      <Grid
        container
        spacing={isMobile ? 2 : 3}
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          px: isMobile ? 2 : 3,
        }}
      >
        {tokenPackages.map((pkg) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={6}
            lg={6}
            xl={3}
            key={pkg.id}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <TokenPackageCard
              selected={selectedPackage?.id === pkg.id}
              onClick={() => handlePackageSelect(pkg)}
              sx={{
                width: '100%',
                maxWidth: isMobile ? '100%' : '300px',
                minHeight: isMobile ? '280px' : '400px',
                // Enhanced touch area for mobile
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
                  {pkg.popular && (
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

                  {/* Package Icon */}
                  <Box sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: selectedPackage?.id === pkg.id
                      ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  }}>
                    <AccountBalanceWalletIcon sx={{
                      fontSize: 40,
                      color: selectedPackage?.id === pkg.id ? '#000' : '#ffffff'
                    }} />
                  </Box>

                  <Typography variant="h5" sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: selectedPackage?.id === pkg.id
                      ? 'linear-gradient(135deg, #000 0%, #333 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {pkg.name}
                  </Typography>

                  <Typography variant="h2" sx={{
                    fontWeight: 900,
                    color: selectedPackage?.id === pkg.id ? '#000' : '#667eea',
                    mb: 1,
                    textShadow: selectedPackage?.id === pkg.id ? '2px 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {pkg.tokens.toLocaleString()}
                    {pkg.bonus && (
                      <Typography component="span" variant="h6" sx={{
                        color: '#10b981',
                        ml: 1,
                        fontWeight: 600,
                        display: 'block',
                        fontSize: '1rem'
                      }}>
                        +{pkg.bonus} BONUS
                      </Typography>
                    )}
                  </Typography>

                  <Typography variant="body1" sx={{
                    color: selectedPackage?.id === pkg.id ? 'rgba(0,0,0,0.7)' : 'rgba(102, 126, 234, 0.8)',
                    fontWeight: 600,
                    mb: 3
                  }}>
                    TOKENS
                  </Typography>

                  <Box sx={{
                    background: selectedPackage?.id === pkg.id
                      ? 'rgba(0, 0, 0, 0.1)'
                      : 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    p: 2,
                    mb: 2
                  }}>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      color: selectedPackage?.id === pkg.id ? '#000' : '#667eea'
                    }}>
                      ${pkg.price}
                    </Typography>

                    <Typography variant="body2" sx={{
                      color: selectedPackage?.id === pkg.id ? 'rgba(0,0,0,0.6)' : 'rgba(102, 126, 234, 0.7)',
                      fontWeight: 500
                    }}>
                      ${(pkg.price / (pkg.tokens + (pkg.bonus || 0))).toFixed(3)} per token
                    </Typography>
                  </Box>

                  {/* Value indicator */}
                  <Typography variant="caption" sx={{
                    color: selectedPackage?.id === pkg.id ? 'rgba(0,0,0,0.5)' : 'rgba(102, 126, 234, 0.6)',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Best Value for {pkg.name} Users
                  </Typography>
                </Box>
              </CardContent>
            </TokenPackageCard>
          </Grid>
        ))}
      </Grid>
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
              display: 'none', // Hide default indicator since we have custom styling
            },
          }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <GradientTab
            icon={<QrCodeIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
            label={isMobile ? "QR Code" : "QR Code Payment"}
            iconPosition="start"
          />
          <GradientTab
            icon={<AccountBalanceWalletIcon sx={{ fontSize: isMobile ? 20 : 24 }} />}
            label={isMobile ? "Wallet" : "HashPack Wallet"}
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 && (
          <QRCodePayment
            amount={selectedPackage?.price || 0}
            tokens={selectedPackage ? selectedPackage.tokens + (selectedPackage.bonus || 0) : 0}
            onPaymentComplete={() => handlePaymentComplete(selectedPackage ? selectedPackage.tokens + (selectedPackage.bonus || 0) : 0)}
          />
        )}

        {activeTab === 1 && (
          <WalletConnect
            amount={selectedPackage?.price || 0}
            tokens={selectedPackage ? selectedPackage.tokens + (selectedPackage.bonus || 0) : 0}
            onPaymentComplete={() => handlePaymentComplete(selectedPackage ? selectedPackage.tokens + (selectedPackage.bonus || 0) : 0)}
          />
        )}
      </Box>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderTokenPackages();
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Selected Package: {selectedPackage?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {selectedPackage?.tokens.toLocaleString()} tokens
              {selectedPackage?.bonus && ` + ${selectedPackage.bonus} bonus`}
              {' '}for ${selectedPackage?.price}
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
              Buy Tokens
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              Choose your perfect token package
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
            Payment successful! Tokens have been added to your account.
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

export default PaymentGateway;