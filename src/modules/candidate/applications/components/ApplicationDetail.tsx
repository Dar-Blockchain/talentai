import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Calendar,
  Clock,
  Link2,
  VideoIcon,
  Building2,
  FileText,
  CheckSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDate, fmtSalary, scoreTier } from "@/utils/functions";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { STATUS_CLASSES, SCORE_CLASSES } from "../constants";
import type { ApplicationStatus } from "../types/application.types";
import {
  useApplicationDetailQuery,
  useWithdrawMutation,
} from "../queries/useApplicationsQuery";
import WithdrawDialog from "./WithdrawDialog";
import { emitToast } from "@/utils/toastEmitter";

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusLabel = (t: (k: string) => string, st: string) => {
  const key = `candidate.my_applications.status.${st}`;
  const res = t(key);
  return res === key ? st : res;
};

// ─── Loading skeleton ──────────────────────────────────────────────────────────

const DetailSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="h-1 bg-gray-100" />
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="size-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
    <Card className="py-0 gap-0">
      <CardContent className="p-5 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  </div>
);

// ─── Section wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <Card className="gap-0 py-0 overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-3.5 text-gray-400" />
        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </span>
      </div>
      {children}
    </CardContent>
  </Card>
);

// ─── Score ring ────────────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const tier = scoreTier(score);
  const cls = SCORE_CLASSES[tier];
  const r = 34;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(score, 100) / 100) * circ;

  const stroke =
    tier === "high"
      ? "#059669"
      : tier === "mid"
        ? "var(--color-primary-dark)"
        : tier === "low"
          ? "var(--color-warning)"
          : "var(--color-danger)";

  return (
    <div className="relative size-20 shrink-0">
      <svg width={80} height={80} className="-rotate-90">
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={`${stroke}20`}
          strokeWidth={7}
        />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={7}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[1.1rem] font-black leading-none", cls)}>
          {score}%
        </span>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  id: string;
}

const ApplicationDetail: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) =>
    t(`candidate.application_detail.${k}`, opts) as string;
  const router = useRouter();

  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: app, isLoading } = useApplicationDetailQuery(id);
  const { mutateAsync: withdraw, isPending: withdrawing } =
    useWithdrawMutation();

  const handleWithdraw = async () => {
    try {
      await withdraw(id);
      emitToast({
        message: "Application withdrawn successfully.",
        severity: "success",
      });
    } catch {
      emitToast({ message: "Failed to withdraw.", severity: "error" });
    } finally {
      setWithdrawOpen(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const post = app?.post || {};
  const jd = post.jobDetails || {};
  const company = app?.company || {};
  const title = jd.title || "—";
  const location = jd.location || "";
  const employmentType = jd.employmentType || "";
  const workMode = jd.workMode || "";
  const description = jd.description || "";
  const requirements = jd.requirements || [];
  const salary = fmtSalary(jd.salary);
  const rawStatus = (app?.status || "visited") as ApplicationStatus;
  const sc = STATUS_CLASSES[rawStatus] ?? STATUS_CLASSES.visited;
  const isScheduled = rawStatus === ("interview_scheduled" as any);
  const score = app?.matchScore ?? app?.cvAnalysis?.analysisScore ?? null;
  const appliedDate = fmtDate(app?.appliedAt || app?.createdAt);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {app && rawStatus === "visited" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWithdrawOpen(true)}
            className="shrink-0 text-danger border-danger/30 hover:bg-danger/5 text-[0.72rem] font-bold"
          >
            Withdraw
          </Button>
        )}
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : !app ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
              <AlertCircle className="size-5 text-gray-300" />
            </div>
            <p className="text-[0.88rem] font-semibold text-gray-400">
              {s("not_found")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {/* ── Interview banner ── */}
          {isScheduled && (
            <Card className="gap-0 py-0 overflow-hidden bg-primary-dark border-primary-dark">
              <CardContent className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-2">
                  <VideoIcon className="size-5 text-white" />
                  <span className="font-bold text-white text-[0.95rem]">
                    {s("interview_banner.title")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 ml-auto">
                  {app.interviewDate && (
                    <span className="flex items-center gap-1.5 text-[0.82rem] text-white/90 font-semibold">
                      <Calendar className="size-3.5 text-white/60" />
                      {app.interviewDate}
                    </span>
                  )}
                  {app.interviewTime && (
                    <span className="flex items-center gap-1.5 text-[0.82rem] text-white/90 font-semibold">
                      <Clock className="size-3.5 text-white/60" />
                      {app.interviewTime}
                    </span>
                  )}
                  {app.interviewLink && (
                    <Button
                      size="sm"
                      onClick={() => window.open(app.interviewLink, "_blank")}
                      className="bg-white text-primary-dark hover:bg-white/90 gap-1.5 text-[0.75rem] font-bold"
                    >
                      <Link2 className="size-3.5" />
                      {s("interview_banner.join")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Job header card ── */}
          <Card className="gap-0 py-0 overflow-hidden">
            <div className={cn("h-1", sc.stripe)} />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {company.logo ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}`}
                      className="size-10 object-contain rounded-lg"
                      alt=""
                    />
                  ) : (
                    <Building2 className="size-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-[1.1rem] font-extrabold text-gray-900 leading-tight">
                      {title}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 text-[0.63rem] font-bold border",
                        sc.badge,
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full mr-1", sc.dot)}
                      />
                      {statusLabel(t, rawStatus)}
                    </Badge>
                  </div>
                  {company.companyName && (
                    <p className="text-[0.78rem] font-semibold text-gray-500 mb-2">
                      {company.companyName}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {location && (
                      <span className="flex items-center gap-1 text-[0.75rem] text-gray-400">
                        <MapPin className="size-3" />
                        {location}
                      </span>
                    )}
                    {employmentType && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[0.65rem] font-semibold text-gray-500">
                        {employmentType}
                      </span>
                    )}
                    {workMode && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[0.65rem] font-semibold text-gray-500">
                        {workMode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(salary || appliedDate !== "—") && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap items-center gap-4 text-[0.75rem] text-gray-500">
                    {salary && (
                      <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                        <Building2 className="size-3.5 text-gray-400" />
                        {salary}
                      </span>
                    )}
                    {appliedDate !== "—" && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-gray-400" />
                        {s("applied_on", { date: appliedDate })}
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Match score ── */}
          {score != null && (
            <Section icon={TrendingUp} title={s("cv_match_score.title")}>
              <div className="flex items-center gap-5">
                <ScoreRing score={score} />
                <div>
                  <p className="text-[0.95rem] font-bold text-gray-800">
                    {score >= 70
                      ? s("cv_match_score.strong")
                      : score >= 50
                        ? s("cv_match_score.good")
                        : s("cv_match_score.low")}
                  </p>
                  <p className="text-[0.8rem] text-gray-400 mt-0.5">
                    {s("cv_match_score.subtitle", { score })}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* ── Job description ── */}
          {description && (
            <Section icon={FileText} title={s("job_description")}>
              <p className="text-[0.85rem] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </Section>
          )}

          {/* ── Requirements ── */}
          {requirements.length > 0 && (
            <Section icon={CheckSquare} title={s("requirements")}>
              <ul className="space-y-1.5 pl-1">
                {requirements.map((r: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[0.85rem] text-gray-600 leading-relaxed"
                  >
                    <span className="mt-2 size-1.5 rounded-full bg-gray-300 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      <WithdrawDialog
        open={withdrawOpen}
        loading={withdrawing}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />
    </>
  );
};

export default ApplicationDetail;
