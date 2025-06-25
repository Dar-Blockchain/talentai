import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  '& .MuiSvgIcon-root': {
    fontSize: '4rem',
    color: theme.palette.error.main,
  },
}));

export default function Unauthorized() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <StyledPaper>
          <IconWrapper>
            <SecurityIcon />
          </IconWrapper>
          
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'error.main',
              mb: 2,
            }}
          >
            Access Denied
          </Typography>
          
          <Alert
            severity="error"
            sx={{
              mb: 3,
              textAlign: 'left',
              '& .MuiAlert-message': {
                fontSize: '1rem',
              },
            }}
          >
            You do not have permission to access this page. This area is restricted to administrators only.
          </Alert>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.6 }}
          >
            If you believe this is an error, please contact your system administrator or return to the previous page.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Go Back
            </Button>
            
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Go Home
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
} 