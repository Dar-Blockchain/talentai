import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import { useRouter } from 'next/router';

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

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3)
}));

const StatCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 3,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05), 0 1px 6px rgba(0, 0, 0, 0.04)',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)',
  },
}));

const IconCircle = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #7C4DFF22 0%, #00B8D422 100%)',
  border: `1px solid ${theme.palette.divider}`,
}));

const HeaderBadge = styled(Chip)(({ theme }) => ({
  borderRadius: 999,
  fontWeight: 600,
  height: 28,
  '& .MuiChip-label': { px: 1.5 },
  background: 'rgba(2, 226, 255, 0.08)',
  border: '1px solid rgba(2, 226, 255, 0.15)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 800,
  borderRadius: 999,
  padding: '10px 18px',
  height: 42,
  background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
  color: '#0f172a',
  letterSpacing: 0.2,
  boxShadow: '0 6px 18px rgba(2,226,255,0.3)',
  border: '1px solid rgba(255,255,255,0.35)',
  backdropFilter: 'blur(6px)',
  '&:hover': {
    background: 'linear-gradient(90deg, rgba(2,226,255,0.92) 0%, rgba(0,255,195,0.92) 100%)',
    boxShadow: '0 10px 24px rgba(2,226,255,0.35)',
    transform: 'translateY(-1px)'
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '12px',
  padding: theme.spacing(1.2),
  height: 36,
  background: 'rgba(2, 226, 255, 0.08)',
  color: '#111827',
  border: '1px solid rgba(2, 226, 255, 0.15)',
  fontWeight: 600,
  letterSpacing: 0.2,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(2, 226, 255, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(2,226,255,0.10)'
  },
  '& .MuiChip-icon': {
    color: '#00B8D4',
  },
  '& .MuiChip-deleteIcon': {
    color: '#ef4444',
  }
}));

interface CompanyInfoHeaderProps {
  profile: any;
  localRequiredSkills: string[];
}

const CompanyInfoHeader: React.FC<CompanyInfoHeaderProps> = ({ profile, localRequiredSkills }) => {
  const router = useRouter();

  return (
    <ProfileHeader>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 64, height: 64, fontSize: 28, fontWeight: 700 }}>
              {(profile?.companyDetails?.name || profile?.userId?.username || 'U')?.[0]}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                  {profile?.companyDetails?.name}
                </Typography>
                {profile?.userId?.isVerified && (
                  <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 24 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {profile?.type && (
                  <HeaderBadge label={profile.type} />
                )}
                {profile?.companyDetails?.location && (
                  <HeaderBadge label={profile.companyDetails.location} />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <GradientButton onClick={() => router.push('/posts/create')} endIcon={<AddIcon />}>
              Post Job
            </GradientButton>
          </Box>
        </Box>

        <StatsContainer>
          <StatCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCircle>
                <CategoryIcon sx={{ color: '#7C4DFF' }} />
              </IconCircle>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                  Industry
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {profile?.companyDetails?.industry || '—'}
                </Typography>
              </Box>
            </Box>
          </StatCard>
          <StatCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCircle>
                <GroupsIcon sx={{ color: '#00B8D4' }} />
              </IconCircle>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                  Company Size
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {profile?.companyDetails?.size || '—'}
                </Typography>
              </Box>
            </Box>
          </StatCard>
          <StatCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCircle>
                <LocationOnIcon sx={{ color: '#22C55E' }} />
              </IconCircle>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                  Location
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {profile?.companyDetails?.location || '—'}
                </Typography>
              </Box>
            </Box>
          </StatCard>
        </StatsContainer>

        {/* Required Skills in Header */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 1.5 }}>
            Required Skills
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.25,
            p: 2,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            {localRequiredSkills && localRequiredSkills.length > 0 ? (
              localRequiredSkills.map((skill, index) => (
                <SkillChip
                  key={`header-req-skill-${index}`}
                  icon={
                    <Box sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '999px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                      boxShadow: '0 2px 8px rgba(2,226,255,0.35)'
                    }}>
                      <StarIcon sx={{ fontSize: 14, color: '#0f172a' }} />
                    </Box>
                  }
                  label={`${skill}`}
                  sx={{
                    height: 38,
                    px: 1.25,
                    borderRadius: '999px',
                    fontWeight: 800,
                    letterSpacing: 0.2,
                    color: '#0f172a',
                    background: 'linear-gradient( to right bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.6) ) padding-box, linear-gradient(90deg, rgba(0,255,195,0.7), rgba(2,226,255,0.7)) border-box',
                    border: '1px solid transparent',
                    boxShadow: '0 4px 18px rgba(2,226,255,0.12)',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(2,226,255,0.22)'
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                No required skills added yet.
              </Typography>
            )}
          </Box>
          <Box sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            p: 2,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                boxShadow: '0 2px 8px rgba(2,226,255,0.35)'
              }}>
                <WorkIcon sx={{ fontSize: 16, color: '#0f172a' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#111827', fontWeight: 800 }}>
                Required Experience
              </Typography>
            </Box>
            <Chip
              label={profile?.requiredExperienceLevel || 'Not set'}
              sx={{
                height: 36,
                px: 1.25,
                borderRadius: '999px',
                fontWeight: 800,
                letterSpacing: 0.2,
                color: '#0f172a',
                background: 'linear-gradient( to right bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.6) ) padding-box, linear-gradient(90deg, rgba(0,255,195,0.7), rgba(2,226,255,0.7)) border-box',
                border: '1px solid transparent',
                boxShadow: '0 4px 18px rgba(2,226,255,0.12)',
                backdropFilter: 'blur(6px)'
              }}
            />
          </Box>
        </Box>
      </Box>
    </ProfileHeader>
  );
};

export default CompanyInfoHeader;

