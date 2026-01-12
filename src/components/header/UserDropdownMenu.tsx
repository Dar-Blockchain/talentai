import React, { useMemo } from "react";
import { Menu, MenuItem, Divider, ListItemIcon, MenuProps } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessIcon from "@mui/icons-material/Business";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUserType } from "@/store/slices/userSlice";

interface UserDropdownMenuProps extends Omit<MenuProps, "children"> {
  onCompany?: () => void;
  onLogout?: () => void;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onCompany,
  onLogout,
  ...menuProps
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const companyMembership =  useSelector((state: RootState) => state.auth.companyMembership);
  const currentSpace = useSelector((state: RootState) => state.user.currentSpace);  

  const onProfileClick = () => {
    router.push("/profile/" + user?._id);
  }

  const hasMembership = !!companyMembership?._id;

  const isCompany = useMemo(
    () => user?.role?.toLowerCase() === "company",
    [user?.role]
  );

  const handleLogout = () => {
    dispatch(setUserType(isCompany ? "company" : "candidate"));
    onLogout?.();
    menuProps.onClose?.({}, "backdropClick");
  }

  const handleSwitchSpace = () => {
    if (currentSpace === 'personal') {
      router.push('/dashboard/member');
    } else {
      router.push('/dashboard/'+ user?.role?.toLowerCase());
    }
    menuProps.onClose?.({}, "backdropClick");
  }

  return (
    <Menu {...menuProps} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }} PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 180 } }}>
      <MenuItem
        onClick={() => {
          onProfileClick?.();
          menuProps.onClose?.({}, "backdropClick");
        }}
      >
        <ListItemIcon>
          <PersonOutlineIcon fontSize="small" />
        </ListItemIcon>
        View Profile
      </MenuItem>

      {hasMembership && <MenuItem
        onClick={handleSwitchSpace}
      >
        <ListItemIcon>
          <BusinessIcon fontSize="small" />
        </ListItemIcon>
        Switch Space
      </MenuItem>}

      <Divider />

      <MenuItem
        onClick={handleLogout}
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
