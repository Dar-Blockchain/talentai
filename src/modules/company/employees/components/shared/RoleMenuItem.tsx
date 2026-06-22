import React, { memo } from "react";
import { MenuItem, Box, Typography } from "@mui/material";
import { getRoleDescription, getRoleLabel } from "@/utils/employeeRoleI18n";
import { useTranslation } from "react-i18next";

interface RoleMenuItemProps {
  value: string;
  color: string;
  icon: React.ComponentType<{ sx?: object }>;
}

/** A single role option row used in both AddEmployeeModal and EditRoleModal. */
const RoleMenuItem: React.FC<RoleMenuItemProps> = memo(({ value, color, icon: Icon }) => {
  const { t } = useTranslation("dashboard");
  return (
    <MenuItem value={value} sx={{ py: 1.25, px: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: 1.5,
          bgcolor: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, flexShrink: 0, "& svg": { fontSize: 18 },
        }}>
          <Icon />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", lineHeight: 1.2 }}>
            {getRoleLabel(value, t)}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#6b7280" }}>
            {getRoleDescription(value, t)}
          </Typography>
        </Box>
      </Box>
    </MenuItem>
  );
});

RoleMenuItem.displayName = "RoleMenuItem";
export default RoleMenuItem;
