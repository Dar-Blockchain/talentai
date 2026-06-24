import React from "react";
import { Building2, MapPin, DollarSign, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateApplication, ApplicationStatus } from "../types/application.types";

// ─── Status badge classes ─────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, { badge: string; dot: string }> = {
  applied:             { badge: "bg-info/10 border-info/20 text-info",                               dot: "bg-info"           },
  pending:             { badge: "bg-warning/10 border-warning/20 text-warning",                      dot: "bg-warning"        },
  shortlisted:         { badge: "bg-green-50 border-green-200 text-green-700",                       dot: "bg-green-500"      },
  accepted:            { badge: "bg-primary-light border-primary-border text-primary-dark",          dot: "bg-primary-dark"   },
  rejected:            { badge: "bg-danger/10 border-danger/20 text-danger",                         dot: "bg-danger"         },
  withdrawn:           { badge: "bg-gray-100 border-gray-200 text-gray-500",                         dot: "bg-gray-400"       },
  interview_scheduled: { badge: "bg-secondary-light border-secondary-border text-secondary-dark",    dot: "bg-secondary-dark" },
  interview_completed: { badge: "bg-green-50 border-green-200 text-green-700",                       dot: "bg-green-500"      },
  viewed:              { badge: "bg-gray-50 border-gray-200 text-gray-500",                          dot: "bg-gray-400"       },
  visited:             { badge: "bg-gray-50 border-gray-200 text-gray-500",                          dot: "bg-gray-400"       },
};

const SCORE_CLASS: Record<string, string> = {
  high: "text-green-600",
  mid:  "text-primary-dark",
  low:  "text-warning",
  crit: "text-danger",
};

const scoreTier = (s: number) =>
  s >= 80 ? "high" : s >= 60 ? "mid" : s >= 40 ? "low" : "crit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

const fmtSalary = (s: any) => {
  if (!s?.min && !s?.max) return null;
  const c = s.currency || "$";
  const f = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n));
  if (s.min && s.max) return `${c}${f(s.min)} – ${c}${f(s.max)}`;
  return s.max ? `≤${c}${f(s.max)}` : `${c}${f(s.min)}+`;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  app: CandidateApplication;
  statusLabel: string;
  isLast: boolean;
  onClick: () => void;
  onWithdraw?: (id: string) => void;
}

const ApplicationCard: React.FC<Props> = ({ app, statusLabel, isLast, onClick, onWithdraw }) => {
  const jd          = app.post?.jobDetails || {};
  const company     = app.company || {};
  const rawStatus   = ((app.status || "applied") as ApplicationStatus).toLowerCase() as ApplicationStatus;
  const sc          = STATUS_CLASSES[rawStatus] ?? STATUS_CLASSES.applied;
  const matchScore  = app.matchScore != null ? Math.round(app.matchScore) : null;
  const appliedDate = fmtDate(app.appliedAt || app.createdAt);
  const salary      = fmtSalary(jd.salary);
  const canWithdraw = rawStatus === "visited" && !!onWithdraw;
  const logoUrl     = company.logo
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}`
    : undefined;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors group",
        !isLast && "border-b border-gray-100",
      )}
    >
      {/* Company logo */}
      <div className="size-11 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
        {logoUrl
          ? <img src={logoUrl} alt={company.companyName} className="size-full object-contain p-1.5" />
          : <Building2 className="size-5 text-gray-300" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Title + status */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-[0.88rem] font-bold text-gray-900 truncate leading-tight">
            {jd.title || "Untitled Position"}
          </p>
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.6rem] font-bold shrink-0",
            sc.badge,
          )}>
            <span className={cn("size-1.5 rounded-full shrink-0", sc.dot)} />
            {statusLabel}
          </span>
        </div>

        {/* Company + location */}
        <div className="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-1">
          {company.companyName && (
            <span className="font-medium text-gray-600 truncate">{company.companyName}</span>
          )}
          {company.companyName && jd.location && (
            <span className="size-1 rounded-full bg-gray-300 shrink-0" />
          )}
          {jd.location && (
            <span className="flex items-center gap-0.5 shrink-0">
              <MapPin className="size-2.5" />
              {jd.location}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {salary && (
            <span className="flex items-center gap-0.5 text-[0.7rem] text-gray-400">
              <DollarSign className="size-2.5" />{salary}
            </span>
          )}
          {matchScore !== null && (
            <span className={cn("flex items-center gap-0.5 text-[0.7rem] font-semibold", SCORE_CLASS[scoreTier(matchScore)])}>
              <TrendingUp className="size-2.5" />{matchScore}% match
            </span>
          )}
          {appliedDate && (
            <span className="flex items-center gap-0.5 text-[0.7rem] text-gray-400">
              <Clock className="size-2.5" />Applied {appliedDate}
            </span>
          )}
          {canWithdraw && (
            <button
              onClick={(e) => { e.stopPropagation(); onWithdraw!(app._id); }}
              className="ml-auto text-[0.65rem] font-bold text-danger px-1.5 py-0.5 rounded border border-danger/25 bg-danger/5 hover:bg-danger/10 transition-colors"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
