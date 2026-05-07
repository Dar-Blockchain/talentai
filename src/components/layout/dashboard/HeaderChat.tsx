"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchConversations, selectConversations } from "@/store/slices/chatSlice";
import { useRouter } from "next/router";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

const fmtTime = (iso?: string): string => {
  if (!iso) return "";
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const HeaderChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const profile       = useSelector((state: RootState) => state.user.connectedUser.profile);
  const currentUser   = useSelector((state: RootState) => state.user.connectedUser.user);
  const conversations = useSelector(selectConversations);
  const isCompany     = profile?.type === "Company" || profile?.type === "Employee";
  const chatBase      = isCompany ? "/company/chat" : "/candidate/chat";

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    dispatch(fetchConversations({}));
  }, [dispatch]);

  const close = () => setAnchor(null);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: "#6B7280" }}
      >
        <Badge
          badgeContent={totalUnread > 9 ? "9+" : totalUnread || undefined}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#EF4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <ChatOutlined sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 340,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              overflow: "hidden",
              mt: 1,
              border: "1px solid #E5E7EB",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              Messages
            </Typography>
            {totalUnread > 0 && (
              <Box
                sx={{
                  bgcolor: TEAL,
                  color: "#fff",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {totalUnread > 9 ? "9+" : totalUnread}
              </Box>
            )}
          </Box>
        </Box>

        {/* Conversation list */}
        <Box
          sx={{
            maxHeight: 340,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#E5E7EB", borderRadius: 2 },
          }}
        >
          {conversations.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <ChatOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                No conversations yet
              </Typography>
            </Box>
          ) : (
            conversations.slice(0, 8).map((conv, i) => {
              const other   = conv.participants?.find((p: any) => p._id !== (currentUser?._id || currentUser?.id));
              const name    = other
                ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || other.email || "Unknown"
                : "Unknown";
              const initial = name[0]?.toUpperCase() || "?";
              const lastMsg = conv.lastMessage;
              const hasUnread = (conv.unreadCount || 0) > 0;

              return (
                <React.Fragment key={conv._id}>
                  <Box
                    onClick={() => { router.push(`${chatBase}/${conv._id}`); close(); }}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      bgcolor: hasUnread ? TEAL_BG : "transparent",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "#F9FAFB" },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={conv.unreadCount > 0 ? conv.unreadCount : 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: TEAL,
                          color: "#fff",
                          fontSize: "9px",
                          minWidth: 16,
                          height: 16,
                        },
                      }}
                    >
                      <Avatar sx={{ width: 38, height: 38, bgcolor: TEAL, fontSize: 14, flexShrink: 0 }}>
                        {initial}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: hasUnread ? 700 : 600,
                            color: "#111827",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {name}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0, ml: 1 }}>
                          {fmtTime(lastMsg?.timestamp)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: hasUnread ? TEAL : "#6B7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: hasUnread ? 600 : 400,
                        }}
                      >
                        {lastMsg?.text || "No messages yet"}
                      </Typography>
                    </Box>
                  </Box>
                  {i < Math.min(conversations.length, 8) - 1 && <Divider />}
                </React.Fragment>
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid #E5E7EB", p: 1.5 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => { router.push(chatBase); close(); }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: TEAL,
              borderRadius: 2,
              "&:hover": { bgcolor: TEAL_BG },
            }}
          >
            Open Messages
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default HeaderChat;
