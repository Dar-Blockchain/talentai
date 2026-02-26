import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import StatCard from "@/components/ui/StatCard";
import { MemberStats } from "@/store/slices/memberSlice";

interface EmployeesHeaderProps {
  stats: MemberStats | null;
  loading?: boolean;
  // fallback counts used while stats are loading
  active: number;
  owners: number;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ stats, loading = false, active, owners }) => {
  const cards = [
    {
      icon: <PeopleAltOutlined sx={{ fontSize: 18 }} />,
      label: "Total",
      value: stats?.total ?? 0,
      color: "#8310FF",
    },
    {
      icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,
      label: "Members",
      value: stats?.memberships.total ?? 0,
      color: "#10B981",
    },
    {
      icon: <HourglassEmptyOutlined sx={{ fontSize: 18 }} />,
      label: "Invitations",
      value: stats?.invitations.total ?? 0,
      color: "#D97706",
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

export default memo(EmployeesHeader);
