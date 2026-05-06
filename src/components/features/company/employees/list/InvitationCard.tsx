import React, { useState, useCallback } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { Invitation } from "@/types/employee";
import { ROLES } from "@/constants/employee";
import { ROLE_STYLES } from "./EmployeeCard";
import { getRoleLabel } from "@/utils/employeeRoleI18n";
import { useTranslation } from "react-i18next";
import { AMBER } from "./constants";

interface Props {
  invitation: Invitation;
  onResend: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const InvitationCard: React.FC<Props> = ({ invitation, onResend, onCancel }) => {
  const { t, i18n } = useTranslation("dashboard");
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<"resend" | "cancel" | null>(null);

  const roleEntry = ROLES.find((r) => r.value === invitation.role || r.value === invitation.role?.toLowerCase());
  const roleStyle = roleEntry
    ? { color: roleEntry.color, bg: `${roleEntry.color}12` }
    : (ROLE_STYLES[invitation.role] ?? { color: AMBER, bg: "#FFFBEB" });
  const roleLabel = getRoleLabel(invitation.role, t);
  const RoleIcon  = roleEntry?.icon ?? null;
  const letter    = invitation.email[0]?.toUpperCase() || "?";

  const sentDate = (invitation as any).createdAt
    ? new Date((invitation as any).createdAt).toLocaleDateString(i18n.language?.startsWith("fr") ? "fr-FR" : "en-US", { month: "short", day: "numeric" })
    : null;

  const handleResend = useCallback(async () => {
    setBusy(true); setBusyAction("resend");
    try { await onResend(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onResend]);

  const handleCancel = useCallback(async () => {
    setBusy(true); setBusyAction("cancel");
    try { await onCancel(invitation._id); } finally { setBusy(false); setBusyAction(null); }
  }, [invitation._id, onCancel]);

  return (
    <Box sx={{
      height: "100%",
      bgcolor: "#fff",
      border: "1px solid #EBEBEB",
      borderRadius: "18px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "all 0.22s ease",
      "&:hover": {
        borderColor: "#D8D8DC",
        boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
        transform: "translateY(-3px)",
      },
    }}>

      {/* ── Header zone ─────────────────────────────────────── */}
      <Box sx={{
        bgcolor: "#F7F7F8",
        borderBottom: "1px solid #EBEBEB",
        borderRadius: "18px 18px 0 0",
        px: 2.5, pt: 3.5, pb: 3,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
        position: "relative",
      }}>

        {/* Pending badge */}
        <Box sx={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 0.5,
          px: 1, py: 0.35, borderRadius: "999px",
          bgcolor: "#FEF9EC", border: "1px solid #F5E5A8",
        }}>
          <Box sx={{
            width: 5, height: 5, borderRadius: "50%", bgcolor: "#C9920A",
            animation: "invPulse 1.8s ease-in-out infinite",
            "@keyframes invPulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
          }} />
          <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#A87000", letterSpacing: "0.03em" }}>
            {t("pages.employees.invitation.pending")}
          </Typography>
        </Box>

        {/* Avatar */}
        <Box sx={{ position: "relative" }}>
          <Avatar sx={{
            width: 64, height: 64, fontWeight: 800, fontSize: "1.35rem", color: "#fff",
            background: "linear-gradient(145deg, #F5D78A, #C9920A)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          }}>
            {letter}
          </Avatar>
          <Box sx={{
            position: "absolute", bottom: 2, right: 2,
            width: 12, height: 12, borderRadius: "50%",
            bgcolor: "#FEF9EC", border: "2.5px solid #F7F7F8",
          }} />
        </Box>

        {/* Email */}
        <Box sx={{ textAlign: "center", width: "100%", px: 0.5 }}>
          <Typography sx={{
            fontSize: "14px", fontWeight: 700, color: "#1A1A2E",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1.35,
          }}>
            {invitation.email}
          </Typography>
          {sentDate && (
            <Typography sx={{ fontSize: "12px", color: "#B0B7C3", mt: 0.4, letterSpacing: "0.01em" }}>
              {t("pages.employees.invitation.sent", { date: sentDate })}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Body ────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>

        {/* Role */}
        <Box sx={{ bgcolor: "#F7F7F8", borderRadius: "12px", border: "1px solid #EBEBEB", px: 1.5, py: 1.25, display: "flex", flexDirection: "column", gap: 0.4 }}>
          <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#B0B7C3", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("pages.employees.invitation.invited_as")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {RoleIcon && (
              <Box sx={{ display: "flex", alignItems: "center", color: roleStyle.color, flexShrink: 0, "& svg": { fontSize: 12 } }}>
                <RoleIcon />
              </Box>
            )}
            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#374151" }}>{roleLabel}</Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 1.75, borderTop: "1px solid #F3F4F6" }}>
          <Box
            onClick={!busy ? handleResend : undefined}
            sx={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
              py: 0.875, borderRadius: "10px",
              bgcolor: "#F3F4F6", border: "1px solid #E5E7EB",
              cursor: busy ? "default" : "pointer",
              transition: "all 0.15s",
              opacity: busy && busyAction !== "resend" ? 0.45 : 1,
              "&:hover": !busy ? { bgcolor: "#EAECF0", borderColor: "#D1D5DB" } : {},
            }}
          >
            {busy && busyAction === "resend"
              ? <CircularProgress size={12} sx={{ color: "#6B7280" }} />
              : <SendOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
            }
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{t("pages.employees.invitation.resend")}</Typography>
          </Box>

          <Box
            onClick={!busy ? handleCancel : undefined}
            sx={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
              py: 0.875, borderRadius: "10px",
              bgcolor: "#FDF2F2", border: "1px solid #FBDADA",
              cursor: busy ? "default" : "pointer",
              transition: "all 0.15s",
              opacity: busy && busyAction !== "cancel" ? 0.45 : 1,
              "&:hover": !busy ? { bgcolor: "#FAE8E8", borderColor: "#F5C6C6" } : {},
            }}
          >
            {busy && busyAction === "cancel"
              ? <CircularProgress size={12} sx={{ color: "#B45454" }} />
              : <DeleteOutlined sx={{ fontSize: 13, color: "#B45454" }} />
            }
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#B45454" }}>{t("pages.employees.invitation.cancel")}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

InvitationCard.displayName = "InvitationCard";
export default InvitationCard;
