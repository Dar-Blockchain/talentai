import React from "react";
import { useTranslation } from "react-i18next";
import { AuthPageHeader, BrandSpan } from "@/modules/auth/shared/ui/AuthPageHeader";

const RoleSelectHeader: React.FC = () => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      size="lg"
      mb={3.5}
      title={t("register.get_started")}
      subtitle={<>{t("register.how_use_prefix")} <BrandSpan /> {t("register.how_use_suffix")}</>}
    />
  );
};

export default RoleSelectHeader;
