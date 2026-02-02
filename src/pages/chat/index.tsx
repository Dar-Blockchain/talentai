import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
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
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import {
  fetchConversations,
  selectConversations,
  selectConversationsLoading,
} from '@/store/slices/chatSlice';

const ChatPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const profile = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  const currentUserId = connectedUser?._id;

  // Redux selectors
  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectConversationsLoading);

  // Theme color based on user type
  const isCompany = profile?.type?.toLowerCase() === 'company';
  const themeColor = isCompany ? 'rgba(41, 210, 145, 1)' : 'rgba(131, 16, 255, 1)';
  const themeColorLight = isCompany ? 'rgba(41, 210, 145, 0.1)' : 'rgba(131, 16, 255, 0.1)';

  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConversations(undefined));
    }
  }, [currentUserId, dispatch]);

  const getOtherParticipant = (conv: any) => {
    return conv.participants.find((p: any) => p._id !== currentUserId);
  };

  const getDisplayName = (participant: any) => {
    if (participant?.firstName || participant?.lastName) {
      return `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim();
    }
    if (participant?.email) {
      const name = participant.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  const getInitial = (participant: any) => {
    if (participant?.firstName) {
      return participant.firstName.charAt(0).toUpperCase();
    }
    if (participant?.email) {
      return participant.email.charAt(0).toUpperCase();
    }
    return 'U';
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

  // Calculate stats
  const totalConversations = conversations.length;
  const unreadConversations = conversations.filter((c: any) => c.unreadCount > 0).length;

  return (
    <PageContainer>
      <Header />

      {/* Main Content Card */}
      <Box
        sx={{
          px: 5,
          py: 3,
          mt: 3,
          color: "#000",
          borderRadius: "12px",
          border: "1px solid rgba(84,98,116,0.1)",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#000000",
            fontSize: "20px",
            mb: 3,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-4px",
              left: 0,
              width: "38px",
              height: "5px",
              background: themeColor,
              borderRadius: "2px",
            },
          }}
        >
          Messages
        </Typography>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: "12px",
              border: `1px solid ${isCompany ? 'rgba(41, 210, 145, 0.18)' : 'rgba(11, 82, 198, 0.18)'}`,
              backgroundColor: isCompany ? 'rgba(41, 210, 145, 0.06)' : 'rgba(11, 82, 198, 0.06)',
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(84, 98, 116, 1)",
                mb: 0.5,
              }}
            >
              Total Conversations
            </Typography>
            <Typography
              sx={{
                fontSize: "28px",
                fontWeight: 700,
                color: isCompany ? 'rgba(41, 210, 145, 1)' : 'rgba(11, 82, 198, 1)',
              }}
            >
              {totalConversations}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: "12px",
              border: "1px solid rgba(250, 180, 70, 0.18)",
              backgroundColor: "rgba(255, 249, 241, 0.79)",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(84, 98, 116, 1)",
                mb: 0.5,
              }}
            >
              Unread Messages
            </Typography>
            <Typography
              sx={{
                fontSize: "28px",
                fontWeight: 700,
                color: "rgba(250, 180, 70, 1)",
              }}
            >
              {unreadConversations}
            </Typography>
          </Box>
        </Box>

        {/* Conversations List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: themeColor }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              px: 4,
              backgroundColor: themeColorLight,
              borderRadius: "12px",
              border: "1px solid rgba(98, 111, 134, 0.18)",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isCompany ? "rgba(41, 210, 145, 0.2)" : "rgba(131, 16, 255, 0.2)",
                width: 100,
                height: 100,
                borderRadius: "50%",
              }}
            >
              <ChatIcon sx={{ fontSize: 48, color: themeColor }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: themeColor,
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "28px",
                mb: 2,
              }}
            >
No conversations yet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(147, 147, 147, 1)",
                maxWidth: "500px",
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "25px",
              }}
            >
  Start chatting by contacting candidates or companies
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: "12px",
              border: "1px solid rgba(211, 224, 245, 1)",
              overflow: "hidden",
            }}
          >
            <List sx={{ p: 0 }}>
              {conversations.map((conv: any, index: number) => {
                const otherUser = getOtherParticipant(conv);
                const displayName = getDisplayName(otherUser);
                const initial = getInitial(otherUser);
                const hasUnread = conv.unreadCount > 0;

                return (
                  <React.Fragment key={conv._id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => router.push(`/chat/${conv._id}`)}
                        sx={{
                          py: 2,
                          px: 3,
                          transition: 'all 0.2s ease',
                          backgroundColor: hasUnread ? themeColorLight : 'transparent',
                          '&:hover': {
                            backgroundColor: hasUnread
                              ? (isCompany ? 'rgba(41, 210, 145, 0.15)' : 'rgba(131, 16, 255, 0.15)')
                              : 'rgba(248, 250, 252, 1)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={conv.unreadCount}
                            color="error"
                            invisible={conv.unreadCount === 0}
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: 'rgba(239, 68, 68, 1)',
                                fontWeight: 600,
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                                backgroundColor: themeColor,
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              {initial}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: hasUnread ? 700 : 500,
                                color: '#1e293b',
                                fontSize: '15px',
                              }}
                            >
                              {displayName}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: hasUnread ? '#475569' : '#94a3b8',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: hasUnread ? 500 : 400,
                                fontSize: '13px',
                                mt: 0.5,
                              }}
                            >
                              {conv.lastMessage?.text || 'No messages yet'}
                            </Typography>
                          }
                          sx={{ ml: 1 }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: hasUnread ? themeColor : '#94a3b8',
                              fontWeight: hasUnread ? 600 : 400,
                              fontSize: '12px',
                            }}
                          >
                            {conv.lastMessage?.timestamp
                              ? formatTime(conv.lastMessage.timestamp)
                              : formatTime(conv.updatedAt)}
                          </Typography>
                          {hasUnread && (
                            <Box
                              sx={{
                                mt: 0.5,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: themeColor,
                              }}
                            />
                          )}
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < conversations.length - 1 && (
                      <Divider component="li" sx={{ borderColor: 'rgba(211, 224, 245, 0.5)' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export default ChatPage;
