import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, IconButton, Divider, Stack, Avatar, Tooltip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

const TeamMembersStep: React.FC<{
  newMember: TeamMember;
  setNewMember: (v: TeamMember) => void;
  teamMembers: TeamMember[];
  handleAddMember: () => void;
  handleRemoveMember: (index: number) => void;
}> = ({ newMember, setNewMember, teamMembers, handleAddMember, handleRemoveMember }) => {
  // Validation state
  const [touched, setTouched] = useState({ name: false, email: false, role: false });
  const [errorMsg, setErrorMsg] = useState('');

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = {
    name: !newMember.name ? 'Name is required' : '',
    email: !newMember.email ? 'Email is required' : (!emailRegex.test(newMember.email) ? 'Invalid email address' : ''),
    role: !newMember.role ? 'Role is required' : '',
  };

  const isFormValid = !errors.name && !errors.email && !errors.role;
  const isMaxReached = teamMembers.length >= 4;

  const handleFieldChange = (field: keyof TeamMember, value: string) => {
    setNewMember({ ...newMember, [field]: value });
    setTouched({ ...touched, [field]: true });
    setErrorMsg('');
  };

  const handleAdd = () => {
    if (!isFormValid) {
      setTouched({ name: true, email: true, role: true });
      setErrorMsg('Please fix the errors before adding a team member.');
      return;
    }
    if (isMaxReached) return;
    setErrorMsg('');
    handleAddMember();
    setTouched({ name: false, email: false, role: false });
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
        Team Members
      </Typography>
      <Typography variant="body2" sx={{ color: '#7C4DFF', mb: 1, fontWeight: 500 }}>
        You can add up to 4 team members. {isMaxReached ? 'Maximum reached.' : `${4 - teamMembers.length} spot(s) left.`}
      </Typography>
      <Paper variant="outlined" sx={{
        p: 2.5,
        mb: 2.5,
        borderRadius: 3,
        bgcolor: '#FAF7FF',
        border: '1.5px solid #D1C4E9',
        boxShadow: '0 2px 12px #7C4DFF11',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 24px #7C4DFF22' },
      }}>
        <TextField
          label="Name"
          value={newMember.name}
          onChange={e => handleFieldChange('name', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          size="medium"
          fullWidth
          required
          error={!!errors.name && touched.name}
          variant="outlined"
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 1px 4px #7C4DFF11',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          }}
          InputProps={{ startAdornment: <PersonIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
          helperText={touched.name && errors.name ? errors.name : 'Full name of the member (required)'}
        />
        <TextField
          label="Email"
          type="email"
          value={newMember.email}
          onChange={e => handleFieldChange('email', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          size="medium"
          fullWidth
          required
          error={!!errors.email && touched.email}
          variant="outlined"
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 1px 4px #7C4DFF11',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          }}
          InputProps={{ startAdornment: <EmailIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
          helperText={touched.email && errors.email ? errors.email : 'Contact email (required)'}
        />
        <TextField
          label="Role"
          value={newMember.role}
          onChange={e => handleFieldChange('role', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, role: true }))}
          size="medium"
          fullWidth
          required
          error={!!errors.role && touched.role}
          variant="outlined"
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 1px 4px #7C4DFF11',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          }}
          InputProps={{ startAdornment: <WorkIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
          helperText={touched.role && errors.role ? errors.role : 'e.g. Developer, Designer, PM (required)'}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
          <Tooltip title={isMaxReached ? 'Maximum 4 members allowed' : !isFormValid ? 'Please fill all fields correctly' : 'Add member'} arrow>
            <span>
              <IconButton 
                onClick={handleAdd}
                size="medium"
                disabled={isMaxReached || !isFormValid}
                sx={{ 
                  bgcolor: isMaxReached ? '#E0E0E0' : 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
                  color: isMaxReached ? '#9E9E9E' : '#fff',
                  border: '1.5px solid #7C4DFF',
                  boxShadow: '0 2px 8px #7C4DFF22',
                  transition: 'all 0.2s',
                  cursor: isMaxReached ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    bgcolor: isMaxReached ? '#E0E0E0' : 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
                    borderColor: isMaxReached ? '#E0E0E0' : '#E040FB',
                    transform: isMaxReached ? 'none' : 'scale(1.08)',
                    boxShadow: isMaxReached ? 'none' : '0 4px 16px #E040FB33',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
      )}
      <Divider sx={{ my: 2, borderColor: '#D1C4E9' }} />
      <Stack spacing={2}>
        {teamMembers.map((member, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 2,
              border: '1.5px solid #E1BEE7',
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#fff',
              boxShadow: '0 2px 8px #7C4DFF11',
              transition: 'box-shadow 0.2s, border-color 0.2s',
              '&:hover': {
                boxShadow: '0 4px 16px #7C4DFF22',
                borderColor: '#7C4DFF',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#EDE7F6', color: '#7C4DFF', width: 36, height: 36, fontWeight: 700, fontSize: 18, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                {member.name[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#7C4DFF', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: '#4527A0', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                    {member.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                  <WorkIcon sx={{ color: '#8F9BB3', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#8F9BB3', fontWeight: 500, fontSize: '0.98rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                    {member.role}
                  </Typography>
                </Box>
                {member.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                    <EmailIcon sx={{ color: '#8F9BB3', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#8F9BB3', fontSize: '0.98rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                      {member.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <IconButton 
              onClick={() => handleRemoveMember(index)}
              size="medium"
              sx={{ color: '#F44336', '&:hover': { bgcolor: '#FFEBEE', transform: 'scale(1.08)' } }}
            >
              <DeleteIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default TeamMembersStep; 