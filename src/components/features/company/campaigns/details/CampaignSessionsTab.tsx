"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Avatar, Skeleton, Alert, IconButton, Dialog, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import SearchOutlined               from "@mui/icons-material/SearchOutlined";
import CloseOutlined                from "@mui/icons-material/CloseOutlined";
import AssignmentOutlined           from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlined          from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AccessTimeOutlined           from "@mui/icons-material/AccessTimeOutlined";
import BlockOutlined                from "@mui/icons-material/BlockOutlined";
import TimerOutlined                from "@mui/icons-material/TimerOutlined";
import VisibilityOutlined           from "@mui/icons-material/VisibilityOutlined";
import { useDispatch, useSelector }  from "react-redux";
import { AppDispatch }               from "@/store/store";
import axiosInstance                 from "@/utils/axiosInstance";
import { ResultsData, QuestionnaireResults, InterviewResults } from "@/components/features/campaign/results/CampaignResultsView";
import {
  fetchCampaignSessions,
  selectCampaignSessions,
  selectCampaignSessionsLoading,
  selectCampaignSessionsError,
  selectCampaignSessionsTotal,
} from "@/store/slices/campaignSlice";
import { SessionStatus } from "@/types/campaign";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function scoreColor(s: number) { return s >= 70 ? "#16A34A" : s >= 40 ? "#D97706" : "#DC2626"; }
function scoreBg  (s: number) { return s >= 70 ? "#F0FDF4" : s >= 40 ? "#FFFBEB" : "#FEF2F2"; }

const SESSION_STATUS: Record<SessionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:     { label: "Pending",     color: "#6B7280", bg: "#F3F4F6", icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: "#D97706", bg: "#FFFBEB", icon: AccessTimeOutlined },
  COMPLETED:   { label: "Completed",   color: "#16A34A", bg: "#F0FDF4", icon: CheckCircleOutlined },
  EXPIRED:     { label: "Expired",     color: "#DC2626", bg: "#FEF2F2", icon: BlockOutlined },
};

const RowSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 1.75, borderBottom: "1px solid #F3F4F6" }}>
    <Skeleton variant="circular" width={38} height={38} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="30%" height={15} />
      <Skeleton variant="text" width="45%" height={13} sx={{ mt: 0.25 }} />
    </Box>
    <Skeleton variant="rounded" width={80}  height={22} sx={{ borderRadius: "999px", flexShrink: 0 }} />
    <Skeleton variant="text"    width={40}  sx={{ flexShrink: 0 }} />
    <Skeleton variant="text"    width={80}  sx={{ flexShrink: 0 }} />
  </Box>
);

interface Props {
  campaignId: string;
  anonymityMode?: string;
}

// ─── Results dialog ───────────────────────────────────────────────────────────

const ResultsDialog: React.FC<{ campaignId: string; participantId: string | null; label: string; onClose: () => void }> = ({ campaignId, participantId, label, onClose }) => {
  const [data,    setData]    = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!participantId) return;
    setLoading(true);
    setData(null);
    setError(null);
    axiosInstance
      .get(`internal-campaigns/${campaignId}/results/${participantId}`)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err?.response?.data?.error ?? "Failed to load results"))
      .finally(() => setLoading(false));
  }, [participantId, campaignId]);

  const moduleType = data?.campaign?.module?.type ?? "QUESTIONNAIRE";

  return (
    <Dialog open={!!participantId} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: "1px solid #F3F4F6" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>
          Results — {label}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF" }}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#8B5CF6" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : data ? (
          moduleType === "QUESTIONNAIRE"
            ? <QuestionnaireResults data={data} />
            : <InterviewResults data={data} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

// ─── Unified sessions view ────────────────────────────────────────────────────

const SessionsView: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const sessions = useSelector(selectCampaignSessions);
  const loading  = useSelector(selectCampaignSessionsLoading);
  const error    = useSelector(selectCampaignSessionsError);
  const total    = useSelector(selectCampaignSessionsTotal);

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  useEffect(() => {
    dispatch(fetchCampaignSessions({ campaignId, search: debouncedSearch || undefined, page, limit: PAGE_SIZE }));
  }, [dispatch, campaignId, debouncedSearch, page]);

  return (
    <Box>
      {/* Results dialog */}
      <ResultsDialog
        campaignId={campaignId}
        participantId={selectedId}
        label={selectedLabel}
        onClose={() => setSelectedId(null)}
      />


      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
          {!loading && `${total} session${total !== 1 ? "s" : ""}${debouncedSearch ? " match your search" : " total"}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", px: 1.5, py: 0.5, minWidth: 220, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
          <input
            type="text"
            placeholder="Search by participant…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "4px 0" }}
          />
          {search && (
            <IconButton size="small" onClick={() => handleSearchChange("")} sx={{ p: 0.25, color: "#9CA3AF" }}>
              <CloseOutlined sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", mt: 1.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 130px 90px 80px 110px 110px", alignItems: "center", px: 2.5, py: 1.25, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          {["Participant", "Status", "Score", "Duration", "Completed", ""].map((h, i) => (
            <Typography key={i} sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
        ) : loading ? (
          <Box>{Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}</Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssignmentOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {debouncedSearch ? "No sessions match your search" : "No sessions yet"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {debouncedSearch ? "Try a different name." : "Sessions will appear here once participants start."}
            </Typography>
          </Box>
        ) : (
          sessions.map((s, i) => {
            const p          = s.participant;
            const isAnon     = s.isAnonymous;
            const name       = isAnon
              ? (p?.firstName ?? "Anonymous")
              : (p ? ((p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || p.username || "Unknown") : "Unknown");
            const email      = isAnon ? null : (p?.email ?? "");
            const letter     = name[0]?.toUpperCase() || "?";
            const statusCfg  = SESSION_STATUS[s.status] ?? SESSION_STATUS.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <Box key={s._id} sx={{
                display: "grid", gridTemplateColumns: "1fr 130px 90px 80px 110px 110px",
                alignItems: "center", px: 2.5, py: 1.5,
                borderBottom: i < sessions.length - 1 ? "1px solid #F3F4F6" : "none",
                "&:hover": { bgcolor: "#FAFAFA" }, transition: "background-color 0.1s",
              }}>
                {/* Identity */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <Avatar sx={{
                    width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                    background: isAnon
                      ? "linear-gradient(135deg, #94A3B8, #CBD5E1)"
                      : "linear-gradient(135deg, #8310FF, #A855F7)",
                  }}>
                    {isAnon ? "?" : letter}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isAnon ? "Identity hidden" : (email || "—")}
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Box>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "3px", borderRadius: "999px", bgcolor: statusCfg.bg, border: `1px solid ${statusCfg.color}25` }}>
                    <StatusIcon sx={{ fontSize: 11, color: statusCfg.color }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</Typography>
                  </Box>
                </Box>

                {/* Score */}
                <Box>
                  {s.score !== undefined ? (
                    <Box sx={{ display: "inline-flex", px: 1.25, py: "3px", borderRadius: 1.5, bgcolor: scoreBg(s.score), border: `1px solid ${scoreColor(s.score)}28` }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: scoreColor(s.score) }}>{s.score}%</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>—</Typography>
                  )}
                </Box>

                {/* Duration */}
                <Box>
                  {s.durationMinutes ? (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                      <TimerOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{s.durationMinutes}m</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>—</Typography>
                  )}
                </Box>

                {/* Completed date */}
                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{fmtDate(s.completedAt || s.startedAt)}</Typography>

                {/* View Results */}
                <Box>
                  {s.status === "COMPLETED" && (
                    <Box
                      onClick={() => { setSelectedId(s._id); setSelectedLabel(name); }}
                      sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.5,
                        px: 1.25, py: "4px", borderRadius: "8px", cursor: "pointer",
                        bgcolor: "#F5F3FF", border: "1px solid #DDD6FE",
                        "&:hover": { bgcolor: "#EDE9FE" }, transition: "background 0.15s",
                      }}
                    >
                      <VisibilityOutlined sx={{ fontSize: 13, color: "#7C3AED" }} />
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED" }}>Results</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {!loading && total > PAGE_SIZE && (
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}
    </Box>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

const CampaignSessionsTab: React.FC<Props> = ({ campaignId }) => {
  return <SessionsView campaignId={campaignId} />;
};

export default CampaignSessionsTab;
