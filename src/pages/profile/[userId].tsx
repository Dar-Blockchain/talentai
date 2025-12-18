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
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  LinearProgress,
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
} from '@mui/icons-material';
import { getProfileById, selectProfileById, clearProfileById } from '@/store/slices/profileSlice';
import HeaderDashboard from '@/components/HeaderDashboard';
import SimpleFooter from '@/components/SimpleFooter';
import ShareProfileModal from '@/components/profile/ShareProfileModal';

const ProfileByIdPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, error } = useSelector(selectProfileById);
  const { profile: currentUserProfile } = useSelector((state: RootState) => state.profile);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [linkedInConnected, setLinkedInConnected] = React.useState(false);
  const [isPostingToLinkedIn, setIsPostingToLinkedIn] = React.useState(false);

  // Determine if current user is viewing their own profile
  // Only true if user is authenticated AND viewing their own profile
  const isOwnProfile = currentUserProfile?._id && profile?._id && currentUserProfile._id === profile._id;

  // Calculate share data (memoized to avoid recalculation)
  const shareData = useMemo(() => {
    if (!profile || typeof window === 'undefined') {
      return null;
    }

    const profileUrl = window.location.href;
    const profileName = profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.companyDetails?.name || 'TalentAI User';

    // Calculate statistics
    const totalSkills = (profile?.skills?.length || 0) + (profile?.softSkills?.length || 0);
    const verifiedSkills = [
      ...(profile?.skills?.filter((s: any) => s.ScoreTest && s.ScoreTest > 0) || []),
      ...(profile?.softSkills?.filter((s: any) => s.ScoreTest && s.ScoreTest > 0) || [])
    ];
    const verifiedCount = verifiedSkills.length;
    const totalInterviews = profile?.interviewDetails?.length || 0;
    const overallScore = Number(profile?.overallScore) || 0;

    // Get top 3 verified skills with scores
    const topSkills = verifiedSkills
      .sort((a: any, b: any) => (b.ScoreTest || 0) - (a.ScoreTest || 0))
      .slice(0, 3)
      .map((s: any) => `${s.name} (${s.ScoreTest}/100)`)
      .join(', ');

    // Build comprehensive share message
    let shareMessage = `🎯 Verified Professional Profile - ${profileName}\n\n`;

    if (verifiedCount > 0) {
      shareMessage += `✅ ${verifiedCount} Blockchain-Verified Skills\n`;
    }
    if (totalInterviews > 0) {
      shareMessage += `📊 ${totalInterviews} Completed AI Interviews\n`;
    }
    if (overallScore > 0) {
      shareMessage += `⭐ Overall Score: ${overallScore}/100\n`;
    }
    if (topSkills) {
      shareMessage += `\n🏆 Top Skills: ${topSkills}\n`;
    }

    shareMessage += `\n🔗 View my full verified profile on TalentAI`;

    return {
      profileUrl,
      profileName,
      shareMessage,
    };
  }, [profile]);

  // LinkedIn connect handler
  const handleLinkedInConnect = () => {
    if (typeof window === 'undefined') return;

    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/api/linkedin/auth/start',
      'LinkedIn Authentication',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  // Hybrid LinkedIn post handler - tries direct API, falls back to share dialog
  const handleDirectLinkedInPost = async () => {
    if (!shareData) return;

    setIsPostingToLinkedIn(true);

    try {
      const token = getLinkedInToken();

      if (!token) {
        alert('LinkedIn token not found. Please connect your LinkedIn account.');
        setIsPostingToLinkedIn(false);
        return;
      }

      console.log('🚀 Attempting direct LinkedIn post with token length:', token.length);

      const response = await fetch('/api/linkedin/directShare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          message: shareData.shareMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // SUCCESS: Direct API post worked!
        console.log('✅ Direct LinkedIn post succeeded!');
        alert('✅ Successfully shared to LinkedIn!');
        setShareModalOpen(false);
      } else if (data.suggestSimpleMethod || response.status === 403 || data.error?.includes('Failed to get LinkedIn profile')) {
        // FALLBACK: Use LinkedIn's share dialog (simple method)
        console.log('ℹ️ Direct post failed (403 or profile access denied), using LinkedIn share dialog...');
        console.log('Error details:', data);

        // Copy message to clipboard for user convenience
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(shareData.shareMessage);
            console.log('📋 Message copied to clipboard');
          }
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError);
        }

        // Open LinkedIn share dialog
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.profileUrl)}`;
        window.open(shareUrl, '_blank', 'width=600,height=600');

        // Show user-friendly message
        alert('📋 Your profile message has been copied to clipboard!\n\n' +
              'LinkedIn share dialog is opening...\n\n' +
              'Please paste the message (Ctrl+V) in the LinkedIn post and click "Post".');

        setShareModalOpen(false);
      } else {
        // OTHER ERROR: Show error details
        console.error('❌ LinkedIn post error:', data);
        alert(`❌ Failed to share to LinkedIn: ${data.error || 'Unknown error'}\n\nPlease try again or use the "Copy Message" button to share manually.`);
      }
    } catch (error) {
      console.error('❌ Network error posting to LinkedIn:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsPostingToLinkedIn(false);
    }
  };

  // LinkedIn share handler - now opens modal
  const handleLinkedInShare = () => {
    // Re-check LinkedIn connection status when opening modal
    // This catches cases where user connected LinkedIn in a previous session
    // or if the state update didn't trigger properly
    if (typeof window !== 'undefined') {
      const token = getLinkedInToken();
      const isConnected = !!token && token.length > 20;
      console.log('🔍 Opening share modal - Checking LinkedIn connection...');
      console.log('🔍 Token found:', !!token);
      console.log('🔍 Token length:', token ? token.length : 0);
      console.log('🔍 Is connected:', isConnected);
      console.log('🔍 Current state linkedInConnected:', linkedInConnected);

      if (isConnected && !linkedInConnected) {
        console.log('🔄 Updating linkedInConnected state from localStorage check');
        setLinkedInConnected(true);
      } else if (!isConnected) {
        console.log('⚠️ No valid token found in localStorage');
      } else {
        console.log('✅ State already correct');
      }
    }
    setShareModalOpen(true);
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

  // Helper function to get and validate LinkedIn token
  const getLinkedInToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    let token = localStorage.getItem('linkedin_token');
    if (!token) return null;

    // BACKWARD COMPATIBILITY FIX: Check if token is still URL-encoded
    // Old versions saved encoded tokens, we need to decode them
    if (token.includes('%')) {
      console.log('⚠️ Found encoded token in localStorage, decoding...');
      try {
        const decoded = decodeURIComponent(token);
        localStorage.setItem('linkedin_token', decoded);
        console.log('✅ Token decoded and re-saved');
        return decoded;
      } catch (e) {
        console.error('Failed to decode token:', e);
        return token; // Return as-is if decode fails
      }
    }

    return token;
  };

  // Check LinkedIn token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getLinkedInToken();
      const isConnected = !!token && token.length > 20;
      console.log('Profile page mounted - LinkedIn token found:', isConnected);
      setLinkedInConnected(isConnected);
    }
  }, []);

  // Listen for LinkedIn auth success from popup
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      console.log('🔔 Received postMessage:', event.data);
      console.log('🔔 Message origin:', event.origin);
      console.log('🔔 Window origin:', window.location.origin);

      // TEMPORARILY ACCEPT ALL ORIGINS for debugging
      // TODO: Re-enable origin check after debugging
      // if (event.origin !== window.location.origin) {
      //   console.log('Message origin mismatch:', event.origin, 'vs', window.location.origin);
      //   return;
      // }

      if (event.data.type === 'AUTH_SUCCESS' && event.data.provider === 'linkedin') {
        console.log('✅ LinkedIn authentication successful!');

        // CRITICAL FIX: Save token from message to PARENT's localStorage
        // Popup and parent have separate localStorage contexts!
        if (event.data.token && typeof event.data.token === 'string' && event.data.token.length > 20) {
          localStorage.setItem('linkedin_token', event.data.token);
          console.log('💾 Token saved to parent localStorage:', event.data.token.substring(0, 20) + '...');
          setLinkedInConnected(true);

          // Verify it was saved
          const token = getLinkedInToken();
          console.log('✅ Token verified in localStorage:', !!token);

          // Show success notification to user
          setTimeout(() => {
            alert('✅ LinkedIn connected successfully! You can now post to LinkedIn.');
          }, 100);
        } else {
          console.error('❌ AUTH_SUCCESS message missing or invalid token:', event.data.token);
          alert('❌ Authentication failed: Invalid token received. Please try again.');
        }
      }
    };

    console.log('Setting up message listener for LinkedIn auth...');
    window.addEventListener('message', handleAuthMessage);
    return () => {
      console.log('Cleaning up message listener');
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  // Listen for localStorage changes (fallback for cross-tab/window scenarios)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'linkedin_token' && event.newValue) {
        console.log('LinkedIn token added via storage event');
        setLinkedInConnected(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

          {/* Skills Section - Only for candidates */}
          {!isCompany && profile.skills && profile.skills.length > 0 && (
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CodeIcon sx={{ color: '#6B7280', fontSize: 24, mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  Technical Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {profile.skills.map((skill) => (
                  <Box key={skill._id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E5E7EB',
                        boxShadow: 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {skill?.name || 'N/A'}
                        </Typography>
                        {skill.ScoreTest && skill.ScoreTest > 0 && (
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                            label="Verified"
                            size="small"
                            sx={{
                              backgroundColor: '#ECFDF5',
                              color: '#10B981',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              border: '1px solid #D1FAE5',
                              height: 24,
                              '& .MuiChip-icon': {
                                color: '#10B981'
                              }
                            }}
                          />
                        )}
                      </Box>
                      {skill.experienceLevel && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Level: {skill.experienceLevel}
                        </Typography>
                      )}
                      {(skill.NumberTestPassed && skill.NumberTestPassed > 0) || (skill.ScoreTest && skill.ScoreTest > 0) ? (
                        <Box sx={{ mt: 1 }}>
                          {skill.NumberTestPassed && skill.NumberTestPassed > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Tests Passed: {skill.NumberTestPassed}
                            </Typography>
                          )}
                          {skill.ScoreTest && skill.ScoreTest > 0 && (
                            <>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Score: {skill.ScoreTest}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={skill.ScoreTest}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: '#E5E7EB',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#10B981',
                                    borderRadius: 3
                                  }
                                }}
                              />
                            </>
                          )}
                        </Box>
                      ) : null}
                    </Card>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Soft Skills Section - Only for candidates */}
          {!isCompany && profile.softSkills && profile.softSkills.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon sx={{ color: '#6B7280', fontSize: 24, mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  Soft Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {profile.softSkills.map((skill) => (
                  <Box key={skill._id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E5E7EB',
                        boxShadow: 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {skill?.name || 'N/A'}
                        </Typography>
                        {skill.ScoreTest && skill.ScoreTest > 0 && (
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                            label="Verified"
                            size="small"
                            sx={{
                              backgroundColor: '#ECFDF5',
                              color: '#10B981',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              border: '1px solid #D1FAE5',
                              height: 24,
                              '& .MuiChip-icon': {
                                color: '#10B981'
                              }
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {skill.category && (
                          <Chip label={skill.category} size="small" variant="outlined" />
                        )}
                        {skill.experienceLevel && (
                          <Chip label={skill.experienceLevel} size="small" color="secondary" />
                        )}
                      </Box>
                      {(skill.NumberTestPassed > 0 || skill.ScoreTest > 0) && (
                        <Box sx={{ mt: 1 }}>
                          {skill.NumberTestPassed > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Tests Passed: {skill.NumberTestPassed}
                            </Typography>
                          )}
                          {skill.ScoreTest > 0 && (
                            <>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Proficiency: {skill.ScoreTest}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={skill.ScoreTest}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: '#E5E7EB',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#10B981',
                                    borderRadius: 3
                                  }
                                }}
                              />
                            </>
                          )}
                        </Box>
                      )}
                    </Card>
                  </Box>
                ))}
              </Box>
            </Paper>
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
          onDirectPost={handleDirectLinkedInPost}
          isPosting={isPostingToLinkedIn}
        />
      )}
    </>
  );
};

export default ProfileByIdPage;
