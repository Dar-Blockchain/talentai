import React, { memo, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, CircularProgress, Alert, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { Check, Close } from "@mui/icons-material";
import Image from "next/image";

// ─── Static constants ─────────────────────────────────────────────────────────

const TOTAL_PRICE = 1000;

const PAPER_SX       = { borderRadius: "16px", minWidth: 460 } as const;
const TITLE_INNER_SX = { display: "flex", alignItems: "center", justifyContent: "space-between" } as const;
const TITLE_TEXT_SX  = { color: "rgba(41,210,145,1)", fontWeight: 600, fontSize: "20px" } as const;
const CLOSE_BTN_SX   = { color: "black" } as const;
const TITLE_BORDER_SX = { borderBottom: "1px solid rgba(227,229,233,1)" } as const;
const PROCESSING_BOX_SX = { textAlign: "center", py: 4 } as const;
const PROCESSING_TEXT_SX = { mt: 2, fontSize: "16px", color: "rgba(75,85,99,1)" } as const;
const SUCCESS_RING_SX = { display: "inline-flex", width: 120, height: 120, alignItems: "center", justifyContent: "center", border: "4px solid rgba(77,217,163,1)", borderRadius: "50%" } as const;
const PAYMENT_BOX_SX  = { py: 2 } as const;
const PAYMENT_DESC_SX = { color: "rgba(75,85,99,1)", fontSize: "14px", lineHeight: "22.4px" } as const;
const SUMMARY_CARD_SX = { mt: 2, py: 2, px: 2.5, borderRadius: "12px", border: "1px solid rgba(229,231,235,1)" } as const;
const SUMMARY_LABEL_SX = { fontWeight: 600, fontSize: "13px", textTransform: "uppercase", color: "rgba(55,65,81,1)", mb: 2 } as const;
const FEE_ROW_SX      = { display: "flex", justifyContent: "space-between", background: "#fff", border: "1px solid rgba(229,231,235,1)", borderRadius: "8px", p: 1.5 } as const;
const FEE_LABEL_SX    = { fontWeight: 400, fontSize: "13px", color: "rgba(75,85,99,1)" } as const;
const FEE_VALUE_SX    = { fontWeight: 700, fontSize: "18px", color: "rgba(222,147,0,1)" } as const;
const AVATAR_BOX_SX   = { background: "white", borderRadius: "100%", height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" } as const;
const BALANCE_COL_SX  = { display: "flex", flexDirection: "column", py: 2 } as const;
const BALANCE_LABEL_SX = { fontWeight: 400, fontSize: "12px", color: "rgba(75,85,99,1)" } as const;
const ACTIONS_SX      = { p: 3, borderTop: "1px solid rgba(227,229,233,1)" } as const;
const CANCEL_BTN_SX   = { border: "none", color: "rgba(133,169,227,1)", "&:hover": { background: "none" } } as const;
const CONFIRM_BTN_SX  = { borderColor: "rgba(222,147,0,1)", color: "rgba(222,147,0,1)", fontWeight: 600, borderRadius: "38px", py: 1.5, height: "42px", textTransform: "none", fontSize: "0.875rem", "&:hover": { backgroundColor: "rgba(222,147,0,0.08)" } } as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokenBalance: string | number;
  isProcessing: boolean;
  succeeded: boolean;
  error?: string | null;
}

const JobPublishModal = memo<Props>(({ open, onClose, onConfirm, tokenBalance, isProcessing, succeeded, error }) => {
  const hasSufficientBalance = useMemo(() => Number(tokenBalance) >= TOTAL_PRICE, [tokenBalance]);

  const balanceRowSx = useMemo(() => ({
    backgroundColor: hasSufficientBalance ? "rgba(222,147,0,0.07)" : "rgba(200,65,75,0.07)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderRadius: "8px",
    border: hasSufficientBalance ? "none" : "1px solid rgba(200,65,75,1)",
    mt: 2, px: 2,
  }), [hasSufficientBalance]);

  const balanceValueSx = useMemo(() => ({
    fontWeight: 700, fontSize: "16px",
    color: hasSufficientBalance ? "rgba(17,24,39,1)" : "rgba(200,65,75,1)",
  }), [hasSufficientBalance]);

  const statusBadgeSx = useMemo(() => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    background: hasSufficientBalance ? "rgba(77,217,163,1)" : "rgba(200,65,75,1)",
    borderRadius: "38px", color: "white", height: "30px", px: 2.5, py: 1,
  }), [hasSufficientBalance]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: PAPER_SX }}>
      <DialogTitle sx={TITLE_BORDER_SX}>
        <Box sx={TITLE_INNER_SX}>
          <Typography variant="h6" sx={TITLE_TEXT_SX}>Publish Job Post</Typography>
          <IconButton onClick={onClose} disabled={isProcessing} sx={CLOSE_BTN_SX}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isProcessing && (
          <Box sx={PROCESSING_BOX_SX}>
            <CircularProgress size={120} thickness={2} sx={{ color: "rgba(77,217,163,1)" }} />
            <Typography sx={PROCESSING_TEXT_SX}>Processing payment…</Typography>
          </Box>
        )}

        {!isProcessing && succeeded && (
          <Box textAlign="center" py={4}>
            <Box sx={SUCCESS_RING_SX}>
              <CheckIcon sx={{ color: "rgba(77,217,163,1)", fontSize: 60 }} />
            </Box>
            <Typography sx={PROCESSING_TEXT_SX}>
              Your job post is now live and visible to candidates.
            </Typography>
          </Box>
        )}

        {!isProcessing && !succeeded && (
          <Box sx={PAYMENT_BOX_SX}>
            <Typography sx={PAYMENT_DESC_SX}>
              Publishing this job post requires a payment. Please review the details below.
            </Typography>

            <Box sx={SUMMARY_CARD_SX}>
              <Typography sx={SUMMARY_LABEL_SX}>Payment Summary</Typography>
              <Box sx={FEE_ROW_SX}>
                <Typography sx={FEE_LABEL_SX}>Publication Fee</Typography>
                <Typography sx={FEE_VALUE_SX}>{TOTAL_PRICE} TAI</Typography>
              </Box>
            </Box>

            <Box sx={balanceRowSx}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box sx={AVATAR_BOX_SX}>
                  <Image
                    src={hasSufficientBalance ? "/icons/dollarOutline.svg" : "/icons/dollarOutlineRed.svg"}
                    alt="" width={18} height={18}
                  />
                </Box>
                <Box sx={BALANCE_COL_SX}>
                  <Typography sx={BALANCE_LABEL_SX}>Your TAI Balance</Typography>
                  <Typography sx={balanceValueSx}>{tokenBalance} TAI</Typography>
                </Box>
              </Box>
              <Box sx={statusBadgeSx}>
                {hasSufficientBalance ? <Check sx={{ mr: 1, fontSize: "18px" }} /> : <Close sx={{ mr: 1, fontSize: "18px" }} />}
                {hasSufficientBalance ? "Sufficient" : "Insufficient"}
              </Box>
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>

      {!isProcessing && (
        <DialogActions sx={ACTIONS_SX}>
          <Button variant="outlined" onClick={onClose} sx={CANCEL_BTN_SX}>Cancel</Button>
          <Button onClick={onConfirm} variant="outlined" disabled={isProcessing} sx={CONFIRM_BTN_SX}>
            {!hasSufficientBalance ? "Top up wallet" : succeeded ? "Done" : "Publish Job Post"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});
JobPublishModal.displayName = "JobPublishModal";

export default JobPublishModal;
