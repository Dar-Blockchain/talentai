/**
 * FilterBar — search field + optional filter chips / selects in a single row.
 *
 * Usage:
 *   <FilterBar
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *     searchPlaceholder="Search employees…"
 *     filters={[
 *       {
 *         value: dept,
 *         onChange: setDept,
 *         options: [{ value: "all", label: "All Departments" }, ...],
 *       },
 *     ]}
 *     action={<Button>Export</Button>}
 *   />
 */

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelect {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  /** Minimum width of the select (default 160) */
  minWidth?: number;
}

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSelect[];
  /** Element placed at the far right */
  action?: React.ReactNode;
}

const SHARED_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#f9fafb",
    fontSize: "0.875rem",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#d1d5db" },
    "&.Mui-focused fieldset": { borderColor: "#0D9488" },
  },
};

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  action,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      flexWrap: "wrap",
      mb: 3,
    }}
  >
    {/* Search input */}
    {onSearchChange !== undefined && (
      <TextField
        size="small"
        value={searchValue ?? ""}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        sx={{ flex: 1, minWidth: 200, ...SHARED_SX }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
            </InputAdornment>
          ),
        }}
      />
    )}

    {/* Filter selects */}
    {filters?.map((f, i) => (
      <FormControl
        key={i}
        size="small"
        sx={{ minWidth: f.minWidth ?? 160, ...SHARED_SX }}
      >
        <Select
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          displayEmpty
        >
          {f.options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ))}

    {/* Right action */}
    {action && <Box sx={{ ml: "auto" }}>{action}</Box>}
  </Box>
);

export default FilterBar;
