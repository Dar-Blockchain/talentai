"use client";

import React, { memo } from "react";
import { Box } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import { useSelector } from "react-redux";
import { selectMyPosts } from "@/store/slices/postSlice";
import StatCard from "@/components/ui/StatCard";

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

const PostsStats: React.FC = () => {
  const posts = useSelector(selectMyPosts);

  const total   = posts.length;
  const active  = posts.filter(
    (p: any) =>
      p.status !== "draft" &&
      (getDaysLeft(p.expirationDate) === null || getDaysLeft(p.expirationDate)! > 0)
  ).length;
  const drafts  = posts.filter((p: any) => p.status === "draft").length;
  const expired = posts.filter(
    (p: any) =>
      getDaysLeft(p.expirationDate) !== null && getDaysLeft(p.expirationDate)! <= 0
  ).length;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
        mb: 3,
      }}
    >
      <StatCard
        icon={<WorkOutlined sx={{ fontSize: 18 }} />}
        label="Total Posts"
        value={total}
        color="#0D9488"
      />

      <StatCard
        icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
        label="Active"
        value={active}
        color="#10B981"
      />

      <StatCard
        icon={<EditNoteOutlined sx={{ fontSize: 18 }} />}
        label="Drafts"
        value={drafts}
        color="#D97706"
      />

      <StatCard
        icon={<AccessTimeOutlined sx={{ fontSize: 18 }} />}
        label="Expired"
        value={expired}
        color="#DC2626"
      />
    </Box>
  );
};

export default memo(PostsStats);
