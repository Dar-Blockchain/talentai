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
    maxWidth: { xs: '100%', sm: '420px', md: '450px' },
    width: '100%'
  }}>
    <Box sx={{ 
      borderRadius: '12px 12px 0 0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: 'transparent',
      minHeight: { xs: '220px', sm: '250px', md: '280px' },
      height: { xs: '220px', sm: '250px', md: '280px' }
    }}>
      <img 
        src={img} 
        alt={title} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
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
    <Box sx={{ backgroundColor: '#EFF0F0', py: { xs: 6, md: 10 }, px: 3, mb: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto' }}>
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
          gap: 3, 
          mt: 4,
          alignItems: 'stretch',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            width: { xs: '100%', sm: '420px', md: '450px' },
            maxWidth: { xs: '100%', md: '450px' }
          }}>
            <Card title="Skills-Based Matching Revolution" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Global HR Management Software (HRIS)..png" />
          </Box>
          <Box sx={{ 
            width: { xs: '100%', sm: '420px', md: '450px' },
            maxWidth: { xs: '100%', md: '450px' }
          }}>
            <Card title="Better Hires, Every Time" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Global Contractor Management.png" />
          </Box>
          <Box sx={{ 
            width: { xs: '100%', sm: '420px', md: '450px' },
            maxWidth: { xs: '100%', md: '450px' }
          }}>
            <Card title="Remote Embedded & APIs" desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit." img="/images/home/Remote Embedded and APIs..png" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ManageSection;


