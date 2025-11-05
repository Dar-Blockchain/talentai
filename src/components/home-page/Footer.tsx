import React from "react";
import { Box, Link, Stack, Typography, IconButton, Divider } from "@mui/material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

const FooterLink: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href = '#' }) => (
  <Link href={href} underline="none" sx={{ color: '#ffffff', fontSize: '0.875rem', '&:hover': { color: '#D1D5DB' } }}>
    {children}
  </Link>
);

const Footer: React.FC = () => {
  return (
    <Box sx={{ 
      backgroundColor: '#121212', 
      color: '#fff', 
      py: 4, 
      px: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Top Section - Copyright and Disclaimer */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#ffffff', mb: 2 }}>
            Copyright © 2025. TalentAI Inc. All rights reserved.
          </Typography>
          {/* <Typography variant="caption" sx={{ color: '#D1D5DB', fontSize: '0.75rem', lineHeight: 1.5 }}>
            *Numbers on this page are based on internal data compiled from existing customer base and speed assumption is based on the fact that standard onboarding may take 30 days and Remote's average onboarding time is 2.3 days.
          </Typography> */}
        </Box>

        {/* Divider Line */}
        <Divider sx={{ borderColor: '#374151', mb: 3 }} />

        {/* Bottom Section - Links and Social Media */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={{ xs: 2, md: 0 }}
        >
          {/* Policy Links */}
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Cookie Policy</FooterLink>
            <FooterLink>Terms of Use</FooterLink>
            <FooterLink>Disclaimer</FooterLink>
            <FooterLink>Imprint</FooterLink>
          </Stack>

          {/* Social Media Icons */}
          <Stack direction="row" spacing={1.5}>
            <IconButton 
              sx={{ 
                color: '#ffffff', 
                backgroundColor: '#ffffff', 
                width: 32, 
                height: 32,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }} 
              size="small"
            >
              <YouTubeIcon sx={{ color: '#121212', fontSize: '1rem' }} />
            </IconButton>
            <IconButton 
              sx={{ 
                color: '#ffffff', 
                backgroundColor: '#ffffff', 
                width: 32, 
                height: 32,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }} 
              size="small"
            >
              <LinkedInIcon sx={{ color: '#121212', fontSize: '1rem' }} />
            </IconButton>
            <IconButton 
              sx={{ 
                color: '#ffffff', 
                backgroundColor: '#ffffff', 
                width: 32, 
                height: 32,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }} 
              size="small"
            >
              <TwitterIcon sx={{ color: '#121212', fontSize: '1rem' }} />
            </IconButton>
            <IconButton 
              sx={{ 
                color: '#ffffff', 
                backgroundColor: '#ffffff', 
                width: 32, 
                height: 32,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }} 
              size="small"
            >
              <InstagramIcon sx={{ color: '#121212', fontSize: '1rem' }} />
            </IconButton>
            <IconButton 
              sx={{ 
                color: '#ffffff', 
                backgroundColor: '#ffffff', 
                width: 32, 
                height: 32,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }} 
              size="small"
            >
              <FacebookIcon sx={{ color: '#121212', fontSize: '1rem' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
