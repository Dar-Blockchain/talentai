import React, { memo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { ROLES } from "@/constants/employee";

const DELETE_ICON_STYLE = { fontSize: 11 } as const;

const BASE_CHIP_SX = {
  height: 24,
  fontSize: "11px",
  fontWeight: 600,
  "& .MuiChip-label": { px: 1 },
  "& .MuiChip-deleteIcon": { mr: 0.5 },
} as const;

const SEARCH_CHIP_SX = {
  ...BASE_CHIP_SX,
  bgcolor: "#F3F4F6",
  color: "#374151",
  border: "1px solid #E5E7EB",
  "& .MuiChip-deleteIcon": { ...BASE_CHIP_SX["& .MuiChip-deleteIcon"], color: "#9CA3AF", "&:hover": { color: "#374151" } },
} as const;

const DEPT_CHIP_SX = {
  ...BASE_CHIP_SX,
  fontWeight: 700,
  bgcolor: "#EFF6FF",
  color: "#0891B2",
  border: "1px solid #BAE6FD",
  "& .MuiChip-deleteIcon": { ...BASE_CHIP_SX["& .MuiChip-deleteIcon"], color: "#0891B2", opacity: 0.6, "&:hover": { opacity: 1 } },
} as const;

const CONTAINER_SX = { display: "flex", alignItems: "center", gap: 0.75, mb: 2, flexWrap: "wrap" } as const;
const LABEL_SX = { fontSize: "11px", fontWeight: 600, color: "#9CA3AF", mr: 0.25 } as const;
const CLEAR_ALL_SX = { fontSize: "11px", fontWeight: 600, color: "#9CA3AF", cursor: "pointer", ml: 0.5, "&:hover": { color: "#374151" }, transition: "color 0.15s" } as const;

const deleteIcon = <CloseOutlined style={DELETE_ICON_STYLE} />;

function roleChipSx(color: string) {
  return {
    ...BASE_CHIP_SX,
    fontWeight: 700,
    bgcolor: `${color}12`,
    color,
    border: `1px solid ${color}30`,
    "& .MuiChip-deleteIcon": { ...BASE_CHIP_SX["& .MuiChip-deleteIcon"], color, opacity: 0.6, "&:hover": { opacity: 1 } },
  };
}

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
  <Box sx={CONTAINER_SX}>
    <Typography sx={LABEL_SX}>Filters:</Typography>

    {search && (
      <Chip size="small" label={`"${search}"`} onDelete={onClearSearch}
        deleteIcon={deleteIcon} sx={SEARCH_CHIP_SX} />
    )}

    {selectedRole && (
      <Chip size="small" label={selectedRole.label} onDelete={onClearRole}
        deleteIcon={deleteIcon} sx={roleChipSx(selectedRole.color)} />
    )}

    {selectedDept && (
      <Chip size="small" label={selectedDept.name} onDelete={onClearDept}
        deleteIcon={deleteIcon} sx={DEPT_CHIP_SX} />
    )}

    <Box onClick={onClearAll} sx={CLEAR_ALL_SX}>Clear all</Box>
  </Box>
));

FilterChips.displayName = "FilterChips";
export default FilterChips;
