import React from "react";
import { LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/modules/shared/ui/shadcn/button";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";
import SigninContainer from "../layout/SigninContainer";
import SignInHeader from "../ui/SignInHeader";
import type { useOtpInput, useOtpTimer } from "@/modules/auth/shared/hooks";

type OtpInputReturn = ReturnType<typeof useOtpInput>;
type OtpTimerReturn = ReturnType<typeof useOtpTimer>;

export interface OtpPageProps {
  email:         string;
  otp:           OtpInputReturn;
  timer:         OtpTimerReturn;
  loading:       boolean;
  resendLoading: boolean;
  onVerify:      () => void;
  onResend:      () => void;
  onChangeEmail: () => void;
  tPrefix?:      "signin" | "candidate_form" | "company_form";
}

const OtpPage: React.FC<OtpPageProps> = ({
  email, otp, timer, loading, resendLoading,
  onVerify, onResend, onChangeEmail,
  tPrefix = "signin",
}) => {
  const { t } = useTranslation("auth");

  return (
    <SigninContainer>
      <SignInHeader />

      <AppOtpVerifyStep
        savedEmail={email}
        otp={otp}
        timer={timer}
        loading={loading}
        resendLoading={resendLoading}
        onVerify={onVerify}
        onResend={onResend}
        tPrefix={tPrefix}
      />

      <div className="flex items-center justify-center gap-1.5 pt-2 sm:pt-3">
        <LockKeyhole className="size-3 sm:size-3.5 text-muted-foreground/60" />
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
          {t("signin.security_note")}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="default"
        className="w-full mt-2 sm:mt-2.5 font-sans font-medium text-xs sm:text-sm text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
        onClick={onChangeEmail}
      >
        {t("signin.change_email")}
      </Button>
    </SigninContainer>
  );
};

export default OtpPage;
