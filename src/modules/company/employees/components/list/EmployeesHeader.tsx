import React, { memo, useMemo } from "react";
import { Box, Skeleton } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/ui/StatCard";
import type { MemberStats } from "@/modules/company/members/types";

const GRID_SX = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 } as const;
const SKELETON_SX = { borderRadius: 2 } as const;

interface EmployeesHeaderProps {
  stats: MemberStats | null;
  loading?: boolean;
  active: number;
  owners: number;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ stats, loading = false }) => {
  const { t } = useTranslation("dashboard");

  const cards = useMemo(() => [
    {
      icon: <PeopleAltOutlined sx={{ fontSize: 18 }} />,
      label: t("pages.employees.header.total"),
      key: "total",
      value: stats?.total ?? 0,
      color: "#8310FF",
    },
    {
      icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,
      label: t("pages.employees.header.employees"),
      key: "employees",
      value: stats?.memberships.total ?? 0,
      color: "#10B981",
    },
    {
      icon: <HourglassEmptyOutlined sx={{ fontSize: 18 }} />,
      label: t("pages.employees.header.invitations"),
      key: "invitations",
      value: stats?.invitations.total ?? 0,
      color: "#D97706",
    },
  ], [t, stats]);

  return (
    <Box sx={GRID_SX}>
      {cards.map((card) =>
        loading ? (
          <Skeleton key={card.key} variant="rounded" height={80} sx={SKELETON_SX} />
        ) : (
          <StatCard key={card.key} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        )
      )}
    </Box>
  );
};

export default memo(EmployeesHeader);
