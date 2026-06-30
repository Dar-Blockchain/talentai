import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { defaultCurrencies } from "@/modules/company/posts/shared/constants";
import CurrencyDropdown from "./salary-range/CurrencyDropdown";
import SalaryInput from "./salary-range/SalaryInput";

interface SalaryRangeProps {
  salaryRange: { currency: string; min: number; max: number };
  onSalaryChange: (field: "min" | "max" | "currency", value: number | string) => void;
  errors?: { currency?: string; min?: string; max?: string };
  currencies?: { value: string; label: string }[];
  employmentType?: string;
}

export { default as CurrencyDropdown } from "./salary-range/CurrencyDropdown";

const SalaryRange: React.FC<SalaryRangeProps> = ({
  salaryRange,
  onSalaryChange,
  errors = {},
  currencies = defaultCurrencies,
  employmentType,
}) => {
  const { t } = useTranslation("posts");
  const isInternship = employmentType === "Internship";

  const handleChange =
    (field: "min" | "max") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;
      value = value.replace(/\D/g, "");
      value = value.replace(/^0+/, "");
      // For non-internship roles, treat empty input as empty (not 0)
      if (value === "") {
        onSalaryChange(field, isInternship ? 0 : ("" as any));
        return;
      }
      onSalaryChange(field, Number(value));
    };

  const currencyCode = salaryRange.currency || null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: "rgba(136, 151, 170, 1)", mb: 1, display: "flex", alignItems: "center", gap: 1, fontSize: 13 }}
      >
        <Image src="/icons/money.svg" alt="" width={18} height={12} />
        {t("create.post_form.labels.salary_range")}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
        <Box sx={{ width: { xs: "100%", sm: "32%" } }}>
          <Typography sx={{ fontSize: 12, mb: 0.5, color: "#475569", fontWeight: 500 }}>
            {t("create.post_form.labels.currency")}
          </Typography>
          <CurrencyDropdown
            currencies={currencies}
            value={salaryRange.currency}
            onChange={(code) => onSalaryChange("currency", code)}
            placeholder={t("create.post_form.placeholders.select_currency")}
            error={errors.currency}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <SalaryInput
            label={t("create.post_form.labels.minimum_salary")}
            value={salaryRange.min}
            currencyCode={currencyCode}
            error={errors.min}
            onChange={handleChange("min")}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <SalaryInput
            label={t("create.post_form.labels.maximum_salary")}
            value={salaryRange.max}
            currencyCode={currencyCode}
            error={errors.max}
            onChange={handleChange("max")}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default SalaryRange;
