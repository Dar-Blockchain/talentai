import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, Clock, CalendarDays, CheckCircle2, Hourglass, ExternalLink } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/ui/shadcn/avatar";
import { Button } from "@/modules/shared/ui/shadcn/button";
import type { CandidateApplication } from "../types/interview.types";

const STATUS_CLASSES = {
  interview_scheduled: {
    border:  "border-amber-200",
    badge:   "bg-amber-50 border-amber-200 text-amber-700",
    bar:     "bg-amber-400",
    icon:    "text-amber-500",
    iconBg:  "bg-amber-50 border-amber-200",
  },
  interview_completed: {
    border:  "border-green-200",
    badge:   "bg-green-50 border-green-200 text-green-700",
    bar:     "bg-green-500",
    icon:    "text-green-500",
    iconBg:  "bg-green-50 border-green-200",
  },
};

interface Props {
  application: CandidateApplication;
}

const JobInterviewCard: React.FC<Props> = ({ application }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string) => t(`candidate.interviews.${k}`) as string;

  const status   = application.status as keyof typeof STATUS_CLASSES;
  const cls      = STATUS_CLASSES[status] ?? STATUS_CLASSES.interview_completed;
  const completed = status === "interview_completed";

  const jobTitle    = application.post?.jobDetails?.title ?? s("job_application");
  const company     = application.company;
  const companyName = company?.companyName ?? "";
  const logoUrl     = company?.logo
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${company.logo}`
    : undefined;

  const dateStr = application.appliedAt ?? application.createdAt;
  const timeAgo = dateStr ? dayjs(dateStr).fromNow() : "";

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border bg-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
      cls.border,
    )}>
      {/* status stripe */}
      <div className={cn("h-1 w-full", cls.bar)} />

      <div className="flex items-center gap-3 p-4">
        <Avatar className={cn("h-12 w-12 shrink-0 rounded-xl border", cls.iconBg)}>
          <AvatarImage src={logoUrl} className="object-contain p-1" />
          <AvatarFallback className={cn("rounded-xl bg-transparent", cls.icon)}>
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="max-w-[260px] truncate text-[0.9rem] font-extrabold text-[#111827]">
              {jobTitle}
            </p>
            <span className={cn("flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold", cls.badge)}>
              {completed
                ? <CheckCircle2 className="h-2.5 w-2.5" />
                : <Hourglass className="h-2.5 w-2.5" />}
              {completed ? s("completed") : s("ongoing")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {companyName && (
              <span className="flex items-center gap-1 text-[0.7rem] text-[#6B7280]">
                <Building2 className="h-3 w-3 text-[#9CA3AF]" />
                {companyName}
              </span>
            )}
            {timeAgo && (
              <span className="flex items-center gap-1 text-[0.7rem] text-[#9CA3AF]">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            )}
            {application.interviewDate && (
              <span className="flex items-center gap-1 text-[0.7rem] text-[#9CA3AF]">
                <CalendarDays className="h-3 w-3" />
                {dayjs(application.interviewDate).format("MMM D")}
              </span>
            )}
          </div>
        </div>

        {application.interviewLink && (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 shrink-0 gap-1 px-3 text-[0.75rem] font-bold",
              completed
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
            )}
            onClick={() => window.open(application.interviewLink, "_blank")}
          >
            {completed ? s("view_report") : s("continue")}
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobInterviewCard;
