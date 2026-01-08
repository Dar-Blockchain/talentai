import React, { memo } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface TeamMemberMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const TeamMemberMenu: React.FC<TeamMemberMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: 180,
          },
        },
      }}
    >
      <MenuItem onClick={onEditClick}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Role</ListItemText>
      </MenuItem>
      <MenuItem onClick={onDeleteClick} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Remove Member</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default memo(TeamMemberMenu);
