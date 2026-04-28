import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { emitToast } from "@/utils/toastEmitter";
import {
  Box, Typography, Button, Chip, CircularProgress, Alert, Divider,
  IconButton, Tooltip, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  fetchApiKeys, createApiKey, deleteApiKey, toggleApiKey, updateApiKey, regenerateApiKey, clearNewKey,
  selectApiKeys, selectApiKeysLoading, selectApiKeysCreating, selectApiKeysError, selectNewKey,
  type ApiKey,
} from "@/store/slices/apiKeySlice";
import { SectionTitle, FieldLabel } from "./SettingsShared";
import { TEAL, TEAL_BG, TEAL_BORDER, AVAILABLE_SCOPES, fieldSx, fmtDate } from "./settingsConstants";

const DEFAULT_FORM = { name: "", serviceName: "mobile-app", scopes: AVAILABLE_SCOPES as string[], rateLimit: 5, expiresAt: "2027-12-31", ipMode: "all" as "all" | "custom", ipList: "" };

const datePicker = (value: string, onChange: (v: string) => void) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(v: Dayjs | null) => onChange(v ? v.format("YYYY-MM-DD") : "")}
      disablePast
      slotProps={{
        textField: { fullWidth: true, sx: fieldSx },
        popper: { sx: { "& .MuiPaper-root": { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } } },
      }}
    />
  </LocalizationProvider>
);

const ScopeChips = () => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
    {AVAILABLE_SCOPES.map((s) => (
      <Chip key={s} label={s} size="small"
        sx={{ height: 26, fontSize: "0.72rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.1)", color: TEAL, border: `1px solid ${TEAL_BORDER}`, cursor: "default", pointerEvents: "none" }}
      />
    ))}
  </Box>
);

const DialogForm = ({ fields, children }: { fields: React.ReactNode; children: React.ReactNode }) => (
  <>
    <DialogContent sx={{ pt: 2.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>{fields}</Box>
    </DialogContent>
    <Divider />
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{children}</DialogActions>
  </>
);

const cancelBtnSx = { textTransform: "none", fontWeight: 600, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: "9px", px: 2 };
const saveBtnSx   = { textTransform: "none", fontWeight: 700, bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#E5E7EB" } };

const ApiKeysTab: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch    = useDispatch<AppDispatch>();
  const apiKeys     = useSelector(selectApiKeys);
  const keysLoading = useSelector(selectApiKeysLoading);
  const creating    = useSelector(selectApiKeysCreating);
  const apiError    = useSelector(selectApiKeysError);
  const newKey      = useSelector(selectNewKey);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editForm, setEditForm]     = useState({ name: "", serviceName: "", scopes: [] as string[], rateLimit: 5, expiresAt: "", ipMode: "all" as "all" | "custom", ipList: "" });
  const [copied, setCopied]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);

  useEffect(() => {
    dispatch(fetchApiKeys()).unwrap().catch(() =>
      emitToast({ message: t("pages.settings.api_keys.toast.load_error"), severity: "error" })
    );
  }, [dispatch]);

  useEffect(() => {
    if (editingKey) {
      const existingIps = editingKey.ipWhitelist ?? [];
      setEditForm({
        name: editingKey.name,
        serviceName: editingKey.serviceName,
        scopes: editingKey.scopes,
        rateLimit: editingKey.rateLimit,
        expiresAt: editingKey.expiresAt ? editingKey.expiresAt.slice(0, 10) : "",
        ipMode: existingIps.length === 0 ? "all" : "custom",
        ipList: existingIps.join(", "),
      });
    }
  }, [editingKey]);

  const parseIpWhitelist = (mode: "all" | "custom", ipList: string): string[] =>
    mode === "all" ? [] : ipList.split(",").map((s) => s.trim()).filter(Boolean);

  const handleCreate = async () => {
    try {
      await dispatch(createApiKey({ ...form, scopes: ['all'], ipWhitelist: parseIpWhitelist(form.ipMode, form.ipList) })).unwrap();
      setCreateOpen(false);
      setForm(DEFAULT_FORM);
      emitToast({ message: t("pages.settings.api_keys.toast.created"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.create_error"), severity: "error" });
    }
  };

  const handleUpdate = async () => {
    if (!editingKey) return;
    try {
      await dispatch(updateApiKey({ id: editingKey.id, data: { ...editForm, scopes: ['all'], ipWhitelist: parseIpWhitelist(editForm.ipMode, editForm.ipList) } })).unwrap();
      setEditingKey(null);
      emitToast({ message: t("pages.settings.api_keys.toast.updated"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.update_error"), severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteApiKey(deleteTarget.id)).unwrap();
      emitToast({ message: t("pages.settings.api_keys.toast.deleted"), severity: "info" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.delete_error"), severity: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await dispatch(toggleApiKey(id)).unwrap();
      emitToast({ message: isActive ? t("pages.settings.api_keys.toast.key_disabled") : t("pages.settings.api_keys.toast.key_enabled"), severity: "info" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.toggle_error"), severity: "error" });
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      await dispatch(regenerateApiKey(id)).unwrap();
      emitToast({ message: t("pages.settings.api_keys.toast.regenerated"), severity: "success" });
    } catch {
      emitToast({ message: t("pages.settings.api_keys.toast.regenerate_error"), severity: "error" });
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    emitToast({ message: t("pages.settings.api_keys.toast.copied"), severity: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <SectionTitle title={t("pages.settings.api_keys.title")} subtitle={t("pages.settings.api_keys.subtitle")} />
        <Button size="small" startIcon={<AddOutlined sx={{ fontSize: 15 }} />} onClick={() => setCreateOpen(true)}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "9px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
          {t("pages.settings.api_keys.new_key")}
        </Button>
      </Box>

      {/* New key banner */}
      {newKey && (
        <Alert severity="success" onClose={() => dispatch(clearNewKey())}
          sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.82rem", "& .MuiAlert-message": { width: "100%" } }}
          action={
            <Tooltip title={copied ? t("pages.settings.api_keys.copied") : t("pages.settings.api_keys.copy")}>
              <IconButton size="small" onClick={() => handleCopy(newKey)}>
                <ContentCopyOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          }
        >
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, mb: 0.5 }}>{t("pages.settings.api_keys.banner_title")}</Typography>
          <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem", bgcolor: "#F0FDF4", px: 1.5, py: 0.75, borderRadius: "6px", wordBreak: "break-all" }}>{newKey}</Box>
        </Alert>
      )}

      {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.82rem" }}>{apiError}</Alert>}

      {/* List */}
      {keysLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} sx={{ color: TEAL }} /></Box>
      ) : apiKeys.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "#9CA3AF" }}>
          <KeyOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography sx={{ fontSize: "0.88rem" }}>{t("pages.settings.api_keys.no_keys")}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {apiKeys.map((k) => (
            <Box key={k.id} sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "9px", bgcolor: k.isActive ? TEAL_BG : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <KeyOutlined sx={{ fontSize: 17, color: k.isActive ? TEAL : "#9CA3AF" }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{k.name}</Typography>
                  <Chip label={k.serviceName} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 600, bgcolor: "#F3F4F6", color: "#374151" }} />
                  <Chip
                    label={k.isActive ? t("pages.settings.api_keys.active") : t("pages.settings.api_keys.disabled_label")}
                    size="small"
                    sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: k.isActive ? "rgba(13,148,136,0.08)" : "#F3F4F6", color: k.isActive ? TEAL : "#9CA3AF" }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.6 }}>
                  {k.scopes.map((s) => <Chip key={s} label={s} size="small" sx={{ height: 17, fontSize: "0.6rem", bgcolor: "#EFF6FF", color: "#2563EB" }} />)}
                </Box>
                <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                  {k.keyPreview && <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{t("pages.settings.api_keys.key_preview", { preview: k.keyPreview })}</Typography>}
                  <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{t("pages.settings.api_keys.rate_limit_label", { count: k.rateLimit })}</Typography>
                  {k.expiresAt && <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{t("pages.settings.api_keys.expires_label", { date: fmtDate(k.expiresAt) })}</Typography>}
                  {k.lastUsed && <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{t("pages.settings.api_keys.last_used_label", { date: fmtDate(k.lastUsed) })}</Typography>}
                  <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                    {k.ipWhitelist && k.ipWhitelist.length > 0
                      ? t("pages.settings.api_keys.ips_label", { ips: k.ipWhitelist.join(", ") })
                      : `IPs: ${t("pages.settings.api_keys.ips_all")}`}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                <Tooltip title={k.isActive ? t("pages.settings.api_keys.toggle_disable") : t("pages.settings.api_keys.toggle_enable")}>
                  <Switch size="small" checked={k.isActive} onChange={() => handleToggle(k.id, k.isActive)}
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: TEAL }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: TEAL } }} />
                </Tooltip>
                <Tooltip title={t("pages.settings.api_keys.regenerate_tooltip")}>
                  <IconButton size="small" onClick={() => handleRegenerate(k.id)} sx={{ color: "#F59E0B", "&:hover": { bgcolor: "#FFFBEB" } }}>
                    <RefreshOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("pages.settings.api_keys.edit_tooltip")}>
                  <IconButton size="small" onClick={() => setEditingKey(k)} sx={{ color: TEAL, "&:hover": { bgcolor: TEAL_BG } }}>
                    <EditOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("pages.settings.api_keys.delete_tooltip")}>
                  <IconButton size="small" onClick={() => setDeleteTarget(k)} sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}>
                    <DeleteOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>{t("pages.settings.api_keys.create_title")}</DialogTitle>
        <Divider />
        <DialogForm
          fields={<>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.key_name")} />
              <TextField value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth placeholder={t("pages.settings.api_keys.fields.key_name_placeholder")} sx={fieldSx} />
            </Box>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.service_name")} />
              <TextField value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))} fullWidth placeholder={t("pages.settings.api_keys.fields.service_placeholder")} sx={fieldSx} />
            </Box>
            <Box><FieldLabel text={t("pages.settings.api_keys.fields.scopes")} /><ScopeChips /></Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <FieldLabel text={t("pages.settings.api_keys.fields.rate_limit")} />
                <TextField type="number" value={form.rateLimit} onChange={(e) => setForm((f) => ({ ...f, rateLimit: Number(e.target.value) }))} fullWidth inputProps={{ min: 1 }} sx={fieldSx} />
              </Box>
              <Box><FieldLabel text={t("pages.settings.api_keys.fields.expires_at")} />{datePicker(form.expiresAt, (v) => setForm((f) => ({ ...f, expiresAt: v })))}</Box>
            </Box>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.ip_whitelist")} />
              <ToggleButtonGroup exclusive size="small" value={form.ipMode} onChange={(_, v) => v && setForm((f) => ({ ...f, ipMode: v }))}
                sx={{ mb: 1, "& .MuiToggleButton-root": { textTransform: "none", fontFamily: "Poppins", fontSize: "0.78rem", fontWeight: 600, px: 2, borderRadius: "8px !important", "&.Mui-selected": { bgcolor: TEAL, color: "#fff", "&:hover": { bgcolor: "#0F766E" } } } }}>
                <ToggleButton value="all">{t("pages.settings.api_keys.fields.ip_all")}</ToggleButton>
                <ToggleButton value="custom">{t("pages.settings.api_keys.fields.ip_custom")}</ToggleButton>
              </ToggleButtonGroup>
              {form.ipMode === "custom" && (
                <TextField value={form.ipList} onChange={(e) => setForm((f) => ({ ...f, ipList: e.target.value }))}
                  fullWidth multiline minRows={2}
                  placeholder={t("pages.settings.api_keys.fields.ip_placeholder")}
                  helperText={t("pages.settings.api_keys.fields.ip_helper")}
                  sx={fieldSx} />
              )}
            </Box>
          </>}
        >
          <Button onClick={() => setCreateOpen(false)} size="small" sx={cancelBtnSx}>{t("pages.settings.api_keys.actions.cancel")}</Button>
          <Button onClick={handleCreate} size="small" disabled={creating || !form.name.trim()} sx={saveBtnSx}>
            {creating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : t("pages.settings.api_keys.actions.create")}
          </Button>
        </DialogForm>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingKey} onClose={() => setEditingKey(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>{t("pages.settings.api_keys.edit_title")}</DialogTitle>
        <Divider />
        <DialogForm
          fields={<>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.key_name")} />
              <TextField value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} fullWidth sx={fieldSx} />
            </Box>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.service_name")} />
              <TextField value={editForm.serviceName} onChange={(e) => setEditForm((f) => ({ ...f, serviceName: e.target.value }))} fullWidth sx={fieldSx} />
            </Box>
            <Box><FieldLabel text={t("pages.settings.api_keys.fields.scopes")} /><ScopeChips /></Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <FieldLabel text={t("pages.settings.api_keys.fields.rate_limit")} />
                <TextField type="number" value={editForm.rateLimit} onChange={(e) => setEditForm((f) => ({ ...f, rateLimit: Number(e.target.value) }))} fullWidth inputProps={{ min: 1 }} sx={fieldSx} />
              </Box>
              <Box><FieldLabel text={t("pages.settings.api_keys.fields.expires_at")} />{datePicker(editForm.expiresAt, (v) => setEditForm((f) => ({ ...f, expiresAt: v })))}</Box>
            </Box>
            <Box>
              <FieldLabel text={t("pages.settings.api_keys.fields.ip_whitelist")} />
              <ToggleButtonGroup exclusive size="small" value={editForm.ipMode} onChange={(_, v) => v && setEditForm((f) => ({ ...f, ipMode: v }))}
                sx={{ mb: 1, "& .MuiToggleButton-root": { textTransform: "none", fontFamily: "Poppins", fontSize: "0.78rem", fontWeight: 600, px: 2, borderRadius: "8px !important", "&.Mui-selected": { bgcolor: TEAL, color: "#fff", "&:hover": { bgcolor: "#0F766E" } } } }}>
                <ToggleButton value="all">{t("pages.settings.api_keys.fields.ip_all")}</ToggleButton>
                <ToggleButton value="custom">{t("pages.settings.api_keys.fields.ip_custom")}</ToggleButton>
              </ToggleButtonGroup>
              {editForm.ipMode === "custom" && (
                <TextField value={editForm.ipList} onChange={(e) => setEditForm((f) => ({ ...f, ipList: e.target.value }))}
                  fullWidth multiline minRows={2}
                  placeholder={t("pages.settings.api_keys.fields.ip_placeholder")}
                  helperText={t("pages.settings.api_keys.fields.ip_helper")}
                  sx={fieldSx} />
              )}
            </Box>
          </>}
        >
          <Button onClick={() => setEditingKey(null)} size="small" sx={cancelBtnSx}>{t("pages.settings.api_keys.actions.cancel")}</Button>
          <Button onClick={handleUpdate} size="small" disabled={!editForm.name.trim()} sx={saveBtnSx}>{t("pages.settings.api_keys.actions.save")}</Button>
        </DialogForm>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700, pb: 1 }}>{t("pages.settings.api_keys.delete_title")}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography sx={{ fontSize: "0.88rem", color: "#374151" }}>
            {t("pages.settings.api_keys.delete_confirm", { name: deleteTarget?.name })}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.75 }}>
            {t("pages.settings.api_keys.delete_warning")}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small" sx={cancelBtnSx}>{t("pages.settings.api_keys.actions.cancel")}</Button>
          <Button onClick={handleDelete} size="small"
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#EF4444", color: "#fff", borderRadius: "9px", px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#DC2626", boxShadow: "none" } }}>
            {t("pages.settings.api_keys.actions.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
