"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { KpiCard } from "../KpiAtoms";
import { ChartTooltip, GRAY } from "../../utils/kpiTokens";

const STALE = 60_000;
const sel = (r: any) => r.data?.data ?? r.data;
const fetchDepartmentStats = () => axiosInstance.get("departments/stats").then(sel);

const BAR_COLOR = "#0EA5E9";

const MembersByDepartment = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useQuery({ queryKey: ["teamDashboard", "departmentStats"], queryFn: fetchDepartmentStats, staleTime: STALE });

  const byDepartment: Array<{ name: string; members: number }> = data?.byDepartment ?? [];
  const isEmpty = byDepartment.length === 0;

  return (
    <KpiCard title={t("team.by_department.title", "Members per Department")} subtitle={t("team.by_department.subtitle", "Headcount distribution across departments")}>
      {isLoading ? (
        <Skeleton className="w-full h-[220px] rounded-[10px]" />
      ) : isEmpty ? (
        <div className="h-[220px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("team.by_department.empty", "No departments yet")}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, byDepartment.length * 34)}>
          <BarChart data={byDepartment} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
            <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [v, t("team.by_department.members", "Members")]} />
            <Bar dataKey="members" radius={[0, 6, 6, 0]} barSize={16}>
              {byDepartment.map((_, i) => <Cell key={i} fill={BAR_COLOR} fillOpacity={1 - i * 0.07} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
MembersByDepartment.displayName = "MembersByDepartment";
export default MembersByDepartment;
