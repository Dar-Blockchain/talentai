import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const GREEN_MAIN = "#00FF9D";

interface SalaryRangeProps {
  salaryRange: {
    currency: string;
    min: string;
    max: string;
  };
  onSalaryChange: (field: "min" | "max" | "currency", value: string) => void;
}

const SalaryRange: React.FC<SalaryRangeProps> = ({
  salaryRange,
  onSalaryChange,
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        sx={{
          color: "#0F172A",
          mb: 2,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AttachMoneyIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
        Salary Range
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#475569", fontWeight: 600 }}>
              Currency
            </InputLabel>
            <Select
              value={salaryRange.currency}
              onChange={(e) => onSalaryChange("currency", e.target.value)}
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 255, 157, 0.2)",
                  borderWidth: 2,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: GREEN_MAIN,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: GREEN_MAIN,
                },
              }}
            >
              <MenuItem value="$">$ (USD)</MenuItem>
              <MenuItem value="€">€ (EUR)</MenuItem>
              <MenuItem value="£">£ (GBP)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: 2 }}>
          <TextField
            fullWidth
            label="Minimum Salary"
            type="number"
            value={salaryRange.min.toString()} // render as string
            onChange={(e) => {
              // Remove leading zeros
              let value = e.target.value.replace(/^0+/, '');
              
              // If empty, default to 0
              if (value === '') value = '0';

              // Parse to integer and clamp to 0
              let numberValue = parseInt(value, 10);
              if (isNaN(numberValue) || numberValue < 0) numberValue = 0;

              onSalaryChange("min", numberValue.toString());
            }}
            inputProps={{ min: 0 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(0, 255, 157, 0.2)",
                  borderWidth: 2,
                },
                "&:hover fieldset": {
                  borderColor: GREEN_MAIN,
                },
                "&.Mui-focused fieldset": {
                  borderColor: GREEN_MAIN,
                },
              },
            }}
          />




        </Box>
        <Box sx={{ flex: 2 }}>
          <TextField
            fullWidth
            label="Maximum Salary"
            type="number"
            value={salaryRange.max.toString()} // always render as string
            onChange={(e) => {
              // Remove leading zeros
              let value = e.target.value.replace(/^0+/, '');

              // If empty, default to 0
              if (value === '') value = '0';

              // Parse to integer and clamp to 0
              let numberValue = parseInt(value, 10);
              if (isNaN(numberValue) || numberValue < 0) numberValue = 0;

              onSalaryChange("max", numberValue.toString());
            }}
            inputProps={{ min: salaryRange.min }} // prevents typing below min
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(0, 255, 157, 0.2)",
                  borderWidth: 2,
                },
                "&:hover fieldset": {
                  borderColor: GREEN_MAIN,
                },
                "&.Mui-focused fieldset": {
                  borderColor: GREEN_MAIN,
                },
              },
            }}
          />

        </Box>
      </Box>
    </Box>
  );
};

export default SalaryRange;