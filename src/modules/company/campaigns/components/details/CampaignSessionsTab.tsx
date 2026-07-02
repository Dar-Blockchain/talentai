"use client";

import React, { memo, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Typography, Avatar, Skeleton, Alert, IconButton } from "@mui/material";
import SearchOutlined               from "@mui/icons-material/SearchOutlined";
import CloseOutlined                from "@mui/icons-material/CloseOutlined";
import AssignmentOutlined           from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlined          from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AccessTimeOutlined           from "@mui/icons-material/AccessTimeOutlined";
import BlockOutlined                from "@mui/icons-material/BlockOutlined";
import { useCampaignSessionsQuery } from "../../queries";
import { SessionStatus } from "@/modules/company/campaigns/types/campaign";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

const SKELETON_ROWS_6 = Array.from({ length: 6 });

const fmtDate = (d: string | undefined, locale: string) =>
  d
    ? new Date(d).toLocaleDateString(locale.startsWith("fr") ? "fr-FR" : "en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
    : "—";

function scoreColor(s: number) { return s >= 70 ? "#16A34A" : s >= 40 ? "#D97706" : "#DC2626"; }
function scoreBg  (s: number) { return s >= 70 ? "#F0FDF4" : s >= 40 ? "#FFFBEB" : "#FEF2F2"; }

const SESSION_STATUS_META: Record<SessionStatus, { color: string; bg: string; icon: React.ElementType }> = {
  PENDING:     { color: "#6B7280", bg: "#F3F4F6", icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB", icon: AccessTimeOutlined },
  COMPLETED:   { color: "#16A34A", bg: "#F0FDF4", icon: CheckCircleOutlined },
  EXPIRED:     { color: "#DC2626", bg: "#FEF2F2", icon: BlockOutlined },
};

const GRID_COLS = "1fr 130px 90px 80px 110px" as const;

const TABLE_CARD_SX = {
  bgcolor: "#fff", border: "1px solid #E5E7EB",
  borderRadius: 3, overflow: "hidden", mt: 1.5,
} as const;

const HEADER_ROW_SX = {
  display: "grid", gridTemplateColumns: GRID_COLS,
  alignItems: "center", px: 2.5, py: 1.25,
  bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
} as const;

const COL_LABEL_SX = { fontSize: "11px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.02em" } as const;

const SEARCH_BOX_SX = {
  display: "flex", alignItems: "center",
  bgcolor: "#fff", border: "1px solid #E5E7EB",
  borderRadius: "12px", px: 1.5, py: 0.5,
  minWidth: 220, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
} as const;

const ANON_AVATAR_BG = "linear-gradient(135deg, #94A3B8, #CBD5E1)" as const;
const PURPLE_AVATAR_BG = "linear-gradient(135deg, #8310FF, #A855F7)" as const;

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const RowSkeleton = memo(() => (
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
));
RowSkeleton.displayName = "SessionRowSkeleton";

// ─── Sessions view ────────────────────────────────────────────────────────────

const SessionsView = memo<{ campaignId: string }>(({ campaignId }) => {
  const { t, i18n } = useTranslation("dashboard");
  const sp = "pages.campaigns.detail.sessions";
  const du = "pages.campaigns.detail";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading: loading, error: queryError } = useCampaignSessionsQuery({
    campaignId, search: debouncedSearch || undefined, page, limit: PAGE_SIZE,
  });
  const sessions = data?.data  ?? [];
  const total    = data?.total ?? 0;
  const error    = queryError ? String(queryError) : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const clearSearch  = useCallback(() => handleSearchChange(""), [handleSearchChange]);

  const headerCols = useMemo(() => [
    t(`${sp}.col_participant`),
    t(`${sp}.col_status`),
    t(`${sp}.col_score`),
    t(`${sp}.col_duration`),
    t(`${sp}.col_completed`),
  ], [t, sp]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 0, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
          {!loading && (debouncedSearch
            ? t(`${sp}.matches_search`, { count: total })
            : t(`${sp}.total_sessions`, { count: total }))}
        </Typography>
        <Box sx={SEARCH_BOX_SX}>
          <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0, mr: 1 }} />
          <input
            type="text"
            placeholder={t(`${sp}.search_placeholder`)}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#111827", width: "100%", fontFamily: "inherit", padding: "4px 0" }}
          />
          {search && (
            <IconButton size="small" onClick={clearSearch} sx={{ p: 0.25, color: "#9CA3AF" }}>
              <CloseOutlined sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={TABLE_CARD_SX}>
        <Box sx={HEADER_ROW_SX}>
          {headerCols.map((h) => (
            <Typography key={h} sx={COL_LABEL_SX}>{h}</Typography>
          ))}
        </Box>

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
        ) : loading ? (
          <Box>{SKELETON_ROWS_6.map((_, i) => <RowSkeleton key={i} />)}</Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssignmentOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {debouncedSearch ? t(`${sp}.empty_search_title`) : t(`${sp}.empty_title`)}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {debouncedSearch ? t(`${sp}.empty_search_hint`) : t(`${sp}.empty_hint`)}
            </Typography>
          </Box>
        ) : (
          sessions.map((s, i) => {
            const p          = s.participant;
            const isAnon     = s.isAnonymous;
            const name       = isAnon
              ? (p?.firstName ?? t(`${sp}.anonymous`))
              : (p ? ((p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || p.username || t(`${du}.unknown_user`)) : t(`${du}.unknown_user`));
            const email      = isAnon ? null : (p?.email ?? "");
            const letter     = name[0]?.toUpperCase() || "?";
            const statusCfg  = SESSION_STATUS_META[s.status] ?? SESSION_STATUS_META.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <Box key={s._id} sx={{
                display: "grid", gridTemplateColumns: GRID_COLS,
                alignItems: "center", px: 2.5, py: 1.5,
                borderBottom: i < sessions.length - 1 ? "1px solid #F3F4F6" : "none",
                "&:hover": { bgcolor: "#FAFAFA" }, transition: "background-color 0.1s",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <Avatar sx={{
                    width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                    background: isAnon ? ANON_AVATAR_BG : PURPLE_AVATAR_BG,
                  }}>
                    {isAnon ? "?" : letter}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isAnon ? t(`${sp}.identity_hidden`) : (email || "—")}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "3px", borderRadius: "999px", bgcolor: statusCfg.bg, border: `1px solid ${statusCfg.color}25` }}>
                    <StatusIcon sx={{ fontSize: 11, color: statusCfg.color }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: statusCfg.color }}>{t(`${sp}.session_status.${s.status}`)}</Typography>
                  </Box>
                </Box>

                <Box>
                  {s.score !== undefined ? (
                    <Box sx={{ display: "inline-flex", px: 1.25, py: "3px", borderRadius: 1.5, bgcolor: scoreBg(s.score), border: `1px solid ${scoreColor(s.score)}28` }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: scoreColor(s.score) }}>{s.score}%</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>—</Typography>
                  )}
                </Box>

                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{fmtDate(s.completedAt || s.startedAt, i18n.language)}</Typography>

                <Box />
              </Box>
            );
          })
        )}
      </Box>

      {!loading && total > PAGE_SIZE && (
        <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
      )}
    </Box>
  );
});
SessionsView.displayName = "SessionsView";

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  anonymityMode?: string;
}

const CampaignSessionsTab = memo<Props>(({ campaignId }) => (
  <SessionsView campaignId={campaignId} />
));
CampaignSessionsTab.displayName = "CampaignSessionsTab";

export default CampaignSessionsTab;
