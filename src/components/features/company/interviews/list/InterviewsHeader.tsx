import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";
import HowToRegOutlined from "@mui/icons-material/HowToRegOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import StatCard from "@/components/ui/StatCard";

export interface InterviewStats {
  total: number;
  excellent: number;
  avgScore: number;
  needsWork: number;
}

interface InterviewsHeaderProps {
  stats: InterviewStats;
  loading?: boolean;
}

const InterviewsHeader: React.FC<InterviewsHeaderProps> = ({ stats, loading = false }) => {
  const cards = [
    {
      icon: <HowToRegOutlined sx={{ fontSize: 18 }} />,
      label: "Total",
      value: stats.total,
      color: "#0D9488",
    },
    {
      icon: <EmojiEventsOutlined sx={{ fontSize: 18 }} />,
      label: "Excellent",
      value: stats.excellent,
      color: "#10B981",
    },
    {
      icon: <TrendingUpOutlined sx={{ fontSize: 18 }} />,
      label: "Avg. Score",
      value: `${stats.avgScore}%`,
      color: "#6366F1",
    },
    {
      icon: <WarningAmberOutlined sx={{ fontSize: 18 }} />,
      label: "Needs Work",
      value: stats.needsWork,
      color: "#EF4444",
    },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
      {cards.map((card) =>
        loading ? (
          <Skeleton key={card.label} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        ) : (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        )
      )}
    </Box>
  );
};

export default memo(InterviewsHeader);
