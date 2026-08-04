import React, { memo } from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";

const NAV_ITEMS = Array.from({ length: 5 });
const FORM_FIELDS = Array.from({ length: 6 });

const CandidateSettingsSkeleton = memo(() => (
  <>
    {/* Mobile top bar */}
    <div className="md:hidden flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3.5 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="size-8 rounded-lg shrink-0" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5 items-start">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <Skeleton className="h-14 w-full rounded-none" />
          <div className="px-4 pb-4">
            <Skeleton className="size-[52px] rounded-full -mt-6 mb-2 border-2 border-card" />
            <Skeleton className="h-4 w-28 mb-1.5" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-2.5 shadow-sm flex flex-col gap-1.5">
          {NAV_ITEMS.map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-border flex items-center gap-4">
          <Skeleton className="size-16 rounded-full shrink-0" />
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FORM_FIELDS.map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3.5 w-20 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
));
CandidateSettingsSkeleton.displayName = "CandidateSettingsSkeleton";

export default CandidateSettingsSkeleton;
