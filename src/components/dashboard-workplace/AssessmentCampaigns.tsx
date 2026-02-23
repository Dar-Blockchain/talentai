import React, { memo, useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Alert,
  Skeleton,
  Drawer,
  Divider,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import GroupAddOutlined from "@mui/icons-material/GroupAddOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchCampaigns,
  fetchCampaignById,
  createCampaign,
  deleteCampaign,
  clearCreateStatus,
  clearSelectedCampaign,
  selectCampaigns,
  selectCampaignLoading,
  selectCampaignCreating,
  selectCreateSuccess,
  selectCreateError,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
  Campaign,
  CampaignType,
  AnonymityMode,
  AccessMethod,
  ModuleType,
} from "@/store/slices/campaignSlice";
import {
  fetchParticipants,
  addParticipant,
  addAnonymousParticipant,
  bulkAddParticipants,
  removeParticipant,
  clearAddStatus,
  selectParticipants,
  selectParticipantsLoading,
  selectParticipantAdding,
  selectParticipantAddError,
  selectParticipantAddSuccess,
  Participant,
  generateAnonymousToken,
} from "@/store/slices/participantSlice";
import { fetchMembers, selectMembers, Member } from "@/store/slices/memberSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CampaignType, string> = {
  PRODUCTIVITY_DIAGNOSTIC: "Productivity Diagnostic",
  SKILLS_MAPPING: "Skills Mapping",
  ENABLEMENT: "Enablement",
  CUSTOM: "Custom",
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  DRAFT: { bg: "#F9FAFB", fg: "#6B7280" },
  ACTIVE: { bg: "#F0FDF4", fg: "#16A34A" },
  PAUSED: { bg: "#FFFBEB", fg: "#D97706" },
  CLOSED: { bg: "#EFF6FF", fg: "#2563EB" },
  EXPIRED: { bg: "#FEF2F2", fg: "#DC2626" },
};

const TYPE_COLORS: Record<CampaignType, { bg: string; fg: string; border: string }> = {
  PRODUCTIVITY_DIAGNOSTIC: { bg: "#EFF6FF", fg: "#2563EB", border: "#BFDBFE" },
  SKILLS_MAPPING: { bg: "#F0FDFA", fg: "#0D9488", border: "#99F6E4" },
  ENABLEMENT: { bg: "#F5F3FF", fg: "#7C3AED", border: "#DDD6FE" },
  CUSTOM: { bg: "#FFF7ED", fg: "#C2410C", border: "#FED7AA" },
};

const MODULE_TYPES: ModuleType[] = [
  "QUESTIONNAIRE",
  "AI_INTERVIEW",
  "SKILL_TEST",
  "TRAINING_PATH",
];

const MODULE_LABELS: Record<ModuleType, string> = {
  QUESTIONNAIRE: "Questionnaire",
  AI_INTERVIEW: "AI Interview",
  SKILL_TEST: "Skill Test",
  TRAINING_PATH: "Training Path",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const daysLeft = (deadline?: string) => {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
};

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ─── Create Campaign Modal ────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

const INITIAL_FORM = {
  title: "",
  type: "" as CampaignType | "",
  description: "",
  anonymityMode: "" as AnonymityMode | "",
  accessMethod: "" as AccessMethod | "",
  targetDepartment: "",
  deadline: "",
  modules: [] as ModuleType[],
};

const CreateCampaignModal: React.FC<CreateModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const creating = useSelector(selectCampaignCreating);
  const createSuccess = useSelector(selectCreateSuccess);
  const createError = useSelector(selectCreateError);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (createSuccess) {
      dispatch(clearCreateStatus());
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    }
  }, [createSuccess, dispatch, onClose]);

  const handleChange = useCallback((field: keyof typeof INITIAL_FORM, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const toggleModule = useCallback((mod: ModuleType) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter((m) => m !== mod)
        : [...prev.modules, mod],
    }));
    setErrors((prev) => ({ ...prev, modules: "" }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.type) e.type = "Campaign type is required";
    if (!form.anonymityMode) e.anonymityMode = "Anonymity mode is required";
    if (!form.accessMethod) e.accessMethod = "Access method is required";
    if (form.modules.length === 0) e.modules = "Select at least one module";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    dispatch(
      createCampaign({
        title: form.title.trim(),
        type: form.type as CampaignType,
        description: form.description.trim() || undefined,
        anonymityMode: form.anonymityMode as AnonymityMode,
        accessMethod: form.accessMethod as AccessMethod,
        targetDepartment: form.targetDepartment.trim() || undefined,
        deadline: form.deadline || undefined,
        modules: form.modules.map((type, i) => ({ type, config: {}, order: i + 1 })),
      })
    );
  };

  const handleClose = () => {
    if (creating) return;
    dispatch(clearCreateStatus());
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, bgcolor: "#F0FDFA", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AssignmentTurnedInOutlined sx={{ fontSize: 20, color: "#0D9488" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>New Assessment Campaign</Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Set up an AI-powered assessment for your team</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={creating}>
          <CloseOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {createError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{createError}</Alert>
        )}

        {/* Title */}
        <TextField
          label="Campaign Title"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
          size="small"
          placeholder="e.g. Q2 Technical Skills Assessment"
          slotProps={{ formHelperText: { sx: { ml: 0 } } }}
        />

        {/* Type */}
        <FormControl fullWidth size="small" error={!!errors.type}>
          <InputLabel>Campaign Type</InputLabel>
          <Select
            value={form.type}
            label="Campaign Type"
            onChange={(e) => handleChange("type", e.target.value)}
          >
            {(Object.keys(TYPE_LABELS) as CampaignType[]).map((t) => (
              <MenuItem key={t} value={t} sx={{ fontSize: "13px" }}>
                {TYPE_LABELS[t]}
              </MenuItem>
            ))}
          </Select>
          {errors.type && <FormHelperText sx={{ ml: 0 }}>{errors.type}</FormHelperText>}
        </FormControl>

        {/* Description */}
        <TextField
          label="Description (optional)"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
          placeholder="Briefly describe the campaign goals..."
        />

        {/* Modules */}
        <Box>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>
            Modules <span style={{ color: "#EF4444" }}>*</span>
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {MODULE_TYPES.map((mod) => {
              const selected = form.modules.includes(mod);
              return (
                <Chip
                  key={mod}
                  label={MODULE_LABELS[mod]}
                  onClick={() => toggleModule(mod)}
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    bgcolor: selected ? "#0D9488" : "#F3F4F6",
                    color: selected ? "#fff" : "#374151",
                    border: selected ? "1px solid #0D9488" : "1px solid transparent",
                    "&:hover": { bgcolor: selected ? "#0b7a6f" : "#E5E7EB" },
                  }}
                />
              );
            })}
          </Box>
          {errors.modules && (
            <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5 }}>{errors.modules}</Typography>
          )}
        </Box>

        {/* Anonymity + Access */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <FormControl fullWidth size="small" error={!!errors.anonymityMode}>
            <InputLabel>Anonymity Mode</InputLabel>
            <Select
              value={form.anonymityMode}
              label="Anonymity Mode"
              onChange={(e) => handleChange("anonymityMode", e.target.value)}
            >
              <MenuItem value="ANONYMOUS" sx={{ fontSize: "13px" }}>Anonymous</MenuItem>
              <MenuItem value="NOMINATIVE" sx={{ fontSize: "13px" }}>Nominative</MenuItem>
            </Select>
            {errors.anonymityMode && <FormHelperText sx={{ ml: 0 }}>{errors.anonymityMode}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth size="small" error={!!errors.accessMethod}>
            <InputLabel>Access Method</InputLabel>
            <Select
              value={form.accessMethod}
              label="Access Method"
              onChange={(e) => handleChange("accessMethod", e.target.value)}
            >
              <MenuItem value="LINK" sx={{ fontSize: "13px" }}>Link</MenuItem>
              <MenuItem value="ACCOUNTS" sx={{ fontSize: "13px" }}>Accounts</MenuItem>
              <MenuItem value="BOTH" sx={{ fontSize: "13px" }}>Both</MenuItem>
            </Select>
            {errors.accessMethod && <FormHelperText sx={{ ml: 0 }}>{errors.accessMethod}</FormHelperText>}
          </FormControl>
        </Box>

        {/* Department + Deadline */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Target Department (optional)"
            value={form.targetDepartment}
            onChange={(e) => handleChange("targetDepartment", e.target.value)}
            size="small"
            placeholder="e.g. Engineering"
          />
          <TextField
            label="Deadline (optional)"
            value={form.deadline}
            onChange={(e) => handleChange("deadline", e.target.value)}
            size="small"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={creating}
          sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={creating}
          startIcon={creating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CheckCircleOutlined sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, bgcolor: "#0D9488", color: "#fff", px: 3, "&:hover": { bgcolor: "#0b7a6f" }, "&:disabled": { bgcolor: "#9CA3AF" } }}
        >
          {creating ? "Creating…" : "Create Campaign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Campaign Detail Drawer ───────────────────────────────────────────────────

const MODULE_ICONS: Record<ModuleType, React.ElementType> = {
  QUESTIONNAIRE: DescriptionOutlined,
  AI_INTERVIEW: PsychologyOutlined,
  SKILL_TEST: AssignmentTurnedInOutlined,
  TRAINING_PATH: PeopleOutlined,
};

const MODULE_COLORS: Record<ModuleType, { bg: string; fg: string }> = {
  QUESTIONNAIRE: { bg: "#EFF6FF", fg: "#2563EB" },
  AI_INTERVIEW: { bg: "#F0FDFA", fg: "#0D9488" },
  SKILL_TEST: { bg: "#F5F3FF", fg: "#7C3AED" },
  TRAINING_PATH: { bg: "#FFF7ED", fg: "#C2410C" },
};

interface DetailDrawerProps {
  open: boolean;
  campaignId: string | null;
  onClose: () => void;
  onDeleteRequest: (id: string, title: string) => void;
}

// ─── Participant Status Config ─────────────────────────────────────────────────

const PSTATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  INVITED:     { bg: "#EFF6FF", fg: "#2563EB" },
  IN_PROGRESS: { bg: "#FFFBEB", fg: "#D97706" },
  COMPLETED:   { bg: "#F0FDF4", fg: "#16A34A" },
  DROPPED:     { bg: "#FEF2F2", fg: "#DC2626" },
};

// ─── Add Participant Modal ─────────────────────────────────────────────────────

interface AddParticipantModalProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({ open, campaignId, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const adding = useSelector(selectParticipantAdding);
  const addSuccess = useSelector(selectParticipantAddSuccess);
  const addError = useSelector(selectParticipantAddError);
  const { members, loading: membersLoading } = useSelector(selectMembers);
  const existingParticipants = useSelector(selectParticipants(campaignId));

  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBulk, setSelectedBulk] = useState<Member[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(fetchMembers());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (addSuccess) {
      dispatch(clearAddStatus());
      setSelectedMember(null); setSelectedBulk([]); setErr("");
      onClose();
    }
  }, [addSuccess, dispatch, onClose]);

  const handleClose = () => {
    if (adding) return;
    dispatch(clearAddStatus());
    setSelectedMember(null); setSelectedBulk([]); setErr("");
    onClose();
  };

  const toggleBulkMember = (member: Member) => {
    setSelectedBulk((prev) =>
      prev.some((m) => m._id === member._id)
        ? prev.filter((m) => m._id !== member._id)
        : [...prev, member]
    );
  };

  const handleSubmit = () => {
    setErr("");
    if (mode === "single") {
      if (!selectedMember) return setErr("Please select a member");
      dispatch(addParticipant({
        campaignId,
        email: selectedMember.user.email,
        employeeId: selectedMember.user._id,
        anonymousToken: generateAnonymousToken(),
      }));
    } else {
      if (selectedBulk.length === 0) return setErr("Select at least one member");
      dispatch(bulkAddParticipants({
        campaignId,
        participants: selectedBulk.map((m) => ({
          email: m.user.email,
          employeeId: m.user._id,
          anonymousToken: generateAnonymousToken(),
        })),
      }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, bgcolor: "#F0FDFA", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GroupAddOutlined sx={{ fontSize: 20, color: "#0D9488" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Add Participants</Typography>
            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>Invite people to this campaign</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={adding}>
          <CloseOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {addError && <Alert severity="error" sx={{ borderRadius: 2 }}>{addError}</Alert>}
        {err && <Alert severity="warning" sx={{ borderRadius: 2 }}>{err}</Alert>}

        {/* Mode toggle */}
        <Box sx={{ display: "flex", bgcolor: "#F3F4F6", borderRadius: 2, p: 0.5, gap: 0.5 }}>
          {(["single", "bulk"] as const).map((m) => (
            <Box
              key={m}
              onClick={() => setMode(m)}
              sx={{
                flex: 1, textAlign: "center", py: 0.8, borderRadius: 1.5, cursor: "pointer",
                bgcolor: mode === m ? "#fff" : "transparent",
                boxShadow: mode === m ? 1 : 0,
                fontSize: "13px", fontWeight: 600,
                color: mode === m ? "#111827" : "#6B7280",
                transition: "all 0.15s",
              }}
            >
              {m === "single" ? "Single" : "Bulk Import"}
            </Box>
          ))}
        </Box>

        {/* Single — member list */}
        {mode === "single" && (
          <Box>
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", mb: 1, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Select a member
            </Typography>
            {membersLoading ? (
              [1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, mb: 0.5, borderRadius: 2, bgcolor: "#F9FAFB" }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rectangular" height={13} width="50%" sx={{ borderRadius: 1, mb: 0.5 }} />
                    <Skeleton variant="rectangular" height={11} width="70%" sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              ))
            ) : members.length === 0 ? (
              <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <PersonOutlined sx={{ fontSize: 28, color: "#D1D5DB" }} />
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No members found</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.5, pr: 0.5 }}>
                {members.map((member: Member) => {
                  const isSelected = selectedMember?._id === member._id;
                  const alreadyAdded = existingParticipants.some(
                    (p) => p.email === member.user.email
                  );
                  const initials = (member.user.username || member.user.email)[0].toUpperCase();
                  return (
                    <Box
                      key={member._id}
                      onClick={() => !alreadyAdded && setSelectedMember(isSelected ? null : member)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.5, p: 1.2,
                        borderRadius: 2,
                        cursor: alreadyAdded ? "default" : "pointer",
                        border: `1px solid ${alreadyAdded ? "#D1FAE5" : isSelected ? "#0D9488" : "#E5E7EB"}`,
                        bgcolor: alreadyAdded ? "#F0FDF4" : isSelected ? "#F0FDFA" : "#F9FAFB",
                        opacity: alreadyAdded ? 0.75 : 1,
                        "&:hover": !alreadyAdded ? { bgcolor: isSelected ? "#CCFBF1" : "#F3F4F6" } : {},
                        transition: "all 0.15s",
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alreadyAdded ? "#D1FAE5" : isSelected ? "#0D9488" : "#E5E7EB", color: alreadyAdded ? "#16A34A" : isSelected ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 700 }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.user.username}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.user.email}
                        </Typography>
                      </Box>
                      {alreadyAdded ? (
                        <Chip
                          label="Added"
                          size="small"
                          sx={{ bgcolor: "#D1FAE5", color: "#16A34A", fontSize: "10px", fontWeight: 700, height: 20, flexShrink: 0 }}
                        />
                      ) : isSelected ? (
                        <CheckCircleOutlined sx={{ fontSize: 18, color: "#0D9488", flexShrink: 0 }} />
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* Bulk — multi-select member list */}
        {mode === "bulk" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8 }}>
                Select members
              </Typography>
              {selectedBulk.length > 0 && (
                <Chip
                  label={`${selectedBulk.length} selected`}
                  size="small"
                  sx={{ bgcolor: "#F0FDFA", color: "#0D9488", fontSize: "10px", fontWeight: 700, height: 20 }}
                />
              )}
            </Box>
            {membersLoading ? (
              [1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, mb: 0.5, borderRadius: 2, bgcolor: "#F9FAFB" }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="rectangular" height={13} width="50%" sx={{ borderRadius: 1, mb: 0.5 }} />
                    <Skeleton variant="rectangular" height={11} width="70%" sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              ))
            ) : members.length === 0 ? (
              <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <PersonOutlined sx={{ fontSize: 28, color: "#D1D5DB" }} />
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>No members found</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.5, pr: 0.5 }}>
                {members.map((member: Member) => {
                  const alreadyAdded = existingParticipants.some((p) => p.email === member.user.email);
                  const isChecked = selectedBulk.some((m) => m._id === member._id);
                  const initials = (member.user.username || member.user.email)[0].toUpperCase();
                  return (
                    <Box
                      key={member._id}
                      onClick={() => !alreadyAdded && toggleBulkMember(member)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.5, p: 1.2,
                        borderRadius: 2,
                        cursor: alreadyAdded ? "default" : "pointer",
                        border: `1px solid ${alreadyAdded ? "#D1FAE5" : isChecked ? "#0D9488" : "#E5E7EB"}`,
                        bgcolor: alreadyAdded ? "#F0FDF4" : isChecked ? "#F0FDFA" : "#F9FAFB",
                        opacity: alreadyAdded ? 0.75 : 1,
                        "&:hover": !alreadyAdded ? { bgcolor: isChecked ? "#CCFBF1" : "#F3F4F6" } : {},
                        transition: "all 0.15s",
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alreadyAdded ? "#D1FAE5" : isChecked ? "#0D9488" : "#E5E7EB", color: alreadyAdded ? "#16A34A" : isChecked ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 700 }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.user.username}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.user.email}
                        </Typography>
                      </Box>
                      {alreadyAdded ? (
                        <Chip label="Added" size="small" sx={{ bgcolor: "#D1FAE5", color: "#16A34A", fontSize: "10px", fontWeight: 700, height: 20, flexShrink: 0 }} />
                      ) : (
                        <Box sx={{
                          width: 18, height: 18, borderRadius: "4px", flexShrink: 0,
                          border: `2px solid ${isChecked ? "#0D9488" : "#D1D5DB"}`,
                          bgcolor: isChecked ? "#0D9488" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isChecked && <CheckCircleOutlined sx={{ fontSize: 13, color: "#fff" }} />}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={adding} sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", flex: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={adding || (mode === "single" && !selectedMember) || (mode === "bulk" && selectedBulk.length === 0)}
          startIcon={adding ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <GroupAddOutlined sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, bgcolor: "#0D9488", color: "#fff", flex: 1, "&:hover": { bgcolor: "#0b7a6f" }, "&:disabled": { bgcolor: "#9CA3AF" } }}
        >
          {adding ? "Adding…" : mode === "single" ? "Add" : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Participants Panel ────────────────────────────────────────────────────────

const ParticipantsPanel: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const participants = useSelector(selectParticipants(campaignId));
  const loading = useSelector(selectParticipantsLoading(campaignId));
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchParticipants(campaignId));
  }, [campaignId, dispatch]);

  const handleRemove = async (participantId: string) => {
    setRemoving(participantId);
    await dispatch(removeParticipant({ campaignId, participantId }));
    setRemoving(null);
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
            Participants
            {!loading && (
              <Box component="span" sx={{ ml: 1, px: 1, py: 0.3, bgcolor: "#F3F4F6", borderRadius: 5, fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>
                {participants.length}
              </Box>
            )}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Manage who is invited to this campaign</Typography>
        </Box>
        <Button
          size="small"
          startIcon={<GroupAddOutlined sx={{ fontSize: 15 }} />}
          onClick={() => setAddOpen(true)}
          sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "12px", fontWeight: 700, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}
        >
          Add
        </Button>
      </Box>

      {/* List */}
      {loading ? (
        [1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: 2 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={14} width="60%" sx={{ borderRadius: 1, mb: 0.5 }} />
              <Skeleton variant="rectangular" height={11} width="30%" sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        ))
      ) : participants.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, bgcolor: "#F0FDFA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PersonOutlined sx={{ fontSize: 24, color: "#0D9488" }} />
          </Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>No participants yet</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>Add participants to start the campaign</Typography>
          <Button size="small" onClick={() => setAddOpen(true)} startIcon={<GroupAddOutlined sx={{ fontSize: 15 }} />}
            sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "12px", fontWeight: 700, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}>
            Add Participants
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {participants.map((p: Participant) => {
            const sc = PSTATUS_COLORS[p.status] || PSTATUS_COLORS.INVITED;
            const label = p.email || p.anonymousToken?.slice(0, 12) + "…" || p.employee || "Unknown";
            const initials = (p.email || "?")[0].toUpperCase();
            const isRemoving = removing === p._id;
            return (
              <Box key={p._id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: sc.bg, color: sc.fg, fontSize: "13px", fontWeight: 700 }}>
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
                    <Chip label={p.status} size="small" sx={{ bgcolor: sc.bg, color: sc.fg, fontSize: "9px", fontWeight: 700, height: 18, textTransform: "uppercase", letterSpacing: 0.5 }} />
                    {p.createdAt && (
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                        {fmtDate(p.createdAt)}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  disabled={isRemoving}
                  onClick={() => handleRemove(p._id)}
                  sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}
                >
                  {isRemoving ? <CircularProgress size={14} sx={{ color: "#EF4444" }} /> : <DeleteOutlined sx={{ fontSize: 16 }} />}
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}

      <AddParticipantModal open={addOpen} campaignId={campaignId} onClose={() => setAddOpen(false)} />
    </Box>
  );
};

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

const CampaignDetailDrawer: React.FC<DetailDrawerProps> = ({ open, campaignId, onClose, onDeleteRequest }) => {
  const dispatch = useDispatch<AppDispatch>();
  const campaign = useSelector(selectSelectedCampaign);
  const loading = useSelector(selectDetailLoading);
  const error = useSelector(selectDetailError);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && campaignId) {
      dispatch(fetchCampaignById(campaignId));
      setActiveTab(0);
    }
    return () => {
      if (!open) dispatch(clearSelectedCampaign());
    };
  }, [open, campaignId, dispatch]);

  const handleCopyLink = useCallback(() => {
    if (!campaign?.linkToken) return;
    const link = `${window.location.origin}/assessment/${campaign.linkToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [campaign?.linkToken]);

  const sc = campaign ? STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT : STATUS_COLORS.DRAFT;
  const tc = campaign ? TYPE_COLORS[campaign.type] || TYPE_COLORS.CUSTOM : TYPE_COLORS.CUSTOM;
  const remaining = campaign ? daysLeft(campaign.deadline) : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" } } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          {campaign?.title || "Campaign Details"}
        </Typography>
        <IconButton onClick={onClose} size="small"><CloseOutlined sx={{ fontSize: 18, color: "#6B7280" }} /></IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          px: 2, borderBottom: "1px solid #E5E7EB", flexShrink: 0, minHeight: 40,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "13px", minHeight: 40, py: 1 },
          "& .Mui-selected": { color: "#0D9488" },
          "& .MuiTabs-indicator": { bgcolor: "#0D9488" },
        }}
      >
        <Tab label="Details" />
        <Tab label="Participants" />
      </Tabs>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {/* Participants Tab */}
        {activeTab === 1 && campaignId && <ParticipantsPanel campaignId={campaignId} />}

        {/* Details Tab */}
        {activeTab === 0 && loading && (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rectangular" height={28} width="70%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={20} width="40%" sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          </Box>
        )}

        {activeTab === 0 && error && !loading && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {activeTab === 0 && campaign && !loading && (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Title + Status */}
            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                <Chip
                  label={campaign.status}
                  size="small"
                  sx={{ bgcolor: sc.bg, color: sc.fg, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 24 }}
                />
                <Chip
                  label={TYPE_LABELS[campaign.type]}
                  size="small"
                  sx={{ bgcolor: tc.bg, color: tc.fg, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 24, border: `1px solid ${tc.border}` }}
                />
              </Box>
              <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                {campaign.title}
              </Typography>
              {campaign.description && (
                <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 1, lineHeight: 1.6 }}>
                  {campaign.description}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Key Info Grid */}
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
                Campaign Info
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {[
                  { icon: LockOutlined, label: "Anonymity", value: campaign.anonymityMode === "ANONYMOUS" ? "Anonymous" : "Nominative" },
                  { icon: VpnKeyOutlined, label: "Access Method", value: campaign.accessMethod },
                  { icon: BusinessOutlined, label: "Department", value: campaign.targetDepartment || "All departments" },
                  { icon: PeopleOutlined, label: "Target Count", value: campaign.targetEmployeeCount ? `${campaign.targetEmployeeCount} employees` : "No limit" },
                  { icon: CalendarTodayOutlined, label: "Created", value: fmtDate(campaign.createdAt) },
                  { icon: CalendarTodayOutlined, label: "Last Updated", value: fmtDate(campaign.updatedAt) },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: 2 }}>
                    <item.icon sx={{ fontSize: 16, color: "#9CA3AF", mt: 0.2, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mt: 0.3 }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Deadline */}
            {campaign.deadline && (
              <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${remaining === 0 ? "#FCA5A5" : remaining !== null && remaining <= 7 ? "#FCD34D" : "#D1FAE5"}`, bgcolor: remaining === 0 ? "#FEF2F2" : remaining !== null && remaining <= 7 ? "#FFFBEB" : "#F0FDF4", display: "flex", alignItems: "center", gap: 2 }}>
                <AccessTimeOutlined sx={{ fontSize: 20, color: remaining === 0 ? "#EF4444" : remaining !== null && remaining <= 7 ? "#D97706" : "#10B981" }} />
                <Box>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Deadline</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{fmtDate(campaign.deadline)}</Typography>
                  {remaining !== null && (
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: remaining === 0 ? "#EF4444" : remaining <= 7 ? "#D97706" : "#10B981" }}>
                      {remaining === 0 ? "Expired" : `${remaining} day${remaining !== 1 ? "s" : ""} remaining`}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Modules */}
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
                Modules ({campaign.modules.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {campaign.modules
                  .sort((a, b) => a.order - b.order)
                  .map((mod, i) => {
                    const Icon = MODULE_ICONS[mod.type] ?? AssignmentTurnedInOutlined;
                    const mc = MODULE_COLORS[mod.type] ?? MODULE_COLORS.QUESTIONNAIRE;
                    return (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "#F9FAFB", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: mc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon sx={{ fontSize: 18, color: mc.fg }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{MODULE_LABELS[mod.type]}</Typography>
                          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>Step {mod.order}</Typography>
                        </Box>
                        <Chip label={`#${i + 1}`} size="small" sx={{ fontSize: "10px", height: 20, bgcolor: mc.bg, color: mc.fg, fontWeight: 700 }} />
                      </Box>
                    );
                  })}
              </Box>
            </Box>

            {/* Link Token */}
            {(campaign.accessMethod === "LINK" || campaign.accessMethod === "BOTH") && campaign.linkToken && (
              <>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
                    Shareable Link
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                    <Typography sx={{ flex: 1, fontSize: "12px", color: "#374151", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/assessment/${campaign.linkToken}`}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy link"}>
                      <IconButton size="small" onClick={handleCopyLink} sx={{ color: copied ? "#10B981" : "#6B7280", flexShrink: 0 }}>
                        {copied ? <CheckCircleOutlined sx={{ fontSize: 16 }} /> : <ContentCopyOutlined sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {campaign && !loading && activeTab === 0 && (
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB", flexShrink: 0, display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", flex: 1 }}
          >
            Close
          </Button>
          <Button
            startIcon={<DeleteOutlined sx={{ fontSize: 16 }} />}
            onClick={() => onDeleteRequest(campaign._id, campaign.title)}
            sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, bgcolor: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5", "&:hover": { bgcolor: "#FEE2E2" }, px: 2.5 }}
          >
            Delete
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

// ─── Campaign Card ────────────────────────────────────────────────────────────

const CampaignCard: React.FC<{ campaign: Campaign; onViewDetails: (id: string) => void; onDelete: (id: string, title: string) => void }> = memo(({ campaign, onViewDetails, onDelete }) => {
  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
  const tc = TYPE_COLORS[campaign.type] || TYPE_COLORS.CUSTOM;
  const remaining = daysLeft(campaign.deadline);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s", overflow: "hidden" }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip label={campaign.status} size="small" sx={{ bgcolor: sc.bg, color: sc.fg, fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 22 }} />
              <Chip label={TYPE_LABELS[campaign.type]} size="small" sx={{ bgcolor: tc.bg, color: tc.fg, fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 22, border: `1px solid ${tc.border}` }} />
            </Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{campaign.title}</Typography>
            {campaign.description && (
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {campaign.description}
              </Typography>
            )}
          </Box>
          <IconButton size="small" sx={{ color: "#9CA3AF" }} onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertOutlined />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
            slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 3, minWidth: 160 } } }}>
            <MenuItem
              onClick={() => { setMenuAnchor(null); onDelete(campaign._id, campaign.title); }}
              sx={{ color: "#EF4444", gap: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}><DeleteOutlined sx={{ fontSize: 18, color: "#EF4444" }} /></ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Modules chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 3 }}>
          {campaign.modules.map((mod, i) => (
            <Chip key={i} label={MODULE_LABELS[mod.type]} size="small" sx={{ bgcolor: "#F3F4F6", color: "#4B5563", fontSize: "10px", fontWeight: 500, height: 24 }} />
          ))}
        </Box>

        {/* Metadata */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, pt: 2, borderTop: "1px solid #F3F4F6" }}>
          {[
            { label: "Anonymity", value: campaign.anonymityMode === "ANONYMOUS" ? "Anonymous" : "Nominative" },
            { label: "Access", value: campaign.accessMethod },
            { label: "Created", value: fmtDate(campaign.createdAt).split(",")[0] },
          ].map((m, i) => (
            <Box key={i}>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, mb: 0.5 }}>{m.label}</Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{m.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeOutlined sx={{ fontSize: 15, color: "#6B7280" }} />
          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
            {campaign.deadline
              ? <><span>Due: </span><strong style={{ color: "#374151" }}>{fmtDate(campaign.deadline)}</strong></>
              : "No deadline"}
          </Typography>
          {remaining !== null && remaining > 0 && (
            <Typography sx={{ fontSize: "11px", color: "#0D9488", fontWeight: 700, ml: 0.5 }}>({remaining}d left)</Typography>
          )}
          {remaining === 0 && (
            <Typography sx={{ fontSize: "11px", color: "#EF4444", fontWeight: 700, ml: 0.5 }}>(Expired)</Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" sx={{ color: "#6B7280" }}><NotificationsOutlined sx={{ fontSize: 16 }} /></IconButton>
          <Button
            endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
            onClick={() => onViewDetails(campaign._id)}
            sx={{ bgcolor: "#0D9488", color: "#fff", textTransform: "none", borderRadius: 5, fontSize: "11px", fontWeight: 700, px: 2, py: 0.5, "&:hover": { bgcolor: "#0b7a6f" } }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
CampaignCard.displayName = "CampaignCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 3 }}>
    <Skeleton variant="rectangular" height={20} width="60%" sx={{ borderRadius: 1, mb: 1 }} />
    <Skeleton variant="rectangular" height={16} width="40%" sx={{ borderRadius: 1, mb: 2 }} />
    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
      <Skeleton variant="rectangular" height={24} width={80} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={24} width={90} sx={{ borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 2 }} />
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AssessmentCampaigns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const campaigns = useSelector(selectCampaigns);
  const loading = useSelector(selectCampaignLoading);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleOpenCreate = useCallback(() => setCreateOpen(true), []);
  const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
  const handleOpenDetail = useCallback((id: string) => setDetailId(id), []);
  const handleCloseDetail = useCallback(() => setDetailId(null), []);

  const handleDeleteRequest = useCallback((id: string, title: string) => {
    setDeleteTarget({ id, title });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleting(true);
    await dispatch(deleteCampaign(targetId));
    setDeleting(false);
    setDeleteTarget(null);
    setDetailId((prev) => (prev === targetId ? null : prev));
  }, [deleteTarget, dispatch]);

  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "ACTIVE").length;
  const drafts = campaigns.filter((c) => c.status === "DRAFT").length;
  const closed = campaigns.filter((c) => c.status === "CLOSED" || c.status === "EXPIRED").length;

  const statsRow = [
    { label: "Total Campaigns", value: String(total), icon: DescriptionOutlined, color: "#6B7280" },
    { label: "Active Now", value: String(active), icon: AssignmentTurnedInOutlined, color: "#10B981", pulse: true },
    { label: "Draft", value: String(drafts), icon: PsychologyOutlined, color: "#3B82F6" },
    { label: "Closed / Expired", value: String(closed), icon: AccessTimeOutlined, color: "#8B5CF6" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>Assessment Campaigns</Typography>
          <Typography sx={{ color: "#6B7280" }}>Create and manage AI-powered skill assessments for your team</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            startIcon={<DownloadOutlined />}
            sx={{ textTransform: "none", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: "13px", fontWeight: 600, color: "#374151", px: 2 }}
          >
            Export Results
          </Button>
          <Button
            startIcon={<AddOutlined />}
            onClick={handleOpenCreate}
            sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "13px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}
          >
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {statsRow.map((stat, i) => (
          <Box key={i} sx={{ bgcolor: "#fff", p: 2.5, borderRadius: 3, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}20`, color: stat.color }}>
              <stat.icon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{stat.value}</Typography>
                {stat.pulse && active > 0 && (
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } }, animation: "pulse 2s infinite" }} />
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Campaign Grid */}
      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </Box>
      ) : campaigns.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", py: 8, gap: 2 }}>
          <Box sx={{ width: 64, height: 64, bgcolor: "#F0FDFA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AssignmentTurnedInOutlined sx={{ fontSize: 32, color: "#0D9488" }} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>No Campaigns Yet</Typography>
          <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>Create your first assessment campaign to get started</Typography>
          <Button
            startIcon={<AddOutlined />}
            onClick={handleOpenCreate}
            sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontWeight: 700, px: 3, mt: 1, "&:hover": { bgcolor: "#0b7a6f" } }}
          >
            New Campaign
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          <AnimatePresence>
            {campaigns.map((camp) => (
              <motion.div key={camp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <CampaignCard campaign={camp} onViewDetails={handleOpenDetail} onDelete={handleDeleteRequest} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* Create Modal */}
      <CreateCampaignModal open={createOpen} onClose={handleCloseCreate} />

      {/* Detail Drawer */}
      <CampaignDetailDrawer
        open={detailId !== null}
        campaignId={detailId}
        onClose={handleCloseDetail}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WarningAmberOutlined sx={{ fontSize: 22, color: "#EF4444" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>Delete Campaign</Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>This action cannot be undone</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: "14px", color: "#374151" }}>
            Are you sure you want to delete{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
              "{deleteTarget?.title}"
            </Box>
            ? All campaign data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <DeleteOutlined sx={{ fontSize: 16 }} />}
            sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, bgcolor: "#EF4444", color: "#fff", flex: 1, "&:hover": { bgcolor: "#DC2626" }, "&:disabled": { bgcolor: "#9CA3AF" } }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(AssessmentCampaigns);
