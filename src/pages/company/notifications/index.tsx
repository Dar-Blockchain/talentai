import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Box, Typography, IconButton, Button, Divider, Chip, Pagination } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from "@mui/icons-material";
import { useNotifications } from "@/contexts/NotificationContext";
import PageHeader from "@/components/layout/dashboard/PageHeader";

const PAGE_SIZE = 10;

const getIcon = (type: string) => {
  switch (type) {
    case "success": return <CheckCircleIcon sx={{ fontSize: 20 }} />;
    case "warning": return <WarningIcon sx={{ fontSize: 20 }} />;
    case "error": return <ErrorIcon sx={{ fontSize: 20 }} />;
    default: return <InfoIcon sx={{ fontSize: 20 }} />;
  }
};

const getColors = (type: string) => {
  switch (type) {
    case "success": return { bg: "#d1fae5", color: "#065f46" };
    case "warning": return { bg: "#fef3c7", color: "#92400e" };
    case "error": return { bg: "#fee2e2", color: "#991b1b" };
    default: return { bg: "#dbeafe", color: "#1e40af" };
  }
};

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, archive, archiveAll } = useNotifications();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const paged = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleArchive = (id: string) => {
    archive(id);
    // If archiving last item on current page, go back one page
    if (paged.length === 1 && page > 1) setPage(p => p - 1);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        actions={
          notifications.length > 0 ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={<MarkEmailReadIcon sx={{ fontSize: 15 }} />}
                onClick={markAllAsRead}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: 2 }}
              >
                Mark all read
              </Button>
              <Button
                size="small"
                startIcon={<ArchiveIcon sx={{ fontSize: 15 }} />}
                onClick={() => { archiveAll(); setPage(1); }}
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: 2, color: "#6B7280", borderColor: "#E5E7EB" }}
              >
                Archive all
              </Button>
            </Box>
          ) : undefined
        }
      />

      <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <InfoIcon sx={{ fontSize: 32, color: "#9CA3AF" }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: "#374151", mb: 0.5 }}>No notifications</Typography>
            <Typography variant="body2" sx={{ color: "#9CA3AF" }}>We'll notify you when something arrives</Typography>
          </Box>
        ) : (
          <>
            {paged.map((n: any, index: number) => {
              const colors = getColors(n.type);
              return (
                <React.Fragment key={n.id}>
                  <Box
                    onClick={() => markAsRead(n.id)}
                    sx={{
                      p: 2.5,
                      display: "flex",
                      gap: 2,
                      cursor: "pointer",
                      bgcolor: n.isRead ? "transparent" : "#F9FAFB",
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: "#F3F4F6" },
                    }}
                  >
                    <Box sx={{ width: 42, height: 42, minWidth: 42, borderRadius: "50%", bgcolor: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.color }}>
                      {getIcon(n.type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
                          {n.title}
                        </Typography>
                        {!n.isRead && (
                          <Chip label="New" size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.5, mb: 0.5 }}>
                        {n.message}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                        <Typography variant="caption" sx={{ color: "#9CA3AF" }}>{n.timestamp}</Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
                      title="Archive"
                      sx={{ alignSelf: "flex-start", "&:hover": { bgcolor: "#F3F4F6" } }}
                    >
                      <ArchiveIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                    </IconButton>
                  </Box>
                  {index < paged.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2, borderTop: "1px solid #E5E7EB" }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 500,
                      "&.Mui-selected": { bgcolor: "rgba(131,16,255,0.1)", color: "#8310FF", fontWeight: 700 },
                      "&:hover": { bgcolor: "#F3F4F6" },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default NotificationsPage;
