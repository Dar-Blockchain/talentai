import React from "react";
import { Box } from "@mui/material";

const AccoladesSection: React.FC = () => {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      mt: 6,
      flexWrap: 'wrap'
    }}>
      {/* NVIDIA Badge Image */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="/images/partners/nivdia.png" 
          alt="NVIDIA Inception Program" 
          style={{ 
            height: '60px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Box>

      {/* F6S Badge Image */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <img 
          src="/images/partners/F6s.png" 
          alt="F6S Top Company AI" 
          style={{ 
            height: '60px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Box>
    </Box>
  );
};

export default AccoladesSection;
