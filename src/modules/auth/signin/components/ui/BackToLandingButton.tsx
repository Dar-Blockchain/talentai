import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import AuthNavLink from "@/modules/auth/shared/ui/AuthNavLink";

const BackToLandingButton: React.FC = () => {
  const { t }     = useTranslation("auth");
  const router    = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const href      = returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : "/register";
  return <AuthNavLink href={href} label={t("signin.create_account")} dividerText={t("signin.new_here")} />;
};

export default BackToLandingButton;
