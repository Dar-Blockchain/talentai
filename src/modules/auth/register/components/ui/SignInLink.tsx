import React from "react";
import { useTranslation } from "react-i18next";
import AuthNavLink from "@/modules/auth/shared/ui/AuthNavLink";

interface Props { returnUrl?: string; label: string; }

const SignInLink: React.FC<Props> = ({ returnUrl, label }) => {
  const { t } = useTranslation("auth");
  const href = returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin";
  return <AuthNavLink href={href} label={label} dividerText={t("register.already_account")} variant="accent" />;
};

export default SignInLink;
