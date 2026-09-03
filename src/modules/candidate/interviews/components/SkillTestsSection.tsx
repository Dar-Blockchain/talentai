import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Code2, MessageCircle, Brain, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { useSkillAssessmentsQuery } from "../queries/useInterviewsQuery";
import type { SkillInterviewAssessment } from "../types/interview.types";

type TypeFilter  = "all" | "technical" | "soft";
type LevelFilter = "all" | "entry" | "junior" | "mid" | "senior" | "expert";
type SkillSort   = "recent" | "score_high" | "score_low";

const getScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ??
  (a.interviewData?.finalReport?.coverage?.overall as number | undefined) ??
  0;

const getLevelKey = (n: number) =>
  n >= 80 ? "expert" : n >= 60 ? "senior" : n >= 40 ? "mid" : n >= 20 ? "junior" : "entry";

const LEVEL_BADGE: Record<string, string> = {
  expert: "bg-gray-800 border-gray-800 text-white",
  senior: "bg-gray-200 border-gray-300 text-gray-700",
  mid:    "bg-gray-100 border-gray-300 text-gray-600",
  junior: "bg-gray-100 border-gray-200 text-gray-500",
  entry:  "bg-gray-50  border-gray-200 text-gray-400",
};

const scoreColor = (n: number) =>
  n >= 80 ? "text-gray-900" : n >= 60 ? "text-gray-700" : n >= 40 ? "text-gray-600" : "text-gray-500";

const RowSkeleton = () => (
  <tr>
    <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Skeleton className="size-8 rounded-lg shrink-0" /><Skeleton className="h-3.5 w-28" /></div></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-5 w-14 rounded-full mx-auto" /></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-3.5 w-10 mx-auto" /></td>
    <td className="py-3 px-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
  </tr>
);

const SkillTestsSection: React.FC = () => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const { data: techData, isLoading: techLoading } = useSkillAssessmentsQuery("technical");
  const { data: softData, isLoading: softLoading } = useSkillAssessmentsQuery("soft");

  const loading = techLoading || softLoading;
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [search,      setSearch]      = useState("");
  const [sort,        setSort]        = useState<SkillSort>("recent");

  const allItems = useMemo(() => [
    ...(techData?.results ?? []).map((a: any) => ({ ...a, skillType: a.skillType || "technical" })),
    ...(softData?.results ?? []).map((a: any) => ({ ...a, skillType: a.skillType || "soft" })),
  ], [techData, softData]);

  const hasItems = allItems.length > 0;

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const ts = (a: any) => new Date(a.updatedAt || a.createdAt || 0).getTime();
    return allItems
      .filter((a: any) => {
        if (typeFilter !== "all" && a.skillType !== typeFilter) return false;
        if (levelFilter !== "all" && getLevelKey(getScore(a)) !== levelFilter) return false;
        if (q && !(a.skill ?? "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (sort === "recent") return ts(b) - ts(a);
        return sort === "score_high" ? getScore(b) - getScore(a) : getScore(a) - getScore(b);
      });
  }, [allItems, typeFilter, levelFilter, search, sort]);

  if (!loading && !hasItems) {
    return (
      <Card className="py-12">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="size-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Brain className="size-4 text-gray-300" />
          </div>
          <p className="text-[0.82rem] font-semibold text-gray-400">{s("empty_technical")}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={s("search_skill")}
            className="pl-8 h-8 text-[0.75rem] border-gray-200 focus-visible:ring-gray-300/50 focus-visible:border-gray-400 rounded-lg"
          />
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 shrink-0">
          {(["all", "technical", "soft"] as TypeFilter[]).map((f) => {
            const Icon = f === "technical" ? Code2 : f === "soft" ? MessageCircle : null;
            return (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={cn(
                  "flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold px-2.5 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
                  typeFilter === f ? "bg-card shadow-sm text-gray-800" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {Icon && <Icon className="size-3" />}
                {f === "all" ? s("filter_all") : f === "technical" ? s("technical") : s("soft_skills")}
              </button>
            );
          })}
        </div>

        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LevelFilter)}>
          <SelectTrigger className="h-8 w-[110px] shrink-0 text-[0.72rem] border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[0.75rem]">{s("level_all")}</SelectItem>
            {(["entry", "junior", "mid", "senior", "expert"] as const).map((lv) => (
              <SelectItem key={lv} value={lv} className="text-[0.75rem]">{s(`levels.${lv}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SkillSort)}>
          <SelectTrigger className="h-8 w-[124px] shrink-0 text-[0.72rem] border-gray-200 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent"     className="text-[0.75rem]">{s("sort_recent")}</SelectItem>
            <SelectItem value="score_high" className="text-[0.75rem]">{s("sort_score_high")}</SelectItem>
            <SelectItem value="score_low"  className="text-[0.75rem]">{s("sort_score_low")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

    <Card className="gap-0 py-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[380px]">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left  py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_skill")}</th>
              <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_level")}</th>
              <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("score")}</th>
              <th className="text-right py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">{s("table_tested")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-[0.78rem] text-gray-400">
                  {s("no_filter_results")}
                </td>
              </tr>
            ) : (
              items.map((a: any) => {
                const score    = getScore(a);
                const levelKey = getLevelKey(score);
                const isTech   = a.skillType === "technical";
                const Icon     = isTech ? Code2 : MessageCircle;
                const date     = a.updatedAt || a.createdAt;
                // getScore always resolves to a real number (falls back to 0),
                // so a genuine 0% completed assessment is indistinguishable
                // from "no report" if keyed off the score alone -- use the
                // explicit status field instead (defaults to "completed";
                // only "interrupted" for a disconnected/abandoned session).
                const isInterrupted = a.interviewData?.status === "interrupted";
                const hasReport = !isInterrupted;

                return (
                  <tr
                    key={a._id}
                    onClick={hasReport ? () => router.push(`/candidate/skills/interviews/${a._id}`) : undefined}
                    className={cn("transition-colors", hasReport && "cursor-pointer hover:bg-gray-50/80")}
                  >
                    <td className="py-2.5 px-3 border-b border-gray-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                          <Icon className="size-3.5 text-gray-500" />
                        </div>
                        <p className="text-[0.78rem] font-bold text-gray-900 truncate leading-tight">
                          {a.skill || s("skill_assessment")}
                        </p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center border-b border-gray-50">
                      <span className={cn("text-[0.6rem] font-bold rounded-full px-2 py-0.5 border whitespace-nowrap", LEVEL_BADGE[levelKey])}>
                        {s(`levels.${levelKey}`)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center border-b border-gray-50">
                      {isInterrupted ? (
                        <span className="text-[0.62rem] font-semibold text-gray-400" title={s("interrupted_tooltip")}>
                          {s("interrupted")}
                        </span>
                      ) : (
                        <span className={cn("text-[0.72rem] font-extrabold", scoreColor(score))}>{score}%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right border-b border-gray-50">
                      <span className="text-[0.7rem] text-gray-400 whitespace-nowrap">
                        {date ? dayjs(date).fromNow() : s("just_added")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
    </div>
  );
};

export default SkillTestsSection;
