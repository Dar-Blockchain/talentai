import { Box, Typography, TextField, Autocomplete, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ALL_SKILLS, SOFT_SKILLS } from "@/constants/skills";
import { inputStyle, labelSx } from "./styles";

interface SkillOption {
  label: string;
  category?: string;
}

interface Props {
  skillType: "hard" | "soft";
  value: string;
  onChange: (value: string) => void;
}

const SkillNameField = ({ skillType, value, onChange }: Props) => {
  const { t } = useTranslation("posts");
  const baseOptions: SkillOption[] = skillType === "hard" ? ALL_SKILLS : SOFT_SKILLS;

  return (
    <Box sx={{ flex: 1, mb: 1 }}>
      <Typography sx={labelSx}>{t("create.post_form.labels.skill_name")}</Typography>
      <Autocomplete
        disableClearable
        options={baseOptions}
        inputValue={value}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        filterOptions={(options, { inputValue }) => {
          const q = inputValue.toLowerCase().trim();
          return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
        }}
        onInputChange={(_, newValue) => onChange(newValue)}
        onChange={(_, newValue) => {
          if (!newValue) { onChange(""); return; }
          onChange(typeof newValue === "string" ? newValue : newValue.label);
        }}
        renderOption={(props, option) => {
          // MUI v5.14+: key must be extracted manually from renderOption props
          const { key, ...rest } = props as any;
          return (
            <Box
              key={key}
              component="li"
              {...rest}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 2, py: 1, cursor: "pointer",
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              <Chip
                label={option.category}
                size="small"
                sx={{ fontSize: "9px", height: 16, bgcolor: "#F3F4F6", color: "#6B7280", borderRadius: "4px" }}
              />
              <Typography sx={{ fontSize: "12.5px", color: "#111827" }}>{option.label}</Typography>
            </Box>
          );
        }}
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
