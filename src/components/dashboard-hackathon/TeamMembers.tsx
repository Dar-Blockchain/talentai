import { Card, CardHeader, Divider, CardContent, Box, Avatar, Typography, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, InputAdornment, Chip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/CheckCircle';
import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';

interface TeamMember {
  name: string;
  email?: string;
  role: string;
  validated?: boolean;
}

interface TeamMembersProps {
  teamMembers: TeamMember[];
  onInvite?: (email: string) => void;
  projectId: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ teamMembers, onInvite, projectId }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [resendingIndex, setResendingIndex] = useState<number | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    // Simple email regex
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(value)) return 'Enter a valid email address';
    return '';
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setName('');
    setRole('');
    setEmailError('');
    setNameError('');
  };
  const handleSend = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    const nameErr = !name.trim() ? 'Name is required' : '';
    setNameError(nameErr);
    if (error || nameErr) return;
    setSendingInvite(true);
    try {
      const token = localStorage.getItem('api_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/addMemberToTeam`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId, email, name, role: role || 'Member' }),
      });
      if (!res.ok) throw new Error('Failed to add team member');
      setSnackbarMsg('Team member added!');
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      setSnackbarMsg('Failed to add team member.');
      setSnackbarOpen(true);
    } finally {
      setSendingInvite(false);
    }
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const resendInvitation = async (email: string, idx: number) => {
    setResendingIndex(idx);
    try {
      const token = localStorage.getItem('api_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/resendTeamInvitation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId, email }),
      });
      if (!res.ok) throw new Error('Failed to resend invitation');
      setSnackbarMsg('Invitation resent!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg('Failed to resend invitation.');
      setSnackbarOpen(true);
    } finally {
      setResendingIndex(null);
    }
  };

  return (
    <Card sx={{
      boxShadow: '0 2px 12px #7C4DFF22',
      bgcolor: '#fff',
      border: 'none',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
      px: 0,
      py: 0,
      minHeight: 180,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 6px 24px #7C4DFF33' },
    }}>
      <CardHeader
        avatar={<GroupIcon sx={{ color: '#7C4DFF', fontSize: 28, ml: 1 }} />}
        title={<span style={{
          color: '#7C4DFF',
          fontWeight: 800,
          fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
          letterSpacing: 0.5,
          fontSize: '1.15rem',
        }}>Team Members</span>}
        sx={{ pb: 1, pl: 2, bgcolor: 'transparent', zIndex: 2 }}
      />
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 350 } }}>
        <Box display="flex" flexDirection="column" alignItems="center" pt={3}>
          <Avatar sx={{ bgcolor: '#7C4DFF', width: 56, height: 56, mb: 1 }}>
            <EmailIcon fontSize="large" />
          </Avatar>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#7C4DFF', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', p: 0 }}>Invite Team Member</DialogTitle>
          <Typography variant="body2" sx={{ color: '#8F9BB3', mt: 1, mb: 2, textAlign: 'center', maxWidth: 300 }}>
            Enter the email address of the person you want to invite to your team. They will receive an invitation to join.
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={e => {
              setName(e.target.value);
              setNameError(!e.target.value.trim() ? 'Name is required' : '');
            }}
            variant="outlined"
            error={!!nameError}
            helperText={nameError}
            sx={{ borderRadius: 2, bgcolor: '#F3F6FD', mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setEmailError(validateEmail(e.target.value));
            }}
            variant="outlined"
            error={!!emailError}
            helperText={emailError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2, bgcolor: '#F3F6FD' }}
          />
          <TextField
            margin="dense"
            label="Role"
            type="text"
            fullWidth
            value={role}
            onChange={e => setRole(e.target.value)}
            variant="outlined"
            helperText="Optional (defaults to 'Member')"
            sx={{ borderRadius: 2, bgcolor: '#F3F6FD', mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: 'center' }}>
          <Button onClick={handleClose} color="secondary" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleSend}
            variant="contained"
            sx={{ bgcolor: '#7C4DFF', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#5E35B1' } }}
            disabled={!email || !!emailError || sendingInvite}
            endIcon={!sendingInvite ? <EmailIcon /> : null}
          >
            {sendingInvite ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarMsg.includes('Failed') ? 'error' : 'success'} sx={{ width: '100%', fontWeight: 600, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
      <Divider sx={{ borderColor: '#EDE7F6' }} />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {teamMembers.map((member, index) => (
          <Box key={index}>
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
              background: '#fff',
              boxShadow: '0 1px 4px #7C4DFF11',
              mb: 1,
              transition: 'box-shadow 0.15s, transform 0.15s',
              '&:hover': {
                boxShadow: '0 2px 8px #7C4DFF22',
                transform: 'scale(1.01)',
              },
            }}>
              <Tooltip title={member.email || ''} placement="top" arrow>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#EDE7F6',
                    color: '#7C4DFF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                    boxShadow: '0 1px 4px #7C4DFF22',
                  }}
                >
                  {member.name[0].toUpperCase()}
                </Avatar>
              </Tooltip>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', ml: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#2E3A59', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontSize: '1.05rem' }} noWrap>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8F9BB3', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 600, fontSize: '0.98rem' }} noWrap>
                    {'('+member.role+')'}
                  </Typography>
                </Box>
                {member.email && (
                  <Typography variant="body2" sx={{ color: '#2196F3', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontWeight: 500, fontSize: '0.92rem', mt: 0.2 }} noWrap>
                    {member.email}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 120 }}>
                {Boolean(member.validated) ? (
                  <Chip
                    label="Validated"
                    color="success"
                    size="small"
                    icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                    sx={{ fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', borderRadius: 1, px: 1, fontSize: '0.92rem' }}
                  />
                ) : (
                  <>
                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', borderRadius: 1, px: 1, fontSize: '0.92rem', mb: 0.5 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#7C4DFF', color: '#7C4DFF', fontSize: '0.95rem', px: 1.5, '&:hover': { borderColor: '#5E35B1', color: '#5E35B1' } }}
                      onClick={() => resendInvitation(member.email || '', index)}
                      disabled={!member.email || resendingIndex === index}
                      startIcon={resendingIndex === index ? <CircularProgress size={18} sx={{ color: '#7C4DFF' }} /> : null}
                    >
                      {resendingIndex === index ? 'Resending...' : 'Resend'}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            {index < teamMembers.length - 1 && (
              <Divider sx={{ borderColor: '#EDE7F6', mx: 2 }} />
            )}
          </Box>
        ))}
        {/* Modern Invite Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon />}
            sx={{
              background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
              color: '#fff',
              fontWeight: 800,
              fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1.08rem',
              boxShadow: '0 4px 16px #7C4DFF22',
              textTransform: 'none',
              letterSpacing: 0.2,
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #6b0cd6 0%, #00acc1 100%)',
                boxShadow: '0 8px 32px #7C4DFF33',
              },
            }}
            onClick={handleOpen}
          >
            Invite Team Member
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TeamMembers; 