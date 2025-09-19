import React from "react";
import { Box, Button, Link, Stack, Typography, IconButton } from "@mui/material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const FooterLink: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href = '#' }) => (
  <Link href={href} underline="none" sx={{ color: '#9CA3AF', fontSize: 12 }}>
    {children}
  </Link>
);

const FinalPricingCTA: React.FC = () => {
  return (
    <Box sx={{ 
      backgroundColor: '#121212', 
      color: '#fff', 
      py: { xs: 8, md: 12 }, 
      px: 3,
      textAlign: 'center'
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" sx={{ 
          fontFamily: 'Poppins, sans-serif', 
          fontWeight: 600,
          fontSize: { xs: '2rem', md: '2.5rem' },
          lineHeight: 1.2,
          mb: 3
        }}>
          Transparent pricing to help you
          <br />
          grow
        </Typography>
        
        <Typography variant="body1" sx={{ 
          color: '#D1D5DB', 
          maxWidth: 600, 
          mx: 'auto', 
          mb: 4,
          fontSize: { xs: '1rem', md: '1.125rem' },
          lineHeight: 1.6
        }}>
          Our Transparent Price Guarantee means no commitments or hidden fees. Hire, manage and pay
          your global team with confidence.
        </Typography>

        <Button
          variant="contained"
          sx={{ 
            backgroundColor: '#ffffff', 
            color: '#111827', 
            textTransform: 'none', 
            boxShadow: 'none', 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500
          }}
          href="#pricing"
        >
          Show all plans
        </Button>
      </Box>
    </Box>
  );
};

export default FinalPricingCTA;



