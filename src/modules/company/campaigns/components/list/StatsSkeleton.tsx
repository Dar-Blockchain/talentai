"use client";

import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";

const StatsSkeleton = memo<{ count?: number }>(({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="py-0 gap-0">
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
