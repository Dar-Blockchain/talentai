import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import TabBar from "@/components/dashboard-workplace/ui/TabBar";

const TEAL = "#0D9488";

type TabType = "all" | "active" | "draft" | "expired";

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

const JobPostsFilters: React.FC<JobPostsFiltersProps> = ({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  tabItems,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search by title, location, type…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&.Mui-focused fieldset": { borderColor: TEAL },
          },
        }}
      />
      <TabBar
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as TabType)}
        color={TEAL}
      />
    </Box>
  );
};

export default JobPostsFilters;
