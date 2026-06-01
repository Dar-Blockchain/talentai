import React from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { formatTimeLeft } from "@/utils/functions";
import { ACCENT, OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import type { useOtpInput } from "@/modules/auth/shared/hooks";
import type { useOtpTimer } from "@/modules/auth/shared/hooks";
import { compactSubmitBtnSx } from "../styles/registerFormStyles";

type OtpInputReturn = ReturnType<typeof useOtpInput>;
type OtpTimerReturn = ReturnType<typeof useOtpTimer>;

interface Props {
  savedEmail: string;
  otp: OtpInputReturn;
  timer: OtpTimerReturn;
  loading: boolean;
  resendLoading?: boolean;
  onVerify: () => void;
  onResend?: () => void;
  tPrefix: "candidate_form" | "company_form";
}

const OtpVerifyStep: React.FC<Props> = ({
  savedEmail, otp, timer, loading, resendLoading, onVerify, onResend, tPrefix,
}) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ mb: 2 }}>
      {/* Email badge */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: `${ACCENT}0A`, border: `1px solid ${ACCENT}22`, borderRadius: "12px", px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 }, mb: 3 }}>
        <EmailIcon sx={{ fontSize: { xs: 16, md: 18 }, color: ACCENT, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: "0.73rem", sm: "0.76rem", md: "0.78rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: 1.35 }}>
            {t(`${tPrefix}.code_sent_to`)}
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.84rem", md: "0.88rem" }, color: "#0F172A", fontFamily: "Poppins", fontWeight: 700, overflowWrap: "break-word", wordBreak: "break-all" }}>
            {savedEmail}
          </Typography>
        </Box>
      </Box>

      {/* OTP boxes */}
      <Stack direction="row" spacing={{ xs: 1, sm: 1.25, md: 1.5 }} justifyContent="center" sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        {otp.otpCode.map((digit, i) => (
          <Box key={i} sx={{ width: { xs: 48, sm: 52, md: 58 }, height: { xs: 56, sm: 62, md: 68 }, borderRadius: "14px", border: `1.5px solid ${digit ? ACCENT : "#D1FAF5"}`, bgcolor: loading ? "#F3F4F6" : digit ? `${ACCENT}0C` : "#F8FFFE", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0, opacity: loading ? 0.6 : 1, "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 4px ${ACCENT}18` } }}>
            <Box component="input"
              ref={(el: unknown) => { otp.inputsRef.current[i] = el as HTMLInputElement | null; }}
              value={digit} maxLength={1} disabled={loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { if (!loading) otp.handleChange(i, e.target.value); }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (!loading) otp.handleKeyDown(i, e); }}
              onPaste={i === 0 ? (otp.handlePaste as any) : undefined}
              sx={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: { xs: "1.25rem", sm: "1.42rem", md: "1.6rem" }, fontWeight: 700, color: "#0F172A", fontFamily: "Poppins", cursor: loading ? "not-allowed" : "text" }}
            />
          </Box>
        ))}
      </Stack>

      {/* Timer */}
      {(timer.isExpired || timer.isRunning) && (
        <Box sx={{ textAlign: "center", mt: 1.5 }}>
          <Typography sx={{ fontSize: { xs: "0.7375rem", sm: "0.77rem", md: "0.8rem" }, fontFamily: "Poppins", fontWeight: 500, color: timer.secondsLeft > 60 ? "#9CA3AF" : timer.secondsLeft > 0 ? "#F59E0B" : "#EF4444", transition: "color 0.3s" }}>
            {timer.secondsLeft > 0
              ? t(`${tPrefix}.code_expires`, { time: formatTimeLeft(timer.secondsLeft) })
              : t(`${tPrefix}.code_expired`)}
          </Typography>
        </Box>
      )}

      {/* Verify button — disabled when code incomplete or expired, but NOT when loading
          so the spinner stays visible while the API call is in-flight */}
      <Button fullWidth variant="contained" onClick={!loading ? onVerify : undefined}
        disabled={!loading && (timer.isExpired || otp.otpCode.join("").length < OTP_CODE_LENGTH)}
        endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
        startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
        sx={{ ...compactSubmitBtnSx, mt: 3, ...(loading && { pointerEvents: "none", opacity: 0.85 }) }}
      >
        {loading ? t(`${tPrefix}.btn_creating`) : t(`${tPrefix}.btn_verify`)}
      </Button>

      {/* Resend button */}
      {onResend && (
        <Button fullWidth variant="text" onClick={onResend}
          disabled={resendLoading || (!timer.isExpired && timer.isRunning)}
          startIcon={resendLoading ? <CircularProgress size={14} sx={{ color: ACCENT }} /> : undefined}
          sx={{ mt: 1.5, textTransform: "none", fontWeight: 500, fontSize: { xs: "0.78rem", sm: "0.82rem", md: "0.85rem" }, fontFamily: "Poppins", borderRadius: "10px", height: { xs: 40, sm: 42 }, border: "1px solid #E5E7EB", color: timer.isExpired ? ACCENT : "#9CA3AF", "&:hover": { bgcolor: `${ACCENT}08`, color: ACCENT, borderColor: `${ACCENT}44` }, "&.Mui-disabled": { color: "#C4C4C4", borderColor: "#E5E7EB" } }}
        >
          {resendLoading
            ? t(`${tPrefix}.btn_resending`)
            : timer.isRunning && !timer.isExpired
            ? t(`${tPrefix}.btn_resend_timer`, { time: formatTimeLeft(timer.secondsLeft) })
            : t(`${tPrefix}.btn_resend`)}
        </Button>
      )}
    </Box>
  );
};

export default OtpVerifyStep;
