"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { ClipboardList as AssignmentOutlined, Clock as AccessTimeOutlined, UserX as PersonOffOutlined, AlertTriangle as WarningAmberOutlined } from "lucide-react";
import { ActionCard, ZoneHeading } from "./KpiAtoms";
import type { KpiActionsData } from "../types";

const CardSkeleton = () => (
  <Card className="rounded-2xl">
    <CardContent>
      <div className="flex justify-between mb-3">
        <Skeleton className="w-11 h-11 rounded-[13px]" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-4 w-3/4 mb-1.5" />
      <Skeleton className="h-3 w-1/2" />
    </CardContent>
  </Card>
);

interface Props { data: KpiActionsData | undefined; loading: boolean }

const KpiActionsToTake = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const urgentNote = data?.unreviewedUrgent
    ? `${data.unreviewedUrgent} urgent (>72h)`
    : t("pages.kpi.since_yesterday");

  const cards = [
    { icon: AssignmentOutlined,   label: t("pages.kpi.shortlists_pending"),    value: data?.pendingShortlists ?? 0, color: "#7C3AED", bg: "#F5F3FF", note: t("pages.kpi.decision_required") },
    { icon: AccessTimeOutlined,   label: t("pages.kpi.interviews_unreviewed"), value: data?.unreviewed        ?? 0, color: "#EF4444", bg: "#FEF2F2", note: urgentNote },
    { icon: PersonOffOutlined,    label: t("pages.kpi.noshows"),               value: data?.noshows           ?? 0, color: "#F59E0B", bg: "#FFFBEB", note: t("pages.kpi.invited_5d") },
    { icon: WarningAmberOutlined, label: t("pages.kpi.posts_alert"),           value: data?.postsInAlert      ?? 0, color: "#EF4444", bg: "#FEF2F2", note: t("pages.kpi.deadline_14d") },
  ];

  return (
    <>
      <ZoneHeading icon={AssignmentOutlined} label={t("pages.kpi.zone1_title")} color="#7C3AED" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          loading ? <CardSkeleton key={i} /> : <ActionCard key={i} {...card} trend={0} />
        ))}
      </div>
    </>
  );
});
KpiActionsToTake.displayName = "KpiActionsToTake";
export default KpiActionsToTake;
