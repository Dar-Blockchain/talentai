import React from "react";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined          from "@mui/icons-material/WorkOutlined";
import { fmtDate } from "@/modules/company/assessment/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";

function fmtInterviewType(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

interface Props {
  letter:     string;
  name:       string;
  email:      string;
  avatarUrl?: string;
  bgColor:    string;
  jobTitle:      string | null;
  interviewType: string | null;
  createdAt:     string;
}

const CandidateInfoSection: React.FC<Props> = ({ letter, name, email, avatarUrl, bgColor, jobTitle, interviewType, createdAt }) => (
  <div className="flex items-center gap-4">
    <Avatar className="w-14 h-14 rounded-2xl shrink-0 shadow-sm">
      <AvatarImage src={avatarUrl || undefined} alt={name} className="object-cover" />
      <AvatarFallback
        className="rounded-2xl text-white text-xl font-black"
        style={{ backgroundColor: bgColor }}
      >
        {letter}
      </AvatarFallback>
    </Avatar>

    <div>
      <div className="font-black text-[1.05rem] text-slate-900 leading-tight">{name || "—"}</div>
      <div className="text-xs text-slate-500 mt-0.5 mb-2">{email || "—"}</div>
      <div className="flex flex-wrap gap-1.5">
        {jobTitle && (
          <span className="flex items-center gap-1 text-[0.68rem] font-semibold h-5 px-2 rounded-full border bg-teal-50 text-teal-700 border-teal-200">
            <WorkOutlined style={{ fontSize: 10 }} />
            {jobTitle}
          </span>
        )}
        {interviewType && (
          <span className="text-[0.68rem] font-semibold h-5 px-2 rounded-full border bg-violet-50 text-violet-700 border-violet-200 flex items-center">
            {fmtInterviewType(interviewType)}
          </span>
        )}
        {createdAt && (
          <span className="flex items-center gap-1 text-[0.68rem] font-medium h-5 px-2 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
            <CalendarTodayOutlined style={{ fontSize: 9 }} />
            {fmtDate(createdAt)}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default CandidateInfoSection;
