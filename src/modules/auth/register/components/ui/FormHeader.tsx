import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthPageHeader, AccentSpan } from "@/modules/auth/shared/ui/AuthPageHeader";

interface Props {
  isOtpStep:       boolean;
  hasReturnUrl:    boolean;
  title:           string;
  subtitle:        string;
  registeredEmail: string;
  onBack:          () => void;
}

const FormHeader: React.FC<Props> = ({ isOtpStep, hasReturnUrl, title, subtitle, registeredEmail, onBack }) => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      mb={3}
      title={isOtpStep ? t("register.check_inbox") : title}
      subtitle={
        isOtpStep
          ? <>{t("register.otp_sent_prefix")} <AccentSpan>{registeredEmail || t("register.otp_sent_accent")}</AccentSpan></>
          : subtitle
      }
      above={!isOtpStep && !hasReturnUrl ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 mb-2 cursor-pointer text-muted-foreground font-sans text-xs sm:text-sm font-medium hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          {t("register.change_role")}
        </button>
      ) : undefined}
    />
  );
};

export default FormHeader;
