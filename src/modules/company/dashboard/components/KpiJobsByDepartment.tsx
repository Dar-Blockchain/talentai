"use client";
import React, { memo, useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Building2 as DepartmentOutlined, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, LabelList, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER } from "../utils/kpiTokens";
import { useKpiJobsByDepartmentQuery } from "../queries";
import { useIsHR } from "../hooks/useIsHR";
import type { KpiDepartmentRow } from "../types";

// Fixed-order categorical palette (validated for CVD-safe adjacency —
// see dataviz skill). Every department gets its own bar; past 8 the hues
// repeat — safe here since each bar also carries its own name label,
// unlike a pie slice which relies on color alone.
const SLOT_COLORS = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834", "#4a3aa7", "#e34948"];
const ACCENT = SLOT_COLORS[0];

const ROW_HEIGHT = 44;
const MIN_HEIGHT = 160;

interface Bucket { name: string; count: number; color: string }

const buildBuckets = (rows: KpiDepartmentRow[]): Bucket[] =>
  [...rows]
    .sort((a, b) => b.count - a.count)
    .map((r, i) => ({ name: r.name, count: r.count, color: SLOT_COLORS[i % SLOT_COLORS.length] }));

// Three faint, unlabeled bars so an empty account still reads as "a bar
// chart with nothing in it yet" instead of a blank card — same treatment as
// the other KPI charts (see KpiRecruitmentFunnel / KpiManualVsTalentAiHours).
const EMPTY_PLACEHOLDER: Bucket[] = [
  { name: "", count: 0, color: "#E2E8F0" },
  { name: "", count: 0, color: "#E2E8F0" },
  { name: "", count: 0, color: "#E2E8F0" },
];

// Tooltip with a colored vertical "line" indicator next to the value,
// instead of a dot or dashed swatch.
const LineIndicatorTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length || !payload[0].payload?.name) return null;
  const { name, count, color } = payload[0].payload as Bucket;
  return (
    <div
      className="flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      style={{ borderColor: BORDER, fontFamily: "Poppins" }}
    >
      <span className="block h-8 w-[3px] shrink-0 rounded-full" style={{ background: color }} />
      <div className="leading-tight">
        <div className="text-[12px] font-semibold text-slate-900">{name}</div>
        <div className="text-[11px] text-slate-500">{count}</div>
      </div>
    </div>
  );
};

// Name label: white on a filled (count > 0) bar, department-colored text
// when the bar itself has no background (count === 0).
const NameLabel = (buckets: Bucket[]) => (props: any) => {
  const { x, y, width, height, index } = props;
  const bucket = buckets[index];
  if (!bucket) return null;
  return (
    <text
      x={x + 10}
      y={y + height / 2}
      dy={4}
      fill={bucket.count > 0 ? "#fff" : bucket.color}
      style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600 }}
    >
      {bucket.name}
    </text>
  );
};

const KpiJobsByDepartment = memo(() => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const isHR = useIsHR();
  const { data, isLoading } = useKpiJobsByDepartmentQuery(isHR);

  const rows    = useMemo(() => data ?? [], [data]);
  const buckets = useMemo(() => buildBuckets(rows), [rows]);
  const chartHeight = Math.max(MIN_HEIGHT, buckets.length * ROW_HEIGHT);
  // Wide enough for the longest department name to sit on one line inside
  // a zero-count bar's reserved space, without overlapping the next row.
  const longestName = useMemo(
    () => buckets.reduce((max, b) => Math.max(max, b.name.length), 0),
    [buckets],
  );
  const minPointSize = Math.min(220, Math.max(90, longestName * 8 + 30));
  const nameLabel = useMemo(() => NameLabel(buckets), [buckets]);

  if (!isHR) return null;

  const isEmpty = rows.length === 0;

  return (
    <>
      <ZoneHeading icon={DepartmentOutlined} label={t("pages.kpi.zone_department_title", "Jobs by Department")} color={ACCENT} />
      <KpiCard className="flex-1 flex flex-col" contentClassName="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex-1 text-center text-[11px] text-slate-400">
              {t("pages.kpi.zone_department_subtitle", "Open and past job posts grouped by department — visible to HR only")}
            </p>
            <Button
              size="xs"
              variant="outline"
              className="h-7 gap-1 rounded-full text-[11px] font-semibold shrink-0"
              onClick={() => router.push("/company/departments")}
            >
              <Plus size={13} />
              {t("pages.kpi.zone_department_add", "Add Department")}
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="w-full rounded-[10px]" style={{ height: MIN_HEIGHT }} />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <ResponsiveContainer width="100%" height={isEmpty ? MIN_HEIGHT : chartHeight}>
                <BarChart
                  data={isEmpty ? EMPTY_PLACEHOLDER : buckets}
                  layout="vertical"
                  margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                  barCategoryGap="24%"
                >
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="name" hide />
                  {!isEmpty && <RechartsTooltip content={<LineIndicatorTooltip />} cursor={{ fill: "#F8FAFC" }} />}
                  {/* minPointSize reserves room for the label even at 0; the
                      Cell fill is transparent there so no background shows. */}
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} maxBarSize={32} minPointSize={isEmpty ? 36 : minPointSize}>
                    {(isEmpty ? EMPTY_PLACEHOLDER : buckets).map((b, i) => (
                      <Cell key={i} fill={isEmpty ? b.color : b.count > 0 ? b.color : "transparent"} />
                    ))}
                    {!isEmpty && <LabelList dataKey="name" content={nameLabel} />}
                    {!isEmpty && (
                      <LabelList
                        dataKey="count"
                        position="right"
                        fill="#0f172a"
                        style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 700 }}
                      />
                    )}
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
