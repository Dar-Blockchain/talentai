import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
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
import SkillEditorModal from "./SkillEditorModal";
import { experienceLevels } from "@/constants/candidate";
import {
  contractTypes,
  workModes,
} from "@/constants/candidate";
import SalaryRange from "./SalaryRange";
import SectionCard from "@/components/ui/SectionCard";
import {
  EMPLOYMENT_OPTION_KEY,
  EXPERIENCE_OPTION_KEY,
  WORK_MODE_OPTION_KEY,
  optionLabel,
  hardSkillLevelLabel,
  softSkillLevelLabel,
} from "@/utils/postFormI18n";

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
  const { t } = useTranslation("posts");
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
      <SectionCard sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress sx={{ color: TEAL }} size={40} />
        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>{t("create.preview.loading")}</Typography>
      </SectionCard>
    );
  }

  /* ── Empty ── */
  if (!generatedPost) {
    return (
      <SectionCard sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutoAwesomeOutlined sx={{ fontSize: 32, color: TEAL }} />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>{t("create.preview.empty_title")}</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>{t("create.preview.empty_subtitle")}</Typography>
        </Box>
      </SectionCard>
    );
  }

  return (
    <Box sx={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <SectionCard sx={{ borderLeft: `4px solid ${INDIGO}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#EEF2FF", border: "1px solid #C7D2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AutoAwesomeOutlined sx={{ fontSize: 20, color: INDIGO }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{t("create.preview.header_title")}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{t("create.preview.header_subtitle")}</Typography>
          </Box>
        </Box>
      </SectionCard>

      {/* Basic details */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>{t("create.preview.section_details")}</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>{t("create.preview.label_title")}</Typography>
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
              {t("create.post_form.labels.employment_type")}
            </Typography>
            <TextField select fullWidth value={employmentType}
              onChange={(e) => dispatch(updateJobField({ field: "employmentType", value: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_employment_type")}</Typography></MenuItem>
              {contractTypes.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{optionLabel(t, c, EMPLOYMENT_OPTION_KEY)}</MenuItem>)}
            </TextField>
          </Box>
          <Box>
            <Typography sx={labelSx}>
              <LocationOnOutlined sx={{ fontSize: 14 }} />
              {t("create.post_form.labels.work_mode")}
            </Typography>
            <TextField select fullWidth value={workMode}
              onChange={(e) => dispatch(updateJobField({ field: "workMode", value: e.target.value }))}
              sx={inputSx}
            >
              <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_work_mode")}</Typography></MenuItem>
              {workModes.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{optionLabel(t, m, WORK_MODE_OPTION_KEY)}</MenuItem>)}
            </TextField>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            {t("create.post_form.labels.experience_level")}
          </Typography>
          <TextField select fullWidth value={experienceLevel}
            onChange={(e) => dispatch(updateJobField({ field: "experienceLevel", value: e.target.value }))}
            sx={inputSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUpIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment> }}
          >
            <MenuItem disabled value=""><Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("create.post_form.placeholders.select_experience_level")}</Typography></MenuItem>
            {experienceLevels.map((l) => <MenuItem key={l} value={l} sx={{ fontSize: "13px" }}>{optionLabel(t, l, EXPERIENCE_OPTION_KEY)}</MenuItem>)}
          </TextField>
        </Box>

        <SalaryRange salaryRange={salary} onSalaryChange={(field, value) => dispatch(updateJobSalaryField({ field, value }))} />
      </SectionCard>

      {/* Skills */}
      <SectionCard>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{t("create.preview.section_skills")}</Typography>
        </Box>

        {/* Info box */}
        <Box sx={{ display: "flex", gap: 1, p: 1.5, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", mb: 2 }}>
          <InfoOutlined sx={{ fontSize: 16, color: "#3B82F6", flexShrink: 0, mt: "1px" }} />
          <Typography sx={{ fontSize: "12px", color: "#1E40AF", lineHeight: 1.5 }}>
            <Trans i18nKey="create.preview.skills_info" ns="posts" components={{ bold: <b /> }} />
          </Typography>
        </Box>

        {/* Hard skills */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("create.preview.hard_skills")}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {hardSkills.map((skill, index) => (
              <SkillChip
                key={index}
                label={`${skill.name} (${hardSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
                onDelete={() => dispatch(deleteHardSkill(index))}
                onClick={() => handleEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "hard")}
              />
            ))}
            <AddSkillButton skillType="hard" onClick={() => handleAdd("hard")} />
          </Box>
        </Box>

        {/* Soft skills */}
        <Box>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#374151", mb: 1 }}>{t("create.preview.soft_skills")}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {softSkills.map((skill, index) => (
              <SkillChip
                key={index}
                label={`${skill.name} (${softSkillLevelLabel(t, Number(skill.level))}) · ${skill.percentage}%`}
                onDelete={() => dispatch(deleteSoftSkill(index))}
                onClick={() => handleEdit({ name: skill.name, level: skill.level, percentage: skill.percentage }, index, "soft")}
              />
            ))}
            <AddSkillButton skillType="soft" onClick={() => handleAdd("soft")} />
          </Box>
        </Box>
      </SectionCard>

      {/* Description / Requirements / Responsibilities */}
      <SectionCard>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", mb: 2 }}>{t("create.preview.section_content")}</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>{t("create.preview.label_description")}</Typography>
          <TextField
            value={description} multiline minRows={4} fullWidth
            onChange={(e) => dispatch(updateJobField({ field: "description", value: e.target.value }))}
            sx={{ "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={labelSx}>{t("create.preview.label_requirements")}</Typography>
          <TextField
            value={requirements.join("\n")} multiline minRows={4} fullWidth
            onChange={(e) => dispatch(updateRequirements(e.target.value))}
            sx={{ "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "8px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}
          />
        </Box>

        <Box>
          <Typography sx={labelSx}>{t("create.preview.label_responsibilities")}</Typography>
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

const AddSkillButton: React.FC<{ skillType: "hard" | "soft"; onClick: () => void }> = ({ skillType, onClick }) => {
  const { t } = useTranslation("posts");
  const labelKey = skillType === "hard" ? "create.preview.btn_add_hard_skill" : "create.preview.btn_add_soft_skill";
  return (
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
      {t(labelKey)}
    </Button>
  );
};

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
