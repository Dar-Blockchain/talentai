import React from "react";
import { DollarSign as AttachMoneyOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { defaultCurrencies } from "@/modules/company/posts/shared/constants";
import { CurrencyDropdown } from "../SalaryRange";
import FieldLabel from "./FieldLabel";
import SectionLabel from "./SectionLabel";

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

const inputClasses = "h-[38px] rounded-lg border-[#E5E7EB] bg-[#FAFAFA] text-[12.5px] hover:border-[#0D9488] focus-visible:border-[#0D9488]";

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
    <div>
      <SectionLabel>{t("create.post_form.labels.salary_section")}</SectionLabel>
      <div className="grid grid-cols-[1fr_1.4fr_1.4fr] gap-3">
        <div>
          <FieldLabel icon={AttachMoneyOutlined} label={t("create.post_form.labels.currency")} />
          <CurrencyDropdown
            currencies={defaultCurrencies}
            value={salary.currency || ""}
            onChange={(code) => onChange("currency", code)}
            placeholder={t("create.post_form.placeholders.select_currency")}
          />
        </div>
        <div>
          <FieldLabel label={t("create.post_form.labels.minimum")} />
          <Input type="text" value={formatSalaryDisplay(salary.min, isInternship)} onChange={handleNumericChange("min")} placeholder={t("create.post_form.placeholders.min_salary_example")} className={inputClasses} />
        </div>
        <div>
          <FieldLabel label={t("create.post_form.labels.maximum")} />
          <Input type="text" value={formatSalaryDisplay(salary.max, isInternship)} onChange={handleNumericChange("max")} placeholder={t("create.post_form.placeholders.max_salary_example")} className={inputClasses} />
        </div>
      </div>
      {error && <p className="mt-1 text-[11px] text-[#EF4444]">{error}</p>}
    </div>
  );
};

export default SalaryFields;
