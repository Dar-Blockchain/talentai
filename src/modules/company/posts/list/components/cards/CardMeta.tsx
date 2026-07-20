import React from "react";
import { MapPin as LocationOnOutlined } from "lucide-react";

interface Props {
  location?: string;
  employmentType?: string;
  workMode?: string;
}

const CardMeta: React.FC<Props> = ({ location, employmentType, workMode }) => (
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
  </div>
);

export default CardMeta;
