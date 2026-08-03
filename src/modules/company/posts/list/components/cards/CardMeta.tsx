import React from "react";
import { MapPin as LocationOnOutlined, Building2 as DepartmentOutlined } from "lucide-react";

interface Props {
  location?: string;
  employmentType?: string;
  workMode?: string;
  department?: string;
}

const CardMeta: React.FC<Props> = ({ location, employmentType, workMode, department }) => (
  <div className="flex flex-wrap items-center gap-2">
    {location && (
      <div className="flex items-center gap-1">
        <LocationOnOutlined size={12} color="#9CA3AF" />
        <span className="truncate max-w-[120px] text-xs text-[#6B7280]">{location}</span>
      </div>
    )}
    {employmentType && (
      <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] text-[#6B7280]">{employmentType}</span>
    )}
    {workMode && (
      <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-[3px] text-[11px] text-[#6B7280]">{workMode}</span>
    )}
    {department && (
      <div className="flex items-center gap-1 rounded-[5px] bg-[#ECFEFF] px-2 py-[3px]">
        <DepartmentOutlined size={11} color="#0891B2" />
        <span className="truncate max-w-[120px] text-[11px] font-medium text-[#0891B2]">{department}</span>
      </div>
    )}
  </div>
);

export default CardMeta;
