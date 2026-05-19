import { Box, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { inputStyle, labelSx } from "./styles";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const PercentageField = ({ value, onChange }: Props) => {
  const { t } = useTranslation("posts");

  return (
    <Box sx={{ flex: 1 }}>
      <Typography sx={labelSx}>{t("create.post_form.labels.percentage")}</Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={value}
        type="number"
        inputProps={{ min: 1, max: 100 }}
        onChange={(e) => onChange(Number(e.target.value))}
        sx={inputStyle}
      />
    </Box>
  );
};

export default PercentageField;
