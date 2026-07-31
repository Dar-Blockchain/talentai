import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";

const PageHeaderSkeleton = memo(() => (
  <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 shrink-0 rounded-xl" />
      <div>
        <Skeleton className="h-3 w-[140px] mb-2" />
        <Skeleton className="h-[22px] w-[160px] mb-1.5" />
        <Skeleton className="h-4 w-[220px]" />
      </div>
    </div>
    <Skeleton className="h-9 w-[130px] rounded-lg shrink-0" />
  </div>
));
PageHeaderSkeleton.displayName = "PageHeaderSkeleton";

export default PageHeaderSkeleton;
