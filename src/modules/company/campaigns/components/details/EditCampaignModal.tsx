"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, ToggleButtonGroup, ToggleButton,
  CircularProgress, IconButton,
} from "@mui/material";
import CloseOutlined         from "@mui/icons-material/CloseOutlined";
import EditOutlined          from "@mui/icons-material/EditOutlined";
import LockOutlined          from "@mui/icons-material/LockOutlined";
import LockOpenOutlined      from "@mui/icons-material/LockOpenOutlined";
import LinkOutlined          from "@mui/icons-material/LinkOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";
import AppButton             from "@/components/ui/AppButton";
import { Campaign, ModuleType } from "@/types/campaign";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateCampaign } from "@/store/slices/campaignSlice";
import { MODULE_CONFIG } from "@/constants/campaign";
import { useTranslation, Trans } from "react-i18next";

const PURPLE = "#8310FF";

const MODULE_TYPES: ModuleType[] = ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"];

interface Props {
  open: boolean;
  campaign: Campaign;
  onClose: () => void;
  onSaved: (updated: Campaign) => void;
}

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 0.75 }}>
    {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
  </Typography>
);

const EditCampaignModal: React.FC<Props> = ({ open, campaign, onClose, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("dashboard");
  const m = "pages.campaigns.detail.edit_modal";

  const [title,         setTitle]         = useState("");
  const [description,   setDescription]   = useState("");
  const [deadline,      setDeadline]       = useState("");
  const [anonymityMode, setAnonymityMode]  = useState<Campaign["anonymityMode"]>("NOMINATIVE");
  const [accessMethod,  setAccessMethod]   = useState<Campaign["accessMethod"]>("ACCOUNTS");
  const [moduleType,    setModuleType]     = useState<ModuleType>("QUESTIONNAIRE");
  const [saving,        setSaving]         = useState(false);
  const [error,         setError]          = useState<string | null>(null);

  const originalModuleType = campaign.module?.type;
  const moduleChanged = moduleType !== originalModuleType;

  useEffect(() => {
    if (open) {
      setTitle(campaign.title ?? "");
      setDescription(campaign.description ?? "");
      setDeadline(campaign.deadline ? campaign.deadline.slice(0, 10) : "");
      setAnonymityMode(campaign.anonymityMode ?? "NOMINATIVE");
      setAccessMethod(campaign.accessMethod ?? "ACCOUNTS");
      setModuleType(campaign.module?.type ?? "QUESTIONNAIRE");
      setError(null);
    }
  }, [open, campaign]);

  const handleSave = async () => {
    if (!title.trim()) { setError(t(`${m}.error_title_required`)); return; }
    setSaving(true);
    setError(null);
    try {
      const result = await dispatch(updateCampaign({
        campaignId: campaign._id,
        updatePayload: {
          title:        title.trim(),
          description:  description.trim() || undefined,
          deadline:     deadline || undefined,
          anonymityMode,
          accessMethod,
          // If module type changed, reset config to null
          module: moduleChanged
            ? { type: moduleType, config: null }
            : campaign.module,
        },
      }));
      if (updateCampaign.fulfilled.match(result)) {
        onSaved(result.payload);
        onClose();
      } else {
        setError((result.payload as string) || t(`${m}.error_save_failed`));
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleSx = {
    borderRadius: "10px !important",
    border: "1px solid #E5E7EB !important",
    px: 1.5, py: 0.875,
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#6B7280",
    gap: 0.625,
    "&.Mui-selected": {
      bgcolor: `${PURPLE}10 !important`,
      borderColor: `${PURPLE}40 !important`,
      color: PURPLE,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.13)" } } }}
    >
      {/* Title bar */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            bgcolor: `${PURPLE}10`, border: `1px solid ${PURPLE}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <EditOutlined sx={{ fontSize: 17, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>{t(`${m}.title`)}</Typography>
            <Typography sx={{ fontSize: "11px", color: "#94A3B8" }}>{t(`${m}.subtitle`)}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94A3B8" }}>
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Title */}
          <Box>
            <FieldLabel label={t(`${m}.title_label`)} required />
            <TextField
              fullWidth size="small" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(`${m}.title_placeholder`)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13.5px" } }}
            />
          </Box>

          {/* Description */}
          <Box>
            <FieldLabel label={t(`${m}.description_label`)} />
            <TextField
              fullWidth size="small" multiline minRows={2} maxRows={4}
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder={t(`${m}.description_placeholder`)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } }}
            />
          </Box>

          {/* Deadline */}
          <Box>
            <FieldLabel label={t(`${m}.deadline_label`)} />
            <TextField
              fullWidth size="small" type="date" value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              inputProps={{ min: new Date().toISOString().slice(0, 10) }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } }}
            />
          </Box>

          {/* Module type */}
          <Box>
            <FieldLabel label={t(`${m}.module_type_label`)} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {MODULE_TYPES.map((mt) => {
                const cfg        = MODULE_CONFIG[mt];
                const Icon       = cfg.icon;
                const selected   = moduleType === mt;
                const moduleTitle = t(`pages.campaigns.module.${mt}`);
                const comingSoon = mt === "TRAINING_PATH";
                return (
                  <Box
                    key={mt}
                    onClick={() => { if (!comingSoon) setModuleType(mt); }}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.25,
                      px: 1.5, py: 1.125, borderRadius: "12px",
                      cursor: comingSoon ? "not-allowed" : "pointer",
                      border: `1.5px solid ${selected ? cfg.color + "50" : "#E5E7EB"}`,
                      bgcolor: selected ? `${cfg.color}08` : "#FAFAFA",
                      opacity: comingSoon ? 0.5 : 1,
                      transition: "all 0.15s",
                      ...(!comingSoon && { "&:hover": { borderColor: `${cfg.color}40`, bgcolor: `${cfg.color}06` } }),
                    }}
                  >
                    <Box sx={{
                      width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                      bgcolor: selected ? `${cfg.color}15` : "#F3F4F6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: 15, color: selected ? cfg.color : "#9CA3AF" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: selected ? "#111827" : "#6B7280", lineHeight: 1.2 }}>
                        {moduleTitle}
                      </Typography>
                      {comingSoon && (
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {t(`${m}.coming_soon`)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Warning when module type changes */}
            {moduleChanged && (
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1,
                mt: 1.25, px: 1.5, py: 1, borderRadius: "8px",
                bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
              }}>
                <WarningAmberOutlined sx={{ fontSize: 14, color: "#D97706", flexShrink: 0, mt: "1px" }} />
                <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.5 }}>
                  <Trans i18nKey="pages.campaigns.detail.edit_modal.module_change_warning" components={{ strong: <strong /> }} />
                </Typography>
              </Box>
            )}
          </Box>

          {/* Anonymity mode */}
          <Box>
            <FieldLabel label={t(`${m}.anonymity_label`)} />
            <ToggleButtonGroup
              exclusive value={anonymityMode}
              onChange={(_, v) => v && setAnonymityMode(v)}
              sx={{ gap: 1, "& .MuiToggleButtonGroup-grouped": { mr: 0 } }}
            >
              <ToggleButton value="NOMINATIVE" sx={toggleSx}>
                <LockOpenOutlined sx={{ fontSize: 14 }} />
                {t(`pages.campaigns.detail.nominative`)}
              </ToggleButton>
              <ToggleButton value="ANONYMOUS" sx={toggleSx}>
                <LockOutlined sx={{ fontSize: 14 }} />
                {t(`pages.campaigns.detail.anonymous`)}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Access method */}
          <Box>
            <FieldLabel label={t(`${m}.access_method_label`)} />
            <ToggleButtonGroup
              exclusive value={accessMethod}
              onChange={(_, v) => v && setAccessMethod(v)}
              sx={{ gap: 1, "& .MuiToggleButtonGroup-grouped": { mr: 0 } }}
            >
              <ToggleButton value="ACCOUNTS" sx={toggleSx}>
                <AccountCircleOutlined sx={{ fontSize: 14 }} />
                {t(`${m}.accounts_only`)}
              </ToggleButton>
              <ToggleButton value="LINK" sx={toggleSx}>
                <LinkOutlined sx={{ fontSize: 14 }} />
                {t(`${m}.public_link`)}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Error */}
          {error && (
            <Typography sx={{ fontSize: "12px", color: "#EF4444", bgcolor: "#FEF2F2", px: 1.5, py: 1, borderRadius: "8px", border: "1px solid #FECACA" }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <AppButton label={t(`${m}.cancel`)} variant="outlined" size="medium" onClick={onClose} disabled={saving} />
        <AppButton
          label={saving ? t(`${m}.saving`) : t(`${m}.save`)}
          variant="contained"
          size="medium"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : undefined}
        />
      </DialogActions>
    </Dialog>
  );
};

export default EditCampaignModal;
