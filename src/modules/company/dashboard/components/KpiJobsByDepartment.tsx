"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Building2 as DepartmentOutlined } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY, GRAY2, NAVY } from "../utils/kpiTokens";
import { useKpiJobsByDepartmentQuery } from "../queries";
import { useIsHR } from "../hooks/useIsHR";
import type { KpiDepartmentRow } from "../types";

const ACCENT = "#6f52ce";
const BAR_COLOR = "#C4B5FD";     // soft light purple — bar length carries the magnitude, not colour
const ZERO_TRACK = "#F1F5F9";
const PLACEHOLDER = "#E2E8F0";

const ROW_HEIGHT = 44;
const MIN_HEIGHT = 160;
const MAX_NAME_CHARS = 18;
const BAR_THICKNESS = 30;

interface Bucket { name: string; count: number }

const buildBuckets = (rows: KpiDepartmentRow[]): Bucket[] =>
  [...rows]
    .sort((a, b) => b.count - a.count)
    .map((r) => ({ name: r.name, count: r.count }));

// Three faint, unlabeled bars so an empty account still reads as "a bar
// chart with nothing in it yet" instead of a blank card — same treatment as
// the other KPI charts (see KpiRecruitmentFunnel / KpiManualVsTalentAiHours).
const EMPTY_PLACEHOLDER: Bucket[] = [
  { name: "", count: 0 },
  { name: "", count: 0 },
  { name: "", count: 0 },
];

// Every row sits on a soft full-width track, with the count parked just past
// its right edge — so a busy department and a zero one line up the same way,
// and a zero reads as "nothing here yet" rather than a missing bar.
const renderTrack = (buckets: Bucket[]) => (props: any) => {
  const { x, y, width, height, index } = props;
  const bucket = buckets[index];
  if (!bucket) return null;
  const barH = Math.min(height, BAR_THICKNESS);
  return (
    <g>
      <rect x={x} y={y + (height - barH) / 2} width={Math.max(width, 0)} height={barH} rx={6} fill={ZERO_TRACK} />
      <text
        x={x + width + 8}
        y={y + height / 2}
        dy={4}
        textAnchor="start"
        fill={bucket.count > 0 ? NAVY : GRAY2}
        style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 700 }}
      >
        {bucket.count}
      </text>
    </g>
  );
};

// Tooltip with a colored vertical "line" indicator next to the value.
const LineIndicatorTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length || !payload[0].payload?.name) return null;
  const { name, count } = payload[0].payload as Bucket;
  return (
    <div
      className="flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      style={{ borderColor: BORDER, fontFamily: "Poppins" }}
    >
      <span className="block h-8 w-[3px] shrink-0 rounded-full" style={{ background: count > 0 ? BAR_COLOR : ZERO_TRACK }} />
      <div className="leading-tight">
        <div className="text-[12px] font-semibold text-slate-900">{name}</div>
        <div className="text-[11px] text-slate-500">{count}</div>
      </div>
    </div>
  );
};

// Department name on the left axis — right-aligned, truncated with an ellipsis
// so a long name never collides with the bars.
const YAxisTick = ({ x, y, payload }: any) => {
  const raw = String(payload?.value ?? "");
  const label = raw.length > MAX_NAME_CHARS ? `${raw.slice(0, MAX_NAME_CHARS - 1)}…` : raw;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill={GRAY} style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 500 }}>
      {label}
    </text>
  );
};

const KpiJobsByDepartment = memo(() => {
  const { t } = useTranslation("dashboard");
  const isHR = useIsHR();
  const { data, isLoading } = useKpiJobsByDepartmentQuery(isHR);

  const rows    = useMemo(() => data ?? [], [data]);
  const buckets = useMemo(() => buildBuckets(rows), [rows]);
  const chartHeight = Math.max(MIN_HEIGHT, buckets.length * ROW_HEIGHT);

  if (!isHR) return null;

  const isEmpty = rows.length === 0;

  return (
    <>
      <ZoneHeading icon={DepartmentOutlined} label={t("pages.kpi.zone_department_title", "Jobs by Department")} color={ACCENT} />
      <KpiCard className="flex-1 flex flex-col" contentClassName="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0 flex-col gap-3">
          <p className="text-center text-[11px] text-slate-400">
            {t("pages.kpi.zone_department_subtitle", "Open and past job posts grouped by department")}
          </p>

          {isLoading ? (
            <Skeleton className="w-full rounded-[10px]" style={{ height: MIN_HEIGHT }} />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <ResponsiveContainer width="100%" height={isEmpty ? MIN_HEIGHT : chartHeight}>
                <BarChart
                  data={isEmpty ? EMPTY_PLACEHOLDER : buckets}
                  layout="vertical"
                  margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
                  barCategoryGap="26%"
                >
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isEmpty ? 0 : 124}
                    tickLine={false}
                    axisLine={false}
                    tick={isEmpty ? false : <YAxisTick />}
                  />
                  {!isEmpty && <RechartsTooltip content={<LineIndicatorTooltip />} cursor={{ fill: "#F8FAFC" }} />}
                  <Bar
                    dataKey="count"
                    radius={6}
                    maxBarSize={BAR_THICKNESS}
                    minPointSize={isEmpty ? 36 : 2}
                    background={isEmpty ? undefined : renderTrack(buckets)}
                  >
                    {(isEmpty ? EMPTY_PLACEHOLDER : buckets).map((b, i) => (
                      <Cell key={i} fill={isEmpty ? PLACEHOLDER : b.count > 0 ? BAR_COLOR : "transparent"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {isEmpty && (
                <div className="text-center text-[0.78rem] text-slate-400 -mt-4">
                  {t("pages.kpi.zone_department_empty", "No job posts assigned to a department yet")}
                </div>
              )}
            </div>
          )}
        </div>
      </KpiCard>
    </>
  );
});
KpiJobsByDepartment.displayName = "KpiJobsByDepartment";
export default KpiJobsByDepartment;
