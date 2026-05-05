"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Box, Badge } from "@mui/material";
import { useRouter } from "next/router";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import { NotificationsNoneRounded } from "@mui/icons-material";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const HeaderNotification = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);

  const isCompany = useMemo(
    () => user?.role?.toLowerCase() === "company",
    [user?.role]
  );
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
    router.push(
      isCompany
        ? "/company/notifications"
        : "/profile/candidate/settings?tab=notifications"
    );
  }, [router, isCompany]);

  return (
    <>
      <Box
        onClick={handleNotificationClick}
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
          badgeContent={unreadCount > 9 ? "9+" : unreadCount || undefined}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#EF4444",
              color: "#fff",
              fontSize: "9px",
              fontWeight: 700,
              minWidth: 15,
              height: 15,
              padding: 0,
              boxShadow: "0 0 0 1.5px #fff",
            },
          }}
        >
          <NotificationsNoneRounded sx={{ fontSize: 19, color: "#374151" }} />
        </Badge>
      </Box>
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
