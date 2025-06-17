import React from 'react';
import { Fab, Tooltip, Badge } from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ResumeChatBotFabProps {
  onClick: () => void;
  isVisible: boolean;
}

const ResumeChatBotFab: React.FC<ResumeChatBotFabProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={{
        position: 'fixed',
        bottom: 100,
        right: 20,
        zIndex: 999,
      }}
    >
      <Tooltip title="Resume Builder AI Assistant" placement="left">
        <Fab
          color="secondary"
          onClick={onClick}
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          }}
        >
          <Badge
            color="error"
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                    opacity: 0.8,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              },
            }}
          >
            <AutoFixHigh />
          </Badge>
        </Fab>
      </Tooltip>
    </motion.div>
  );
};

export default ResumeChatBotFab; 