import { Box, TextField, Button, InputAdornment, CircularProgress } from "@mui/material";
import { LockClock as LockClockIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  gradient: string;
}

interface VerificationCodeFormProps {
  register: UseFormRegister<{ code: string }>;
  errors: FieldErrors<{ code: string }>;
  loading: boolean;
  isLoading: boolean;
  showVerification: boolean;
  verifying: boolean;
  code: string;
  email: string;
  canResend: boolean;
  countdown: number;
  themeColors: ThemeColors;
  textFieldInputProps: any;
  textFieldLabelProps: any;
  userType: string;
  onVerifySubmit: (e: React.FormEvent) => void;
  onResendCode: (e: React.MouseEvent) => void;
  onBackToLanding: () => void;
}

export const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  register,
  errors,
  loading,
  isLoading,
  showVerification,
  verifying,
  code,
  email,
  canResend,
  countdown,
  themeColors,
  textFieldInputProps,
  textFieldLabelProps,
  onVerifySubmit,
  onResendCode,
  onBackToLanding,
}) => {
  return (
    <Box component="form" onSubmit={onVerifySubmit}>
      <TextField
        {...register("code")}
        error={!!errors.code}
        helperText={errors.code?.message}
        disabled={loading || isLoading || !showVerification}
        fullWidth
        variant="outlined"
        label="Verification Code"
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <LockClockIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.7)" }} />
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={onResendCode}
                  disabled={loading || isLoading || !email || !canResend}
                  size="small"
                  sx={{
                    background: themeColors.primary,
                    color: "#fff",
                    fontWeight: 700,
                    padding: "5px",
                    minWidth: countdown > 0 ? "80px" : "auto",
                    "&:hover": {
                      background: themeColors.primaryLight,
                      color: "#fff",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(0, 0, 0, 0.12)",
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                >
                  {loading || isLoading ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    "GET CODE"
                  )}
                </Button>
              </InputAdornment>
            ),
            ...textFieldInputProps,
          },
          inputLabel: textFieldLabelProps,
        }}
      />

      {/* VERIFY BUTTON */}
      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={verifying || loading || isLoading || !showVerification || !code}
        sx={{
          py: 1.5,
          textTransform: "none",
          mb: 2,
          color: "#fff",
          background: themeColors.primary,
          "&:hover": {
            background: themeColors.primaryHover,
          },
          "&.Mui-disabled": {
            background: "rgba(0, 0, 0, 0.12)",
            color: "#fff",
          },
        }}
      >
        {verifying ? (
          <CircularProgress size={24} sx={{ color: "#fff" }} />
        ) : (
          "Verify"
        )}
      </Button>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBackToLanding}
          sx={{
            color: themeColors.primary,
            textTransform: "none",
            "&:hover": {
              background: "transparent",
              color: themeColors.primaryHover,
            },
          }}
        >
          Back to Landing Page
        </Button>
      </Box>
    </Box>
  );
};
