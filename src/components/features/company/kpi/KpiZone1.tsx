"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { ActionCard, ZoneHeading } from "./KpiAtoms";

const KpiZone1: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const cards = [
    { icon: AssignmentOutlined,   label: t("pages.kpi.shortlists_pending"),    value: 14, color: "#7C3AED", bg: "#F5F3FF", trend: -3, note: t("pages.kpi.decision_required") },
    { icon: AccessTimeOutlined,   label: t("pages.kpi.interviews_unreviewed"), value: 7,  color: "#EF4444", bg: "#FEF2F2", trend: 2,  note: t("pages.kpi.since_yesterday")   },
    { icon: PersonOffOutlined,    label: t("pages.kpi.noshows"),               value: 5,  color: "#F59E0B", bg: "#FFFBEB", trend: 0,  note: t("pages.kpi.invited_5d")        },
    { icon: WarningAmberOutlined, label: t("pages.kpi.posts_alert"),           value: 2,  color: "#EF4444", bg: "#FEF2F2", trend: 1,  note: t("pages.kpi.deadline_14d")      },
  ];

  return (
    <>
      <ZoneHeading icon={AssignmentOutlined} label={t("pages.kpi.zone1_title")} color="#7C3AED" />
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
        {cards.map(kpi => (
          <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={kpi.label}>
            <ActionCard {...kpi} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default KpiZone1;
