import React from "react";
import { useTranslation } from "react-i18next";
import { Brain, Code2, Users, TrendingUp, Star, BarChart2, Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import SkillInterviewCard from "@/modules/candidate/interviews/components/SkillInterviewCard";
import { useSkillAssessmentsQuery } from "@/modules/candidate/interviews/queries/useInterviewsQuery";
import type { SkillInterviewAssessment } from "@/modules/candidate/interviews/types/interview.types";
import SectionHeader from "./SectionHeader";

const SkillSkeleton = () => (
  <div className="rounded-xl border border-[#E8ECF2] bg-white p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Skeleton className="size-9 rounded-xl shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-1.5 w-full rounded-full" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  </div>
);

const scoreColor = (n: number) =>
  n >= 80 ? "text-green-600" : n >= 60 ? "text-primary-dark" : n >= 40 ? "text-warning" : "text-danger";

const scoreBg = (n: number) =>
  n >= 80 ? "bg-green-50 border-green-200" :
  n >= 60 ? "bg-primary-light border-primary-border" :
  n >= 40 ? "bg-warning/10 border-warning/20" : "bg-danger/10 border-danger/20";

const getSkillScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ??
  (a.interviewData?.finalReport?.coverage?.overall ?? 0);

interface Props {
  onStartInterview: () => void;
}

const SkillsSnapshot: React.FC<Props> = ({ onStartInterview }) => {
  const { t } = useTranslation("dashboard");
  const s     = (k: string) => t(`candidate.interviews.${k}`) as string;

  const { data: techData, isLoading: techLoading } = useSkillAssessmentsQuery("technical", 3);
  const { data: softData, isLoading: softLoading } = useSkillAssessmentsQuery("soft", 3);

  const techItems = techData?.results ?? [];
  const softItems = softData?.results ?? [];
  const loading   = techLoading || softLoading;
  const hasSkills = techItems.length > 0 || softItems.length > 0;

  const allScored = [...techItems, ...softItems].map(getSkillScore).filter(n => n > 0);
  const bestScore = allScored.length ? Math.max(...allScored) : 0;
  const avgScore  = allScored.length
    ? Math.round(allScored.reduce((a, b) => a + b, 0) / allScored.length)
    : 0;

  return (
    <div>
      <SectionHeader
        icon={Brain} iconClass="text-warning"
        title="Skills Snapshot" href="/candidate/skills"
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {Array.from({ length: 4 }).map((_, i) => <SkillSkeleton key={i} />)}
          </div>
        </div>
      ) : !hasSkills ? (

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
        <div className="space-y-4">

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-warning/20 bg-warning/6 py-3">
              <BarChart2 className="size-3.5 text-warning mb-0.5" />
              <span className="text-[1rem] font-extrabold text-warning leading-none">
                {techItems.length + softItems.length}
              </span>
              <span className="text-[0.6rem] font-medium text-warning/70">Tested</span>
            </div>
            <div className={cn("flex flex-col items-center gap-0.5 rounded-xl border py-3", bestScore > 0 ? scoreBg(bestScore) : "bg-gray-50 border-gray-200")}>
              <Star className={cn("size-3.5 mb-0.5", bestScore > 0 ? scoreColor(bestScore) : "text-gray-300")} />
              <span className={cn("text-[1rem] font-extrabold leading-none", bestScore > 0 ? scoreColor(bestScore) : "text-gray-300")}>
                {bestScore > 0 ? `${Math.round(bestScore)}%` : "—"}
              </span>
              <span className={cn("text-[0.6rem] font-medium", bestScore > 0 ? scoreColor(bestScore) : "text-gray-400")}>Best</span>
            </div>
            <div className={cn("flex flex-col items-center gap-0.5 rounded-xl border py-3", avgScore > 0 ? scoreBg(avgScore) : "bg-gray-50 border-gray-200")}>
              <TrendingUp className={cn("size-3.5 mb-0.5", avgScore > 0 ? scoreColor(avgScore) : "text-gray-300")} />
              <span className={cn("text-[1rem] font-extrabold leading-none", avgScore > 0 ? scoreColor(avgScore) : "text-gray-300")}>
                {avgScore > 0 ? `${avgScore}%` : "—"}
              </span>
              <span className={cn("text-[0.6rem] font-medium", avgScore > 0 ? scoreColor(avgScore) : "text-gray-400")}>Average</span>
            </div>
          </div>

          {techItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Code2 className="size-3 text-info" />
                <span className="text-[0.68rem] font-bold text-gray-400 uppercase tracking-wide">Technical</span>
                <span className="text-[0.6rem] font-bold bg-info/10 text-info border border-info/20 rounded-full px-1.5 py-0.5">
                  {techItems.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {techItems.slice(0, 2).map((a) => (
                  <SkillInterviewCard
                    key={a._id} assessment={a}
                    accentBg="bg-info/10" accentBorder="border-info/20" accentText="text-info"
                    icon={Code2} s={s}
                  />
                ))}
              </div>
            </div>
          )}

          {softItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="size-3 text-warning" />
                <span className="text-[0.68rem] font-bold text-gray-400 uppercase tracking-wide">Soft Skills</span>
                <span className="text-[0.6rem] font-bold bg-warning/10 text-warning border border-warning/20 rounded-full px-1.5 py-0.5">
                  {softItems.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {softItems.slice(0, 2).map((a) => (
                  <SkillInterviewCard
                    key={a._id} assessment={a}
                    accentBg="bg-warning/10" accentBorder="border-warning/20" accentText="text-warning"
                    icon={Users} s={s}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onStartInterview}
            className="w-full py-2.5 h-auto rounded-xl border-dashed border-warning/40 text-[0.72rem] font-bold text-warning hover:bg-warning/5 hover:border-warning/60"
          >
            <Plus className="size-3.5" />
            Take a new test
          </Button>

        </div>
      )}
    </div>
  );
};

export default SkillsSnapshot;
