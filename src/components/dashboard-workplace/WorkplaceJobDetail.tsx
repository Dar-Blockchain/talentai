import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
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
import { openModal as openTokenPurchaseModal } from "@/store/slices/tokenPurchaseSlice";
import { useToast } from "@/hooks/useToast";
import { useDeletePost } from "@/components/posts/delete/useDeletePost";
import DeletePostModal from "@/components/posts/delete/DeletePostModal";
import LoadingOverlay from "./ui/LoadingOverlay";
import JobDetailBanner from "@/components/features/company/posts/details/JobDetailBanner";
import JobDetailToolbar from "@/components/features/company/posts/details/JobDetailToolbar";
import JobDetailContent from "@/components/features/company/posts/details/JobDetailContent";
import JobPublishModal from "@/components/features/company/posts/details/JobPublishModal";

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

  const tokenBalance = useSelector(selectTokenBalance);
  const { data: paymentData, loading: isProcessingPayment, error: paymentError } = useSelector(selectPostPayment);

  const [activeEdit,       setActiveEdit]       = useState<"post" | "recruitment" | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
    refetchAfterDelete: false,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
      onBack();
    },
    onError: () => showToast({ message: "Failed to delete post", severity: "error" }),
  });

  const handleSaveSuccess = () => {
    if (job?.status === "open") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!paymentData && Number(tokenBalance) < 1000) {
      dispatch(openTokenPurchaseModal());
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

  const handlePassInterview = () => {
    if (!job?._id) return;
    window.open(`${window.location.origin}/interview/hr?jobId=${job._id}`, "_blank", "noopener,noreferrer");
  };

  const jd      = job?.jobDetails || {};
  const isDraft = job?.status === "draft";
  const bannerSubtitle = job
    ? `${jd.workMode || ""} · ${jd.employmentType || ""} · Posted by ${job.user?.companyName || "your company"}`
    : "Loading job details…";

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
          <JobDetailBanner
            title={jd.title}
            subtitle={bannerSubtitle}
            creationType={job.creationType}
            isDraft={isDraft}
          />

          <JobDetailToolbar
            isDraft={isDraft}
            isOwner={isOwner}
            isEditing={activeEdit !== null}
            onPublish={() => setPaymentModalOpen(true)}
            onEdit={() => setActiveEdit("post")}
            onPassInterview={handlePassInterview}
            onCopyLink={handleCopyLink}
            onDelete={deletePost.handleOpen}
          />

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
