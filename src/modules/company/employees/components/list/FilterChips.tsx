import React, { memo } from "react";
import { X as CloseOutlined } from "lucide-react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { ROLES } from "@/modules/shared/constants/employee";

const DELETE_ICON_SIZE = 11;

interface Props {
  search: string;
  onClearSearch: () => void;
  selectedRole: typeof ROLES[number] | null;
  onClearRole: () => void;
  selectedDept: { name: string } | null;
  onClearDept: () => void;
  onClearAll: () => void;
}

const FilterChips: React.FC<Props> = memo(({
  search, onClearSearch,
  selectedRole, onClearRole,
  selectedDept, onClearDept,
  onClearAll,
}) => (
  <div className="mb-4 flex flex-wrap items-center gap-1.5">
    <span className="mr-0.5 text-[11px] font-semibold text-[#9CA3AF]">Filters:</span>

    {search && (
      <Badge
        variant="outline"
        className="h-6 gap-1 rounded-full border-[#E5E7EB] bg-[#F3F4F6] px-2 text-[11px] font-semibold text-[#374151]"
      >
        {`"${search}"`}
        <button
          type="button"
          onClick={onClearSearch}
          className="text-[#9CA3AF] transition-colors hover:text-[#374151]"
        >
          <CloseOutlined size={DELETE_ICON_SIZE} />
        </button>
      </Badge>
    )}

    {selectedRole && (
      <Badge
        variant="outline"
        className="h-6 gap-1 rounded-full px-2 text-[11px] font-bold"
        style={{ backgroundColor: `${selectedRole.color}12`, borderColor: `${selectedRole.color}30`, color: selectedRole.color }}
      >
        {selectedRole.label}
        <button
          type="button"
          onClick={onClearRole}
          className="opacity-60 transition-opacity hover:opacity-100"
          style={{ color: selectedRole.color }}
        >
          <CloseOutlined size={DELETE_ICON_SIZE} />
        </button>
      </Badge>
    )}

    {selectedDept && (
      <Badge
        variant="outline"
        className="h-6 gap-1 rounded-full border-[#BAE6FD] bg-[#EFF6FF] px-2 text-[11px] font-bold text-[#0891B2]"
      >
        {selectedDept.name}
        <button
          type="button"
          onClick={onClearDept}
          className="text-[#0891B2] opacity-60 transition-opacity hover:opacity-100"
        >
          <CloseOutlined size={DELETE_ICON_SIZE} />
        </button>
      </Badge>
    )}

    <div
      onClick={onClearAll}
      className="ml-1 cursor-pointer text-[11px] font-semibold text-[#9CA3AF] transition-colors duration-150 hover:text-[#374151]"
    >
      Clear all
    </div>
  </div>
));

FilterChips.displayName = "FilterChips";
export default FilterChips;
