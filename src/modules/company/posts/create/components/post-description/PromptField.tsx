import { Box, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import FieldLabel from "./FieldLabel";
import HintChips from "./HintChips";
import { TEAL } from "./styles";

interface Props {
  value: string;
  error: string;
  onChange: (val: string) => void;
}

const PromptField = ({ value, error, onChange }: Props) => {
  const { t } = useTranslation("posts");
  return (
    <Box>
      <FieldLabel label={t("create.form.prompt_label")} />
      <HintChips />
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("create.form.prompt_placeholder")}
        multiline minRows={5} maxRows={8} fullWidth
        error={!!error}
        helperText={error}
        sx={{
          "& .MuiInputBase-root": { fontSize: "13px", borderRadius: "10px", bgcolor: "#FAFAFA", lineHeight: 1.75 },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
          "& textarea": {
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: "10px", "&:hover": { background: "#9CA3AF" } },
            scrollbarWidth: "thin",
            scrollbarColor: "#D1D5DB transparent",
          },
        }}
        FormHelperTextProps={{ sx: { ml: 0, fontSize: "11px" } }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
        <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{t("create.form.prompt_hint")}</Typography>
        <Typography sx={{ fontSize: "11px", color: value.length < 50 ? "#F59E0B" : "#10B981", fontWeight: 500 }}>
          {value.length} {t("create.form.prompt_chars")}
        </Typography>
      </Box>
    </Box>
  );
};

export default PromptField;
