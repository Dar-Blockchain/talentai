import React from "react";
import { Box, Typography } from "@mui/material";

const GlobalCompanies: React.FC = () => {
  const companies = [
    { name: "OpenAI", logo: "/images/GLOBAL_COMPANIES/OpenAI_Logo.png" },
    { name: "NVIDIA", logo: "/images/GLOBAL_COMPANIES/NVIDIA_logo.png" },
    { name: "F6S", logo: "/images/GLOBAL_COMPANIES/F6S_Logo.png" },
    { name: "Hedera", logo: "/images/GLOBAL_COMPANIES/hedera_Logo.png" },
    { name: "Dar Blockchain", logo: "/images/GLOBAL_COMPANIES/DarBlockchain_Logo.png" },
    { name: "Hashgraph", logo: "/images/GLOBAL_COMPANIES/Hashgraph_Logo.png" },
    { name: "The Hashgraph Association", logo: "/images/GLOBAL_COMPANIES/HashgraphAssoctition_Logo.png" },
    { name: "Hashgraph Online", logo: "/images/GLOBAL_COMPANIES/HashgraphOnline_Logo.png" },
  ];

  return (
    <Box sx={{ 
    
      maxWidth: 1400,
      mx: 'auto',
      background: '#EFF0F0',
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)',
      }
    }}>
      {/* Title */}
      <Typography 
        sx={{ 
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '14px',
          lineHeight: '21px',
          letterSpacing: '0.7px',
          textAlign: 'center',
          verticalAlign: 'middle',
          textTransform: 'uppercase',
          color: '#1e293b',
          mb: 6
        }}
      >
        GLOBAL COMPANIES GROW WITH REMOTE
      </Typography>
    
      {/* Company Logos */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: { xs: 4, md: 6 },
        px: 2,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #EFF0F0 0%, rgba(239,240,240,0) 10%, rgba(239,240,240,0) 90%, #EFF0F0 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 4, md: 6 },
          animation: 'slide 20s linear infinite',
          '@keyframes slide': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: 'translateX(-50%)',
            },
          },
        }}>
          {/* First set of logos */}
          {companies.map((company, index) => (
            <Box
              key={`first-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                flexShrink: 0,
                minWidth: 'fit-content',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <Box
                component="img"
                src={company.logo}
                alt={`${company.name} logo`}
                sx={{
                  height: { xs: 24, md: 32 },
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'grayscale(100%)',
                  transition: 'filter 0.2s',
                  '&:hover': {
                    filter: 'grayscale(0%)'
                  }
                }}
              />
            </Box>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <Box
              key={`second-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                flexShrink: 0,
                minWidth: 'fit-content',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <Box
                component="img"
                src={company.logo}
                alt={`${company.name} logo`}
                sx={{
                  height: { xs: 24, md: 32 },
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'grayscale(100%)',
                  transition: 'filter 0.2s',
                  '&:hover': {
                    filter: 'grayscale(0%)'
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalCompanies;
