import React from "react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { X as CloseOutlined } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAL } from "./styles";

interface Props {
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: React.CSSProperties;
}

const SkillChip: React.FC<Props> = ({ label, onDelete, onClick }) => (
  <Badge
    variant="outline"
    onClick={onClick}
    className={cn(
      "h-7 gap-1 rounded-full border-transparent px-3 text-xs font-medium text-white hover:bg-[#0F766E]",
      onClick && "cursor-pointer"
    )}
    style={{ backgroundColor: TEAL }}
  >
    {label}
    {onDelete && (
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-0.5 flex items-center text-white/70 hover:text-white"
      >
        <CloseOutlined size={14} />
      </button>
    )}
  </Badge>
);

export default SkillChip;
