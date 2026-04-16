import React from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import SortOutlined from "@mui/icons-material/SortOutlined";
import { SortOption } from "./EmployeesList";
import { PURPLE, SORT_OPTIONS, INLINE_SELECT_SX } from "./constants";

interface Props {
  value: SortOption;
  onChange: (s: SortOption) => void;
}

const SortSelect: React.FC<Props> = ({ value, onChange }) => {
  const current = SORT_OPTIONS.find((o) => o.id === value)!;
  return (
    <FormControl size="small" sx={{ minWidth: 0, flex: "0 0 auto" }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        displayEmpty
        MenuProps={{
          PaperProps: { sx: { borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #E5E7EB", minWidth: 170, mt: 0.5 } },
        }}
        renderValue={() => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <SortOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{current.label}</Typography>
          </Box>
        )}
        sx={INLINE_SELECT_SX}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem key={o.id} value={o.id} sx={{ py: 1, px: 2 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: o.id === value ? 700 : 500, color: o.id === value ? PURPLE : "#374151" }}>
              {o.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortSelect;
