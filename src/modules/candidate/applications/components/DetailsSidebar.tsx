import React from "react";
import { MapPin as LocationOnOutlined, Briefcase as WorkOutlineOutlined, Building2 as BusinessCenterOutlined, Calendar as CalendarTodayOutlined } from "lucide-react";
import { fmtDate } from "../utils/constants";

interface DetailsSidebarProps {
  title: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  appliedAt?: string;
  appliedOnLabel: (date: string) => string;
}

const DetailsSidebar: React.FC<DetailsSidebarProps> = ({ title, location, employmentType, workMode, appliedAt, appliedOnLabel }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <p className="text-[0.72rem] font-bold text-[#94A3B8] uppercase tracking-[0.06em] mb-2.5">
      {title}
    </p>
    <div className="flex flex-col gap-2.5">
      {location && (
        <div className="flex items-center gap-2">
          <LocationOnOutlined size={14} color="#9CA3AF" className="shrink-0" />
          <span className="text-[0.78rem] text-[#374151]">{location}</span>
        </div>
      )}
      {employmentType && (
        <div className="flex items-center gap-2">
          <WorkOutlineOutlined size={14} color="#9CA3AF" className="shrink-0" />
          <span className="text-[0.78rem] text-[#374151]">{employmentType}</span>
        </div>
      )}
      {workMode && (
        <div className="flex items-center gap-2">
          <BusinessCenterOutlined size={14} color="#9CA3AF" className="shrink-0" />
          <span className="text-[0.78rem] text-[#374151]">{workMode}</span>
        </div>
      )}
      <div className="border-t border-[#E5E7EB]" />
      <div className="flex items-center gap-2">
        <CalendarTodayOutlined size={14} color="#9CA3AF" className="shrink-0" />
        <span className="text-[0.75rem] text-[#6B7280]">{appliedOnLabel(fmtDate(appliedAt))}</span>
      </div>
    </div>
  </div>
);

export default DetailsSidebar;
