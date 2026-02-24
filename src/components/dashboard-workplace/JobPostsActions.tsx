import React from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";

const TEAL = "#0D9488";

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

interface JobPostsActionsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCreateClick: () => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  "title-asc": "Title A→Z",
  "title-desc": "Title Z→A",
};

const JobPostsActions: React.FC<JobPostsActionsProps> = ({
  sortBy,
  onSortChange,
  onCreateClick,
}) => {
  const [sortAnchor, setSortAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Button
        size="small"
        startIcon={<SortOutlined sx={{ fontSize: 15 }} />}
        onClick={(e) => setSortAnchor(e.currentTarget)}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontSize: "12px",
          borderRadius: 2,
          color: "#6B7280",
          border: "1px solid #E5E7EB",
          "&:hover": { bgcolor: "#F9FAFB" },
        }}
      >
        {SORT_LABELS[sortBy]}
      </Button>

      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={() => setSortAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              minWidth: 160,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        {(["newest", "oldest", "title-asc", "title-desc"] as const).map((opt) => (
          <MenuItem
            key={opt}
            selected={sortBy === opt}
            onClick={() => {
              onSortChange(opt);
              setSortAnchor(null);
            }}
            sx={{
              fontSize: "13px",
              fontWeight: sortBy === opt ? 700 : 400,
              color: sortBy === opt ? TEAL : "#374151",
            }}
          >
            {SORT_LABELS[opt]}
          </MenuItem>
        ))}
      </Menu>

      <Button
        size="small"
        startIcon={<AddOutlined sx={{ fontSize: 15 }} />}
        variant="contained"
        onClick={onCreateClick}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: "12px",
          borderRadius: 2,
          bgcolor: TEAL,
          "&:hover": { bgcolor: "#0F766E" },
        }}
      >
        New Post
      </Button>
    </Box>
  );
};

export default JobPostsActions;
