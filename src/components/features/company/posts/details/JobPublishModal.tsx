import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { Check, Close } from "@mui/icons-material";
import Image from "next/image";

const TOTAL_PRICE = 1000;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokenBalance: string | number;
  isProcessing: boolean;
  succeeded: boolean;
  error?: string | null;
}

const JobPublishModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  tokenBalance,
  isProcessing,
  succeeded,
  error,
}) => {
  const hasSufficientBalance = Number(tokenBalance) >= TOTAL_PRICE;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", minWidth: 460 } }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid rgba(227,229,233,1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: "rgba(41,210,145,1)", fontWeight: 600, fontSize: "20px" }}>
            Publish Job Post
          </Typography>
          <IconButton onClick={onClose} disabled={isProcessing} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Processing */}
        {isProcessing && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={120} thickness={2} sx={{ color: "rgba(77,217,163,1)" }} />
            <Typography sx={{ mt: 2, fontSize: "16px", color: "rgba(75,85,99,1)" }}>
              Processing payment…
            </Typography>
          </Box>
        )}

        {/* Success */}
        {!isProcessing && succeeded && (
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
        {!isProcessing && !succeeded && (
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
                  {TOTAL_PRICE} TAI
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
                {hasSufficientBalance
                  ? <Check sx={{ mr: 1, fontSize: "18px" }} />
                  : <Close sx={{ mr: 1, fontSize: "18px" }} />}
                {hasSufficientBalance ? "Sufficient" : "Insufficient"}
              </Box>
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>

      {!isProcessing && (
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(227,229,233,1)" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ border: "none", color: "rgba(133,169,227,1)", "&:hover": { background: "none" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="outlined"
            disabled={isProcessing}
            sx={{
              borderColor: "rgba(222,147,0,1)", color: "rgba(222,147,0,1)", fontWeight: 600,
              borderRadius: "38px", py: 1.5, height: "42px", textTransform: "none", fontSize: "0.875rem",
              "&:hover": { backgroundColor: "rgba(222,147,0,0.08)" },
            }}
          >
            {!hasSufficientBalance ? "Top up wallet" : succeeded ? "Done" : "Publish Job Post"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default JobPublishModal;
