import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Skeleton, Button, InputBase, Avatar, LinearProgress } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import {
  fetchCandidateApplications,
  selectCandidateApplications,
  selectCandidateApplicationsLoading,
  selectCandidateApplicationsPagination,
} from "@/store/slices/jobApplicationSlice";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBD  = "#99F6E4";
const NAVY = "#0D1B2A";

const PAGE_SIZE = 9;

const STATUS: Record<string, { bg: string; color: string; border: string; label: string; glow: string }> = {
  applied:             { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", label: "Applied",             glow: "#2563EB20" },
  pending:             { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Pending",             glow: "#D9770620" },
  shortlisted:         { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Shortlisted",         glow: "#16A34A20" },
  accepted:            { bg: TBG,       color: T,         border: TBD,       label: "Accepted",            glow: `${T}20`   },
  rejected:            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Rejected",            glow: "#DC262620" },
  withdrawn:           { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", label: "Withdrawn",           glow: "#6B728020" },
  interview_scheduled: { bg: "#F5F0FF", color: "#7C3AED", border: "#DDD6FE", label: "Interview Scheduled", glow: "#7C3AED20" },
  interview_completed: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Interview Completed", glow: "#05966920" },
  viewed:              { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1", label: "Viewed",              glow: "#47556920" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

const fmtSalary = (salary: any) => {
  if (!salary?.min && !salary?.max) return null;
  const cur = salary.currency || "$";
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
  if (salary.min && salary.max) return `${cur}${fmt(salary.min)} – ${cur}${fmt(salary.max)}`;
  if (salary.max) return `Up to ${cur}${fmt(salary.max)}`;
  return `${cur}${fmt(salary.min)}+`;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#059669";
  if (score >= 60) return T;
  if (score >= 40) return "#D97706";
  return "#DC2626";
};

// ── Skeleton ────────────────────────────────────────────────
const CardSkeleton = () => (
  <Box sx={{ borderRadius: "18px", border: "1px solid #E5E7EB", overflow: "hidden", bgcolor: "#fff" }}>
    <Skeleton variant="rectangular" height={5} sx={{ bgcolor: "#F3F4F6" }} />
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: "14px", flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="50%" height={14} />
          <Skeleton variant="text" width="40%" height={14} />
        </Box>
        <Skeleton variant="rounded" width={88} height={26} sx={{ borderRadius: "20px" }} />
      </Box>
      <Skeleton variant="rounded" height={6} sx={{ borderRadius: "99px", mb: 2 }} />
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "8px" }} />
        <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "8px" }} />
      </Box>
      <Skeleton variant="rounded" height={36} sx={{ borderRadius: "10px" }} />
    </Box>
  </Box>
);

// ── Application card ────────────────────────────────────────
const AppCard: React.FC<{ app: any; onClick: () => void }> = ({ app, onClick }) => {
  const post    = app.post    || {};
  const company = app.company || {};
  const jd      = post.jobDetails || {};

  const title          = jd.title          || "Untitled Position";
  const companyName    = company.companyName || "";
  const location       = jd.location        || "";
  const employmentType = jd.employmentType  || "";
  const workMode       = jd.workMode        || "";
  const expLevel       = jd.experienceLevel || "";
  const salary         = fmtSalary(jd.salary);
  const matchScore     = app.matchScore != null ? Math.round(app.matchScore) : null;
  const assessScore    = app.assessmentScore != null ? Math.round(app.assessmentScore) : null;
  const appliedDate    = fmtDate(app.appliedAt || app.createdAt);
  const rawStatus      = (app.status || "applied").toLowerCase();
  const sc             = STATUS[rawStatus] ?? STATUS.applied;
  const logoUrl        = company.logo
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}`
    : undefined;

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "18px",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        "&:hover": {
          borderColor: sc.color,
          boxShadow: `0 12px 32px ${sc.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
          transform: "translateY(-3px)",
        },
      }}
    >
      {/* Color bar */}
      <Box sx={{ height: 5, background: `linear-gradient(90deg, ${sc.color}, ${sc.color}70)` }} />

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.75, flex: 1 }}>

        {/* ── Row 1: Logo + title + status ── */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar
            src={logoUrl}
            variant="rounded"
            sx={{
              width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
              bgcolor: sc.bg, border: `1.5px solid ${sc.border}`,
              "& img": { objectFit: "contain", p: "5px" },
            }}
          >
            <BusinessOutlined sx={{ fontSize: 24, color: sc.color }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
              {title}
            </Typography>
            {companyName && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}>
                <BusinessOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.73rem", color: "#6B7280", fontWeight: 600 }}>{companyName}</Typography>
              </Box>
            )}
            {location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
                <LocationOnOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{location}</Typography>
              </Box>
            )}
          </Box>

          {/* Status pill */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 0.5,
            px: 1.25, py: 0.5, borderRadius: "20px",
            bgcolor: sc.bg, border: `1.5px solid ${sc.border}`,
            flexShrink: 0,
          }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.color, boxShadow: `0 0 0 2px ${sc.glow}` }} />
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: sc.color, whiteSpace: "nowrap" }}>{sc.label}</Typography>
          </Box>
        </Box>

        {/* ── Row 2: Match score bar ── */}
        {matchScore !== null && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TrendingUpOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.67rem", color: "#9CA3AF", fontWeight: 500 }}>CV Match</Typography>
              </Box>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: getScoreColor(matchScore) }}>{matchScore}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={matchScore}
              sx={{
                height: 5, borderRadius: "99px",
                bgcolor: "#F3F4F6",
                "& .MuiLinearProgress-bar": { bgcolor: getScoreColor(matchScore), borderRadius: "99px" },
              }}
            />
          </Box>
        )}

        {/* ── Row 3: Tags ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {employmentType && (
            <Chip label={employmentType} size="small" sx={{ height: 22, fontSize: "0.63rem", fontWeight: 600, bgcolor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "7px" }} />
          )}
          {workMode && (
            <Chip label={workMode} size="small" sx={{ height: 22, fontSize: "0.63rem", fontWeight: 600, bgcolor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "7px" }} />
          )}
          {expLevel && (
            <Chip label={expLevel} size="small" sx={{ height: 22, fontSize: "0.63rem", fontWeight: 600, bgcolor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "7px" }} />
          )}
          {salary && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, px: 1, height: 22, borderRadius: "7px", bgcolor: TBG, border: `1px solid ${TBD}` }}>
              <AttachMoneyOutlined sx={{ fontSize: 11, color: T }} />
              <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: T }}>{salary}</Typography>
            </Box>
          )}
          {assessScore !== null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, px: 1, height: 22, borderRadius: "7px", bgcolor: `${getScoreColor(assessScore)}10`, border: `1px solid ${getScoreColor(assessScore)}30` }}>
              <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: getScoreColor(assessScore) }}>Score {assessScore}%</Typography>
            </Box>
          )}
        </Box>

        {/* ── Row 4: Footer ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, mt: "auto", borderTop: "1px dashed #F3F4F6" }}>
          {appliedDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.67rem", color: "#9CA3AF" }}>Applied {appliedDate}</Typography>
            </Box>
          )}
          <Button
            size="small"
            sx={{
              ml: "auto",
              textTransform: "none", fontWeight: 700, fontSize: "0.73rem",
              color: "#fff", bgcolor: sc.color,
              borderRadius: "9px", px: 2, py: 0.6, minWidth: 0, boxShadow: "none",
              "&:hover": { bgcolor: sc.color, opacity: 0.88, boxShadow: `0 4px 12px ${sc.glow}` },
              transition: "all 0.15s",
            }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ── Main component ──────────────────────────────────────────
const CandidateApplications: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const router     = useRouter();
  const applications = useSelector(selectCandidateApplications);
  const loading      = useSelector(selectCandidateApplicationsLoading);
  const { currentPage, totalPages, totalCount } = useSelector(selectCandidateApplicationsPagination);

  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchCandidateApplications({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  const goToPage = (p: number) =>
    dispatch(fetchCandidateApplications({ page: p, limit: PAGE_SIZE }));

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    const s = (app.status || "applied").toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filtered = applications.filter(app => {
    const title   = (app.post?.jobDetails?.title || "").toLowerCase();
    const company = (app.company?.companyName    || "").toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || title.includes(q) || company.includes(q);
    const matchFilter = activeFilter === "all" || (app.status || "applied").toLowerCase() === activeFilter;
    return matchSearch && matchFilter;
  });

  const filterOptions = [
    { key: "all", label: "All", count: totalCount, color: T },
    ...Object.keys(statusCounts).map(s => ({ key: s, label: STATUS[s]?.label || s, count: statusCounts[s], color: STATUS[s]?.color || T })),
  ];

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{
        bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB",
        p: 3, mb: 2.5, overflow: "hidden", position: "relative",
      }}>
        {/* Decorative teal glow */}
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: `${T}08`, pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WorkOutlineOutlined sx={{ fontSize: 20, color: T }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: NAVY, lineHeight: 1 }}>My Applications</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.2 }}>Track and manage all your job applications</Typography>
              </Box>
            </Box>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {[
              { label: "Total",       value: totalCount,                          color: T       },
              { label: "Accepted",    value: statusCounts["accepted"]    ?? 0,    color: "#059669" },
              { label: "Pending",     value: (statusCounts["pending"] ?? 0) + (statusCounts["applied"] ?? 0), color: "#D97706" },
              { label: "Rejected",    value: statusCounts["rejected"]    ?? 0,    color: "#DC2626" },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ textAlign: "center", px: 1.75, py: 1, borderRadius: "12px", bgcolor: `${color}0D`, border: `1px solid ${color}25`, minWidth: 56 }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Search + filter row */}
        <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.85, borderRadius: "11px",
            border: "1px solid #E5E7EB", bgcolor: "#FAFAFA",
            flex: "1 1 220px", maxWidth: 320,
            "&:focus-within": { borderColor: T, bgcolor: "#fff", boxShadow: `0 0 0 3px ${T}15` },
            transition: "all 0.2s",
          }}>
            <SearchOutlined sx={{ fontSize: 17, color: "#9CA3AF", flexShrink: 0 }} />
            <InputBase
              placeholder="Search job title or company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ fontSize: "0.8rem", flex: 1, color: "#111827", "& input::placeholder": { color: "#9CA3AF" } }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FilterListOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500 }}>Filter:</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {filterOptions.map(({ key, label, count, color }) => (
              <Box
                key={key}
                onClick={() => setActiveFilter(key)}
                sx={{
                  px: 1.25, py: 0.45, borderRadius: "20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 0.6,
                  border: activeFilter === key ? `1.5px solid ${color}` : "1.5px solid #E5E7EB",
                  bgcolor: activeFilter === key ? `${color}12` : "#fff",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: color, bgcolor: `${color}08` },
                }}
              >
                {key !== "all" && <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />}
                <Typography sx={{ fontSize: "0.7rem", fontWeight: activeFilter === key ? 700 : 500, color: activeFilter === key ? color : "#6B7280" }}>
                  {label}
                </Typography>
                <Box sx={{ px: 0.65, py: 0.1, borderRadius: "8px", bgcolor: activeFilter === key ? color : "#F3F4F6" }}>
                  <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: activeFilter === key ? "#fff" : "#9CA3AF" }}>{count}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Grid ── */}
      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </Box>

      ) : filtered.length === 0 ? (
        <Box sx={{ py: 12, textAlign: "center", bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB" }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WorkOutlineOutlined sx={{ fontSize: 32, color: T }} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: NAVY, fontSize: "1rem", mb: 0.5 }}>No applications found</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.82rem" }}>
            {search || activeFilter !== "all" ? "Try a different search or filter" : "Apply to job posts via interview links to see them here"}
          </Typography>
        </Box>

      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {filtered.map((app: any, i: number) => (
            <AppCard
              key={app._id || i}
              app={app}
              onClick={() => router.push(`/dashboard/candidate/applications/${app._id}`)}
            />
          ))}
        </Box>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 4, flexWrap: "wrap", gap: 2 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
            Showing page <b>{currentPage}</b> of <b>{totalPages}</b> · <b>{totalCount}</b> applications total
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            <Button
              size="small"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              sx={{ minWidth: 36, height: 36, borderRadius: "9px", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 700, fontSize: "1rem", "&:disabled": { opacity: 0.3 }, "&:hover:not(:disabled)": { bgcolor: "#F3F4F6" } }}
            >‹</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage >= totalPages - 3 ? totalPages - 6 + i : currentPage - 3 + i;
              return (
                <Button
                  key={p}
                  size="small"
                  onClick={() => goToPage(p)}
                  sx={{
                    minWidth: 36, height: 36, borderRadius: "9px", fontWeight: 700, fontSize: "0.82rem",
                    border: p === currentPage ? `1.5px solid ${T}` : "1px solid #E5E7EB",
                    bgcolor: p === currentPage ? T : "transparent",
                    color: p === currentPage ? "#fff" : "#374151",
                    "&:hover": { bgcolor: p === currentPage ? TL : "#F3F4F6" },
                    transition: "all 0.15s",
                  }}
                >{p}</Button>
              );
            })}
            <Button
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              sx={{ minWidth: 36, height: 36, borderRadius: "9px", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 700, fontSize: "1rem", "&:disabled": { opacity: 0.3 }, "&:hover:not(:disabled)": { bgcolor: "#F3F4F6" } }}
            >›</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CandidateApplications;
