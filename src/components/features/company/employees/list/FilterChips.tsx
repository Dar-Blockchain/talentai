import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { ROLES } from "@/constants/employee";

interface Props {
  search: string;
  onClearSearch: () => void;
  selectedRole: typeof ROLES[number] | null;
  onClearRole: () => void;
  selectedDept: { name: string } | null;
  onClearDept: () => void;
  onClearAll: () => void;
}

const FilterChips: React.FC<Props> = ({ search, onClearSearch, selectedRole, onClearRole, selectedDept, onClearDept, onClearAll }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2, flexWrap: "wrap" }}>
    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", mr: 0.25 }}>Filters:</Typography>

    {search && (
      <Chip size="small" label={`"${search}"`} onDelete={onClearSearch}
        deleteIcon={<CloseOutlined style={{ fontSize: 11 }} />}
        sx={{ height: 24, fontSize: "11px", fontWeight: 600, bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", "& .MuiChip-label": { px: 1 }, "& .MuiChip-deleteIcon": { color: "#9CA3AF", "&:hover": { color: "#374151" }, mr: 0.5 } }}
      />
    )}

    {selectedRole && (
      <Chip size="small" label={selectedRole.label} onDelete={onClearRole}
        deleteIcon={<CloseOutlined style={{ fontSize: 11 }} />}
        sx={{ height: 24, fontSize: "11px", fontWeight: 700, bgcolor: `${selectedRole.color}12`, color: selectedRole.color, border: `1px solid ${selectedRole.color}30`, "& .MuiChip-label": { px: 1 }, "& .MuiChip-deleteIcon": { color: selectedRole.color, opacity: 0.6, "&:hover": { opacity: 1 }, mr: 0.5 } }}
      />
    )}

    {selectedDept && (
      <Chip size="small" label={selectedDept.name} onDelete={onClearDept}
        deleteIcon={<CloseOutlined style={{ fontSize: 11 }} />}
        sx={{ height: 24, fontSize: "11px", fontWeight: 700, bgcolor: "#EFF6FF", color: "#0891B2", border: "1px solid #BAE6FD", "& .MuiChip-label": { px: 1 }, "& .MuiChip-deleteIcon": { color: "#0891B2", opacity: 0.6, "&:hover": { opacity: 1 }, mr: 0.5 } }}
      />
    )}

    <Box onClick={onClearAll} sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", cursor: "pointer", ml: 0.5, "&:hover": { color: "#374151" }, transition: "color 0.15s" }}>
      Clear all
    </Box>
  </Box>
);

export default FilterChips;
