import React, { memo, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, IconButton,
  Drawer, useMediaQuery, Badge, Tooltip,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import FilterAltOffOutlined from "@mui/icons-material/FilterAltOffOutlined";
import RoleFilterSelect from "./RoleFilterSelect";
import DeptFilterSelect from "./DeptFilterSelect";
import SortSelect from "./SortSelect";
import { Department } from "@/modules/company/departments/types";
import { RoleFilter, SortOption } from "./EmployeesList";
import { useTranslation } from "react-i18next";
import { PURPLE } from "./constants";

export interface EmployeesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (f: RoleFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (d: string) => void;
  departments: Department[];
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  resultCount: number;
  hideDepartmentFilter?: boolean;
}

const BADGE_SX = { "& .MuiBadge-badge": { bgcolor: PURPLE, fontSize: "10px", minWidth: 16, height: 16 } } as const;
const DIVIDER = <Box sx={{ width: "1px", height: 20, bgcolor: "#E5E7EB", flexShrink: 0 }} />;

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
  py?: string | number;
}> = memo(({ value, onChange, onClear, placeholder = "Search by name or email…", py = 0.25 }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value), [onChange]);
  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", bgcolor: "#fff", borderRadius: "12px", px: 1.5, py, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", minWidth: 0 }}>
      <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "5px 0" }}
      />
      {value && (
        <IconButton size="small" onClick={onClear} sx={{ p: 0.25, color: "#9CA3AF", "&:hover": { color: "#374151" } }}>
          <CloseOutlined sx={{ fontSize: 13 }} />
        </IconButton>
      )}
    </Box>
  );
});
SearchInput.displayName = "SearchInput";

const FiltersButton: React.FC<{ activeCount: number; onClick: () => void; label: string }> = memo(({ activeCount, onClick, label }) => (
  <Badge badgeContent={activeCount} color="primary" sx={BADGE_SX}>
    <Box
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "center", gap: 0.75,
        px: 1.5, py: "9px", borderRadius: "12px", cursor: "pointer",
        bgcolor: activeCount > 0 ? `${PURPLE}10` : "#fff",
        border: `1px solid ${activeCount > 0 ? `${PURPLE}30` : "#E5E7EB"}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0,
      }}
    >
      <TuneOutlined sx={{ fontSize: 17, color: activeCount > 0 ? PURPLE : "#6B7280" }} />
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: activeCount > 0 ? PURPLE : "#374151", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Box>
  </Badge>
));
FiltersButton.displayName = "FiltersButton";

const EmployeesFilterBar: React.FC<EmployeesFilterBarProps> = memo(({
  search, onSearchChange,
  roleFilter, onRoleFilterChange,
  departmentFilter, onDepartmentFilterChange, departments,
  sortBy, onSortChange,
  resultCount,
  hideDepartmentFilter = false,
}) => {
  const { t } = useTranslation("dashboard");
  const pf = useCallback((k: string) => t(`pages.employees.filters.${k}`), [t]);
  const isMobile  = useMediaQuery("(max-width:650px)");
  const isDesktop = useMediaQuery("(min-width:1101px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasRoleFilter = roleFilter !== "all";
  const hasDeptFilter = departmentFilter !== "all";
  const hasSearch     = search.trim().length > 0;
  const hasAnyFilter  = hasRoleFilter || hasDeptFilter || hasSearch;
  const activeCount   = [hasRoleFilter, hasDeptFilter, isMobile && hasSearch].filter(Boolean).length;

  const clearAll       = useCallback(() => { onSearchChange(""); onRoleFilterChange("all"); onDepartmentFilterChange("all"); }, [onSearchChange, onRoleFilterChange, onDepartmentFilterChange]);
  const clearSearch    = useCallback(() => onSearchChange(""), [onSearchChange]);
  const openDrawer     = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer    = useCallback(() => setDrawerOpen(false), []);

  const drawerSections = useMemo(() => {
    const sections: { label: string; content: React.ReactNode }[] = [
      {
        label: pf("label_search"),
        content: (
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", px: 1.5, py: 0.5 }}>
            <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
            <input
              type="text"
              placeholder={pf("search_placeholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "6px 0" }}
            />
            {hasSearch && (
              <IconButton size="small" onClick={clearSearch} sx={{ p: 0.25, color: "#9CA3AF" }}>
                <CloseOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            )}
          </Box>
        ),
      },
      { label: pf("label_role"), content: <RoleFilterSelect value={roleFilter} onChange={onRoleFilterChange} /> },
      ...(!hideDepartmentFilter ? [{ label: pf("label_department"), content: <DeptFilterSelect value={departmentFilter} onChange={onDepartmentFilterChange} departments={departments} /> }] : []),
      { label: pf("label_sort"), content: <SortSelect value={sortBy} onChange={onSortChange} /> },
    ];
    return sections;
  }, [search, hasSearch, roleFilter, departmentFilter, departments, sortBy, hideDepartmentFilter, onSearchChange, onRoleFilterChange, onDepartmentFilterChange, onSortChange, pf, clearSearch]);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        {isDesktop && (
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <SearchInput value={search} onChange={onSearchChange} onClear={clearSearch} placeholder={pf("search_placeholder")} />
            {DIVIDER}
            <RoleFilterSelect value={roleFilter} onChange={onRoleFilterChange} />
            {!hideDepartmentFilter && DIVIDER}
            {!hideDepartmentFilter && <DeptFilterSelect value={departmentFilter} onChange={onDepartmentFilterChange} departments={departments} />}
            {DIVIDER}
            <SortSelect value={sortBy} onChange={onSortChange} />
          </Box>
        )}

        {!isDesktop && !isMobile && (
          <>
            <SearchInput value={search} onChange={onSearchChange} onClear={clearSearch} placeholder={pf("search_placeholder")} />
            <FiltersButton activeCount={activeCount} onClick={openDrawer} label={pf("filters")} />
          </>
        )}

        {isMobile && (
          <>
            <SearchInput value={search} onChange={onSearchChange} onClear={clearSearch} placeholder={pf("search_short")} py={0.5} />
            <FiltersButton activeCount={activeCount} onClick={openDrawer} label={pf("filters")} />
          </>
        )}

        {hasAnyFilter && (
          <Tooltip title={pf("clear_all_tooltip")} placement="top" arrow>
            <IconButton onClick={clearAll} size="small" sx={{ flexShrink: 0, color: "#9CA3AF", border: "1px solid #E5E7EB", borderRadius: "10px", p: "7px", bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", "&:hover": { color: "#EF4444", borderColor: "#FECACA", bgcolor: "#FEF2F2" }, transition: "all 0.15s" }}>
              <FilterAltOffOutlined sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Drawer anchor="bottom" open={drawerOpen} onClose={closeDrawer} slotProps={{ paper: { sx: { borderRadius: "20px 20px 0 0", maxHeight: "85vh" } } }}>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 999, bgcolor: "#E5E7EB" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.75, borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TuneOutlined sx={{ fontSize: 18, color: PURPLE }} />
            <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>{pf("drawer_title")}</Typography>
            {activeCount > 0 && (
              <Box sx={{ px: 1, py: 0.25, borderRadius: 999, bgcolor: `${PURPLE}12`, border: `1px solid ${PURPLE}25` }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 800, color: PURPLE }}>{t("pages.employees.filters.active_chip", { count: activeCount })}</Typography>
              </Box>
            )}
          </Box>
          <IconButton size="small" onClick={closeDrawer} sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
            <CloseOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto" }}>
          {drawerSections.map(({ label, content }) => (
            <Box key={label}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
                {label}
              </Typography>
              {content}
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid #F3F4F6", display: "flex", gap: 1.5 }}>
          <Box onClick={clearAll} sx={{ flex: 1, py: 1.25, borderRadius: "12px", textAlign: "center", cursor: "pointer", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, transition: "all 0.15s" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{pf("clear_all")}</Typography>
          </Box>
          <Box onClick={closeDrawer} sx={{ flex: 2, py: 1.25, borderRadius: "12px", textAlign: "center", cursor: "pointer", bgcolor: PURPLE, "&:hover": { bgcolor: "#7209E6" }, transition: "all 0.15s" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
              {resultCount > 0 ? t("pages.employees.filters.show_results_count", { count: resultCount }) : t("pages.employees.filters.show_results")}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
});

EmployeesFilterBar.displayName = "EmployeesFilterBar";
export default EmployeesFilterBar;
