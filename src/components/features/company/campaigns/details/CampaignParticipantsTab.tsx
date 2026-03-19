"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Avatar, Skeleton, Alert, IconButton } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchCampaignParticipants,
  selectCampaignParticipants,
  selectCampaignParticipantsLoading,
  selectCampaignParticipantsError,
  selectCampaignParticipantsTotal,
} from "@/store/slices/campaignSlice";
import { ParticipantStatus } from "@/types/campaign";
import Pagination from "@/components/ui/Pagination";
import { ROLES } from "@/constants/employee";

const PURPLE = "#8310FF";
const PAGE_SIZE = 10;

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];
function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

const STATUS_CONFIG: Record<ParticipantStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:     { label: "Pending",     color: "#6B7280", bg: "#F3F4F6", icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: "#D97706", bg: "#FFFBEB", icon: AccessTimeOutlined },
  COMPLETED:   { label: "Completed",   color: "#16A34A", bg: "#F0FDF4", icon: CheckCircleOutlined },
};

const RowSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 1.75, borderBottom: "1px solid #F3F4F6" }}>
    <Skeleton variant="circular" width={38} height={38} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="30%" height={15} />
      <Skeleton variant="text" width="48%" height={13} sx={{ mt: 0.25 }} />
    </Box>
    <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: "999px", flexShrink: 0 }} />
    <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "999px", flexShrink: 0 }} />
  </Box>
);

interface Props {
  campaignId: string;
}

const CampaignParticipantsTab: React.FC<Props> = ({ campaignId }) => {
  const dispatch    = useDispatch<AppDispatch>();
  const participants = useSelector(selectCampaignParticipants);
  const loading      = useSelector(selectCampaignParticipantsLoading);
  const error        = useSelector(selectCampaignParticipantsError);
  const total        = useSelector(selectCampaignParticipantsTotal);

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  useEffect(() => {
    dispatch(fetchCampaignParticipants({ campaignId, search: debouncedSearch || undefined, page, limit: PAGE_SIZE }));
  }, [dispatch, campaignId, debouncedSearch, page]);

  // status summary counts
  const pendingCount     = participants.filter(p => p.status === "PENDING").length;
  const inProgressCount  = participants.filter(p => p.status === "IN_PROGRESS").length;
  const completedCount   = participants.filter(p => p.status === "COMPLETED").length;

  return (
    <Box>
      {/* Summary pills */}
      {!loading && !error && total > 0 && (
        <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
          {(["PENDING", "IN_PROGRESS", "COMPLETED"] as ParticipantStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = s === "PENDING" ? pendingCount : s === "IN_PROGRESS" ? inProgressCount : completedCount;
            const Icon = cfg.icon;
            return (
              <Box key={s} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.6, borderRadius: "999px", bgcolor: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                <Icon sx={{ fontSize: 13, color: cfg.color }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: cfg.color }}>{count} {cfg.label}</Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Search + header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
          {!loading && `${total} participant${total !== 1 ? "s" : ""}${debouncedSearch ? " match your search" : " enrolled"}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", px: 1.5, py: 0.5, minWidth: 220, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
          <input
            type="text"
            placeholder="Search participants…"
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

      {/* List */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", mt: 1.5 }}>
        {/* Header row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 90px", alignItems: "center", px: 2.5, py: 1.25, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Participant</Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</Typography>
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Score</Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
        ) : loading ? (
          <Box>{Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}</Box>
        ) : participants.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PeopleAltOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {debouncedSearch ? "No participants match your search" : "No participants yet"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {debouncedSearch ? "Try a different name or email." : "Participants will appear here once they join."}
            </Typography>
          </Box>
        ) : (
          participants.map((p, i) => {
            const name = (p.firstName && p.lastName)
              ? `${p.firstName} ${p.lastName}`
              : p.firstName || p.lastName || p.username || "Unknown";
            const email  = p.email ?? "";
            const letter = name[0]?.toUpperCase() || "U";
            const dept   = typeof p.department === "object" ? p.department?.name : (p.department ?? null);
            const roleStr    = (p.role ?? "") as string;
            const roleEntry  = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
            const roleColor  = roleEntry?.color ?? "#6B7280";
            const roleLabel  = (roleEntry?.label ?? roleStr) || "—";
            const RoleIcon   = roleEntry?.icon ?? null;
            const statusCfg  = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <Box key={p._id} sx={{
                display: "grid", gridTemplateColumns: "1fr 120px 120px 90px",
                alignItems: "center", px: 2.5, py: 1.5,
                borderBottom: i < participants.length - 1 ? "1px solid #F3F4F6" : "none",
                "&:hover": { bgcolor: "#FAFAFA" }, transition: "background-color 0.1s",
              }}>
                {/* Person */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <Avatar sx={{ width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, color: "#fff", background: `linear-gradient(${pickGradient(email || name)})`, flexShrink: 0 }}>
                    {letter}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email}
                      </Typography>
                      {dept && (
                        <>
                          <Typography sx={{ fontSize: "11px", color: "#D1D5DB" }}>·</Typography>
                          <BusinessOutlined sx={{ fontSize: 10, color: "#CBD5E1", flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "11px", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {dept}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Role */}
                <Box>
                  {roleLabel ? (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "3px", borderRadius: "999px", bgcolor: `${roleColor}10`, border: `1px solid ${roleColor}25` }}>
                      {RoleIcon && <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 10 } }}><RoleIcon /></Box>}
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor }}>{roleLabel}</Typography>
                    </Box>
                  ) : <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>—</Typography>}
                </Box>

                {/* Status */}
                <Box>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "3px", borderRadius: "999px", bgcolor: statusCfg.bg, border: `1px solid ${statusCfg.color}25` }}>
                    <StatusIcon sx={{ fontSize: 11, color: statusCfg.color }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</Typography>
                  </Box>
                </Box>

                {/* Score */}
                <Box sx={{ textAlign: "right" }}>
                  {p.score !== undefined ? (
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: p.score >= 70 ? "#16A34A" : p.score >= 40 ? "#D97706" : "#DC2626" }}>
                      {p.score}%
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>—</Typography>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}
    </Box>
  );
};

export default CampaignParticipantsTab;
