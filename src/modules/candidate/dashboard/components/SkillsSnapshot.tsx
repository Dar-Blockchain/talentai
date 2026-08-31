import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Brain, Code2, Users, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { useSkillAssessmentsQuery } from "@/modules/candidate/interviews/queries/useInterviewsQuery";

const WIDGET_LIMIT = 5;

const getSkillScore = (a: any): number =>
  a.interviewData?.finalReport?.scores?.overall ??
  (a.interviewData?.finalReport?.coverage?.overall ?? 0);

const getLevelKey = (n: number) =>
  n >= 80 ? "expert" : n >= 60 ? "senior" : n >= 40 ? "mid" : n >= 20 ? "junior" : "entry";

const LEVEL_BADGE: Record<string, string> = {
  expert: "bg-green-50 border-green-200 text-green-700",
  senior: "bg-info/10 border-info/20 text-info",
  mid:    "bg-warning/10 border-warning/20 text-warning",
  junior: "bg-orange-50 border-orange-200 text-orange-600",
  entry:  "bg-gray-100 border-gray-200 text-gray-500",
};

const scoreColor = (n: number) =>
  n >= 80 ? "text-green-600" : n >= 60 ? "text-primary-dark" : n >= 40 ? "text-warning" : "text-danger";

const RowSkeleton = () => (
  <tr>
    <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Skeleton className="size-8 rounded-lg shrink-0" /><Skeleton className="h-3.5 w-28" /></div></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-5 w-14 rounded-full mx-auto" /></td>
    <td className="py-3 px-3 text-center"><Skeleton className="h-3.5 w-10 mx-auto" /></td>
    <td className="py-3 px-3 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
  </tr>
);

interface Props {
  onStartInterview: () => void;
}

const SkillsSnapshot: React.FC<Props> = ({ onStartInterview }) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();
  const s      = (k: string) => t(`candidate.interviews.${k}`) as string;

  const { data: techData, isLoading: techLoading } = useSkillAssessmentsQuery("technical", WIDGET_LIMIT);
  const { data: softData, isLoading: softLoading } = useSkillAssessmentsQuery("soft", WIDGET_LIMIT);

  const loading = techLoading || softLoading;

  // Tag each item with the category it was fetched under — the assessment's
  // own skillType field (backend enum 'technical'|'soft') is the source of
  // truth, but fall back to which query returned it in case it's ever unset.
  const items = [
    ...(techData?.results ?? []).map((a: any) => ({ ...a, skillType: a.skillType || "technical" })),
    ...(softData?.results  ?? []).map((a: any) => ({ ...a, skillType: a.skillType || "soft" })),
  ]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, WIDGET_LIMIT);

  const hasSkills = items.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-warning" />
          <span className="text-[0.88rem] font-extrabold text-gray-900">Skills Snapshot</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push("/candidate/skills")}
          className="p-0 h-auto text-[0.72rem] font-bold text-secondary-dark hover:bg-transparent hover:text-secondary-dark/80 shrink-0"
        >
          View all <ArrowRight className="size-3" />
        </Button>
      </div>

      {!loading && !hasSkills ? (
        <Card className="gap-0 py-0 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-info via-warning to-secondary-dark" />
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center px-6">
            <div className="size-14 rounded-2xl bg-warning/8 border border-warning/20 flex items-center justify-center">
              <Brain className="size-7 text-warning/60" />
            </div>
            <div>
              <p className="text-[0.88rem] font-bold text-gray-700">No skill assessments yet</p>
              <p className="text-[0.73rem] text-gray-400 mt-0.5">
                Prove your expertise and stand out to recruiters
              </p>
            </div>
            <Button size="sm" onClick={onStartInterview} className="mt-1 gap-1.5 text-[0.75rem]">
              <Zap className="size-3.5" />
              Start your first interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <Card className="gap-0 py-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px]">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left  py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Skill</th>
                    <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Level</th>
                    <th className="text-center py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Score</th>
                    <th className="text-right py-2.5 px-3 text-[0.6rem] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">Tested</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: WIDGET_LIMIT }).map((_, i) => <RowSkeleton key={i} />)
                  ) : (
                    items.map((a: any) => {
                      const score    = getSkillScore(a);
                      const levelKey = getLevelKey(score);
                      const isTech   = a.skillType === "technical";
                      const Icon     = isTech ? Code2 : Users;
                      const date     = a.updatedAt || a.createdAt;

                      return (
                        <tr
                          key={a._id}
                          onClick={() => router.push(`/candidate/skills/interviews/${a._id}`)}
                          className="cursor-pointer hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="py-2.5 px-3 border-b border-gray-50">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                <Icon className="size-3.5 text-gray-400" />
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
                            <span className={cn("text-[0.72rem] font-extrabold", scoreColor(score))}>
                              {score}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right border-b border-gray-50">
                            <span className="text-[0.7rem] text-gray-400 whitespace-nowrap">
                              {date ? dayjs(date).fromNow() : "—"}
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

          <Card className="gap-0 py-0 overflow-hidden border-warning/30 bg-warning/5 mt-3">
            <div className="h-0.5 bg-warning" />
            <CardContent className="px-4 py-3.5 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-warning/15 border border-warning/25 flex items-center justify-center shrink-0">
                <Zap className="size-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.85rem] font-extrabold text-gray-900">
                  Ready to test another skill?
                </p>
                <p className="text-[0.72rem] text-gray-500 mt-0.5 truncate">
                  Add a new assessment to strengthen your profile
                </p>
              </div>
              <Button
                size="sm"
                variant="warning"
                onClick={onStartInterview}
                className="gap-1.5 shrink-0"
              >
                Start now
                <ArrowRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SkillsSnapshot;
