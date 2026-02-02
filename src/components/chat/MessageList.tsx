import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatTime } from './helpers';

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: any;
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: any;
  };
  isRead: boolean;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
  isCompany: boolean;
  onDeleteMessage: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isCompany,
  onDeleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 3,
        backgroundColor: 'rgba(250, 246, 255, 0.5)',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(131, 16, 255, 0.2)',
          borderRadius: '3px',
          '&:hover': {
            background: 'rgba(131, 16, 255, 0.3)',
          },
        },
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(131, 16, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatIcon sx={{ fontSize: 32, color: '#8310FF' }} />
          </Box>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
            No messages yet
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(84,98,116,0.7)' }}>
            Start the conversation by sending a message below
          </Typography>
        </Box>
      ) : (
        messages.map((message: Message) => {
          const isOwn = message.sender._id === currentUserId;

          return (
            <Box
              key={message._id}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                gap: 1,
                alignItems: 'flex-end',
                '&:hover .delete-icon': {
                  opacity: 1,
                },
              }}
            >
              {isCompany && isOwn && (
                <IconButton
                  className="delete-icon"
                  onClick={() => onDeleteMessage(message._id)}
                  size="small"
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    color: 'rgba(220, 38, 38, 0.7)',
                    padding: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(220, 38, 38, 0.08)',
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  px: 2,
                  py: 1.5,
                  backgroundColor: isOwn ? '#8310FF' : 'white',
                  color: isOwn ? 'white' : '#000',
                  borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: isOwn
                    ? '0 2px 8px rgba(131, 16, 255, 0.25)'
                    : '0 1px 4px rgba(0, 0, 0, 0.06)',
                  border: isOwn ? 'none' : '1px solid rgba(84,98,116,0.1)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '13px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    opacity: isOwn ? 0.8 : 0.5,
                    fontSize: '10px',
                  }}
                >
                  {formatTime(message.createdAt)}
                </Typography>
              </Box>
            </Box>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
