import React, { memo, useState, useCallback, useMemo } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { Invitation } from "@/modules/company/employees/types/employee";
import { ROLES } from "@/modules/shared/constants/employee";
import { ROLE_STYLES } from "./EmployeeCard";
import { getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { useTranslation } from "react-i18next";
import { AMBER } from "./constants";

// ─── Module-level sx constants ────────────────────────────────────────────────

const PULSE_SX = {
  animation: "invPulse 1.8s ease-in-out infinite",
  "@keyframes invPulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
} as const;

const CARD_SX = {
  height: "100%", bgcolor: "#fff", border: "1px solid #EBEBEB",
  borderRadius: "18px", overflow: "hidden",
  display: "flex", flexDirection: "column",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.22s ease",
  "&:hover": { borderColor: "#D8D8DC", boxShadow: "0 8px 28px rgba(0,0,0,0.08)", transform: "translateY(-3px)" },
} as const;

const HEADER_SX = {
  bgcolor: "#F7F7F8", borderBottom: "1px solid #EBEBEB", borderRadius: "18px 18px 0 0",
  px: 2.5, pt: 3.5, pb: 3, display: "flex", flexDirection: "column", alignItems: "center",
  gap: 1.5, position: "relative",
} as const;

const PENDING_BADGE_SX = {
  position: "absolute", top: 10, right: 10,
  display: "flex", alignItems: "center", gap: 0.5,
  px: 1, py: 0.35, borderRadius: "999px",
  bgcolor: "#FEF9EC", border: "1px solid #F5E5A8",
} as const;

const PENDING_DOT_SX = { width: 5, height: 5, borderRadius: "50%", bgcolor: "#C9920A", ...PULSE_SX } as const;
const PENDING_LABEL_SX = { fontSize: "10px", fontWeight: 700, color: "#A87000", letterSpacing: "0.03em" } as const;

const AVATAR_WRAP_SX = { position: "relative" } as const;
const AVATAR_SX = {
  width: 64, height: 64, fontWeight: 800, fontSize: "1.35rem", color: "#fff",
  background: "linear-gradient(145deg, #F5D78A, #C9920A)",
  boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
} as const;
const AVATAR_DOT_SX = {
  position: "absolute", bottom: 2, right: 2,
  width: 12, height: 12, borderRadius: "50%",
  bgcolor: "#FEF9EC", border: "2.5px solid #F7F7F8",
} as const;

const EMAIL_BOX_SX    = { textAlign: "center", width: "100%", px: 0.5 } as const;
const EMAIL_TEXT_SX   = { fontSize: "14px", fontWeight: 700, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.35 } as const;
const SENT_DATE_SX    = { fontSize: "12px", color: "#B0B7C3", mt: 0.4, letterSpacing: "0.01em" } as const;

const BODY_SX         = { px: 2.5, pt: 2, pb: 2.5, display: "flex", flexDirection: "column", gap: 2, flex: 1 } as const;
const ROLE_BOX_SX     = { bgcolor: "#F7F7F8", borderRadius: "12px", border: "1px solid #EBEBEB", px: 1.5, py: 1.25, display: "flex", flexDirection: "column", gap: 0.4 } as const;
const ROLE_LABEL_SX   = { fontSize: "10px", fontWeight: 600, color: "#B0B7C3", textTransform: "uppercase" as const, letterSpacing: "0.06em" } as const;
const ROLE_ROW_SX     = { display: "flex", alignItems: "center", gap: 0.5 } as const;
const ROLE_ICON_SX    = { display: "flex", alignItems: "center", flexShrink: 0, "& svg": { fontSize: 12 } } as const;
const ROLE_NAME_SX    = { fontSize: "12.5px", fontWeight: 700, color: "#374151" } as const;

const ACTIONS_SX      = { display: "flex", gap: 1, mt: "auto", pt: 1.75, borderTop: "1px solid #F3F4F6" } as const;

const RESEND_BTN_BASE = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
  py: 0.875, borderRadius: "10px", transition: "all 0.15s",
  bgcolor: "#F3F4F6", border: "1px solid #E5E7EB",
} as const;

const CANCEL_BTN_BASE = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
  py: 0.875, borderRadius: "10px", transition: "all 0.15s",
  bgcolor: "#FDF2F2", border: "1px solid #FBDADA",
} as const;

const RESEND_LABEL_SX = { fontSize: "12px", fontWeight: 600, color: "#374151" } as const;
const CANCEL_LABEL_SX = { fontSize: "12px", fontWeight: 600, color: "#B45454" } as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const InvitationCard: React.FC<Props> = memo(({ invitation, onResend, onCancel }) => {
  const { t, i18n } = useTranslation("dashboard");
  const [busy,       setBusy]       = useState(false);
  const [busyAction, setBusyAction] = useState<"resend" | "cancel" | null>(null);

  const roleEntry = useMemo(() =>
    ROLES.find((r) => r.value === invitation.role || r.value === invitation.role?.toLowerCase()),
  [invitation.role]);

  const roleStyle = useMemo(() =>
    roleEntry
      ? { color: roleEntry.color, bg: `${roleEntry.color}12` }
      : (ROLE_STYLES[invitation.role] ?? { color: AMBER, bg: "#FFFBEB" }),
  [roleEntry, invitation.role]);

  const roleLabel = useMemo(() => getRoleLabel(invitation.role, t), [invitation.role, t]);
  const RoleIcon  = roleEntry?.icon ?? null;
  const letter    = invitation.email[0]?.toUpperCase() || "?";

  const sentDate = useMemo(() =>
    invitation.createdAt
      ? new Date(invitation.createdAt).toLocaleDateString(
          i18n.language?.startsWith("fr") ? "fr-FR" : "en-US",
          { month: "short", day: "numeric" }
        )
      : null,
  [invitation.createdAt, i18n.language]);

  const handleResend = useCallback(async () => {
    setBusy(true); setBusyAction("resend");
    try { await onResend(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onResend]);

  const handleCancel = useCallback(async () => {
    setBusy(true); setBusyAction("cancel");
    try { await onCancel(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onCancel]);

  const resendBtnSx = useMemo(() => ({
    ...RESEND_BTN_BASE,
    cursor: busy ? "default" : "pointer",
    opacity: busy && busyAction !== "resend" ? 0.45 : 1,
    "&:hover": !busy ? { bgcolor: "#EAECF0", borderColor: "#D1D5DB" } : {},
  }), [busy, busyAction]);

  const cancelBtnSx = useMemo(() => ({
    ...CANCEL_BTN_BASE,
    cursor: busy ? "default" : "pointer",
    opacity: busy && busyAction !== "cancel" ? 0.45 : 1,
    "&:hover": !busy ? { bgcolor: "#FAE8E8", borderColor: "#F5C6C6" } : {},
  }), [busy, busyAction]);

  const roleIconSx = useMemo(() => ({
    ...ROLE_ICON_SX,
    color: roleStyle.color,
  }), [roleStyle.color]);

  return (
    <Box sx={CARD_SX}>
      <Box sx={HEADER_SX}>
        <Box sx={PENDING_BADGE_SX}>
          <Box sx={PENDING_DOT_SX} />
          <Typography sx={PENDING_LABEL_SX}>{t("pages.employees.invitation.pending")}</Typography>
        </Box>

        <Box sx={AVATAR_WRAP_SX}>
          <Avatar sx={AVATAR_SX}>{letter}</Avatar>
          <Box sx={AVATAR_DOT_SX} />
        </Box>

        <Box sx={EMAIL_BOX_SX}>
          <Typography sx={EMAIL_TEXT_SX}>{invitation.email}</Typography>
          {sentDate && (
            <Typography sx={SENT_DATE_SX}>{t("pages.employees.invitation.sent", { date: sentDate })}</Typography>
          )}
        </Box>
      </Box>

      <Box sx={BODY_SX}>
        <Box sx={ROLE_BOX_SX}>
          <Typography sx={ROLE_LABEL_SX}>{t("pages.employees.invitation.invited_as")}</Typography>
          <Box sx={ROLE_ROW_SX}>
            {RoleIcon && (
              <Box sx={roleIconSx}><RoleIcon /></Box>
            )}
            <Typography sx={ROLE_NAME_SX}>{roleLabel}</Typography>
          </Box>
        </Box>

        <Box sx={ACTIONS_SX}>
          <Box onClick={!busy ? handleResend : undefined} sx={resendBtnSx}>
            {busy && busyAction === "resend"
              ? <CircularProgress size={12} sx={{ color: "#6B7280" }} />
              : <SendOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
            }
            <Typography sx={RESEND_LABEL_SX}>{t("pages.employees.invitation.resend")}</Typography>
          </Box>

          <Box onClick={!busy ? handleCancel : undefined} sx={cancelBtnSx}>
            {busy && busyAction === "cancel"
              ? <CircularProgress size={12} sx={{ color: "#B45454" }} />
              : <DeleteOutlined sx={{ fontSize: 13, color: "#B45454" }} />
            }
            <Typography sx={CANCEL_LABEL_SX}>{t("pages.employees.invitation.cancel")}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

InvitationCard.displayName = "InvitationCard";
export default InvitationCard;
