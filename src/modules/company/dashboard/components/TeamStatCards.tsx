"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { StatCard } from "./KpiAtoms";
import {
  Mail as MailOutlined,
  Network as AccountTreeOutlined,
  Users as GroupsOutlined,
} from "lucide-react";

const STALE = 60_000;
const sel       = (r: any) => r.data?.data ?? r.data;
const selMember = (r: any) => r.data?.stats ?? r.data?.data ?? r.data;

const fetchDepartmentStats = () => axiosInstance.get("departments/stats").then(sel);
const fetchMemberStats     = () => axiosInstance.get("company-memberships/memberships/stats").then(selMember);

const TeamStatCards = memo(() => {
  const { t } = useTranslation("dashboard");

  const { data: deptStat, isLoading: l1 } = useQuery({ queryKey: ["statCards", "departments"], queryFn: fetchDepartmentStats, staleTime: STALE });
  const { data: membStat, isLoading: l2 } = useQuery({ queryKey: ["statCards", "members"],     queryFn: fetchMemberStats,     staleTime: STALE });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={GroupsOutlined}
        color="#A855F7" bg="#FDF4FF"
        loading={l2} value={membStat?.memberships?.total ?? 0}
        label={t("overview.stat.team_members")}
        href="/company/employees"
      />
      <StatCard
        icon={AccountTreeOutlined}
        color="#0EA5E9" bg="#F0F9FF"
        loading={l1} value={deptStat?.total ?? 0}
        label={t("overview.stat.departments")}
        href="/company/departments"
      />
      <StatCard
        icon={MailOutlined}
        color="#D97706" bg="#FFFBEB"
        loading={l2} value={membStat?.invitations?.total ?? 0}
        label={t("overview.stat.pending_invitations")}
        href="/company/employees?tab=invitations"
      />
    </div>
  );
});
TeamStatCards.displayName = "TeamStatCards";
export default TeamStatCards;
