import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { Check, Close } from "@mui/icons-material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import Image from "next/image";
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
import PostBasicDetails from "@/components/posts/details/PostBasicDetails";
import RecruitmentFlowDetails from "@/components/posts/details/RecruitmentFlowDetails";
import EditPostDetails from "@/components/posts/edit/EditPostDetails";
import EditRecruitmentFlow from "@/components/posts/edit/EditRecruitmentFlow";
import {
  PageBanner,
  SectionCard,
  StatusBadge,
  LoadingOverlay,
} from "./ui";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

// ─── Creation type config ──────────────────────────────────────────────────────
const CREATION_TYPE: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  ai:       { label: "AI Generated", color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  pipeline: { label: "Pipeline",     color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  manual:   { label: "Manual",       color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  jobId: string;
  onBack: () => void;
}
// ─── Component ─────────────────────────────────────────────────────────────────
const WorkplaceJobDetail: React.FC<Props> = ({ jobId, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const job     = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error   = useSelector(selectCurrentJobError);
  const connectedUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const tokenBalance   = useSelector(selectTokenBalance);
  const { data: paymentData, loading: isProcessingPayment, error: paymentError } = useSelector(selectPostPayment);

  const [activeEdit,       setActiveEdit]       = useState<"post" | "recruitment" | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const totalPrice           = 1000;
  const paymentSucceeded     = !!paymentData;
  const hasSufficientBalance = Number(tokenBalance) >= totalPrice;

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

  const handleCancelEdit = () => setActiveEdit(null);

  const handleSaveSuccess = () => {
    if (job?.status === "open") return;
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!hasSufficientBalance) {
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

  // ─── Derived values from job ────────────────────────────────────────────────
  const jd       = job?.jobDetails || {};
  const isDraft  = job?.status === "draft";
  const ctInfo   = CREATION_TYPE[job?.creationType || "manual"] || CREATION_TYPE.manual;
  const { Icon: CtIcon } = ctInfo;

  // ─── Banner subtitle ─────────────────────────────────────────────────────────
  const bannerSubtitle = job
    ? `${jd.workMode || ""} · ${jd.employmentType || ""} · Posted by ${job.user?.companyName || "your company"}`
    : "Loading job details…";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Back button */}
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

      {/* Loading */}
      {loading && <LoadingOverlay height={400} message="Loading job details…" color={TEAL} />}

      {/* Error */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Failed to load job details."}
        </Alert>
      )}

      {/* Content */}
      {!loading && !error && job && (
        <>
          {/* PageBanner */}
          <PageBanner
            title={jd.title || "Job Details"}
            subtitle={bannerSubtitle}
            icon={<WorkOutlined />}
            gradient="135deg, #0D9488 0%, #0891B2 100%"
            action={
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {/* Status badge */}
                <Chip
                  icon={<CtIcon sx={{ fontSize: 13 }} />}
                  label={ctInfo.label}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: "11px", height: 26,
                    bgcolor: "rgba(255,255,255,0.2)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
                <Chip
                  label={isDraft ? "Draft" : "Active"}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: "11px", height: 26,
                    bgcolor: isDraft ? "rgba(156,163,175,0.3)" : "rgba(255,255,255,0.2)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
              </Box>
            }
          />

          {/* Action toolbar */}
          <SectionCard sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mr: 1 }}>
                Actions:
              </Typography>

              {/* Publish (draft only) */}
              {isDraft && isOwner && (
                <Button
                  size="small"
                  startIcon={<PublishOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => setPaymentModalOpen(true)}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
                    color: "#D97706", border: "1px solid #FDE68A", bgcolor: "#FFFBEB",
                    "&:hover": { bgcolor: "#FEF3C7" },
                  }}
                >
                  Publish (1,000 TAI)
                </Button>
              )}

              {/* Edit Details */}
              {isOwner && activeEdit === null && (
                <Button
                  size="small"
                  startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => setActiveEdit("post")}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
                    color: TEAL, border: `1px solid ${TEAL_BORDER}`, bgcolor: TEAL_BG,
                    "&:hover": { bgcolor: "#CCFBF1" },
                  }}
                >
                  Edit Details
                </Button>
              )}

              {/* Pass Interview */}
              {!isDraft && (
                <Button
                  size="small"
                  startIcon={<EmojiEventsOutlined sx={{ fontSize: 15 }} />}
                  onClick={handlePassInterview}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
                    color: "#7C3AED", border: "1px solid #DDD6FE", bgcolor: "#F5F3FF",
                    "&:hover": { bgcolor: "#EDE9FE" },
                  }}
                >
                  Pass Interview
                </Button>
              )}

              {/* Copy Interview Link */}
              {!isDraft && (
                <Button
                  size="small"
                  startIcon={<ContentCopyOutlined sx={{ fontSize: 15 }} />}
                  onClick={handleCopyLink}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
                    color: "#16A34A", border: "1px solid #BBF7D0", bgcolor: "#F0FDF4",
                    "&:hover": { bgcolor: "#DCFCE7" },
                  }}
                >
                  Copy Interview Link
                </Button>
              )}

              {/* Delete */}
              {isOwner && (
                <Button
                  size="small"
                  startIcon={<DeleteOutlineOutlined sx={{ fontSize: 15 }} />}
                  onClick={deletePost.handleOpen}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: 2,
                    color: "#DC2626", border: "1px solid #FECACA", bgcolor: "#FEF2F2",
                    "&:hover": { bgcolor: "#FEE2E2" },
                    ml: "auto",
                  }}
                >
                  Delete Post
                </Button>
              )}
            </Box>
          </SectionCard>

          {/* Detail sections */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {activeEdit === "post" && (
              <EditPostDetails onCancel={handleCancelEdit} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeEdit === "recruitment" && (
              <EditRecruitmentFlow onCancel={handleCancelEdit} />
            )}

            {activeEdit === null && (
              <>
                <PostBasicDetails onEdit={() => setActiveEdit("post")} canEdit={isOwner} />
                {job.creationType !== "ai" && (
                  <RecruitmentFlowDetails onEdit={() => setActiveEdit("recruitment")} canEdit={isOwner} />
                )}
              </>
            )}
          </Box>
        </>
      )}

      {/* ── Delete Modal ───────────────────────────────────────────────────────── */}
      <DeletePostModal
        open={deletePost.open}
        onClose={deletePost.handleClose}
        onDelete={deletePost.handleDelete}
        isDeleting={deletePost.isDeleting}
      />

      {/* ── Publish / Payment Modal ────────────────────────────────────────────── */}
      <Dialog
        open={paymentModalOpen}
        onClose={handlePaymentClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", minWidth: 460 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(227,229,233,1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ color: "rgba(41,210,145,1)", fontWeight: 600, fontSize: "20px" }}>
              Publish Job Post
            </Typography>
            <IconButton onClick={handlePaymentClose} disabled={isProcessingPayment} sx={{ color: "black" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Processing */}
          {isProcessingPayment && (
            <Box textAlign="center" py={4}>
              <CircularProgress size={120} thickness={2} sx={{ color: "rgba(77,217,163,1)" }} />
              <Typography sx={{ mt: 2, fontSize: "16px", color: "rgba(75,85,99,1)" }}>
                Processing payment…
              </Typography>
            </Box>
          )}

          {/* Success */}
          {!isProcessingPayment && paymentSucceeded && (
            <Box textAlign="center" py={4}>
              <Box sx={{
                display: "inline-flex", width: 120, height: 120,
                alignItems: "center", justifyContent: "center",
                border: "4px solid rgba(77,217,163,1)", borderRadius: "50%",
              }}>
                <CheckIcon sx={{ color: "rgba(77,217,163,1)", fontSize: 60 }} />
              </Box>
              <Typography sx={{ mt: 2, fontSize: "16px", color: "rgba(75,85,99,1)" }}>
                Your job post is now live and visible to candidates.
              </Typography>
            </Box>
          )}

          {/* Payment details */}
          {!isProcessingPayment && !paymentSucceeded && (
            <Box sx={{ py: 2 }}>
              <Typography sx={{ color: "rgba(75,85,99,1)", fontSize: "14px", lineHeight: "22.4px" }}>
                Publishing this job post requires a payment. Please review the details below.
              </Typography>

              <Box sx={{ mt: 2, py: 2, px: 2.5, borderRadius: "12px", border: "1px solid rgba(229,231,235,1)" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", color: "rgba(55,65,81,1)", mb: 2 }}>
                  Payment Summary
                </Typography>
                <Box sx={{
                  display: "flex", justifyContent: "space-between",
                  background: "#fff", border: "1px solid rgba(229,231,235,1)", borderRadius: "8px", p: 1.5,
                }}>
                  <Typography sx={{ fontWeight: 400, fontSize: "13px", color: "rgba(75,85,99,1)" }}>
                    Publication Fee
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "rgba(222,147,0,1)" }}>
                    {totalPrice} TAI
                  </Typography>
                </Box>
              </Box>

              <Box sx={{
                backgroundColor: hasSufficientBalance ? "rgba(222,147,0,0.07)" : "rgba(200,65,75,0.07)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderRadius: "8px",
                border: hasSufficientBalance ? "none" : "1px solid rgba(200,65,75,1)",
                mt: 2, px: 2,
              }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Box sx={{
                    background: "white", borderRadius: "100%",
                    height: "40px", width: "40px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Image
                      src={hasSufficientBalance ? "/icons/dollarOutline.svg" : "/icons/dollarOutlineRed.svg"}
                      alt=""
                      width={18}
                      height={18}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", py: 2 }}>
                    <Typography sx={{ fontWeight: 400, fontSize: "12px", color: "rgba(75,85,99,1)" }}>
                      Your TAI Balance
                    </Typography>
                    <Typography sx={{
                      fontWeight: 700, fontSize: "16px",
                      color: hasSufficientBalance ? "rgba(17,24,39,1)" : "rgba(200,65,75,1)",
                    }}>
                      {tokenBalance} TAI
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: hasSufficientBalance ? "rgba(77,217,163,1)" : "rgba(200,65,75,1)",
                  borderRadius: "38px", color: "white", height: "30px", px: 2.5, py: 1,
                }}>
                  {hasSufficientBalance ? <Check sx={{ mr: 1, fontSize: "18px" }} /> : <Close sx={{ mr: 1, fontSize: "18px" }} />}
                  {hasSufficientBalance ? "Sufficient" : "Insufficient"}
                </Box>
              </Box>
            </Box>
          )}

          {paymentError && <Alert severity="error" sx={{ mt: 2 }}>{paymentError}</Alert>}
        </DialogContent>

        {!isProcessingPayment && (
          <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(227,229,233,1)" }}>
            <Button
              variant="outlined"
              onClick={handlePaymentClose}
              sx={{ border: "none", color: "rgba(133,169,227,1)", "&:hover": { background: "none" } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentConfirm}
              variant="outlined"
              disabled={isProcessingPayment}
              sx={{
                borderColor: "rgba(222,147,0,1)", color: "rgba(222,147,0,1)", fontWeight: 600,
                borderRadius: "38px", py: 1.5, height: "42px", textTransform: "none", fontSize: "0.875rem",
                "&:hover": { backgroundColor: "rgba(222,147,0,0.08)" },
              }}
            >
              {!hasSufficientBalance ? "Top up wallet" : paymentSucceeded ? "Done" : "Publish Job Post"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default WorkplaceJobDetail;
