"use client";

import React, { memo, useEffect } from "react";
import { Box, Skeleton } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchPostMetrics,
  selectPostMetrics,
  selectPostMetricsLoading,
} from "@/store/slices/postSlice";
import StatCard from "@/components/ui/StatCard";

const PostsStats: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const metrics  = useSelector(selectPostMetrics);
  const loading  = useSelector(selectPostMetricsLoading);

  useEffect(() => {
    dispatch(fetchPostMetrics());
  }, [dispatch]);

  const cards = [
    { icon: <WorkOutlined sx={{ fontSize: 18 }} />,        label: "Total Posts", value: metrics?.total   ?? 0, color: "#0D9488" },
    { icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,  label: "Active",      value: metrics?.active  ?? 0, color: "#10B981" },
    { icon: <EditNoteOutlined sx={{ fontSize: 18 }} />,    label: "Drafts",      value: metrics?.draft   ?? 0, color: "#D97706" },
    { icon: <AccessTimeOutlined sx={{ fontSize: 18 }} />,  label: "Closed",      value: metrics?.closed  ?? 0, color: "#DC2626" },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
      {cards.map((card) =>
        loading ? (
          <Skeleton key={card.label} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        ) : (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            color={card.color}
          />
        )
      )}
    </Box>
  );
};

export default memo(PostsStats);
