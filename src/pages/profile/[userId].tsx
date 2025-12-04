'use client';
import React, { useEffect, useMemo } from 'react';
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
} from '@mui/icons-material';
import { getProfileById, selectProfileById, clearProfileById } from '@/store/slices/profileSlice';
import HeaderDashboard from '@/components/HeaderDashboard';
import SimpleFooter from '@/components/SimpleFooter';

const ProfileByIdPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, error } = useSelector(selectProfileById);

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

  return (
    <>
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
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar
                src={userImage}
                sx={{
                  width: 120,
                  height: 120,
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 },
                  border: '4px solid #00FF9D',
                  boxShadow: '0 4px 12px rgba(0, 255, 157, 0.2)'
                }}
              >
                {isCompany ? <BusinessIcon sx={{ fontSize: 60 }} /> : <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                  {fullName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
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
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

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
            <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CodeIcon sx={{ color: '#00FF9D', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Technical Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {profile.skills.map((skill) => (
                  <Box key={skill._id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {skill?.name || 'N/A'}
                      </Typography>
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
                                  backgroundColor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#3b82f6'
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
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon sx={{ color: '#8b5cf6', mr: 1, fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Soft Skills
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {profile.softSkills.map((skill) => (
                  <Box key={skill._id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '3px solid #8b5cf6' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {skill?.name || 'N/A'}
                      </Typography>
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
                                  backgroundColor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#8b5cf6'
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
    </>
  );
};

export default ProfileByIdPage;
