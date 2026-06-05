import React from "react";
import {
  Box, Typography, Avatar, TextField, Button,
  CircularProgress, Divider, Chip,
} from "@mui/material";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import CameraAltOutlined from "@mui/icons-material/CameraAltOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { ROLE_LABELS, ROLE_STYLES } from "@/components/features/company/employees/list/EmployeeCard";
import { Section, InfoRow, TEAL, useEmployeeSettings } from "@/modules/settings/employee";

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

const EmployeeSettingsPage: React.FC = () => {
  const {
    user, companyMembership, fileRef,
    displayName, avatarUrl, initials,
    username, savingName, nameSaved, nameError, uploadingImg,
    setUsername, setNameError,
    handleSaveName, handleAvatarChange,
  } = useEmployeeSettings();

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

                {companyMembership?.role && (() => {
                  const roleKey   = companyMembership.role as string;
                  const formatRole = (r: string) =>
                    r.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase());
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

export default EmployeeSettingsPage;
