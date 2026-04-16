import React, { useEffect, useMemo, useState, useRef } from "react";
import { Box, TextField, Button, Typography, Stack, CircularProgress } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { signinUser, verifyOTP } from "@/store/slices/authSlice";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { getUserLocation } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/router";
import { formatTimeLeft } from "@/utils/functions";

type FormValues = {
  email: string;
  code: string;
};

const emailSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const codeSchema = Yup.object({
  code: Yup.string()
    .length(6, "Code must be 6 digits")
    .required("Verification code is required"),
});

const CODE_LENGTH = 6;

interface Props {
  themeColors: any;
}

const SigninForm: React.FC<Props> = ({ themeColors }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const returnUrl = router.query.returnUrl as string | undefined;
      console.log(returnUrl, "returnUrl.....")

const invitationEmail = useMemo(() => {
  if (!returnUrl) return "";

  try {
    // Provide a base URL so relative paths work
    const url = new URL(decodeURIComponent(returnUrl), window.location.origin);

    const token = url.searchParams.get("token");
    if (!token) return "";

    // Handle URL-safe Base64
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return "";

    const payload = JSON.parse(atob(base64));
    // Some JWTs use different keys for email
    return payload.userEmail ?? payload.email ?? payload.inviteeEmail ?? "";
  } catch (err) {
    console.log("Error parsing invitation URL:", err);
    return "";
  }
}, [returnUrl]);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const CODE_TTL = 300; // 5 minutes
  const CODE_EXPIRY_KEY = "email_code_expires_at";

  const {
    secondsLeft,
    isExpired,
    isRunning,
    start: startTimer,
    clear: clearTimer,
  } = usePersistentCountdown({
    ttl: CODE_TTL,
    storageKey: CODE_EXPIRY_KEY,
  });

  const handleSendCode = async (email: string) => {
    const emailToSend = email.toLowerCase().trim();
    setLoading(true);

    try {
      await dispatch(signinUser(emailToSend)).unwrap();
      startTimer();
      setStep(2);
    } catch (err: any) {
      showToast({
        message: err || "Sign in failed. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (values: FormValues) => {
    setLoading(true);
    try {
      clearTimer();
      const userLocation = await getUserLocation();
      const response = await dispatch(
        verifyOTP({
          email: values.email.toLowerCase().trim(),
          otp: values.code,
          location: userLocation,
        })
      ).unwrap();
      if (!response.token) {
        showToast({
          message:
            "Verification successful, but there was an issue signing you in. Please try again.",
          severity: "error",
        });
        setLoading(false);
        return;
      }
      // Fetch permissions for employees before redirecting
      if (response.user?.role === "Employee" && response.user?._id) {
        await dispatch(fetchEmployeePermissions(response.user._id));
      }
      // Keep loading state active during redirect
      handleRedirectTo(response.user, response.profile);
    } catch (err: any) {
      showToast({
        message:
          "The code you entered didn't match. Please check and try again.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleRedirectTo = (user: any, profile: any) => {
    const userRole = user?.role;
    const hasProfile = !!profile?._id;

    if (userRole === "Admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (!hasProfile) {
      router.replace(
        returnUrl
          ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/register"
      );
      return;
    }

    if (returnUrl) {
      router.replace(decodeURIComponent(returnUrl));
      return;
    }

    if (userRole === "Employee") {
      router.replace("/employee/dashboard");
      return;
    }

    if (userRole === "Company") {
      router.replace("/company/dashboard");
      return;
    }

    router.replace("/dashboard/candidate");
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ email: invitationEmail, code: "" }}
      validationSchema={step === 1 ? emailSchema : codeSchema}
      onSubmit={(values) => {
        if (step === 1) {
          handleSendCode(values.email);
        } else {
          handleVerifyCode(values);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        setFieldValue,
      }) => (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          {/* STEP 1 – EMAIL */}
          {step === 1 && (
            <TextField
              name="email"
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={
                invitationEmail
                  ? "Email pre-filled from your invitation"
                  : touched.email && errors.email
              }
              fullWidth
              label="Email Address"
              disabled={loading || !!invitationEmail}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "rgba(0,0,0,0.6)" }} />
                ),
              }}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#666",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgb(203 203 203)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(203 203 203)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgb(203 203 203)",
                  },
                },
              }}
            />
          )}

          {/* STEP 2 – 6 DIGIT CODE */}
          {step === 2 && (
            <>
              <Stack direction="row" spacing={1} justifyContent="center">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <TextField
                    key={index}
                    inputRef={(el) => (codeInputsRef.current[index] = el)}
                    value={values.code[index] || ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, ""); // only digits
                      if (!raw) {
                        // allow clearing
                        const arr = values.code.split("");
                        arr[index] = "";
                        setFieldValue("code", arr.join(""));
                        return;
                      }

                      const arr = values.code.split("");
                      arr[index] = raw[0]; // first digit typed
                      setFieldValue("code", arr.join(""));

                      if (index < CODE_LENGTH - 1) {
                        codeInputsRef.current[index + 1]?.focus();
                      }
                    }}
                    onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      const paste = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, ""); // keep only digits
                      if (!paste) return;

                      const arr = values.code.split("");
                      for (let i = 0; i < CODE_LENGTH; i++) {
                        arr[i] = paste[i] || arr[i] || "";
                      }
                      setFieldValue("code", arr.join(""));

                      // focus last filled input
                      const nextIndex = Math.min(paste.length, CODE_LENGTH - 1);
                      codeInputsRef.current[nextIndex]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !values.code[index] &&
                        index > 0
                      ) {
                        codeInputsRef.current[index - 1]?.focus();
                      }
                    }}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        fontSize: "1.25rem",
                      },
                    }}
                    sx={{
                      width: 48,
                      "& .MuiInputLabel-root": {
                        color: "#666",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#666",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgb(203 203 203)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgb(203 203 203)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "rgb(203 203 203)",
                        },
                      },
                    }}
                  />
                ))}
              </Stack>

              {touched.code && errors.code && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.code}
                </Typography>
              )}
              {!touched.code ||
                (!errors.code && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", textAlign: "center", mt: 1 }}
                  >
                    Enter the 6-digit code we sent to{" "}
                    <strong>{values.email}</strong>
                  </Typography>
                ))}
            </>
          )}
          {(isExpired || isRunning) && (
            <Stack alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  mt: 1,
                  fontWeight: 500,
                  color:
                    secondsLeft > 10
                      ? "text.secondary"
                      : secondsLeft > 0
                      ? "warning.main"
                      : "error.main",
                  transition: "color 0.3s ease",
                }}
              >
                {secondsLeft > 0
                  ? `Code expires in ${formatTimeLeft(secondsLeft)}`
                  : "The verification code has expired"}
              </Typography>
            </Stack>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "38px",
              padding: "12px 24px",
              height: 42,
              maxWidth: "100%",
              background: themeColors.primary,
              color: "#ffffff",
              letterSpacing: 0.3,
              boxShadow: "0 2px 8px themeColors.primaryLight",
              "&:hover": {
                background: themeColors.primaryLight,
                boxShadow: "0 4px 12px themeColors.primaryHover",
              },
              "&.Mui-disabled": {
                background: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
            disabled={
              loading ||
              (step === 2 && !isExpired && values.code.length < CODE_LENGTH)
            }
            onClick={() => {
              if (step === 2 && isExpired) {
                setFieldValue("code", "", false);
                codeInputsRef.current.forEach((input) => {
                  if (input) input.value = "";
                });
                handleSendCode(values.email);
              }
            }}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: "#ffffff" }} /> : undefined}
          >
            {loading
              ? (step === 1 ? "Sending..." : step === 2 && isExpired ? "Resending..." : "Verifying...")
              : (step === 1
                ? "Send Code"
                : step === 2 && isExpired
                ? "Resend Code"
                : "Verify & Sign In")
            }
          </Button>
          {step === 2 && (
            <Button
              variant="text"
              fullWidth
              size="medium"
              sx={{
                mt: 2,
                px: 2,
                py: 1,
                color: themeColors.primary,
                borderRadius: "38px",
                fontWeight: 500,
                textTransform: "none",
                boxShadow: "none",
                transition: "all 0.3s ease-in-out",
                background: "rgba(0,0,0,0.05)",
                ":hover": {
                  transform: "scale(1.02)",
                },
                ":active": {
                  transform: "scale(0.98)",
                },
              }}
              onClick={() => {
                clearTimer();
                setStep(1);
                setFieldValue("code", "");
              }}
            >
              Change email
            </Button>
          )}
        </Box>
      )}
    </Formik>
  );
};

export default SigninForm;
