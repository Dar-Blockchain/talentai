import React, { useMemo, useState } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, Select, MenuItem } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import { ROLES } from "@/constants/employee";
import { useTranslation } from "react-i18next";
import { getRoleDescription, getRoleLabel, roleMatchesSearch } from "@/utils/employeeRoleI18n";
import { PURPLE, INLINE_SELECT_SX } from "./constants";

interface Props {
  value: string;
  onChange: (f: string) => void;
}

const RoleFilterSelect: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation("dashboard");
  const pf = (key: string, opts?: { [option: string]: string | number }) =>
    t(`pages.employees.filters.${key}`, opts);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROLES.filter((r) => roleMatchesSearch(r.value, q, t));
  }, [search, t]);

  return (
    <FormControl size="small" sx={{ minWidth: 0, flex: "0 0 auto" }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClose={() => setSearch("")}
        displayEmpty
        MenuProps={{
          PaperProps: { sx: { maxHeight: 380, borderRadius: 2, mt: 0.5, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #E5E7EB" } },
          autoFocus: false,
        }}
        renderValue={(val) => {
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
        }}
        sx={INLINE_SELECT_SX}
      >
        <MenuItem
          disableRipple
          onKeyDown={(e) => e.stopPropagation()}
          sx={{ position: "sticky", top: 0, zIndex: 1, bgcolor: "#fff", p: 1, borderBottom: "1px solid #f3f4f6", "&:hover": { bgcolor: "#fff" }, "&.Mui-focusVisible": { bgcolor: "#fff" } }}
        >
          <TextField
            size="small" fullWidth autoFocus
            placeholder={pf("search_roles")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} /></InputAdornment> }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "13px", bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&.Mui-focused fieldset": { borderColor: PURPLE, borderWidth: 2 } } }}
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
};

export default RoleFilterSelect;
