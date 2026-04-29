import React from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import SortOutlined from "@mui/icons-material/SortOutlined";
import { useTranslation } from "react-i18next";
import { SortOption } from "./EmployeesList";
import { PURPLE, INLINE_SELECT_SX, SORT_ORDER, SORT_I18N_KEY } from "./constants";

interface Props {
  value: SortOption;
  onChange: (s: SortOption) => void;
}

const SortSelect: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation("dashboard");
  const label = (id: SortOption) => t(`pages.employees.filters.sort.${SORT_I18N_KEY[id]}`);
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
            <Typography sx={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{label(value)}</Typography>
          </Box>
        )}
        sx={INLINE_SELECT_SX}
      >
        {SORT_ORDER.map((id) => (
          <MenuItem key={id} value={id} sx={{ py: 1, px: 2 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: id === value ? 700 : 500, color: id === value ? PURPLE : "#374151" }}>
              {label(id)}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortSelect;
