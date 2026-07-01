import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { getRoleDescription, getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { useTranslation } from "react-i18next";

interface RoleSelectValueProps {
  value: string;
  color: string;
  icon: React.ComponentType<{ sx?: object }>;
}

/** The selected role display shown inside a Select trigger. */
const RoleSelectValue: React.FC<RoleSelectValueProps> = memo(({ value, color, icon: Icon }) => {
  const { t } = useTranslation("dashboard");
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: 1.5,
        bgcolor: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0, "& svg": { fontSize: 16 },
      }}>
        <Icon />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>
        {getRoleLabel(value, t)}
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>
        — {getRoleDescription(value, t)}
      </Typography>
    </Box>
  );
});

RoleSelectValue.displayName = "RoleSelectValue";
export default RoleSelectValue;
