import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Alert, Chip, Typography, Menu, MenuItem, IconButton } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutline";
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
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import JobDetailContent from "@/components/features/company/posts/details/JobDetailContent";
import JobPublishModal from "@/components/features/company/posts/details/JobPublishModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const TEAL = "#0D9488";

interface Props {
  jobId: string;
  onBack: () => void;
}

const WorkplaceJobDetail: React.FC<Props> = ({ jobId, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const job     = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error   = useSelector(selectCurrentJobError);
  const connectedUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const { data: paymentData, loading: isProcessingPayment, error: paymentError } = useSelector(selectPostPayment);

  const [activeEdit,       setActiveEdit]       = useState<"post" | "recruitment" | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [menuAnchor,       setMenuAnchor]       = useState<null | HTMLElement>(null);

  const paymentSucceeded = !!paymentData;

  useEffect(() => {
    dispatch(fetchJobById(jobId));
  }, [jobId, dispatch]);

  const isOwner = useMemo(() => {
    if (!job || !connectedUser) return false;
    return job.user?._id === connectedUser._id;
  }, [job, connectedUser]);

  const deletePost = useDeletePost({
    postId: job?._id,
    redirectTo: "/company/posts",
    refetchAfterDelete: false,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
    },
    onError: () => showToast({ message: "Failed to delete post", severity: "error" }),
  });

  const handleSaveSuccess = () => {
    if (job?.status === "open") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (paymentSucceeded) {
      setPaymentModalOpen(false);
      dispatch(resetPostPayment());
      return;
    }
    try {
      await dispatch(processPostPayment({ postId: job?._id, agentId: job?.agentId })).unwrap();
      await dispatch(updatePostStatus({ postId: job?._id, status: "open" })).unwrap();
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

  const handlePassInterview = () => {
    if (!job?._id) return;
    window.open(`${window.location.origin}/interview/hr?jobId=${job._id}`, "_blank", "noopener,noreferrer");
  };

  const jd      = job?.jobDetails || {};
  const isDraft = job?.status === "draft";

  return (
    <Box>
      {/* Back */}
      <Button
        startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
        onClick={onBack}
        sx={{
          mb: 2, textTransform: "none", fontWeight: 600, fontSize: "13px",
          color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 2,
          px: 2, py: 0.75,
          "&:hover": { bgcolor: "#F9FAFB", borderColor: TEAL, color: TEAL },
        }}
      >
        Back to Job Posts
      </Button>

      {loading && <LoadingOverlay height={400} message="Loading job details…" color={TEAL} />}

      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      )}

      {!loading && !error && job && (
        <>
          {/* Banner */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#1a1a2e" }}>
                  {jd.title || "Job Post"}
                </Typography>
                {isDraft && (
                  <Chip label="Draft" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 600, fontSize: "11px" }} />
                )}
                {!isDraft && (
                  <Chip label="Published" size="small" sx={{ bgcolor: "#D1FAE5", color: "#065F46", fontWeight: 600, fontSize: "11px" }} />
                )}
                {job.creationType === "ai" && (
                  <Chip label="AI" size="small" sx={{ bgcolor: "#EDE9FE", color: "#5B21B6", fontWeight: 600, fontSize: "11px" }} />
                )}
              </Box>
              <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                {jd.workMode && <span>{jd.workMode}</span>}
                {jd.workMode && jd.employmentType && <span> · </span>}
                {jd.employmentType && <span>{jd.employmentType}</span>}
                {(jd.workMode || jd.employmentType) && job.user?.companyName && <span> · </span>}
                {job.user?.companyName && <span>Posted by {job.user.companyName}</span>}
              </Typography>
            </Box>

            {/* Toolbar actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              {isOwner && isDraft && (
                <Button
                  variant="contained"
                  startIcon={<PublishOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => setPaymentModalOpen(true)}
                  sx={{ textTransform: "none", fontSize: "13px", fontWeight: 600, borderRadius: "20px", px: 2.5, bgcolor: "#F59E0B", "&:hover": { bgcolor: "#D97706" } }}
                >
                  Publish
                </Button>
              )}

              {isOwner && activeEdit === null && (
                <Button
                  variant="outlined"
                  startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => setActiveEdit("post")}
                  sx={{ textTransform: "none", fontSize: "13px", fontWeight: 600, borderRadius: "20px", px: 2.5, color: TEAL, borderColor: TEAL, "&:hover": { bgcolor: "#F0FDFA", borderColor: TEAL } }}
                >
                  Edit
                </Button>
              )}

              {!isDraft && (
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewOutlined sx={{ fontSize: 16 }} />}
                  onClick={handlePassInterview}
                  sx={{ textTransform: "none", fontSize: "13px", fontWeight: 600, borderRadius: "20px", px: 2.5, color: "#7C3AED", borderColor: "#7C3AED", "&:hover": { bgcolor: "#F5F3FF", borderColor: "#7C3AED" } }}
                >
                  Pass Interview
                </Button>
              )}

              {!isDraft && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlined sx={{ fontSize: 16 }} />}
                  onClick={handleCopyLink}
                  sx={{ textTransform: "none", fontSize: "13px", fontWeight: 600, borderRadius: "20px", px: 2.5, color: "#059669", borderColor: "#059669", "&:hover": { bgcolor: "#F0FDF4", borderColor: "#059669" } }}
                >
                  Copy Link
                </Button>
              )}

              {isOwner && (
                <>
                  <IconButton
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", p: 0.75, "&:hover": { bgcolor: "#FEF2F2", borderColor: "#E03E5C" } }}
                  >
                    <MoreVertOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { sx: { borderRadius: "10px", minWidth: 160, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" } } }}
                  >
                    <MenuItem
                      onClick={() => { setMenuAnchor(null); deletePost.handleOpen(); }}
                      sx={{ color: "#E03E5C", fontWeight: 600, fontSize: "14px", gap: 1 }}
                    >
                      <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                      Delete Post
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          <JobDetailContent
            activeEdit={activeEdit}
            isOwner={isOwner}
            creationType={job.creationType}
            onEditPost={() => setActiveEdit("post")}
            onEditRecruitment={() => setActiveEdit("recruitment")}
            onCancelEdit={() => setActiveEdit(null)}
            onSaveSuccess={handleSaveSuccess}
          />
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
  );
};

export default WorkplaceJobDetail;
