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
  LinkedIn as LinkedInIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { getProfileById, selectProfileById, clearProfileById } from '@/store/slices/profileSlice';
import HeaderDashboard from '@/components/HeaderDashboard';
import SimpleFooter from '@/components/SimpleFooter';
import ShareProfileModal from '@/components/profile/ShareProfileModal';
import SkillsSection from '@/components/profile/SkillsSection';
import BadgesSection from '@/components/profile/BadgesSection';
import { useLinkedInShare } from '@/hooks/useLinkedInShare';
import { useProfileShareData } from '@/hooks/useProfileShareData';
import { generateBadgesFromProfile } from '@/utils/generateProfileBadges';

const ProfileByIdPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, error } = useSelector(selectProfileById);
  const { profile: currentUserProfile } = useSelector((state: RootState) => state.profile);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);

  // Determine if current user is viewing their own profile
  const isOwnProfile = currentUserProfile?._id && profile?._id && currentUserProfile._id === profile._id;

  // Use custom hooks for LinkedIn functionality and share data
  const { linkedInConnected, isPostingToLinkedIn, handleLinkedInConnect, handleDirectLinkedInPost } = useLinkedInShare();
  const shareData = useProfileShareData(profile);

  // LinkedIn share handler - opens modal
  const handleLinkedInShare = () => {
    setShareModalOpen(true);
  };

  // Wrapper function for direct LinkedIn post
  const handlePost = () => {
    if (shareData) {
      handleDirectLinkedInPost(shareData);
    }
  };

  // Copy profile link
  const handleCopyLink = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('✅ Profile link copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy link. Please try again.');
    });
  };

  // Fetch profile when userId changes
  useEffect(() => {
    if (userId && typeof userId === 'string') {
      dispatch(getProfileById(userId));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearProfileById());
    };
  }, [userId, dispatch]);

  // Memoized computed values
  const profileData = useMemo(() => {
    if (!profile || !profile.userId) return null;

    const isCompany = profile.type === 'company';
    const fullName = isCompany
      ? profile.companyDetails?.name || 'Company Name'
      : `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.userId?.username || 'Unknown User';

    return {
      fullName,
      isCompany,
      email: profile.userId?.email || 'N/A',
      userImage: profile.user_image || profile.userId?.user_image,
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

  // Loading skeleton
  const renderSkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={150} height={40} />
      </Box>
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

  // Error state
  if (error) {
    return (
      <>
        <HeaderDashboard />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Box
                component="span"
                onClick={() => router.back()}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'error.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <ArrowBackIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Go Back
              </Box>
            }
          >
            {error}
          </Alert>
        </Container>
        <SimpleFooter />
      </>
    );
  }

  // Loading state
  if (loading || !profile || !profileData) {
    return (
      <>
        <HeaderDashboard />
        {renderSkeleton()}
        <SimpleFooter />
      </>
    );
  }

  const { fullName, isCompany, email, userImage, createdAt } = profileData;

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
  const profileCanonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://talentai.com'}/profile/${userId}`;

  return (
    <>
      <Head>
        <title>{`${fullName} - Verified Profile | TalentAI`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={profileCanonicalUrl} />

        {/* Open Graph / Facebook / LinkedIn */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${fullName} - Verified Professional Profile on TalentAI`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={userImage || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://talentai.com'}/images/default-profile.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={profileCanonicalUrl} />
        <meta property="og:site_name" content="TalentAI - Blockchain-Verified Skills Platform" />

        {/* LinkedIn Profile Schema */}
        <meta property="profile:first_name" content={profile?.firstName || ''} />
        <meta property="profile:last_name" content={profile?.lastName || ''} />
        <meta property="profile:username" content={profile?.userId?.username || ''} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${fullName} - Verified Profile`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={userImage || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://talentai.com'}/images/default-profile.png`} />

        {/* Additional SEO */}
        <meta name="keywords" content={`${fullName}, verified skills, blockchain credentials, ${topSkillsList}, professional profile, TalentAI`} />
        <meta name="author" content={fullName} />
      </Head>
      <HeaderDashboard />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', pb: 4 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Back Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 }
            }}
            onClick={() => router.back()}
          >
            <ArrowBackIcon sx={{ mr: 1, color: '#00FF9D' }} />
            <Typography variant="h6" sx={{ color: '#00FF9D', fontWeight: 600 }}>
              Back
            </Typography>
          </Box>

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
                {isCompany ? <BusinessIcon sx={{ fontSize: 50 }} /> : <PersonIcon sx={{ fontSize: 50 }} />}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: '#1F2937',
                    mb: 1
                  }}
                >
                  {fullName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 2 }}>
                  <Chip
                    label={isCompany ? 'Company' : 'Candidate'}
                    color={isCompany ? 'primary' : 'success'}
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

                {/* Share Buttons - Only show for profile owner */}
                {!isCompany && isOwnProfile && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<LinkedInIcon />}
                      onClick={handleLinkedInShare}
                      sx={{
                        background: '#0077B5',
                        color: '#fff',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { background: '#006399' }
                      }}
                    >
                      Share on LinkedIn
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        borderColor: '#00FF9D',
                        color: '#00FF9D',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#00FF9D',
                          background: 'rgba(0, 255, 157, 0.1)'
                        }
                      }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Stats Section - Professional Design */}
            {!isCompany && (
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
            )}

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

              {!isCompany && profile.targetRole && (
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

              {!isCompany && profile.requiredExperienceLevel && (
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

              {isCompany && profile.companyDetails && (
                <>
                  {profile.companyDetails.industry && (
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #3b82f6' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BusinessIcon sx={{ color: '#3b82f6', mr: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            Industry
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {profile.companyDetails.industry}
                        </Typography>
                      </Card>
                    </Box>
                  )}
                  {profile.companyDetails.size && (
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #f59e0b' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ color: '#f59e0b', mr: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            Company Size
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {profile.companyDetails.size}
                        </Typography>
                      </Card>
                    </Box>
                  )}
                  {profile.companyDetails.location && (
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '4px solid #ef4444' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ color: '#ef4444', mr: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            Location
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {profile.companyDetails.location}
                        </Typography>
                      </Card>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>

          {/* Technical Badges Section */}
          {!isCompany && technicalBadges.length > 0 && (
            <BadgesSection
              title="Technical Badges"
              badges={technicalBadges}
              icon={EmojiEventsIcon}
              gradientColors="linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
              type="technical"
            />
          )}

          {/* Soft Skill Badges Section */}
          {!isCompany && softBadges.length > 0 && (
            <BadgesSection
              title="Soft Skill Badges"
              badges={softBadges}
              icon={EmojiEventsIcon}
              gradientColors="linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
              type="soft"
            />
          )}

          {/* Technical Skills Section */}
          {!isCompany && (
            <SkillsSection
              title="Technical Skills"
              skills={profile.skills || []}
              icon={CodeIcon}
              gradientColors="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              type="technical"
            />
          )}

          {/* Soft Skills Section */}
          {!isCompany && (
            <SkillsSection
              title="Soft Skills"
              skills={profile.softSkills || []}
              icon={PsychologyIcon}
              gradientColors="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              type="soft"
            />
          )}
        </Container>
      </Box>
      <SimpleFooter />

      {/* Share Profile Modal */}
      {shareData && (
        <ShareProfileModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareMessage={shareData.shareMessage}
          profileUrl={shareData.profileUrl}
          profileName={shareData.profileName}
          linkedInConnected={linkedInConnected}
          onLinkedInConnect={handleLinkedInConnect}
          onDirectPost={handlePost}
          isPosting={isPostingToLinkedIn}
        />
      )}
    </>
  );
};

export default ProfileByIdPage;
