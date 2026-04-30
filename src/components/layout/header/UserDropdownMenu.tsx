import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Box, Typography, Avatar } from "@mui/material";
import type { MenuProps } from "@mui/material";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUserType } from "@/store/slices/userSlice";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PersonOutlined    from "@mui/icons-material/PersonOutlined";
import SettingsOutlined  from "@mui/icons-material/SettingsOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import LogoutOutlined    from "@mui/icons-material/LogoutOutlined";

interface UserDropdownMenuProps extends Omit<MenuProps, "children"> {
  onLogout?:    () => void;
  displayName?: string;
  email?:       string;
  avatarUrl?:   string | null;
  initials?:    string;
  isCompany?:   boolean;
  isEmployee?:  boolean;
  onDashboard?: () => void;
}

const Item: React.FC<{
  icon:    React.ReactNode;
  label:   string;
  sub?:    string;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, sub, danger, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      px: 1.25,
      py: 0.85,
      mx: 0.5,
      borderRadius: "10px",
      cursor: "pointer",
      transition: "background 0.12s",
      "&:hover": { bgcolor: danger ? "#FEF2F2" : "#F3F4F6" },
    }}
  >
    <Box sx={{
      width: 30,
      height: 30,
      borderRadius: "10px",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: danger ? "#FEF2F2" : "#F3F4F6",
      border: "1px solid",
      borderColor: danger ? "#FECACA" : "#E5E7EB",
      "& svg": { fontSize: 15, color: danger ? "#EF4444" : "#6B7280" },
    }}>
      {icon}
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{
        fontSize: "13px",
        fontWeight: 500,
        color: danger ? "#EF4444" : "#374151",
        lineHeight: 1.2,
      }}>
        {label}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3, mt: 0.15 }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onLogout,
  displayName = "User",
  email,
  avatarUrl,
  initials = "U",
  isCompany  = false,
  isEmployee = false,
  onDashboard,
  ...menuProps
}) => {
  const { t }    = useTranslation("common");
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const { user, companyMembership } = useSelector((state: RootState) => state.user.connectedUser);
  const currentSpace  = useSelector((state: RootState) => state.user.currentSpace);
  const hasMembership = !!companyMembership?._id;

  const close = () => menuProps.onClose?.({}, "backdropClick");

  const handleLogout = () => {
    dispatch(setUserType(isCompany ? "company" : "candidate"));
    onLogout?.();
    close();
  };

  return (
    <Menu
      {...menuProps}
      disableScrollLock
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top",    horizontal: "right" }}
      PaperProps={{
        elevation: 0,
        sx: {
          mt: 1,
          borderRadius: "14px",
          minWidth: 220,
          border: "1px solid #E5E7EB",
          boxShadow: "0 8px 24px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)",
          overflow: "hidden",
          p: 0,
        },
      }}
    >
      {/* ── User header ── */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.75,
        pt: 1.75,
        pb: 1.5,
        borderBottom: "1px solid #F3F4F6",
        bgcolor: "#FAFAFA",
      }}>
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            width: 36,
            height: 36,
            fontSize: "13px",
            fontWeight: 700,
            bgcolor: "#0D9488",
            color: "#fff",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        >
          {!avatarUrl && initials}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {displayName}
          </Typography>
          {email && (
            <Typography sx={{
              fontSize: "11.5px",
              color: "#9CA3AF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: 0.1,
            }}>
              {email}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Items ── */}
      <Box sx={{ py: 0.75 }}>
        <Item
          icon={<DashboardOutlined />}
          label={t("header.dashboard")}
          sub={t("header.go_to_workspace")}
          onClick={() => { onDashboard?.(); close(); }}
        />
        {!isCompany && !isEmployee && (
          <Item
            icon={<PersonOutlined />}
            label={t("header.view_profile")}
            sub={t("header.public_profile")}
            onClick={() => { router.push("/profile/candidate/" + user?._id); close(); }}
          />
        )}
        {!isEmployee && (
          <Item
            icon={<SettingsOutlined />}
            label={t("header.settings")}
            sub={t("header.account_prefs")}
            onClick={() => {
              router.push(isCompany ? "/company/settings" : "/profile/candidate/settings");
              close();
            }}
          />
        )}
      </Box>

      {/* ── Logout ── */}
      <Box sx={{ borderTop: "1px solid #F3F4F6", py: 0.75 }}>
        <Item
          icon={<LogoutOutlined />}
          label={t("header.logout")}
          danger
          onClick={handleLogout}
        />
      </Box>
    </Menu>
  );
};

export default UserDropdownMenu;
