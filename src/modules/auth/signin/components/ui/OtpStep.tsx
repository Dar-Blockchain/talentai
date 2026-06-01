import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import { ACCENT, OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import type { useOtpInput } from "@/modules/auth/shared/hooks";

type OtpInputReturn = ReturnType<typeof useOtpInput>;

interface Props {
  emailValue: string;
  otp: OtpInputReturn;
  isLocked: boolean;
}

const OtpStep: React.FC<Props> = ({ emailValue, otp, isLocked }) => {
  const { t } = useTranslation("auth");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 2.25 } }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "11px", bgcolor: `${ACCENT}0F`, border: `1px solid ${ACCENT}1A`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.25 }}>
          <EmailOutlinedIcon sx={{ fontSize: 21, color: ACCENT }} />
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1rem" }, color: "#111827", mb: 0.5 }}>
          {t("signin.code_sent_title")}
        </Typography>
        <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "0.78rem", sm: "0.83rem" }, color: "#6B7280", px: 1 }}>
          {t("signin.code_sent_to")}{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#374151" }}>{emailValue}</Box>
        </Typography>
      </Box>

      {/* OTP boxes */}
      <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} justifyContent="center">
        {otp.otpCode.map((digit, i) => (
          <Box key={i} sx={{ width: { xs: 40, sm: 44, md: 48 }, height: { xs: 48, sm: 52, md: 56 }, borderRadius: "10px", border: `1.5px solid ${digit ? ACCENT : "#E5E7EB"}`, bgcolor: digit ? `${ACCENT}06` : "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s, background-color 0.15s", "&:focus-within": { borderColor: ACCENT, bgcolor: "#fff", boxShadow: `0 0 0 3px ${ACCENT}18` } }}>
            <Box component="input"
              ref={(el: unknown) => { otp.inputsRef.current[i] = el as HTMLInputElement | null; }}
              value={digit} disabled={isLocked} maxLength={1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { if (!isLocked) otp.handleChange(i, e.target.value); }}
              onPaste={i === 0 ? (otp.handlePaste as any) : undefined}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (!isLocked) otp.handleKeyDown(i, e); }}
              sx={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", textAlign: "center", fontSize: { xs: "1.2rem", sm: "1.35rem" }, fontWeight: 700, color: "#0F172A", fontFamily: "Poppins", cursor: isLocked ? "not-allowed" : "text" }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default OtpStep;
