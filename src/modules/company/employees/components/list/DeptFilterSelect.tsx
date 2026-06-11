import React, { memo, useCallback, useMemo, useState } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, Select, MenuItem } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { Department } from "@/store/slices/departmentSlice";
import { useTranslation } from "react-i18next";
import { PURPLE, INLINE_SELECT_SX } from "./constants";

const MENU_PAPER_SX = {
  maxHeight: 320, borderRadius: 2, mt: 0.5,
  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
  border: "1px solid #E5E7EB", minWidth: 220,
} as const;

const STICKY_ITEM_SX = {
  position: "sticky", top: 0, zIndex: 1, bgcolor: "#fff", p: 1,
  borderBottom: "1px solid #f3f4f6",
  "&:hover": { bgcolor: "#fff" }, "&.Mui-focusVisible": { bgcolor: "#fff" },
} as const;

const FIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, fontSize: "13px", bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 2 },
  },
} as const;

interface Props {
  value: string;
  onChange: (d: string) => void;
  departments: Department[];
}

const DeptFilterSelect: React.FC<Props> = memo(({ value, onChange, departments }) => {
  const { t } = useTranslation("dashboard");
  const pf = useCallback((key: string, opts?: Record<string, string | number>) =>
    t(`pages.employees.filters.${key}`, opts), [t]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q ? departments : departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, search]);

  const handleChange      = useCallback((e: { target: { value: string } }) => onChange(e.target.value), [onChange]);
  const handleClose       = useCallback(() => setSearch(""), []);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  const stopPropagation   = useCallback((e: React.KeyboardEvent) => e.stopPropagation(), []);

  const renderValue = useCallback((val: string) => {
    if (!val || val === "all") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <BusinessOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{pf("department_placeholder")}</Typography>
        </Box>
      );
    }
    const d = departments.find((d) => d._id === val);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <BusinessOutlined sx={{ fontSize: 14, color: "#0891B2" }} />
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0891B2" }}>{d?.name ?? val}</Typography>
      </Box>
    );
  }, [departments, pf]);

  return (
    <FormControl size="small" sx={{ minWidth: 0, flex: "0 0 auto" }}>
      <Select
        value={value}
        onChange={handleChange}
        onClose={handleClose}
        displayEmpty
        MenuProps={{ PaperProps: { sx: MENU_PAPER_SX }, autoFocus: false }}
        renderValue={renderValue}
        sx={INLINE_SELECT_SX}
      >
        <MenuItem disableRipple onKeyDown={stopPropagation} sx={STICKY_ITEM_SX}>
          <TextField
            size="small" fullWidth autoFocus
            placeholder={pf("search_departments")}
            value={search}
            onChange={handleSearchChange}
            onKeyDown={stopPropagation}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} /></InputAdornment> }}
            sx={FIELD_SX}
          />
        </MenuItem>

        <MenuItem value="all" sx={{ py: 0.875, px: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1.25, bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", "& svg": { fontSize: 14 } }}>
              <BusinessOutlined />
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{pf("all_departments")}</Typography>
          </Box>
        </MenuItem>

        {filtered.map((d) => (
          <MenuItem key={d._id} value={d._id} sx={{ py: 0.875, px: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: 1.25, bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0891B2", "& svg": { fontSize: 14 } }}>
                <BusinessOutlined />
              </Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{d.name}</Typography>
            </Box>
          </MenuItem>
        ))}

        {filtered.length === 0 && departments.length > 0 && (
          <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{pf("no_departments_match", { term: search })}</Typography>
          </MenuItem>
        )}
        {departments.length === 0 && (
          <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{pf("no_departments_yet")}</Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
});

DeptFilterSelect.displayName = "DeptFilterSelect";
export default DeptFilterSelect;
