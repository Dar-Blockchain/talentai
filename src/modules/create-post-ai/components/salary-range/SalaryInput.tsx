import { TextField, Typography, InputAdornment } from "@mui/material";
import { inputSx } from "./styles";

interface Props {
  label: string;
  value: number | string;
  currencyCode: string | null;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SalaryInput = ({ label, value, currencyCode, error, onChange }: Props) => (
  <>
    <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569", fontWeight: 500 }}>{label}</Typography>
    <TextField
      type="text"
      value={value || ""}
      placeholder="0"
      onChange={onChange}
      error={!!error}
      helperText={error}
      fullWidth
      sx={inputSx}
      InputProps={
        currencyCode
          ? {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>
                    {currencyCode}
                  </Typography>
                </InputAdornment>
              ),
            }
          : undefined
      }
    />
  </>
);

export default SalaryInput;
