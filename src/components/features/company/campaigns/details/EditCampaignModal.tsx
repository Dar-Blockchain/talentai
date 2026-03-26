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
import MergeTypeOutlined     from "@mui/icons-material/MergeTypeOutlined";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";
import AppButton             from "@/components/ui/AppButton";
import { Campaign, ModuleType } from "@/types/campaign";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateCampaign } from "@/store/slices/campaignSlice";
import { MODULE_CONFIG } from "@/constants/campaign";

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
    if (!title.trim()) { setError("Title is required."); return; }
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
        setError((result.payload as string) || "Failed to save changes.");
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
            <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>Edit Campaign</Typography>
            <Typography sx={{ fontSize: "11px", color: "#94A3B8" }}>Only available while the campaign is in Draft</Typography>
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
            <FieldLabel label="Title" required />
            <TextField
              fullWidth size="small" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign title"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13.5px" } }}
            />
          </Box>

          {/* Description */}
          <Box>
            <FieldLabel label="Description" />
            <TextField
              fullWidth size="small" multiline minRows={2} maxRows={4}
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } }}
            />
          </Box>

          {/* Deadline */}
          <Box>
            <FieldLabel label="Deadline" />
            <TextField
              fullWidth size="small" type="date" value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              inputProps={{ min: new Date().toISOString().slice(0, 10) }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } }}
            />
          </Box>

          {/* Module type */}
          <Box>
            <FieldLabel label="Module Type" />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {MODULE_TYPES.map((mt) => {
                const cfg      = MODULE_CONFIG[mt];
                const Icon     = cfg.icon;
                const selected = moduleType === mt;
                return (
                  <Box
                    key={mt}
                    onClick={() => setModuleType(mt)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.25,
                      px: 1.5, py: 1.125, borderRadius: "12px", cursor: "pointer",
                      border: `1.5px solid ${selected ? cfg.color + "50" : "#E5E7EB"}`,
                      bgcolor: selected ? `${cfg.color}08` : "#FAFAFA",
                      transition: "all 0.15s",
                      "&:hover": { borderColor: `${cfg.color}40`, bgcolor: `${cfg.color}06` },
                    }}
                  >
                    <Box sx={{
                      width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                      bgcolor: selected ? `${cfg.color}15` : "#F3F4F6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon sx={{ fontSize: 15, color: selected ? cfg.color : "#9CA3AF" }} />
                    </Box>
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: selected ? "#111827" : "#6B7280", lineHeight: 1.2 }}>
                      {cfg.label}
                    </Typography>
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
                  Changing the module type will <strong>reset the current configuration</strong>. You'll need to reconfigure it after saving.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Anonymity mode */}
          <Box>
            <FieldLabel label="Anonymity" />
            <ToggleButtonGroup
              exclusive value={anonymityMode}
              onChange={(_, v) => v && setAnonymityMode(v)}
              sx={{ gap: 1, "& .MuiToggleButtonGroup-grouped": { mr: 0 } }}
            >
              <ToggleButton value="NOMINATIVE" sx={toggleSx}>
                <LockOpenOutlined sx={{ fontSize: 14 }} />
                Nominative
              </ToggleButton>
              <ToggleButton value="ANONYMOUS" sx={toggleSx}>
                <LockOutlined sx={{ fontSize: 14 }} />
                Anonymous
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Access method */}
          <Box>
            <FieldLabel label="Access Method" />
            <ToggleButtonGroup
              exclusive value={accessMethod}
              onChange={(_, v) => v && setAccessMethod(v)}
              sx={{ gap: 1, "& .MuiToggleButtonGroup-grouped": { mr: 0 } }}
            >
              <ToggleButton value="ACCOUNTS" sx={toggleSx}>
                <AccountCircleOutlined sx={{ fontSize: 14 }} />
                Accounts Only
              </ToggleButton>
              <ToggleButton value="LINK" sx={toggleSx}>
                <LinkOutlined sx={{ fontSize: 14 }} />
                Public Link
              </ToggleButton>
              <ToggleButton value="BOTH" sx={toggleSx}>
                <MergeTypeOutlined sx={{ fontSize: 14 }} />
                Both
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
        <AppButton label="Cancel" variant="outlined" size="small" onClick={onClose} disabled={saving} />
        <AppButton
          label={saving ? "Saving…" : "Save Changes"}
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : undefined}
        />
      </DialogActions>
    </Dialog>
  );
};

export default EditCampaignModal;
