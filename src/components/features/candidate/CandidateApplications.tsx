import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Avatar, Button, InputBase, Skeleton, Collapse } from "@mui/material";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlined from "@mui/icons-material/ExpandLessOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
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
const TBG  = "#F0FDFA";
const TBD  = "#99F6E4";
const NAVY = "#0F172A";

const PAGE_SIZE = 9;

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  applied:             { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  pending:             { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  shortlisted:         { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  accepted:            { color: T,         bg: TBG,       border: TBD       },
  rejected:            { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  withdrawn:           { color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
  interview_scheduled: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  interview_completed: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  viewed:              { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
  visited:             { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

const fmtSalary = (s: any) => {
  if (!s?.min && !s?.max) return null;
  const c = s.currency || "$";
  const f = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
  if (s.min && s.max) return `${c}${f(s.min)} – ${c}${f(s.max)}`;
  return s.max ? `≤${c}${f(s.max)}` : `${c}${f(s.min)}+`;
};

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? T : s >= 40 ? "#D97706" : "#DC2626";

// ── Skeleton ─────────────────────────────────────────────────
const CardSkeleton = () => (
  <Box sx={{ p: 2, display: "flex", gap: 1.5, borderBottom: "1px solid #F1F5F9" }}>
    <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "12px", flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="30%" height={14} />
    </Box>
    <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "20px", flexShrink: 0 }} />
  </Box>
);

// ── Application card ─────────────────────────────────────────
const AppCard: React.FC<{ app: any; onClick: () => void; last: boolean; s: (k: string, opts?: any) => string }> = ({ app, onClick, last, s }) => {
  const post    = app.post    || {};
  const company = app.company || {};
  const jd      = post.jobDetails || {};

  const title       = jd.title           || "Untitled Position";
  const companyName = company.companyName || "";
  const location    = jd.location        || "";
  const salary      = fmtSalary(jd.salary);
  const matchScore  = app.matchScore != null ? Math.round(app.matchScore) : null;
  const appliedDate = fmtDate(app.appliedAt || app.createdAt);
  const rawStatus   = (app.status || "applied").toLowerCase();
  const sc          = STATUS_COLORS[rawStatus] ?? STATUS_COLORS.applied;
  const statusKey = `candidate.my_applications.status.${rawStatus}`;
  const statusCandidate = s(`status.${rawStatus}`);
  const statusLabel = statusCandidate === statusKey ? rawStatus : statusCandidate;
  const logoUrl     = company.logo
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}`
    : undefined;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", gap: 1.5, px: 2.5, py: 2,
        cursor: "pointer", transition: "background 0.12s",
        borderBottom: last ? "none" : "1px solid #F1F5F9",
        "&:hover": { bgcolor: "#F8FAFC" },
      }}
    >
      {/* Logo */}
      <Avatar
        src={logoUrl}
        variant="rounded"
        sx={{
          width: 48, height: 48, borderRadius: "12px", flexShrink: 0,
          bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
          "& img": { objectFit: "contain", p: "6px" },
        }}
      >
        <BusinessOutlined sx={{ fontSize: 22, color: "#94A3B8" }} />
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.4 }}>
          <Typography
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            sx={{
              fontSize: "0.9rem", fontWeight: 700, color: NAVY, lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              cursor: "pointer",
              "&:hover": { color: T, textDecoration: "underline" },
              transition: "color 0.15s",
            }}
          >
            {title}
          </Typography>
          {/* Status badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 1, py: 0.3, borderRadius: "20px", bgcolor: sc.bg, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.color }} />
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: sc.color, whiteSpace: "nowrap" }}>{statusLabel}</Typography>
          </Box>
        </Box>

        {/* Company + location */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.6 }}>
          {companyName && (
            <Typography sx={{ fontSize: "0.78rem", color: "#475569", fontWeight: 500 }}>{companyName}</Typography>
          )}
          {companyName && location && (
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#CBD5E1" }} />
          )}
          {location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <LocationOnOutlined sx={{ fontSize: 11, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{location}</Typography>
            </Box>
          )}
        </Box>

        {/* Meta row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {salary && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <AttachMoneyOutlined sx={{ fontSize: 11, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>{salary}</Typography>
            </Box>
          )}
          {matchScore !== null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <TrendingUpOutlined sx={{ fontSize: 11, color: getScoreColor(matchScore) }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: getScoreColor(matchScore) }}>{s("match", { score: matchScore })}</Typography>
            </Box>
          )}
          {appliedDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <AccessTimeOutlined sx={{ fontSize: 11, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{s("applied_date", { date: appliedDate })}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────
interface CandidateApplicationsProps {
  previewCount?: number;
  onViewAll?: () => void;
}

const CandidateApplications: React.FC<CandidateApplicationsProps> = ({ previewCount, onViewAll }) => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any): string => t(`candidate.my_applications.${k}`, opts) as string;
  const statusLabel = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };

  const dispatch     = useDispatch<AppDispatch>();
  const router       = useRouter();
  const applications = useSelector(selectCandidateApplications);
  const loading      = useSelector(selectCandidateApplicationsLoading);
  const { currentPage, totalPages, totalCount } = useSelector(selectCandidateApplicationsPagination);

  const [search,       setSearch]       = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded,     setExpanded]     = useState(false);

  const COLLAPSE_SIZE = 4;

  const fetchLimit = previewCount ?? PAGE_SIZE;

  useEffect(() => {
    dispatch(fetchCandidateApplications({ page: 1, limit: fetchLimit }));
  }, [dispatch, fetchLimit]);

  const goToPage = (p: number) =>
    dispatch(fetchCandidateApplications({ page: p, limit: fetchLimit }));

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    const st = (app.status || "applied").toLowerCase();
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const filtered = applications.filter(app => {
    const title   = (app.post?.jobDetails?.title   || "").toLowerCase();
    const company = (app.company?.companyName      || "").toLowerCase();
    const q       = search.toLowerCase();
    const matchSearch = !q || title.includes(q) || company.includes(q);
    const matchFilter = activeFilter === "all" || (app.status || "applied").toLowerCase() === activeFilter;
    return matchSearch && matchFilter;
  });

  const displayed = previewCount != null ? filtered.slice(0, previewCount) : filtered;

  const filterOptions = [
    { key: "all", label: s("status.all"), count: totalCount, color: T },
    ...Object.keys(statusCounts).map(key => ({
      key, label: statusLabel(key), count: statusCounts[key], color: STATUS_COLORS[key]?.color || T,
    })),
  ];

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WorkOutlineOutlined sx={{ fontSize: 18, color: T }} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: NAVY }}>{s("title")}</Typography>
            <Box sx={{ px: 1, py: 0.15, borderRadius: "20px", bgcolor: TBG, border: `1px solid ${TBD}` }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: T }}>{totalCount}</Typography>
            </Box>
          </Box>

          {previewCount != null && onViewAll && (
            <Typography
              onClick={onViewAll}
              sx={{ fontSize: "0.78rem", fontWeight: 600, color: T, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              {s("view_all")}
            </Typography>
          )}
        </Box>

        {/* Search + filter — full mode */}
        {previewCount == null && (
          <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.6,
              borderRadius: "8px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
              flex: "1 1 180px", maxWidth: 260,
              "&:focus-within": { borderColor: T, bgcolor: "#fff" }, transition: "all 0.15s",
            }}>
              <SearchOutlined sx={{ fontSize: 14, color: "#94A3B8" }} />
              <InputBase placeholder={s("search_placeholder")} value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ fontSize: "0.75rem", flex: 1, "& input::placeholder": { color: "#94A3B8" } }} />
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {filterOptions.map(({ key, label, count, color }) => (
                <Box key={key} onClick={() => setActiveFilter(key)} sx={{
                  display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.3,
                  borderRadius: "20px", cursor: "pointer",
                  border: activeFilter === key ? `1.5px solid ${color}` : "1px solid #E2E8F0",
                  bgcolor: activeFilter === key ? `${color}0F` : "#fff", transition: "all 0.12s",
                }}>
                  {key !== "all" && <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: color }} />}
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: activeFilter === key ? 700 : 500, color: activeFilter === key ? color : "#64748B" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: activeFilter === key ? color : "#94A3B8" }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── List ── */}
      {loading ? (
        <Box>
          {Array.from({ length: previewCount ?? 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </Box>
      ) : displayed.length === 0 ? (
        <Box sx={{ py: 7, textAlign: "center" }}>
          <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
            <WorkOutlineOutlined sx={{ fontSize: 22, color: "#94A3B8" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: NAVY, fontSize: "0.85rem", mb: 0.4 }}>{s("empty_title")}</Typography>
          <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>{s("empty_subtitle")}</Typography>
        </Box>
      ) : (
        <Box>
          {/* Always-visible first batch */}
          {displayed.slice(0, COLLAPSE_SIZE).map((app: any, i: number) => (
            <AppCard
              key={app._id || i}
              app={app}
              last={!expanded && i === Math.min(COLLAPSE_SIZE, displayed.length) - 1}
              onClick={() => {
                const status = (app.status || "").toLowerCase();
                if (status === "visited" && app.post?._id)
                  router.push(`/candidate/interview/hr?jobId=${app.post._id}`);
                else
                  router.push(`/candidate/applications/${app._id}`);
              }}
              s={s}
            />
          ))}

          {/* Collapsible rest */}
          {displayed.length > COLLAPSE_SIZE && (
            <Collapse in={expanded} timeout={250}>
              {displayed.slice(COLLAPSE_SIZE).map((app: any, i: number) => (
                <AppCard
                  key={app._id || i}
                  app={app}
                  last={i === displayed.length - COLLAPSE_SIZE - 1}
                  onClick={() => {
                    const status = (app.status || "").toLowerCase();
                    if (status === "visited" && app.post?._id)
                      router.push(`/candidate/interview/hr?jobId=${app.post._id}`);
                    else
                      router.push(`/candidate/applications/${app._id}`);
                  }}
                  s={s}
                />
              ))}
            </Collapse>
          )}

          {/* Toggle button */}
          {displayed.length > COLLAPSE_SIZE && (
            <Box
              onClick={() => setExpanded(e => !e)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 1.25, borderTop: "1px solid #F1F5F9", cursor: "pointer",
                bgcolor: "#FAFAFA", transition: "background 0.12s",
                "&:hover": { bgcolor: "#F3F4F6" },
              }}
            >
              {expanded
                ? <ExpandLessOutlined sx={{ fontSize: 16, color: T }} />
                : <ExpandMoreOutlined sx={{ fontSize: 16, color: T }} />}
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: T }}>
                {expanded ? s("show_less") : s("show_more", { count: displayed.length - COLLAPSE_SIZE })}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Pagination ── */}
      {previewCount == null && totalPages > 1 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5, borderTop: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>
            {s("page_of", { current: currentPage, total: totalPages })}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button size="small" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}
              sx={{ minWidth: 30, height: 28, borderRadius: "6px", border: "1px solid #E2E8F0", color: "#374151", fontSize: "0.85rem", "&:disabled": { opacity: 0.3 } }}>‹</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <Button key={p} size="small" onClick={() => goToPage(p)}
                  sx={{ minWidth: 30, height: 28, borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, border: p === currentPage ? `1.5px solid ${T}` : "1px solid #E2E8F0", bgcolor: p === currentPage ? T : "transparent", color: p === currentPage ? "#fff" : "#374151" }}>
                  {p}
                </Button>
              );
            })}
            <Button size="small" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}
              sx={{ minWidth: 30, height: 28, borderRadius: "6px", border: "1px solid #E2E8F0", color: "#374151", fontSize: "0.85rem", "&:disabled": { opacity: 0.3 } }}>›</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CandidateApplications;
