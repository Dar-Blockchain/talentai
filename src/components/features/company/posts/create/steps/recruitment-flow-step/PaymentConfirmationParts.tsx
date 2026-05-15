import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Image from "next/image";

const GREEN = "rgba(41, 210, 145, 1)";
const GREEN_08 = "rgba(41, 210, 145, 0.08)";
const GREEN_03 = "rgba(41, 210, 145, 0.3)";
const GREEN_01 = "rgba(41, 210, 145, 0.1)";
const GRAY_TEXT = "rgba(75, 85, 99, 1)";
const DARK_TEXT = "rgba(31, 41, 55, 1)";
const MUTED = "rgba(156, 163, 175, 1)";
const BORDER = "1px solid rgba(229, 231, 235, 1)";

/* ── Loading spinner shown during save-steps or publish ── */

interface ModalLoadingStateProps {
  message: string;
}

export const ModalLoadingState: React.FC<ModalLoadingStateProps> = ({ message }) => (
  <Box textAlign="center" py={4}>
    <CircularProgress size={120} thickness={2} sx={{ color: GREEN }} />
    <Typography
      sx={{ mt: 2, fontSize: "16px", fontWeight: 400, lineHeight: "22px", color: GRAY_TEXT }}
    >
      {message}
    </Typography>
  </Box>
);

/* ── Success checkmark shown after publish completes ── */

export const ModalSuccessState: React.FC = () => (
  <Box textAlign="center" py={4}>
    <Box sx={{ position: "relative", display: "inline-flex", width: 120, height: 120 }}>
      <Box
        sx={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `4px solid ${GREEN}`, background: "white", borderRadius: "50%",
        }}
      >
        <CheckIcon sx={{ color: GREEN, fontSize: 60 }} />
      </Box>
    </Box>
    <Typography
      sx={{ mt: 2, fontSize: "16px", fontWeight: 400, lineHeight: "22px", color: GRAY_TEXT }}
    >
      Your job post is now live and visible to candidates.
    </Typography>
  </Box>
);

/* ── Confirmation content shown before publish ── */

interface ConfirmationContentProps {
  numberOfSteps: number;
  totalPrice: number;
}

export const ConfirmationContent: React.FC<ConfirmationContentProps> = ({
  numberOfSteps,
  totalPrice,
}) => (
  <Box sx={{ py: 2 }}>
    {/* Free During Beta Banner */}
    <Alert
      severity="success"
      icon={false}
      sx={{
        mb: 2, borderRadius: "10px",
        backgroundColor: GREEN_08,
        border: `1px solid ${GREEN_03}`,
        "& .MuiAlert-message": { width: "100%" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: GREEN }}>
          Free During Beta
        </Typography>
        <Chip
          label="$0.00"
          size="small"
          sx={{ backgroundColor: GREEN, color: "#fff", fontWeight: 700, fontSize: "13px" }}
        />
      </Box>
      <Typography sx={{ fontSize: "12px", color: "rgba(75, 85, 99, 0.8)", mt: 0.5 }}>
        All features are free during the beta period. No payment required.
      </Typography>
    </Alert>

    <Typography
      sx={{
        color: GRAY_TEXT, fontFamily: "Inter", fontWeight: 400,
        fontSize: "14px", lineHeight: "22.4px",
      }}
    >
      You're about to activate your recruitment flow with{" "}
      <Box component="b" sx={{ color: "rgba(133, 169, 227, 1)" }}>
        {numberOfSteps} interview steps
      </Box>
      . Review the details below before publishing.
    </Typography>

    {/* Summary card */}
    <Box
      sx={{
        mt: 2, py: 2, px: 2.5, borderRadius: "12px", border: BORDER,
        background: "rgba(249, 250, 251, 1)",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600, fontSize: "13px", lineHeight: "19.5px",
          textTransform: "uppercase", color: "rgba(55, 65, 81, 1)", mb: 2,
        }}
      >
        Summary
      </Typography>

      {/* Steps row */}
      <Box
        sx={{
          display: "flex", justifyContent: "space-between",
          background: "#fff", border: BORDER, borderRadius: "8px", p: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex", justifyContent: "center", alignItems: "center",
              background: "rgba(34, 197, 94, 0.1)", borderRadius: "8px",
              width: 40, height: 40,
            }}
          >
            <Image src="/icons/people2.svg" alt="people" width={20} height={20} />
          </Box>
          <Typography sx={{ fontWeight: 500, fontSize: "14px", color: DARK_TEXT }}>
            Interview Steps
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(243, 244, 246, 1)", borderRadius: "8px",
            width: 40, height: 40, color: "rgba(17, 24, 39, 1)",
            fontSize: "18px", fontWeight: 700,
          }}
        >
          {numberOfSteps}
        </Box>
      </Box>

      {/* Price breakdown */}
      <Box
        sx={{
          mt: 2, display: "flex", flexDirection: "column", gap: 1,
          background: "#fff", border: BORDER, borderRadius: "8px", p: 1.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          <Typography sx={{ fontWeight: 400, fontSize: "13px", color: GRAY_TEXT }}>
            Base Fee
          </Typography>
          <Typography
            sx={{ fontWeight: 500, fontSize: "14px", color: MUTED, textDecoration: "line-through" }}
          >
            1,000 TAI
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          <Typography sx={{ fontWeight: 400, fontSize: "13px", color: GRAY_TEXT }}>
            Additional Fee{" "}
            <Box component="span" sx={{ color: MUTED, fontSize: "12px" }}>
              ({numberOfSteps} × 100 TAI)
            </Box>
          </Typography>
          <Typography
            sx={{ fontWeight: 500, fontSize: "14px", color: MUTED, textDecoration: "line-through" }}
          >
            {numberOfSteps * 100} TAI
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13px", color: DARK_TEXT }}>
            Total Amount
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontWeight: 500, fontSize: "14px", color: MUTED, textDecoration: "line-through" }}
            >
              {totalPrice} TAI
            </Typography>
            <Chip
              label="FREE"
              size="small"
              sx={{
                backgroundColor: GREEN_01, color: GREEN,
                fontWeight: 700, fontSize: "12px",
                border: `1px solid ${GREEN_03}`,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);
