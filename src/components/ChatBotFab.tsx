import React, { useState } from 'react';
import { Fab, Badge, Tooltip, Box } from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from './ChatBot';

interface ChatBotFabProps {
  userId?: string;
  hasNewMessages?: boolean;
}

const ChatBotFab: React.FC<ChatBotFabProps> = ({ 
  userId, 
  hasNewMessages = false 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <ChatBot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            userId={userId}
          />
        )}
      </AnimatePresence>

      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
        }}
      >
        <Tooltip 
          title={isChatOpen ? "Close Chat" : "Open TalentAI Assistant"} 
          placement="left"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              scale: hasNewMessages ? [1, 1.1, 1] : 1,
            }}
            transition={{ 
              duration: hasNewMessages ? 0.5 : 0.2,
              repeat: hasNewMessages ? Infinity : 0,
              repeatDelay: 2
            }}
          >
            <Badge
              badgeContent={hasNewMessages ? "!" : 0}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  minWidth: 20,
                  height: 20,
                }
              }}
            >
              <Fab
                color="primary"
                onClick={toggleChat}
                sx={{
                  background: isChatOpen 
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: isChatOpen
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'scale(1.05)',
                  },
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isChatOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isChatOpen ? <Close /> : <Chat />}
                </motion.div>
              </Fab>
            </Badge>
          </motion.div>
        </Tooltip>
      </Box>
    </>
  );
};

export default ChatBotFab; 