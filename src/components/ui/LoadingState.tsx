import React from "react";

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
      <svg
        className="size-14 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color }}
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
        />
      </svg>
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
