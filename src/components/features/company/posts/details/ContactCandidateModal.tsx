import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar, Box, Button, CircularProgress, Dialog, DialogContent,
  Divider, IconButton, TextField, Typography,
} from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import SendOutlined from "@mui/icons-material/Send";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutline";
import axiosInstance from "@/utils/axiosInstance";
import { AppDispatch, RootState } from "@/store/store";
import {
  createOrFindConversation,
  sendMessage,
  selectSendingMessage,
} from "@/store/slices/chatSlice";

// ── Constants ──────────────────────────────────────────────────────────────────

const TEAL = "#0D9488";

function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ContactTarget {
  name: string;
  email: string;
  candidateUserId: string | null;
  avatarUrl?: string;
  bgColor: string;
}

export interface ContactCandidateModalProps {
  open: boolean;
  target: ContactTarget | null;
  onClose: () => void;
}

type ContactMode = "email" | "chat";

const MODES: Record<ContactMode, {
  labelKey: string;
  sublabelKey: string;
  Icon: React.ElementType;
  color: string;
  lightBg: string;
  activeBorder: string;
}> = {
  email: {
    labelKey: "pages.applications.contact_modal.mode_email_label",
    sublabelKey: "pages.applications.contact_modal.mode_email_sublabel",
    Icon: EmailOutlined,
    color: "#2563EB",
    lightBg: "#EFF6FF",
    activeBorder: "#BFDBFE",
  },
  chat: {
    labelKey: "pages.applications.contact_modal.mode_chat_label",
    sublabelKey: "pages.applications.contact_modal.mode_chat_sublabel",
    Icon: ChatBubbleOutlineOutlined,
    color: TEAL,
    lightBg: `${TEAL}0F`,
    activeBorder: `${TEAL}40`,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

const ContactCandidateModal: React.FC<ContactCandidateModalProps> = ({ open, target, onClose }) => {
  const { t } = useTranslation("dashboard");
  const dispatch    = useDispatch<AppDispatch>();
  const companyId   = useSelector((s: RootState) => s.user.connectedUser?.user?._id as string | undefined);
  const chatSending = useSelector(selectSendingMessage);

  const [mode, setMode]       = useState<ContactMode>("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (open) {
      setMode("email");
      setSubject("");
      setMessage("");
      setSending(false);
      setSent(false);
      setError("");
    }
  }, [open]);

  const handleSendEmail = async () => {
    if (!target?.email || !subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      await axiosInstance.post("job-applications/contact-candidate", {
        candidateEmail: target.email,
        candidateName: target.name,
        subject,
        message,
      });
      setSent(true);
      setTimeout(onClose, 2000);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || t("pages.applications.contact_modal.error_email"));
    } finally {
      setSending(false);
    }
  };

  const handleSendChat = async () => {
    if (!message.trim()) { setError(t("pages.applications.contact_modal.error_empty")); return; }
    if (!target?.candidateUserId || !companyId) {
      setError(t("pages.applications.contact_modal.error_no_user"));
      return;
    }
    setError("");
    const conv = await dispatch(createOrFindConversation({ candidateId: target.candidateUserId, companyId }));
    if (!createOrFindConversation.fulfilled.match(conv)) {
      setError(t("pages.applications.contact_modal.error_conv"));
      return;
    }
    const result = await dispatch(
      sendMessage({ conversationId: conv.payload._id, receiverId: target.candidateUserId, text: message })
    );
    if (sendMessage.fulfilled.match(result)) {
      setSent(true);
      setTimeout(onClose, 2000);
    } else {
      setError(t("pages.applications.contact_modal.error_msg"));
    }
  };

  if (!target) return null;

  const cfg     = MODES[mode];
  const isValid = message.trim().length > 0 && (mode === "chat" || subject.trim().length > 0);
  const isBusy  = sending || chatSending;
  const [firstName, ...rest] = target.name.split(" ");

  return (
    <Dialog
      open={open}
      onClose={!isBusy ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "18px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } } }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        display: "flex", alignItems: "center", gap: 2,
        borderBottom: "1px solid #F3F4F6",
      }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar
            src={target.avatarUrl}
            sx={{ width: 42, height: 42, bgcolor: target.bgColor, fontSize: 14, fontWeight: 700 }}
          >
            {initials(firstName, rest.join(" "))}
          </Avatar>
          <Box sx={{
            position: "absolute", bottom: -2, right: -2,
            width: 14, height: 14, borderRadius: "50%",
            bgcolor: cfg.color, border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <cfg.Icon sx={{ fontSize: 7, color: "#fff" }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{target.name}</Typography>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {target.email}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          disabled={isBusy}
          sx={{ color: "#9CA3AF", borderRadius: "8px", "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}
        >
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 3 }}>

        {/* ── Mode selector ── */}
        <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
          {(Object.entries(MODES) as [ContactMode, typeof MODES.email][]).map(([m, c]) => {
            const active = mode === m;
            const ModeIcon = c.Icon;
            return (
              <Box
                key={m}
                onClick={() => { if (!isBusy) { setMode(m); setMessage(""); setError(""); } }}
                sx={{
                  flex: 1, display: "flex", alignItems: "center", gap: 1.25,
                  px: 1.75, py: 1.25, borderRadius: "12px",
                  cursor: isBusy ? "default" : "pointer",
                  border: `1.5px solid ${active ? c.activeBorder : "#E5E7EB"}`,
                  bgcolor: active ? c.lightBg : "#FAFAFA",
                  transition: "all 0.15s",
                  "&:hover": isBusy ? {} : { borderColor: active ? c.activeBorder : "#D1D5DB" },
                }}
              >
                <Box sx={{
                  width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                  bgcolor: active ? c.color : "#F3F4F6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}>
                  <ModeIcon sx={{ fontSize: 15, color: active ? "#fff" : "#9CA3AF" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: active ? c.color : "#374151", lineHeight: 1.2 }}>
                    {t(c.labelKey)}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>
                    {t(c.sublabelKey)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Success state ── */}
        {sent ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: "50%",
              bgcolor: `${TEAL}12`, mx: "auto", mb: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircleOutlineOutlined sx={{ fontSize: 30, color: TEAL }} />
            </Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
              {mode === "email" ? t("pages.applications.contact_modal.success_email_title") : t("pages.applications.contact_modal.success_chat_title")}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
              {mode === "email"
                ? t("pages.applications.contact_modal.success_email_body", { name: target.name })
                : t("pages.applications.contact_modal.success_chat_body", { name: target.name })}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>

            {/* Subject (email only) */}
            {mode === "email" && (
              <TextField
                placeholder={t("pages.applications.contact_modal.subject_placeholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                size="small"
                disabled={isBusy}
                sx={inputSx}
              />
            )}

            {/* Chat info banner */}
            {mode === "chat" && (
              <Box sx={{
                display: "flex", gap: 1, px: 1.5, py: 1,
                bgcolor: `${TEAL}08`, borderRadius: "10px",
                border: `1px solid ${TEAL}20`, alignItems: "flex-start",
              }}>
                <ChatBubbleOutlineOutlined sx={{ fontSize: 13, color: TEAL, mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "11.5px", color: "#0F766E", lineHeight: 1.5 }}>
                  {t("pages.applications.contact_modal.chat_banner", { name: target.name })}
                </Typography>
              </Box>
            )}

            {/* Message */}
            <TextField
              placeholder={mode === "email" ? t("pages.applications.contact_modal.msg_placeholder_email", { firstName }) : t("pages.applications.contact_modal.msg_placeholder_chat")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              multiline
              minRows={5}
              disabled={isBusy}
              sx={inputSx}
            />

            {/* Error */}
            {error && (
              <Box sx={{
                px: 1.5, py: 1, bgcolor: "#FEF2F2",
                borderRadius: "8px", border: "1px solid #FECACA",
              }}>
                <Typography sx={{ fontSize: "12px", color: "#DC2626" }}>{error}</Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: "#F3F4F6", my: 0.25 }} />

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isBusy}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "13px",
                  borderColor: "#E5E7EB", color: "#6B7280",
                  "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
                }}
              >
                {t("pages.applications.contact_modal.cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={mode === "email" ? handleSendEmail : handleSendChat}
                disabled={!isValid || isBusy}
                startIcon={
                  isBusy
                    ? <CircularProgress size={13} sx={{ color: "rgba(255,255,255,0.7)" }} />
                    : <SendOutlined sx={{ fontSize: 14 }} />
                }
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 600,
                  fontSize: "13px", minWidth: 130,
                  color: "#fff",
                  bgcolor: cfg.color, boxShadow: "none",
                  "&:hover": { filter: "brightness(0.92)", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                }}
              >
                {isBusy ? t("pages.applications.contact_modal.sending") : mode === "email" ? t("pages.applications.contact_modal.send_email") : t("pages.applications.contact_modal.send_message")}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Input style ────────────────────────────────────────────────────────────────

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "13px",
    bgcolor: "#F9FAFB",
    color: "#111827",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    "&:hover": {
      bgcolor: "#F3F4F6",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
    },
    "&.Mui-focused": {
      bgcolor: "#fff",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF", borderWidth: "1.5px" },
    },
    "&.Mui-disabled": {
      bgcolor: "#F3F4F6",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#9CA3AF",
    opacity: 1,
    fontSize: "13px",
  },
  "& .MuiInputBase-inputMultiline": {
    lineHeight: 1.65,
  },
};

export default ContactCandidateModal;
