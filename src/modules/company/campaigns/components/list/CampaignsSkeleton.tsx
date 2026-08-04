import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";

const CampaignsSkeleton = memo<{ count?: number }>(({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="gap-0 py-0 overflow-hidden">
        <div className="p-5 space-y-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <div className="flex gap-2 flex-wrap pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/40">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </Card>
    ))}
  </div>
));

CampaignsSkeleton.displayName = "CampaignsSkeleton";
export default CampaignsSkeleton;
