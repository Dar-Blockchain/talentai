import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  // processPostPayment,
  // selectPostPayment,
  selectPostStepsLoading,
  // resetPostPayment,
  updatePostStatus,
} from "@/store/slices/postSlice";
import CheckIcon from "@mui/icons-material/Check";
import Image from "next/image";
// import { Check, Close } from "@mui/icons-material";
// import { selectTokenBalance } from "@/store/slices/tokenSlice";
import { useRouter } from "next/router";
// import { openModal } from "@/store/slices/tokenPurchaseSlice";
// import { fetchTokenBalance } from "@/store/slices/tokenSlice";

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

/* ================= Styles ================= */

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    minWidth: 500,
    [theme.breakpoints.down("sm")]: {
      minWidth: "90%",
      margin: 16,
    },
  },
}));

/* ================= Component ================= */

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  /* ===== Redux State ===== */
  // const { isProcessing } = useSelector(
  //   (state: RootState) => state.tokenPurchase
  // );
  // const tokenBalance = useSelector(selectTokenBalance);

  const isSavingSteps = useSelector(selectPostStepsLoading);
  // const {
  //   data,
  //   loading: isProcessingPayment,
  //   error,
  // } = useSelector(selectPostPayment);

  const savedPost = useSelector((state: any) => state.post.savePost.savedPost);
  const recruitmentFlow = useSelector(
    (state: any) => state.post.recruitmentFlow
  );
  // const { value: agent } = useSelector(
  //   (state: RootState) => state.agentConfig.createConfig
  // );

  /* ===== Local State (replaces payment processing state) ===== */
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===== Derived State ===== */
  const numberOfSteps = recruitmentFlow?.nodes?.length || 0;
  const totalPrice = 1000 + numberOfSteps * 100;

  // const isBusy = isSavingSteps || isProcessingPayment || isProcessing;
  const isBusy = isSavingSteps || isPublishing;

  // const paymentSucceeded = !!data;

  const dialogTitle = isSavingSteps
    ? "Saving Recruitment Pipeline"
    : "Publish Job Post";

  // const hasSufficientBalance = Number(tokenBalance) >= totalPrice;

  /* ===== Handlers ===== */

  const handleConfirm = async () => {
    // --- Payment flow commented out (free during beta) ---
    // if (!hasSufficientBalance) {
    //   dispatch(openModal());
    //   onClose();
    //   dispatch(resetPostPayment());
    // } else if (paymentSucceeded) {
    //   handleClose();
    // } else {
    //   await dispatch(
    //     processPostPayment({
    //       postId: savedPost?.jobData?._id,
    //       agentId: agent?.agentId,
    //     })
    //   ).unwrap();
    //   await dispatch(
    //     updatePostStatus({ postId: savedPost?.jobData?._id, status: "open" })
    //   ).unwrap();
    //   await dispatch(fetchTokenBalance()).unwrap();
    // }

    // --- Free flow: just publish directly ---
    if (publishSuccess) {
      handleClose();
      return;
    }

    try {
      setIsPublishing(true);
      setError(null);
      await dispatch(
        updatePostStatus({ postId: savedPost?.jobData?._id, status: "open" })
      ).unwrap();
      setPublishSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to publish job post");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (isBusy) return;
    onClose();
    // dispatch(resetPostPayment());
    setPublishSuccess(false);
    setError(null);
    router.push("/company/dashboard");
  };

  /* ================= Render ================= */

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* ===== Title ===== */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid rgba(227, 229, 233, 1)",
          color: "black",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "rgba(41, 210, 145, 1)",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontStyle: "normal",
              fontSize: "20px",
              lineHeight: "25px",
              letterSpacing: "0px",
            }}
          >
            {dialogTitle}
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={isBusy}
            sx={{ color: "black" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent>
        {/* STEP 1: Saving recruitment steps */}
        {isSavingSteps && (
          <Box textAlign="center" py={4}>
            <CircularProgress
              size={120}
              thickness={2}
              sx={{ color: "rgba(77, 217, 163, 1)" }}
            />
            <Typography
              sx={{
                mt: 2,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "rgba(75, 85, 99, 1)",
              }}
            >
              Please wait while we save your recruitment pipeline…
            </Typography>
          </Box>
        )}

        {/* STEP 2: Processing payment - commented out (free during beta) */}
        {/* {!isSavingSteps && isProcessingPayment && (
          <Box textAlign="center" py={4}>
            <CircularProgress
              size={120}
              thickness={2}
              sx={{ color: "rgba(77, 217, 163, 1)" }}
            />
            <Typography
              sx={{
                mt: 2,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "rgba(75, 85, 99, 1)",
              }}
            >
              Hold tight! We're processing the payment for your recruitment
              steps…
            </Typography>
          </Box>
        )} */}

        {/* STEP 2 (free): Publishing */}
        {!isSavingSteps && isPublishing && (
          <Box textAlign="center" py={4}>
            <CircularProgress
              size={120}
              thickness={2}
              sx={{ color: "rgba(77, 217, 163, 1)" }}
            />
            <Typography
              sx={{
                mt: 2,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "rgba(75, 85, 99, 1)",
              }}
            >
              Publishing your job post…
            </Typography>
          </Box>
        )}

        {/* STEP 3: Payment success - commented out (free during beta) */}
        {/* {!isSavingSteps && !isProcessingPayment && paymentSucceeded && (
          <Box textAlign="center" py={4}>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                width: 120,
                height: 120,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid rgba(77, 217, 163, 1)",
                  background: "white",
                  borderRadius: "50%",
                }}
              >
                <CheckIcon
                  sx={{ color: "rgba(77, 217, 163, 1)", fontSize: 60 }}
                />
              </Box>
            </Box>
            <Typography
              sx={{
                mt: 2,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "rgba(75, 85, 99, 1)",
              }}
            >
              Your job post is now live and visible to candidates.
            </Typography>
          </Box>
        )} */}

        {/* STEP 3 (free): Publish success */}
        {!isSavingSteps && !isPublishing && publishSuccess && (
          <Box textAlign="center" py={4}>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                width: 120,
                height: 120,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid rgba(77, 217, 163, 1)",
                  background: "white",
                  borderRadius: "50%",
                }}
              >
                <CheckIcon
                  sx={{ color: "rgba(77, 217, 163, 1)", fontSize: 60 }}
                />
              </Box>
            </Box>
            <Typography
              sx={{
                mt: 2,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "22px",
                color: "rgba(75, 85, 99, 1)",
              }}
            >
              Your job post is now live and visible to candidates.
            </Typography>
          </Box>
        )}

        {/* STEP 4: Payment confirmation - commented out (free during beta) */}
        {/* {!isSavingSteps && !isProcessingPayment && !paymentSucceeded && (
          <Box sx={{ py: 2 }}>
            <Typography
              sx={{
                color: "rgba(75, 85, 99, 1)",
                fontFamily: "Inter",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "22.4px",
                letterSpacing: "0%",
                verticalAlign: "middle",
              }}
            >
              You're about to activate your recruitment flow with{" "}
              <b style={{ color: "rgba(133, 169, 227, 1)" }}>
                {numberOfSteps} interview steps
              </b>
              . Please review the payment breakdown below before confirming.
            </Typography>
            <Box
              sx={{
                mt: 2,
                py: 2,
                px: 2.5,
                Background: "rgba(249, 250, 251, 1)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 1)",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "19.5px",
                  textTransform: "uppercase",
                  color: "rgba(55, 65, 81, 1)",
                  mb: 2,
                }}
              >
                Payment Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid rgba(229, 231, 235, 1)",
                  borderRadius: "8px",
                  p: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "rgba(34, 197, 94, 0.1)",
                      borderRadius: "8px",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <Image
                      src="/icons/people2.svg"
                      alt="people"
                      width={20}
                      height={20}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    Interview Steps
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(243, 244, 246, 1)",
                    borderRadius: "8px",
                    width: "40px",
                    height: "40px",
                    color: "rgba(17, 24, 39, 1)",
                    fontSize: "18px",
                    fontWeight: 700,
                    lineHeight: "27px",
                  }}
                >
                  {numberOfSteps}
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid rgba(229, 231, 235, 1)",
                  borderRadius: "8px",
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(75, 85, 99, 1)",
                    }}
                  >
                    Base Fee
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    1,000 TAI
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(75, 85, 99, 1)",
                    }}
                  >
                    Additional Fee{" "}
                    <span
                      style={{
                        color: "rgba(156, 163, 175, 1)",
                        fontSize: "12px",
                      }}
                    >
                      ({numberOfSteps} × 100 TAI)
                    </span>
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    {numberOfSteps * 100} TAI
                  </Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    Total Amount
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: "27px",
                      textTransform: "uppercase",
                      color: "rgba(222, 147, 0, 1)",
                    }}
                  >
                    {totalPrice} TAI
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                backgroundColor: hasSufficientBalance
                  ? "rgba(222, 147, 0, 0.07)"
                  : "rgba(200, 65, 75, 0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "8px",
                border: hasSufficientBalance
                  ? "none"
                  : "1px solid rgba(200, 65, 75, 1)",
                mt: 2,
                px: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box
                  sx={{
                    background: "white",
                    borderRadius: "100%",
                    height: "40px",
                    width: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={
                      hasSufficientBalance
                        ? "/icons/dollarOutline.svg"
                        : "/icons/dollarOutlineRed.svg"
                    }
                    alt=""
                    width={18}
                    height={18}
                  />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", py: 2 }}>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "12px",
                      color: "rgba(75, 85, 99, 1)",
                    }}
                  >
                    Your TAI Balance
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "16px",
                      color: hasSufficientBalance
                        ? "rgba(17, 24, 39, 1)"
                        : "rgba(200, 65, 75, 1)",
                    }}
                  >
                    {tokenBalance} TAI
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: hasSufficientBalance
                    ? "rgba(77, 217, 163, 1)"
                    : "rgba(200, 65, 75, 1)",
                  borderRadius: "38px",
                  color: "white",
                  height: "30px",
                  px: 2.5,
                  py: 1,
                }}
              >
                {hasSufficientBalance ? (
                  <Check sx={{ mr: 1, fontSize: "18px" }} />
                ) : (
                  <Close sx={{ mr: 1, fontSize: "18px" }} />
                )}{" "}
                {hasSufficientBalance ? "Sufficient" : "Insufficient"}
              </Box>
            </Box>
          </Box>
        )} */}

        {/* STEP 4 (free): Confirmation with free banner */}
        {!isSavingSteps && !isPublishing && !publishSuccess && (
          <Box sx={{ py: 2 }}>
            {/* Free During Beta Banner */}
            <Alert
              severity="success"
              icon={false}
              sx={{
                mb: 2,
                borderRadius: "10px",
                backgroundColor: "rgba(41, 210, 145, 0.08)",
                border: "1px solid rgba(41, 210, 145, 0.3)",
                "& .MuiAlert-message": { width: "100%" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "rgba(41, 210, 145, 1)",
                  }}
                >
                  Free During Beta
                </Typography>
                <Chip
                  label="$0.00"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(41, 210, 145, 1)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "rgba(75, 85, 99, 0.8)",
                  mt: 0.5,
                }}
              >
                All features are free during the beta period. No payment
                required.
              </Typography>
            </Alert>

            <Typography
              sx={{
                color: "rgba(75, 85, 99, 1)",
                fontFamily: "Inter",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "22.4px",
                letterSpacing: "0%",
                verticalAlign: "middle",
              }}
            >
              You're about to activate your recruitment flow with{" "}
              <b style={{ color: "rgba(133, 169, 227, 1)" }}>
                {numberOfSteps} interview steps
              </b>
              . Review the details below before publishing.
            </Typography>
            <Box
              sx={{
                mt: 2,
                py: 2,
                px: 2.5,
                Background: "rgba(249, 250, 251, 1)",
                borderRadius: "12px",
                border: "1px solid rgba(229, 231, 235, 1)",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "19.5px",
                  textTransform: "uppercase",
                  color: "rgba(55, 65, 81, 1)",
                  mb: 2,
                }}
              >
                Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid rgba(229, 231, 235, 1)",
                  borderRadius: "8px",
                  p: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "rgba(34, 197, 94, 0.1)",
                      borderRadius: "8px",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <Image
                      src="/icons/people2.svg"
                      alt="people"
                      width={20}
                      height={20}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    Interview Steps
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(243, 244, 246, 1)",
                    borderRadius: "8px",
                    width: "40px",
                    height: "40px",
                    color: "rgba(17, 24, 39, 1)",
                    fontSize: "18px",
                    fontWeight: 700,
                    lineHeight: "27px",
                  }}
                >
                  {numberOfSteps}
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  background: "rgba(255, 255, 255, 1)",
                  border: "1px solid rgba(229, 231, 235, 1)",
                  borderRadius: "8px",
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(75, 85, 99, 1)",
                    }}
                  >
                    Base Fee
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(156, 163, 175, 1)",
                      textDecoration: "line-through",
                    }}
                  >
                    1,000 TAI
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(75, 85, 99, 1)",
                    }}
                  >
                    Additional Fee{" "}
                    <span
                      style={{
                        color: "rgba(156, 163, 175, 1)",
                        fontSize: "12px",
                      }}
                    >
                      ({numberOfSteps} × 100 TAI)
                    </span>
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "rgba(156, 163, 175, 1)",
                      textDecoration: "line-through",
                    }}
                  >
                    {numberOfSteps * 100} TAI
                  </Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "21px",
                      color: "rgba(31, 41, 55, 1)",
                    }}
                  >
                    Total Amount
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "21px",
                        color: "rgba(156, 163, 175, 1)",
                        textDecoration: "line-through",
                      }}
                    >
                      {totalPrice} TAI
                    </Typography>
                    <Chip
                      label="FREE"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(41, 210, 145, 0.1)",
                        color: "rgba(41, 210, 145, 1)",
                        fontWeight: 700,
                        fontSize: "12px",
                        border: "1px solid rgba(41, 210, 145, 0.3)",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>

      {/* ===== Actions ===== */}
      {!isBusy && (
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid rgba(227, 229, 233, 1)" }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(133, 169, 227, 1)",
              textDecoration: "none",
              "&:hover": {
                background: "none",
                textDecoration: "none",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            {publishSuccess ? "Cancel" : "View Job Post"}
          </Button>

          <Button
            onClick={handleConfirm}
            variant="outlined"
            disabled={isBusy}
            startIcon={
              isPublishing && (
                <CircularProgress size={16} color="inherit" />
              )
            }
            sx={{
              // --- Original payment button style (commented out) ---
              // borderColor: "rgba(222, 147, 0, 1)",
              // color: "rgba(222, 147, 0, 1)",
              borderColor: "rgba(41, 210, 145, 1)",
              color: "rgba(41, 210, 145, 1)",
              fontWeight: 600,
              borderRadius: "38px",
              py: 1.5,
              maxWidth: "300px",
              height: "42px",
              textTransform: "none",
              fontSize: "0.875rem",
              borderWidth: "1px",
              "&:hover": {
                // backgroundColor: "rgba(222, 147, 0, 0.08)",
                backgroundColor: "rgba(41, 210, 145, 0.08)",
                borderColor: "rgba(41, 210, 145, 1)",
              },
              "&.Mui-disabled": {
                borderColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            {/* --- Original payment button labels (commented out) ---
            {!hasSufficientBalance
              ? "Top up wallet"
              : paymentSucceeded
              ? "View Job Post"
              : isProcessingPayment
              ? "Processing Payment..."
              : "Publish Job Post"}
            */}
            {publishSuccess
              ? "View Job Post"
              : isPublishing
              ? "Publishing..."
              : "Publish Job Post"}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default PaymentConfirmationModal;
