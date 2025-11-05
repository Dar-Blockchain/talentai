import React from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading your dashboard...",
  color = "#8310FF"
}) => {
  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Loading dashboard"
      role="main"
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress 
          sx={{ color }} 
          size={60}
          aria-label="Loading profile data"
        />
        <Typography 
          variant="h6" 
          sx={{ mt: 2, color }}
          aria-live="polite"
        >
          {message}
        </Typography>
      </Box>
    </Container>
  );
};

export default LoadingState;
