import React from "react";

const Block: React.FC<{ className: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 ${className}`} />
);

const PlanCardSkeleton: React.FC = () => (
  <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6">
    <Block className="mb-2 h-5 w-2/3 rounded" />
    <Block className="mb-5 h-3 w-full rounded" />

    <Block className="mb-5 h-9 w-24 rounded" />

    <div className="mb-4 h-px w-full bg-gray-100" />

    <div className="mb-5 flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <Block className="h-6 w-6 flex-shrink-0 rounded-md" />
        <Block className="h-3 flex-1 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <Block className="h-6 w-6 flex-shrink-0 rounded-md" />
        <Block className="h-3 w-3/4 rounded" />
      </div>
    </div>

    <Block className="h-10 w-full rounded-md" />
  </div>
);

export default PlanCardSkeleton;
