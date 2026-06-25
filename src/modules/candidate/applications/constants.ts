import type { ApplicationStatus } from "./types/application.types";

export const STATUS_CLASSES: Record<ApplicationStatus, { badge: string; dot: string; stripe: string }> = {
  visited:             { badge: "bg-gray-50 border-gray-200 text-gray-500",                       dot: "bg-gray-400",       stripe: "bg-gray-200"       },
  interview_completed: { badge: "bg-green-50 border-green-200 text-green-700",                    dot: "bg-green-500",      stripe: "bg-green-500"      },
  withdrawn:           { badge: "bg-gray-100 border-gray-200 text-gray-500",                      dot: "bg-gray-400",       stripe: "bg-gray-300"       },
};

export const SCORE_CLASSES: Record<string, string> = {
  high: "text-green-600",
  mid:  "text-primary-dark",
  low:  "text-warning",
  crit: "text-danger",
};
