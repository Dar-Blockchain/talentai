import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMembers, selectMembers, Member } from "@/store/slices/memberSlice";
import { useStartTeamChat } from "@/modules/team-chat/hooks/useStartTeamChat";
import { getRoleLabel } from "@/utils/employeeRoleI18n";

const ACCENT = "#0F766E";
const PAGE_SIZE = 50;

const getMemberName = (member: Member) => {
  const full = `${member.firstName || ""} ${member.lastName || ""}`.trim();
  return full || member.username || "Unnamed";
};

const ColleagueSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, px: 0.5 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="40%" height={20} />
      <Skeleton variant="text" width="28%" height={16} />
    </Box>
    <Skeleton variant="rounded" width={88} height={32} sx={{ borderRadius: "8px" }} />
  </Box>
);

interface CompanyContactRowProps {
  name: string;
  username?: string;
  roleLabel: string;
  messageLabel: string;
  onMessage: () => void;
}

const CompanyContactRow: React.FC<CompanyContactRowProps> = ({
  name,
  username,
  roleLabel,
  messageLabel,
  onMessage,
}) => {
  const initial = name[0]?.toUpperCase() || "C";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        px: 0.5,
        borderRadius: "10px",
        bgcolor: "#F9FAFB",
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: "#E5E7EB",
          color: "#374151",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {initial}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: "#6B7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {username ? `@${username}` : roleLabel}
          {username ? ` · ${roleLabel}` : ""}
        </Typography>
      </Box>

      <Button
        size="small"
        variant="outlined"
        startIcon={<ChatBubbleOutlineOutlined sx={{ fontSize: 16 }} />}
        onClick={onMessage}
        sx={{
          flexShrink: 0,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          borderColor: "#D1D5DB",
          color: ACCENT,
          "&:hover": { borderColor: ACCENT, bgcolor: "#fff" },
        }}
      >
        {messageLabel}
      </Button>
    </Box>
  );
};

interface ColleagueRowProps {
  member: Member;
  roleLabel: string;
  messageLabel: string;
  onMessage: (userId: string) => void;
}

const ColleagueRow: React.FC<ColleagueRowProps> = ({
  member,
  roleLabel,
  messageLabel,
  onMessage,
}) => {
  const name = getMemberName(member);
  const initial = name[0]?.toUpperCase() || "U";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        px: 0.5,
        borderRadius: "10px",
        transition: "background-color 0.15s ease",
        "&:hover": { bgcolor: "#F9FAFB" },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: "#E5E7EB",
          color: "#374151",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {initial}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: "#6B7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.username ? `@${member.username}` : roleLabel}
          {member.username ? ` · ${roleLabel}` : ""}
        </Typography>
      </Box>

      <Button
        size="small"
        variant="outlined"
        startIcon={<ChatBubbleOutlineOutlined sx={{ fontSize: 16 }} />}
        onClick={() => { onMessage(member.userId); }}
        sx={{
          flexShrink: 0,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          borderColor: "#D1D5DB",
          color: ACCENT,
          "&:hover": { borderColor: ACCENT, bgcolor: "#F9FAFB" },
        }}
      >
        {messageLabel}
      </Button>
    </Box>
  );
};

const TeamChatColleaguesPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const startTeamChat = useStartTeamChat();
  const { t } = useTranslation("modules/company/teamChat");
  const { t: tDashboard } = useTranslation("dashboard");

  const currentUserId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const userRole = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const { members, loading, error } = useSelector(selectMembers);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, md: 2.5 },
          pt: { xs: 2, md: 2.5 },
          pb: 1.5,
          borderBottom: "1px solid #E5E7EB",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              {t("colleagues.title")}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.25 }}>
              {t("colleagues.subtitle")}
            </Typography>
          </Box>
          {!isInitialLoading && (
            <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>
              {t("colleagues.count", { count: visibleCount })}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("colleagues.search_placeholder")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch} aria-label={t("colleagues.clear_search")}>
                  <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#F9FAFB",
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#D1D5DB" },
              "&.Mui-focused fieldset": { borderColor: ACCENT },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {isInitialLoading ? (
          <Stack spacing={0.5}>
            {Array.from({ length: 6 }).map((_, index) => (
              <ColleagueSkeleton key={index} />
            ))}
          </Stack>
        ) : isSearchEmpty ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {t("colleagues.no_results")}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
              {t("colleagues.no_results_hint")}
            </Typography>
          </Box>
        ) : visibleCount === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {t("colleagues.empty")}
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: "#F3F4F6" }} />} spacing={0}>
            {showCompanyContact && companyContact && (
              <CompanyContactRow
                name={companyContact.name}
                username={companyContact.username}
                roleLabel={t("colleagues.company_role")}
                messageLabel={t("colleagues.message")}
                onMessage={() => { void startTeamChat(companyContact.id); }}
              />
            )}
            {colleagues.map((member) => (
              <ColleagueRow
                key={member._id}
                member={member}
                roleLabel={getRoleLabel(member.role, tDashboard)}
                messageLabel={t("colleagues.message")}
                onMessage={(userId) => { void startTeamChat(userId); }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default TeamChatColleaguesPanel;
