import { Menu, MenuItem, Divider, ListItemIcon, MenuProps } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessIcon from "@mui/icons-material/Business";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface UserDropdownMenuProps extends Omit<MenuProps, "children"> {
  onCompany?: () => void;
  onLogout?: () => void;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  onCompany,
  onLogout,
  ...menuProps
}) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const onProfileClick = () => {
    router.push("/profile/" + user?._id);
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

      <MenuItem
        onClick={() => {
          onCompany?.();
          menuProps.onClose?.({}, "backdropClick");
        }}
      >
        <ListItemIcon>
          <BusinessIcon fontSize="small" />
        </ListItemIcon>
        Switch Space
      </MenuItem>

      <Divider />

      <MenuItem
        onClick={() => {
          onLogout?.();
          menuProps.onClose?.({}, "backdropClick");
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
