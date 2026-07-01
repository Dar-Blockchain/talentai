"use client";

import React, { memo, useMemo } from "react";
import { Megaphone, CheckCircle2, FileText, Timer } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import StatsSkeleton from "./StatsSkeleton";
import { useTranslation } from "react-i18next";
import { useCampaignMetricsQuery } from "../../queries";

const STAT_DEFS = [
  { key: "total",          Icon: Megaphone,     color: "#6B7280" },
  { key: "active",         Icon: CheckCircle2,  color: "#10B981" },
  { key: "drafts",         Icon: FileText,      color: "#3B82F6" },
  { key: "closed_expired", Icon: Timer,         color: "#8B5CF6" },
] as const;

const CampaignsStats: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns.stats";

  const { data: metrics, isLoading } = useCampaignMetricsQuery();

  const closedExpired = useMemo(
    () => (metrics ? metrics.closed + metrics.expired : 0),
    [metrics?.closed, metrics?.expired],
  );

  if (isLoading || !metrics) return <StatsSkeleton />;

  const values: Record<string, number> = {
    total:          metrics.total,
    active:         metrics.active,
    drafts:         metrics.draft,
    closed_expired: closedExpired,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STAT_DEFS.map(({ key, Icon, color }) => (
        <Card key={key} className="py-0 gap-0">
          <CardContent className="flex items-center gap-3 px-4 py-4">
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground leading-tight">{values[key]}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{t(`${p}.${key}`)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

CampaignsStats.displayName = "CampaignsStats";
export default CampaignsStats;
