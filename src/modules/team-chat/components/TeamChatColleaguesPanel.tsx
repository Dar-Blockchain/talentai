import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseRounded from "@mui/icons-material/CloseRounded";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMembers, selectMembers, Member } from "@/store/slices/memberSlice";
import { useStartTeamChat } from "@/modules/team-chat/hooks/useStartTeamChat";
import { getRoleLabel } from "@/utils/employeeRoleI18n";
import { TEAM_MINT_UI, TEAM_MINT_SCROLLBAR_SX } from "@/modules/shared/chat/constants/teamMintUi";

const M = TEAM_MINT_UI;
const PAGE_SIZE = 50;

const getMemberName = (member: Member) => {
  const full = `${member.firstName || ""} ${member.lastName || ""}`.trim();
  return full || member.username || "Unnamed";
};

const colleaguesGridSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
} as const;

const ColleagueSkeleton: React.FC = () => (
  <Paper
    elevation={0}
    sx={{
      p: 1,
      borderRadius: "12px",
      border: `1px solid ${M.border}`,
      bgcolor: M.bgCard,
      boxShadow: M.shadowSoft,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
      minWidth: 0,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Skeleton variant="circular" width={32} height={32} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="rounded" width="72%" height={13} sx={{ borderRadius: 0.75, bgcolor: alpha(M.textMuted, 0.22) }} />
        <Skeleton variant="rounded" width="48%" height={11} sx={{ borderRadius: 0.75, mt: 0.5, bgcolor: alpha(M.textMuted, 0.16) }} />
      </Box>
    </Stack>
    <Skeleton variant="rounded" height={28} sx={{ borderRadius: "10px", bgcolor: alpha(M.primary, 0.1) }} />
  </Paper>
);

interface CompanyContactRowProps {
  name: string;
  username?: string;
  roleLabel: string;
  onMessage: () => void;
  isLoading?: boolean;
}

const CompanyContactRow: React.FC<CompanyContactRowProps> = ({
  name,
  username,
  roleLabel,
  onMessage,
  isLoading = false,
}) => {
  const initial = name[0]?.toUpperCase() || "C";

  return (
    <Paper
      elevation={0}
      component="article"
      onClick={isLoading ? undefined : onMessage}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.5,
        px: 1.25,
        py: 0.9,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${alpha(M.primary, 0.22)}`,
        bgcolor: M.primarySoft,
        boxShadow: M.shadowSoft,
        transition: M.transition,
        minWidth: 0,
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.75 : 1,
        "@media (hover: hover)": {
          "&:hover": isLoading ? {} : {
            borderColor: alpha(M.primary, 0.35),
            boxShadow: M.shadowLift,
            bgcolor: alpha(M.primary, 0.08),
          },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: "0 4px 4px 0",
          bgcolor: M.primary,
        }}
      />
      <Avatar
        sx={{
          width: 34,
          height: 34,
          fontSize: "0.8rem",
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: alpha(M.primary, 0.15),
          color: M.primaryHover,
          boxShadow: `0 0 0 2px ${M.bgCard}`,
          ml: 0.5,
        }}
      >
        {initial}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "-0.02em",
            color: M.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: M.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {username ? `@${username} · ${roleLabel}` : roleLabel}
        </Typography>
      </Box>
      {isLoading && <CircularProgress size={18} thickness={4} sx={{ color: M.primary, flexShrink: 0 }} />}
    </Paper>
  );
};

interface ColleagueRowProps {
  member: Member;
  roleLabel: string;
  onMessage: (userId: string) => void;
  isLoading?: boolean;
}

const ColleagueRow: React.FC<ColleagueRowProps> = ({
  member,
  roleLabel,
  onMessage,
  isLoading = false,
}) => {
  const name = getMemberName(member);
  const initial = name[0]?.toUpperCase() || "U";

  return (
    <Paper
      elevation={0}
      component="article"
      onClick={isLoading ? undefined : () => { onMessage(member.userId); }}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.5,
        px: 1.25,
        py: 0.9,
        borderRadius: "12px",
        border: `1px solid ${M.border}`,
        bgcolor: M.bgCard,
        boxShadow: M.shadowSoft,
        transition: M.transition,
        minWidth: 0,
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.75 : 1,
        "@media (hover: hover)": {
          "&:hover": isLoading ? {} : {
            borderColor: alpha(M.primary, 0.25),
            boxShadow: M.shadowLift,
            bgcolor: alpha(M.primary, 0.04),
          },
        },
      }}
    >
      <Avatar
        sx={{
          width: 34,
          height: 34,
          fontSize: "0.8rem",
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: alpha(M.textPrimary, 0.06),
          color: M.textSecondary,
          boxShadow: `0 0 0 2px ${alpha(M.bgCard, 1)}`,
        }}
      >
        {initial}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "-0.02em",
            color: M.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            color: M.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.username ? `@${member.username} · ${roleLabel}` : roleLabel}
        </Typography>
      </Box>
      {isLoading && <CircularProgress size={18} thickness={4} sx={{ color: M.primary, flexShrink: 0 }} />}
    </Paper>
  );
};

const EmptyState: React.FC<{ title: string; subtitle?: string; icon: "people" | "search" }> = ({
  title,
  subtitle,
  icon,
}) => {
  const Icon = icon === "search" ? SearchOffOutlined : PeopleOutlineOutlined;

  return (
    <Box sx={{ py: { xs: 6, sm: 8 }, px: 2, textAlign: "center", maxWidth: 380, mx: "auto" }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2.5,
          borderRadius: M.radiusOuter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: M.primarySoft,
          border: `1px solid ${alpha(M.primary, 0.15)}`,
          boxShadow: M.shadowSoft,
        }}
      >
        <Icon sx={{ fontSize: 34, color: M.primaryHover }} />
      </Box>
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: M.textPrimary, letterSpacing: "-0.02em" }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography sx={{ fontSize: "0.875rem", color: M.textSecondary, mt: 1.25, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
};

interface TeamChatColleaguesPanelProps {
  onClose?: () => void;
}

const TeamChatColleaguesPanel: React.FC<TeamChatColleaguesPanelProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const startTeamChat = useStartTeamChat();
  const { t } = useTranslation("modules/company/teamChat");
  const { t: tDashboard } = useTranslation("dashboard");

  const currentUserId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const userRole = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const { members, loading, error } = useSelector(selectMembers);

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartChat = useCallback(async (userId: string) => {
    if (loadingUserId) return;
    setLoadingUserId(userId);
    try {
      await startTeamChat(userId);
      onClose?.();
    } finally {
      setLoadingUserId(null);
    }
  }, [loadingUserId, startTeamChat, onClose]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 300);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    dispatch(fetchMembers({
      page: 1,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy: "name",
      order: "asc",
    }));
  }, [debouncedSearch, dispatch]);

  const companyContact = useMemo(() => {
    if (userRole !== "Employee") return null;

    const company = companyMembership?.company;
    const companyUserId = company?._id || companyMembership?.company;
    if (!companyUserId || String(companyUserId) === String(currentUserId)) return null;

    const name = company?.profile?.companyDetails?.name
      || company?.username
      || t("colleagues.company_default");

    return {
      id: String(companyUserId),
      name,
      username: company?.username || "",
    };
  }, [companyMembership, currentUserId, t, userRole]);

  const colleagues = useMemo(
    () => members.filter((member) => {
      if (member.status !== "active" || member.userId === currentUserId) return false;
      if (companyContact && String(member.userId) === companyContact.id) return false;
      return true;
    }),
    [companyContact, currentUserId, members],
  );

  const matchesSearch = useCallback((value: string) => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return true;
    return value.toLowerCase().includes(query);
  }, [debouncedSearch]);

  const showCompanyContact = !!companyContact && (
    !debouncedSearch.trim()
    || matchesSearch(companyContact.name)
    || (companyContact.username ? matchesSearch(companyContact.username) : false)
  );

  const visibleCount = colleagues.length + (showCompanyContact ? 1 : 0);
  const isInitialLoading = loading && visibleCount === 0;
  const isSearchEmpty = debouncedSearch.length > 0 && visibleCount === 0 && !loading;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        bgcolor: M.bgMain,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          mx: { xs: 1.5, sm: 2 },
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 1.5, sm: 2 },
          borderRadius: M.radiusOuter,
          border: `1px solid ${M.border}`,
          bgcolor: M.bgCard,
          boxShadow: M.shadowSoft,
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexShrink: 0, px: { xs: 2, sm: 2.5 }, pt: 2, pb: 1.5, borderBottom: `1px solid ${M.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 1.25 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: "1.05rem", sm: "1.125rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: M.textPrimary,
                  lineHeight: 1.25,
                }}
              >
                {t("colleagues.title")}
              </Typography>
            </Box>
            {!isInitialLoading && visibleCount > 0 && (
              <Chip
                size="small"
                label={t("colleagues.count", { count: visibleCount })}
                sx={{
                  height: 26,
                  fontWeight: 700,
                  fontSize: "0.6875rem",
                  flexShrink: 0,
                  bgcolor: M.primarySoft,
                  color: M.primaryHover,
                  border: `1px solid ${alpha(M.primary, 0.2)}`,
                  "& .MuiChip-label": { px: 1.25 },
                }}
              />
            )}
          </Stack>

          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("colleagues.search_placeholder")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.25, "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                  <SearchOutlined sx={{ color: M.textMuted }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <IconButton size="small" onClick={clearSearch} aria-label={t("colleagues.clear_search")} edge="end" sx={{ color: M.textMuted, p: "4px" }}>
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                minHeight: 34,
                py: 0,
                bgcolor: M.bgMain,
                fontSize: "0.8125rem",
                transition: M.transition,
                "& fieldset": { borderColor: M.border },
                "&:hover": {
                  bgcolor: "#fff",
                  "& fieldset": { borderColor: alpha(M.textPrimary, 0.12) },
                },
                "&.Mui-focused": {
                  bgcolor: "#fff",
                  boxShadow: `0 0 0 2px ${alpha(M.primary, 0.16)}`,
                  "& fieldset": { borderColor: M.primary, borderWidth: 1 },
                },
              },
              "& .MuiOutlinedInput-input": {
                py: "6px",
                px: 0.25,
              },
              "& .MuiOutlinedInput-input::placeholder": { color: M.textMuted, opacity: 1, fontSize: "0.8125rem" },
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            WebkitOverflowScrolling: "touch",
            bgcolor: M.bgMain,
            ...TEAM_MINT_SCROLLBAR_SX,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ borderRadius: M.radiusInner, mb: 1.5, border: `1px solid ${M.border}` }}>
              {error}
            </Alert>
          )}

          {isInitialLoading ? (
            <Box sx={colleaguesGridSx}>
              {Array.from({ length: 6 }).map((_, index) => (
                <ColleagueSkeleton key={index} />
              ))}
            </Box>
          ) : isSearchEmpty ? (
            <EmptyState icon="search" title={t("colleagues.no_results")} subtitle={t("colleagues.no_results_hint")} />
          ) : visibleCount === 0 ? (
            <EmptyState icon="people" title={t("colleagues.empty")} />
          ) : (
            <Box sx={colleaguesGridSx}>
              {showCompanyContact && companyContact && (
                <CompanyContactRow
                  name={companyContact.name}
                  username={companyContact.username}
                  roleLabel={t("colleagues.company_role")}
                  onMessage={() => { void handleStartChat(companyContact.id); }}
                  isLoading={loadingUserId === companyContact.id}
                />
              )}
              {colleagues.map((member) => (
                <ColleagueRow
                  key={member._id}
                  member={member}
                  roleLabel={getRoleLabel(member.role, tDashboard)}
                  onMessage={(userId) => { void handleStartChat(userId); }}
                  isLoading={loadingUserId === member.userId}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TeamChatColleaguesPanel;
