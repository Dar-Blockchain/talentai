import React, { useState } from "react";
import { Box, Typography, TextField, InputAdornment, FormControl, Select, MenuItem } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { Department } from "@/store/slices/departmentSlice";
import { PURPLE, INLINE_SELECT_SX } from "./constants";

interface Props {
  value: string;
  onChange: (d: string) => void;
  departments: Department[];
}

const DeptFilterSelect: React.FC<Props> = ({ value, onChange, departments }) => {
  const [search, setSearch] = useState("");

  const filtered = departments.filter((d) => {
    const q = search.trim().toLowerCase();
    return !q || d.name.toLowerCase().includes(q);
  });

  return (
    <FormControl size="small" sx={{ minWidth: 0, flex: "0 0 auto" }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClose={() => setSearch("")}
        displayEmpty
        MenuProps={{
          PaperProps: { sx: { maxHeight: 320, borderRadius: 2, mt: 0.5, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #E5E7EB", minWidth: 220 } },
          autoFocus: false,
        }}
        renderValue={(val) => {
          if (!val || val === "all") {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <BusinessOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>Department</Typography>
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
            placeholder="Search departments…"
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
              <BusinessOutlined />
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>All Departments</Typography>
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
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No departments match "{search}"</Typography>
          </MenuItem>
        )}
        {departments.length === 0 && (
          <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No departments yet</Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default DeptFilterSelect;
