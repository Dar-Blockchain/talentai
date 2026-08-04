"use client";

import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";

// Mirrors CampaignStatsRow's layout: a single flex row where cards stretch
// to fill the width when everything fits, and shrink down to min-w before
// the row overflows and scrolls — at every breakpoint, never wrapping.
const StatsSkeleton = memo<{ count?: number }>(({ count = 4 }) => (
  <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="py-0 gap-0 flex-1 min-w-[136px]">
        <CardContent className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));

StatsSkeleton.displayName = "StatsSkeleton";
export default StatsSkeleton;
