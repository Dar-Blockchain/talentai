import React, { useMemo } from "react";
import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  MenuProps,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUserType } from "@/store/slices/userSlice";
import UserOutlineIcon from "../icons/UserOutlineIcon";

interface UserDropdownMenuProps extends Omit<MenuProps, "children"> {
  onCompany?: () => void;
  onLogout?: () => void;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onCompany,
  onLogout,
  ...menuProps
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, companyMembership } = useSelector((state: RootState) => state.user.connectedUser);

  const currentSpace = useSelector(
    (state: RootState) => state.user.currentSpace
  );

  const onProfileClick = () => {
    router.push("/profile/candidate/" + user?._id);
  };

  const hasMembership = !!companyMembership?._id;

  const isCompany = useMemo(
    () => user?.role?.toLowerCase() === "company",
    [user?.role]
  );

  const handleLogout = () => {
    dispatch(setUserType(isCompany ? "company" : "candidate"));
    onLogout?.();
    menuProps.onClose?.({}, "backdropClick");
  };

  const handleSwitchSpace = () => {
    if (currentSpace === "personal") {
      router.push("/dashboard/member");
    } else {
      router.push("/dashboard/" + user?.role?.toLowerCase());
    }
    menuProps.onClose?.({}, "backdropClick");
  };

  const handleSettingsClick = () => {
    if (isCompany) {
      router.push("/profile/company/settings");
    } else {
      router.push("/profile/candidate/settings");
    }
    menuProps.onClose?.({}, "backdropClick");
  };

  return (
    <Menu
      {...menuProps}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: "9px",
          minWidth: 180,
          boxShadow: "0px 0px 18.1px 0px rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      {!isCompany && <MenuItem
        onClick={() => {
          onProfileClick?.();
          menuProps.onClose?.({}, "backdropClick");
        }}
        sx={{
          color: "rgba(98, 111, 134, 1)",
          fontWeight: 500,
          fontSize: "12px",
        }}
      >
        <ListItemIcon>
          <UserOutlineIcon />
        </ListItemIcon>
        View Profile
      </MenuItem>}

      <MenuItem
        onClick={handleSettingsClick}
        sx={{
          color: "rgba(98, 111, 134, 1)",
          fontWeight: 500,
          fontSize: "12px",
        }}
      >
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>

      {hasMembership && (
        <MenuItem
          onClick={handleSwitchSpace}
          sx={{
            color: "rgba(98, 111, 134, 1)",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          Switch Space
        </MenuItem>
      )}

      <Divider sx={{ color: "rgba(98, 111, 134, 0.5)" }} />

      <MenuItem
        onClick={handleLogout}
        sx={{
          color: "rgba(200, 65, 75, 1)",
          fontWeight: 500,
          fontSize: "12px",
        }}
      >
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserDropdownMenu;
