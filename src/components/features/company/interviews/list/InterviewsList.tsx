import React from "react";
import { Box, Typography, TextField, InputAdornment, CircularProgress } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import HowToRegOutlined from "@mui/icons-material/HowToRegOutlined";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";
import TabBar from "@/components/dashboard-workplace/ui/TabBar";
import InterviewCard, { InterviewAssessment } from "./InterviewCard";

const PURPLE = "#8310FF";

type TabType = "all" | "excellent" | "satisfactory" | "needs-work";

interface TabItem {
  id: string;
  label: string;
  count: number;
}

interface InterviewsListProps {
  assessments: InterviewAssessment[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabItems: TabItem[];
  onSelect: (assessment: InterviewAssessment) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

const GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
  gap: 2,
};

const InterviewsList: React.FC<InterviewsListProps> = ({
  assessments, loading, search, onSearchChange,
  activeTab, onTabChange, tabItems, onSelect,
  hasMore, onLoadMore,
}) => {
  const body = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress sx={{ color: PURPLE }} />
        </Box>
      );
    }

    if (assessments.length === 0) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HowToRegOutlined sx={{ fontSize: 36, color: "#C4B5FD" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#374151" }}>
            {search ? "No results match your search" : "No interviews yet"}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF", textAlign: "center", maxWidth: 300 }}>
            {search
              ? "Try different keywords or clear the search."
              : "Candidate interview results will appear here once completed."}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ ...GRID, mt: 1 }}>
          {assessments.map((a) => (
            <InterviewCard key={a._id} assessment={a} onClick={onSelect} />
          ))}
        </Box>

        {hasMore && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Box
              onClick={onLoadMore}
              sx={{
                px: 3, py: 1, borderRadius: "10px", cursor: "pointer",
                border: `1px solid ${PURPLE}30`, color: PURPLE,
                fontWeight: 600, fontSize: "13px",
                "&:hover": { bgcolor: `${PURPLE}08` },
                transition: "all 0.15s",
              }}
            >
              Load more
            </Box>
          </Box>
        )}
      </>
    );
  };

  return (
    <SectionCard>
      <TextField
        size="small"
        fullWidth
        placeholder="Search by candidate name, email or job title…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{ input: { startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
          </InputAdornment>
        )}}}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2, bgcolor: "#F8FAFC",
            "& fieldset": { borderColor: "#E2E8F0" },
            "&:hover fieldset": { borderColor: "#CBD5E1" },
            "&.Mui-focused fieldset": { borderColor: PURPLE },
          },
        }}
      />

      <TabBar
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as TabType)}
        color={PURPLE}
      />

      {body()}
    </SectionCard>
  );
};

export default InterviewsList;
