import { Box, Typography, Stack, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
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
      <FormControl fullWidth required>
        <InputLabel id="track-label">Track</InputLabel>
        <Select
          labelId="track-label"
          value={track}
          label="Track"
          onChange={e => setTrack(e.target.value)}
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            boxShadow: '0 1px 4px #7C4DFF11',
            transition: 'box-shadow 0.2s, border-color 0.2s',
            '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
          }}
        >
          <MenuItem value="">Select a track</MenuItem>
          <MenuItem value="DeFi">DeFi (Decentralized Finance)</MenuItem>
          <MenuItem value="NFTs & Digital Assets">NFTs & Digital Assets</MenuItem>
          <MenuItem value="DAOs & Governance">DAOs & Governance</MenuItem>
          <MenuItem value="Blockchain Infrastructure">Blockchain Infrastructure</MenuItem>
          <MenuItem value="Identity & Privacy">Identity & Privacy</MenuItem>
          <MenuItem value="Web3 Social">Web3 Social</MenuItem>
          <MenuItem value="Gaming & Metaverse">Gaming & Metaverse</MenuItem>
          <MenuItem value="Layer 2 & Scalability">Layer 2 & Scalability</MenuItem>
          <MenuItem value="Security & Auditing">Security & Auditing</MenuItem>
          <MenuItem value="Sustainability & Social Impact">Sustainability & Social Impact</MenuItem>
        </Select>
      </FormControl>
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
        }}
        helperText="Describe your project in a few sentences"
      />
    </Stack>
  </Box>
);

export default ProjectInfoStep; 