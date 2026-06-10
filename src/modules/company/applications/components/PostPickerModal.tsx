import React from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  IconButton, InputBase, Divider, Pagination,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { usePostPicker } from "../hooks/usePostPicker";
import { PostPickerItem } from "../queries";
import { TEAL } from "./constants";

interface Props {
  open: boolean;
  selectedId: string;
  onSelect: (id: string, title: string) => void;
  onClose: () => void;
}

const PostPickerModal: React.FC<Props> = ({ open, selectedId, onSelect, onClose }) => {
  const { searchInput, setSearchInput, page, setPage, posts, totalPages, isLoading } = usePostPicker(open);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } } }}
    >
      <DialogTitle sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WorkOutlineOutlined sx={{ fontSize: 16, color: TEAL }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>Filter by Job</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Select a job to filter applications</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        {/* Search */}
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.25, height: 36, mb: 1.5, "&:focus-within": { borderColor: TEAL }, transition: "border-color 0.15s" }}>
          <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
          <InputBase
            placeholder="Search jobs…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ fontSize: "13px", flex: 1 }}
            autoFocus
          />
          {searchInput && (
            <IconButton size="small" onClick={() => setSearchInput("")} sx={{ p: 0.25, color: "#9CA3AF" }}>
              <CloseOutlined sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>

        {/* All jobs option */}
        <PostRow
          id=""
          title="All Jobs"
          selectedId={selectedId}
          icon={<LayersOutlined sx={{ fontSize: 16, color: !selectedId ? TEAL : "#9CA3AF" }} />}
          onSelect={() => onSelect("", "")}
        />

        <Divider sx={{ mb: 1, borderColor: "#F3F4F6" }} />

        {isLoading ? (
          <LoadingState message="" color={TEAL} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<WorkOutlineOutlined />}
            title={searchInput ? "No matches" : "No jobs posted yet"}
            minHeight={120}
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {(posts as PostPickerItem[]).map((p) => {
              const id        = p._id ?? p.id ?? "";
              const title     = p.jobDetails?.title ?? p.title ?? "Untitled";
              const empType   = p.jobDetails?.employmentType ?? "";
              const createdAt = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : undefined;
              return (
                <PostRow
                  key={id} id={id} title={title} empType={empType}
                  createdAt={createdAt} selectedId={selectedId}
                  onSelect={() => onSelect(id, title)}
                />
              );
            })}
          </Box>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{ "& .MuiPaginationItem-root": { fontWeight: 500, fontSize: "12px" }, "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 } }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Row sub-component ────────────────────────────────────────────────────────

interface PostRowProps {
  id: string;
  title: string;
  selectedId: string;
  icon?: React.ReactNode;
  empType?: string;
  createdAt?: string;
  onSelect: () => void;
}

const PostRow: React.FC<PostRowProps> = ({ id, title, selectedId, icon, empType, createdAt, onSelect }) => {
  const isActive = id === selectedId || (!id && !selectedId);
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, mb: 0.5,
        borderRadius: "10px", cursor: "pointer", border: "1px solid",
        borderColor: isActive ? TEAL : "transparent",
        bgcolor: isActive ? `${TEAL}0D` : "transparent",
        "&:hover": { bgcolor: isActive ? `${TEAL}14` : "#F9FAFB" },
        transition: "all 0.12s",
      }}
    >
      <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: isActive ? `${TEAL}18` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon ?? <WorkOutlineOutlined sx={{ fontSize: 16, color: isActive ? TEAL : "#9CA3AF" }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? TEAL : "#111827" }}>
          {title}
        </Typography>
        {(empType || createdAt) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.15, flexWrap: "wrap" }}>
            {empType && <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{empType}</Typography>}
            {empType && createdAt && <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>}
            {createdAt && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                <CalendarTodayOutlined sx={{ fontSize: 10, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{createdAt}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
      {isActive && <CheckOutlined sx={{ fontSize: 16, color: TEAL, flexShrink: 0 }} />}
    </Box>
  );
};

export default PostPickerModal;
