import React, { memo, useCallback } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import TabBar from "@/components/ui/TabBar";

const TEAL = "#0D9488";

type TabType = "all" | "open" | "draft" | "expired";

interface TabItem {
  id: string;
  label: string;
  count: number;
}

interface JobPostsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabItems: TabItem[];
}

const FIELD_SX = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": { borderColor: TEAL },
  },
} as const;

const JobPostsFilters = memo<JobPostsFiltersProps>(({ search, onSearchChange, activeTab, onTabChange, tabItems }) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
  );
  const handleTabChange = useCallback(
    (id: string) => onTabChange(id as TabType),
    [onTabChange],
  );

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search by title, location, type…"
        value={search}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
            </InputAdornment>
          ),
        }}
        sx={FIELD_SX}
      />
      <TabBar
        tabs={tabItems}
        activeTab={activeTab}
        onChange={handleTabChange}
        color={TEAL}
      />
    </Box>
  );
});
JobPostsFilters.displayName = "JobPostsFilters";

export default JobPostsFilters;
