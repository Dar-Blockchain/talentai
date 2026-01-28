import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/layout/Header';

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: {
      _id?: string;
      firstName?: string;
      lastName?: string;
      type?: 'Candidate' | 'Company';
      companyDetails?: {
        name?: string;
      };
    };
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: {
      _id?: string;
      firstName?: string;
      lastName?: string;
      type?: 'Candidate' | 'Company';
      companyDetails?: {
        name?: string;
      };
    };
  };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
  conversation?: string;
}

interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    type?: 'Candidate' | 'Company';
    companyDetails?: {
      name?: string;
    };
  };
}

// Helper function to get display name from a participant
const getParticipantDisplayName = (participant: Participant | undefined): string => {
  if (!participant) return 'Unknown';

  // Check if profile exists with company details
  if (participant.profile?.type === 'Company' && participant.profile?.companyDetails?.name) {
    return participant.profile.companyDetails.name;
  }

  // Check profile firstName/lastName
  if (participant.profile?.firstName || participant.profile?.lastName) {
    return `${participant.profile.firstName || ''} ${participant.profile.lastName || ''}`.trim();
  }

  // Fallback to direct firstName/lastName on participant
  if (participant.firstName || participant.lastName) {
    return `${participant.firstName || ''} ${participant.lastName || ''}`.trim();
  }

  return 'Unknown';
};

// Helper to get first initial for avatar
const getParticipantInitial = (participant: Participant | undefined): string => {
  const name = getParticipantDisplayName(participant);
  return name.charAt(0).toUpperCase() || '?';
};

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

const ConversationPage = () => {
  const router = useRouter();
  const { conversationId } = router.query;
  const { showToast } = useToast();
  // Get the user object (contains the actual user ID for WebSocket and participant matching)
  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const profile = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  // Use user ID (not profile ID) for all socket and conversation operations
  const currentUserId = connectedUser?._id;
  // Check if current user is a Company
  const isCompany = profile?.type === 'Company';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO connection
  useEffect(() => {
    if (!currentUserId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Socket.IO chat namespace
    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/chat`, {
      auth: {
        userId: currentUserId,
        token
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);

      // Join the current conversation room
      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
    });

    socket.on('new_message', (message: Message) => {
      console.log('Received new message via WebSocket:', message);

      // Add message for all users (sender and receiver)
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Update conversations list with the new last message
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv._id === message.conversationId ||
            (message as any).conversation === conv._id) {
            return {
              ...conv,
              lastMessage: {
                text: message.text,
                timestamp: message.createdAt,
              },
              updatedAt: message.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => {
          // Sort by most recent message
          const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
          const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
          return bTime - aTime;
        });
      });
    });

    socket.on('message_read', ({ messageId, conversationId: convId }) => {
      if (convId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    socket.on('message_deleted', ({ messageId, conversationId: convId }) => {
      console.log('Received message_deleted event:', { messageId, convId });
      if (convId === conversationId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        showToast({ message: 'A message was deleted', severity: 'info' });
      }
    });

    socket.on('conversation_deleted', ({ conversationId: convId }) => {
      console.log('Received conversation_deleted event:', convId);
      // Remove conversation from list
      setConversations((prev) => prev.filter((conv) => conv._id !== convId));

      // If currently viewing the deleted conversation, redirect to chat home
      if (convId === conversationId) {
        showToast({ message: 'This conversation was deleted', severity: 'info' });
        router.push('/chat');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.disconnect();
    };
  }, [currentUserId, conversationId]);

  // Fetch all conversations for sidebar
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
      }
    };

    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  // Fetch current conversation and messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Get conversation details
        const convResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/conversations/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversation(convResponse.data.data);

        // Get messages
        const messagesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/messages/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesResponse.data.data);

        // Mark as read
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/conversations/${conversationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId, currentUserId]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called', {
      hasMessage: !!newMessage.trim(),
      hasConversation: !!conversation,
      hasCurrentUser: !!currentUserId,
    });

    if (!newMessage.trim() || !conversation || !currentUserId) {
      console.log('Validation failed - returning early');
      return;
    }

    // Validate message content - block emails and phone numbers
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

    if (emailPattern.test(newMessage)) {
      showToast({ message: 'For your security, sharing email addresses is not allowed. Please keep all communications within the platform.', severity: 'error' });
      return;
    }

    if (phonePattern.test(newMessage)) {
      showToast({ message: 'For your security, sharing phone numbers is not allowed. Please keep all communications within the platform.', severity: 'error' });
      return;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id !== currentUserId
    );

    if (!otherParticipant) {
      showToast({ message: 'Could not find recipient. Please refresh the page.', severity: 'error' });
      return;
    }

    console.log('Preparing to send message to:', otherParticipant);
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Sending message...', {
        conversationId,
        receiverId: otherParticipant._id,
        text: newMessage,
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/messages`,
        {
          conversationId,
          receiverId: otherParticipant._id,
          text: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Message sent successfully:', response.data);

      // Message will be added via WebSocket 'new_message' event
      // No need to add it here manually
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });
      showToast({ message: `Failed to send message: ${error.response?.data?.message || error.message || 'Unknown error'}`, severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Message will be removed via WebSocket 'message_deleted' event
      showToast({ message: 'Message deleted successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      showToast({ message: `Failed to delete message: ${error.response?.data?.message || error.message || 'Unknown error'}`, severity: 'error' });
    }
  };

  const handleDeleteConversation = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Conversation will be removed via WebSocket 'conversation_deleted' event
      showToast({ message: 'Conversation deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      router.push('/chat');
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      showToast({ message: `Failed to delete conversation: ${error.response?.data?.message || error.message || 'Unknown error'}`, severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p._id !== currentUserId);
  };

  const getDashboardRoute = () => {
    const role = profile?.type?.toLowerCase();
    return role === 'company' ? '/dashboard/company' : '/dashboard/candidate';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatListTime = (timestamp: string) => {
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
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'rgba(251, 254, 255, 1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#8310FF' }} />
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'rgba(251, 254, 255, 1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(131, 16, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <ChatIcon sx={{ fontSize: 40, color: '#8310FF' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
          Conversation not found
        </Typography>
        <Button
          onClick={() => router.push('/chat')}
          sx={{
            color: '#8310FF',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
            },
          }}
        >
          Back to Messages
        </Button>
      </Box>
    );
  }

  const otherUser = getOtherParticipant(conversation);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'rgba(251, 254, 255, 1)',
      }}
    >
      <Header />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <IconButton
            onClick={() => router.push(getDashboardRoute())}
            sx={{
              color: '#8310FF',
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(131, 16, 255, 0.15)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#000',
                fontSize: '20px',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  width: '38px',
                  height: '5px',
                  background: '#8310FF',
                  borderRadius: '2px',
                },
              }}
            >
              Messages
            </Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            height: 'calc(100vh - 180px)',
          }}
        >
          {/* Left Sidebar - Conversations List */}
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
                    const isActive = conv._id === conversationId;

                    return (
                      <React.Fragment key={conv._id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => router.push(`/chat/${conv._id}`)}
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
                                  }
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

          {/* Right Side - Current Conversation */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '12px',
              border: '1px solid rgba(84,98,116,0.1)',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            {/* Conversation Header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid rgba(84,98,116,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#8310FF',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {getParticipantInitial(otherUser)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#000',
                    fontSize: '15px',
                    lineHeight: 1.3,
                  }}
                >
                  {getParticipantDisplayName(otherUser)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(84,98,116,0.8)',
                    fontSize: '12px',
                    filter: 'blur(4px)',
                    userSelect: 'none',
                  }}
                >
                  {otherUser?.email}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 1)',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(16, 185, 129, 1)', fontWeight: 500, fontSize: '11px' }}>
                    Active
                  </Typography>
                </Box>
                {isCompany && (
                  <IconButton
                    onClick={handleDeleteConversation}
                    size="small"
                    sx={{
                      color: 'rgba(220, 38, 38, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Messages Container */}
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
                messages.map((message) => {
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
                          onClick={() => handleDeleteMessage(message._id)}
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

            {/* Input Area */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid rgba(84,98,116,0.1)',
                backgroundColor: 'white',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-end',
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  disabled={sending}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(243, 245, 247, 1)',
                      fontSize: '13px',
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(131, 16, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8310FF',
                        borderWidth: '1px',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    backgroundColor: 'rgba(163, 98, 239, 1)',
                    borderRadius: '38px',
                    px: 3,
                    py: 1,
                    minWidth: '100px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(131, 16, 255, 1)',
                      boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(200, 200, 200, 1)',
                      color: 'white',
                    },
                  }}
                  endIcon={sending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                >
                  {sending ? 'Sending' : 'Send'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 380,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#000', fontSize: '16px' }}>
          Delete Conversation
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(84,98,116,0.8)', fontSize: '13px' }}>
            Are you sure you want to delete this entire conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{
              color: 'rgba(84,98,116,0.8)',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '38px',
              '&:hover': {
                backgroundColor: 'rgba(243, 245, 247, 1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteConversation}
            disabled={isDeleting}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(220, 38, 38, 1)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '38px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'rgba(185, 28, 28, 1)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(252, 165, 165, 1)',
              },
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationPage;
