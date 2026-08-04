import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendLabel = "vs last month",
  color = "#0D9488",
  onClick,
}) => {
  const hasTrend = trend !== undefined;
  const isPositive = hasTrend && trend >= 0;

  return (
    <Card
      onClick={onClick}
      title={hasTrend ? trendLabel : undefined}
      className={cn(
        "flex-row items-center gap-0 rounded-[20px] border-[#f3f4f6] px-4 py-3.5",
        "shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[22px]"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold leading-none text-gray-900">{value}</span>
            {hasTrend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                  isPositive ? "bg-emerald-50" : "bg-red-50",
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="size-3.5 text-red-500" />
                )}
                <span className={cn("text-[0.7rem] font-bold", isPositive ? "text-emerald-500" : "text-red-500")}>
                  {isPositive ? "+" : ""}
                  {trend}
                </span>
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
