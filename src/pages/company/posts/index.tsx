import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputBase,
  ListSubheader,
  Divider,
  Tooltip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsError,
  selectMyPostsPagination,
} from "@/store/slices/postSlice";
import {
  fetchCombinedSubscriptionDetails,
  selectCombinedDetails,
} from "@/store/slices/paymentSlice";
import { useToast } from "@/hooks/useToast";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import JobPostsList, {
  StatusFilter,
  SortOption,
} from "@/components/features/company/posts/list/JobPostsList";
import PostsStats from "@/components/features/company/posts/list/Stats";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import AddOutlined from "@mui/icons-material/AddOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";

const TEAL = "#0D9488";

const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] =
  [
    { value: "all", label: "All statuses", color: "#6B7280" },
    { value: "active", label: "Open", color: "#059669" },
    { value: "draft", label: "Draft", color: "#D97706" },
    { value: "expired", label: "Closed", color: "#DC2626" },
  ];

type TypeFilter = "all" | "ai" | "pipeline" | "manual";

const TYPE_OPTIONS: {
  value: TypeFilter;
  label: string;
  color: string;
  bg: string;
  Icon: React.ElementType;
}[] = [
  { value: "all",      label: "All types",  color: "#6B7280", bg: "#F3F4F6", Icon: FilterListOutlined },
  { value: "ai",       label: "AI",         color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  { value: "pipeline", label: "Pipeline",   color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  { value: "manual",   label: "Manual",     color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
];

const SORT_GROUPS = [
  {
    label: "Date",
    Icon: CalendarTodayOutlined,
    color: "#6B7280",
    options: [
      { value: "newest" as SortOption, label: "Most recent first" },
      { value: "oldest" as SortOption, label: "Earliest first" },
    ],
  },
  {
    label: "Title",
    Icon: SortByAlphaOutlined,
    color: "#0891B2",
    options: [
      { value: "title-asc" as SortOption, label: "A to Z" },
      { value: "title-desc" as SortOption, label: "Z to A" },
    ],
  },
];
const SORT_OPTIONS_FLAT = SORT_GROUPS.flatMap((g) => g.options);

const selectSx = {
  height: 34,
  fontSize: "13px",
  bgcolor: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

const PostsPage: React.FC = () => {
  useCompanyAccess("canViewJobPosts");
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const user        = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms    = useSelector(selectEmployeePermissions);
  const canCreate = user?.role !== "Employee" || !!empPerms?.canCreateJobPosts;
  const canDelete = user?.role !== "Employee" || !!empPerms?.canCreateJobPosts;
  const { showToast } = useToast();

  const posts      = useSelector(selectMyPosts);
  const loading    = useSelector(selectMyPostsLoading);
  const error      = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);
  const combined   = useSelector(selectCombinedDetails);

  const postsUsed      = combined?.combined.usage.posts.used ?? 0;
  const postsLimit     = combined?.combined.usage.posts.limit ?? Infinity;
  const postsAtLimit   = combined && postsLimit !== Infinity && postsUsed >= postsLimit;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const deletePostHook = useDeletePost({
    postId: jobToDelete!,
    refetchAfterDelete: true,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
      setJobToDelete(null);
    },
    onError: () =>
      showToast({ message: "Failed to delete post", severity: "error" }),
  });

  const apiStatus =
    statusFilter === "all"
      ? undefined
      : statusFilter === "active"
        ? "open"
        : statusFilter === "draft"
          ? "draft"
          : statusFilter === "expired"
            ? "closed"
            : undefined;

  const apiSort =
    sortBy === "title-asc"
      ? "title_asc"
      : sortBy === "title-desc"
        ? "title_desc"
        : sortBy;

  const load = useCallback(() => {
    dispatch(
      fetchMyPosts({
        page,
        limit: 8,
        search,
        sort: apiSort,
        status: apiStatus,
        creationType: typeFilter !== "all" ? typeFilter : undefined,
      }),
    );
  }, [dispatch, page, search, apiSort, apiStatus, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    dispatch(fetchCombinedSubscriptionDetails());
  }, [dispatch]);

  const filteredPosts = posts as any[];
  const totalCount = (pagination as any)?.total ?? filteredPosts.length;

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    deletePostHook.handleOpen();
  };

  const handleCreateClick = () => {
    if (postsAtLimit) return;
    router.push("/company/posts/create");
  };

  return (
    <DashboardLayout>
      <Box>
        {/* ── Header card ── */}
        <Box
          sx={{
            mb: 3,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderTop: "3px solid #E5E7EB",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              px: 3,
              pt: 2.5,
              pb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left: icon + title + count */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: `${TEAL}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WorkOutlineOutlined sx={{ fontSize: 20, color: TEAL }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  Job Posts
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {loading
                    ? "Loading…"
                    : `${totalCount} post${totalCount !== 1 ? "s" : ""}`}
                </Typography>
              </Box>
            </Box>

            {/* Right: search + status + sort + divider + New Job Post */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Search */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  px: 1.25,
                  height: 34,
                  width: { xs: "100%", sm: 220, md: 300, lg: 380 },
                  "&:focus-within": { borderColor: TEAL },
                  transition: "border-color 0.15s",
                }}
              >
                <SearchOutlined
                  sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }}
                />
                <InputBase
                  placeholder="Search by title, description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  sx={{ fontSize: "13px", flex: 1 }}
                />
              </Box>

              {/* Status */}
              <FormControl size="small">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                  displayEmpty
                  startAdornment={
                    <CheckCircleOutlineOutlined
                      sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }}
                    />
                  }
                  renderValue={(val) => {
                    const opt = STATUS_OPTIONS.find((o) => o.value === val);
                    return (
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color:
                            val === "all"
                              ? "#9CA3AF"
                              : (opt?.color ?? "#374151"),
                        }}
                      >
                        {opt?.label ?? "All statuses"}
                      </Typography>
                    );
                  }}
                  sx={selectSx}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: "12px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                        border: "1px solid #E5E7EB",
                        mt: 0.5,
                        minWidth: 160,
                      },
                    },
                  }}
                >
                  {STATUS_OPTIONS.map(({ value, label, color }) => (
                    <MenuItem
                      key={value}
                      value={value}
                      sx={{
                        mx: 0.5,
                        borderRadius: "8px",
                        py: 0.75,
                        px: 1.5,
                        "&:hover": { bgcolor: `${color}0D` },
                        "&.Mui-selected": {
                          bgcolor: `${color}12`,
                          "&:hover": { bgcolor: `${color}1A` },
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: statusFilter === value ? 700 : 400,
                          color: statusFilter === value ? color : "#374151",
                        }}
                      >
                        {label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Type */}
              <FormControl size="small">
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as TypeFilter);
                    setPage(1);
                  }}
                  displayEmpty
                  renderValue={(val) => {
                    const opt = TYPE_OPTIONS.find((o) => o.value === val);
                    const Icon = opt?.Icon ?? FilterListOutlined;
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Icon sx={{ fontSize: 14, color: val === "all" ? "#9CA3AF" : opt?.color }} />
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: val === "all" ? "#9CA3AF" : opt?.color,
                          }}
                        >
                          {opt?.label ?? "All types"}
                        </Typography>
                      </Box>
                    );
                  }}
                  sx={selectSx}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: "12px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                        border: "1px solid #E5E7EB",
                        mt: 0.5,
                        minWidth: 160,
                      },
                    },
                  }}
                >
                  {TYPE_OPTIONS.map(({ value, label, color, bg, Icon }) => (
                    <MenuItem
                      key={value}
                      value={value}
                      sx={{
                        mx: 0.5,
                        borderRadius: "8px",
                        py: 0.75,
                        px: 1.25,
                        gap: 1,
                        "&:hover": { bgcolor: `${color}0D` },
                        "&.Mui-selected": {
                          bgcolor: `${color}12`,
                          "&:hover": { bgcolor: `${color}1A` },
                        },
                      }}
                    >
                      {value !== "all" && (
                        <Box sx={{
                          width: 20, height: 20, borderRadius: "5px",
                          bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <Icon sx={{ fontSize: 11, color }} />
                        </Box>
                      )}
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: typeFilter === value ? 700 : 400,
                          color: typeFilter === value ? color : "#374151",
                        }}
                      >
                        {label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort */}
              <FormControl size="small">
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setPage(1);
                  }}
                  startAdornment={
                    <SortOutlined
                      sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }}
                    />
                  }
                  renderValue={(val) => {
                    const opt = SORT_OPTIONS_FLAT.find((o) => o.value === val);
                    return (
                      <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                        {opt?.label ?? "Sort"}
                      </Typography>
                    );
                  }}
                  sx={selectSx}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: "12px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                        border: "1px solid #E5E7EB",
                        mt: 0.5,
                        minWidth: 190,
                      },
                    },
                  }}
                >
                  {SORT_GROUPS.flatMap((group, gi) => [
                    <ListSubheader
                      key={`h-${gi}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        fontSize: "10px",
                        fontWeight: 700,
                        color: group.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        lineHeight: "32px",
                        bgcolor: "#fff",
                        px: 1.5,
                      }}
                    >
                      <group.Icon sx={{ fontSize: 12 }} />
                      {group.label}
                    </ListSubheader>,
                    ...group.options.map(({ value, label }) => (
                      <MenuItem
                        key={value}
                        value={value}
                        sx={{
                          mx: 0.5,
                          borderRadius: "8px",
                          py: 0.75,
                          px: 1.5,
                          "&:hover": { bgcolor: `${group.color}0D` },
                          "&.Mui-selected": {
                            bgcolor: `${group.color}12`,
                            "&:hover": { bgcolor: `${group.color}1A` },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: sortBy === value ? 700 : 400,
                            color: sortBy === value ? group.color : "#374151",
                          }}
                        >
                          {label}
                        </Typography>
                      </MenuItem>
                    )),
                    gi < SORT_GROUPS.length - 1 ? (
                      <Divider
                        key={`d-${gi}`}
                        sx={{ my: 0.5, borderColor: "#F3F4F6" }}
                      />
                    ) : null,
                  ])}
                </Select>
              </FormControl>

              {/* Divider */}
              <Box
                sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }}
              />

              {/* New Job Post button */}
              <Tooltip
                title={postsAtLimit ? `Post limit reached (${postsUsed}/${postsLimit}). Upgrade your plan to post more jobs.` : ""}
                arrow
                disableHoverListener={!postsAtLimit}
              >
                <span>
                  <Box
                    component="button"
                    onClick={handleCreateClick}
                    disabled={!!postsAtLimit}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      height: 36,
                      px: 1.75,
                      border: "none",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "all 0.15s",
                      ...(postsAtLimit ? {
                        cursor: "not-allowed",
                        background: "#E5E7EB",
                        boxShadow: "none",
                        color: "#9CA3AF",
                      } : {
                        cursor: "pointer",
                        background: `linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`,
                        boxShadow: `0 2px 8px ${TEAL}40`,
                        color: "#fff",
                        "&:hover": {
                          opacity: 0.9,
                          boxShadow: `0 4px 14px ${TEAL}50`,
                        },
                      }),
                    }}
                  >
                    <AddOutlined sx={{ fontSize: 16 }} />
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "inherit",
                        lineHeight: 1,
                      }}
                    >
                      {postsAtLimit ? `Limit reached (${postsUsed}/${postsLimit})` : "New Job Post"}
                    </Typography>
                  </Box>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <PostsStats />

        <JobPostsList
          jobs={filteredPosts}
          loading={loading}
          error={error}
          hasFilters={!!search || statusFilter !== "all" || typeFilter !== "all"}
          page={page}
          pagination={pagination}
          onPageChange={setPage}
          onDelete={handleDelete}
          onViewDetails={(id) => router.push(`/company/posts/${id}`)}
          onCreateClick={handleCreateClick}
        />

        <DeletePostModal
          open={deletePostHook.open}
          onClose={() => {
            deletePostHook.handleClose();
            setJobToDelete(null);
          }}
          onDelete={deletePostHook.handleDelete}
          isDeleting={deletePostHook.isDeleting}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PostsPage;
