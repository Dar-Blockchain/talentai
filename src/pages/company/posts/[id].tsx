import React, { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { Box, Alert, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tabs, Tab } from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchJobById,
  selectCurrentJob,
  selectCurrentJobLoading,
  selectCurrentJobError,
  processPostPayment,
  updatePostStatus,
  resetPostPayment,
  selectPostPayment,
} from "@/store/slices/postSlice";
import { selectTokenBalance, fetchTokenBalance } from "@/store/slices/tokenSlice";
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import JobDetailContent from "@/components/features/company/posts/details/JobDetailContent";
import JobPublishModal from "@/components/features/company/posts/details/JobPublishModal";
import PassedInterviewView from "@/components/features/company/posts/details/PassedInterviewView";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";

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

  const tokenBalance = useSelector(selectTokenBalance);
  const { data: paymentData, loading: isProcessingPayment, error: paymentError } = useSelector(selectPostPayment);

  const [activeEdit, setActiveEdit] = useState<"post" | "recruitment" | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "candidates">("details");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const paymentSucceeded = !!paymentData;

  useEffect(() => {
    if (id) dispatch(fetchJobById(id as string));
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

  const handleSaveSuccess = () => {
    if (job?.status === "open") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!paymentData && Number(tokenBalance) < 1000) {
      setPaymentModalOpen(false);
      dispatch(resetPostPayment());
      return;
    }
    if (paymentSucceeded) {
      setPaymentModalOpen(false);
      dispatch(resetPostPayment());
      return;
    }
    try {
      await dispatch(processPostPayment({ postId: job?._id, agentId: job?.agentId })).unwrap();
      await dispatch(updatePostStatus({ postId: job?._id, status: "open" })).unwrap();
      await dispatch(fetchTokenBalance()).unwrap();
    } catch {
      showToast({ message: "Payment failed. Please try again.", severity: "error" });
    }
  };

  const handlePaymentClose = () => {
    if (isProcessingPayment) return;
    setPaymentModalOpen(false);
    dispatch(resetPostPayment());
  };

  const handleCopyLink = () => {
    if (!job?._id) return;
    navigator.clipboard
      .writeText(`${window.location.origin}/interview/hr?jobId=${job._id}&ref=link`)
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
          label="Publish (1,000 TAI)"
          size="small"
          variant="outlined"
          startIcon={<PublishOutlined sx={{ fontSize: 15 }} />}
          onClick={() => setPaymentModalOpen(true)}
          sx={{ color: "#D97706", borderColor: "#FDE68A", bgcolor: "#FFFBEB", "&:hover": { bgcolor: "#FEF3C7" } }}
        />
      )}
      {isOwner && !activeEdit && activeTab === "details" && (
        <AppButton
          label="Edit"
          size="small"
          variant="outlined"
          startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
          onClick={() => setActiveEdit("post")}
        />
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
    <RoleGuard allowedRoles={["Company"]}>
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
            </>
          )}

          <DeletePostModal
            open={deletePost.open}
            onClose={deletePost.handleClose}
            onDelete={deletePost.handleDelete}
            isDeleting={deletePost.isDeleting}
          />

          <JobPublishModal
            open={paymentModalOpen}
            onClose={handlePaymentClose}
            onConfirm={handlePaymentConfirm}
            tokenBalance={tokenBalance}
            isProcessing={isProcessingPayment}
            succeeded={paymentSucceeded}
            error={paymentError}
          />
        </Box>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default PostDetailsPage;
