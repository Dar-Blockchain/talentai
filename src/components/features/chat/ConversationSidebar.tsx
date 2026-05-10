import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Badge,
  Divider,
} from '@mui/material';
import ChatOutlined from '@mui/icons-material/ChatOutlined';
import { useTranslation } from 'react-i18next';
import { Participant, getParticipantDisplayName, getParticipantInitial, formatListTime } from './helpers';

const TEAL    = '#0D9488';
const TEAL_BG = '#F0FDFA';

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | undefined;
  currentUserId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  currentUserId,
  onSelectConversation,
}) => {
  const { t } = useTranslation('modules/chat/chat');
  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== currentUserId);

  return (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {conversations.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: TEAL_BG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 1.5,
            }}
          >
            <ChatOutlined sx={{ fontSize: 28, color: TEAL }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '13px', mb: 0.5 }}>
            {t('sidebar.no_conversations')}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
            {t('sidebar.start_chatting')}
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {conversations.map((conv, index) => {
            const otherUser = getOtherParticipant(conv);
            const isActive  = conv._id === currentConversationId;
            const hasUnread = conv.unreadCount > 0 && !isActive;

            return (
              <React.Fragment key={conv._id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onSelectConversation(conv._id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: isActive ? TEAL_BG : 'transparent',
                      borderLeft: isActive ? `3px solid ${TEAL}` : '3px solid transparent',
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: isActive ? TEAL_BG : '#F9FAFB',
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Badge
                        badgeContent={conv.unreadCount}
                        invisible={!hasUnread}
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: '#EF4444',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '10px',
                            minWidth: 18,
                            height: 18,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40, height: 40,
                            bgcolor: isActive ? TEAL : '#E5E7EB',
                            color: isActive ? '#fff' : '#374151',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {getParticipantInitial(otherUser)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: hasUnread ? 700 : 500,
                            color: isActive ? TEAL : '#111827',
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getParticipantDisplayName(otherUser)}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: hasUnread ? '#374151' : '#9CA3AF',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '12px',
                            fontWeight: hasUnread ? 500 : 400,
                          }}
                        >
                          {conv.lastMessage?.text || t('sidebar.no_messages')}
                        </Typography>
                      }
                    />
                    <Typography
                      sx={{
                        color: isActive ? TEAL : '#9CA3AF',
                        fontSize: '10px',
                        flexShrink: 0,
                        ml: 1,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {conv.lastMessage?.timestamp
                        ? formatListTime(conv.lastMessage.timestamp)
                        : formatListTime(conv.updatedAt)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
                {index < conversations.length - 1 && (
                  <Divider sx={{ mx: 2, borderColor: '#F3F4F6' }} />
                )}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default ConversationSidebar;
