import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

export interface Invitation {
  _id: string;
  email: string;
  Company?: any;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'active' | 'revoked';
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  token?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
}

interface PendingInvitationsListProps {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  onResend: (invitationId: string) => Promise<void>;
  onCancel: (invitationId: string) => Promise<void>;
}

const ROLE_LABELS: Record<string, string> = {
  RH: 'HR',
  TechLead: 'Technical Leader',
  Supervisor: 'Supervisor',
  Manager: 'Manager',
  hr: 'HR',
  technical_leader: 'Technical Leader',
  supervisor: 'Supervisor',
  manager: 'Manager',
};

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  accepted: 'success',
  expired: 'error',
  cancelled: 'default',
};

const STATUS_ICONS: Record<string, React.ReactElement> = {
  pending: <ScheduleIcon sx={{ fontSize: 18 }} />,
  accepted: <CheckCircleIcon sx={{ fontSize: 18 }} />,
  expired: <CancelIcon sx={{ fontSize: 18 }} />,
  cancelled: <CancelIcon sx={{ fontSize: 18 }} />,
};

const PendingInvitationsList: React.FC<PendingInvitationsListProps> = ({
  invitations,
  loading,
  error,
  onResend,
  onCancel,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, invitation: Invitation) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvitation(invitation);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedInvitation(null);
  }, []);

  const handleResend = useCallback(async () => {
    if (!selectedInvitation) return;

    setActionLoading(selectedInvitation._id);
    try {
      await onResend(selectedInvitation._id);
    } finally {
      setActionLoading(null);
      handleMenuClose();
    }
  }, [selectedInvitation, onResend, handleMenuClose]);

  const handleCancel = useCallback(async () => {
    if (!selectedInvitation) return;

    setActionLoading(selectedInvitation._id);
    try {
      await onCancel(selectedInvitation._id);
    } finally {
      setActionLoading(null);
      handleMenuClose();
    }
  }, [selectedInvitation, onCancel, handleMenuClose]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#8310FF' }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 4,
              backgroundColor: '#f8fafc',
              borderRadius: 3,
            }}
          >
            <EmailIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              No Pending Invitations
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              All your invitations have been accepted or there are no pending invitations
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
          Pending Invitations
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {invitations.length} pending {invitations.length === 1 ? 'invitation' : 'invitations'}
        </Typography>
      </Box>

      {/* Invitations Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Email
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Role
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Status
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Sent Date
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                py: 2
              }}>
                Expires
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  py: 2
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow
                key={invitation._id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  },
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                {/* Email */}
                <TableCell sx={{ py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                      {invitation.email || 'No email'}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Role */}
                <TableCell sx={{ py: 2.5 }}>
                  <Chip
                    label={ROLE_LABELS[invitation.role] || invitation.role}
                    size="small"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: 28
                    }}
                  />
                </TableCell>

                {/* Status */}
                <TableCell sx={{ py: 2.5 }}>
                  <Chip
                    icon={STATUS_ICONS[invitation.status]}
                    label={invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    color={STATUS_COLORS[invitation.status]}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28
                    }}
                  />
                </TableCell>

                {/* Sent Date */}
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {formatDate(invitation.createdAt)}
                  </Typography>
                </TableCell>

                {/* Expires */}
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {invitation.expiresAt ? formatDate(invitation.expiresAt) : 'N/A'}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" sx={{ py: 2.5 }}>
                  {actionLoading === invitation._id ? (
                    <CircularProgress size={20} sx={{ color: '#8310FF' }} />
                  ) : invitation.status === 'pending' ? (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, invitation)}
                      sx={{
                        color: '#64748b',
                        '&:hover': {
                          backgroundColor: 'rgba(131, 16, 255, 0.08)',
                          color: '#8310FF',
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 180,
            },
          },
        }}
      >
        <MenuItem onClick={handleResend}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Resend Invitation</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Cancel Invitation</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default React.memo(PendingInvitationsList);
