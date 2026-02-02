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
import ChatIcon from '@mui/icons-material/Chat';
import { Participant, getParticipantDisplayName, getParticipantInitial, formatListTime } from './helpers';

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
  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p._id !== currentUserId);
  };

  return (
    <Box
      sx={{
        width: '320px',
        flexShrink: 0,
        borderRadius: '12px',
        border: '1px solid rgba(84,98,116,0.1)',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid rgba(84,98,116,0.1)',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: '#000',
            fontSize: '14px',
          }}
        >
          All Conversations ({conversations.length})
        </Typography>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {conversations.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
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
                mx: 'auto',
                mb: 2,
              }}
            >
              <ChatIcon sx={{ fontSize: 32, color: '#8310FF' }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#000', mb: 0.5 }}>
              No conversations yet
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(84,98,116,0.8)' }}>
              Start chatting with candidates
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {conversations.map((conv, index) => {
              const otherUser = getOtherParticipant(conv);
              const isActive = conv._id === currentConversationId;

              return (
                <React.Fragment key={conv._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onSelectConversation(conv._id)}
                      sx={{
                        py: 2,
                        px: 2.5,
                        backgroundColor: isActive ? 'rgba(131, 16, 255, 0.06)' : 'transparent',
                        borderLeft: isActive ? '3px solid #8310FF' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isActive ? 'rgba(131, 16, 255, 0.06)' : 'rgba(243, 245, 247, 1)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conv.unreadCount}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: 'rgba(224, 164, 16, 1)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '10px',
                              minWidth: '18px',
                              height: '18px',
                            },
                          }}
                          invisible={conv.unreadCount === 0 || isActive}
                        >
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              backgroundColor: isActive ? '#8310FF' : 'rgba(131, 16, 255, 0.15)',
                              color: isActive ? 'white' : '#8310FF',
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {getParticipantInitial(otherUser)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: conv.unreadCount > 0 ? 600 : 500,
                              color: isActive ? '#8310FF' : '#000',
                              fontSize: '13px',
                            }}
                          >
                            {getParticipantDisplayName(otherUser)}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(84,98,116,0.8)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                              fontSize: '11px',
                            }}
                          >
                            {conv.lastMessage?.text || 'No messages yet'}
                          </Typography>
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(84,98,116,0.6)',
                          fontSize: '10px',
                          flexShrink: 0,
                        }}
                      >
                        {conv.lastMessage?.timestamp
                          ? formatListTime(conv.lastMessage.timestamp)
                          : formatListTime(conv.updatedAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                  {index < conversations.length - 1 && (
                    <Divider sx={{ mx: 2.5, borderColor: 'rgba(84,98,116,0.08)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ConversationSidebar;
