import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Box, Typography, Switch,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import PeopleOutlineOutlined from "@mui/icons-material/PeopleOutlineOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesome";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { EmployeePermission, EmployeePermissionKey, EMPLOYEE_PERMISSION_GROUPS, EMPLOYEE_PERMISSION_CATEGORIES } from "@/modules/company/employees/types/permissions";

const PURPLE = "#8310FF";

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
  icon: React.ComponentType<{ sx?: object }>;
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

// ─── Static sx constants ──────────────────────────────────────────────────────

const SWITCH_SX = {
  flexShrink: 0,
  "& .MuiSwitch-switchBase": { color: "#E2E8F0" },
  "& .MuiSwitch-track": { bgcolor: "#CBD5E1", opacity: 1, borderRadius: 99 },
  "& .MuiSwitch-thumb": { boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
} as const;

const PANEL_SX       = { display: "flex", flexDirection: "column", gap: 1 } as const;
const ACCORD_BASE_SX = { "&:before": { display: "none" } } as const;
const DETAILS_SX     = { p: 0, bgcolor: "#fff" } as const;
const SUMMARY_CONTENT_SX = { "& .MuiAccordionSummary-content": { my: "14px", alignItems: "center", gap: 1.5 } } as const;
const META_BOX_SX    = { flex: 1, minWidth: 0 } as const;
const META_TITLE_SX  = { fontWeight: 700, fontSize: "0.875rem", color: "#0F172A", lineHeight: 1.3 } as const;
const META_DESC_SX   = { fontSize: "0.7rem", color: "#94A3B8", mt: 0.1 } as const;
const GRANT_TEXT_SX  = { fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" } as const;
const ROW_LABEL_SX   = { fontWeight: 600, fontSize: "0.8125rem", color: "#1E293B", lineHeight: 1.3 } as const;
const ROW_DESC_SX    = { fontSize: "0.72rem", color: "#94A3B8", mt: 0.15 } as const;
const ROW_BODY_SX    = { flex: 1, minWidth: 0 } as const;
const STOP_PROP      = (e: React.MouseEvent) => e.stopPropagation();

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

  const rowSx = useMemo(() => ({
    px: 2.5, py: 1.5,
    display: "flex", alignItems: "center", gap: 2,
    borderBottom: isLast ? "none" : "1px solid #F8FAFC",
    transition: "background 0.15s",
    "&:hover": disabled ? {} : { bgcolor: "#FAFBFC" },
    opacity: disabled ? 0.6 : 1,
  }), [isLast, disabled]);

  const dotSx = useMemo(() => ({
    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
    bgcolor: enabled ? color : "#E2E8F0",
    boxShadow: enabled ? `0 0 0 3px ${color}18` : "none",
    transition: "all 0.2s",
  }), [enabled, color]);

  const switchSx = useMemo(() => ({
    ...SWITCH_SX,
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#fff",
      "& + .MuiSwitch-track": { bgcolor: color, opacity: 1 },
    },
  }), [color]);

  return (
    <Box sx={rowSx}>
      <Box sx={dotSx} />
      <Box sx={ROW_BODY_SX}>
        <Typography sx={ROW_LABEL_SX}>{label}</Typography>
        <Typography sx={ROW_DESC_SX}>{desc}</Typography>
      </Box>
      <Switch
        checked={enabled}
        onChange={handleToggle}
        onClick={STOP_PROP}
        size="small"
        disabled={disabled}
        sx={switchSx}
      />
    </Box>
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
  onExpandChange: (category: string, open: boolean) => void;
}

const AccordionGroup: React.FC<AccordionGroupProps> = memo(({
  group, meta, keys, visiblePerms, value, disabled, isOpen, onToggle, onToggleGroup, onExpandChange,
}) => {
  const Icon        = meta.icon;
  const allGranted  = keys.every((k) => !!value[k]);
  const someGranted = keys.some((k)  => !!value[k]);
  const enabledCount = visiblePerms.filter((p) => {
    const pack = PACK_ROWS[p.key];
    return pack ? pack.keys.every((k) => !!value[k]) : !!value[p.key];
  }).length;

  const handleExpand  = useCallback((_: React.SyntheticEvent, open: boolean) => onExpandChange(group.category, open), [onExpandChange, group.category]);
  const handleGrant   = useCallback((e: React.MouseEvent) => onToggleGroup(keys, !allGranted, e), [onToggleGroup, keys, allGranted]);

  const accordSx = useMemo(() => ({
    ...ACCORD_BASE_SX,
    border: `1px solid ${isOpen ? `${meta.color}30` : "#E8EAED"}`,
    borderRadius: "14px !important", overflow: "hidden",
    boxShadow: isOpen ? `0 4px 16px ${meta.color}12` : "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.22s, border-color 0.22s",
  }), [isOpen, meta.color]);

  const summarySx = useMemo(() => ({
    ...SUMMARY_CONTENT_SX,
    px: 2.5, py: 0, minHeight: "60px !important",
    bgcolor: isOpen ? `${meta.color}06` : "#FAFBFC",
    borderBottom: isOpen ? `1px solid ${meta.color}15` : "none",
    transition: "background 0.2s",
  }), [isOpen, meta.color]);

  const expandIconSx = useMemo(() => ({
    fontSize: 18, color: isOpen ? meta.color : "#94A3B8", transition: "color 0.2s",
  }), [isOpen, meta.color]);

  const iconBoxSx = useMemo(() => ({
    width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
    bgcolor: `${meta.color}12`, border: `1px solid ${meta.color}22`,
    display: "flex", alignItems: "center", justifyContent: "center", color: meta.color,
  }), [meta.color]);

  const countBadgeSx = useMemo(() => ({
    px: 1, py: "2px", borderRadius: "999px", flexShrink: 0,
    bgcolor: someGranted ? `${meta.color}12` : "#F1F5F9",
    border: `1px solid ${someGranted ? `${meta.color}25` : "#E2E8F0"}`,
  }), [someGranted, meta.color]);

  const countTextSx = useMemo(() => ({
    fontSize: "0.7rem", fontWeight: 700,
    color: someGranted ? meta.color : "#94A3B8",
  }), [someGranted, meta.color]);

  const grantBoxSx = useMemo(() => ({
    px: 1.125, py: "3px", borderRadius: "8px", cursor: "pointer", flexShrink: 0,
    bgcolor: someGranted ? `${meta.color}08` : "transparent",
    border: `1px solid ${someGranted ? `${meta.color}22` : "#E8EAED"}`,
    transition: "all 0.15s",
    "&:hover": { bgcolor: `${meta.color}14`, borderColor: `${meta.color}35` },
  }), [someGranted, meta.color]);

  const grantTextSx = useMemo(() => ({
    ...GRANT_TEXT_SX, color: someGranted ? meta.color : "#94A3B8",
  }), [someGranted, meta.color]);

  return (
    <Accordion key={group.category} expanded={isOpen} onChange={handleExpand} disableGutters elevation={0} sx={accordSx}>
      <AccordionSummary expandIcon={<ExpandMoreOutlined sx={expandIconSx} />} sx={summarySx}>
        <Box sx={iconBoxSx}><Icon sx={{ fontSize: 18 }} /></Box>

        <Box sx={META_BOX_SX}>
          <Typography sx={META_TITLE_SX}>{group.category}</Typography>
          <Typography sx={META_DESC_SX}>{meta.description}</Typography>
        </Box>

        <Box sx={countBadgeSx}>
          <Typography sx={countTextSx}>{enabledCount} / {visiblePerms.length}</Typography>
        </Box>

        {!disabled && (
          <Box onClick={handleGrant} sx={grantBoxSx}>
            <Typography sx={grantTextSx}>{allGranted ? "Revoke all" : "Grant all"}</Typography>
          </Box>
        )}
      </AccordionSummary>

      <AccordionDetails sx={DETAILS_SX}>
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
      </AccordionDetails>
    </Accordion>
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

  const handleExpandChange = useCallback((category: string, open: boolean) => {
    setExpanded(open ? category : false);
  }, []);

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
    <Box sx={PANEL_SX}>
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
          onExpandChange={handleExpandChange}
        />
      ))}
    </Box>
  );
});

PermissionsPanel.displayName = "PermissionsPanel";
export default PermissionsPanel;
