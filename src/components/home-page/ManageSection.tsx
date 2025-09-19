import React from "react";
import { Box, Typography } from "@mui/material";

const Card: React.FC<{ title: string; desc: string; img: string }> = ({ title, desc, img }) => (
  <Box sx={{ 
    bgcolor: '#ffffff', 
    borderRadius: 3, 
    p: 0, 
    border: '1px solid #E5E7EB',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: { xs: '100%', sm: '350px', md: '400px' },
    width: '100%'
  }}>
    <Box sx={{ 
      borderRadius: '12px 12px 0 0', 
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      overflow: 'visible',
      position: 'relative',
      bgcolor: 'transparent'
    }}>
      <img 
        src={img} 
        alt={title} 
        style={{ 
          width: 'auto', 
          height: 'auto', 
          maxWidth: 'none',
          borderRadius: '12px 12px 0 0',
          display: 'block'
        }} 
      />
    </Box>
    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 700, 
        fontSize: { xs: '1rem', md: '1.125rem' },
        color: '#1F2937',
        mb: 1
      }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ 
        color: '#6B7280', 
        fontSize: { xs: '0.875rem', md: '0.9rem' },
        lineHeight: 1.5
      }}>
        {desc}
      </Typography>
    </Box>
  </Box>
);

const ManageSection: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#EFF0F0', py: { xs: 6, md: 10 }, px: 3, mb: { xs: 6, md: 8 } }}>
      <Box sx={{ width: '100%', mx: 0 }}>
        <Typography variant="overline" sx={{ color: '#22C55E', letterSpacing: 1, fontWeight: 600 }}>MANAGE</Typography>
        <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mt: 0.5 }}>
          Speed & Efficiency: Numbers Don't Lie
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 720, mt: 1.5 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2.5, 
          mt: 3,
          alignItems: 'stretch',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            width: { xs: '100%', sm: '350px' },
            maxWidth: '350px'
          }}>
            <Card title="Skills-Based Matching Revolution" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Global HR Management Software (HRIS)..png" />
          </Box>
          <Box sx={{ 
            width: { xs: '100%', sm: '350px' },
            maxWidth: '350px'
          }}>
            <Card title="Better Hires, Every Time" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Global Contractor Management.png" />
          </Box>
          <Box sx={{ 
            width: { xs: '100%', sm: '350px' },
            maxWidth: '350px'
          }}>
            <Card title="Remote Embedded & APIs" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Remote Embedded and APIs..png" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ManageSection;


