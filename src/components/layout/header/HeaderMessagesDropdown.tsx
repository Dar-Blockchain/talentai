"use client";
import React, { useState } from "react";
import {
  Box,
  Badge,
  Popover,
  Typography,
  Avatar,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchConversations,
  selectConversations,
  selectConversationsLoading,
} from "@/store/slices/chatSlice";

interface HeaderMessagesDropdownProps {
  userId: string | undefined;
  unreadMessageCount: number;
}

const HeaderMessagesDropdown: React.FC<HeaderMessagesDropdownProps> = ({
  userId,
  unreadMessageCount,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const loadingConversations = useSelector(selectConversationsLoading);
  const [messagesAnchorEl, setMessagesAnchorEl] = useState<HTMLElement | null>(null);

  const messagesOpen = Boolean(messagesAnchorEl);

  const handleMessagesClick = (event: React.MouseEvent<HTMLElement>) => {
    setMessagesAnchorEl(event.currentTarget);
    dispatch(fetchConversations({ limit: 5 }));
  };

  const handleMessagesClose = () => {
    setMessagesAnchorEl(null);
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation?.participants || !userId) return null;
    return conversation.participants.find((p: any) => p._id !== userId);
  };

  const getDisplayName = (participant: any) => {
    if (!participant) return "Unknown User";
    if (participant.firstName && participant.lastName) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    if (participant.username) return participant.username;
    if (participant.email) {
      const emailName = participant.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Unknown User";
  };

  const getInitial = (participant: any) => {
    if (!participant) return "U";
    if (participant.firstName) return participant.firstName.charAt(0).toUpperCase();
    if (participant.username) return participant.username.charAt(0).toUpperCase();
    if (participant.email) return participant.email.charAt(0).toUpperCase();
    return "U";
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Box
        onClick={handleMessagesClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "9px",
          cursor: "pointer",
          transition: "background 0.15s, box-shadow 0.15s",
          "&:hover": {
            bgcolor: "rgba(13,148,136,0.10)",
            boxShadow: "0 0 0 3px rgba(13,148,136,0.08)",
          },
        }}
      >
        <Badge
          badgeContent={unreadMessageCount || undefined}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#EF4444",
              color: "#fff",
              fontWeight: 700,
              fontSize: "9px",
              minWidth: 15,
              height: 15,
              padding: 0,
              boxShadow: "0 0 0 1.5px #fff",
            },
          }}
        >
          <ChatBubbleOutlineRoundedIcon sx={{ color: "#374151", fontSize: 18 }} />
        </Badge>
      </Box>

      <Popover
        open={messagesOpen}
        anchorEl={messagesAnchorEl}
        onClose={handleMessagesClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 360,
            maxHeight: 480,
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            border: "1px solid rgba(238, 240, 242, 1)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(238, 240, 242, 1)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "16px",
              color: "#111827",
            }}
          >
            Messages
          </Typography>
          {unreadMessageCount > 0 && (
            <Box
              sx={{
                backgroundColor: "rgba(131, 16, 255, 0.1)",
                color: "#8310FF",
                px: 1,
                py: 0.25,
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {unreadMessageCount} new
            </Box>
          )}
        </Box>

        {/* Conversations List */}
        <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
          {loadingConversations ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} sx={{ color: "#8310FF" }} />
            </Box>
          ) : conversations.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
              }}
            >
              <ChatIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
              <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
                No conversations yet
              </Typography>
            </Box>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const lastMessage = conversation.lastMessage;
              const isUnread = conversation.unreadCount > 0;

              return (
                <Box
                  key={conversation._id}
                  onClick={() => {
                    handleMessagesClose();
                    router.push(`/chat/${conversation._id}`);
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    cursor: "pointer",
                    backgroundColor: isUnread
                      ? "rgba(131, 16, 255, 0.04)"
                      : "transparent",
                    borderLeft: isUnread
                      ? "3px solid #8310FF"
                      : "3px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                    "&:not(:last-child)": {
                      borderBottom: "1px solid rgba(238, 240, 242, 1)",
                    },
                  }}
                >
                  <Avatar
                    src={otherUser?.profilePicture}
                    sx={{
                      width: 44,
                      height: 44,
                      backgroundColor: "#8310FF",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {getInitial(otherUser)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: isUnread ? 600 : 500,
                          fontSize: "14px",
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getDisplayName(otherUser)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: isUnread ? "#8310FF" : "#9ca3af",
                          fontWeight: isUnread ? 600 : 400,
                          flexShrink: 0,
                          ml: 1,
                        }}
                      >
                        {lastMessage?.timestamp
                          ? formatMessageTime(lastMessage.timestamp)
                          : conversation.updatedAt
                          ? formatMessageTime(conversation.updatedAt)
                          : ""}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: isUnread ? "#374151" : "#6b7280",
                        fontWeight: isUnread ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lastMessage?.text || "No messages yet"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            onClick={() => {
              handleMessagesClose();
              router.push("/candidate/chat");
            }}
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              color: "#8310FF",
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(131, 16, 255, 0.08)",
              },
            }}
          >
            View All Messages
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default HeaderMessagesDropdown;
