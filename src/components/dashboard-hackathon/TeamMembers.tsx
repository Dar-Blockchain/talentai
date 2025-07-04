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

const TeamMembers: React.FC<{ teamMembers: TeamMember[]; onInvite?: (email: string) => void }> = ({ teamMembers, onInvite }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
  const handleSend = () => {
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;
    if (onInvite) onInvite(email);
    else console.log('Invited:', email);
    handleClose();
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

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
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%', fontWeight: 600, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
          Invitation sent!
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
                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                      sx={{ ml: 1, fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', borderRadius: 1 }}
                    />
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