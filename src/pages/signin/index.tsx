"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  CircularProgress,
  Container,
} from "@mui/material";
import {
  Email as EmailIcon,
  LockClock as LockClockIcon,
  Google as GoogleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { registerUser, verifyOTP } from "../../store/slices/authSlice";
import type { RootState, AppDispatch } from "../../store/store";
import Cookies from "js-cookie";

type EmailFormData = { email: string };
type CodeFormData = { code: string };

export default function SignIn() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: reduxError } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    watch: watchEmail,
  } = useForm<EmailFormData>();
  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
    watch: watchCode,
  } = useForm<CodeFormData>();

  const email = watchEmail("email");
  const code = watchCode("code");

  const onEmailSubmit = async (data: EmailFormData) => {
    const emailToSend = data.email.toLowerCase().trim();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await dispatch(registerUser(emailToSend)).unwrap();
      setShowVerification(true);
      setSuccess(
        `Please verify your email - we've sent a code to ${emailToSend}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (data: CodeFormData) => {
    if (!code || !email) return;
    setError("");
    try {
      const response = await dispatch(
        verifyOTP({
          email: email.toLowerCase().trim(),
          otp: code,
        })
      ).unwrap();

      // Check if we have a token before redirecting
      if (response.token) {
        // First clear any existing tokens
        localStorage.removeItem("api_token");
        Cookies.remove("api_token");

        // Then set the new token with a small delay to ensure it's set
        localStorage.setItem("api_token", response.token);
        Cookies.set("api_token", response.token, {
          expires: 30, // 30 days
          path: "/",
          sameSite: "lax",
        });

        // Add a small delay before redirecting to ensure tokens are set
        setTimeout(() => {
          // Check if there's a returnUrl in the query parameters
          const returnUrl = router.query.returnUrl as string;
          // First check if user has a profile
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`,
            {
              headers: {
                Authorization: `Bearer ${response.token}`,
              },
            }
          )
            .then((profileResponse) => {
              if (!profileResponse.ok) {
                throw new Error("Profile check failed");
              }
              return profileResponse.json();
            })
            .then((profileData) => {
              const hasProfile =
                profileData &&
                profileData.type &&
                Object.keys(profileData).length > 0;
              if (returnUrl) {
                if (!hasProfile) {
                  // If no profile, go to preferences first with returnUrl
                  router.push(
                    `/preferences?returnUrl=${encodeURIComponent(returnUrl)}`
                  );
                } else {
                  // If profile exists, go to returnUrl
                  router.push(decodeURIComponent(returnUrl));
                }
              } else {
                if (!hasProfile) {
                  // If no return URL, go to preferences
                  router.push("/preferences");
                } else if (profileData.type === 'Candidate') {
                  router.push("/dashboardCandidate");
                } else if (profileData.type === 'Company') {
                  router.push("/dashboardCompany");
                }
              }
            })
            .catch(() => {
              // If profile check fails, go to preferences with returnUrl
              if (returnUrl) {
                router.push(
                  `/preferences?returnUrl=${encodeURIComponent(returnUrl)}`
                );
              } else {
                router.push(`/preferences`);
              }
            });
        }, 100);
      } else {
        setError("Verification successful but no token received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  // Use Redux error if available
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);
  const userType = useSelector((state: RootState) => state.user.userType);
  useEffect(() => {
    console.log("userType", userType);
  }, [userType]);
  return (
    <Box
      sx={{
        mt: { xs: 3, sm: 4, md: 5 },
        minHeight: "100vh",
        background: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Content */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Card
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(2, 226, 255, 0.08)",
            boxShadow: "0px 4px 50px 0px rgba(20, 189, 124, 0.15)",
            transform: "translateY(-2vh)",
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={userType === "company" ? "/logo.svg" : "/logojobSeeker.svg"}
              alt="TalentAI Logo"
              sx={{ height: 32, cursor: 'pointer' }}
              onClick={() => router.push("/")}
            />
            <Typography
              variant="caption"
              sx={{
                color: "#000",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                mt: 0.5,
              }}
            >
              Professional Recruitment
            </Typography>
          </Box>

          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              background: userType === "company" ?
                "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)" :
                "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              letterSpacing: "-0.01em",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#000",
              mb: 4,
              maxWidth: "80%",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Sign in to access your recruitment dashboard
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: "rgba(211, 47, 47, 0.08)",
                borderLeft: "4px solid #ff4444",
                "& .MuiAlert-icon": {
                  color: "#ff4444",
                },
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                bgcolor: "rgba(46, 125, 50, 0.08)",
                borderLeft: "4px solid #00FFC3",
                "& .MuiAlert-icon": {
                  color: "#00FFC3",
                },
              }}
            >
              {success}
            </Alert>
          )}

          {/* EMAIL FORM */}
          <Box
            component="form"
            onSubmit={handleEmailSubmit(onEmailSubmit)}
            sx={{ mb: 2 }}
          >
            <TextField
              {...registerEmail("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={!!emailErrors.email}
              helperText={emailErrors.email?.message}
              disabled={loading || isLoading}
              fullWidth
              variant="outlined"
              label="Email Address"
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.7)" }} />
                ),
                sx: {
                  color: "#000",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: "rgba(0, 0, 0, 0.7)",
                  "&.Mui-focused": {
                    color: "rgba(6, 9, 8, 0.83)",
                  },
                },
              }}
            />
          </Box>

          {/* CODE INPUT */}
          <Box component="form" onSubmit={handleCodeSubmit(onVerifySubmit)}>
            <TextField
              {...registerCode("code")}
              error={!!codeErrors.code}
              helperText={codeErrors.code?.message}
              disabled={loading || isLoading || !showVerification}
              fullWidth
              variant="outlined"
              label="Verification Code"
              InputProps={{
                startAdornment: (
                  <LockClockIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.7)" }} />
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={handleEmailSubmit(onEmailSubmit)}
                      disabled={loading || isLoading || !email}
                      size="small"
                      sx={{
                        background: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                        color: "black",
                        padding: "5px",
                        "&:hover": {
                          background: "rgba(2, 0, 0, 0.1)",
                        },
                      }}
                    >
                      {loading || isLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        "Get Code"
                      )}
                    </Button>
                  </InputAdornment>
                ),

                sx: {
                  color: "#000",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: "rgba(0, 0, 0, 0.7)",
                  "&.Mui-focused": {
                    color: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)", // Keep it black on focus
                  },
                },
              }}
              sx={{ mb: 2 }}
            />

            {/* VERIFY BUTTON */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || isLoading || !showVerification || !code}
              sx={{
                py: 1.5,
                textTransform: "none",
                mb: 2,
                color: "#fff",
                background: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
                "&:hover": {
                  background: userType === "company" ? "rgba(41, 210, 145, 0.73)" : "rgba(131, 16, 255, 0.73)",
                },
                "&.Mui-disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "#fff",
                },
              }}
            >
              {loading || isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "rgba(0, 0, 0, 0.7)" }}
                />
              ) : (
                "Verify"
              )}
            </Button>
          </Box>

          {/* <Divider
            sx={{
              my: 2,
              "&::before, &::after": {
                borderColor: "rgba(0, 0, 0, 0.1)",
              },
              color: "rgba(0, 0, 0, 0.7)",
            }}
          >
            OR
          </Divider> */}

          {/* GOOGLE SIGN IN */}
          {/* <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={() => signIn("google")}
            sx={{
              py: 1.5,
              textTransform: "none",
              color: "#fff",
              background: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
              "&:hover": {
                background: userType === "company" ? "rgba(41, 210, 145, 0.73)" : "rgba(131, 16, 255, 0.73)",
              },
              "&.Mui-disabled": {
                background: "rgba(0, 0, 0, 0.12)",
                color: "#fff",
              },
            }}
          >
            Continue with Google
          </Button> */}
        </Card>
      </Container>
    </Box>
  );
}