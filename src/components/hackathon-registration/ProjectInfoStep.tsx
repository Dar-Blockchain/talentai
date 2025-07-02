import { Box, Typography, Stack, TextField } from '@mui/material';
import React from 'react';

const ProjectInfoStep: React.FC<{
  projectName: string;
  projectDescription: string;
  setProjectName: (v: string) => void;
  setProjectDescription: (v: string) => void;
  track: string;
  setTrack: (v: string) => void;
}> = ({ projectName, projectDescription, setProjectName, setProjectDescription, track, setTrack }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
      Project Info
    </Typography>
    <Stack spacing={2}>
      <TextField
        label="Track"
        value={track}
        onChange={e => setTrack(e.target.value)}
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
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        helperText="Which track or theme does your project belong to?"
      />
      <TextField
        label="Project Name"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
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
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        helperText="Give your project a unique name"
      />
      <TextField
        label="Project Description"
        value={projectDescription}
        onChange={e => setProjectDescription(e.target.value)}
        multiline
        rows={3}
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
          '& .MuiOutlinedInput-root.Mui-focused': {
            boxShadow: '0 0 0 3px #E040FB44',
            borderColor: '#7C4DFF',
          },
        }}
        helperText="Describe your project in a few sentences"
      />
    </Stack>
  </Box>
);

export default ProjectInfoStep; 