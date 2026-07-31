import React from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Video as VideoCallOutlined, Calendar as CalendarTodayOutlined, Clock as AccessTimeOutlined, Link as LinkOutlined } from "lucide-react";
import { T } from "../utils/constants";

interface InterviewBannerProps {
  title: string;
  joinLabel: string;
  interviewDate?: string | null;
  interviewTime?: string | null;
  interviewLink?: string | null;
}

const InterviewBanner: React.FC<InterviewBannerProps> = ({ title, joinLabel, interviewDate, interviewTime, interviewLink }) => (
  <div
    className="rounded-2xl p-5 flex flex-wrap gap-4 items-center"
    style={{ backgroundColor: T, boxShadow: `0 4px 16px ${T}40` }}
  >
    <div className="flex items-center gap-2">
      <VideoCallOutlined size={22} color="#fff" />
      <span className="font-bold text-white text-[1rem]">{title}</span>
    </div>
    <div className="flex flex-wrap gap-4 sm:ml-auto">
      {interviewDate && (
        <div className="flex items-center gap-1">
          <CalendarTodayOutlined size={14} color="rgba(255,255,255,0.8)" />
          <span className="text-[0.82rem] text-white font-semibold">{interviewDate}</span>
        </div>
      )}
      {interviewTime && (
        <div className="flex items-center gap-1">
          <AccessTimeOutlined size={14} color="rgba(255,255,255,0.8)" />
          <span className="text-[0.82rem] text-white font-semibold">{interviewTime}</span>
        </div>
      )}
      {interviewLink && (
        <Button
          variant="default"
          size="sm"
          onClick={() => window.open(interviewLink, "_blank")}
          className="rounded-lg px-3.5 text-[0.78rem] font-bold shadow-none"
          style={{ backgroundColor: "#fff", color: T }}
        >
          <LinkOutlined size={14} />
          {joinLabel}
        </Button>
      )}
    </div>
  </div>
);

export default InterviewBanner;
