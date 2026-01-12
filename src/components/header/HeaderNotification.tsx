"use client";
import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { useRouter } from "next/router";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
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
          borderRadius: "24px",
          width: 65,
          height: 40,
          boxShadow: '0px 0px 18.1px 0px rgba(0, 0, 0, 0.05)',
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          },
        }}
      >
<Badge
badgeContent={unreadCount}
max={9}
  color="error"
  overlap="circular"
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
  sx={{
    "& .MuiBadge-badge": {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#f5576c",
      fontSize: '9px',
      width: 16,
      height: 16
    },
  }}
>
  <NotificationsOutlinedIcon
    sx={{
      color: "rgba(98, 111, 134, 1)",
      width: 24,
      height: 24,
    }}
  />
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
