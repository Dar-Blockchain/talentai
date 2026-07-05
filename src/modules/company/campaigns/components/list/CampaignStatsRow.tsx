"use client";

import React, { memo } from "react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";
import StatsSkeleton from "./StatsSkeleton";

export interface CampaignStatItem {
  key: string;
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  /** Marks this card as the active filter tab (only meaningful when onClick is set). */
  active?: boolean;
  /** Turns the card into a clickable filter tab. */
  onClick?: () => void;
}

interface Props {
  items: CampaignStatItem[];
  loading?: boolean;
}

const CampaignStatsRow: React.FC<Props> = memo(({ items, loading }) => {
  if (loading) return <StatsSkeleton count={items.length || 4} />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ key, label, value, icon: Icon, color, active, onClick }) => {
        const clickable = !!onClick;
        return (
          <Card
            key={key}
            onClick={onClick}
            className={cn(
              "py-0 gap-0 transition-all",
              clickable && "cursor-pointer hover:shadow-md",
              clickable && "border-[1.5px]",
            )}
            style={clickable ? {
              borderColor: active ? color : undefined,
              backgroundColor: active ? `${color}0A` : undefined,
            } : undefined}
          >
            <CardContent className="flex items-center gap-3 px-4 py-4">
              <div
                className="size-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground leading-tight">{value}</p>
                <p
                  className={cn("text-xs font-medium mt-0.5", !(clickable && active) && "text-muted-foreground")}
                  style={clickable && active ? { color } : undefined}
                >
                  {label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

CampaignStatsRow.displayName = "CampaignStatsRow";
export default CampaignStatsRow;
