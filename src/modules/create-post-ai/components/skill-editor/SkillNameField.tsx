import { Box, Typography, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ALL_SKILLS, SOFT_SKILLS } from "@/constants/skills";
import { inputStyle, labelSx } from "./styles";

interface Props {
  skillType: "hard" | "soft";
  value: string;
  onChange: (value: string) => void;
}

const SkillNameField = ({ skillType, value, onChange }: Props) => {
  const { t } = useTranslation("posts");

  return (
    <Box sx={{ flex: 1, mb: 1 }}>
      <Typography sx={labelSx}>{t("create.post_form.labels.skill_name")}</Typography>
      <Autocomplete
        freeSolo
        options={skillType === "hard" ? ALL_SKILLS : SOFT_SKILLS}
        value={value || ""}
        onInputChange={(_, newValue) => onChange(newValue)}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : (opt as any).label)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            sx={inputStyle}
            placeholder={t("create.post_form.placeholders.skill_autocomplete")}
          />
        )}
      />
    </Box>
  );
};

export default SkillNameField;
