import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  HardSkill,
  SoftSkill,
  deleteHardSkill,
  deleteSoftSkill,
  updateJobField,
  updateJobSalaryField,
  updateRequirements,
  updateResponsibilities,
} from "@/store/slices/postGenerationSlice";
import InputAdornment from "@mui/material/InputAdornment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { Close } from "@mui/icons-material";
import SkillEditorModal from "./SkillEditorModal";
import { getLevelFromNumber } from "@/utils/postHelpers";
import { experienceLevels } from "@/constants/candidate";
import {
  contractTypes,
  workModes,
} from "@/components/preferences/data/candidateData";
import SalaryRange from "./SalaryRange";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const INDIGO      = "#6366F1";

const labelSx = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  mb: 0.5,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

const inputSx = {
  "& .MuiInputBase-root": {
    height: 40,
    fontSize: "13px",
    borderRadius: "8px",
    bgcolor: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
};

const PostPreview = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { generatedPost, loading } = useSelector((state: any) => state.postGeneration);

  const {
    title = "",
    description = "",
    experienceLevel = "",
    employmentType = "",
    workMode = "",
    salary = { min: "", max: "", currency: "USD" },
    requirements = [],
    responsibilities = [],
  } = generatedPost?.jobDetails ?? {};

  const hardSkills: HardSkill[] = generatedPost?.skillAnalysis?.requiredSkills || [];
  const softSkills: SoftSkill[] = generatedPost?.skillAnalysis?.softSkills || [];

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"soft" | "hard">("hard");

  const handleEdit = (skill: any, index: number, type: "hard" | "soft") => {
    setSelectedSkill(skill);
    setSelectedIndex(index);
    setSelectedType(type);
    setOpen(true);
  };
  const handleAdd = (type: "hard" | "soft") => {
    setSelectedSkill(null);
    setSelectedIndex(-1);
    setSelectedType(type);
    setOpen(true);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <SectionCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress sx={{ color: TEAL }} size={40} />
        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>Generating job post… please wait</Typography>
      </SectionCard>
    );
  }

  /* ── Empty ── */
  if (!generatedPost) {
    return (
      <SectionCard sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 2 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutoAwesomeOutlined sx={{ fontSize: 32, color: TEAL }} />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>Preview will appear here</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>Fill in the form and click Generate</Typography>
        </Box>
      </SectionCard>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <SectionCard sx={{ borderLeft: `4px solid ${INDIGO}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#EEF2FF", border: "1px solid #C7D2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AutoAwesomeOutlined sx={{ fontSize: 20, color: INDIGO }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Generated Job Post</Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Review and edit the AI-generated content below</Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Basic details */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>Job Details</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>Job Title</Typography>
          <TextField
            fullWidth value={title}
            onChange={(e) => dispatch(updateJobField({ field: "title", value: e.target.value }))}
            sx={inputSx}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={labelSx}>
              <WorkOutlined sx={{ fontSize: 14 }} />
              Employment Type
            </Typography>
            <TextField select fullWidth value={employmentType}
              onChange={(e) => dispatch(updateJobField({ field: "employmentType", value: e.target.value }))}
              sx={inputSx}
            >
              {contractTypes.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{c}</MenuItem>)}
            </TextField>
          </Box>
          <Box>
            <Typography sx={labelSx}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              Work Mode
            </Typography>
            <TextField select fullWidth value={workMode}
              onChange={(e) => dispatch(updateJobField({ field: "workMode", value: e.target.value }))}
              sx={inputSx}
            >
              {workModes.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>)}
            </TextField>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            Experience Level
          </Typography>
          <TextField select fullWidth value={experienceLevel}
            onChange={(e) => dispatch(updateJobField({ field: "experienceLevel", value: e.target.value }))}
            sx={inputSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment> }}
          >
            {experienceLevels.map((l) => <MenuItem key={l} value={l} sx={{ fontSize: "13px" }}>{l}</MenuItem>)}
          </TextField>
        </Box>

        <SalaryRange salaryRange={salary} onSalaryChange={(field, value) => dispatch(updateJobSalaryField({ field, value }))} />
      </SectionCard>

      {/* Skills */}
      <SectionCard>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>Required Skills</Typography>
        </Box>

        {/* Info box */}
        <Box sx={{ display: "flex", gap: 1, p: 1.5, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", mb: 2 }}>
          <InfoOutlined sx={{ fontSize: 16, color: "#3B82F6", flexShrink: 0, mt: "1px" }} />
          <Typography sx={{ fontSize: "12px", color: "#1E40AF", lineHeight: 1.5 }}>
            Percentages represent the <b>relative importance</b> of each skill. They are used to <b>match candidates</b> to your requirements.
          </Typography>
        </Box>

        {/* Hard skills */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>Hard Skills</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {hardSkills.map((skill, index) => (
              <SkillChip
                key={index}
                label={`${skill.name} (${getLevelFromNumber(skill.level)}) · ${skill.percentage}%`}
                onDelete={() => dispatch(deleteHardSkill(index))}
                onClick={() => handleEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "hard")}
              />
            ))}
            <AddSkillButton onClick={() => handleAdd("hard")} />
          </Box>
        </Box>

        {/* Soft skills */}
        <Box>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>Soft Skills</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {softSkills.map((skill, index) => (
              <SkillChip
                key={index}
                label={`${skill.name} (${skill.level}/5) · ${skill.percentage}%`}
                onDelete={() => dispatch(deleteSoftSkill(index))}
                onClick={() => handleEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "soft")}
              />
            ))}
            <AddSkillButton onClick={() => handleAdd("soft")} />
          </Box>
        </Box>
      </SectionCard>

      {/* Description / Requirements / Responsibilities */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>Content</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>Description</Typography>
          <TextField
            value={description} multiline minRows={4} fullWidth
            onChange={(e) => dispatch(updateJobField({ field: "description", value: e.target.value }))}
            sx={{ "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>Requirements</Typography>
          <TextField
            value={requirements.join("\n")} multiline minRows={4} fullWidth
            onChange={(e) => dispatch(updateRequirements(e.target.value))}
            sx={{ "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
          />
        </Box>

        <Box>
          <Typography sx={labelSx}>Responsibilities</Typography>
          <TextField
            value={responsibilities.join("\n")} multiline minRows={4} fullWidth
            onChange={(e) => dispatch(updateResponsibilities(e.target.value))}
            sx={{ "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
          />
        </Box>
      </SectionCard>

      {open && (
        <SkillEditorModal
          open={open}
          mode={selectedSkill ? "edit" : "add"}
          skill={selectedSkill}
          index={selectedIndex}
          skillType={selectedType}
          onClose={() => { setOpen(false); setSelectedSkill(null); }}
        />
      )}
    </Box>
  );
};

export default PostPreview;

/* ── Shared sub-components ── */

const AddSkillButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    variant="outlined"
    startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
    onClick={onClick}
    sx={{
      height: 30, fontSize: "12px", fontWeight: 600, textTransform: "none",
      borderRadius: "15px", px: 1.5,
      border: `1px dashed #D1D5DB`,
      color: "#6B7280",
      bgcolor: "#F9FAFB",
      "&:hover": { borderColor: TEAL, color: TEAL, bgcolor: TEAL_BG },
    }}
  >
    Add Skill
  </Button>
);

export const SkillChip: React.FC<{
  label: string;
  onDelete?: () => void;
  onClick?: () => void;
  sx?: any;
}> = ({ label, onDelete, onClick, sx }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    onClick={onClick}
    deleteIcon={
      onDelete ? (
        <CloseOutlined sx={{ fontSize: "14px !important", color: "rgba(255,255,255,0.8)" }} />
      ) : undefined
    }
    sx={{
      bgcolor: TEAL, color: "#fff",
      fontSize: "12px", fontWeight: 500,
      height: 28, borderRadius: "14px",
      "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } },
      "&:hover": { bgcolor: "#0F766E" },
      ...sx,
    }}
  />
);
