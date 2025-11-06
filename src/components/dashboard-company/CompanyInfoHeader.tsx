import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchTokenBalance, selectTokenBalance, selectTokenLoading } from '@/store/slices/tokenSlice';
import TokenBalanceCard from './TokenBalanceCard';

// Styled Components
const ProfileHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  color: '#000000',
  padding: theme.spacing(4, 2),
  borderRadius: '32px',
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.06)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'radial-gradient(circle at top right, rgba(0, 0, 0, 0.03) 0%, transparent 70%)',
    zIndex: 1,
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6, 4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '12px 24px',
  height: 48,
  background: '#10b981',
  color: '#ffffff',
  letterSpacing: 0.3,
  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
  '&:hover': {
    background: '#059669',
    boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
  },
}));

interface CompanyInfoHeaderProps {
  profile: any;
}

const CompanyInfoHeader: React.FC<CompanyInfoHeaderProps> = ({ profile }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const tokenBalance = useSelector(selectTokenBalance);
  const tokenLoading = useSelector(selectTokenLoading);

  // Fetch token balance on component mount and when returning from payment
  useEffect(() => {
    dispatch(fetchTokenBalance());
  }, [dispatch]);

  // Refresh balance if returning from payment page
  useEffect(() => {
    const { refreshBalance } = router.query;
    if (refreshBalance === 'true') {
      dispatch(fetchTokenBalance());
      // Clean up the query parameter
      router.replace('/dashboard/company', undefined, { shallow: true });
    }
  }, [router.query, dispatch, router]);

  const handleBuyTokens = () => {
    router.push('/payment');
  };

  const handleRefreshBalance = async () => {
    await dispatch(fetchTokenBalance());
  };

  return (
    <ProfileHeader>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header with Company Info and Post Job Button */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: '#f3f4f6', 
                color: '#111827', 
                width: 56, 
                height: 56, 
                fontSize: 24, 
                fontWeight: 600,
                border: '2px solid #e5e7eb'
              }}
            >
              {(profile?.companyDetails?.name || profile?.userId?.username || 'C')?.[0]}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                  {profile?.companyDetails?.name || 'Company Name'}
                </Typography>
                {profile?.userId?.isVerified && (
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                {profile?.userId?.email || 'company@contact.com'}
              </Typography>
            </Box>
          </Box>
          <GradientButton 
            onClick={() => router.push('/posts/create')} 
            startIcon={<AddIcon />}
          >
            Post Job
          </GradientButton>
        </Box>

        {/* Info Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}>
          <Box sx={{
            background: '#ffffff',
            padding: 2.5,
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
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
              <CategoryIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                INDUSTRY
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', mt: 0.5 }}>
                {profile?.companyDetails?.industry || 'Technology'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            background: '#ffffff',
            padding: 2.5,
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
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
              <GroupsIcon sx={{ color: '#06b6d4', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                COMPANY SIZE
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', mt: 0.5 }}>
                {profile?.companyDetails?.size || '11 - 50'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            background: '#ffffff',
            padding: 2.5,
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
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
              <LocationOnIcon sx={{ color: '#10b981', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                LOCATION
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', mt: 0.5 }}>
                {profile?.companyDetails?.location || 'On-site'}
              </Typography>
            </Box>
          </Box>

          {/* Token Balance Card */}
          <Box>
            <TokenBalanceCard
              balance={tokenBalance}
              onBuyTokens={handleBuyTokens}
              onRefresh={handleRefreshBalance}
              loading={tokenLoading}
            />
          </Box>
        </Box>
      </Box>
    </ProfileHeader>
  );
};

export default CompanyInfoHeader;

