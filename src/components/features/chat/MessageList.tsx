import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { useTranslation } from 'react-i18next';
import { formatTime } from './helpers';

const TEAL = '#0D9488';

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
  const { t } = useTranslation('modules/chat/chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2.5,
        bgcolor: '#F9FAFB',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: '#E5E7EB', borderRadius: '2px' },
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            height: '100%', gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: '#F0FDFA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChatOutlined sx={{ fontSize: 28, color: TEAL }} />
          </Box>
          <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '14px' }}>
            {t('messages.no_messages')}
          </Typography>
          <Typography sx={{ color: '#9CA3AF', fontSize: '12px', textAlign: 'center' }}>
            {t('messages.start_conversation')}
          </Typography>
        </Box>
      ) : (
        messages.map((message) => {
          const senderId = typeof message.sender === "string" ? message.sender : message.sender._id;
          const isOwn = String(senderId) === String(currentUserId);

          return (
            <Box
              key={message._id}
              sx={{
                mb: 1.5,
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                gap: 0.5,
                alignItems: 'flex-end',
                '&:hover .delete-btn': { opacity: 1 },
              }}
            >
              {isCompany && isOwn && (
                <IconButton
                  className="delete-btn"
                  onClick={() => onDeleteMessage(message._id)}
                  size="small"
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.15s',
                    color: 'rgba(220,38,38,0.7)',
                    p: '4px',
                    '&:hover': { bgcolor: 'rgba(220,38,38,0.08)' },
                  }}
                >
                  <DeleteOutlined sx={{ fontSize: 15 }} />
                </IconButton>
              )}
              <Box
                sx={{
                  maxWidth: '68%',
                  px: 2,
                  py: 1.2,
                  bgcolor: isOwn ? TEAL : '#fff',
                  color: isOwn ? '#fff' : '#111827',
                  borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: isOwn
                    ? '0 2px 8px rgba(13,148,136,0.25)'
                    : '0 1px 3px rgba(0,0,0,0.06)',
                  border: isOwn ? 'none' : '1px solid #E5E7EB',
                }}
              >
                <Typography sx={{ fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {message.text}
                </Typography>
                <Typography
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.4,
                    opacity: isOwn ? 0.75 : 0.5,
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
