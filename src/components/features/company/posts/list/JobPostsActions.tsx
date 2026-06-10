import React, { memo, useCallback, useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";

const TEAL = "#0D9488";

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

const SORT_OPTIONS = ["newest", "oldest", "title-asc", "title-desc"] as const;

const SORT_LABELS: Record<SortOption, string> = {
  newest:       "Newest First",
  oldest:       "Oldest First",
  "title-asc":  "Title A→Z",
  "title-desc": "Title Z→A",
};

interface JobPostsActionsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCreateClick: () => void;
}

const CONTAINER_SX  = { display: "flex", gap: 1, alignItems: "center" } as const;
const SORT_BTN_SX   = { textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2, color: "#6B7280", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F9FAFB" } } as const;
const MENU_PAPER_SX = { borderRadius: 2, minWidth: 160, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } as const;
const CREATE_BTN_SX = { textTransform: "none", fontWeight: 700, fontSize: "12px", borderRadius: 2, bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" } } as const;

const JobPostsActions = memo<JobPostsActionsProps>(({ sortBy, onSortChange, onCreateClick }) => {
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

  const openSort  = useCallback((e: React.MouseEvent<HTMLElement>) => setSortAnchor(e.currentTarget), []);
  const closeSort = useCallback(() => setSortAnchor(null), []);

  const handleSort = useCallback((opt: SortOption) => {
    onSortChange(opt);
    setSortAnchor(null);
  }, [onSortChange]);

  return (
    <Box sx={CONTAINER_SX}>
      <Button size="small" startIcon={<SortOutlined sx={{ fontSize: 15 }} />} onClick={openSort} sx={SORT_BTN_SX}>
        {SORT_LABELS[sortBy]}
      </Button>

      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={closeSort}
        slotProps={{ paper: { sx: MENU_PAPER_SX } }}
      >
        {SORT_OPTIONS.map((opt) => (
          <MenuItem
            key={opt}
            selected={sortBy === opt}
            onClick={() => handleSort(opt)}
            sx={{ fontSize: "13px", fontWeight: sortBy === opt ? 700 : 400, color: sortBy === opt ? TEAL : "#374151" }}
          >
            {SORT_LABELS[opt]}
          </MenuItem>
        ))}
      </Menu>

      <Button size="small" startIcon={<AddOutlined sx={{ fontSize: 15 }} />} variant="contained" onClick={onCreateClick} sx={CREATE_BTN_SX}>
        New Post
      </Button>
    </Box>
  );
});
JobPostsActions.displayName = "JobPostsActions";

export default JobPostsActions;
