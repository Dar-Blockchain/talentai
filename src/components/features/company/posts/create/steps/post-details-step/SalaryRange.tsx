import React from "react";
import { Stack, TextField, MenuItem, Typography, Box } from "@mui/material";
import Image from "next/image";
import { defaultCurrencies } from "@/constants/candidate";

interface SalaryRangeProps {
  salaryRange: {
    currency: string;
    min: number;
    max: number;
  };
  onSalaryChange: (
    field: "min" | "max" | "currency",
    value: number | string
  ) => void;
  errors?: {
    currency?: string;
    min?: string;
    max?: string;
  };
  currencies?: { value: string; label: string }[];
}

const SalaryRange: React.FC<SalaryRangeProps> = ({
  salaryRange,
  onSalaryChange,
  errors = {},
  currencies = defaultCurrencies,
}) => {
  const handleChange =
    (field: "min" | "max" | "currency") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;

      if (field === "min" || field === "max") {
        // Remove non-digits and leading zeros
        value = value.replace(/\D/g, ""); // remove non-numeric
        value = value.replace(/^0+/, ""); // remove leading zeros
        value = value === "" ? 0 : Number(value); // default 0
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
                key={currency.value}
                value={currency.value}
                sx={{ fontSize: "12px", fontWeight: 500 }}
              >
                {currency.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Min */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569" }}>
            Minimum Salary
          </Typography>
          <TextField
            type="text"
            value={salaryRange.min}
            onChange={handleChange("min")}
            error={!!errors.min}
            fullWidth
            sx={inputStyle}
          />
        </Box>

        {/* Max */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569" }}>
            Maximum Salary
          </Typography>
          <TextField
            type="text"
            value={salaryRange.max}
            onChange={handleChange("max")}
            error={!!errors.max}
            fullWidth
            sx={inputStyle}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SalaryRange;