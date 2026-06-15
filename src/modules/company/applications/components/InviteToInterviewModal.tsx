"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Typography,
} from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import AppButton from "@/components/ui/AppButton";
import { applicationsApi } from "@/modules/company/applications/api";
import { emitToast } from "@/utils/toastEmitter";

// ─── Static constants ─────────────────────────────────────────────────────────

const PURPLE = "#7C3AED";

const PAPER_SX       = { borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } as const;
const TITLE_SX       = { px: 2.5, pt: 2.5, pb: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between" } as const;
const ICON_BOX_SX    = { width: 40, height: 40, borderRadius: "11px", bgcolor: `${PURPLE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const HEADER_ROW_SX  = { display: "flex", alignItems: "center", gap: 1.5 } as const;
const CLOSE_BTN_SX   = { color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" }, mt: 0.25 } as const;
const CONTENT_SX     = { px: 2.5, pt: 2, pb: 1 } as const;
const SUCCESS_BOX_SX = { py: 3, textAlign: "center" } as const;
const CHECK_BOX_SX   = { width: 52, height: 52, borderRadius: "50%", bgcolor: "#ECFDF5", border: "2px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 } as const;
const SUCCESS_TITLE_SX = { fontSize: "15px", fontWeight: 700, color: "#059669" } as const;
const SUCCESS_BODY_SX  = { fontSize: "12px", color: "#9CA3AF", mt: 0.75 } as const;
const FORM_BOX_SX    = { display: "flex", flexDirection: "column", gap: 1.75, pt: 0.5 } as const;
const BODY_TEXT_SX   = { fontSize: "13px", color: "#4B5563", lineHeight: 1.7 } as const;
const LINK_BOX_SX    = { display: "flex", alignItems: "center", gap: 1, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 1.25 } as const;
const LINK_TEXT_SX   = { fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;
const ACTIONS_SX     = { px: 2.5, pb: 2.5, pt: 1.5, gap: 1 } as const;
const CANCEL_SX      = { color: "#6B7280", borderRadius: "10px" } as const;
const SEND_SX        = { bgcolor: PURPLE, boxShadow: "none", color: "#fff", borderRadius: "10px", px: 2.5, "&:hover": { bgcolor: "#6D28D9", boxShadow: "none" } } as const;

// ─── Types ────────────────────────────────────────────────────────────────────

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
  onSuccess?: (appId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const InviteToInterviewModal = memo<Props>(({ open, target, onClose, onSuccess }) => {
  const { t } = useTranslation("dashboard");
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (!open) { setSending(false); setDone(false); }
  }, [open]);

  const interviewLink = target?.postId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/candidate/interview?jobId=${target.postId}`
    : "";

  const handleSend = useCallback(async () => {
    if (!target) return;
    setSending(true);
    try {
      await applicationsApi.inviteToInterview(target.applicationId, interviewLink);
      setDone(true);
      onSuccess?.(target.applicationId);
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      emitToast({ message: err instanceof Error ? err.message : "Failed to send invitation.", severity: "error" });
    } finally {
      setSending(false);
    }
  }, [target, interviewLink, onClose, onSuccess]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: PAPER_SX } }}
    >
      <DialogTitle sx={TITLE_SX}>
        <Box sx={HEADER_ROW_SX}>
          <Box sx={ICON_BOX_SX}>
            <MailOutlined sx={{ fontSize: 20, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.25 }}>
              {t("pages.applications.invite_modal.title")}
            </Typography>
            {target && (
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.25 }}>
                {t("pages.applications.invite_modal.to_label")} <strong style={{ color: "#374151" }}>{target.name}</strong>
                {target.postTitle ? <> · <span style={{ color: "#9CA3AF" }}>{target.postTitle}</span></> : null}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={CLOSE_BTN_SX}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={CONTENT_SX}>
        {done ? (
          <Box sx={SUCCESS_BOX_SX}>
            <Box sx={CHECK_BOX_SX}>
              <CheckOutlined sx={{ fontSize: 26, color: "#059669" }} />
            </Box>
            <Typography sx={SUCCESS_TITLE_SX}>{t("pages.applications.invite_modal.success_title")}</Typography>
            <Typography sx={SUCCESS_BODY_SX}>
              {t("pages.applications.invite_modal.success_body", { name: target?.name })}
            </Typography>
          </Box>
        ) : (
          <Box sx={FORM_BOX_SX}>
            <Typography sx={BODY_TEXT_SX}>
              {t("pages.applications.invite_modal.body_pre")}
              <strong style={{ color: "#111827" }}>{target?.name}</strong>
              {t("pages.applications.invite_modal.body_post")}
            </Typography>
            <Box sx={LINK_BOX_SX}>
              <LinkOutlined sx={{ fontSize: 15, color: "#9CA3AF", flexShrink: 0 }} />
              <Typography sx={LINK_TEXT_SX}>{interviewLink}</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {!done && (
        <DialogActions sx={ACTIONS_SX}>
          <AppButton
            label={t("pages.applications.invite_modal.cancel")}
            variant="text"
            onClick={onClose}
            sx={CANCEL_SX}
          />
          <AppButton
            label={t("pages.applications.invite_modal.send")}
            variant="contained"
            loading={sending}
            disabled={!interviewLink}
            onClick={handleSend}
            sx={SEND_SX}
          />
        </DialogActions>
      )}
    </Dialog>
  );
});
InviteToInterviewModal.displayName = "InviteToInterviewModal";

export default InviteToInterviewModal;
