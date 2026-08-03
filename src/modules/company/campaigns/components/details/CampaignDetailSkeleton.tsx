import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Separator } from "@/modules/shared/ui/shadcn/separator";

const DETAIL_ITEMS_4 = Array.from({ length: 4 });
const MODULE_ITEMS_2 = Array.from({ length: 2 });
const OVERVIEW_ROWS_6 = Array.from({ length: 6 });

const CampaignDetailSkeleton = memo(() => (
  <div className="flex flex-col gap-4">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
      <div>
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-[22px] w-[58px] rounded-full" />
          <Skeleton className="h-[22px] w-[72px] rounded-full" />
        </div>
        <Skeleton className="h-[34px] w-[280px]" />
        <Skeleton className="h-5 w-[420px] mt-1.5" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-[34px] w-[130px] rounded-lg" />
        <Skeleton className="h-[34px] w-[34px] rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
      <div className="flex flex-col gap-4">
        <Card className="p-5 gap-0">
          <Skeleton className="h-5 w-[140px] mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DETAIL_ITEMS_4.map((_, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <Skeleton className="size-4 rounded-full mt-0.5 shrink-0" />
                <div>
                  <Skeleton className="h-3.5 w-[70px] mb-1" />
                  <Skeleton className="h-[18px] w-[110px]" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 gap-0">
          <div className="flex items-center gap-2 mb-5">
            <Skeleton className="h-5 w-[160px]" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-3">
            {MODULE_ITEMS_2.map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-border bg-muted/30 items-start">
                <Skeleton className="size-9 rounded-lg shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-[18px] w-[100px]" />
                    <Skeleton className="h-[18px] w-[50px] rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3.5 w-20 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-5 gap-0">
          <Skeleton className="h-[18px] w-[120px] mb-3" />
          <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2">
            <Skeleton className="h-[18px] flex-1" />
            <Skeleton className="size-6 rounded-full shrink-0" />
          </div>
        </Card>

        <Card className="p-5 gap-0">
          <Skeleton className="h-[18px] w-20 mb-4" />
          <div className="flex flex-col">
            {OVERVIEW_ROWS_6.map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-20" />
                </div>
                {i < 5 && <Separator className="my-3" />}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
));
CampaignDetailSkeleton.displayName = "CampaignDetailSkeleton";

export default CampaignDetailSkeleton;
