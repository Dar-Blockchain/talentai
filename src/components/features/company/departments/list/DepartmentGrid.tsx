import React, { useState, useRef, useCallback } from "react";
import { Box, Typography, InputAdornment, TextField } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch } from "@/store/store";
import {
  selectDepartments,
  selectDepartmentsLoading,
  selectDepartmentTotal,
  fetchDepartments,
  Department,
} from "@/store/slices/departmentSlice";
import DepartmentCard from "./DepartmentCard";
import DepartmentSkeletonCard from "./DepartmentSkeletonCard";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";

interface DepartmentGridProps {
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
  onSearch?: (val: string) => void;
  canManage?: boolean;
}

const DepartmentGrid: React.FC<DepartmentGridProps> = ({ onEdit, onDelete, onSearch, canManage = true }) => {
  const { t } = useTranslation("dashboard");
  const dispatch      = useDispatch<AppDispatch>();
  const departments   = useSelector(selectDepartments);
  const loading       = useSelector(selectDepartmentsLoading);
  const total         = useSelector(selectDepartmentTotal);

  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    onSearch?.(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchDepartments({ search: value.trim() || undefined }));
    }, 400);
  }, [dispatch, onSearch]);

  const displayTotal = loading ? null : total;

  return (
    <Box>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 2, mb: 3,
      }}>
        {/* Stats chips */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 0.75,
            px: 1.5, py: 0.75, borderRadius: "10px",
            bgcolor: "#F0FDFA", border: "1px solid #99F6E4",
          }}>
            <CorporateFareOutlined sx={{ fontSize: 15, color: "#0D9488" }} />
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0D9488" }}>
              {loading
                ? "—"
                : t("pages.departments.toolbar.department_count", { count: displayTotal ?? 0 })}
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder={t("pages.departments.toolbar.search_placeholder")}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, bgcolor: "#fff" },
          }}
        />
      </Box>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        gap: 2.5,
      }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <DepartmentSkeletonCard key={i} />)
          : departments.map((dept, idx) => (
              <DepartmentCard
                key={dept._id}
                department={dept}
                index={idx}
                onEdit={onEdit}
                onDelete={onDelete}
                canManage={canManage}
              />
            ))}
      </Box>
    </Box>
  );
};

export default DepartmentGrid;
