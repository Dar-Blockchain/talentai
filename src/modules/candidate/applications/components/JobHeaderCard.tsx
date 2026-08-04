import React from "react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Briefcase as WorkOutlineOutlined, MapPin as LocationOnOutlined, Building2 as BusinessCenterOutlined, Calendar as CalendarTodayOutlined } from "lucide-react";
import { T, TL, TBG, TBRD, NAVY, fmtDate } from "../utils/constants";

interface JobHeaderCardProps {
  title: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  salary?: { min?: number; max?: number; currency?: string } | null;
  statusLabel: string;
  statusStyle: { bg: string; color: string; border: string };
  appliedAt?: string;
  appliedOnLabel: (date: string) => string;
}

const JobHeaderCard: React.FC<JobHeaderCardProps> = ({ title, location, employmentType, workMode, salary, statusLabel, statusStyle: sc, appliedAt, appliedOnLabel }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <div className="h-1" style={{ background: `linear-gradient(90deg, ${T}, ${TL})` }} />
    <div className="p-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div
          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: TBG, border: `1px solid ${TBRD}` }}
        >
          <WorkOutlineOutlined size={24} color={T} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-[1.15rem] font-extrabold" style={{ color: NAVY }}>{title}</span>
            <Badge
              variant="outline"
              className="h-[22px] rounded-full text-[0.68rem] font-bold"
              style={{ backgroundColor: sc.bg, color: sc.color, borderColor: sc.border }}
            >
              {statusLabel}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3 mt-1">
            {location && (
              <div className="flex items-center gap-1">
                <LocationOnOutlined size={13} color="#9CA3AF" />
                <span className="text-[0.78rem] text-[#6B7280]">{location}</span>
              </div>
            )}
            {employmentType && (
              <Badge variant="outline" className="h-5 rounded-full text-[0.67rem] bg-[#F3F4F6] text-[#374151] border-transparent">
                {employmentType}
              </Badge>
            )}
            {workMode && (
              <Badge variant="outline" className="h-5 rounded-full text-[0.67rem] bg-[#F3F4F6] text-[#374151] border-transparent">
                {workMode}
              </Badge>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <CalendarTodayOutlined size={12} color="#9CA3AF" />
              <span className="text-[0.72rem] text-[#9CA3AF]">{appliedOnLabel(fmtDate(appliedAt))}</span>
            </div>
          </div>
        </div>
      </div>

      {salary && (salary.min || salary.max) && (
        <>
          <div className="border-t border-[#E5E7EB] my-4" />
          <div className="flex items-center gap-2">
            <BusinessCenterOutlined size={15} color="#9CA3AF" />
            <span className="text-[0.82rem] text-[#374151] font-semibold">
              {salary.min && salary.max ? `${salary.min} – ${salary.max}` : salary.min || salary.max} {salary.currency || ""}
            </span>
          </div>
        </>
      )}
    </div>
  </div>
);

export default JobHeaderCard;
