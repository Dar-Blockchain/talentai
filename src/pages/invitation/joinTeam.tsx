"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import { AppDispatch } from "@/store/store";
import {
  fetchInvitationDetails,
  respondToInvitation,
  selectMembers,
} from "@/store/slices/memberSlice";
import { setConnectedUser } from "@/store/slices/userSlice";
import Shell from "@/components/features/invitation/Shell";
import InfoRow from "@/components/features/invitation/InfoRow";
import AppButton from "@/components/ui/AppButton";
import { PURPLE, TEAL } from "@/components/features/invitation/constants";
import { ROLES } from "@/constants/employee";
import Cookies from "js-cookie";

// Map legacy backend role strings → ROLES array lookup key
const ROLE_VALUE_MAP: Record<string, string> = {
  RH: "hr",
  Manager: "manager",
  TechLead: "technical_leader",
  Supervisor: "supervisor",
  Owner: "owner",
};

function resolveRole(roleStr: string) {
  const key = ROLE_VALUE_MAP[roleStr] ?? roleStr.toLowerCase();
  const entry = ROLES.find((r) => r.value === key);
  return {
    label: entry?.label ?? roleStr,
    color: entry?.color ?? "#6B7280",
    Icon: entry?.icon ?? null,
  };
}

// ── Styled input ────────────────────────────────────────────────────────────
interface StyledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  error?: string;
}
const StyledInput: React.FC<StyledInputProps> = ({ label, value, onChange, icon: Icon, error }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{
        position: "relative",
        bgcolor: "#F8FAFC",
        border: `1.5px solid ${error ? "#EF4444" : focused ? PURPLE : "#E2E8F0"}`,
        borderRadius: "14px",
        transition: "border-color 0.18s, box-shadow 0.18s",
        boxShadow: focused ? `0 0 0 3px ${error ? "#EF444420" : `${PURPLE}18`}` : "none",
        overflow: "visible",
      }}>
        {/* Icon */}
        <Box sx={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: error ? "#EF4444" : focused ? PURPLE : "#94A3B8",
          display: "flex", alignItems: "center", transition: "color 0.18s",
          "& svg": { fontSize: 17 },
        }}>
          <Icon />
        </Box>

        {/* Floating label */}
        <Typography sx={{
          position: "absolute",
          left: 40, top: active ? 8 : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? "10px" : "13px",
          fontWeight: active ? 700 : 500,
          color: error ? "#EF4444" : active ? (focused ? PURPLE : "#64748B") : "#94A3B8",
          lineHeight: 1,
          transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
          pointerEvents: "none",
          letterSpacing: active ? "0.04em" : 0,
          textTransform: active ? "uppercase" : "none",
        }}>
          {label}
        </Typography>

        {/* Input */}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0F172A",
            paddingLeft: 40,
            paddingRight: 16,
            paddingTop: 26,
            paddingBottom: 10,
            borderRadius: 14,
            display: "block",
            boxSizing: "border-box",
          }}
        />
      </Box>
      {error && (
        <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5, ml: 1, fontWeight: 500 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

// ── Main page ───────────────────────────────────────────────────────────────
const JoinTeamPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { invitationId, token } = router.query;

  const {
    currentInvitation,
    fetchingInvitationDetails,
    respondingToInvitation,
    error,
  } = useSelector(selectMembers);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [success, setSuccess] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !invitationId) return;
    dispatch(fetchInvitationDetails(invitationId as string));
  }, [router.isReady, invitationId, dispatch]);

  const handleAccept = async () => {
    const errs: typeof fieldErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});

    setAcceptError(null);
    try {
      const result = await dispatch(
        respondToInvitation({
          invitationId: invitationId as string,
          action: "accept",
          token: token as string,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      ).unwrap();

      if (result.token) {
        Cookies.remove("api_token");
        localStorage.removeItem("api_token");
        localStorage.setItem("api_token", result.token);
        Cookies.set("api_token", result.token, { expires: 30, path: "/", sameSite: "lax" });
      }
      if (result.user) dispatch(setConnectedUser(result));
      localStorage.setItem("userType", "Employee");

      setSuccess(true);
      setTimeout(() => router.push("/employee/dashboard"), 1500);
    } catch (err: any) {
      setAcceptError(typeof err === "string" ? err : "Failed to accept invitation. Please try again.");
    }
  };

  // ── Loading ── (also covers the window before router.isReady triggers the fetch)
  if (!router.isReady || fetchingInvitationDetails) {
    return (
      <Shell>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
          <CircularProgress sx={{ color: PURPLE }} size={36} />
          <Typography sx={{ color: "#64748B", fontSize: "0.875rem" }}>Loading invitation…</Typography>
        </Box>
      </Shell>
    );
  }

  // ── Error / not found ──
  if (error || !currentInvitation) {
    return (
      <Shell>
        <Box sx={{ bgcolor: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", p: 5, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <ErrorOutlineOutlined sx={{ fontSize: 28, color: "#DC2626" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1E293B", mb: 1 }}>Invalid Invitation</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.65 }}>
            {error || "This invitation is no longer valid or has expired."}
          </Typography>
        </Box>
      </Shell>
    );
  }

  // ── Email already taken ──
  if ((currentInvitation as any).emailExists) {
    return (
      <Shell>
        <Box sx={{ bgcolor: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", p: 5, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <ErrorOutlineOutlined sx={{ fontSize: 28, color: "#DC2626" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1E293B", mb: 1 }}>Email Already Registered</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.65 }}>
            The email{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1E293B" }}>{currentInvitation.email}</Box>
            {" "}is already associated with an account. You cannot use this email to accept the invitation.
          </Typography>
        </Box>
      </Shell>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <Shell>
        <Box sx={{ bgcolor: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", p: 5, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "16px", bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
            <CheckCircleOutlined sx={{ fontSize: 28, color: "#16A34A" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1E293B", mb: 1 }}>Welcome aboard!</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.875rem" }}>
            Your account has been created. Redirecting to your dashboard…
          </Typography>
        </Box>
      </Shell>
    );
  }

  const roleStr     = (currentInvitation as any).role as string;
  const role        = resolveRole(roleStr);
  const invitedBy   = (currentInvitation as any).invitedBy?.name || (currentInvitation as any).invitedBy?.username || (currentInvitation as any).invitedBy?.email;
  const companyLetter = (invitedBy?.[0] ?? "C").toUpperCase();

  return (
    <Shell>
      <Box sx={{ bgcolor: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Gradient header */}
        <Box sx={{
          height: 96,
          background: `linear-gradient(145deg, ${role.color}12, #FFFFFF)`,
          borderBottom: "1px solid #F1F5F9",
          position: "relative",
        }}>
          <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 15% 50%, ${role.color}10, transparent 65%)` }} />
        </Box>

        {/* Company avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: "-32px", mb: 2, position: "relative", zIndex: 1 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: "16px",
            background: `linear-gradient(135deg, ${PURPLE} 0%, #A855F7 100%)`,
            border: "3px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 20px ${PURPLE}30`,
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#fff", lineHeight: 1 }}>
              {companyLetter}
            </Typography>
          </Box>
        </Box>

        {/* Heading */}
        <Box sx={{ textAlign: "center", px: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1E293B", letterSpacing: "-0.02em", mb: 0.75 }}>
            You&apos;re Invited!
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.825rem", lineHeight: 1.65, mb: 1.5 }}>
            <Box component="span" sx={{ fontWeight: 700, color: PURPLE }}>{invitedBy}</Box>
            {" "}has invited you to join their team.
          </Typography>

          {/* Role pill — same as EmployeeCard */}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6,
            px: 1.5, py: "5px", borderRadius: "999px",
            bgcolor: `${role.color}10`, border: `1.5px solid ${role.color}25`,
          }}>
            {role.Icon && (
              <Box sx={{ color: role.color, display: "flex", alignItems: "center", "& svg": { fontSize: 13 } }}>
                <role.Icon />
              </Box>
            )}
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: role.color, letterSpacing: "0.01em" }}>
              {role.label}
            </Typography>
          </Box>
        </Box>

        {/* Info rows */}
        <Box sx={{ mx: 3, mb: 3, borderRadius: "12px", border: "1px solid #F1F5F9", overflow: "hidden" }}>
          <InfoRow icon={<BusinessOutlined />} label="Organization" value={invitedBy} iconColor={TEAL} />
          <InfoRow icon={<BadgeOutlined />} label="Role" iconColor={role.color} value={role.label} />
          {currentInvitation.email && (
            <InfoRow icon={<EmailOutlined />} label="Email" value={currentInvitation.email} iconColor="#0891B2" />
          )}
          {(currentInvitation as any).expiresAt && (
            <InfoRow
              icon={<AccessTimeOutlined />} label="Expires"
              value={new Date((currentInvitation as any).expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              iconColor="#2563EB" last
            />
          )}
        </Box>

        {/* Registration form */}
        <Box sx={{ mx: 3, mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: "7px", bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonOutlined sx={{ fontSize: 14, color: PURPLE }} />
            </Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Details
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <StyledInput
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              icon={PersonOutlined}
              error={fieldErrors.firstName}
            />
            <StyledInput
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              icon={PersonOutlined}
              error={fieldErrors.lastName}
            />
          </Box>
        </Box>

        {acceptError && (
          <Alert severity="error" sx={{ mx: 3, mb: 2, borderRadius: "10px" }}>
            {acceptError}
          </Alert>
        )}

        {/* Accept button */}
        <Box sx={{ px: 3, pb: 3.5 }}>
          <AppButton
            variant="primary"
            label="Accept & Create Account"
            size="large"
            fullWidth
            loading={respondingToInvitation}
            startIcon={<CheckCircleOutlined sx={{ fontSize: 17 }} />}
            onClick={handleAccept}
            sx={{ borderRadius: "12px", boxShadow: `0 4px 14px ${PURPLE}35`, "&:hover": { boxShadow: `0 6px 20px ${PURPLE}45` } }}
          />
        </Box>
      </Box>
    </Shell>
  );
};

export default JoinTeamPage;
