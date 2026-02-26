import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import StatCard from "@/components/ui/StatCard";

interface EmployeesHeaderProps {
  total: number;
  active: number;
  owners: number;
  pending: number;
  loading?: boolean;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ total, active, owners, pending, loading = false }) => {
  const cards = [
    { icon: <PeopleAltOutlined sx={{ fontSize: 18 }} />,         label: "Total Members", value: total,   color: "#8310FF" },
    { icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,         label: "Active",        value: active,  color: "#10B981" },
    { icon: <AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />, label: "Owners",        value: owners,  color: "#0891B2" },
    { icon: <HourglassEmptyOutlined sx={{ fontSize: 18 }} />,     label: "Pending",       value: pending, color: "#D97706" },
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
