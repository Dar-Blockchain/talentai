import React, { memo, useMemo } from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { motion } from "framer-motion";
import { SlidersHorizontal as TuneOutlined, Check as CheckOutlined } from "lucide-react";
import PermissionsPanel from "../permissions/PermissionsPanel";
import type { EmployeePermission } from "@/modules/company/employees/types/permissions";

const PURPLE = "#8310FF";

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
        <div className="py-12 text-center">
          <TuneOutlined size={40} color="#E2E8F0" className="mb-3" />
          <p className="mb-1 text-[0.9375rem] font-bold text-[#0F172A]">
            You cannot manage your own permissions
          </p>
          <p className="text-[0.8rem] text-[#94A3B8]">
            Ask the company owner to update your permissions.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="permissions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.9375rem] font-bold text-[#0F172A]">
            Member Permissions
          </p>
          <p className="mt-0.5 text-[0.775rem] text-[#94A3B8]">
            Control what <strong style={{ color: "#475569" }}>{name}</strong> can access and modify in the workspace.
          </p>
        </div>

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
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-8" style={{ color: PURPLE }} />
        </div>
      ) : (
        <PermissionsPanel value={permissions} onChange={onChange} disabled={saving} isOwner={isOwner} />
      )}
    </motion.div>
  );
});

PermissionsTab.displayName = "PermissionsTab";
export default PermissionsTab;
