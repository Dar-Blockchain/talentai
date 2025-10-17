import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Link,
  IconButton,
  Container
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';

const SimpleFooter: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#141415',
        py: 3,
        px: 4,
        borderRadius: 2,
        mx: 2,
        mb: 2
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          {/* Left Side - Copyright */}
          <Typography
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              color: '#ffffff',
              fontWeight: 500
            }}
          >
            © 2025, TalentAi.
          </Typography>
          
          {/* Center - Social Media Icons */}
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              sx={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#8310FF'
                }
              }}
            >
              <InstagramIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#8310FF'
                }
              }}
            >
              <LinkedInIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#8310FF'
                }
              }}
            >
              <FacebookIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Right Side - Legal Links */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {['Terms of Service', 'Privacy Policy', 'Legal Notice', 'Cookie Setting'].map((link) => (
              <Link
                key={link}
                href="#"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#8310FF'
                  }
                }}
              >
                {link}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SimpleFooter;
