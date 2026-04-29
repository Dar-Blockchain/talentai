import React, { useState, useRef, useCallback } from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchDepartments } from "@/store/slices/departmentSlice";

interface DepartmentSearchProps {
  onSearch?: (value: string) => void;
}

const DepartmentSearch: React.FC<DepartmentSearchProps> = ({ onSearch }) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setSearch(value);
      onSearch?.(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(fetchDepartments({ search: value.trim() || undefined }));
      }, 400);
    },
    [dispatch, onSearch]
  );

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={t("pages.departments.toolbar.search_placeholder_detail")}
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          maxWidth: 420,
          "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "14px", bgcolor: "#fff" },
        }}
      />
    </Box>
  );
};

export default DepartmentSearch;
