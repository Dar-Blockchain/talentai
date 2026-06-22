import React from "react";
import { useTranslation } from "react-i18next";
import { AuthPageHeader, BrandSpan } from "@/modules/auth/shared/ui/AuthPageHeader";

const SignInHeader: React.FC = () => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      size="sm"
      mb={2}
      title={t("signin.title")}
      subtitle={<>{t("signin.subtitle_prefix")}<BrandSpan />{t("signin.subtitle_suffix")}</>}
    />
  );
};

export default SignInHeader;
