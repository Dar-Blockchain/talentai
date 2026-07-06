import React from "react";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading your dashboard...",
  color = "#8310FF",
}) => (
  <div
    className="min-h-screen flex items-center justify-center"
    role="main"
    aria-label="Loading dashboard"
  >
    <div className="flex flex-col items-center gap-4">
      <Spinner className="size-14" style={{ color }} aria-label="Loading" />
      <p
        className="text-base font-semibold"
        style={{ color }}
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  </div>
);

export default LoadingState;
