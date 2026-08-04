import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthPageHeader } from "@/modules/auth/shared/ui/AuthPageHeader";
import { Button } from "@/modules/shared/ui/shadcn/button";

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
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-0 h-auto mb-2 text-muted-foreground font-sans text-xs sm:text-sm font-medium hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          {t("register.change_role")}
        </Button>
      ) : undefined}
    />
  );
};

export default FormHeader;
