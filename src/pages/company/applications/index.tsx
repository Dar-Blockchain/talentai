import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import {
  Box, Button, CircularProgress, Dialog,
  DialogContent, DialogTitle, Divider, FormControl, IconButton, InputBase,
  ListItemIcon, ListSubheader, Menu, MenuItem, Pagination, Select,
  Tooltip, Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import axiosInstance from "@/utils/axiosInstance";
import type { AppDispatch } from "@/store/store";
import {
  fetchCompanyApplicationsSummary,
  fetchCompanyApplicationMetrics,
  selectCompanySummary,
  selectCompanySummaryLoading,
  selectCompanySummaryPagination,
  selectApplicationMetrics,
  ApplicationSummaryItem,
} from "@/store/slices/jobApplicationSlice";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsPagination,
} from "@/store/slices/postSlice";
import ContactCandidateModal, { ContactTarget } from "@/components/features/company/posts/details/ContactCandidateModal";
import AssessmentDetailsModal, { AssessmentTarget } from "@/components/features/company/posts/details/AssessmentDetailsModal";
import ApplicationMetrics from "@/components/features/company/applications/ApplicationMetrics";
import InviteToInterviewModal, { InviteTarget } from "@/components/features/company/applications/InviteToInterviewModal";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";
// ── Constants ──────────────────────────────────────────────────────────────────
const TEAL = "#0D9488";
const PAGE_SIZE = 15;

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  visited:             { label: "Visited",             bg: "#EFF6FF", color: "#2563EB" },
  interview_completed: { label: "Interview Completed", bg: "#D1FAE5", color: "#059669" },
};

const SORT_GROUPS = [
  {
    label: "Date Applied", Icon: CalendarTodayOutlined, color: "#6B7280",
    options: [
      { value: "appliedAt_desc", label: "Most recent first" },
      { value: "appliedAt_asc",  label: "Earliest first" },
    ],
  },
  {
    label: "Match Score", Icon: StarOutlineOutlined, color: "#D97706",
    options: [
      { value: "matchScore_desc", label: "Best match first" },
      { value: "matchScore_asc",  label: "Worst match first" },
    ],
  },
  {
    label: "Interview Score", Icon: PsychologyOutlined, color: "#7C3AED",
    options: [
      { value: "interviewScore_desc", label: "Top performers first" },
      { value: "interviewScore_asc",  label: "Low performers first" },
    ],
  },
  {
    label: "Candidate Name", Icon: SortByAlphaOutlined, color: "#0891B2",
    options: [
      { value: "name_asc",  label: "A to Z" },
      { value: "name_desc", label: "Z to A" },
    ],
  },
];
const SORT_OPTIONS = SORT_GROUPS.flatMap(g => g.options);

// ── Main component ────────────────────────────────────────────────────────────

const ApplicationsPage: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const rows       = useSelector(selectCompanySummary);
  const loading    = useSelector(selectCompanySummaryLoading);
  const pagination = useSelector(selectCompanySummaryPagination);
  const metrics    = useSelector(selectApplicationMetrics);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [postId, setPostId]           = useState("");
  const [postTitle, setPostTitle]     = useState("");
  const [postPickerOpen, setPostPickerOpen] = useState(false);
  const [downloading, setDownloading]       = useState(false);
  const [sort, setSort]               = useState("appliedAt_desc");
  const [page, setPage]               = useState(1);
  const [contactTarget, setContactTarget]     = useState<ContactTarget | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<AssessmentTarget | null>(null);
  const [inviteTarget, setInviteTarget]       = useState<InviteTarget | null>(null);

  useEffect(() => {
    dispatch(fetchCompanyApplicationMetrics());
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [search, status, postId, sort]);

  const load = useCallback(() => {
    dispatch(fetchCompanyApplicationsSummary({
      search:  search  || undefined,
      status:  status  || undefined,
      postId:  postId  || undefined,
      sort:    sort    || undefined,
      page,
      limit: PAGE_SIZE,
    }));
  }, [dispatch, search, status, postId, sort, page]);

  useEffect(() => { load(); }, [load]);

  const handleDownloadCVs = useCallback(async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (search)  params.set("search",  search);
      if (status)  params.set("status",  status);
      if (postId)  params.set("postId",  postId);
      const res = await axiosInstance.get(
        `job-applications/company/my/cvs/download${params.toString() ? `?${params}` : ""}`,
        { responseType: "blob" }
      );
      const url  = URL.createObjectURL(new Blob([res.data], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href  = url;
      link.download = "candidates_cvs.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("No CVs available for the current filters.");
    } finally {
      setDownloading(false);
    }
  }, [search, status, postId]);

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", borderTop: "3px solid #E5E7EB" }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PeopleAltOutlined sx={{ fontSize: 20, color: TEAL }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.2 }}>Applications</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                {loading ? "Loading…" : `${pagination.totalCount} candidate${pagination.totalCount !== 1 ? "s" : ""}`}
              </Typography>
            </Box>
          </Box>

          {/* Filters + Download */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.25, height: 34, minWidth: 220, "&:focus-within": { borderColor: TEAL }, transition: "border-color 0.15s" }}>
              <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
              <InputBase placeholder="Search by name or email…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} sx={{ fontSize: "13px", flex: 1 }} />
            </Box>

            <FormControl size="small">
              <Select value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={selectSx}>
                <MenuItem value=""><em style={{ color: "#9CA3AF", fontStyle: "normal" }}>All statuses</em></MenuItem>
                {Object.entries(STATUS_STYLE).map(([val, { label }]) => (
                  <MenuItem key={val} value={val} sx={{ fontSize: "13px" }}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Post filter trigger */}
            <Box
              onClick={() => setPostPickerOpen(true)}
              sx={{
                display: "flex", alignItems: "center", gap: 0.75, height: 34, px: 1.25,
                bgcolor: postId ? `${TEAL}0D` : "#F9FAFB",
                border: `1px solid ${postId ? TEAL : "#E5E7EB"}`,
                borderRadius: "8px", cursor: "pointer", minWidth: 130, maxWidth: 200,
                transition: "all 0.15s",
                "&:hover": { borderColor: TEAL, bgcolor: `${TEAL}08` },
              }}
            >
              <WorkOutlineOutlined sx={{ fontSize: 14, color: postId ? TEAL : "#9CA3AF", flexShrink: 0 }} />
              <Typography noWrap sx={{ fontSize: "13px", color: postId ? TEAL : "#9CA3AF", flex: 1, fontWeight: postId ? 600 : 400 }}>
                {postId ? postTitle : "All jobs"}
              </Typography>
              {postId && (
                <CloseOutlined
                  sx={{ fontSize: 13, color: TEAL, flexShrink: 0, "&:hover": { opacity: 0.7 } }}
                  onClick={(e) => { e.stopPropagation(); setPostId(""); setPostTitle(""); }}
                />
              )}
            </Box>

            <FormControl size="small">
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                startAdornment={<SortOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
                renderValue={(val) => {
                  const opt = SORT_OPTIONS.find(o => o.value === val);
                  return <Typography sx={{ fontSize: "13px", color: "#374151" }}>{opt?.label ?? "Sort"}</Typography>;
                }}
                sx={selectSx}
                MenuProps={{ PaperProps: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", mt: 0.5, minWidth: 200 } } }}
              >
                {SORT_GROUPS.flatMap((group, gi) => [
                  <ListSubheader key={`h-${gi}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "10px", fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "32px", bgcolor: "#fff", px: 1.5 }}>
                    <group.Icon sx={{ fontSize: 12 }} />{group.label}
                  </ListSubheader>,
                  ...group.options.map(({ value, label }) => (
                    <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${group.color}0D` }, "&.Mui-selected": { bgcolor: `${group.color}12`, "&:hover": { bgcolor: `${group.color}1A` } } }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: sort === value ? 700 : 400, color: sort === value ? group.color : "#374151" }}>{label}</Typography>
                    </MenuItem>
                  )),
                  gi < SORT_GROUPS.length - 1 ? <Divider key={`d-${gi}`} sx={{ my: 0.5, borderColor: "#F3F4F6" }} /> : null,
                ])}
              </Select>
            </FormControl>

            {/* Divider */}
            <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }} />

            {/* Download CVs button */}
            <Tooltip title={pagination.totalCount === 0 ? "No candidates to download" : `Download ${pagination.totalCount} CV${pagination.totalCount !== 1 ? "s" : ""} as ZIP`}>
              <span>
                <Box
                  component="button"
                  onClick={handleDownloadCVs}
                  disabled={downloading || pagination.totalCount === 0}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.75,
                    height: 34, px: 1.5, border: "1px solid",
                    borderColor: downloading || pagination.totalCount === 0 ? "#E5E7EB" : `${TEAL}40`,
                    borderRadius: "8px", cursor: downloading || pagination.totalCount === 0 ? "not-allowed" : "pointer",
                    bgcolor: downloading || pagination.totalCount === 0 ? "#F9FAFB" : `${TEAL}08`,
                    color: downloading || pagination.totalCount === 0 ? "#9CA3AF" : TEAL,
                    transition: "all 0.15s", outline: "none",
                    "&:hover:not(:disabled)": { bgcolor: `${TEAL}14`, borderColor: TEAL },
                  }}
                >
                  {downloading
                    ? <CircularProgress size={13} sx={{ color: TEAL }} />
                    : <FileDownloadOutlined sx={{ fontSize: 15 }} />}
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "inherit", lineHeight: 1 }}>
                    {downloading ? "Preparing…" : "Download CVs"}
                  </Typography>
                </Box>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Metrics */}
      <ApplicationMetrics metrics={metrics} />

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={32} sx={{ color: TEAL }} />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ py: 12, textAlign: "center", border: "1.5px dashed #E5E7EB", borderRadius: "12px", bgcolor: "#FAFAFA" }}>
          <PeopleAltOutlined sx={{ fontSize: 44, color: "#D1D5DB", mb: 1.5 }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
            {search || status || postId ? "No matching applicants" : "No applications yet"}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
            {search || status || postId ? "Try adjusting your filters" : "Applications will appear here once candidates apply"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {rows.map((app: ApplicationSummaryItem) => (
            <ApplicationCard
              key={String(app.id)}
              app={app}
              postId={app.postId || ""}
              showPostTitle
              onContact={setContactTarget}
              onAssessment={setAssessmentTarget}
              onInvite={setInviteTarget}
            />
          ))}

          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                shape="rounded"
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": { fontWeight: 500 },
                  "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 },
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={() => setContactTarget(null)} />
      <AssessmentDetailsModal open={!!assessmentTarget} target={assessmentTarget} onClose={() => setAssessmentTarget(null)} />
      <InviteToInterviewModal
        open={!!inviteTarget}
        target={inviteTarget}
        onClose={() => setInviteTarget(null)}
        onSuccess={load}
      />
      <PostPickerModal
        open={postPickerOpen}
        selectedId={postId}
        onSelect={(id, title) => { setPostId(id); setPostTitle(title); setPostPickerOpen(false); }}
        onClose={() => setPostPickerOpen(false)}
      />
    </DashboardLayout>
  );
};

// ── Post Picker Modal ─────────────────────────────────────────────────────────

interface PostPickerModalProps {
  open: boolean;
  selectedId: string;
  onSelect: (id: string, title: string) => void;
  onClose: () => void;
}

const POST_PICKER_PAGE_SIZE = 8;

const PostPickerModal: React.FC<PostPickerModalProps> = ({ open, selectedId, onSelect, onClose }) => {
  const dispatch      = useDispatch<AppDispatch>();
  const posts         = useSelector(selectMyPosts) as any[];
  const postsLoading  = useSelector(selectMyPostsLoading);
  const postsPagination = useSelector(selectMyPostsPagination) as any;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch on open / search / page change
  useEffect(() => {
    if (!open) return;
    dispatch(fetchMyPosts({ search: search || undefined, page, limit: POST_PICKER_PAGE_SIZE }));
  }, [open, search, page, dispatch]);

  // Reset on close
  useEffect(() => {
    if (!open) { setSearchInput(""); setSearch(""); setPage(1); }
  }, [open]);

  const totalPages = postsPagination?.totalPages ?? 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WorkOutlineOutlined sx={{ fontSize: 16, color: TEAL }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>Filter by Job</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Select a job post to filter applications</Typography>
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
            placeholder="Search job posts…"
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

        {/* "All jobs" option */}
        <Box
          onClick={() => onSelect("", "")}
          sx={{
            display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, mb: 0.5,
            borderRadius: "10px", cursor: "pointer", border: "1px solid",
            borderColor: !selectedId ? TEAL : "transparent",
            bgcolor: !selectedId ? `${TEAL}0D` : "transparent",
            "&:hover": { bgcolor: !selectedId ? `${TEAL}14` : "#F9FAFB" },
            transition: "all 0.12s",
          }}
        >
          <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: !selectedId ? `${TEAL}18` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LayersOutlined sx={{ fontSize: 16, color: !selectedId ? TEAL : "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontSize: "13px", fontWeight: !selectedId ? 700 : 500, color: !selectedId ? TEAL : "#374151", flex: 1 }}>
            All jobs
          </Typography>
          {!selectedId && <CheckOutlined sx={{ fontSize: 16, color: TEAL }} />}
        </Box>

        <Divider sx={{ mb: 1, borderColor: "#F3F4F6" }} />

        {/* Post list */}
        {postsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: TEAL }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <WorkOutlineOutlined sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
              {search ? "No posts match your search" : "No job posts found"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {posts.map((p: any) => {
              const id        = p._id ?? p.id;
              const title     = p.jobDetails?.title ?? p.title ?? "Untitled";
              const empType   = p.jobDetails?.employmentType ?? "";
              const createdAt = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;
              const isActive  = id === selectedId;
              return (
                <Box
                  key={id}
                  onClick={() => onSelect(id, title)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1,
                    borderRadius: "10px", cursor: "pointer", border: "1px solid",
                    borderColor: isActive ? TEAL : "transparent",
                    bgcolor: isActive ? `${TEAL}0D` : "transparent",
                    "&:hover": { bgcolor: isActive ? `${TEAL}14` : "#F9FAFB" },
                    transition: "all 0.12s",
                  }}
                >
                  <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: isActive ? `${TEAL}18` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <WorkOutlineOutlined sx={{ fontSize: 16, color: isActive ? TEAL : "#9CA3AF" }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? TEAL : "#111827" }}>
                      {title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.15, flexWrap: "wrap" }}>
                      {empType && (
                        <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{empType}</Typography>
                      )}
                      {empType && createdAt && (
                        <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                      )}
                      {createdAt && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                          <CalendarTodayOutlined sx={{ fontSize: 10, color: "#9CA3AF" }} />
                          <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{createdAt}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {isActive && <CheckOutlined sx={{ fontSize: 16, color: TEAL, flexShrink: 0 }} />}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": { fontWeight: 500, fontSize: "12px" },
                "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 },
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectSx = {
  height: 34, fontSize: "13px", bgcolor: "#F9FAFB",
  border: "1px solid #E5E7EB", borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

export default ApplicationsPage;
