import { Box, Typography, Paper, TextField, IconButton, Divider, Stack, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import React from 'react';

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
}> = ({ newMember, setNewMember, teamMembers, handleAddMember, handleRemoveMember }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
      Team Members
    </Typography>
    <Paper sx={{
      p: 1.5,
      mb: 2,
      borderRadius: 2,
      bgcolor: '#F3E5F5',
      border: '1.5px solid #E1BEE7',
      boxShadow: '0 2px 8px #7C4DFF11',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 1.5,
      alignItems: 'center',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' },
    }}>
      <TextField
        label="Name"
        value={newMember.name}
        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
        size="medium"
        fullWidth
        variant="outlined"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        InputProps={{ startAdornment: <PersonIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
        helperText="Full name of the member"
      />
      <TextField
        label="Email (Optional)"
        type="email"
        value={newMember.email}
        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
        size="medium"
        fullWidth
        variant="outlined"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        InputProps={{ startAdornment: <EmailIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
        helperText="Contact email (optional)"
      />
      <TextField
        label="Role"
        value={newMember.role}
        onChange={e => setNewMember({ ...newMember, role: e.target.value })}
        size="medium"
        fullWidth
        variant="outlined"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        InputProps={{ startAdornment: <WorkIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
        helperText="e.g. Developer, Designer, PM"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
        <IconButton 
          onClick={handleAddMember}
          size="medium"
          sx={{ 
            bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
            color: '#fff',
            border: '1.5px solid #7C4DFF',
            boxShadow: '0 2px 8px #7C4DFF22',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
              borderColor: '#E040FB',
              transform: 'scale(1.08)',
              boxShadow: '0 4px 16px #E040FB33',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>
    </Paper>
    <Divider sx={{ my: 1.5, borderColor: '#D1C4E9' }} />
    <Stack spacing={1.5}>
      {teamMembers.map((member, index) => (
        <Paper
          key={index}
          sx={{
            p: 1.5,
            border: '1.5px solid #E1BEE7',
            borderRadius: 2,
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

export default TeamMembersStep; 