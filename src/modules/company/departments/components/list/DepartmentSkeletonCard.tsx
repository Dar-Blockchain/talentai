import React from "react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";

const DepartmentSkeletonCard: React.FC = () => (
  <Card className="py-0 gap-0 h-full rounded-lg">
    <div className="p-4 flex items-center gap-3">
      <Skeleton className="size-4 rounded-sm shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="size-6 rounded" />
    </div>
  </Card>
);

export default DepartmentSkeletonCard;
