"use client";
import React, { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Users as PeopleOutlined, Star as StarOutlined, Trophy as TrophyOutlined, UserSearch as UserSearchOutlined, Briefcase as WorkOutlined } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/modules/shared/ui/shadcn/select";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { T } from "../utils/kpiTokens";
import { useKpiSourcingQuery, useKpiPostsQuery } from "../queries";
import type { SourcingCandidate } from "../types";
import { cn } from "@/lib/utils";

const MEDAL_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#FEF3C7", color: "#B45309" },
  2: { bg: "#F1F5F9", color: "#64748B" },
  3: { bg: "#FFEDD5", color: "#C2410C" },
};

const RowSkeleton = () => (
  <div className="flex items-center gap-3 py-3">
    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <Skeleton className="h-8 w-14 rounded-lg shrink-0" />
    <Skeleton className="h-6 w-20 rounded-full shrink-0" />
  </div>
);

const CandidateRow = memo<{ c: SourcingCandidate; shortlistedLabel: string; cvMatchLabel: string; interviewScoreLabel: string; isLast: boolean }>(
  ({ c, shortlistedLabel, cvMatchLabel, interviewScoreLabel, isLast }) => {
    const isShort = c.status === "shortlisted";
    const medal   = MEDAL_COLORS[c.rank];
    const initials = `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase();

    return (
      <Link
        href={`/company/applications/${c.applicationId}/assessment`}
        className={cn("flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors rounded-lg px-2 -mx-2", !isLast && "border-b border-slate-100")}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px]"
          style={{ background: medal?.bg ?? "#F8FAFC", color: medal?.color ?? "#94A3B8" }}
        >
          {medal ? <TrophyOutlined size={13} /> : c.rank}
        </div>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[12px]"
          style={{ background: `${T}14`, color: T }}
        >
          {initials || <PeopleOutlined size={15} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-slate-900 truncate">{c.firstName} {c.lastName}</div>
          <div className="text-[11.5px] text-slate-400 truncate">{c.postTitle}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {c.score !== null && (
            <div className="flex flex-col items-end leading-tight" title={interviewScoreLabel}>
              <span className="inline-flex items-center gap-1 font-bold text-[13px]" style={{ color: T }}>
                <StarOutlined size={12} color="#F59E0B" />
                {c.score}%
              </span>
              <span className="text-[9.5px] text-slate-400">{interviewScoreLabel}</span>
            </div>
          )}
          {c.matchScore !== null && (
            <div className="flex flex-col items-end leading-tight" title={cvMatchLabel}>
              <span className="inline-flex items-center gap-1 font-bold text-[13px]" style={{ color: "#64748B" }}>
                {c.matchScore}%
              </span>
              <span className="text-[9.5px] text-slate-400">{cvMatchLabel}</span>
            </div>
          )}
          {isShort && (
            <span
              className="font-semibold text-[10.5px] px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{ background: `${T}12`, color: T }}
            >
              {shortlistedLabel}
            </span>
          )}
        </div>
      </Link>
    );
  },
);
CandidateRow.displayName = "CandidateRow";

const KpiCandidateQuality = memo(() => {
  const { t } = useTranslation("dashboard");

  const [postId, setPostId] = useState<string>("");
  const handlePost = useCallback(
    (val: string) => setPostId(val === "__all__" ? "" : val),
    [],
  );

  const postsQ    = useKpiPostsQuery();
  const sourcingQ = useKpiSourcingQuery(postId ? { postId } : {});

  const data    = sourcingQ.data;
  const loading = sourcingQ.isLoading;

  const top10           = data?.top10  ?? [];
  const shortlisted     = t("pages.kpi.shortlisted_chip");
  const cvMatch         = t("pages.kpi.cv_match");
  const interviewScore  = t("pages.kpi.interview_score_label", "Interview score");

  const jobFilter = (
    <Select value={postId || "__all__"} onValueChange={handlePost}>
      <SelectTrigger size="sm" className="h-7 min-w-36 max-w-52 rounded-lg border-slate-200 bg-slate-50 hover:bg-white transition-colors text-[12px]">
        <WorkOutlined size={12} color="#94A3B8" className="shrink-0" />
        <SelectValue placeholder={t("pages.kpi.all_posts", "All job posts")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">
          <span className="font-medium">{t("pages.kpi.all_posts", "All job posts")}</span>
        </SelectItem>
        {(postsQ.data ?? []).map((p) => (
          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <KpiCard title={t("pages.kpi.top10_title")} subtitle={t("pages.kpi.top10_subtitle")} headerFilter={jobFilter} className="flex-1">
        {loading ? (
          [0, 1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)
        ) : top10.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FEF3C7" }}>
              <UserSearchOutlined size={22} color="#D97706" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-slate-600">{t("pages.kpi.top10_empty", "No completed interviews yet")}</div>
              <div className="text-[11.5px] text-slate-400 mt-0.5">{t("pages.kpi.top10_empty_sub", "Top-scoring candidates will show up here once interviews are completed")}</div>
            </div>
          </div>
        ) : (
          top10.map((c, idx) => (
            <CandidateRow
              key={c.rank}
              c={c}
              shortlistedLabel={shortlisted}
              cvMatchLabel={cvMatch}
              interviewScoreLabel={interviewScore}
              isLast={idx === top10.length - 1}
            />
          ))
        )}
      </KpiCard>
    </>
  );
});
KpiCandidateQuality.displayName = "KpiCandidateQuality";
export default KpiCandidateQuality;
