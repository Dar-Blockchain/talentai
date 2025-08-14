import { Box, Stepper, Step, StepLabel } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import React from 'react';

const RegistrationStepper: React.FC<{ steps: string[]; activeStep: number }> = ({ steps, activeStep }) => (
  <Box sx={{ position: 'relative', mb: 3, pb: 1 }}>
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1.5, '& .MuiStepIcon-root': { color: '#D1C4E9' }, '& .MuiStepIcon-root.Mui-active': { color: '#7C4DFF' }, '& .MuiStepIcon-root.Mui-completed': { color: '#5E35B1' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
      {steps.map((label, idx) => (
        <Step key={label}>
          <StepLabel icon={idx === 0 ? <PersonIcon /> : idx === 1 ? <AssignmentIcon /> : <GroupAddIcon />}>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
    {/* Animated gradient progress bar */}
    <Box sx={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: `${((activeStep + 1) / steps.length) * 100}%`,
      height: 5,
      borderRadius: 2,
      background: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
      transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 2,
      boxShadow: '0 2px 8px #7C4DFF33',
    }} />
    <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 5, borderRadius: 2, background: '#EDE7F6', zIndex: 1 }} />
  </Box>
);

export default RegistrationStepper; 