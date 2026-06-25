import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { useTranslation } from "react-i18next";
import { defaultCurrencies } from "@/modules/company/posts/shared/constants";
import { CurrencyDropdown } from "../SalaryRange";
import FieldLabel from "./FieldLabel";
import SectionLabel from "./SectionLabel";
import { fieldSx } from "./styles";

interface Props {
  salary: { min: number | null; max: number | null; currency: string };
  error: string;
  onChange: (field: "min" | "max" | "currency", raw: string) => void;
  employmentType?: string;
}

const formatSalaryDisplay = (value: number | null, isInternship: boolean): string => {
  if (value === 0 && isInternship) return "0";
  return value ? String(value) : "";
};

const INTERNSHIP = "Internship";

const SalaryFields = ({ salary, error, onChange, employmentType }: Props) => {
  const { t } = useTranslation("posts");
  const isInternship = employmentType === INTERNSHIP;

  const handleNumericChange = (field: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    // For non-internship, strip leading zeros and block pure "0"
    const val = !isInternship ? digits.replace(/^0+/, "") : digits.replace(/^0+(\d)/, "$1");
    onChange(field, val);
  };

  return (
    <Box>
      <SectionLabel>{t("create.post_form.labels.salary_section")}</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1.4fr", gap: 1.5 }}>
        <Box>
          <FieldLabel icon={AttachMoneyOutlined} label={t("create.post_form.labels.currency")} />
          <CurrencyDropdown
            currencies={defaultCurrencies}
            value={salary.currency || ""}
            onChange={(code) => onChange("currency", code)}
            placeholder={t("create.post_form.placeholders.select_currency")}
          />
        </Box>
        <Box>
          <FieldLabel label={t("create.post_form.labels.minimum")} />
          <TextField type="text" fullWidth value={formatSalaryDisplay(salary.min, isInternship)} onChange={handleNumericChange("min")} placeholder={t("create.post_form.placeholders.min_salary_example")} sx={fieldSx} />
        </Box>
        <Box>
          <FieldLabel label={t("create.post_form.labels.maximum")} />
          <TextField type="text" fullWidth value={formatSalaryDisplay(salary.max, isInternship)} onChange={handleNumericChange("max")} placeholder={t("create.post_form.placeholders.max_salary_example")} sx={fieldSx} />
        </Box>
      </Box>
      {error && <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5 }}>{error}</Typography>}
    </Box>
  );
};

export default SalaryFields;
