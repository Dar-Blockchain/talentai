import React from "react";
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
    <div className="mt-2">
      <p className="mb-2 flex items-center gap-1 text-[13px]" style={{ color: "rgba(136, 151, 170, 1)" }}>
        <Image src="/icons/money.svg" alt="" width={18} height={12} />
        {t("create.post_form.labels.salary_range")}
      </p>

      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="w-full sm:w-[32%]">
          <p className="mb-1 text-xs font-medium text-[#475569]">
            {t("create.post_form.labels.currency")}
          </p>
          <CurrencyDropdown
            currencies={currencies}
            value={salaryRange.currency}
            onChange={(code) => onSalaryChange("currency", code)}
            placeholder={t("create.post_form.placeholders.select_currency")}
            error={errors.currency}
          />
        </div>

        <div className="flex-1">
          <SalaryInput
            label={t("create.post_form.labels.minimum_salary")}
            value={salaryRange.min}
            currencyCode={currencyCode}
            error={errors.min}
            onChange={handleChange("min")}
          />
        </div>

        <div className="flex-1">
          <SalaryInput
            label={t("create.post_form.labels.maximum_salary")}
            value={salaryRange.max}
            currencyCode={currencyCode}
            error={errors.max}
            onChange={handleChange("max")}
          />
        </div>
      </div>
    </div>
  );
};

export default SalaryRange;
