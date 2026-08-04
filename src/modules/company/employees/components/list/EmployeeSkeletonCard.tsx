import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";

const EmployeeSkeletonCard: React.FC = memo(() => (
  <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#E8EAED] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
    <Skeleton className="h-1 rounded-none" />

    <div className="flex flex-col items-center gap-1.5 px-2.5 pt-2.5 pb-2">
      <Skeleton className="size-[76px] rounded-full" />
      <div className="w-full text-center">
        <Skeleton className="mx-auto h-[18px] w-[55%]" />
        <Skeleton className="mx-auto mt-1 h-[13px] w-[70%]" />
      </div>
      <Skeleton className="h-6 w-[90px] rounded-full" />
    </div>

    <div className="mx-2.5 h-px bg-[#F1F5F9]" />

    <div className="flex flex-col gap-1.5 px-2.5 pt-[14px] pb-2">
      <Skeleton className="h-[34px] w-full rounded-[10px]" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[60px] rounded-full" />
        <Skeleton className="h-[13px] w-[72px]" />
      </div>
    </div>
  </div>
));

EmployeeSkeletonCard.displayName = "EmployeeSkeletonCard";
export default EmployeeSkeletonCard;
