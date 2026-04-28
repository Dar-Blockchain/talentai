import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Box, Alert, Breadcrumbs, Chip, IconButton, Link as MuiLink, Menu, MenuItem, Tabs, Tab, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchJobById,
  fetchJobMatches,
  selectCurrentJob,
  selectCurrentJobLoading,
  selectCurrentJobError,
  selectJobMatches,
  updatePostStatus,
} from "@/store/slices/postSlice";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import PublishConfirmModal from "@/components/features/company/posts/PublishConfirmModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import JobDetailContent from "@/components/features/company/posts/details/JobDetailContent";
import ApplicationsView from "@/components/features/company/posts/details/ApplicationsView";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import SignalCellularAltOutlined from "@mui/icons-material/SignalCellularAlt";
import LaptopOutlined from "@mui/icons-material/LaptopOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";

const TEAL = "#0D9488";

const PostDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("dashboard");
  const { showToast } = useToast();

  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);
  const connectedUser        = useSelector((state: RootState) => state.user.connectedUser.user);
  const companyMembership    = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const jobMatches = useSelector(selectJobMatches);
  const hasPassedCandidates = jobMatches.length > 0;

  const [activeEdit, setActiveEdit] = useState<"post" | "recruitment" | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "applications" | "candidates">("details");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
      dispatch(fetchJobMatches({ selectedJobId: id as string, page: 1, limit: 1, passedInterview: true }));
    }
  }, [id, dispatch]);

  // Reset edit mode when switching tabs
  useEffect(() => {
    if (activeTab === "candidates") setActiveEdit(null);
  }, [activeTab]);

  const isOwner = useMemo(() => {
    if (!job) return false;
    const jobOwnerId = String(job.user?._id ?? "");
    if (!jobOwnerId) return false;
    // Post may be owned by the user directly OR by their company (resolveCompanyActor sets post.user = company)
    const matchesUser    = connectedUser    && jobOwnerId === String(connectedUser._id    ?? "");
    const matchesCompany = companyMembership && jobOwnerId === String(companyMembership._id ?? "");
    return !!(matchesUser || matchesCompany);
  }, [job, connectedUser, companyMembership]);

  const deletePost = useDeletePost({
    postId: job?._id,
    refetchAfterDelete: false,
    onSuccess: () => {
      showToast({ message: t("pages.post_detail.toast.deleted"), severity: "success" });
      router.push("/company/posts");
    },
    onError: () => showToast({ message: t("pages.post_detail.toast.delete_error"), severity: "error" }),
  });

  const handleSaveSuccess = () => {
    setActiveEdit(null);
    if (id) dispatch(fetchJobById(id as string));
  };

  const handlePublish = () => setPublishConfirmOpen(true);

  const handleConfirmPublish = () => {
    if (!job?._id) return;
    setPublishing(true);
    dispatch(updatePostStatus({ postId: job._id, status: "open" }))
      .unwrap()
      .then(() => {
        setPublishConfirmOpen(false);
        showToast({ message: t("pages.post_detail.toast.published"), severity: "success" });
        dispatch(fetchJobById(job._id));
      })
      .catch(() => showToast({ message: t("pages.post_detail.toast.publish_error"), severity: "error" }))
      .finally(() => setPublishing(false));
  };

  const handleCopyLink = () => {
    if (!job?._id) return;
    const companyId = job.user?._id || connectedUser?._id || '';
    navigator.clipboard
      .writeText(`${window.location.origin}/interview/hr?jobId=${job._id}${companyId ? `&companyId=${companyId}` : ''}&ref=link`)
      .then(() => showToast({ message: t("pages.post_detail.toast.link_copied"), severity: "success" }))
      .catch(() => showToast({ message: t("pages.post_detail.toast.link_copy_error"), severity: "error" }));
  };

  const jd = job?.jobDetails || {};
  const isDraft = job?.status === "draft";

  return (
      <DashboardLayout>
        <Box>
          {loading && <LoadingOverlay height={400} message={t("pages.post_detail.loading")} color={TEAL} />}

          {!loading && error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          )}

          {!loading && !error && job && (
            <>
              {/* ── Rich Job Header ─────────────────────────────────────── */}
              <Box sx={{ mb: 3, bgcolor: "#fff", border: `1px solid ${isDraft ? "#FDE68A" : "#E5E7EB"}`, borderRadius: "16px", overflow: "hidden", boxShadow: isDraft ? "0 2px 12px #D9770618" : "0 1px 4px rgba(0,0,0,0.04)", borderTop: `3px solid ${isDraft ? "#F59E0B" : TEAL}` }}>

                <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 2.5, pb: isDraft ? 2.5 : 0 }}>
                  {/* Breadcrumbs */}
                  <Breadcrumbs
                    separator={<NavigateNextIcon sx={{ fontSize: 14, color: "#D1D5DB" }} />}
                    sx={{ mb: 2, "& .MuiBreadcrumbs-separator": { mx: 0.25 } }}
                  >
                    {[
                      { label: t("pages.common.dashboard"), href: "/company/dashboard" },
                      { label: t("pages.posts.title"), href: "/company/posts" },
                      { label: jd.title || t("pages.post_detail.fallback_title") },
                    ].map((item, i) =>
                      item.href ? (
                        <MuiLink key={i} component={Link} href={item.href} underline="hover"
                          sx={{ fontSize: "12px", fontWeight: 500, color: "#6B7280", "&:hover": { color: "#111827" } }}>
                          {item.label}
                        </MuiLink>
                      ) : (
                        <Typography key={i} sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                          {item.label}
                        </Typography>
                      )
                    )}
                  </Breadcrumbs>

                  {/* Title row */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    {/* Left: icon + title + meta */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
                      <Box sx={{
                        width: 52, height: 52, borderRadius: "12px", flexShrink: 0,
                        background: `linear-gradient(135deg, ${TEAL}, #34D399)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 12px ${TEAL}30`,
                      }}>
                        <WorkOutlineOutlined sx={{ fontSize: 26, color: "#fff" }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.75 }}>
                          <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
                            {jd.title || "Job Post"}
                          </Typography>
                          <Chip
                            label={isDraft ? t("pages.post_detail.status.draft") : t("pages.post_detail.status.published")}
                            size="small"
                            sx={{
                              height: 22, fontWeight: 700, fontSize: "11px",
                              bgcolor: isDraft ? "#FEF3C7" : "#D1FAE5",
                              color: isDraft ? "#92400E" : "#065F46",
                              border: `1px solid ${isDraft ? "#FDE68A" : "#A7F3D0"}`,
                            }}
                          />
                        </Box>
                        {/* Meta chips row */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {jd.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{jd.location}</Typography>
                            </Box>
                          )}
                          {jd.location && (jd.workMode || jd.employmentType) && (
                            <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>·</Typography>
                          )}
                          {jd.workMode && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <LaptopOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{jd.workMode}</Typography>
                            </Box>
                          )}
                          {jd.workMode && jd.employmentType && (
                            <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>·</Typography>
                          )}
                          {jd.employmentType && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <BusinessCenterOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                              <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{jd.employmentType}</Typography>
                            </Box>
                          )}
                          {jd.experienceLevel && (
                            <>
                              <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>·</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <SignalCellularAltOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                                <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{jd.experienceLevel}</Typography>
                              </Box>
                            </>
                          )}
                          {job.createdAt && (
                            <>
                              <Typography sx={{ fontSize: "12px", color: "#D1D5DB" }}>·</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                                <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                                  {new Date(job.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Right: actions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>

                      {/* Publish button */}
                      {isDraft && isOwner && (
                        <Box
                          onClick={handlePublish}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.75,
                            px: 1.75, height: 36, borderRadius: "10px", cursor: "pointer",
                            bgcolor: "#D97706",
                            transition: "background 0.15s",
                            "&:hover": { bgcolor: "#B45309" },
                          }}
                        >
                          <PublishOutlined sx={{ fontSize: 15, color: "#fff" }} />
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                            {t("pages.post_detail.actions.publish")}
                          </Typography>
                        </Box>
                      )}

                      {/* Copy Interview Link */}
                      {!isDraft && (
                        <Box
                          onClick={handleCopyLink}
                          sx={{
                            display: "flex", alignItems: "center", gap: 0.75,
                            px: 1.75, height: 36, borderRadius: "10px", cursor: "pointer",
                            border: "1.5px solid #A7F3D0", bgcolor: "#F0FDF4",
                            transition: "border-color 0.15s, background 0.15s",
                            "&:hover": { borderColor: "#6EE7B7", bgcolor: "#DCFCE7" },
                          }}
                        >
                          <ContentCopyOutlined sx={{ fontSize: 14, color: "#059669" }} />
                          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#059669", lineHeight: 1 }}>
                            {t("pages.post_detail.actions.copy_link")}
                          </Typography>
                        </Box>
                      )}

                      {/* Three-dot menu (Edit + Delete) */}
                      {isOwner && (
                        <>
                          <IconButton
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            sx={{
                              width: 36, height: 36, borderRadius: "10px",
                              border: "1.5px solid #E5E7EB", bgcolor: "#fff",
                              color: "#6B7280",
                              transition: "all 0.15s",
                              "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB", color: "#374151" },
                            }}
                          >
                            <MoreVertOutlined sx={{ fontSize: 18 }} />
                          </IconButton>

                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={() => setMenuAnchor(null)}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            slotProps={{ paper: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 180, mt: 0.75, border: "1px solid #E5E7EB" } } }}
                          >
                            {/* Edit */}
                            <Tooltip
                              title={!isDraft ? t("pages.post_detail.tooltips.cannot_edit_published") : hasPassedCandidates ? t("pages.post_detail.tooltips.cannot_edit_passed") : ""}
                              arrow placement="left"
                              disableHoverListener={isDraft && !hasPassedCandidates}
                            >
                              <span>
                                <MenuItem
                                  disabled={!isDraft || hasPassedCandidates}
                                  onClick={() => { setMenuAnchor(null); setActiveEdit("post"); }}
                                  sx={{ mx: 0.5, borderRadius: "8px", gap: 1.25, py: 1, px: 1.25, "&:hover": { bgcolor: "#F0FDFA" }, "&.Mui-disabled": { opacity: 0.45 } }}
                                >
                                  <Box sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <EditOutlined sx={{ fontSize: 14, color: TEAL }} />
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{t("pages.post_detail.menu.edit_title")}</Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{!isDraft ? t("pages.post_detail.menu.edit_desc_published") : t("pages.post_detail.menu.edit_desc_draft")}</Typography>
                                  </Box>
                                </MenuItem>
                              </span>
                            </Tooltip>

                            <Box sx={{ mx: 1.5, my: 0.5, height: "1px", bgcolor: "#F3F4F6" }} />

                            {/* Delete */}
                            <MenuItem
                              onClick={() => { setMenuAnchor(null); deletePost.handleOpen(); }}
                              sx={{ mx: 0.5, borderRadius: "8px", gap: 1.25, py: 1, px: 1.25, "&:hover": { bgcolor: "#FEF2F2" } }}
                            >
                              <Box sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#EF4444" }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#EF4444", lineHeight: 1.2 }}>{t("pages.post_detail.menu.delete_title")}</Typography>
                                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.2 }}>{t("pages.post_detail.menu.delete_desc")}</Typography>
                              </Box>
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* ── Tabs ── */}
                  {!isDraft && (
                    <Tabs
                      value={activeTab}
                      onChange={(_, v) => setActiveTab(v)}
                      sx={{
                        mt: 2.5,
                        minHeight: 44,
                        "& .MuiTab-root": {
                          textTransform: "none", fontWeight: 600, fontSize: "13px",
                          minHeight: 44, px: 1.5, mr: 0.5, gap: 0.75,
                          color: "#9CA3AF", borderRadius: "0",
                          "&.Mui-selected": { color: TEAL },
                        },
                        "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2.5, borderRadius: "2px 2px 0 0" },
                      }}
                    >
                      <Tab value="details" label={t("pages.post_detail.tabs.details")} icon={<WorkOutlineOutlined sx={{ fontSize: 15 }} />} iconPosition="start" />
                      <Tab value="applications" label={t("pages.post_detail.tabs.applications")} icon={<PeopleOutlined sx={{ fontSize: 15 }} />} iconPosition="start" />
                    </Tabs>
                  )}
                </Box>
              </Box>

              {/* Tab content */}
              {activeTab === "details" && (
                <JobDetailContent
                  activeEdit={activeEdit}
                  isOwner={isOwner}
                  creationType={job.creationType}
                  onEditPost={() => setActiveEdit("post")}
                  onEditRecruitment={() => setActiveEdit("recruitment")}
                  onCancelEdit={() => setActiveEdit(null)}
                  onSaveSuccess={handleSaveSuccess}
                />
              )}

              {activeTab === "applications" && !isDraft && (
                <ApplicationsView jobId={job._id} />
              )}
            </>
          )}

          <DeletePostModal
            open={deletePost.open}
            onClose={deletePost.handleClose}
            onDelete={deletePost.handleDelete}
            isDeleting={deletePost.isDeleting}
          />

          <PublishConfirmModal
            open={publishConfirmOpen}
            publishing={publishing}
            onClose={() => setPublishConfirmOpen(false)}
            onConfirm={handleConfirmPublish}
          />
        </Box>
      </DashboardLayout>
  );
};

export default PostDetailsPage;
