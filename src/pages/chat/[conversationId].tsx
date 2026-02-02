import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import { Container, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/layout/Header';
import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
  deleteMessage as deleteMessageThunk,
  deleteConversation as deleteConversationThunk,
  addMessage,
  markMessageRead,
  removeMessage,
  removeConversation,
  selectConversations,
  selectCurrentConversation,
  selectCurrentConversationLoading,
  selectMessages,
  selectMessagesLoading,
  selectSendingMessage,
  clearCurrentConversation,
} from '@/store/slices/chatSlice';
import {
  ConversationSidebar,
  ConversationHeader,
  MessageList,
  MessageInput,
  DeleteConversationDialog,
} from '@/components/chat';

const ConversationPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { conversationId } = router.query;
  const { showToast } = useToast();

  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const profile = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  const currentUserId = connectedUser?._id;
  const isCompany = profile?.type === 'Company';

  // Redux selectors
  const conversations = useSelector(selectConversations);
  const conversation = useSelector(selectCurrentConversation);
  const conversationLoading = useSelector(selectCurrentConversationLoading);
  const messages = useSelector(selectMessages);
  const messagesLoading = useSelector(selectMessagesLoading);
  const sending = useSelector(selectSendingMessage);

  const loading = conversationLoading || messagesLoading;

  // Local UI state
  const [newMessage, setNewMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO connection
  useEffect(() => {
    if (!currentUserId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/chat`, {
      auth: {
        userId: currentUserId,
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
    });

    socket.on('new_message', (message: any) => {
      dispatch(addMessage(message));
    });

    socket.on('message_read', ({ messageId, conversationId: convId }: any) => {
      if (convId === conversationId) {
        dispatch(markMessageRead({ messageId, conversationId: convId }));
      }
    });

    socket.on('message_deleted', ({ messageId, conversationId: convId }: any) => {
      if (convId === conversationId) {
        dispatch(removeMessage({ messageId, conversationId: convId }));
        showToast({ message: 'A message was deleted', severity: 'info' });
      }
    });

    socket.on('conversation_deleted', ({ conversationId: convId }: any) => {
      dispatch(removeConversation(convId));
      if (convId === conversationId) {
        showToast({ message: 'This conversation was deleted', severity: 'info' });
        router.push('/chat');
      }
    });

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.disconnect();
    };
  }, [currentUserId, conversationId, dispatch]);

  // Fetch all conversations for sidebar
  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConversations(undefined));
    }
  }, [currentUserId, dispatch]);

  // Fetch current conversation and messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    const convId = conversationId as string;

    dispatch(fetchConversation(convId));
    dispatch(fetchMessages(convId));
    dispatch(markConversationRead(convId));

    return () => {
      dispatch(clearCurrentConversation());
    };
  }, [conversationId, currentUserId, dispatch]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId) return;

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
      (p: any) => p._id !== currentUserId
    );

    if (!otherParticipant) {
      showToast({ message: 'Could not find recipient. Please refresh the page.', severity: 'error' });
      return;
    }

    try {
      await dispatch(
        sendMessage({
          conversationId: conversationId as string,
          receiverId: otherParticipant._id,
          text: newMessage,
        })
      ).unwrap();
      setNewMessage('');
    } catch (error: any) {
      showToast({ message: `Failed to send message: ${error || 'Unknown error'}`, severity: 'error' });
    }
  }, [newMessage, conversation, currentUserId, conversationId, dispatch, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await dispatch(deleteMessageThunk(messageId)).unwrap();
      showToast({ message: 'Message deleted successfully', severity: 'success' });
    } catch (error: any) {
      showToast({ message: `Failed to delete message: ${error || 'Unknown error'}`, severity: 'error' });
    }
  }, [dispatch, showToast]);

  const confirmDeleteConversation = useCallback(async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteConversationThunk(conversationId as string)).unwrap();
      showToast({ message: 'Conversation deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      router.push('/chat');
    } catch (error: any) {
      showToast({ message: `Failed to delete conversation: ${error || 'Unknown error'}`, severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [conversationId, dispatch, showToast, router]);

  const getDashboardRoute = () => {
    const role = profile?.type?.toLowerCase();
    return role === 'company' ? '/dashboard/company' : '/dashboard/candidate';
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

  const otherUser = conversation.participants.find((p: any) => p._id !== currentUserId);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(251, 254, 255, 1)' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => router.push(getDashboardRoute())}
            sx={{
              color: '#8310FF',
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
              '&:hover': { backgroundColor: 'rgba(131, 16, 255, 0.15)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
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

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 180px)' }}>
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={conversationId as string}
            currentUserId={currentUserId}
            onSelectConversation={(id) => router.push(`/chat/${id}`)}
          />

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
            <ConversationHeader
              otherUser={otherUser}
              isCompany={isCompany}
              onDeleteConversation={() => setDeleteDialogOpen(true)}
            />

            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              isCompany={isCompany}
              onDeleteMessage={handleDeleteMessage}
            />

            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
              sending={sending}
            />
          </Box>
        </Box>
      </Container>

      <DeleteConversationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteConversation}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default ConversationPage;
