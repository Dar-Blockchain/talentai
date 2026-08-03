import React, { memo } from "react";
import { getRoleDescription, getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { useTranslation } from "react-i18next";

interface RoleSelectValueProps {
  value: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** The selected role display shown inside a Select trigger. */
const RoleSelectValue: React.FC<RoleSelectValueProps> = memo(({ value, color, icon: Icon }) => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}18`, color }}
      >
        <Icon size={16} />
      </div>
      <span className="text-sm font-semibold text-[#111827]">
        {getRoleLabel(value, t)}
      </span>
      <span className="text-xs text-[#6b7280]">
        — {getRoleDescription(value, t)}
      </span>
    </div>
  );
});

RoleSelectValue.displayName = "RoleSelectValue";
export default RoleSelectValue;
