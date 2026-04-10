"use client";
import React, { useState, useCallback, useMemo } from "react";
import { IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { useRouter } from "next/router";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { NotificationsOutlined } from "@mui/icons-material";

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
        : "/company/notifications"
    );
  }, [router]);

  return (
    <>
    
            <IconButton
                    onClick={handleNotificationClick}

              sx={{ color: "#6B7280" }}
            >
              <Badge
                badgeContent={unreadCount > 9 ? "9+" : unreadCount || undefined}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontSize: "10px", fontWeight: 700, minWidth: 18, height: 18 } }}
              >
                <NotificationsOutlined sx={{ fontSize: 20 }} />
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
