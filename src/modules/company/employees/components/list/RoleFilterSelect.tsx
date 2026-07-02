import React, { memo, useCallback, useMemo, useState } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, Select, MenuItem } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import { ROLES } from "@/modules/shared/constants/employee";
import { useTranslation } from "react-i18next";
import { getRoleDescription, getRoleLabel, roleMatchesSearch } from '@/modules/company/employees/utils/employeeRoleI18n';
import { PURPLE, INLINE_SELECT_SX } from "./constants";

const MENU_PAPER_SX = {
  maxHeight: 380, borderRadius: 2, mt: 0.5,
  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
  border: "1px solid #E5E7EB",
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
  onChange: (f: string) => void;
}

const RoleFilterSelect: React.FC<Props> = memo(({ value, onChange }) => {
  const { t } = useTranslation("dashboard");
  const pf = useCallback((key: string, opts?: Record<string, string | number>) =>
    t(`pages.employees.filters.${key}`, opts), [t]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROLES.filter((r) => roleMatchesSearch(r.value, q, t));
  }, [search, t]);

  const handleChange       = useCallback((e: { target: { value: string } }) => onChange(e.target.value), [onChange]);
  const handleClose        = useCallback(() => setSearch(""), []);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  const stopPropagation    = useCallback((e: React.KeyboardEvent) => e.stopPropagation(), []);

  const renderValue = useCallback((val: string) => {
    if (!val || val === "all") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <WorkOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{pf("role_placeholder")}</Typography>
        </Box>
      );
    }
    const r = ROLES.find((r) => r.value === val);
    if (!r) return <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{val}</Typography>;
    const Icon = r.icon;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 18, height: 18, borderRadius: 0.75, bgcolor: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, "& svg": { fontSize: 11 } }}>
          <Icon />
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: r.color }}>{getRoleLabel(r.value, t)}</Typography>
      </Box>
    );
  }, [pf, t]);

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
            placeholder={pf("search_roles")}
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
              <PeopleAltOutlined />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", lineHeight: 1.2 }}>{pf("all_roles")}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{pf("all_roles_sub")}</Typography>
            </Box>
          </Box>
        </MenuItem>

        {filtered.map((r) => {
          const Icon = r.icon;
          return (
            <MenuItem key={r.value} value={r.value} sx={{ py: 0.75, px: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={{ width: 26, height: 26, borderRadius: 1.25, bgcolor: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, flexShrink: 0, "& svg": { fontSize: 14 } }}>
                  <Icon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{getRoleLabel(r.value, t)}</Typography>
                  <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>{getRoleDescription(r.value, t)}</Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        })}

        {filtered.length === 0 && (
          <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{pf("no_roles_match", { term: search })}</Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
});

RoleFilterSelect.displayName = "RoleFilterSelect";
export default RoleFilterSelect;
