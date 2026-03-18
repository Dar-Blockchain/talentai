import React, { useCallback, useState } from "react";
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
import { EmployeePermission, EmployeePermissionKey, EMPLOYEE_PERMISSION_GROUPS, EMPLOYEE_PERMISSION_CATEGORIES } from "@/types/employeePermissions";

const PURPLE = "#8310FF";

interface CategoryMeta {
  icon: React.ComponentType<any>;
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

export interface PermissionsPanelProps {
  value: Partial<EmployeePermission>;
  onChange: (updated: Partial<EmployeePermission>) => void;
  disabled?: boolean;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({ value, onChange, disabled = false }) => {
  const [expanded, setExpanded] = useState<string | false>(EMPLOYEE_PERMISSION_GROUPS[0]?.category ?? false);

  const toggle = useCallback(
    (key: EmployeePermissionKey) => { onChange({ ...value, [key]: !value[key] }); },
    [value, onChange],
  );

  const toggleGroup = useCallback(
    (keys: EmployeePermissionKey[], grant: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      const patch: Partial<EmployeePermission> = {};
      keys.forEach((k) => { patch[k] = grant; });
      onChange({ ...value, ...patch });
    },
    [value, onChange],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {EMPLOYEE_PERMISSION_GROUPS.map((group) => {
        const meta = CATEGORY_META[group.category] ?? { icon: WorkOutlineOutlined, color: "#6B7280", description: "" };
        const Icon = meta.icon;
        const keys        = group.permissions.map((p) => p.key);
        const allGranted  = keys.every((k) => !!value[k]);
        const someGranted = keys.some((k)  => !!value[k]);
        const enabledCount = keys.filter((k) => !!value[k]).length;
        const isOpen = expanded === group.category;

        return (
          <Accordion
            key={group.category}
            expanded={isOpen}
            onChange={(_, open) => setExpanded(open ? group.category : false)}
            disableGutters
            elevation={0}
            sx={{
              border: `1px solid ${isOpen ? `${meta.color}30` : "#E8EAED"}`,
              borderRadius: "14px !important",
              overflow: "hidden",
              boxShadow: isOpen ? `0 4px 16px ${meta.color}12` : "0 1px 4px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.22s, border-color 0.22s",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreOutlined sx={{
                  fontSize: 18, color: isOpen ? meta.color : "#94A3B8",
                  transition: "color 0.2s",
                }} />
              }
              sx={{
                px: 2.5, py: 0,
                minHeight: "60px !important",
                bgcolor: isOpen ? `${meta.color}06` : "#FAFBFC",
                borderBottom: isOpen ? `1px solid ${meta.color}15` : "none",
                transition: "background 0.2s",
                "& .MuiAccordionSummary-content": { my: "14px", alignItems: "center", gap: 1.5 },
              }}
            >
              {/* Icon box */}
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                bgcolor: `${meta.color}12`, border: `1px solid ${meta.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: meta.color,
              }}>
                <Icon sx={{ fontSize: 18 }} />
              </Box>

              {/* Label + description */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A", lineHeight: 1.3 }}>
                  {group.category}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.1 }}>
                  {meta.description}
                </Typography>
              </Box>

              {/* Enabled count badge */}
              <Box sx={{
                px: 1, py: "2px", borderRadius: "999px", flexShrink: 0,
                bgcolor: someGranted ? `${meta.color}12` : "#F1F5F9",
                border: `1px solid ${someGranted ? `${meta.color}25` : "#E2E8F0"}`,
              }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: someGranted ? meta.color : "#94A3B8" }}>
                  {enabledCount} / {keys.length}
                </Typography>
              </Box>

              {/* Grant / revoke all — stop propagation so it doesn't toggle accordion */}
              {!disabled && (
                <Box
                  onClick={(e) => toggleGroup(keys, !allGranted, e)}
                  sx={{
                    px: 1.125, py: "3px", borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                    bgcolor: someGranted ? `${meta.color}08` : "transparent",
                    border: `1px solid ${someGranted ? `${meta.color}22` : "#E8EAED"}`,
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: `${meta.color}14`, borderColor: `${meta.color}35` },
                  }}
                >
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: someGranted ? meta.color : "#94A3B8", whiteSpace: "nowrap" }}>
                    {allGranted ? "Revoke all" : "Grant all"}
                  </Typography>
                </Box>
              )}
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0, bgcolor: "#fff" }}>
              {group.permissions.map((perm, idx) => {
                const enabled = !!value[perm.key];
                return (
                  <Box
                    key={perm.key}
                    sx={{
                      px: 2.5, py: 1.5,
                      display: "flex", alignItems: "center", gap: 2,
                      borderBottom: idx < group.permissions.length - 1 ? "1px solid #F8FAFC" : "none",
                      transition: "background 0.15s",
                      "&:hover": disabled ? {} : { bgcolor: "#FAFBFC" },
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {/* Dot indicator */}
                    <Box sx={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      bgcolor: enabled ? meta.color : "#E2E8F0",
                      boxShadow: enabled ? `0 0 0 3px ${meta.color}18` : "none",
                      transition: "all 0.2s",
                    }} />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1E293B", lineHeight: 1.3 }}>
                        {perm.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.15 }}>
                        {perm.description}
                      </Typography>
                    </Box>

                    <Switch
                      checked={enabled}
                      onChange={() => !disabled && toggle(perm.key)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      disabled={disabled}
                      sx={{
                        flexShrink: 0,
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#fff",
                          "& + .MuiSwitch-track": { bgcolor: meta.color, opacity: 1 },
                        },
                        "& .MuiSwitch-switchBase": { color: "#E2E8F0" },
                        "& .MuiSwitch-track": { bgcolor: "#CBD5E1", opacity: 1, borderRadius: 99 },
                        "& .MuiSwitch-thumb": { boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
                      }}
                    />
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default PermissionsPanel;
