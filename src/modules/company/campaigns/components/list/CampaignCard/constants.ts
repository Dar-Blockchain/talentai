import { Play, Pause, Square } from "lucide-react";
import { CampaignStatus, ParticipantStatus } from "@/modules/company/campaigns/types/campaign";

export const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: Play,
  PAUSED: Pause,
  CLOSED: Square,
};

export const STATUS_BADGE: Record<string, { badge: string; dot: string }> = {
  DRAFT:   { badge: "bg-slate-100 text-slate-600 border border-slate-200",        dot: "bg-slate-400"   },
  ACTIVE:  { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",  dot: "bg-emerald-500" },
  PAUSED:  { badge: "bg-amber-100 text-amber-700 border border-amber-200",        dot: "bg-amber-500"   },
  CLOSED:  { badge: "bg-blue-100 text-blue-700 border border-blue-200",           dot: "bg-blue-600"    },
  EXPIRED: { badge: "bg-red-100 text-red-700 border border-red-200",              dot: "bg-red-500"     },
};

export const PARTICIPANT_STATUS_BADGE: Record<ParticipantStatus, { badge: string; dot: string }> = {
  INVITED:     { badge: "bg-cyan-100 text-cyan-700 border border-cyan-200",          dot: "bg-cyan-500"    },
  IN_PROGRESS: { badge: "bg-amber-100 text-amber-700 border border-amber-200",       dot: "bg-amber-500"   },
  COMPLETED:   { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  DROPPED:     { badge: "bg-red-100 text-red-700 border border-red-200",             dot: "bg-red-500"     },
};

export function scoreColor(s: number) {
  return s >= 80 ? "#10B981" : s >= 60 ? "#0D9488" : s >= 40 ? "#F59E0B" : "#F43F5E";
}
