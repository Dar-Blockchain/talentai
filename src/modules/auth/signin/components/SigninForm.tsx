import React from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from "react-i18next";
import { formatTimeLeft } from "@/utils/functions";
import { ACCENT, OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useSignin } from "../hooks";
import EmailStep from "./ui/EmailStep";
import OtpStep from "./ui/OtpStep";

const SigninForm: React.FC = () => {
  const { t } = useTranslation("auth");
  const { form, step, loading, emailValue, otp, invitationEmail, timer, onSubmit, resendCode, changeEmail } = useSignin();

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>

      {step === 1 && (
        <EmailStep
          register={form.register} errors={form.formState.errors}
          loading={loading} invitationEmail={invitationEmail}
        />
      )}

      {step === 2 && (
        <OtpStep emailValue={emailValue} otp={otp} isLocked={loading} />
      )}

      {/* Timer */}
      {(timer.isExpired || timer.isRunning) && (
        <Box sx={{ textAlign: "center", mt: 1.25 }}>
          <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.75rem" }, fontFamily: "Poppins", fontWeight: 500, color: timer.secondsLeft > 60 ? "#9CA3AF" : timer.secondsLeft > 0 ? "#F59E0B" : "#EF4444", transition: "color 0.3s" }}>
            {timer.secondsLeft > 0
              ? t("signin.code_expires", { time: formatTimeLeft(timer.secondsLeft) })
              : t("signin.code_expired")}
          </Typography>
        </Box>
      )}

      {/* Submit / Resend */}
      <Button
        type={step === 2 && timer.isExpired ? "button" : "submit"}
        fullWidth variant="contained"
        disabled={!loading && (step === 2 && !timer.isExpired && otp.otpCode.join("").length < OTP_CODE_LENGTH)}
        onClick={step === 2 && timer.isExpired ? resendCode : undefined}
        endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 15 }} />}
        startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
        sx={{ mt: { xs: 1.5, sm: 1.75 }, height: { xs: 44, sm: 46 }, borderRadius: "10px", textTransform: "none", fontFamily: "Poppins", fontWeight: 600, fontSize: { xs: "0.88rem", sm: "0.92rem" }, bgcolor: ACCENT, color: "#fff", boxShadow: "none", transition: "background-color 0.15s", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" }, "&:active": { bgcolor: "#0B6563" }, "&.Mui-disabled": { bgcolor: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" }, ...(loading && { pointerEvents: "none", opacity: 0.85 }) }}
      >
        {loading
          ? (step === 1 ? t("signin.btn_sending") : timer.isExpired ? t("signin.btn_resending") : t("signin.btn_verifying"))
          : (step === 1 ? t("signin.btn_send") : timer.isExpired ? t("signin.btn_resend") : t("signin.btn_verify"))}
      </Button>

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
