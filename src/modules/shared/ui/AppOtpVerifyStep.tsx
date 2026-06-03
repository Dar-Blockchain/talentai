"use client";

import React from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { formatTimeLeft } from "@/utils/functions";
import { ACCENT, ACCENT2, OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import type { useOtpInput, useOtpTimer } from "@/modules/auth/shared/hooks";

type OtpInputReturn = ReturnType<typeof useOtpInput>;
type OtpTimerReturn = ReturnType<typeof useOtpTimer>;

interface Props {
  savedEmail: string;
  otp: OtpInputReturn;
  tPrefix: "signin" | "candidate_form" | "company_form";
  loading: boolean;
  // Optional — omit for signin (SigninForm owns its own button/timer)
  timer?: OtpTimerReturn;
  resendLoading?: boolean;
  onVerify?: () => void;
  onResend?: () => void;
}

const AppOtpVerifyStep: React.FC<Props> = ({
  savedEmail, otp, tPrefix, loading, timer, resendLoading, onVerify, onResend,
}) => {
  const { t } = useTranslation("auth");
  const hasActions = !!onVerify && !!timer;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
          <EmailOutlinedIcon sx={{ fontSize: 26, color: ACCENT }} />
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.2rem" }, color: "#111827", mb: 0.5 }}>
          {t(`${tPrefix}.code_sent_title`)}
        </Typography>
        <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "0.82rem", sm: "0.86rem" }, color: "#6B7280", px: 1, lineHeight: 1.6 }}>
          {t(`${tPrefix}.code_sent_to`)}{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#111827", overflowWrap: "break-word", wordBreak: "break-all" }}>
            {savedEmail}
          </Box>
        </Typography>
      </Box>

      {/* OTP boxes */}
      <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} justifyContent="center">
        {otp.otpCode.map((digit, i) => (
          <Box key={i} sx={{ width: { xs: 48, sm: 52, md: 56 }, height: { xs: 56, sm: 60, md: 64 }, borderRadius: "14px", border: `1.5px solid ${digit ? ACCENT : "#E5E7EB"}`, bgcolor: loading ? "#F3F4F6" : digit ? `${ACCENT}06` : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s, background-color 0.15s, box-shadow 0.15s", flexShrink: 0, opacity: loading ? 0.6 : 1, "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 3px ${ACCENT}20` } }}>
            <Box component="input"
              ref={(el: unknown) => { otp.inputsRef.current[i] = el as HTMLInputElement | null; }}
              value={digit} maxLength={1} disabled={loading}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { if (!loading) otp.handleChange(i, e.target.value); }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (!loading) otp.handleKeyDown(i, e); }}
              onPaste={i === 0 ? (otp.handlePaste as any) : undefined}
              sx={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: { xs: "1.3rem", sm: "1.5rem" }, fontWeight: 700, color: "#111827", fontFamily: "Poppins", cursor: loading ? "not-allowed" : "text" }}
            />
          </Box>
        ))}
      </Stack>

      {/* Timer + buttons — only when used standalone (register forms) */}
      {hasActions && (
        <>
          {(timer.isExpired || timer.isRunning) && (
            <Box sx={{ textAlign: "center", mt: 1.5 }}>
              <Typography sx={{ fontSize: { xs: "0.7375rem", sm: "0.77rem", md: "0.8rem" }, fontFamily: "Poppins", fontWeight: 500, color: timer.secondsLeft > 60 ? "#9CA3AF" : timer.secondsLeft > 0 ? "#F59E0B" : "#EF4444", transition: "color 0.3s" }}>
                {timer.secondsLeft > 0
                  ? t(`${tPrefix}.code_expires`, { time: formatTimeLeft(timer.secondsLeft) })
                  : t(`${tPrefix}.code_expired`)}
              </Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={!loading ? onVerify : undefined}
            disabled={!loading && (timer.isExpired || otp.otpCode.join("").length < OTP_CODE_LENGTH)}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
            sx={{ textTransform: "none", fontFamily: "Poppins", fontWeight: 600, borderRadius: "10px", height: { xs: 44, sm: 46 }, background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT2} 100%)`, color: "#fff", boxShadow: `0 4px 20px ${ACCENT}50`, fontSize: { xs: "0.88rem", sm: "0.92rem" }, mt: 3, "&:hover": { background: `linear-gradient(135deg, #0caa9d 0%, ${ACCENT2} 100%)`, boxShadow: `0 8px 28px ${ACCENT}60` }, "&.Mui-disabled": { background: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" }, ...(loading && { pointerEvents: "none", opacity: 0.85 }) }}
          >
            {loading ? t(`${tPrefix}.btn_creating`) : t(`${tPrefix}.btn_verify`)}
          </Button>

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
        </>
      )}
    </Box>
  );
};

export default AppOtpVerifyStep;
