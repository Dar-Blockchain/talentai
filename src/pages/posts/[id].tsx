import React, { useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobById,
  selectCurrentJob,
  selectCurrentJobError,
  selectCurrentJobLoading,
  processPostPayment,
  updatePostStatus,
  resetPostPayment,
  selectPostPayment,
} from "@/store/slices/postSlice";
import { selectTokenBalance, fetchTokenBalance } from "@/store/slices/tokenSlice";
import { openModal as openTokenPurchaseModal } from "@/store/slices/tokenPurchaseSlice";
import { Box, Button, Alert, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { Check, Close } from "@mui/icons-material";
import Image from "next/image";
import Header from "@/components/layout/Header";
import { ArrowBack } from "@mui/icons-material";
import PostBasicDetails from "@/components/posts/details/PostBasicDetails";
import RecruitmentFlowDetails from "@/components/posts/details/RecruitmentFlowDetails";
import AgentConfigurationDetails from "@/components/posts/details/AgentConfigurationDetails";
import Loader from "@/components/ui/Loader";
import EditPostDetails from "@/components/posts/edit/EditPostDetails";
import EditRecruitmentFlow from "@/components/posts/edit/EditRecruitmentFlow";
import EditAgentConfiguration from "@/components/posts/edit/EditAgentConfiguration";
import PageContainer from '@/components/layout/PageContainer'; 

const PostDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = router.query;
  const connectedUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);

  const [activeEdit, setActiveEdit] = React.useState<
    "post" | "recruitment" | "agent" | null
  >(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const tokenBalance = useSelector(selectTokenBalance);
  const { data: paymentData, loading: isProcessingPayment, error: paymentError } = useSelector(selectPostPayment);
  const paymentSucceeded = !!paymentData;
  const totalPrice = 1000;
  const hasSufficientBalance = Number(tokenBalance) >= totalPrice;

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
    }
  }, [id, dispatch]);

  const isOwner = useMemo(() => {
    if (!job || !connectedUser) return false;

    return job.user?._id === connectedUser._id;
  }, [job, connectedUser]);

  const handleCancelEdit = () => setActiveEdit(null);

  const handleSaveSuccess = () => {
    if (job?.status === "open") return; // Already open, no payment needed
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
    await dispatch(
      processPostPayment({ postId: job?._id, agentId: job?.agentId })
    ).unwrap();
    await dispatch(
      updatePostStatus({ postId: job?._id, status: "open" })
    ).unwrap();
    await dispatch(fetchTokenBalance()).unwrap();
  };

  const handlePaymentClose = () => {
    if (isProcessingPayment) return;
    setPaymentModalOpen(false);
    dispatch(resetPostPayment());
  };

  return (
    <PageContainer>
        <Header />

        <Button
          startIcon={
            <ArrowBack
              sx={{ color: "#10b981", transition: "transform 0.2s easeIn" }}
            />
          }
          onClick={() => router.back()}
          sx={{
            mt: 2,
            textTransform: "none",
            px: 0,
            color: "#111827",
            "&:hover": { background: "transparent", transform: "scale(1.05)" },
          }}
        >
          Back
        </Button>

        {loading && (
          <Loader
            title="Loading job details…"
            subtitle="Please wait while we load the job information."
          />
        )}
        {!loading && error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error || "Failed to load job details."}
          </Alert>
        )}

        {!loading && !error && job && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              mt: 2,
              border: "1px solid rgba(238, 240, 242, 1)",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 1)",
            }}
          >
            {activeEdit === "post" && (
              <EditPostDetails onCancel={handleCancelEdit} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeEdit === "recruitment" && (
              <EditRecruitmentFlow onCancel={handleCancelEdit} />
            )}
            {/* {activeEdit === "agent" && (
              <EditAgentConfiguration onCancel={handleCancelEdit} />
            )} */}

            {activeEdit === null && (
              <>
                <PostBasicDetails
                  onEdit={() => setActiveEdit("post")}
                  canEdit={isOwner}
                />

                {job?.creationType !== 'ai' && <RecruitmentFlowDetails
                  onEdit={() => setActiveEdit("recruitment")}
                  canEdit={isOwner}
                />}

                {/* {isOwner && (
                  <AgentConfigurationDetails
                    onEdit={() => setActiveEdit("agent")}
                  />
                )} */}
              </>
            )}
          </Box>
        )}
        {/* Payment Modal */}
        <Dialog
          open={paymentModalOpen}
          onClose={handlePaymentClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", minWidth: 500 } }}
        >
          <DialogTitle sx={{ borderBottom: "1px solid rgba(227, 229, 233, 1)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ color: "rgba(41, 210, 145, 1)", fontWeight: 600, fontSize: "20px" }}>
                Publish Job Post
              </Typography>
              <IconButton onClick={handlePaymentClose} disabled={isProcessingPayment} sx={{ color: "black" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {isProcessingPayment && (
              <Box textAlign="center" py={4}>
                <CircularProgress size={120} thickness={2} sx={{ color: "rgba(77, 217, 163, 1)" }} />
                <Typography sx={{ mt: 2, fontSize: "16px", color: "rgba(75, 85, 99, 1)" }}>
                  Processing payment…
                </Typography>
              </Box>
            )}

            {!isProcessingPayment && paymentSucceeded && (
              <Box textAlign="center" py={4}>
                <Box sx={{ display: "inline-flex", width: 120, height: 120, alignItems: "center", justifyContent: "center", border: "4px solid rgba(77, 217, 163, 1)", borderRadius: "50%" }}>
                  <CheckIcon sx={{ color: "rgba(77, 217, 163, 1)", fontSize: 60 }} />
                </Box>
                <Typography sx={{ mt: 2, fontSize: "16px", color: "rgba(75, 85, 99, 1)" }}>
                  Your job post is now live and visible to candidates.
                </Typography>
              </Box>
            )}

            {!isProcessingPayment && !paymentSucceeded && (
              <Box sx={{ py: 2 }}>
                <Typography sx={{ color: "rgba(75, 85, 99, 1)", fontSize: "14px", lineHeight: "22.4px" }}>
                  Publishing this job post requires a payment. Please review the details below.
                </Typography>
                <Box sx={{ mt: 2, py: 2, px: 2.5, borderRadius: "12px", border: "1px solid rgba(229, 231, 235, 1)" }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "13px", textTransform: "uppercase", color: "rgba(55, 65, 81, 1)", mb: 2 }}>
                    Payment Summary
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", background: "#fff", border: "1px solid rgba(229, 231, 235, 1)", borderRadius: "8px", p: 1.5 }}>
                    <Typography sx={{ fontWeight: 400, fontSize: "13px", color: "rgba(75, 85, 99, 1)" }}>
                      Publication Fee
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "rgba(222, 147, 0, 1)" }}>
                      {totalPrice} TAI
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  backgroundColor: hasSufficientBalance ? "rgba(222, 147, 0, 0.07)" : "rgba(200, 65, 75, 0.07)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderRadius: "8px", border: hasSufficientBalance ? "none" : "1px solid rgba(200, 65, 75, 1)", mt: 2, px: 2,
                }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Box sx={{ background: "white", borderRadius: "100%", height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Image src={hasSufficientBalance ? "/icons/dollarOutline.svg" : "/icons/dollarOutlineRed.svg"} alt="" width={18} height={18} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", py: 2 }}>
                      <Typography sx={{ fontWeight: 400, fontSize: "12px", color: "rgba(75, 85, 99, 1)" }}>Your TAI Balance</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: "16px", color: hasSufficientBalance ? "rgba(17, 24, 39, 1)" : "rgba(200, 65, 75, 1)" }}>
                        {tokenBalance} TAI
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: hasSufficientBalance ? "rgba(77, 217, 163, 1)" : "rgba(200, 65, 75, 1)",
                    borderRadius: "38px", color: "white", height: "30px", px: 2.5, py: 1,
                  }}>
                    {hasSufficientBalance ? <Check sx={{ mr: 1, fontSize: "18px" }} /> : <Close sx={{ mr: 1, fontSize: "18px" }} />}
                    {hasSufficientBalance ? "Sufficient" : "Insufficient"}
                  </Box>
                </Box>
              </Box>
            )}

            {paymentError && <Alert severity="error">{paymentError}</Alert>}
          </DialogContent>

          {!isProcessingPayment && (
            <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(227, 229, 233, 1)" }}>
              <Button variant="outlined" onClick={handlePaymentClose} sx={{ border: "none", color: "rgba(133, 169, 227, 1)", "&:hover": { background: "none" } }}>
                Cancel
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                variant="outlined"
                disabled={isProcessingPayment}
                sx={{
                  borderColor: "rgba(222, 147, 0, 1)", color: "rgba(222, 147, 0, 1)", fontWeight: 600,
                  borderRadius: "38px", py: 1.5, height: "42px", textTransform: "none", fontSize: "0.875rem",
                  "&:hover": { backgroundColor: "rgba(222, 147, 0, 0.08)" },
                }}
              >
                {!hasSufficientBalance ? "Top up wallet" : paymentSucceeded ? "Done" : "Publish Job Post"}
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </PageContainer>
  );
};

export default PostDetails;