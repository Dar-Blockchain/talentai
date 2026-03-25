import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import {
  Box, Typography, Avatar, Chip, Skeleton, Pagination, Divider,
  TextField, InputAdornment, MenuItem, Select, Button,
} from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUp";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchCompanyApplications, fetchCompanyApplicationMetrics } from "@/store/slices/jobApplicationSlice";

const PAGE_SIZE = 8;
const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);


const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  applied:     { bg: "#EFF6FF", color: "#2563EB" },
  pending:     { bg: "#FFFBEB", color: "#D97706" },
  shortlisted: { bg: "#F0FDF4", color: "#16A34A" },
  accepted:    { bg: "#F0FDFA", color: "#0D9488" },
  rejected:    { bg: "#FEF2F2", color: "#DC2626" },
  withdrawn:   { bg: "#F3F4F6", color: "#6B7280" },
};

const ApplicationsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { applications, allApplications, metrics: fetchedMetrics, loading } = useSelector(
    (state: RootState) => state.jobApplications
  );

  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [postFilter, setPostFilter] = useState("all");

  // On mount: fetch metrics + initial applications
  useEffect(() => {
    dispatch(fetchCompanyApplicationMetrics());
    dispatch(fetchCompanyApplications({}));
  }, [dispatch]);

  // Re-fetch with API params on filter change (debounced 400ms for text, immediate for post)
  useEffect(() => {
    const params: { candidateName?: string; skill?: string; postId?: string } = {};
    if (nameSearch.trim()) params.candidateName = nameSearch.trim();
    if (skillSearch.trim()) params.skill = skillSearch.trim();
    if (postFilter !== "all") params.postId = postFilter;

    const timer = setTimeout(() => {
      dispatch(fetchCompanyApplications(params));
      setPage(1);
    }, nameSearch || skillSearch ? 400 : 0);

    return () => clearTimeout(timer);
  }, [nameSearch, skillSearch, postFilter, dispatch]);

  // ── Unique post titles for filter (from full list) ─────────────────────────
  const postOptions = useMemo(() => {
    const seen = new Map<string, string>();
    allApplications.forEach((a) => {
      if (a.post?._id) seen.set(a.post._id, a.post.jobDetails?.title || a.post.title || a.post._id);
    });
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [allApplications]);

  const totalPages = Math.ceil(applications.length / PAGE_SIZE);
  const paged = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (fn: () => void) => { fn(); setPage(1); };

  const selectSx = {
    fontSize: "0.82rem", height: 38, borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Applications"
        subtitle={loading ? "Loading..." : `${applications.length} applicant${applications.length !== 1 ? "s" : ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Applications" },
        ]}
      />

      {/* ── Metrics ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { icon: PeopleOutlined, label: "Total Applicants", value: !fetchedMetrics ? null : fetchedMetrics.totalApplicants, color: "#8310FF", bg: "rgba(131,16,255,0.08)" },
          { icon: AssignmentIndOutlined, label: "Job Posts", value: !fetchedMetrics ? null : fetchedMetrics.totalJobPosts, color: "#0D9488", bg: "#F0FDFA" },
          { icon: StarOutlined, label: "Avg CV Score", value: !fetchedMetrics ? null : fetchedMetrics.avgCVScore ? `${fetchedMetrics.avgCVScore}%` : "—", color: "#F59E0B", bg: "#FFFBEB" },
          { icon: TrendingUpOutlined, label: "Top CV Score", value: !fetchedMetrics ? null : fetchedMetrics.topCVScore ? `${fetchedMetrics.topCVScore}%` : "—", color: "#3B82F6", bg: "#EFF6FF" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Box key={label} sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: "10px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon sx={{ fontSize: 20, color }} />
            </Box>
            <Box>
              {value === null ? <Skeleton variant="text" width={50} height={28} /> : (
                <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Typography>
              )}
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.4 }}>{label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", p: 2, mb: 2.5, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
        <TextField
          placeholder="Search by candidate name…"
          size="small"
          value={nameSearch}
          onChange={(e) => handleFilterChange(() => setNameSearch(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: { fontSize: "0.82rem", borderRadius: "10px", height: 38 },
          }}
          sx={{ flex: "1 1 180px", minWidth: 160, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
        />
        <TextField
          placeholder="Filter by skill…"
          size="small"
          value={skillSearch}
          onChange={(e) => handleFilterChange(() => setSkillSearch(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start"><CodeOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: { fontSize: "0.82rem", borderRadius: "10px", height: 38 },
          }}
          sx={{ flex: "1 1 160px", minWidth: 140, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
        />

        {postOptions.length > 0 && (
          <Select value={postFilter} onChange={(e) => handleFilterChange(() => setPostFilter(e.target.value))} sx={{ ...selectSx, minWidth: 180, maxWidth: 240 }}>
            <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>All Job Posts</MenuItem>
            {postOptions.map(({ id, title }) => (
              <MenuItem key={id} value={id} sx={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{title}</MenuItem>
            ))}
          </Select>
        )}

        {(nameSearch || skillSearch || postFilter !== "all") && (
          <Chip
            label={`${applications.length} result${applications.length !== 1 ? "s" : ""}`}
            size="small"
            onDelete={() => { setNameSearch(""); setSkillSearch(""); setPostFilter("all"); setPage(1); }}
            sx={{ height: 28, fontSize: "0.75rem", fontWeight: 600, bgcolor: "rgba(131,16,255,0.08)", color: "#8310FF" }}
          />
        )}
      </Box>

      {/* ── Cards ── */}
      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={52} height={52} />
                <Box><Skeleton variant="text" width={130} height={18} /><Skeleton variant="text" width={90} height={13} /></Box>
              </Box>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 1.5 }} />
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
      ) : paged.length === 0 ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", py: 12, textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WorkOutlineOutlined sx={{ fontSize: 32, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#374151", mb: 0.5 }}>No applications found</Typography>
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>Try adjusting your filters</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            {paged.map((app: any, i: number) => {
              const profile = app.profile || {};
              const cv = app.cvAnalysis || {};
              const name = profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : cv.name || "Candidate";
              const title = cv.title || "";
              const skills: string[] = cv.skills || profile.skills?.map((s: any) => s.name) || [];
              const cvScore = app.matchScore ?? cv.analysisScore ?? null;
              const postTitle = app.post?.jobDetails?.title || "—";
              const status = (app.status || "applied").toLowerCase();
              const sc = STATUS_STYLE[status] ?? STATUS_STYLE.applied;

              return (
                <Box
                  key={app._id || i}
                  onClick={() => router.push(`/company/applications/${app._id}`)}
                  sx={{
                    bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB",
                    overflow: "hidden", display: "flex", flexDirection: "column",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: AVATAR_COLORS[((page - 1) * PAGE_SIZE + i) % AVATAR_COLORS.length], fontSize: "15px", fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</Typography>
                        <Chip label={status.charAt(0).toUpperCase() + status.slice(1)} size="small"
                          sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, flexShrink: 0 }} />
                      </Box>
                      {title && <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</Typography>}
                    </Box>
                    {cvScore != null && (
                      <Box sx={{ flexShrink: 0, textAlign: "center", bgcolor: cvScore >= 70 ? "rgba(5,150,105,0.08)" : cvScore >= 50 ? "rgba(217,119,6,0.08)" : "rgba(220,38,38,0.08)", borderRadius: "10px", px: 1.5, py: 0.75 }}>
                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: cvScore >= 70 ? "#059669" : cvScore >= 50 ? "#D97706" : "#DC2626", lineHeight: 1 }}>{cvScore}%</Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 600 }}>CV Score</Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Skills preview */}
                  {skills.length > 0 && (
                    <Box sx={{ px: 2.5, py: 1.25, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {skills.slice(0, 5).map((s: string) => (
                        <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#374151" }} />
                      ))}
                      {skills.length > 5 && <Chip label={`+${skills.length - 5}`} size="small" sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: "rgba(131,16,255,0.08)", color: "#8310FF" }} />}
                    </Box>
                  )}

                  <Divider />

                  {/* Footer */}
                  <Box sx={{ px: 2.5, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#FAFAFA" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <WorkOutlineOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{postTitle}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{fmtDate(app.appliedAt || app.createdAt)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: "#8310FF" }}>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Details</Typography>
                      <ArrowForwardOutlined sx={{ fontSize: 11 }} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 500,
                    "&.Mui-selected": { bgcolor: "rgba(131,16,255,0.1)", color: "#8310FF", fontWeight: 700 },
                    "&:hover": { bgcolor: "#F3F4F6" },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ApplicationsPage;
