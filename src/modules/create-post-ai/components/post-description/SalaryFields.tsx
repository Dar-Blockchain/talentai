import { Box, TextField, Typography } from "@mui/material";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { useTranslation } from "react-i18next";
import { defaultCurrencies } from "@/constants/candidate";
import { CurrencyDropdown } from "../SalaryRange";
import FieldLabel from "./FieldLabel";
import SectionLabel from "./SectionLabel";
import { fieldSx } from "./styles";

interface Props {
  salary: { min: number | null; max: number | null; currency: string };
  error: string;
  onChange: (field: "min" | "max" | "currency", raw: string) => void;
}

const SalaryFields = ({ salary, error, onChange }: Props) => {
  const { t } = useTranslation("posts");
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
          <TextField type="text" fullWidth value={salary.min || ""} onChange={(e) => onChange("min", e.target.value)} placeholder={t("create.post_form.placeholders.min_salary_example")} sx={fieldSx} />
        </Box>
        <Box>
          <FieldLabel label={t("create.post_form.labels.maximum")} />
          <TextField type="text" fullWidth value={salary.max || ""} onChange={(e) => onChange("max", e.target.value)} placeholder={t("create.post_form.placeholders.max_salary_example")} sx={fieldSx} />
        </Box>
      </Box>
      {error && <Typography sx={{ fontSize: "11px", color: "#EF4444", mt: 0.5 }}>{error}</Typography>}
    </Box>
  );
};

export default SalaryFields;
