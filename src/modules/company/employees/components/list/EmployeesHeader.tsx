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
  <div className="flex items-center gap-3 rounded-[10px] border border-[#f3f4f6] bg-white px-4 py-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[22px]"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {icon}
    </div>
    <div className="flex flex-col gap-[2px]">
      <span className="text-2xl font-extrabold leading-none text-[#111827]">{value}</span>
      <span className="text-[0.75rem] font-medium text-[#6b7280]">{label}</span>
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
    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      {cards.map((card) =>
        loading ? (
          <Skeleton key={card.key} className="h-[80px] rounded-lg" />
        ) : (
          <StatCard key={card.key} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        )
      )}
    </div>
  );
};

export default memo(EmployeesHeader);
