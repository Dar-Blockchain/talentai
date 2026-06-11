"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Skeleton, Paper, Box } from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { ActionCard, ZoneHeading } from "./KpiAtoms";
import { BORDER, WHITE } from "../utils/kpiTokens";
import type { KpiActionsData } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const SKEL_PAPER_SX = { border: `1px solid ${BORDER}`, borderRadius: "18px", p: 2.5, bgcolor: WHITE } as const;
const SKEL_TOP_SX   = { display: "flex", justifyContent: "space-between", mb: 2 } as const;
const GRID_SX       = { mb: 4 } as const;
const GRID_SPACING  = { xs: 1.5, sm: 2 } as const;
const GRID_SIZE     = { xs: 12, sm: 6, xl: 3 } as const;

const SKELETON_ITEMS = [null, null, null, null];

// ─── CardSkeleton ─────────────────────────────────────────────────────────────

const CardSkeleton = memo(() => (
  <Paper elevation={0} sx={SKEL_PAPER_SX}>
    <Box sx={SKEL_TOP_SX}>
      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "13px" }} />
      <Skeleton variant="rounded" width={48} height={20} sx={{ borderRadius: "20px" }} />
    </Box>
    <Skeleton variant="text" width={48} height={36} />
    <Skeleton variant="text" width="70%" height={16} />
    <Skeleton variant="text" width="50%" height={14} />
  </Paper>
));
CardSkeleton.displayName = "CardSkeleton";

// ─── KpiActionsToTake ─────────────────────────────────────────────────────────

interface KpiActionsToTakeProps {
  data:    KpiActionsData | undefined;
  loading: boolean;
}

const KpiActionsToTake = memo<KpiActionsToTakeProps>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const urgentNote = useMemo(() =>
    data?.unreviewedUrgent
      ? `${data.unreviewedUrgent} urgent (>72h)`
      : t("pages.kpi.since_yesterday"),
  [data?.unreviewedUrgent, t]);

  const cards = useMemo(() => [
    { icon: AssignmentOutlined,   label: t("pages.kpi.shortlists_pending"),    value: data?.pendingShortlists ?? 0, color: "#7C3AED", bg: "#F5F3FF", note: t("pages.kpi.decision_required") },
    { icon: AccessTimeOutlined,   label: t("pages.kpi.interviews_unreviewed"), value: data?.unreviewed        ?? 0, color: "#EF4444", bg: "#FEF2F2", note: urgentNote },
    { icon: PersonOffOutlined,    label: t("pages.kpi.noshows"),               value: data?.noshows           ?? 0, color: "#F59E0B", bg: "#FFFBEB", note: t("pages.kpi.invited_5d") },
    { icon: WarningAmberOutlined, label: t("pages.kpi.posts_alert"),           value: data?.postsInAlert      ?? 0, color: "#EF4444", bg: "#FEF2F2", note: t("pages.kpi.deadline_14d") },
  ], [data?.pendingShortlists, data?.unreviewed, data?.noshows, data?.postsInAlert, urgentNote, t]);

  return (
    <>
      <ZoneHeading icon={AssignmentOutlined} label={t("pages.kpi.zone1_title")} color="#7C3AED" />
      <Grid container spacing={GRID_SPACING} sx={GRID_SX}>
        {SKELETON_ITEMS.map((_, i) => (
          <Grid size={GRID_SIZE} key={cards[i]?.label ?? i}>
            {loading ? <CardSkeleton /> : <ActionCard {...cards[i]} trend={0} />}
          </Grid>
        ))}
      </Grid>
    </>
  );
});
KpiActionsToTake.displayName = "KpiActionsToTake";

export default KpiActionsToTake;
