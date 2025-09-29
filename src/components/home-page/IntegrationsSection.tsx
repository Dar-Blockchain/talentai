import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

const IntegrationsSection: React.FC = () => {
  return (
    <Box sx={{ px: 3, mb: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          backgroundColor: "#121212",
          color: "#fff",
          borderRadius: 2,
          border: '1px solid #1f2430',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }}>
          {/* Left copy */}
          <Box sx={{ 
            flex: 1, 
            p: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              lineHeight: 1.2
            }}>
              Integrations make TalentAI even better
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#D1D5DB', 
              maxWidth: 520, 
              mb: 3,
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.6
            }}>
              We play well with others. Connect TalentAI to some of the world's top names in HR and
              see how good life can be when all your tools work together.
            </Typography>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#ffffff', 
                color: '#111827', 
                textTransform: 'none', 
                borderRadius: 2, 
                boxShadow: 'none',
                alignSelf: 'flex-start',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Connect with 5,000+ apps and tools
            </Button>
          </Box>

          {/* Right side with integration image */}
          <Box sx={{ 
            flex: 1.2, 
            p: { xs: 3, md: 4 }, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 180 
          }}>
            <img 
              src="/images/home/integration.png" 
              alt="Integrations" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxWidth: '100%',
                objectFit: 'contain'
              }} 
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default IntegrationsSection;


