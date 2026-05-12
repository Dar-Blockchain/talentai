"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Skeleton, Paper, Box } from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { ActionCard, ZoneHeading } from "./KpiAtoms";
import { BORDER, WHITE } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import {
  fetchPendingShortlists,
  fetchUnreviewedInterviews,
  selectPendingShortlistsCount,
  selectPendingShortlistsLoading,
  selectUnreviewedCount,
  selectUnreviewedUrgent,
  selectUnreviewedLoading,
} from "@/store/slices/kpiSlice";

const CardSkeleton: React.FC = () => (
  <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "18px", p: 2.5, bgcolor: WHITE }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "13px" }} />
      <Skeleton variant="rounded" width={48} height={20} sx={{ borderRadius: "20px" }} />
    </Box>
    <Skeleton variant="text" width={48} height={36} />
    <Skeleton variant="text" width="70%" height={16} />
    <Skeleton variant="text" width="50%" height={14} />
  </Paper>
);

const KpiZone1: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const pendingCount      = useSelector(selectPendingShortlistsCount);
  const pendingLoading    = useSelector(selectPendingShortlistsLoading);
  const unreviewedCount   = useSelector(selectUnreviewedCount);
  const unreviewedUrgent  = useSelector(selectUnreviewedUrgent);
  const unreviewedLoading = useSelector(selectUnreviewedLoading);

  useEffect(() => {
    dispatch(fetchPendingShortlists({}));
    dispatch(fetchUnreviewedInterviews({}));
  }, [dispatch]);

  const urgentNote = unreviewedUrgent
    ? `${unreviewedUrgent} urgent (>72h)`
    : t("pages.kpi.since_yesterday");

  const cards = [
    { icon: AssignmentOutlined,   label: t("pages.kpi.shortlists_pending"),    value: pendingCount    ?? 0, color: "#7C3AED", bg: "#F5F3FF", trend: 0, note: t("pages.kpi.decision_required"), loading: pendingLoading    },
    { icon: AccessTimeOutlined,   label: t("pages.kpi.interviews_unreviewed"), value: unreviewedCount ?? 0, color: "#EF4444", bg: "#FEF2F2", trend: 0, note: urgentNote,                       loading: unreviewedLoading },
    { icon: PersonOffOutlined,    label: t("pages.kpi.noshows"),               value: 0,                   color: "#F59E0B", bg: "#FFFBEB", trend: 0, note: t("pages.kpi.invited_5d"),        loading: false             },
    { icon: WarningAmberOutlined, label: t("pages.kpi.posts_alert"),           value: 0,                   color: "#EF4444", bg: "#FEF2F2", trend: 0, note: t("pages.kpi.deadline_14d"),      loading: false             },
  ];

  return (
    <>
      <ZoneHeading icon={AssignmentOutlined} label={t("pages.kpi.zone1_title")} color="#7C3AED" />
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
        {cards.map(({ loading, ...kpi }) => (
          <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={kpi.label}>
            {loading ? <CardSkeleton /> : <ActionCard {...kpi} />}
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default KpiZone1;
