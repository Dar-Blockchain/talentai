import React, { memo, useMemo } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import PermissionsPanel from "../permissions/PermissionsPanel";
import type { EmployeePermission } from "@/types/employeePermissions";

const PURPLE = "#8310FF";

const HEADER_ROW_SX = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  mb: 2, flexWrap: "wrap", gap: 1.5,
} as const;

const LOADER_BOX_SX = { display: "flex", justifyContent: "center", py: 6 } as const;
const SELF_BOX_SX = { py: 6, textAlign: "center" } as const;

interface PermissionsTabProps {
  name: string;
  isSelf: boolean;
  isOwner: boolean;
  permissions: Partial<EmployeePermission>;
  onChange: (p: Partial<EmployeePermission>) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  loading: boolean;
}

const PermissionsTab: React.FC<PermissionsTabProps> = memo(({
  name, isSelf, isOwner,
  permissions, onChange,
  onSave, saving, saved, loading,
}) => {
  const saveBtnSx = useMemo(() => ({
    textTransform: "none" as const, fontWeight: 700, borderRadius: "12px",
    px: 3, py: 1, fontSize: "0.8125rem",
    bgcolor: saved ? "#16A34A" : PURPLE,
    color: "#fff",
    boxShadow: `0 4px 14px ${saved ? "rgba(22,163,74,0.35)" : "rgba(131,16,255,0.3)"}`,
    "&:hover": { bgcolor: saved ? "#15803D" : "#7209E6" },
    "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
    transition: "all 0.2s",
    minWidth: 140,
  }), [saved]);

  const saveIcon = saving
    ? <CircularProgress size={14} sx={{ color: "#fff" }} />
    : saved
    ? <CheckOutlined sx={{ fontSize: 16 }} />
    : undefined;

  if (isSelf) {
    return (
      <motion.div key="permissions-self" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Box sx={SELF_BOX_SX}>
          <TuneOutlined sx={{ fontSize: 40, color: "#E2E8F0", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0F172A", mb: 0.5 }}>
            You cannot manage your own permissions
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>
            Ask the company owner to update your permissions.
          </Typography>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div key="permissions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
      <Box sx={HEADER_ROW_SX}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0F172A" }}>
            Member Permissions
          </Typography>
          <Typography sx={{ fontSize: "0.775rem", color: "#94A3B8", mt: 0.25 }}>
            Control what <strong style={{ color: "#475569" }}>{name}</strong> can access and modify in the workspace.
          </Typography>
        </Box>

        <Button onClick={onSave} disabled={saving || loading} variant="contained" startIcon={saveIcon} sx={saveBtnSx}>
          {saving ? "Saving…" : saved ? "Saved!" : "Save Permissions"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={LOADER_BOX_SX}>
          <CircularProgress size={32} sx={{ color: PURPLE }} />
        </Box>
      ) : (
        <PermissionsPanel value={permissions} onChange={onChange} disabled={saving} isOwner={isOwner} />
      )}
    </motion.div>
  );
});

PermissionsTab.displayName = "PermissionsTab";
export default PermissionsTab;
