import { Box, Typography, Stack, TextField } from '@mui/material';
import React from 'react';

const LeaderInfoStep: React.FC<{
  leaderFirstName: string;
  leaderLastName: string;
  setLeaderFirstName: (v: string) => void;
  setLeaderLastName: (v: string) => void;
}> = ({ leaderFirstName, leaderLastName, setLeaderFirstName, setLeaderLastName }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
      Leader Info
    </Typography>
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
      <TextField
        label="Leader First Name"
        value={leaderFirstName}
        onChange={e => setLeaderFirstName(e.target.value)}
        fullWidth
        required
        variant="outlined"
        size="medium"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
        }}
        helperText="Enter the first name of the team leader"
      />
      <TextField
        label="Leader Last Name"
        value={leaderLastName}
        onChange={e => setLeaderLastName(e.target.value)}
        fullWidth
        required
        variant="outlined"
        size="medium"
        sx={{
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
        }}
        helperText="Enter the last name of the team leader"
      />
    </Stack>
  </Box>
);

export default LeaderInfoStep; 