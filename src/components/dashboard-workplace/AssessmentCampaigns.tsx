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
import SendOutlined from "@mui/icons-material/SendOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
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
import {
  fetchMembers,
  selectMembers,
  addEmployee,
  clearAddMemberSuccess,
  Member,
  MemberRole,
} from "@/store/slices/memberSlice";

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
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  const availableMembers = members.filter(
    (m) => m.user && !existingParticipants.some((p) => p.email === m.user.email)
  );
  const filteredMembers = members.filter(
    (m) =>
      m.user &&
      (m.user.username.toLowerCase().includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredAvailable = filteredMembers.filter(
    (m) => m.user && !existingParticipants.some((p) => p.email === m.user.email)
  );
  const allBulkSelected =
    filteredAvailable.length > 0 &&
    filteredAvailable.every((m) => selectedBulk.some((s) => s._id === m._id));

  useEffect(() => {
    if (open) {
      dispatch(fetchMembers());
      setSearch("");
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (addSuccess) {
      dispatch(clearAddStatus());
      setSelectedMember(null); setSelectedBulk([]); setSearch(""); setErr("");
      onClose();
    }
  }, [addSuccess, dispatch, onClose]);

  const handleClose = () => {
    if (adding) return;
    dispatch(clearAddStatus());
    setSelectedMember(null); setSelectedBulk([]); setSearch(""); setErr("");
    onClose();
  };

  const toggleBulkMember = (member: Member) => {
    setSelectedBulk((prev) =>
      prev.some((m) => m._id === member._id)
        ? prev.filter((m) => m._id !== member._id)
        : [...prev, member]
    );
  };

  const handleSelectAll = () => {
    if (allBulkSelected) {
      setSelectedBulk((prev) => prev.filter((m) => !filteredAvailable.some((a) => a._id === m._id)));
    } else {
      const toAdd = filteredAvailable.filter((a) => !selectedBulk.some((s) => s._id === a._id));
      setSelectedBulk((prev) => [...prev, ...toAdd]);
    }
  };

  const handleSubmit = () => {
    setErr("");
    if (mode === "single") {
      if (!selectedMember) return setErr("Please select a member");
      if (!selectedMember.user) return setErr("Selected member has no user data");
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
        participants: selectedBulk
          .filter((m) => m.user)
          .map((m) => ({
            email: m.user!.email,
            employeeId: m.user!._id,
            anonymousToken: generateAnonymousToken(),
          })),
      }));
    }
  };

  const MemberRow = ({
    member,
    isSingle,
  }: {
    member: Member;
    isSingle: boolean;
  }) => {
    const alreadyAdded = !!member.user && existingParticipants.some((p) => p.email === member.user!.email);
    const isSelected = isSingle
      ? selectedMember?._id === member._id
      : selectedBulk.some((m) => m._id === member._id);
    const initials = member.user
      ? (member.user.username || member.user.email)[0].toUpperCase()
      : "?";

    return (
      <Box
        onClick={() => {
          if (alreadyAdded) return;
          isSingle
            ? setSelectedMember(isSelected ? null : member)
            : toggleBulkMember(member);
        }}
        sx={{
          display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2,
          borderRadius: 2, cursor: alreadyAdded ? "not-allowed" : "pointer",
          border: `1px solid ${alreadyAdded ? "#D1FAE5" : isSelected ? "#0D9488" : "#E5E7EB"}`,
          bgcolor: alreadyAdded ? "#F0FDF4" : isSelected ? "#F0FDFA" : "#fff",
          opacity: alreadyAdded ? 0.7 : 1,
          "&:hover": !alreadyAdded ? {
            borderColor: isSelected ? "#0D9488" : "#0D9488",
            bgcolor: isSelected ? "#CCFBF1" : "#F0FDFA",
            transform: "translateX(2px)",
          } : {},
          transition: "all 0.15s ease",
        }}
      >
        {/* Avatar */}
        <Avatar sx={{
          width: 36, height: 36, flexShrink: 0,
          bgcolor: alreadyAdded ? "#D1FAE5" : isSelected ? "#0D9488" : "#F3F4F6",
          color: alreadyAdded ? "#16A34A" : isSelected ? "#fff" : "#6B7280",
          fontSize: "13px", fontWeight: 700,
          boxShadow: isSelected && !alreadyAdded ? "0 0 0 2px #0D9488" : "none",
        }}>
          {initials}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {member.user?.username ?? "Unknown"}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {member.user?.email ?? ""}
          </Typography>
        </Box>

        {/* Right indicator */}
        {alreadyAdded ? (
          <Chip label="Already added" size="small" sx={{ bgcolor: "#D1FAE5", color: "#16A34A", fontSize: "9px", fontWeight: 700, height: 18, flexShrink: 0 }} />
        ) : isSingle ? (
          isSelected
            ? <CheckCircleOutlined sx={{ fontSize: 20, color: "#0D9488", flexShrink: 0 }} />
            : <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #D1D5DB", flexShrink: 0 }} />
        ) : (
          <Box sx={{
            width: 18, height: 18, borderRadius: "4px", flexShrink: 0,
            border: `2px solid ${isSelected ? "#0D9488" : "#D1D5DB"}`,
            bgcolor: isSelected ? "#0D9488" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {isSelected && <CheckCircleOutlined sx={{ fontSize: 12, color: "#fff" }} />}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: "85vh" } } }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, bgcolor: "#F0FDFA", borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GroupAddOutlined sx={{ fontSize: 22, color: "#0D9488" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                {mode === "single" ? "Add Participant" : "Bulk Add Participants"}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                {availableMembers.length} member{availableMembers.length !== 1 ? "s" : ""} available · {existingParticipants.length} already added
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={adding} sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
            <CloseOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Mode toggle */}
        <Box sx={{ display: "flex", bgcolor: "#F9FAFB", borderRadius: 2, p: 0.5, gap: 0.5, mt: 2, border: "1px solid #E5E7EB" }}>
          {(["single", "bulk"] as const).map((m) => (
            <Box
              key={m}
              onClick={() => { setMode(m); setSelectedMember(null); setSelectedBulk([]); }}
              sx={{
                flex: 1, textAlign: "center", py: 1, borderRadius: 1.5, cursor: "pointer",
                bgcolor: mode === m ? "#0D9488" : "transparent",
                fontSize: "13px", fontWeight: 600,
                color: mode === m ? "#fff" : "#6B7280",
                transition: "all 0.2s",
                "&:hover": mode !== m ? { bgcolor: "#F3F4F6" } : {},
              }}
            >
              {m === "single" ? "Single" : "Bulk Import"}
            </Box>
          ))}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 0, display: "flex", flexDirection: "column", gap: 1.5, overflow: "hidden" }}>
        {addError && <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>{addError}</Alert>}
        {err && <Alert severity="warning" sx={{ borderRadius: 2, py: 0.5 }}>{err}</Alert>}

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: <EmailOutlined sx={{ fontSize: 16, color: "#9CA3AF", mr: 1 }} />,
              endAdornment: search ? (
                <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.3 }}>
                  <CloseOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                </IconButton>
              ) : null,
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F9FAFB", fontSize: "13px" } }}
        />

        {/* Bulk: select-all bar */}
        {mode === "bulk" && !membersLoading && filteredAvailable.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
            <Box
              onClick={handleSelectAll}
              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            >
              <Box sx={{
                width: 16, height: 16, borderRadius: "3px",
                border: `2px solid ${allBulkSelected ? "#0D9488" : "#D1D5DB"}`,
                bgcolor: allBulkSelected ? "#0D9488" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                {allBulkSelected && <CheckCircleOutlined sx={{ fontSize: 11, color: "#fff" }} />}
              </Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                Select all ({filteredAvailable.length})
              </Typography>
            </Box>
            {selectedBulk.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${selectedBulk.length} selected`}
                  size="small"
                  onDelete={() => setSelectedBulk([])}
                  sx={{ bgcolor: "#F0FDFA", color: "#0D9488", fontSize: "11px", fontWeight: 700, height: 22, border: "1px solid #99F6E4" }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Member list */}
        <Box sx={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.8, pr: 0.5, pb: 1, maxHeight: 340 }}>
          {membersLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="rectangular" height={13} width="45%" sx={{ borderRadius: 1, mb: 0.6 }} />
                  <Skeleton variant="rectangular" height={11} width="65%" sx={{ borderRadius: 1 }} />
                </Box>
              </Box>
            ))
          ) : filteredMembers.length === 0 ? (
            <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 48, height: 48, bgcolor: "#F3F4F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PersonOutlined sx={{ fontSize: 24, color: "#D1D5DB" }} />
              </Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>No members found</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Try a different search term</Typography>
            </Box>
          ) : (
            filteredMembers.map((member) => (
              <MemberRow key={member._id} member={member} isSingle={mode === "single"} />
            ))
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB", display: "flex", gap: 1.5, alignItems: "center" }}>
        {mode === "bulk" && selectedBulk.length > 0 && (
          <Typography sx={{ fontSize: "12px", color: "#6B7280", flex: 1 }}>
            Adding <Box component="span" sx={{ fontWeight: 700, color: "#0D9488" }}>{selectedBulk.length}</Box> participant{selectedBulk.length !== 1 ? "s" : ""}
          </Typography>
        )}
        {!(mode === "bulk" && selectedBulk.length > 0) && <Box sx={{ flex: 1 }} />}
        <Button
          onClick={handleClose}
          disabled={adding}
          sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", px: 3, "&:hover": { bgcolor: "#F9FAFB" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={adding || (mode === "single" && !selectedMember) || (mode === "bulk" && selectedBulk.length === 0)}
          startIcon={adding ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <GroupAddOutlined sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, bgcolor: "#0D9488", color: "#fff", px: 3, "&:hover": { bgcolor: "#0b7a6f" }, "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" } }}
        >
          {adding ? "Adding…" : mode === "single" ? "Add Member" : `Import ${selectedBulk.length > 0 ? `(${selectedBulk.length})` : ""}`}
        </Button>
      </Box>
    </Dialog>
  );
};

// ─── Invite Member Modal ───────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: MemberRole; label: string; description: string; color: string }[] = [
  { value: "RH",         label: "HR",               description: "Human resources & people ops",   color: "#8B5CF6" },
  { value: "TechLead",   label: "Tech Lead",         description: "Technical leadership & code review", color: "#2563EB" },
  { value: "Supervisor", label: "Supervisor",        description: "Team oversight & daily management",  color: "#D97706" },
  { value: "Manager",    label: "Manager",           description: "Department management & strategy",   color: "#0D9488" },
  { value: "Owner",      label: "Owner",             description: "Full company access & control",      color: "#DC2626" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addingMember, addMemberSuccess, error } = useSelector(selectMembers);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole | "">("");
  const [emailErr, setEmailErr] = useState("");
  const [roleErr, setRoleErr] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (addMemberSuccess) {
      setSent(true);
      dispatch(clearAddMemberSuccess());
      setTimeout(() => {
        setSent(false);
        setEmail(""); setRole(""); setEmailErr(""); setRoleErr("");
        onClose();
      }, 1800);
    }
  }, [addMemberSuccess, dispatch, onClose]);

  const handleClose = () => {
    if (addingMember) return;
    dispatch(clearAddMemberSuccess());
    setEmail(""); setRole(""); setEmailErr(""); setRoleErr(""); setSent(false);
    onClose();
  };

  const validate = () => {
    let ok = true;
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setEmailErr("Enter a valid email address"); ok = false;
    } else setEmailErr("");
    if (!role) {
      setRoleErr("Select a role"); ok = false;
    } else setRoleErr("");
    return ok;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    dispatch(addEmployee({ email: email.trim(), role: role as MemberRole }));
  };

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === role);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "visible" } } }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: 2.5,
              background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
            }}>
              <SendOutlined sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                Invite to Company
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                Send a membership invitation via email
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={addingMember} sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F3F4F6" } }}>
            <CloseOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        {/* Success state */}
        {sent ? (
          <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, bgcolor: "#F0FDF4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #86EFAC" }}>
              <CheckCircleOutlined sx={{ fontSize: 28, color: "#16A34A" }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Invitation Sent!</Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 600, color: "#0D9488" }}>{email}</Box> will receive an email to join your company as <Box component="span" sx={{ fontWeight: 600 }}>{selectedRoleOption?.label}</Box>.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && !addMemberSuccess && (
              <Alert severity="error" sx={{ borderRadius: 2, py: 0.5, fontSize: "12px" }}>{error}</Alert>
            )}

            {/* Email field */}
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Email Address <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                error={!!emailErr}
                helperText={emailErr}
                slotProps={{
                  input: {
                    startAdornment: <EmailOutlined sx={{ fontSize: 16, color: "#9CA3AF", mr: 1 }} />,
                  },
                  formHelperText: { sx: { ml: 0, mt: 0.5 } },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "13px" } }}
              />
            </Box>

            {/* Role selection */}
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Role <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = role === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => { setRole(opt.value); setRoleErr(""); }}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2,
                        borderRadius: 2, cursor: "pointer",
                        border: `1px solid ${isSelected ? opt.color : "#E5E7EB"}`,
                        bgcolor: isSelected ? `${opt.color}10` : "#F9FAFB",
                        "&:hover": { borderColor: opt.color, bgcolor: `${opt.color}08` },
                        transition: "all 0.15s",
                      }}
                    >
                      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: isSelected ? `${opt.color}20` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <WorkOutlined sx={{ fontSize: 16, color: isSelected ? opt.color : "#9CA3AF" }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: isSelected ? opt.color : "#111827" }}>
                          {opt.label}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                          {opt.description}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${isSelected ? opt.color : "#D1D5DB"}`,
                        bgcolor: isSelected ? opt.color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {isSelected && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {roleErr && (
                <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5 }}>{roleErr}</Typography>
              )}
            </Box>

            {/* Preview banner */}
            {email && EMAIL_RE.test(email) && role && (
              <Box sx={{ p: 1.5, bgcolor: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <SendOutlined sx={{ fontSize: 16, color: "#0D9488", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#0D9488", fontWeight: 500 }}>
                  An invitation email will be sent to <Box component="span" sx={{ fontWeight: 700 }}>{email}</Box> as <Box component="span" sx={{ fontWeight: 700 }}>{selectedRoleOption?.label}</Box>
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {!sent && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5, borderTop: "1px solid #F3F4F6" }}>
          <Button
            onClick={handleClose}
            disabled={addingMember}
            sx={{ textTransform: "none", borderRadius: 5, fontWeight: 600, color: "#374151", border: "1px solid #E5E7EB", px: 3, "&:hover": { bgcolor: "#F9FAFB" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addingMember}
            startIcon={addingMember ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SendOutlined sx={{ fontSize: 15 }} />}
            sx={{
              textTransform: "none", borderRadius: 5, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)",
              color: "#fff",
              "&:hover": { background: "linear-gradient(135deg, #0b7a6f 0%, #0770a0 100%)" },
              "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", background: "none" },
              boxShadow: "0 2px 8px rgba(13,148,136,0.25)",
            }}
          >
            {addingMember ? "Sending…" : "Send Invitation"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// ─── Participants Panel ────────────────────────────────────────────────────────

const ParticipantsPanel: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const participants = useSelector(selectParticipants(campaignId));
  const loading = useSelector(selectParticipantsLoading(campaignId));
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchParticipants(campaignId));
  }, [campaignId, dispatch]);

  const handleRemove = async (participantId: string) => {
    setRemoving(participantId);
    await dispatch(removeParticipant({ campaignId, participantId }));
    setRemoving(null);
  };

  const statusCounts = {
    INVITED: participants.filter((p) => p.status === "INVITED").length,
    IN_PROGRESS: participants.filter((p) => p.status === "IN_PROGRESS").length,
    COMPLETED: participants.filter((p) => p.status === "COMPLETED").length,
    DROPPED: participants.filter((p) => p.status === "DROPPED").length,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: "1px solid #F3F4F6" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Participants</Typography>
              {!loading && (
                <Box sx={{ px: 1.2, py: 0.2, bgcolor: "#F0FDFA", borderRadius: 5, border: "1px solid #99F6E4" }}>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#0D9488" }}>{participants.length}</Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.3 }}>Manage who's invited to this campaign</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Invite someone new to your company">
              <Button
                size="small"
                startIcon={<SendOutlined sx={{ fontSize: 14 }} />}
                onClick={() => setInviteOpen(true)}
                sx={{
                  textTransform: "none", borderRadius: 5, fontSize: "12px", fontWeight: 700, px: 2, py: 0.8,
                  border: "1px solid #E5E7EB", color: "#374151", bgcolor: "#fff",
                  "&:hover": { bgcolor: "#F9FAFB", borderColor: "#0D9488", color: "#0D9488" },
                  transition: "all 0.15s",
                }}
              >
                Invite
              </Button>
            </Tooltip>
            <Button
              size="small"
              startIcon={<GroupAddOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setAddOpen(true)}
              sx={{
                textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5,
                fontSize: "12px", fontWeight: 700, px: 2, py: 0.8,
                "&:hover": { bgcolor: "#0b7a6f" },
                boxShadow: "0 1px 4px rgba(13,148,136,0.3)",
              }}
            >
              Add Members
            </Button>
          </Box>
        </Box>

        {/* Stats bar */}
        {!loading && participants.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
            {(["INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"] as const).map((s) => {
              const sc = PSTATUS_COLORS[s];
              const labels: Record<string, string> = { INVITED: "Invited", IN_PROGRESS: "In Progress", COMPLETED: "Done", DROPPED: "Dropped" };
              return (
                <Box key={s} sx={{ p: 1, bgcolor: sc.bg, borderRadius: 2, textAlign: "center", border: `1px solid ${sc.bg}` }}>
                  <Typography sx={{ fontSize: "16px", fontWeight: 700, color: sc.fg }}>{statusCounts[s]}</Typography>
                  <Typography sx={{ fontSize: "9px", fontWeight: 600, color: sc.fg, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.8 }}>{labels[s]}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "#F9FAFB", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                <Skeleton variant="circular" width={38} height={38} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="rectangular" height={13} width="55%" sx={{ borderRadius: 1, mb: 0.6 }} />
                  <Skeleton variant="rectangular" height={10} width="35%" sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="rectangular" width={50} height={18} sx={{ borderRadius: 5 }} />
              </Box>
            ))}
          </Box>
        ) : participants.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
            <Box sx={{ width: 64, height: 64, bgcolor: "#F0FDFA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #99F6E4" }}>
              <PersonOutlined sx={{ fontSize: 28, color: "#0D9488" }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>No participants yet</Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>Add company members to invite them to this campaign</Typography>
            </Box>
            <Button
              onClick={() => setAddOpen(true)}
              startIcon={<GroupAddOutlined sx={{ fontSize: 16 }} />}
              sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontWeight: 700, px: 3, "&:hover": { bgcolor: "#0b7a6f" } }}
            >
              Add First Member
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {participants.map((p: Participant) => {
              const sc = PSTATUS_COLORS[p.status] || PSTATUS_COLORS.INVITED;
              const label = p.email || (p.anonymousToken ? p.anonymousToken.slice(0, 14) + "…" : null) || p.employee || "Unknown";
              const isAnon = !p.email;
              const initials = (p.email || p.employee || "?")[0].toUpperCase();
              const isRemoving = removing === p._id;
              return (
                <Box
                  key={p._id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                    bgcolor: "#fff", borderRadius: 2.5,
                    border: "1px solid #E5E7EB",
                    "&:hover": { borderColor: "#D1D5DB", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
                    transition: "all 0.15s",
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: sc.bg, color: sc.fg, fontSize: "14px", fontWeight: 700, border: `2px solid ${sc.bg}` }}>
                    {isAnon ? <VpnKeyOutlined sx={{ fontSize: 16 }} /> : initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {label}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                      <Chip
                        label={p.status.replace("_", " ")}
                        size="small"
                        sx={{ bgcolor: sc.bg, color: sc.fg, fontSize: "9px", fontWeight: 700, height: 16, textTransform: "uppercase", letterSpacing: 0.5 }}
                      />
                      {p.createdAt && (
                        <Typography sx={{ fontSize: "10px", color: "#D1D5DB" }}>·</Typography>
                      )}
                      {p.createdAt && (
                        <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{fmtDate(p.createdAt)}</Typography>
                      )}
                    </Box>
                  </Box>
                  <Tooltip title="Remove participant">
                    <IconButton
                      size="small"
                      disabled={isRemoving}
                      onClick={() => handleRemove(p._id)}
                      sx={{ color: "#D1D5DB", "&:hover": { bgcolor: "#FEF2F2", color: "#EF4444" }, transition: "all 0.15s" }}
                    >
                      {isRemoving
                        ? <CircularProgress size={14} sx={{ color: "#EF4444" }} />
                        : <DeleteOutlined sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <AddParticipantModal open={addOpen} campaignId={campaignId} onClose={() => setAddOpen(false)} />
      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
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
