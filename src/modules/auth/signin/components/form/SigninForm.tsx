import React from "react";
import { Box, Button, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from "react-i18next";
import { formatTimeLeft } from "@/utils/functions";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { AuthSubmitButton } from "@/modules/auth/shared/ui/AuthSubmitButton";
import { useSignin } from "../../hooks";
import EmailStep from "../ui/EmailStep";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";

const SigninForm: React.FC = () => {
  const { t } = useTranslation("auth");
  const { form, step, loading, emailValue, otp, invitationEmail, timer, onSubmit, resendCode, changeEmail } = useSignin();

  const otpFull    = otp.otpCode.join("").length >= OTP_CODE_LENGTH;
  const isExpired  = timer.isExpired;

  // Resolve button label and behaviour based on current step + timer state
  const btnLabel        = step === 1 ? t("signin.btn_send")    : isExpired ? t("signin.btn_resend")    : t("signin.btn_verify");
  const btnLoadingLabel = step === 1 ? t("signin.btn_sending") : isExpired ? t("signin.btn_resending") : t("signin.btn_verifying");
  const btnDisabled     = !loading && step === 2 && !isExpired && !otpFull;
  const btnType         = step === 2 && isExpired ? "button" : "submit";

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
      {step === 1 && (
        <EmailStep control={form.control} errors={form.formState.errors} loading={loading} invitationEmail={invitationEmail} />
      )}
      {step === 2 && (
        <AppOtpVerifyStep savedEmail={emailValue} otp={otp} loading={loading} tPrefix="signin" />
      )}

      {/* Countdown */}
      {(timer.isExpired || timer.isRunning) && (
        <Box sx={{ textAlign: "center", mt: 1.25 }}>
          <Typography sx={{
            fontSize: { xs: "0.72rem", sm: "0.75rem" }, fontFamily: "Poppins", fontWeight: 500,
            color: timer.secondsLeft > 60 ? "#9CA3AF" : timer.secondsLeft > 0 ? "#F59E0B" : "#EF4444",
            transition: "color 0.3s",
          }}>
            {timer.secondsLeft > 0
              ? t("signin.code_expires", { time: formatTimeLeft(timer.secondsLeft) })
              : t("signin.code_expired")}
          </Typography>
        </Box>
      )}

      <AuthSubmitButton
        loading={loading}
        label={btnLabel}
        loadingLabel={btnLoadingLabel}
        disabled={btnDisabled}
        type={btnType}
        onClick={step === 2 && isExpired ? resendCode : undefined}
      />

      {/* Security note */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mt: 1 }}>
        <LockOutlinedIcon sx={{ fontSize: 12, color: "#C4C9D4" }} />
        <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.72rem" }, color: "#9CA3AF", fontFamily: "Poppins" }}>
          {t("signin.security_note")}
        </Typography>
      </Box>

      {/* Change email */}
      {step === 2 && (
        <Button variant="text" fullWidth onClick={changeEmail}
          sx={{ mt: 1, height: { xs: 36, sm: 38 }, borderRadius: "10px", fontFamily: "Poppins", fontWeight: 500, fontSize: { xs: "0.8rem", sm: "0.83rem" }, textTransform: "none", color: "#6B7280", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F9FAFB", color: "#374151", borderColor: "#D1D5DB", boxShadow: "none" } }}
        >
          {t("signin.change_email")}
        </Button>
      )}
    </Box>
  );
};

export default SigninForm;
