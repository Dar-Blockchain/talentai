import { Box, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { inputStyle, labelSx } from "./styles";

const PERCENTAGE_MIN = 1;
const PERCENTAGE_MAX = 100;

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
        inputProps={{ min: PERCENTAGE_MIN, max: PERCENTAGE_MAX, inputMode: "numeric", "aria-label": t("create.post_form.labels.percentage") }}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(isNaN(val) ? PERCENTAGE_MIN : Math.max(PERCENTAGE_MIN, Math.min(PERCENTAGE_MAX, val)));
        }}
        sx={inputStyle}
      />
    </Box>
  );
};

export default PercentageField;
