import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton,
  CircularProgress, Select, MenuItem, FormControl, InputAdornment,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchDepartments, selectDepartments, selectDepartmentsLoading } from "@/store/slices/departmentSlice";
import { useTranslation } from "react-i18next";
import { ROLES } from "@/constants/employee";
import { roleMatchesSearch } from "@/utils/employeeRoleI18n";
import RoleMenuItem from "../shared/RoleMenuItem";
import RoleSelectValue from "../shared/RoleSelectValue";
import {
  DIALOG_PAPER_SX, HEADER_ICON_SX, CLOSE_BTN_SX,
  FIELD_INPUT_SX, SELECT_SX, SEARCH_FIELD_SX,
  STICKY_SEARCH_ITEM_SX, MENU_PAPER_SX,
  CANCEL_BTN_SX, PRIMARY_BTN_SX, FIELD_LABEL_SX,
} from "../shared/modalStyles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (email: string, role: string, departmentId?: string) => Promise<void>;
  defaultDepartmentId?: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = React.memo(({
  open, onClose, onSave, defaultDepartmentId,
}) => {
  const { t } = useTranslation("dashboard");
  const m = useCallback(
    (key: string, opts?: Record<string, string>) => t(`pages.employees.modals.add.${key}`, opts),
    [t],
  );
  const dispatch = useDispatch<AppDispatch>();
  const departments        = useSelector(selectDepartments);
  const departmentsLoading = useSelector(selectDepartmentsLoading);

  const [email,       setEmail]       = useState("");
  const [role,        setRole]        = useState("hr");
  const [departmentId, setDepartmentId] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [roleSearch,  setRoleSearch]  = useState("");

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("hr");
      setDepartmentId(defaultDepartmentId ?? "");
      setRoleSearch("");
      if (departments.length === 0) dispatch(fetchDepartments({}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isFormValid = useMemo(
    () => email.trim() && EMAIL_REGEX.test(email) && role,
    [email, role],
  );

  const handleSave = useCallback(async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email)) return;
    setLoading(true);
    try {
      await onSave(email, role, departmentId || undefined);
    } catch {
      // error already handled by parent via showToast
    } finally {
      setLoading(false);
      onClose();
    }
  }, [email, role, departmentId, onSave, onClose]);

  const handleClose   = useCallback(() => { if (!loading) onClose(); }, [loading, onClose]);
  const handleRoleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRoleSearch(e.target.value), []);
  const handleEmailChange      = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handleRoleChange       = useCallback((e: { target: { value: string } }) => setRole(e.target.value), []);
  const handleDeptChange       = useCallback((e: { target: { value: string } }) => setDepartmentId(e.target.value), []);
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
              <PersonAddIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", lineHeight: 1.2 }}>
                {m("title")}
              </Typography>
              <Typography sx={{ fontSize: "0.775rem", color: "#9CA3AF", mt: 0.25 }}>
                {m("subtitle")}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small" sx={CLOSE_BTN_SX}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 4, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>

          {/* Email */}
          <Box>
            <Typography sx={FIELD_LABEL_SX}>{m("email_label")}</Typography>
            <TextField
              fullWidth size="small" type="email"
              placeholder={m("email_placeholder")}
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              sx={FIELD_INPUT_SX}
            />
            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.75 }}>
              {m("email_helper")}
            </Typography>
          </Box>

          {/* Department (optional) */}
          <Box>
            <Typography sx={FIELD_LABEL_SX}>
              {m("department_label")}{" "}
              {!defaultDepartmentId && (
                <Typography component="span" sx={{ fontWeight: 400, color: "#9CA3AF", fontSize: "0.75rem" }}>
                  {m("optional")}
                </Typography>
              )}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={departmentId}
                onChange={handleDeptChange}
                disabled={loading || departmentsLoading || Boolean(defaultDepartmentId)}
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

          {/* Role — searchable */}
          <Box>
            <Typography sx={FIELD_LABEL_SX}>{m("select_role")}</Typography>
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2.5, gap: 1.5 }}>
        <Button onClick={handleClose} disabled={loading} sx={CANCEL_BTN_SX}>
          {m("cancel")}
        </Button>
        <Button onClick={handleSave} disabled={loading || !isFormValid} variant="contained" sx={PRIMARY_BTN_SX}>
          {loading
            ? <><CircularProgress size={15} sx={{ mr: 1, color: "#fff" }} />{m("sending")}</>
            : m("send_invitation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AddEmployeeModal.displayName = "AddEmployeeModal";
export default AddEmployeeModal;
