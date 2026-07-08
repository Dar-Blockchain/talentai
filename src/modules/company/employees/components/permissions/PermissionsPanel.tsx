import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Briefcase as WorkOutlineOutlined,
  Users as PeopleOutlineOutlined,
  Users as GroupsOutlined,
  Network as AccountTreeOutlined,
  Megaphone as CampaignOutlined,
  Settings as SettingsOutlined,
} from "lucide-react";
import { Switch } from "@/modules/shared/ui/shadcn/switch";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/modules/shared/ui/shadcn/accordion";
import { cn } from "@/lib/utils";
import { EmployeePermission, EmployeePermissionKey, EMPLOYEE_PERMISSION_GROUPS, EMPLOYEE_PERMISSION_CATEGORIES } from "@/modules/company/employees/types/permissions";

const PACK_ROWS: Partial<Record<EmployeePermissionKey, {
  keys: EmployeePermissionKey[];
  label: string;
  description: string;
}>> = {
  canAssignRoles: {
    keys: ["canAssignRoles", "canUpdateEmployeeDepartment"],
    label: "Update Role & Department",
    description: "Assign roles and change the department of team members",
  },
  canCreateDepartment: {
    keys: ["canCreateDepartment", "canEditDepartment", "canDeleteDepartment"],
    label: "Manage Departments",
    description: "Create, edit and delete departments in the organisation",
  },
  canCreateCampaign: {
    keys: ["canCreateCampaign", "canEditCampaign", "canDeleteCampaign", "canPublishCampaign"],
    label: "Manage Campaigns",
    description: "Create, edit, delete and publish campaigns",
  },
};

const PACK_ABSORBED = new Set<EmployeePermissionKey>(
  Object.values(PACK_ROWS).flatMap((p) => p!.keys.slice(1))
);

interface CategoryMeta {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  description: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  [EMPLOYEE_PERMISSION_CATEGORIES.JOB_POSTS]:   { icon: WorkOutlineOutlined,   color: "#0891B2", description: "Manage job postings and recruitment listings" },
  [EMPLOYEE_PERMISSION_CATEGORIES.CANDIDATES]:  { icon: PeopleOutlineOutlined, color: "#16A34A", description: "Access and interact with candidate profiles" },
  [EMPLOYEE_PERMISSION_CATEGORIES.CAMPAIGNS]:   { icon: CampaignOutlined,      color: "#DB2777", description: "Create, manage, and analyse marketing campaigns" },
  [EMPLOYEE_PERMISSION_CATEGORIES.TEAM]:        { icon: GroupsOutlined,        color: "#DC2626", description: "Manage team members, roles, and invitations" },
  [EMPLOYEE_PERMISSION_CATEGORIES.DEPARTMENTS]: { icon: AccountTreeOutlined,   color: "#8B5CF6", description: "Create and manage organisation departments" },
  [EMPLOYEE_PERMISSION_CATEGORIES.SETTINGS]:    { icon: SettingsOutlined,      color: "#64748B", description: "Control company profile and workspace settings" },
};

const STOP_PROP = (e: React.MouseEvent) => e.stopPropagation();

// ─── PermRow ──────────────────────────────────────────────────────────────────

interface PermRowProps {
  permKey: EmployeePermissionKey;
  value: Partial<EmployeePermission>;
  color: string;
  disabled: boolean;
  isLast: boolean;
  onToggle: (key: EmployeePermissionKey) => void;
}

const PermRow: React.FC<PermRowProps> = memo(({ permKey, value, color, disabled, isLast, onToggle }) => {
  const pack    = PACK_ROWS[permKey];
  const label   = pack ? pack.label       : permKey;
  const desc    = pack ? pack.description : permKey;
  const enabled = pack ? pack.keys.every((k) => !!value[k]) : !!value[permKey];

  const handleToggle = useCallback(() => { if (!disabled) onToggle(permKey); }, [disabled, onToggle, permKey]);

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-3 transition-colors",
        !isLast && "border-b border-[#F8FAFC]",
        disabled ? "opacity-60" : "hover:bg-[#FAFBFC]",
      )}
    >
      <div
        className="size-[7px] shrink-0 rounded-full transition-all duration-200"
        style={{ backgroundColor: enabled ? color : "#E2E8F0", boxShadow: enabled ? `0 0 0 3px ${color}18` : "none" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-semibold leading-tight text-[#1E293B]">{label}</p>
        <p className="mt-0.5 text-[0.72rem] text-[#94A3B8]">{desc}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        onClick={STOP_PROP}
        disabled={disabled}
        className="shrink-0"
        style={enabled ? { backgroundColor: color } : undefined}
      />
    </div>
  );
});
PermRow.displayName = "PermRow";

// ─── AccordionGroup — isolated so each group's handlers are stable ────────────

interface AccordionGroupProps {
  group: typeof EMPLOYEE_PERMISSION_GROUPS[number];
  meta: CategoryMeta;
  keys: EmployeePermissionKey[];
  visiblePerms: Array<{ key: EmployeePermissionKey }>;
  value: Partial<EmployeePermission>;
  disabled: boolean;
  isOpen: boolean;
  onToggle: (key: EmployeePermissionKey) => void;
  onToggleGroup: (keys: EmployeePermissionKey[], grant: boolean, e: React.MouseEvent) => void;
}

const AccordionGroup: React.FC<AccordionGroupProps> = memo(({
  group, meta, keys, visiblePerms, value, disabled, isOpen, onToggle, onToggleGroup,
}) => {
  const Icon        = meta.icon;
  const allGranted  = keys.every((k) => !!value[k]);
  const someGranted = keys.some((k)  => !!value[k]);
  const enabledCount = visiblePerms.filter((p) => {
    const pack = PACK_ROWS[p.key];
    return pack ? pack.keys.every((k) => !!value[k]) : !!value[p.key];
  }).length;

  const handleGrant = useCallback((e: React.MouseEvent) => onToggleGroup(keys, !allGranted, e), [onToggleGroup, keys, allGranted]);

  return (
    <AccordionItem
      value={group.category}
      className="overflow-hidden rounded-2xl border transition-shadow duration-200"
      style={{
        borderColor: isOpen ? `${meta.color}30` : "#E8EAED",
        boxShadow: isOpen ? `0 4px 16px ${meta.color}12` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <AccordionTrigger
        className={cn("min-h-[60px] items-center gap-3 rounded-none px-5 py-0 hover:no-underline", isOpen && "border-b")}
        style={{
          backgroundColor: isOpen ? `${meta.color}06` : "#FAFBFC",
          borderColor: isOpen ? `${meta.color}15` : "transparent",
        }}
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border"
          style={{ backgroundColor: `${meta.color}12`, borderColor: `${meta.color}22`, color: meta.color }}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.875rem] font-bold leading-tight text-[#0F172A]">{group.category}</p>
          <p className="mt-px text-[0.7rem] text-[#94A3B8]">{meta.description}</p>
        </div>

        <div
          className="shrink-0 rounded-full border px-2.5 py-0.5"
          style={{
            backgroundColor: someGranted ? `${meta.color}12` : "#F1F5F9",
            borderColor: someGranted ? `${meta.color}25` : "#E2E8F0",
          }}
        >
          <span className="text-xs font-bold" style={{ color: someGranted ? meta.color : "#94A3B8" }}>
            {enabledCount} / {visiblePerms.length}
          </span>
        </div>

        {!disabled && (
          <div
            onClick={handleGrant}
            className="shrink-0 cursor-pointer rounded-lg border px-[9px] py-[3px] transition-all"
            style={{
              backgroundColor: someGranted ? `${meta.color}08` : "transparent",
              borderColor: someGranted ? `${meta.color}22` : "#E8EAED",
            }}
          >
            <span className="whitespace-nowrap text-[0.68rem] font-bold" style={{ color: someGranted ? meta.color : "#94A3B8" }}>
              {allGranted ? "Revoke all" : "Grant all"}
            </span>
          </div>
        )}
      </AccordionTrigger>

      <AccordionContent className="bg-white p-0">
        {visiblePerms.map((perm, idx) => (
          <PermRow
            key={perm.key}
            permKey={perm.key}
            value={value}
            color={meta.color}
            disabled={disabled}
            isLast={idx === visiblePerms.length - 1}
            onToggle={onToggle}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
});
AccordionGroup.displayName = "AccordionGroup";

// ─── PermissionsPanel ─────────────────────────────────────────────────────────

export interface PermissionsPanelProps {
  value: Partial<EmployeePermission>;
  onChange: (updated: Partial<EmployeePermission>) => void;
  disabled?: boolean;
  isOwner?: boolean;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = memo(({ value, onChange, disabled = false, isOwner = false }) => {
  const [expanded, setExpanded] = useState<string | false>(EMPLOYEE_PERMISSION_GROUPS[0]?.category ?? false);

  const toggle = useCallback((key: EmployeePermissionKey) => {
    const newVal = !value[key];
    const patch: Partial<EmployeePermission> = {};
    const pack = PACK_ROWS[key];
    if (pack) { pack.keys.forEach((k) => { patch[k] = newVal; }); }
    else { patch[key] = newVal; }
    onChange({ ...value, ...patch });
  }, [value, onChange]);

  const toggleGroup = useCallback((keys: EmployeePermissionKey[], grant: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const patch: Partial<EmployeePermission> = {};
    keys.forEach((k) => { patch[k] = grant; });
    onChange({ ...value, ...patch });
  }, [value, onChange]);

  const groups = useMemo(() =>
    EMPLOYEE_PERMISSION_GROUPS.map((group) => {
      const meta = CATEGORY_META[group.category] ?? { icon: WorkOutlineOutlined, color: "#6B7280", description: "" };
      const keys = group.permissions.map((p) => p.key);
      const visiblePerms = group.permissions.filter(
        (p) => !PACK_ABSORBED.has(p.key) && (isOwner || p.key !== "canManagePermissions")
      );
      return { group, meta, keys, visiblePerms };
    }),
  [isOwner]);

  return (
    <Accordion
      type="single"
      collapsible
      value={expanded || ""}
      onValueChange={(v) => setExpanded(v || false)}
      className="flex flex-col gap-2"
    >
      {groups.map(({ group, meta, keys, visiblePerms }) => (
        <AccordionGroup
          key={group.category}
          group={group}
          meta={meta}
          keys={keys}
          visiblePerms={visiblePerms}
          value={value}
          disabled={disabled}
          isOpen={expanded === group.category}
          onToggle={toggle}
          onToggleGroup={toggleGroup}
        />
      ))}
    </Accordion>
  );
});

PermissionsPanel.displayName = "PermissionsPanel";
export default PermissionsPanel;
