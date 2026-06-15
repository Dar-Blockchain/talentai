import React from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";

const DepartmentSkeletonCard: React.FC = () => (
  <div className="relative bg-white border border-gray-200 rounded-2xl flex flex-col h-full overflow-hidden">
    {/* Accent bar */}
    <Skeleton className="absolute left-0 top-0 bottom-0 w-1 h-full rounded-none" />

    {/* Body */}
    <div className="p-5 pl-6 flex-1 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl shrink-0" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>

    {/* Footer */}
    <div className="px-5 pl-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-14 rounded-lg" />
    </div>
  </div>
);

export default DepartmentSkeletonCard;
