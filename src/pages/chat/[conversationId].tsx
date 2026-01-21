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
  Paper,
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
import { toast } from 'react-toastify';

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    _id: string;
  };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
  conversation?: string;
}

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

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
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.profile);

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
    if (!currentUser?._id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Socket.IO chat namespace
    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/chat`, {
      auth: {
        userId: currentUser._id,
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
        toast.info('A message was deleted');
      }
    });

    socket.on('conversation_deleted', ({ conversationId: convId }) => {
      console.log('Received conversation_deleted event:', convId);
      // Remove conversation from list
      setConversations((prev) => prev.filter((conv) => conv._id !== convId));

      // If currently viewing the deleted conversation, redirect to chat home
      if (convId === conversationId) {
        toast.info('This conversation was deleted');
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
  }, [currentUser, conversationId]);

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

    if (currentUser?._id) {
      fetchConversations();
    }
  }, [currentUser]);

  // Fetch current conversation and messages
  useEffect(() => {
    if (!conversationId || !currentUser?._id) return;

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
  }, [conversationId, currentUser]);

  const handleSendMessage = async () => {
    console.log('handleSendMessage called', {
      hasMessage: !!newMessage.trim(),
      hasConversation: !!conversation,
      hasCurrentUser: !!currentUser?._id,
    });

    if (!newMessage.trim() || !conversation || !currentUser?._id) {
      console.log('Validation failed - returning early');
      return;
    }

    // Validate message content - block emails and phone numbers
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

    if (emailPattern.test(newMessage)) {
      toast.error('🔒 For your security, sharing email addresses is not allowed. Please keep all communications within the platform to protect both parties.', {
        autoClose: 5000,
      });
      return;
    }

    if (phonePattern.test(newMessage)) {
      toast.error('🔒 For your security, sharing phone numbers is not allowed. Please keep all communications within the platform to protect both parties.', {
        autoClose: 5000,
      });
      return;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id !== currentUser._id
    );

    if (!otherParticipant) {
      toast.error('Could not find recipient. Please refresh the page.');
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
      toast.error(`Failed to send message: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
      toast.success('Message deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      toast.error(`Failed to delete message: ${error.response?.data?.message || error.message || 'Unknown error'}`);
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
      toast.success('Conversation deleted successfully');
      setDeleteDialogOpen(false);
      router.push('/chat');
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      toast.error(`Failed to delete conversation: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p._id !== currentUser?._id);
  };

  const getDashboardRoute = () => {
    const role = currentUser?.role?.toLowerCase();
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
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const otherUser = getOtherParticipant(conversation!);

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        height: 'calc(100vh - 80px)',
        display: 'flex',
        gap: 3,
      }}
    >
      {/* Left Sidebar - Conversations List */}
      <Paper
        elevation={2}
        sx={{
          width: '380px',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 3.5,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #8310FF 0%, #9333EA 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            Messages
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Conversations List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {conversations.length === 0 ? (
            <Box
              sx={{
                p: 8,
                textAlign: 'center',
              }}
            >
              <ChatIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                No conversations yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
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
                          py: 2.5,
                          px: 3,
                          backgroundColor: isActive ? 'rgba(131, 16, 255, 0.08)' : 'transparent',
                          borderLeft: isActive ? '4px solid #8310FF' : '4px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: isActive ? 'rgba(131, 16, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                            transform: 'translateX(2px)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={conv.unreadCount}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#E0A410',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                minWidth: '20px',
                                height: '20px',
                              }
                            }}
                            invisible={conv.unreadCount === 0 || isActive}
                          >
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                                background: isActive
                                  ? 'linear-gradient(135deg, #8310FF 0%, #9333EA 100%)'
                                  : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                fontSize: '1.4rem',
                                fontWeight: 700,
                                boxShadow: isActive ? '0 4px 12px rgba(131, 16, 255, 0.3)' : 'none',
                                transition: 'all 0.3s ease',
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
                                fontWeight: conv.unreadCount > 0 ? 700 : 600,
                                color: isActive ? '#8310FF' : '#1e293b',
                                fontSize: '1rem',
                                letterSpacing: '-0.2px',
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
                            ? formatListTime(conv.lastMessage.timestamp)
                            : formatListTime(conv.updatedAt)}
                        </Typography>
                      </ListItemButton>
                    </ListItem>
                    {index < conversations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </Paper>

      {/* Right Side - Current Conversation */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            background: 'white',
          }}
        >
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
          <Avatar
            sx={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #8310FF 0%, #9333EA 100%)',
              fontSize: '1.3rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(131, 16, 255, 0.25)',
            }}
          >
            {otherUser?.firstName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1e293b', letterSpacing: '-0.3px', mb: 0.3 }}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              {otherUser?.email}
            </Typography>
          </Box>
          <IconButton
            onClick={handleDeleteConversation}
            sx={{
              color: '#dc2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
        </Paper>

        {/* Messages Container */}
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 4,
            mb: 3,
            background: 'linear-gradient(to bottom, #faf9fb 0%, #f5f3f7 100%)',
            borderRadius: 4,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.3)',
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
                gap: 2,
              }}
            >
              <ChatIcon sx={{ fontSize: 64, color: 'rgba(131, 16, 255, 0.2)' }} />
              <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                No messages yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Start the conversation by sending a message below
              </Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender._id === currentUser?._id;

              return (
                <Box
                  key={message._id}
                  sx={{
                    mb: 3,
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease-in',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(10px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    gap: 1,
                    alignItems: 'flex-end',
                    position: 'relative',
                    '&:hover .delete-icon': {
                      opacity: 1,
                    },
                  }}
                >
                  {isOwn && (
                    <IconButton
                      className="delete-icon"
                      onClick={() => handleDeleteMessage(message._id)}
                      size="small"
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        color: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(220, 38, 38, 0.2)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Paper
                    elevation={isOwn ? 3 : 1}
                    sx={{
                      p: 2.5,
                      maxWidth: '65%',
                      background: isOwn
                        ? 'linear-gradient(135deg, #8310FF 0%, #9333EA 100%)'
                        : 'white',
                      color: isOwn ? 'white' : '#1e293b',
                      borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: isOwn
                        ? '0 4px 16px rgba(131, 16, 255, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isOwn
                          ? '0 6px 20px rgba(131, 16, 255, 0.4)'
                          : '0 4px 12px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        wordBreak: 'break-word',
                      }}
                    >
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: isOwn ? 0.85 : 0.6,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </Typography>
                  </Paper>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Paper>

        {/* Input */}
        <Paper
          elevation={3}
          sx={{
            p: 2.5,
            borderRadius: 4,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            gap: 2,
            backgroundColor: 'white',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#f8fafc',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  '& fieldset': {
                    borderColor: 'rgba(131, 16, 255, 0.3)',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#8310FF',
                    borderWidth: '2px',
                  },
                },
              },
            }}
          />
          <Button
            variant="contained"
            endIcon={sending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{
              background: 'linear-gradient(135deg, #8310FF 0%, #9333EA 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              minWidth: '120px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #6b0fd9 0%, #7c3aed 100%)',
                boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                color: '#9ca3af',
                boxShadow: 'none',
              },
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Delete Conversation
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#64748b' }}>
            Are you sure you want to delete this entire conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#f8fafc',
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
              backgroundColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
              '&:disabled': {
                backgroundColor: '#fca5a5',
              },
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConversationPage;
