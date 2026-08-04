import React from "react";

export interface EmptyStateProps {
  /** Icon element rendered in the circle */
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Optional action button / link */
  action?: React.ReactNode;
  /** Controls overall height. Defaults to "auto". */
  minHeight?: string | number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  minHeight = 260,
}) => (
  <div
    className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4"
    style={{ minHeight }}
  >
    {/* Icon circle */}
    <div className="flex size-[72px] items-center justify-center rounded-full bg-gray-100 text-gray-400 [&_svg]:size-9">
      {icon}
    </div>

    <div>
      <p className="mb-1 text-[1.0625rem] font-bold text-gray-700">
        {title}
      </p>
      {description && (
        <p className="max-w-[340px] text-sm text-gray-400">{description}</p>
      )}
    </div>

    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
