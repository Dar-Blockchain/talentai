import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import dayjs from "@/lib/dayjs";
import {
  Building2 as BusinessOutlined,
  Clock as AccessTimeOutlined,
  CheckCircle2 as CheckCircleOutlined,
  Hourglass as HourglassEmptyOutlined,
  Play as PlayArrowOutlined,
  ExternalLink as OpenInNewOutlined,
} from "lucide-react";

export interface PostAssessmentStep {
  _id?: string;
  status?: string;
  stepId?: {
    _id?: string;
    id?: string;
    order?: number;
    data?: {
      label?: string;
      type?: string;
      config?: { title?: string; description?: string; interviewType?: string };
    };
  };
}

export interface PostAssessmentStepProgress {
  currentStep?: { _id?: string };
  steps?: PostAssessmentStep[];
}

export interface PostAssessment {
  _id: string;
  candidate?: string | { _id: string; username?: string; email?: string };
  company?: { _id: string; username?: string; email?: string; role?: string; companyName?: string; logo?: string };
  post?: {
    _id: string;
    jobDetails?: { title?: string; description?: string };
    skillAnalysis?: {
      requiredSkills?: { _id?: string; name: string; category?: string; level?: string; importance?: string }[];
      softSkills?: { _id?: string; name: string; level?: string }[];
    };
    user?: { companyName?: string };
    status?: string;
  };
  skillType?: string;
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      scores?: { overall?: number };
      coverage?: { overall?: number; areas?: Record<string, unknown> };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: { strongestAreas?: string[]; weakestAreas?: string[]; recommendedFocus?: string[] };
    };
    analytics?: { duration?: number; messageCount?: number; completedAreas?: number; totalAreas?: number; coveragePercentage?: number };
  };
  candidatePostStepProgress?: PostAssessmentStepProgress;
  createdAt: string;
  updatedAt?: string;
  assessmentsCount?: number;
}

interface AssessmentCardProps {
  assessment: PostAssessment;
  onViewDetails: (assessmentId: string) => void;
  onContinueTest: (assessment: PostAssessment) => void;
  quota?: number;
}

export const getScore = (a: PostAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? a.interviewData?.analytics?.coveragePercentage ?? 0;

export const hasPendingSteps = (a: PostAssessment): boolean =>
  a.candidatePostStepProgress?.steps?.some((s) => s.status === "pending" || s.status === "inProgress") ?? false;

export const allStepsCompleted = (a: PostAssessment): boolean => {
  const steps = a.candidatePostStepProgress?.steps;
  if (!steps?.length) return getScore(a) >= 50;
  return steps.every((s) => s.status === "done" || s.status === "passed");
};

export const isCompleted = (a: PostAssessment): boolean =>
  a.candidatePostStepProgress?.steps?.length > 0 ? allStepsCompleted(a) : getScore(a) >= 50;

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onViewDetails, onContinueTest, quota = 0 }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const score      = getScore(assessment);
  const completed  = isCompleted(assessment);
  const pending    = hasPendingSteps(assessment);
  const quotaFull  = quota >= 5;

  const jobTitle    = assessment.post?.jobDetails?.title || s("job_application");
  const company     = assessment.company;
  const companyName = company?.companyName || company?.username || assessment.post?.user?.companyName || "";
  const logoUrl     = company?.logo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}` : undefined;

  const timeAgo = (assessment.updatedAt || assessment.createdAt)
    ? dayjs(assessment.updatedAt || assessment.createdAt).fromNow()
    : "";

  const scoreColor  = score > 0 ? getScoreColor(score) : "#E5E7EB";
  const statusColor = completed ? "#059669" : "#D97706";
  const progressPct = Math.min(Math.max(score, 0), 100);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-2xl bg-white overflow-hidden transition-all duration-200 border hover:-translate-y-px",
          completed
            ? "border-[#A7F3D0] hover:shadow-[0_8px_24px_#05966918]"
            : "border-[#FDE68A] hover:shadow-[0_8px_24px_#D9770618]",
        )}
      >
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${statusColor}, ${statusColor}70)` }} />

        <div className="p-4 flex items-center gap-4">
          <Avatar
            className="w-12 h-12 rounded-xl shrink-0"
            style={{ backgroundColor: completed ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}` }}
          >
            <AvatarImage src={logoUrl} className="object-contain p-1" />
            <AvatarFallback className="rounded-xl bg-transparent">
              <BusinessOutlined size={22} color={statusColor} />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-extrabold text-[0.9rem] text-[#111827] overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]">
                {jobTitle}
              </p>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: completed ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}` }}
              >
                {completed
                  ? <CheckCircleOutlined size={11} color="#059669" />
                  : <HourglassEmptyOutlined size={11} color="#D97706" />}
                <span className="text-[0.62rem] font-bold" style={{ color: statusColor }}>
                  {completed ? s("completed") : s("ongoing")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              {companyName && (
                <div className="flex items-center gap-1">
                  <BusinessOutlined size={11} color="#9CA3AF" />
                  <span className="text-[0.7rem] text-[#6B7280] font-medium">{companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <AccessTimeOutlined size={11} color="#9CA3AF" />
                <span className="text-[0.7rem] text-[#9CA3AF]">{timeAgo}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[0.62rem] text-[#9CA3AF]">{s("progress")}</span>
                {score > 0 && <span className="text-[0.68rem] font-extrabold" style={{ color: scoreColor }}>{score}%</span>}
              </div>
              <div className="h-[5px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: score > 0 ? scoreColor : "#E5E7EB" }} />
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {pending ? (
              quotaFull ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={() => onContinueTest(assessment)}
                        disabled
                        className="whitespace-nowrap rounded-[10px] px-4 py-2 text-[0.78rem] font-bold shadow-none"
                        style={{ color: "#fff", backgroundColor: "#7C3AED" }}
                      >
                        <PlayArrowOutlined size={15} />
                        {s("continue")}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{s("limit_tooltip_long")}</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  onClick={() => onContinueTest(assessment)}
                  className="whitespace-nowrap rounded-[10px] px-4 py-2 text-[0.78rem] font-bold shadow-none"
                  style={{ color: "#fff", backgroundColor: "#7C3AED" }}
                >
                  <PlayArrowOutlined size={15} />
                  {s("continue")}
                </Button>
              )
            ) : (
              <Button
                onClick={() => onViewDetails(assessment._id)}
                variant="outline"
                className="whitespace-nowrap rounded-[10px] px-4 py-2 text-[0.78rem] font-bold shadow-none"
                style={{
                  color: completed ? "#059669" : "#6B7280",
                  backgroundColor: completed ? "#ECFDF5" : "#F9FAFB",
                  borderColor: completed ? "#A7F3D0" : "#E5E7EB",
                }}
              >
                {s("view_report")}
                <OpenInNewOutlined size={13} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AssessmentCard;
