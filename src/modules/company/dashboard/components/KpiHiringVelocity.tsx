"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Gauge as SpeedOutlined, TrendingDown as TrendingDownOutlined, TrendingUp as TrendingUpOutlined, Minus as RemoveOutlined } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { ChartTooltip, GRAY, GRAY2, T } from "../utils/kpiTokens";
import type { KpiVelocityData } from "../types";

const fmtDay = (v: any) => [`${v}d`, ""] as [string, string];

interface VelocityCardProps {
  title:   string; subtitle: string;
  value:   number | null; delta: number | null;
  dataKey: "tts" | "tth"; color: string; bgColor: string;
  trend:   Array<{ period: string; tts: number | null; tth: number | null }>;
  loading: boolean;
}

const VelocityCard = memo<VelocityCardProps>(({ title, subtitle, value, delta, dataKey, color, bgColor, trend, loading }) => {
  const { t } = useTranslation("dashboard");

  const isDown = delta !== null && delta < 0;
  const isUp   = delta !== null && delta > 0;

  const trendColor = isDown ? "#10B981" : isUp ? "#EF4444" : GRAY2;
  const trendBg    = isDown ? "#ECFDF5" : isUp ? "#FEF2F2" : "#F1F5F9";
  const chipLabel  = delta !== null ? `${isDown ? "↓" : isUp ? "↑" : "→"} ${Math.abs(delta)}d vs prev. period` : "—";
  const trendLabel = isDown ? t("pages.kpi.trending_down") : isUp ? t("pages.kpi.trending_up") : t("pages.kpi.trending_stable");
  const TrendIcon  = isDown ? TrendingDownOutlined : isUp ? TrendingUpOutlined : RemoveOutlined;
  const iconColor  = isDown ? "#10B981" : isUp ? "#EF4444" : GRAY2;

  const [minY, maxY] = useMemo(() => {
    const vals = trend.map((r) => r[dataKey]).filter((v): v is number => v !== null);
    return vals.length ? [Math.floor(Math.min(...vals) * 0.85), Math.ceil(Math.max(...vals) * 1.15)] : [0, 10];
  }, [trend, dataKey]);

  const dot = useMemo(() => ({ r: 4, fill: "#fff", stroke: color, strokeWidth: 2 }), [color]);

  return (
    <KpiCard title={title} subtitle={subtitle}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          {loading ? <Skeleton className="h-14 w-20 rounded" /> : (
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-[2.8rem] leading-none" style={{ color }}>{value ?? "—"}</span>
              <span className="text-[0.85rem] text-slate-400">{t("pages.kpi.days")}</span>
            </div>
          )}
          {loading ? <Skeleton className="h-6 w-40 rounded-full mt-2" /> : (
            <span className="inline-block mt-2 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: trendBg, color: trendColor }}>
              {chipLabel}
            </span>
          )}
        </div>
        <div className="text-center px-4 py-3 rounded-xl" style={{ background: bgColor }}>
          {loading ? <Skeleton className="w-7 h-7 rounded-full" /> : <TrendIcon size={28} color={iconColor} />}
          {loading ? <Skeleton className="h-3 w-10 rounded mt-1" /> : (
            <div className="text-[0.65rem] font-semibold mt-0.5" style={{ color: trendColor }}>{trendLabel}</div>
          )}
        </div>
      </div>

      {loading ? <Skeleton className="w-full h-[110px] rounded-[10px]" /> : (
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[minY, maxY]} allowDataOverflow />
            <RechartsTooltip {...ChartTooltip} formatter={fmtDay} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} connectNulls dot={dot} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
VelocityCard.displayName = "VelocityCard";

interface Props { data: KpiVelocityData | undefined; loading: boolean }

const KpiHiringVelocity = memo<Props>(({ data, loading }) => {
  const { t }   = useTranslation("dashboard");
  const trend   = data?.trend ?? [];

  return (
    <>
      <ZoneHeading icon={SpeedOutlined} label={t("pages.kpi.zone4_title")} color="#0891B2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <VelocityCard title={t("pages.kpi.tts_title")} subtitle={t("pages.kpi.tts_subtitle")} value={data?.tts ?? null}  delta={data?.ttsDelta ?? null} dataKey="tts" color={T}        bgColor={`${T}12`}  trend={trend} loading={loading} />
        <VelocityCard title={t("pages.kpi.tth_title")} subtitle={t("pages.kpi.tth_subtitle")} value={data?.tth ?? null}  delta={data?.tthDelta ?? null} dataKey="tth" color="#7C3AED" bgColor="#F5F3FF" trend={trend} loading={loading} />
      </div>
    </>
  );
});
KpiHiringVelocity.displayName = "KpiHiringVelocity";
export default KpiHiringVelocity;
