import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  fetchInvitationDetails,
  respondToInvitation,
  selectMembers,
} from '@/store/slices/memberSlice';
import Cookies from 'js-cookie';

const ROLE_LABELS: Record<string, string> = {
  RH: 'HR',
  TechLead: 'Technical Leader',
  Supervisor: 'Supervisor',
  Manager: 'Manager',
};

const ROLE_ICONS: Record<string, React.ReactElement> = {
  RH: <PersonIcon sx={{ fontSize: 20 }} />,
  TechLead: <BarChartIcon sx={{ fontSize: 20 }} />,
  Supervisor: <BarChartIcon sx={{ fontSize: 20 }} />,
  Manager: <BarChartIcon sx={{ fontSize: 20 }} />,
};

const InvitationAcceptationPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { invitationId, token } = router.query;

  const {
    currentInvitation,
    fetchingInvitationDetails,
    respondingToInvitation,
    invitationResponse,
    error,
  } = useSelector(selectMembers);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  // Check authentication and redirect to signin if needed
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      const apiToken = Cookies.get('api_token') || localStorage.getItem('api_token');

      if (!apiToken && !isAuthenticated) {
        // Store the invitation link to return after signin
        const currentUrl = window.location.href;
        console.log('🔒 No authentication token found, redirecting to signin...');
        router.push(`/signin?returnUrl=${encodeURIComponent(currentUrl)}`);
      }
    };

    // Only check after router is ready and we have the invitation ID
    if (router.isReady && invitationId) {
      checkAuth();
    }
  }, [router.isReady, isAuthenticated, router, invitationId]);

  // Fetch invitation details when component mounts (only if authenticated)
  useEffect(() => {
    const apiToken = Cookies.get('api_token') || localStorage.getItem('api_token');

    if (invitationId && typeof invitationId === 'string' && (apiToken || isAuthenticated)) {
      console.log('🔍 Fetching invitation details for ID:', invitationId);
      dispatch(fetchInvitationDetails(invitationId));
    }
  }, [invitationId, dispatch, isAuthenticated]);

  const handleAccept = async () => {
    if (!invitationId || typeof invitationId !== 'string') return;

    try {
      await dispatch(
        respondToInvitation({ invitationId, action: 'accept' })
      ).unwrap();
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    }
  };

  const handleDecline = async () => {
    if (!invitationId || typeof invitationId !== 'string') return;

    try {
      await dispatch(
        respondToInvitation({ invitationId, action: 'reject' })
      ).unwrap();
    } catch (err) {
      console.error('Failed to decline invitation:', err);
    }
  };

  // Loading state
  if (fetchingInvitationDetails) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        <CircularProgress sx={{ color: '#8310FF' }} size={60} />
      </Box>
    );
  }

  // Check if logged-in user email matches invitation email
  const emailMismatch = currentInvitation && user && (currentInvitation as any).email &&
    user.email.toLowerCase() !== (currentInvitation as any).email.toLowerCase();

  // Error state or email mismatch
  if (error || !currentInvitation || emailMismatch) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: emailMismatch ? '#fef3c7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                }}
              >
                {emailMismatch ? (
                  <WarningIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 48, color: '#ef4444' }} />
                )}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                {emailMismatch ? 'Email Mismatch' : 'Invalid Invitation'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                {emailMismatch
                  ? `This invitation was sent to ${(currentInvitation as any).email}, but you are logged in as ${user?.email}. Please log in with the correct account to accept this invitation.`
                  : error || 'This invitation is no longer valid or has expired.'}
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push(emailMismatch ? '/dashboard/member' : '/')}
                sx={{
                  bgcolor: '#8310FF',
                  '&:hover': { bgcolor: '#6b0fd6' },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                }}
              >
                {emailMismatch ? 'Go to Dashboard' : 'Go to Home'}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Success state
  if (invitationResponse) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              {invitationResponse.action === 'accept' ? (
                <>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 3,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                    Invitation Accepted!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
                    Welcome to {(currentInvitation as any).Company?.username || currentInvitation.organization?.name || 'the team'}!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    You can now close this window
                  </Typography>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 3,
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 48, color: '#64748b' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                    Invitation Declined
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
                    You have declined the invitation.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    You can now close this window
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Main invitation view
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(131, 16, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailIcon sx={{ fontSize: 28, color: '#8310FF' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                    Team Invitation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    You've been invited to join a team
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Invitation Details */}
            <Box sx={{ mb: 4 }}>
              {/* Organization */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 20, color: '#8310FF' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600,
                      }}
                    >
                      Organization
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      {(currentInvitation as any).Company?.username || currentInvitation.organization?.name || 'Company'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Role */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    {ROLE_ICONS[currentInvitation.role] || <PersonIcon sx={{ fontSize: 20, color: '#8310FF' }} />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600,
                      }}
                    >
                      Role
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={ROLE_LABELS[currentInvitation.role] || currentInvitation.role}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          bgcolor: '#8310FF',
                          color: 'white',
                          height: 28,
                          '& .MuiChip-label': {
                            px: 1.5,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Email */}
              {(currentInvitation as any).email && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 20, color: '#8310FF' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600,
                        }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                        {(currentInvitation as any).email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Invited By */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20, color: '#8310FF' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600,
                      }}
                    >
                      Invited by
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      {(currentInvitation as any).invitedBy?.username || (currentInvitation as any).invitedBy?.email || 'Team Admin'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Expiration Info */}
              {currentInvitation.expiresAt && (
                <Box
                  sx={{
                    bgcolor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 2,
                    p: 2.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#3b82f6',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Expiration Date
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.875rem', fontWeight: 600 }}>
                    {new Date(currentInvitation.expiresAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleDecline}
                disabled={respondingToInvitation}
                sx={{
                  borderColor: '#e5e7eb',
                  color: '#64748b',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    bgcolor: '#f8fafc',
                  },
                  '&:disabled': {
                    borderColor: '#e5e7eb',
                    color: '#cbd5e1',
                  },
                }}
              >
                {respondingToInvitation ? 'Processing...' : 'Decline'}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAccept}
                disabled={respondingToInvitation}
                startIcon={
                  respondingToInvitation ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                sx={{
                  bgcolor: '#8310FF',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px rgba(131, 16, 255, 0.2)',
                  '&:hover': {
                    bgcolor: '#6b0fd6',
                    boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
                  },
                  '&:disabled': {
                    bgcolor: '#cbd5e1',
                    boxShadow: 'none',
                  },
                }}
              >
                {respondingToInvitation ? 'Processing...' : 'Accept Invitation'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InvitationAcceptationPage;
