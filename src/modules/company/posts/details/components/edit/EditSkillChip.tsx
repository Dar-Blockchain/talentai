import React from "react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { X as Close } from "lucide-react";

interface Props {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: object;
}

const EditSkillChip: React.FC<Props> = ({ label, onDelete, onClick, sx }) => (
  <Badge
    variant="outline"
    onClick={onClick}
    className="h-[29px] cursor-pointer gap-1.5 rounded-full border-transparent px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
    style={{ backgroundColor: "rgba(96,140,163,1)", ...(sx as React.CSSProperties) }}
  >
    {label}
    {onDelete && (
      <Close
        size={16}
        color="rgba(6,65,96,1)"
        className="cursor-pointer transition-transform duration-200 hover:scale-125"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      />
    )}
  </Badge>
);

export default EditSkillChip;
