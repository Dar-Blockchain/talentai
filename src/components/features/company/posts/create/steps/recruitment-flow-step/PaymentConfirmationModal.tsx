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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { selectPostStepsLoading, updatePostStatus } from "@/store/slices/postSlice";
import { useRouter } from "next/router";
import {
  ModalLoadingState,
  ModalSuccessState,
  ConfirmationContent,
} from "./PaymentConfirmationParts";

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

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

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isSavingSteps = useSelector(selectPostStepsLoading);
  const savedPost     = useSelector((state: RootState) => state.post.savePost.savedPost);
  const recruitmentFlow = useSelector((state: RootState) => state.post.recruitmentFlow);

  const [isPublishing,    setIsPublishing]    = useState(false);
  const [publishSuccess,  setPublishSuccess]  = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  const numberOfSteps = recruitmentFlow?.nodes?.length ?? 0;
  const totalPrice    = 1000 + numberOfSteps * 100;
  const isBusy        = isSavingSteps || isPublishing;
  const dialogTitle   = isSavingSteps ? "Saving Recruitment Pipeline" : "Publish Job Post";

  const handleConfirm = async () => {
    if (publishSuccess) { handleClose(); return; }
    try {
      setIsPublishing(true);
      setError(null);
      await dispatch(
        updatePostStatus({ postId: savedPost?.jobData?._id, status: "open" })
      ).unwrap();
      setPublishSuccess(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to publish job post");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    if (isBusy) return;
    onClose();
    setPublishSuccess(false);
    setError(null);
    router.push("/company/dashboard");
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: "1px solid rgba(227, 229, 233, 1)", color: "black" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(41, 210, 145, 1)", fontFamily: "Poppins",
              fontWeight: 600, fontSize: "20px", lineHeight: "25px",
            }}
          >
            {dialogTitle}
          </Typography>
          <IconButton onClick={handleClose} disabled={isBusy} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isSavingSteps && (
          <ModalLoadingState message="Please wait while we save your recruitment pipeline…" />
        )}

        {!isSavingSteps && isPublishing && (
          <ModalLoadingState message="Publishing your job post…" />
        )}

        {!isSavingSteps && !isPublishing && publishSuccess && (
          <ModalSuccessState />
        )}

        {!isSavingSteps && !isPublishing && !publishSuccess && (
          <ConfirmationContent numberOfSteps={numberOfSteps} totalPrice={totalPrice} />
        )}

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>

      {!isBusy && (
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(227, 229, 233, 1)" }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              border: "none", background: "none", color: "rgba(133, 169, 227, 1)",
              "&:hover": { background: "none", color: "rgba(133, 169, 227, 0.8)" },
            }}
          >
            {publishSuccess ? "Cancel" : "View Job Post"}
          </Button>

          <Button
            onClick={handleConfirm}
            variant="outlined"
            disabled={isBusy}
            startIcon={isPublishing && <CircularProgress size={16} color="inherit" />}
            sx={{
              borderColor: "rgba(41, 210, 145, 1)", color: "rgba(41, 210, 145, 1)",
              fontWeight: 600, borderRadius: "38px", py: 1.5,
              maxWidth: "300px", height: "42px", textTransform: "none",
              fontSize: "0.875rem", borderWidth: "1px",
              "&:hover": {
                backgroundColor: "rgba(41, 210, 145, 0.08)",
                borderColor: "rgba(41, 210, 145, 1)",
              },
              "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
            }}
          >
            {publishSuccess ? "View Job Post" : isPublishing ? "Publishing..." : "Publish Job Post"}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default PaymentConfirmationModal;
