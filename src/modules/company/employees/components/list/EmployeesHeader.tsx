import React, { memo, useMemo } from "react";
import { Users, CheckCircle, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import type { MemberStats } from "@/modules/company/members/types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-[#EBEDF0] bg-white px-4 py-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.14)]">
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{ background: `radial-gradient(circle at 100% 0%, ${color}, transparent 60%)` }}
    />
    <div
      className="relative flex size-12 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[22px]"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </div>
    <div className="relative flex min-w-0 flex-col gap-0.5">
      <span className="text-[1.7rem] font-extrabold leading-none tracking-tight text-[#0F172A]">{value}</span>
      <span className="text-[0.78rem] font-semibold text-[#334155]">{label}</span>
    </div>
  </div>
);

interface EmployeesHeaderProps {
  stats: MemberStats | null;
  loading?: boolean;
  active: number;
  owners: number;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ stats, loading = false }) => {
  const { t } = useTranslation("dashboard");

  const cards = useMemo(() => [
    {
      icon: <Users />,
      label: t("pages.employees.header.total"),
      key: "total",
      value: stats?.total ?? 0,
      color: "#8310FF",
    },
    {
      icon: <CheckCircle />,
      label: t("pages.employees.header.employees"),
      key: "employees",
      value: stats?.memberships.total ?? 0,
      color: "#10B981",
    },
    {
      icon: <Timer />,
      label: t("pages.employees.header.invitations"),
      key: "invitations",
      value: stats?.invitations.total ?? 0,
      color: "#D97706",
    },
  ], [t, stats]);

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) =>
        loading ? (
          <Skeleton key={card.key} className="h-[84px] rounded-2xl" />
        ) : (
          <StatCard key={card.key} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        )
      )}
    </div>
  );
};

export default memo(EmployeesHeader);
