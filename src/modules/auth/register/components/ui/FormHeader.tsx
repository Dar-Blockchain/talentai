import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthPageHeader } from "@/modules/auth/shared/ui/AuthPageHeader";

interface Props {
  hasReturnUrl: boolean;
  title:        string;
  subtitle:     string;
  onBack:       () => void;
}

const FormHeader: React.FC<Props> = ({ hasReturnUrl, title, subtitle, onBack }) => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      mb={3}
      title={title}
      subtitle={subtitle}
      above={!hasReturnUrl ? (
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
