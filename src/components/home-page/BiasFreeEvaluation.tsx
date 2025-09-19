import React from "react";
import { Box, Button, Checkbox, Stack, Typography } from "@mui/material";

const Bullet: React.FC<{ label: string }> = ({ label }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <img
      src="/images/home/icon.png"
      alt="Check icon"
      style={{
        width: 20,
        height: 20,
        objectFit: 'contain'
      }}
    />
    <Typography variant="body2" sx={{ color: '#fff' }}>{label}</Typography>
  </Stack>
);

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <Box sx={{
    p: 2,
    borderRadius: 2,
    bgcolor: '#F9FAFB',
    color: '#374151',
    border: '1px solid #E5E7EB',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 80,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  }}>
    <Box sx={{ 
      width: 40, 
      height: 40, 
      borderRadius: 2, 
      bgcolor: color, 
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#fff'
    }}>
      ✓
    </Box>
    <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
      {label}
    </Typography>
  </Box>
);

const BiasFreeEvaluation: React.FC = () => {
  return (
    <Box>
      {/* Floating Video Card Section */}
      <Box sx={{ 
        position: 'relative',
        mb: { xs: 6, md: 8 }
      }}>
        {/* Floating Blocks Row */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 4,
          mt: { xs: 8, md: 12 },
          px: 3,
          gap: 3
        }}>
          {/* White Video Card - 70% */}
          <Box sx={{
            bgcolor: '#fff',
            borderRadius: 3,
            p: 4,
            width: { xs: '90%', md: '70%' },
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Video iframe - Normal size */}
            <img
              src="/images/home/Iframe.png"
              alt="Video Feed"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Box>

          {/* Second Block - 30% */}
          <Box sx={{
            bgcolor: '#374151',
            borderRadius: 3,
            p: 4,
            width: { xs: '90%', md: '30%' },
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            mb: 25
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600, 
                mb: 2,
                color: '#fff',
                textAlign: 'center'
              }}
            >
              Watch How We Cut Hiring Time in Half
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#D1D5DB', 
                mb: 3,
                textAlign: 'center'
              }}
            >
              Transform weeks of manual work into minutes of intelligent automation.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                textTransform: 'none',
                backgroundColor: '#10B981',
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Request a Demo
            </Button>
          </Box>
        </Box>

        {/* Bias-Free Evaluation Section */}
        <Box sx={{ 
          backgroundColor: '#000000', 
          color: '#fff', 
          py: { xs: 6, md: 10 }, 
          px: 3, 
          mb: { xs: 6, md: 8 },
          position: 'relative',
          zIndex: 1,
          mt: { xs: -16, md: -20 }
        }}>
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 4, md: 6 }
        }}>
          {/* Left side - Text content */}
          <Box sx={{ flex: 1, maxWidth: 500, mt: { xs: 8, md: 12 } }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600, 
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: '#fff'
              }}
            >
              Bias-Free Evaluation.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#D1D5DB', 
                mb: 4,
                lineHeight: 1.6,
                fontSize: '1.125rem'
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>

            <Stack spacing={2} sx={{ mb: 4 }}>
              <Bullet label="Intelligent Candidate Engagement" />
              <Bullet label="Instant Qualification" />
              <Bullet label="Expertise at your fingertips" />
            </Stack>

            <Button 
              variant="outlined" 
              sx={{ 
                textTransform: 'none', 
                color: '#fff', 
                borderColor: '#fff',
                px: 4,
                py: 2,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Discover Recruitment Flow
            </Button>
          </Box>

          {/* Right side - White card with icon grid */}
          <Box sx={{ 
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center'
          }}>
            <Box sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 4,
              width: 350,
              height: 320,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: 3,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '1px solid #E5E7EB'
            }}>
              <Pill label="Technical" color="#8B5CF6" />
              <Pill label="Task" color="#EF4444" />
              <Pill label="Soft" color="#F59E0B" />
              <Pill label="Condition" color="#A855F7" />
              <Pill label="HR" color="#10B981" />
              <Pill label="Email" color="#059669" />
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  );
};

export default BiasFreeEvaluation;


