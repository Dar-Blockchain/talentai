import React from "react";
import { Box } from "@mui/material";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { AuthPageHeader, BrandSpan } from "@/modules/auth/shared/ui/AuthPageHeader";

const SignInHeader: React.FC = () => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      size="sm" mb={2}
      above={
        <NextLink href="/" style={{ display: "inline-block" }}>
          <Box component="img" src="/images/home/logo.svg" alt="TalentAI"
            sx={{ height: { xs: 28, sm: 32 }, display: { xs: "block", md: "none" }, mb: 1.75, mx: "auto", cursor: "pointer" }}
          />
        </NextLink>
      }
      title={t("signin.title")}
      subtitle={<>{t("signin.subtitle_prefix")}<BrandSpan />{t("signin.subtitle_suffix")}</>}
    />
  );
};

export default SignInHeader;
