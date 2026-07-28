"use client";

import React, { memo, useRef, useState, useLayoutEffect, useCallback } from "react";
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
  // Mouse click-drag doesn't scroll a div natively (only touch/trackpad
  // gestures do) — this makes the row draggable with a mouse too. Touch
  // pointers are left alone so native touch scrolling keeps working as-is.
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const d = drag.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 3) d.moved = true;
    el.scrollLeft = d.startScroll - dx;
  };
  const onPointerUp = () => { drag.current.active = false; };

  // The right-edge fade is only meaningful — and only visually correct —
  // while there's actual content past it to scroll to. Without this it sits
  // over the last card at all times, including when nothing is cut off.
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, updateScrollState]);

  if (loading) return <StatsSkeleton count={items.length || 4} />;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onScroll={updateScrollState}
        className={cn(
          "flex gap-3 overflow-x-auto snap-x snap-proximity pb-1 cursor-grab active:cursor-grabbing",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {items.map(({ key, label, value, icon: Icon, color, active, onClick }) => {
          const clickable = !!onClick;
          return (
            <Card
              key={key}
              onClick={(e) => {
                if (drag.current.moved) { e.preventDefault(); return; }
                onClick?.();
              }}
              className={cn(
                // flex-1 lets cards stretch to fill the row when everything fits;
                // min-w is the floor they shrink to before the row overflows and
                // scrolls instead of ever wrapping onto a second row.
                "py-0 gap-0 transition-all flex-1 min-w-[136px] snap-start",
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
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold text-foreground leading-tight">{value}</p>
                  <p
                    className={cn("text-xs font-medium mt-0.5 truncate", !(clickable && active) && "text-muted-foreground")}
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

      {/* Scroll hint — only shown while there's more content past the edge */}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  );
});

CampaignStatsRow.displayName = "CampaignStatsRow";
export default CampaignStatsRow;
