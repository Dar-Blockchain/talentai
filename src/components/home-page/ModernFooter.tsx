import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  IconButton,
  Container
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';

// Sub-component: Footer Header
const FooterHeader = () => (
  <Box
    sx={{
      backgroundColor: '#141415',
      borderRadius: 3,
      p: 4,
      mb: 4,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2
    }}
  >
    {/* Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img
        src="/images/jobseeker_landing/TalentAiPurpleHome.png"
        alt="TalentAi"
      />
    </Box>

    {/* Tagline */}
    <Typography
      sx={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '16px',
        color: '#cccccc',
        maxWidth: 400,
        textAlign: 'right'
      }}
    >
      Discover personalized job recommendations, expert resources, and seamless tools to streamline your search.
    </Typography>
  </Box>
);

// Sub-component: Newsletter Section
const NewsletterSection = () => (
  <Box
    sx={{
      backgroundColor: '#141415',
      borderRadius: 3,
      p: 4,
      flex: 1,
      minWidth: 300
    }}
  >
    <Typography
      sx={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '24px',
        fontWeight: 700,
        color: '#ffffff',
        mb: 1
      }}
    >
      Newsletter
    </Typography>
    <Typography
      sx={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        color: '#cccccc',
        mb: 3
      }}
    >
      Stay updated with our newsletter
    </Typography>

    <TextField
      placeholder="Email Address*"
      variant="outlined"
      fullWidth
      sx={{
        mb: 2,
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1a1a1a',
          borderRadius: 2,
          '& fieldset': {
            borderColor: '#444444'
          },
          '&:hover fieldset': {
            borderColor: '#666666'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#8310FF'
          }
        },
        '& .MuiInputBase-input': {
          color: '#ffffff',
          fontFamily: 'Poppins, sans-serif'
        },
        '& .MuiInputBase-input::placeholder': {
          color: '#ffffff',
          opacity: 0.7
        }
      }}
    />

    <Button
      variant="contained"
      endIcon={<ArrowForwardIcon />}
      sx={{
        backgroundColor: '#8310FF',
        borderRadius: 2,
        px: 3,
        py: 1.5,
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        mb: 2,
        '&:hover': {
          backgroundColor: '#9c27b0'
        }
      }}
    >
      Subscribe
    </Button>

    <Typography
      sx={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '12px',
        color: '#999999',
        lineHeight: 1.4
      }}
    >
      By subscribing you agree with our privacy policy and provide consent to receive updates from our company.
    </Typography>
  </Box>
);

// Sub-component: Navigation Column
const NavigationColumn = ({ 
  title, 
  links 
}: { 
  title: string; 
  links: string[]; 
}) => (
  <Box>
    <Typography
      sx={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '16px',
        fontWeight: 700,
        color: '#ffffff',
        mb: 2
      }}
    >
      {title}
    </Typography>
    <Stack spacing={1}>
      {links.map((link) => (
        <Link
          key={link}
          href="#"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            color: '#ffffff',
            textDecoration: 'none',
            '&:hover': {
              color: '#8310FF'
            }
          }}
        >
          {link}
        </Link>
      ))}
    </Stack>
  </Box>
);

// Sub-component: Navigation Links Section
const NavigationLinksSection = () => {
  const navigationData = [
    {
      title: 'Lorem ipsum',
      links: ['Home', 'Features', 'About Us', 'Enterprise']
    },
    {
      title: 'Lorem ipsum',
      links: ['Blog', 'Contact Us', 'Online Chat', 'Whatsapp', 'Telegram', 'Help Center']
    },
    {
      title: 'Lorem ipsum',
      links: ['Help Center', 'How it Works', 'Business', 'Page', 'Enterprise']
    },
    {
      title: 'Lorem ipsum',
      links: ['Latest Job', 'Popular Company', 'Trending Startup', 'Featured Jobs']
    },
    {
      title: 'Lorem ipsum',
      links: ['About Us', 'Contact Us', 'Career Tips', 'Career']
    }
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#141415',
        borderRadius: 3,
        p: 4,
        flex: 2,
        minWidth: 400
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 3
        }}
      >
        {navigationData.map((column, index) => (
          <NavigationColumn
            key={index}
            title={column.title}
            links={column.links}
          />
        ))}
      </Box>
    </Box>
  );
};

// Sub-component: Social Media Icons
const SocialMediaIcons = () => (
  <Stack direction="row" spacing={1}>
    <IconButton
      sx={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#8310FF'
        }
      }}
    >
      <InstagramIcon />
    </IconButton>
    <IconButton
      sx={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#8310FF'
        }
      }}
    >
      <LinkedInIcon />
    </IconButton>
    <IconButton
      sx={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#8310FF'
        }
      }}
    >
      <FacebookIcon />
    </IconButton>
  </Stack>
);

// Sub-component: Legal Links
const LegalLinks = () => {
  const legalLinks = ['Terms of Service', 'Privacy Policy', 'Legal Notice', 'Cookie Setting'];
  
  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {legalLinks.map((link) => (
        <Link
          key={link}
          href="#"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            color: '#ffffff',
            textDecoration: 'none',
            '&:hover': {
              color: '#8310FF'
            }
          }}
        >
          {link}
        </Link>
      ))}
    </Box>
  );
};

// Sub-component: Footer Bottom
const FooterBottom = () => (
  <Box
    sx={{
      backgroundColor: '#141415',
      borderRadius: 3,
      p: 4,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2
    }}
  >
    {/* Left Side - Copyright & Social Media */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Typography
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          color: '#ffffff'
        }}
      >
        © 2025, TalentAi.
      </Typography>
      
      <SocialMediaIcons />
    </Box>

    {/* Right Side - Legal Links */}
    <LegalLinks />
  </Box>
);

const ModernFooter: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        py: 6,
        px: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="xl">
        {/* Top Header Block */}
        <FooterHeader />

        {/* Middle Content Blocks */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            mb: 4,
            flexWrap: 'wrap'
          }}
        >
          <NewsletterSection />
          <NavigationLinksSection />
        </Box>

        {/* Bottom Footer Block */}
        <FooterBottom />
      </Container>
    </Box>
  );
};

export default ModernFooter;
