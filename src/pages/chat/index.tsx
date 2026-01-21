import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Typography,
  Badge,
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

const ChatPage = () => {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.profile);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(response.data.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchConversations();
    }
  }, [currentUser]);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== currentUser?._id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const getDashboardRoute = () => {
    const role = currentUser?.role?.toLowerCase();
    return role === 'company' ? '/dashboard/company' : '/dashboard/candidate';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => router.push(getDashboardRoute())}
          sx={{
            color: '#8310FF',
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 0.1)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Messages
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Your conversations with candidates and companies
          </Typography>
        </Box>
      </Box>

      {conversations.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: 3,
          }}
        >
          <ChatIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            No conversations yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Start chatting by contacting candidates or companies
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {conversations.map((conv, index) => {
              const otherUser = getOtherParticipant(conv);

              return (
                <React.Fragment key={conv._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => router.push(`/chat/${conv._id}`)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conv.unreadCount}
                          color="error"
                          invisible={conv.unreadCount === 0}
                        >
                          <Avatar
                            sx={{
                              width: 50,
                              height: 50,
                              backgroundColor: '#8310FF',
                              fontSize: '1.25rem',
                              fontWeight: 600,
                            }}
                          >
                            {otherUser?.firstName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: conv.unreadCount > 0 ? 600 : 500,
                              color: '#1e293b',
                            }}
                          >
                            {otherUser?.firstName} {otherUser?.lastName}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: conv.unreadCount > 0 ? 500 : 400,
                            }}
                          >
                            {conv.lastMessage?.text || 'No messages yet'}
                          </Typography>
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#94a3b8',
                          ml: 2,
                        }}
                      >
                        {conv.lastMessage?.timestamp
                          ? formatTime(conv.lastMessage.timestamp)
                          : formatTime(conv.updatedAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                  {index < conversations.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default ChatPage;
