"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { createOrUpdateProfile } from "@/store/slices/userSlice";
import { fetchInvitationDetails, selectMembers } from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";
import {
  Box,
  Typography,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";

const ROLE_LABELS: Record<string, string> = {
  RH: "HR",
  TechLead: "Technical Leader",
  Supervisor: "Supervisor",
  Manager: "Manager",
};

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  RH:         { color: "#059669", bg: "#D1FAE5" },
  TechLead:   { color: "#2563EB", bg: "#DBEAFE" },
  Supervisor: { color: "#B45309", bg: "#FEF3C7" },
  Manager:    { color: "#8310FF", bg: "#EDE9FE" },
};

const TEAL = "#0D9488";

function EmployeeSetup() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { user, profile, companyMembership } = useSelector(
    (state: RootState) => state.user.connectedUser
  );
  const { currentInvitation, fetchingInvitationDetails } = useSelector(selectMembers);

  const returnUrl = router.query.returnUrl as string | undefined;

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Extract invitationId from returnUrl and fetch invitation details
  useEffect(() => {
    if (!returnUrl) return;
    try {
      const decoded = decodeURIComponent(returnUrl);
      const url = new URL(decoded, "http://localhost");
      const invitationId = url.searchParams.get("invitationId");
      if (invitationId) {
        dispatch(fetchInvitationDetails(invitationId));
      }
    } catch {}
  }, [returnUrl, dispatch]);

  // Pre-fill username from user
  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  // Already has a profile — skip setup
  useEffect(() => {
    if (profile?._id) {
      router.replace("/workspaces");
    }
  }, [profile, router]);

  if (!user) return null;
  
  const companyName =
    currentInvitation?.company?.username ||
    "your company";

  const invitationRole = currentInvitation?.role;
  const roleStyle = invitationRole ? (ROLE_STYLES[invitationRole] ?? ROLE_STYLES.Manager) : null;
  const roleLabel = invitationRole ? (ROLE_LABELS[invitationRole] ?? invitationRole) : null;

  const handleSubmit = async () => {
    if (!username.trim()) return;
    setSubmitting(true);
    try {
      await dispatch(
        createOrUpdateProfile({
          type: "Candidate",
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
      ).unwrap();
      showToast({ message: "Profile set up successfully!", severity: "success" });
      router.replace("/workspaces");
    } catch (error: any) {
      showToast({
        message: error || "Failed to save profile. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: { xs: 4, sm: 7 },
        pb: 6,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          bgcolor: "#fff",
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Teal gradient header */}
        <Box
          sx={{
            height: 88,
            background: "linear-gradient(145deg, #ECFDF5, #F0FDFA, #fff)",
            borderBottom: "1px solid #F1F5F9",
            position: "relative",
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 50% 100%, #0D948818, transparent 70%)",
            }}
          />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, px: 3.5, pb: 4, mt: "-32px", textAlign: "center" }}>
          {/* Avatar icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              mx: "auto",
              mb: 2.5,
              background: `linear-gradient(135deg, ${TEAL} 0%, #14B8A6 100%)`,
              border: "3px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${TEAL}30`,
            }}
          >
            <PersonOutlined sx={{ fontSize: 28, color: "#fff" }} />
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#1E293B",
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Complete Your Profile
          </Typography>
          <Typography
            sx={{ color: "#64748B", fontSize: "0.825rem", lineHeight: 1.65, mb: 3 }}
          >
            You've joined{" "}
            <Box component="span" sx={{ fontWeight: 700, color: TEAL }}>
              {companyName}
            </Box>
            . Let's finish setting up your employee profile.
          </Typography>

          {/* Invitation info rows */}
          {fetchingInvitationDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <CircularProgress size={24} thickness={3} sx={{ color: TEAL }} />
            </Box>
          ) : (
            <Box
              sx={{
                mb: 3,
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
              }}
            >
              {/* Organization row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  borderBottom: roleLabel ? "1px solid #F1F5F9" : "none",
                  textAlign: "left",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: `${TEAL}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BusinessOutlined sx={{ fontSize: 18, color: TEAL }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
                    Organization
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1E293B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {companyName}
                  </Typography>
                </Box>
              </Box>

              {/* Role row */}
              {roleLabel && roleStyle && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    p: 2,
                    textAlign: "left",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: `${roleStyle.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <BadgeOutlined sx={{ fontSize: 18, color: roleStyle.color }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
                      Role
                    </Typography>
                  </Box>
                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      height: 22,
                      color: roleStyle.color,
                      bgcolor: roleStyle.bg,
                      border: `1px solid ${roleStyle.color}25`,
                      borderRadius: "6px",
                      "& .MuiChip-label": { px: 1.25 },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Form fields */}
          <Stack spacing={2} sx={{ textAlign: "left", mb: 3 }}>
            <AppInput
              label="Username"
              placeholder="Your username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
              startIcon={<PersonOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />}
            />

            <AppInput
              label="First Name"
              placeholder="Your first name"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target.value)
              }
              startIcon={<BadgeOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />}
            />

            <AppInput
              label="Last Name"
              placeholder="Your last name"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target.value)
              }
              startIcon={<BadgeOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />}
            />
          </Stack>

          {/* Submit */}
          <AppButton
            variant="contained"
            label={submitting ? "Saving…" : "Complete Setup"}
            fullWidth
            disabled={!username.trim() || submitting}
            loading={submitting}
            startIcon={
              !submitting ? (
                <CheckCircleOutlined sx={{ fontSize: 17 }} />
              ) : undefined
            }
            onClick={handleSubmit}
            sx={{
              borderRadius: "12px",
              background: `linear-gradient(45deg, ${TEAL} 30%, #14B8A6 90%)`,
              boxShadow: `0 4px 14px ${TEAL}35`,
              "&:hover": { boxShadow: `0 6px 20px ${TEAL}45` },
            }}
          />

          <Typography
            sx={{ mt: 2, fontSize: "0.75rem", color: "#94A3B8" }}
          >
            You can update your profile at any time from your account settings.
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Image src="/logo.svg" alt="TalentAI" width={90} height={19} />
        <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
          Powered by TalentAI · Secure employee onboarding
        </Typography>
      </Box>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(EmployeeSetup), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
      }}
    >
      <p style={{ color: "#94A3B8", fontSize: "14px" }}>Loading…</p>
    </div>
  ),
});
