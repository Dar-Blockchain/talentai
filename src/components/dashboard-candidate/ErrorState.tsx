import React from 'react';
import {
  Container,
  Alert,
  Typography,
  Button,
} from '@mui/material';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  title?: string;
  retryText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  title = "Error Loading Dashboard",
  retryText = "Try Again"
}) => {
  return (
    <Container sx={{ mt: 4 }} role="main">
      <Alert 
        severity="error" 
        sx={{ borderRadius: "12px" }}
        aria-live="assertive"
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>
          {error}
        </Typography>
        <Button 
          onClick={onRetry} 
          sx={{ mt: 2 }}
          variant="outlined"
          aria-label="Retry loading profile"
        >
          {retryText}
        </Button>
      </Alert>
    </Container>
  );
};

export default ErrorState;
