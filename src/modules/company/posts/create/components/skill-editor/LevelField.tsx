import { Box, Typography, TextField, MenuItem, InputAdornment } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useTranslation } from "react-i18next";
import { hardSkillLevels, softSkillLevels } from "@/modules/shared/skills";
import { inputStyle, labelSx } from "./styles";

interface Props {
  skillType: "hard" | "soft";
  value: string | number | null;
  onChange: (value: string) => void;
}

const LevelField = ({ skillType, value, onChange }: Props) => {
  const { t } = useTranslation("posts");
  const levels = skillType === "hard" ? hardSkillLevels : softSkillLevels;

  const levelMenuLabel = (v: number) =>
    skillType === "hard"
      ? t(`create.post_form.hard_skill_levels.${v}`)
      : t(`create.post_form.soft_skill_levels.${v}`);

  return (
    <Box sx={{ flex: 1 }}>
      <Typography sx={labelSx}>{t("create.post_form.skill_modal.experience_level")}</Typography>
      <TextField
        select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        sx={inputStyle}
        inputProps={{ "aria-label": t("create.post_form.skill_modal.experience_level") }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TrendingUpIcon sx={{ color: "rgba(98, 111, 134, 1)", width: "16px", height: "14px" }} />
            </InputAdornment>
          ),
        }}
      >
        <MenuItem disabled value="" sx={{ fontSize: "12px", fontWeight: 500 }}>
          {t("create.post_form.placeholders.select_skill_level")}
        </MenuItem>
        {levels.map((item) => (
          <MenuItem key={item.value} value={item.value} sx={{ fontSize: "12px", fontWeight: 500 }}>
            {levelMenuLabel(item.value)}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default LevelField;
