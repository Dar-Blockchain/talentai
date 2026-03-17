import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

interface CaptchaModalProps {
  open: boolean;
  onVerified: () => void;
  onClose: () => void;
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({ open, onVerified, onClose }) => {
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (checked) return;
    setChecked(true);
    setTimeout(() => {
      onVerified();
      onClose();
      setTimeout(() => setChecked(false), 400);
    }, 800);
  };

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          maxWidth: 360,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Top close */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, pt: 2 }}>
          <Box
            onClick={handleClose}
            sx={{ cursor: "pointer", color: "#d1d5db", "&:hover": { color: "#6b7280" }, transition: "color .2s" }}
          >
            <CloseIcon fontSize="small" />
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ px: 3.5, pb: 3.5, pt: 0.5, textAlign: "center" }}>
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #e6fff4, #ccfce8)",
              border: "1.5px solid rgba(12,218,139,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <ShieldIcon sx={{ color: "#0CDA8B", fontSize: 32 }} />
          </Box>

          <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#111827", mb: 0.75 }}>
            One quick check
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 3, lineHeight: 1.6 }}>
            Confirm you&apos;re human before we open the booking page.
          </Typography>

          {/* Checkbox row */}
          <Box
            onClick={handleCheck}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: checked ? "1.5px solid #0CDA8B" : "1.5px solid #e5e7eb",
              borderRadius: "14px",
              px: 2.5,
              py: 1.75,
              cursor: checked ? "default" : "pointer",
              background: checked ? "linear-gradient(135deg,#f0fdf8,#e6fff4)" : "#fafafa",
              transition: "all .25s ease",
              userSelect: "none",
              "&:hover": !checked
                ? { borderColor: "#0CDA8B", background: "#f0fdf8" }
                : {},
            }}
          >
            {/* Custom checkbox */}
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "8px",
                border: checked ? "none" : "2px solid #d1d5db",
                background: checked ? "#0CDA8B" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all .25s ease",
                boxShadow: checked ? "0 4px 12px rgba(12,218,139,0.4)" : "none",
              }}
            >
              {checked && (
                <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
              )}
            </Box>

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: checked ? "#059669" : "#374151" }}>
              {checked ? "Verified ✓" : "I'm not a robot"}
            </Typography>

            {/* reCAPTCHA-style branding */}
            <Box sx={{ ml: "auto", textAlign: "center", opacity: 0.4 }}>
              <ShieldIcon sx={{ fontSize: 20, color: "#9ca3af", display: "block", mx: "auto" }} />
              <Typography sx={{ fontSize: 8, color: "#9ca3af", lineHeight: 1.2 }}>
                TalentAI<br />Protect
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: 11, color: "#d1d5db", mt: 2 }}>
            Protected by TalentAI · Privacy · Terms
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CaptchaModal;
