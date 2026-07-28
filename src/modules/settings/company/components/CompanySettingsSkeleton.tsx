import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { PageHeaderSkeleton } from "@/modules/settings/shared";

const STAT_CARDS = Array.from({ length: 4 });
const TABS = Array.from({ length: 4 });
const FORM_FIELDS = Array.from({ length: 6 });

const CompanySettingsSkeleton = memo(() => (
  <>
    <PageHeaderSkeleton />

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {STAT_CARDS.map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1.5" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Profile banner */}
      <div className="bg-[#FAFAFA] border-b border-gray-200 px-6 md:px-10 py-6">
        <div className="flex items-center gap-5 flex-wrap">
          <Skeleton className="w-[72px] h-[72px] rounded-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-[22px] w-[180px] mb-2" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[90px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-[110px] rounded-[9px] shrink-0" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 px-6 flex gap-4 py-3">
        {TABS.map((_, i) => (
          <Skeleton key={i} className="h-5 w-20" />
        ))}
      </div>

      {/* Tab content — form grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FORM_FIELDS.map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3.5 w-20 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </>
));
CompanySettingsSkeleton.displayName = "CompanySettingsSkeleton";

export default CompanySettingsSkeleton;
