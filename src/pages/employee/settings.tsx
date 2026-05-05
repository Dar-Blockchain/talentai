import React, { useRef, useState } from "react";
import {
  Box, Typography, Avatar, TextField, Button,
  CircularProgress, Divider, Chip,
} from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import { ROLE_LABELS, ROLE_STYLES } from "@/components/features/company/employees/list/EmployeeCard";
import CameraAltOutlined from "@mui/icons-material/CameraAltOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { uploadProfileImage, getMyProfile } from "@/store/slices/userSlice";
import axiosInstance from "@/utils/axiosInstance";
import dynamic from "next/dynamic";

const TEAL = "#0D9488";

const fieldSx = {
  "& .MuiInputLabel-root": { color: "#6B7280", fontFamily: "Poppins", fontSize: "0.9rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: TEAL },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", fontFamily: "Poppins", fontSize: "0.95rem",
    bgcolor: "#F9FAFB",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: TEAL, borderWidth: "1.5px" },
    "&.Mui-focused": { bgcolor: "#fff" },
    "&.Mui-disabled": { bgcolor: "#F3F4F6" },
  },
};

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", mb: 3 }}>
    <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #F3F4F6" }}>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#9CA3AF", mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box sx={{ px: 3, py: 3 }}>{children}</Box>
  </Box>
);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  label: string;
  value: string;
  chip?: React.ReactNode;
}> = ({ icon, iconBg, iconBorder, label, value, chip }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
      bgcolor: iconBg, border: `1px solid ${iconBorder}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: "#9CA3AF", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
        {value}
      </Typography>
    </Box>
    {chip}
  </Box>
);

const EmployeeSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile, companyMembership } = useSelector((state: RootState) => state.user.connectedUser);

  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || user?.username || ""
    : user?.username || "";

  const avatarUrl = (profile?.user_image || user?.user_image)
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile?.user_image || user?.user_image}`
    : null;

  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0] || "E").toUpperCase();

  const [username, setUsername] = useState(user?.username || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved]   = useState(false);
  const [nameError, setNameError]   = useState("");

  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!username.trim()) { setNameError("Name cannot be empty"); return; }
    setNameError("");
    setSavingName(true);
    try {
      await axiosInstance.put(`users/${user?._id}`, { username: username.trim() });
      await dispatch(getMyProfile());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      setNameError("Failed to save. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      await dispatch(uploadProfileImage({ file })).unwrap();
      await dispatch(getMyProfile());
    } catch {}
    finally { setUploadingImg(false); }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "Settings" },
        ]}
        icon={SettingsOutlined}
      />

      <Box sx={{ maxWidth: 720 }}>

        {/* Avatar */}
        <Section title="Profile Picture" subtitle="Update your display photo">
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={avatarUrl || undefined}
                sx={{ width: 80, height: 80, fontSize: "1.6rem", fontWeight: 700, bgcolor: TEAL, color: "#fff", borderRadius: "20px" }}
              >
                {!avatarUrl && initials}
              </Avatar>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: "absolute", inset: 0, borderRadius: "20px",
                  bgcolor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center",
                  justifyContent: "center", opacity: 0, cursor: "pointer",
                  transition: "opacity 0.2s",
                  "&:hover": { opacity: 1 },
                }}
              >
                {uploadingImg
                  ? <CircularProgress size={20} sx={{ color: "#fff" }} />
                  : <CameraAltOutlined sx={{ fontSize: 22, color: "#fff" }} />
                }
              </Box>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </Box>

            <Box>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.9rem", color: "#111827", mb: 0.5 }}>
                {displayName || "Employee"}
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#9CA3AF", mb: 1.5 }}>
                JPG, PNG or GIF · Max 5 MB
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImg}
                sx={{
                  textTransform: "none", fontFamily: "Poppins", fontWeight: 600,
                  fontSize: "0.8rem", borderRadius: "10px",
                  borderColor: "#E5E7EB", color: "#374151",
                  "&:hover": { borderColor: TEAL, color: TEAL, bgcolor: `${TEAL}08` },
                }}
              >
                {uploadingImg ? "Uploading…" : "Change photo"}
              </Button>
            </Box>
          </Box>
        </Section>

        {/* Display name */}
        <Section title="Display Name" subtitle="This is how your name appears across the platform">
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setNameError(""); }}
              fullWidth
              error={!!nameError}
              helperText={nameError}
              InputProps={{ startAdornment: <PersonOutlined sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} /> }}
              sx={fieldSx}
            />
            <Button
              variant="contained"
              onClick={handleSaveName}
              disabled={savingName || username === user?.username}
              startIcon={
                savingName ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                : nameSaved ? <CheckOutlined sx={{ fontSize: 16 }} />
                : undefined
              }
              sx={{
                mt: "4px", height: 56, px: 3, borderRadius: "12px",
                textTransform: "none", fontFamily: "Poppins", fontWeight: 700,
                whiteSpace: "nowrap", flexShrink: 0,
                bgcolor: nameSaved ? "#059669" : TEAL,
                "&:hover": { bgcolor: nameSaved ? "#059669" : "#0caa9d" },
                "&.Mui-disabled": { bgcolor: "#F3F4F6", color: "#9CA3AF" },
              }}
            >
              {savingName ? "Saving…" : nameSaved ? "Saved" : "Save"}
            </Button>
          </Box>
        </Section>

        {/* Account info */}
        <Section title="Account Information" subtitle="Read-only information about your account">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email address"
              value={user?.email || ""}
              disabled
              fullWidth
              InputProps={{ startAdornment: <EmailOutlined sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} /> }}
              sx={fieldSx}
            />

            {companyMembership && (
              <>
                <Divider sx={{ borderColor: "#F3F4F6" }} />

                {/* Company */}
                <InfoRow
                  icon={<BusinessOutlined sx={{ fontSize: 18, color: TEAL }} />}
                  iconBg="#F0FDF9"
                  iconBorder="#CCFBF1"
                  label="Organization"
                  value={
                    companyMembership?.company?.profile?.companyDetails?.name ||
                    companyMembership?.company?.username ||
                    companyMembership?.companyId?.name ||
                    "Company"
                  }
                />

                {/* Role */}
                {companyMembership?.role && (() => {
                  const roleKey = companyMembership.role as string;
                  const formatRole = (r: string) =>
                    r.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2")
                     .replace(/\b\w/g, (c) => c.toUpperCase());
                  const roleLabel = ROLE_LABELS[roleKey] ?? formatRole(roleKey);
                  const roleStyle = ROLE_STYLES[roleKey] ?? { color: "#6B7280", bg: "#F3F4F6" };
                  return (
                    <InfoRow
                      icon={<WorkOutlined sx={{ fontSize: 18, color: roleStyle.color }} />}
                      iconBg={roleStyle.bg}
                      iconBorder={roleStyle.color + "33"}
                      label="Role"
                      value={roleLabel}
                      chip={
                        <Chip
                          label={roleLabel}
                          size="small"
                          sx={{
                            bgcolor: roleStyle.bg, color: roleStyle.color,
                            fontFamily: "Poppins", fontWeight: 600, fontSize: "0.72rem",
                            border: `1px solid ${roleStyle.color}33`,
                          }}
                        />
                      }
                    />
                  );
                })()}

                {/* Department */}
                {companyMembership?.department?.name && (
                  <InfoRow
                    icon={<AccountTreeOutlined sx={{ fontSize: 18, color: "#7C3AED" }} />}
                    iconBg="#F5F3FF"
                    iconBorder="#DDD6FE"
                    label="Department"
                    value={companyMembership.department.name}
                  />
                )}
              </>
            )}
          </Box>
        </Section>

      </Box>
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeSettingsPage), { ssr: false });
