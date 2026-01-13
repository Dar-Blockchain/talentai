'use client';
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
  Box,
  Container,
  Typography,
  Card,
  Avatar,
  Chip,
  Button,
  Alert,
  Divider,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Verified as VerifiedIcon,
  EmojiEvents as EmojiEventsIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { getProfileById, clearTargetUser } from '@/store/slices/userSlice';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import SkillsSection from '@/components/profile/SkillsSection';
import BadgesSection from '@/components/profile/BadgesSection';
import { generateBadgesFromProfile } from '@/utils/generateProfileBadges';

const CandidateProfile: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { profile, user, loading, error } = useSelector((state: RootState) => state.user.targetUser);
  const currentUserProfile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const isOwnProfile = currentUserProfile?._id && profile?._id && currentUserProfile._id === profile._id;

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      dispatch(getProfileById(userId));
    }

    return () => {
      dispatch(clearTargetUser());
    };
  }, [userId, dispatch]);

  const profileData = useMemo(() => {
    if (!profile) return null;

    const fullName =  `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.userId?.username || 'Unknown User'

    return {
      fullName,
      email: user?.email || 'N/A',
      userImage: profile.user_image,
      createdAt: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'N/A',
    };
  }, [profile]);

  // Generate badges from profile skills
  const { technicalBadges, softBadges } = useMemo(() => {
    if (!profile) return { technicalBadges: [], softBadges: [] };
    return generateBadgesFromProfile(profile.skills || [], profile.softSkills || []);
  }, [profile]);

  const renderSkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={120} height={120} sx={{ mr: 3 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={30} />
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );

  // Check if profile is private (and viewer is not the owner)
  if (profile && !isOwnProfile && !profile.isPublicProfile) {
    return (
      <>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <VisibilityOffIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
              This Profile is Private
            </Typography>

            <Typography variant="body1" sx={{ color: '#64748b', mb: 3, maxWidth: 500, margin: '0 auto 24px' }}>
              The owner of this profile has chosen to keep their information private.
              Only they can view their full profile details.
            </Typography>

            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                maxWidth: 600,
                margin: '0 auto 32px',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
                Why can't I see this profile?
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                This user has disabled public viewing of their profile. If you need to contact them,
                please try reaching out through other communication channels or ask them to enable
                public profile visibility in their settings.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  borderColor: '#e5e7eb',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#8310FF',
                    backgroundColor: 'rgba(131, 16, 255, 0.04)',
                    color: '#8310FF',
                  },
                }}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
                  boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6b0fd9 0%, #9333ea 100%)',
                    boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
                  },
                }}
              >
                Go to Homepage
              </Button>
            </Box>
          </Paper>
      </>
    );
  }

  // Loading state
  if (loading || !profile || !profileData) {
    return (
      <>
        <Header/>
        {renderSkeleton()}
      </>
    );
  }

  const { fullName, email, userImage, createdAt } = profileData;

  // Calculate statistics for meta tags
  const verifiedSkills = [
    ...(profile?.skills?.filter((s: any) => s.ScoreTest && s.ScoreTest > 0) || []),
    ...(profile?.softSkills?.filter((s: any) => s.ScoreTest && s.ScoreTest > 0) || [])
  ];
  const verifiedCount = verifiedSkills.length;
  const totalInterviews = profile?.interviewDetails?.length || 0;
  const overallScore = Number(profile?.overallScore) || 0;

  // Build rich meta description with all statistics
  const topSkillsList = verifiedSkills
    .slice(0, 5)
    .map(s => s.name)
    .join(', ');

  const metaDescription = `${fullName} on TalentAI - ${verifiedCount} Blockchain-Verified Skills${totalInterviews > 0 ? `, ${totalInterviews} Completed AI Interviews` : ''}${overallScore > 0 ? `, Overall Score: ${overallScore}/100` : ''}. Top Skills: ${topSkillsList || 'Building portfolio'}. View verified professional profile.`;

  // Build canonical URL
  const profileCanonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://talentai.com'}/profile/candidate/${userId}`;

  return (
    <PageContainer>
      <Header/>
      <>

          {/* Profile Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar
                src={userImage}
                sx={{
                  width: 100,
                  height: 100,
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 },
                  border: '2px solid #E5E7EB'
                }}
              >
                <PersonIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: '#1F2937',
                    }}
                  >
                    {fullName}
                  </Typography>
                  {isOwnProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => router.push('/settings/profile?tab=personal')}
                      sx={{
                        borderColor: '#8310FF',
                        color: '#8310FF',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#6a0dad',
                          background: 'rgba(131, 16, 255, 0.05)',
                        }
                      }}
                    >
                      Settings
                    </Button>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 2 }}>
                  <Chip
                    label={'Candidate'}
                    color={'success'}
                    sx={{ fontWeight: 600 }}
                  />
                  {profile.overallScore && (
                    <Chip
                      icon={<StarIcon />}
                      label={`Score: ${profile.overallScore}`}
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Stats Section - Professional Design */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mb: 3
              }}>
                {/* Verified Skills */}
                <Card sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedIcon sx={{ fontSize: 20, color: '#6B7280', mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Verified Skills
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                    {verifiedCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Blockchain Verified
                  </Typography>
                </Card>

                {/* AI Interviews */}
                <Card sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PsychologyIcon sx={{ fontSize: 20, color: '#6B7280', mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      AI Interviews
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                    {totalInterviews}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Completed
                  </Typography>
                </Card>

                {/* Overall Score */}
                {overallScore > 0 && (
                  <Card sx={{
                    p: 3,
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StarIcon sx={{ fontSize: 20, color: '#6B7280', mr: 1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Overall Score
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                      {overallScore}
                      <Typography component="span" variant="body2" sx={{ color: '#9CA3AF', ml: 0.5 }}>
                        / 100
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            fontSize: 12,
                            color: i < Math.floor(overallScore / 20) ? '#FBBF24' : '#E5E7EB'
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                )}

                {/* Total Skills */}
                <Card sx={{
                  p: 3,
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CodeIcon sx={{ fontSize: 20, color: '#6B7280', mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Skills
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                    {(profile?.skills?.length || 0) + (profile?.softSkills?.length || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Technical & Soft
                  </Typography>
                </Card>
              </Box>
            

            {/* Basic Info */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #00FF9D' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ color: '#00FF9D', mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {email}
                  </Typography>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #00FF9D' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ color: '#00FF9D', mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Member Since
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {createdAt}
                  </Typography>
                </Card>
              </Box>

              {profile.targetRole && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #3b82f6' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon sx={{ color: '#3b82f6', mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Target Role
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {profile.targetRole}
                    </Typography>
                  </Card>
                </Box>
              )}

              {profile.requiredExperienceLevel && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #8b5cf6' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StarIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        Experience Level
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {profile.requiredExperienceLevel}
                    </Typography>
                  </Card>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Technical Badges Section */}
          { technicalBadges.length > 0 && (
            <BadgesSection
              title="Technical Badges"
              badges={technicalBadges}
              icon={EmojiEventsIcon}
              gradientColors="#fda085"
              type="technical"
            />
          )}

          {/* Soft Skill Badges Section */}
          {softBadges.length > 0 && (
            <BadgesSection
              title="Soft Skill Badges"
              badges={softBadges}
              icon={EmojiEventsIcon}
              gradientColors="linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
              type="soft"
            />
          )}

          {/* Technical Skills Section */}
            <SkillsSection
              title="Technical Skills"
              skills={profile.skills || []}
              icon={CodeIcon}
              gradientColors="#764ba2"
              type="technical"
            />
        

          {/* Soft Skills Section */}
            <SkillsSection
              title="Soft Skills"
              skills={profile.softSkills || []}
              icon={PsychologyIcon}
              gradientColors="#f5576c"
              type="soft"
            />
        
      </>
    </PageContainer>
  );
};

export default CandidateProfile;