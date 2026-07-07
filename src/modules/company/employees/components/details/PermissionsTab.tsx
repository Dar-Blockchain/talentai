import React, { memo, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { motion } from "framer-motion";
import { SlidersHorizontal as TuneOutlined, Check as CheckOutlined } from "lucide-react";
import PermissionsPanel from "../permissions/PermissionsPanel";
import type { EmployeePermission } from "@/modules/company/employees/types/permissions";

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
  const saveBtnStyle = useMemo(() => ({
    backgroundColor: saved ? "#16A34A" : PURPLE,
    color: "#fff",
    boxShadow: `0 4px 14px ${saved ? "rgba(22,163,74,0.35)" : "rgba(131,16,255,0.3)"}`,
  }), [saved]);

  if (isSelf) {
    return (
      <motion.div key="permissions-self" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Box sx={SELF_BOX_SX}>
          <TuneOutlined size={40} color="#E2E8F0" className="mb-3" />
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

        <Button
          onClick={onSave}
          disabled={saving || loading}
          loading={saving}
          variant="default"
          className="min-w-[140px] rounded-xl px-6 py-2 text-[0.8125rem] font-bold shadow-none transition-all"
          style={saveBtnStyle}
        >
          {!saving && saved && <CheckOutlined size={16} />}
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
