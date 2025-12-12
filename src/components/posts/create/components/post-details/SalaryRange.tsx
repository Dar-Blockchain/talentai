import React from "react";
import { Stack, TextField, MenuItem, Typography, Box } from "@mui/material";
import Image from "next/image";

interface SalaryRangeProps {
  salaryRange: {
    currency: string;
    min: string;
    max: string;
  };
  onSalaryChange: (field: "min" | "max" | "currency", value: string) => void;
  errors?: {
    currency?: string;
    min?: string;
    max?: string;
  };
  currencies?: string[];
}

const SalaryRange: React.FC<SalaryRangeProps> = ({
  salaryRange,
  onSalaryChange,
  errors = {},
  currencies = ["$", "€", "£"],
}) => {
  const handleChange =
    (field: "min" | "max" | "currency") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // For min/max, remove leading zeros and clamp to 0
      if (field === "min" || field === "max") {
        value = value.replace(/^0+/, "");
        if (value === "") value = "0";
        const numberValue = Math.max(0, parseInt(value, 10) || 0);
        value = numberValue.toString();
      }

      onSalaryChange(field, value);
    };

  const inputStyle = {
    height: 40,
    "& .MuiInputBase-root": {
      height: 40,
      fontSize: "12px",
      fontWeight: 500,
    },
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "rgba(136, 151, 170, 1)",
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: 13,
        }}
      >
        <Image src="/icons/money.svg" alt="money" width={18} height={12} />
        Salary Range
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {/* Currency */}
        <Box sx={{ width: { xs: "100%", sm: "25%" } }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569" }}>
            Currency
          </Typography>
          <TextField
            select
            value={salaryRange.currency || ""}
            onChange={handleChange("currency")}
            variant="outlined"
            fullWidth
            error={!!errors.currency}
            helperText={errors.currency}
            sx={inputStyle}
          >
            <MenuItem
              disabled
              value=""
              sx={{ fontSize: "12px", fontWeight: 500 }}
            >
              Currency
            </MenuItem>
            {currencies.map((currency) => (
              <MenuItem
                key={currency}
                value={currency}
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                {currency}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Minimum Salary */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569" }}>
            Minimum Salary
          </Typography>
          <TextField
            fullWidth
            placeholder="Min"
            type="number"
            value={salaryRange.min || ""}
            onChange={handleChange("min")}
            error={!!errors.min}
            sx={inputStyle}
          />
        </Box>

        {/* Maximum Salary */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569" }}>
            Maximum Salary
          </Typography>
          <TextField
            fullWidth
            placeholder="Max"
            type="number"
            value={salaryRange.max || ""}
            onChange={handleChange("max")}
            error={!!errors.max}
            sx={inputStyle}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SalaryRange;
