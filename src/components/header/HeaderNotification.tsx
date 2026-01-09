"use client";
import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { useRouter } from "next/router";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

const HeaderNotification = () => {
  const router = useRouter();
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archive,
    archiveAll,
  } = useNotifications();

  const handleNotificationClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setNotificationAnchor(event.currentTarget);
    },
    []
  );

  const handleNotificationClose = useCallback(() => {
    setNotificationAnchor(null);
  }, []);

  const handleViewAllNotifications = useCallback(() => {
    setNotificationAnchor(null);
    router.push("/settings/profile/?tab=notifications");
  }, [router]);

  return (
    <>
      <IconButton
        onClick={handleNotificationClick}
        sx={{
          backgroundColor: "white",
          borderRadius: "50%",
          width: 40,
          height: 40,
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          "&:hover": {
            backgroundColor: "#f9fafb",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#f5576c",
              color: "white",
              fontWeight: 700,
              fontSize: "0.75rem",
            },
          }}
        >
          <NotificationsIcon sx={{ color: "#6b7280", fontSize: 20 }} />
        </Badge>
      </IconButton>
      <NotificationDropdown
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={handleViewAllNotifications}
        onArchive={archive}
        onArchiveAll={archiveAll}
      />
    </>
  );
};

export default HeaderNotification;
