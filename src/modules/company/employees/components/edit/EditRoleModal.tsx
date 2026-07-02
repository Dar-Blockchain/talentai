import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlined from "@mui/icons-material/EditOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDepartmentsQuery } from "@/modules/company/employees/queries";
import { useTranslation } from "react-i18next";
import { ROLES } from "@/modules/shared/constants/employee";
import { roleMatchesSearch } from '@/modules/company/employees/utils/employeeRoleI18n';
import RoleMenuItem from "../shared/RoleMenuItem";
import RoleSelectValue from "../shared/RoleSelectValue";
import {
  DIALOG_PAPER_SX, HEADER_ICON_SX, CLOSE_BTN_SX,
  SELECT_SX, SEARCH_FIELD_SX,
  STICKY_SEARCH_ITEM_SX, MENU_PAPER_SX,
  CANCEL_BTN_SX, PRIMARY_BTN_SX, FIELD_LABEL_SX,
} from "../shared/modalStyles";

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: string, departmentId?: string) => Promise<void>;
  currentRole: string;
  currentDepartmentId?: string;
  memberName: string;
}

const EditRoleModal: React.FC<EditRoleModalProps> = React.memo(({
  open, onClose, onSave, currentRole, currentDepartmentId, memberName,
}) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback(
    (key: string, opts?: Record<string, string>) => t(`pages.employees.modals.edit.${key}`, opts),
    [t],
  );
  const { data: deptsRaw, isLoading: departmentsLoading } = useDepartmentsQuery();
  const departments = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];

  const [role,         setRole]         = useState(currentRole);
  const [departmentId, setDepartmentId] = useState(currentDepartmentId ?? "");
  const [roleSearch,   setRoleSearch]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  // Prevent setState on unmounted component from the close timeout
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (open) {
      setRole(currentRole);
      setDepartmentId(currentDepartmentId ?? "");
      setRoleSearch("");
      setError(null);
      setSuccess(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRole, currentDepartmentId]);

  const isChanged = useMemo(
    () => role !== currentRole || departmentId !== (currentDepartmentId ?? ""),
    [role, departmentId, currentRole, currentDepartmentId],
  );

  const handleSave = useCallback(async () => {
    if (!role) { setError(m("select_role_error")); return; }
    setLoading(true);
    setError(null);
    try {
      await onSave(role, departmentId || undefined);
      if (mountedRef.current) {
        setSuccess(true);
        setTimeout(() => { if (mountedRef.current) onClose(); }, 1200);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : m("update_failed"));
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [role, departmentId, onSave, onClose, m]);

  const handleClose            = useCallback(() => { if (!loading) onClose(); }, [loading, onClose]);
  const handleRoleChange       = useCallback((e: { target: { value: string } }) => setRole(e.target.value), []);
  const handleDeptChange       = useCallback((e: { target: { value: string } }) => setDepartmentId(e.target.value), []);
  const handleRoleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRoleSearch(e.target.value), []);
  const handleRoleSearchClose  = useCallback(() => setRoleSearch(""), []);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return ROLES.filter((r) => roleMatchesSearch(r.value, q, t));
  }, [roleSearch, t]);

  const selectedRole = useMemo(() => ROLES.find((r) => r.value === role), [role]);

  const renderRoleValue = useCallback(() => {
    if (!selectedRole) return null;
    return <RoleSelectValue value={selectedRole.value} color={selectedRole.color} icon={selectedRole.icon} />;
  }, [selectedRole]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: DIALOG_PAPER_SX } }}>

      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2.5, borderBottom: "1px solid #f3f4f6" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={HEADER_ICON_SX}>
              <EditOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", lineHeight: 1.2 }}>
                {m("title")}
              </Typography>
              <Typography sx={{ fontSize: "0.775rem", color: "#9CA3AF", mt: 0.25 }}>
                {m("subtitle_intro")}{" "}
                <strong style={{ color: "#374151" }}>{memberName}</strong>
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small" sx={CLOSE_BTN_SX}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: 2 }}>{m("success")}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Role */}
          <Box>
            <Typography sx={FIELD_LABEL_SX}>{m("role_label")}</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={role}
                onChange={handleRoleChange}
                disabled={loading}
                onClose={handleRoleSearchClose}
                MenuProps={{ PaperProps: { sx: MENU_PAPER_SX }, autoFocus: false }}
                renderValue={renderRoleValue}
                sx={SELECT_SX}
              >
                <MenuItem disableRipple onKeyDown={(e) => e.stopPropagation()} sx={STICKY_SEARCH_ITEM_SX}>
                  <TextField
                    size="small" fullWidth autoFocus
                    placeholder={m("search_roles")}
                    value={roleSearch}
                    onChange={handleRoleSearchChange}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={SEARCH_FIELD_SX}
                  />
                </MenuItem>

                {filteredRoles.map((r) => (
                  <RoleMenuItem key={r.value} value={r.value} color={r.color} icon={r.icon} />
                ))}

                {filteredRoles.length === 0 && (
                  <MenuItem disabled sx={{ py: 2, justifyContent: "center" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
                      {m("no_roles_match", { term: roleSearch })}
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Department */}
          <Box>
            <Typography sx={FIELD_LABEL_SX}>
              {m("department_label")}{" "}
              <Typography component="span" sx={{ fontWeight: 400, color: "#9CA3AF", fontSize: "0.75rem" }}>
                {m("optional")}
              </Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={departmentId}
                onChange={handleDeptChange}
                disabled={loading || departmentsLoading}
                displayEmpty
                startAdornment={<BusinessOutlined sx={{ fontSize: 18, color: "#9CA3AF", mr: 1 }} />}
                sx={SELECT_SX}
              >
                <MenuItem value="">
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}>{m("no_department")}</Typography>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2.5, gap: 1.5 }}>
        <Button onClick={handleClose} disabled={loading} sx={CANCEL_BTN_SX}>
          {m("cancel")}
        </Button>
        <Button onClick={handleSave} disabled={loading || !isChanged} variant="contained" sx={PRIMARY_BTN_SX}>
          {loading
            ? <><CircularProgress size={15} sx={{ mr: 1, color: "#fff" }} />{m("updating_btn")}</>
            : m("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EditRoleModal.displayName = "EditRoleModal";
export default EditRoleModal;
