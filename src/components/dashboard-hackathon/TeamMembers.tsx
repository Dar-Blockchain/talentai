import { Card, CardHeader, Divider, CardContent, Box, Avatar, Typography, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, InputAdornment, Chip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedIcon from '@mui/icons-material/CheckCircle';
import React, { useState } from 'react';

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
  const [emailError, setEmailError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

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
    setEmailError('');
  };
  const handleSend = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;
    try {
      const token = localStorage.getItem('api_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/addMemberToTeam`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId, email }),
      });
      if (!res.ok) throw new Error('Failed to add team member');
      setSnackbarMsg('Team member added!');
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      setSnackbarMsg('Failed to add team member.');
      setSnackbarOpen(true);
    }
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const resendInvitation = async (email: string) => {
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
    }
  };

  return (
    <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
      <CardHeader
        title="Team Members"
        titleTypographyProps={{
          variant: 'subtitle1',
          fontWeight: 700,
          color: '#7C4DFF',
          fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
        }}
        sx={{ pb: 1 }}
        action={
          <Button
            variant="contained"
            size="small"
            sx={{ bgcolor: '#7C4DFF', textTransform: 'none', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', boxShadow: 'none', '&:hover': { bgcolor: '#5E35B1' } }}
            onClick={handleOpen}
          >
            Invite
          </Button>
        }
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: 'center' }}>
          <Button onClick={handleClose} color="secondary" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSend} variant="contained" sx={{ bgcolor: '#7C4DFF', textTransform: 'none', fontWeight: 700, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#5E35B1' } }} disabled={!email || !!emailError} endIcon={<EmailIcon />}>
            Send Invite
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
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={member.email || ''} placement="top" arrow>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'linear-gradient(135deg, #7C4DFF 0%, #2196F3 100%)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                    boxShadow: '0 2px 8px #7C4DFF33',
                  }}
                >
                  {member.name[0].toUpperCase()}
                </Avatar>
              </Tooltip>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ color: '#2E3A59', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                  {member.name}
                  {Boolean(member.validated) ? (
                    <Chip
                      label="Validated"
                      color="success"
                      size="small"
                      icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                      sx={{ ml: 1, fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', borderRadius: 1 }}
                    />
                  ) : (
                    <>
                      <Chip
                        label="Pending"
                        color="warning"
                        size="small"
                        sx={{ ml: 1, fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', borderRadius: 1 }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        onClick={() => resendInvitation(member.email || '')}
                        disabled={!member.email}
                      >
                        Resend Invitation
                      </Button>
                    </>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8F9BB3', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                    {member.role}
                  </Typography>
                  {member.email && (
                    <Box sx={{ ml: 1, px: 1, py: 0.2, bgcolor: '#E3F2FD', borderRadius: 1, fontSize: '0.8rem', color: '#2196F3', fontWeight: 600, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                      {member.email}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            {index < teamMembers.length - 1 && (
              <Divider sx={{ borderColor: '#EDE7F6' }} />
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default TeamMembers; 