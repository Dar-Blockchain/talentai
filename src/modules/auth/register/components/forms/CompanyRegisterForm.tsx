import React from "react";
import { useTranslation } from "react-i18next";
import { useCompanyRegister } from "../../hooks";
import CompanyFields from "../fields/CompanyFields";
import SubmitButton from "../ui/SubmitButton";
import type { RegisterFormProps } from "../../types";

const CompanyRegisterForm: React.FC<RegisterFormProps> = ({ onOtpReady }) => {
  const { t } = useTranslation("auth");
  const { form, loading, sendCode } = useCompanyRegister({ onOtpReady });

  return (
    <form
      onSubmit={form.handleSubmit(sendCode)}
      className="mb-4 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
    >
      <CompanyFields control={form.control} errors={form.formState.errors} loading={loading} />
      <div className="col-span-full">
        <SubmitButton
          loading={loading}
          label={t("company_form.btn_continue")}
          loadingLabel={t("company_form.btn_sending")}
        />
      </div>
    </form>
  );
};

export default CompanyRegisterForm;
