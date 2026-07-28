import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { PageHeaderSkeleton } from "@/modules/settings/shared";

const SectionSkeleton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
    <div className="px-6 py-5 border-b border-gray-100">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3.5 w-52" />
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);

const INFO_ROWS = Array.from({ length: 2 });

const EmployeeSettingsSkeleton = memo(() => (
  <>
    <PageHeaderSkeleton />

    <div className="max-w-[720px]">
      <SectionSkeleton>
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-[20px] shrink-0" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3.5 w-40 mb-3" />
            <Skeleton className="h-8 w-28 rounded-[10px]" />
          </div>
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <Skeleton className="h-3.5 w-16 mb-1.5" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Skeleton className="h-14 w-24 rounded-xl shrink-0" />
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <div className="flex flex-col gap-4">
          <div>
            <Skeleton className="h-3.5 w-24 mb-1.5" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          {INFO_ROWS.map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-20 mb-1.5" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </SectionSkeleton>
    </div>
  </>
));
EmployeeSettingsSkeleton.displayName = "EmployeeSettingsSkeleton";

export default EmployeeSettingsSkeleton;
