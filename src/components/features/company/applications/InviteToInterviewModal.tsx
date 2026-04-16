"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Typography,
} from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import { inviteToInterview } from "@/store/slices/jobApplicationSlice";
import type { AppDispatch } from "@/store/store";

const PURPLE = "#7C3AED";

export interface InviteTarget {
  applicationId: string;
  name: string;
  postTitle: string;
  postId: string;
}

interface Props {
  open: boolean;
  target: InviteTarget | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const InviteToInterviewModal: React.FC<Props> = ({ open, target, onClose, onSuccess }) => {
  const dispatch              = useDispatch<AppDispatch>();
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    if (!open) { setSending(false); setDone(false); }
  }, [open]);

  const interviewLink = target?.postId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/interview/hr?jobId=${target.postId}`
    : "";

  const handleSend = async () => {
    if (!target) return;
    setSending(true);
    const result = await dispatch(inviteToInterview({
      applicationId: target.applicationId,
      interviewLink,
    }));
    setSending(false);
    if (inviteToInterview.fulfilled.match(result)) {
      setDone(true);
      onSuccess?.();
      setTimeout(() => onClose(), 1800);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ px: 2.5, pt: 2.5, pb: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "11px", bgcolor: `${PURPLE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MailOutlined sx={{ fontSize: 20, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.25 }}>
              Send Interview Invitation
            </Typography>
            {target && (
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.25 }}>
                To <strong style={{ color: "#374151" }}>{target.name}</strong>
                {target.postTitle ? <> · <span style={{ color: "#9CA3AF" }}>{target.postTitle}</span></> : null}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" }, mt: 0.25 }}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 1 }}>
        {done ? (
          /* ── Success ── */
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#ECFDF5", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <CheckOutlined sx={{ fontSize: 26, color: "#059669" }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#059669" }}>Invitation sent!</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.75 }}>
              {target?.name} will receive an email with the interview link.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, pt: 0.5 }}>
            <Typography sx={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.7 }}>
              An invitation email will be sent to <strong style={{ color: "#111827" }}>{target?.name}</strong> with a direct link to start the interview.
            </Typography>

            {/* Link preview */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 1.25 }}>
              <LinkOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {interviewLink}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {!done && (
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{ textTransform: "none", color: "#6B7280", borderRadius: "10px", fontWeight: 500, fontSize: "13px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: "10px", fontSize: "13px",
              bgcolor: PURPLE, boxShadow: "none", color: "#fff", px: 2.5,
              "&:hover": { bgcolor: "#6D28D9", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: `${PURPLE}40`, color: "#fff" },
            }}
          >
            {sending
              ? <><CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />Sending…</>
              : "Send Invitation"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default InviteToInterviewModal;
