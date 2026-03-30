import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Box, Alert, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tabs, Tab, Tooltip } from "@mui/material";
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
  setSavedPost,
  resetFlow,
} from "@/store/slices/postSlice";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import JobDetailContent from "@/components/features/company/posts/details/JobDetailContent";
import PassedInterviewView from "@/components/features/company/posts/details/PassedInterviewView";
import LinkVisitorsView from "@/components/features/company/posts/details/LinkVisitorsView";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

const TEAL = "#0D9488";

const PostDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();

  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);
  const connectedUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const jobMatches = useSelector(selectJobMatches);
  const hasPassedCandidates = jobMatches.length > 0;

  const [activeEdit, setActiveEdit] = useState<"post" | "recruitment" | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "candidates" | "visitors">("details");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

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
    if (!job || !connectedUser) return false;
    return job.user?._id === connectedUser._id;
  }, [job, connectedUser]);

  const deletePost = useDeletePost({
    postId: job?._id,
    refetchAfterDelete: false,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
      router.push("/company/posts");
    },
    onError: () => showToast({ message: "Failed to delete post", severity: "error" }),
  });

  const handleSaveSuccess = () => {};

  const handleContinueSetup = () => {
    if (!job) return;
    dispatch(resetFlow());
    dispatch(setSavedPost({ jobData: job }));
    dispatch(setCreationType("manual"));
    router.push("/company/posts/create");
  };

  const handleCopyLink = () => {
    if (!job?._id) return;
    navigator.clipboard
      .writeText(`${window.location.origin}/interview/hr?jobId=${job._id}&companyId=${job.user?._id}&ref=link`)
      .then(() => showToast({ message: "Interview link copied!", severity: "success" }))
      .catch(() => showToast({ message: "Failed to copy link", severity: "error" }));
  };

  const jd = job?.jobDetails || {};
  const isDraft = job?.status === "draft";
  const bannerSubtitle = job
    ? `${jd.workMode || ""} · ${jd.employmentType || ""} · Posted by ${job.user?.companyName || "your company"}`
    : "Loading job details…";

  const headerActions = job ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {isDraft && isOwner && (
        <AppButton
          label="Continue Setup"
          size="small"
          variant="contained"
          startIcon={<PlayArrowOutlined sx={{ fontSize: 15 }} />}
          onClick={handleContinueSetup}
          sx={{ bgcolor: TEAL, color: "#fff", "&:hover": { bgcolor: "#0F766E" } }}
        />
      )}
      {isOwner && !activeEdit && activeTab === "details" && (
        <Tooltip
          title={hasPassedCandidates ? "Cannot edit — candidates have already passed this interview" : ""}
          arrow
          disableHoverListener={!hasPassedCandidates}
        >
          <span>
            <AppButton
              label="Edit"
              size="small"
              variant="outlined"
              startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setActiveEdit("post")}
              disabled={hasPassedCandidates}
              sx={hasPassedCandidates ? { opacity: 0.4 } : {}}
            />
          </span>
        </Tooltip>
      )}
      {!isDraft && (
        <AppButton
          label="Copy Link"
          size="small"
          variant="outlined"
          startIcon={<ContentCopyOutlined sx={{ fontSize: 15 }} />}
          onClick={handleCopyLink}
          sx={{ color: "#16A34A", borderColor: "#BBF7D0", bgcolor: "#F0FDF4", "&:hover": { bgcolor: "#DCFCE7" } }}
        />
      )}
      {isOwner && (
        <>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" }, border: "1px solid #E5E7EB", borderRadius: 1.5 }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 150, mt: 0.5 } } }}
          >
            <MenuItem
              onClick={() => { setMenuAnchor(null); deletePost.handleOpen(); }}
              sx={{ gap: 1, color: "#EF4444", fontSize: "13px", fontWeight: 600, "&:hover": { bgcolor: "#FEF2F2" } }}
            >
              <ListItemIcon sx={{ minWidth: "auto", color: "#EF4444" }}>
                <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary="Delete Post" slotProps={{ primary: { sx: { fontSize: "13px", fontWeight: 600 } } }} />
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  ) : undefined;

  return (
      <DashboardLayout>
        <Box>
          {loading && <LoadingOverlay height={400} message="Loading job details…" color={TEAL} />}

          {!loading && error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          )}

          {!loading && !error && job && (
            <>
              <PageHeader
                title={jd.title || "Job Post"}
                subtitle={bannerSubtitle}
                breadcrumbs={[
                  { label: "Dashboard", href: "/company/dashboard" },
                  { label: "Job Posts", href: "/company/posts" },
                  { label: jd.title || "Job Post" },
                ]}
                actions={headerActions}
              />

              {/* Tabs — only show when published */}
              {!isDraft && (
                <Box sx={{ mb: 2, borderBottom: "1px solid #E5E7EB" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                      minHeight: 44,
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "13px",
                        minHeight: 44,
                        px: 2,
                        gap: 0.75,
                        color: "#6B7280",
                        "&.Mui-selected": { color: TEAL },
                      },
                      "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2.5, borderRadius: "2px 2px 0 0" },
                    }}
                  >
                    <Tab
                      value="details"
                      label="Job Details"
                      icon={<WorkOutlineOutlined sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                    />
                    <Tab
                      value="candidates"
                      label="Passed Interview"
                      icon={<EmojiEventsOutlined sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                    />
                    <Tab
                      value="visitors"
                      label="Link Visitors"
                      icon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>
              )}

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

              {activeTab === "candidates" && !isDraft && (
                <PassedInterviewView
                  jobId={job._id}
                  jobTitle={jd.title}
                  onBack={() => setActiveTab("details")}
                />
              )}

              {activeTab === "visitors" && !isDraft && (
                <LinkVisitorsView jobId={job._id} />
              )}
            </>
          )}

          <DeletePostModal
            open={deletePost.open}
            onClose={deletePost.handleClose}
            onDelete={deletePost.handleDelete}
            isDeleting={deletePost.isDeleting}
          />
        </Box>
      </DashboardLayout>
  );
};

export default PostDetailsPage;
