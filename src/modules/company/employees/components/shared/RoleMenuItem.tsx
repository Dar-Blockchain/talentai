import React, { memo } from "react";
import { getRoleDescription, getRoleLabel } from '@/modules/company/employees/utils/employeeRoleI18n';
import { useTranslation } from "react-i18next";

interface RoleMenuItemProps {
  value: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** A single role option row used in both AddEmployeeModal and EditRoleModal. */
const RoleMenuItem: React.FC<RoleMenuItemProps> = memo(({ value, color, icon: Icon }) => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div
        className="flex size-[34px] shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}18`, color }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-bold leading-tight text-[#111827]">
          {getRoleLabel(value, t)}
        </p>
        <p className="text-[0.72rem] text-[#6b7280]">
          {getRoleDescription(value, t)}
        </p>
      </div>
    </div>
  );
});

RoleMenuItem.displayName = "RoleMenuItem";
export default RoleMenuItem;
