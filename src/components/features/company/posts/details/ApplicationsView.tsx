import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Chip, CircularProgress, Divider, FormControl,
  InputBase, ListSubheader, MenuItem, Pagination, Select, Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import { AppDispatch } from "@/store/store";
import {
  fetchPostApplicationsSummary,
  selectPostSummary,
  selectPostSummaryLoading,
  selectPostSummaryPagination,
  ApplicationSummaryItem,
} from "@/store/slices/jobApplicationSlice";
import ContactCandidateModal, { ContactTarget } from "./ContactCandidateModal";
import AssessmentDetailsModal, { AssessmentTarget } from "./AssessmentDetailsModal";
import InviteToInterviewModal, { InviteTarget } from "@/components/features/company/applications/InviteToInterviewModal";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";

const TEAL = "#0D9488";
const PAGE_SIZE = 10;

const STATUS_STYLE: Record<string, { label: string }> = {
  visited:             { label: "Visited" },
  interview_completed: { label: "Interview Completed" },
};

const SORT_GROUPS = [
  {
    label: "Date Applied",
    Icon: CalendarTodayOutlined,
    color: "#6B7280",
    options: [
      { value: "appliedAt_desc", label: "Most recent first" },
      { value: "appliedAt_asc",  label: "Earliest first"    },
    ],
  },
  {
    label: "Match Score",
    Icon: StarOutlineOutlined,
    color: "#D97706",
    options: [
      { value: "matchScore_desc", label: "Best match first" },
      { value: "matchScore_asc",  label: "Worst match first" },
    ],
  },
  {
    label: "Interview Score",
    Icon: PsychologyOutlined,
    color: "#7C3AED",
    options: [
      { value: "interviewScore_desc", label: "Top performers first"  },
      { value: "interviewScore_asc",  label: "Low performers first" },
    ],
  },
  {
    label: "Candidate Name",
    Icon: SortByAlphaOutlined,
    color: "#0891B2",
    options: [
      { value: "name_asc",  label: "A to Z" },
      { value: "name_desc", label: "Z to A" },
    ],
  },
];

// Flat list for label lookup
const SORT_OPTIONS = SORT_GROUPS.flatMap(g => g.options);

// ── Main component ────────────────────────────────────────────────────────────

interface Props { jobId: string }

const ApplicationsView: React.FC<Props> = ({ jobId }) => {
  const dispatch   = useDispatch<AppDispatch>();
  const rows       = useSelector(selectPostSummary);
  const loading    = useSelector(selectPostSummaryLoading);
  const pagination = useSelector(selectPostSummaryPagination);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [sort, setSort]               = useState("appliedAt_desc");
  const [page, setPage]               = useState(1);
  const [contactTarget, setContactTarget]       = useState<ContactTarget | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<AssessmentTarget | null>(null);
  const [inviteTarget, setInviteTarget]         = useState<InviteTarget | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [search, status, sort]);

  const load = useCallback(() => {
    dispatch(fetchPostApplicationsSummary({
      postId: jobId,
      search:  search  || undefined,
      status:  status  || undefined,
      sort:    sort    || undefined,
      page,
      limit: PAGE_SIZE,
    }));
  }, [dispatch, jobId, search, status, sort, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ mt: 2 }}>

      {/* ── Toolbar ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 1.5, mb: 2.5,
      }}>
        {/* Title + count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: `${TEAL}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PeopleAltOutlined sx={{ fontSize: 17, color: TEAL }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>Applications</Typography>
          {!loading && (
            <Chip
              label={pagination.totalCount}
              size="small"
              sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 700, fontSize: "11px", height: 20, minWidth: 28 }}
            />
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{
            display: "flex", alignItems: "center",
            bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px",
            px: 1.25, height: 34, minWidth: 210,
            "&:focus-within": { borderColor: TEAL },
            transition: "border-color 0.15s",
          }}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
            <InputBase
              placeholder="Search name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ fontSize: "13px", flex: 1 }}
            />
          </Box>

          <FormControl size="small">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
              sx={selectSx}
            >
              <MenuItem value=""><em style={{ color: "#9CA3AF", fontStyle: "normal" }}>All statuses</em></MenuItem>
              {Object.entries(STATUS_STYLE).map(([val, { label }]) => (
                <MenuItem key={val} value={val} sx={{ fontSize: "13px" }}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  <group.Icon sx={{ fontSize: 12 }} />
                  {group.label}
                </ListSubheader>,
                ...group.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${group.color}0D` }, "&.Mui-selected": { bgcolor: `${group.color}12`, "&:hover": { bgcolor: `${group.color}1A` } } }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: sort === value ? 700 : 400, color: sort === value ? group.color : "#374151" }}>
                      {label}
                    </Typography>
                  </MenuItem>
                )),
                gi < SORT_GROUPS.length - 1 ? <Divider key={`d-${gi}`} sx={{ my: 0.5, borderColor: "#F3F4F6" }} /> : null,
              ])}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* ── Content ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ color: TEAL }} />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{
          py: 10, textAlign: "center",
          border: "1.5px dashed #E5E7EB", borderRadius: "12px", bgcolor: "#FAFAFA",
        }}>
          <PeopleAltOutlined sx={{ fontSize: 44, color: "#D1D5DB", mb: 1.5 }} />
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
            {search || status ? "No matching applicants" : "No applications yet"}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
            {search || status ? "Try adjusting your filters" : "Applications will appear here once candidates apply"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {rows.map((app: ApplicationSummaryItem) => (
            <ApplicationCard
              key={String(app.id)}
              app={app}
              postId={jobId}
              onContact={setContactTarget}
              onAssessment={setAssessmentTarget}
              onInvite={setInviteTarget}
            />
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
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

      <ContactCandidateModal
        open={!!contactTarget}
        target={contactTarget}
        onClose={() => setContactTarget(null)}
      />

      <AssessmentDetailsModal
        open={!!assessmentTarget}
        target={assessmentTarget}
        onClose={() => setAssessmentTarget(null)}
      />

      <InviteToInterviewModal
        open={!!inviteTarget}
        target={inviteTarget}
        onClose={() => setInviteTarget(null)}
        onSuccess={() => load()}
      />
    </Box>
  );
};

// ── Shared styles ────────────────────────────────────────────────────────────

const selectSx = {
  height: 34,
  fontSize: "13px",
  bgcolor: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

export default ApplicationsView;
