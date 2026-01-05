"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Box, Card, Container } from "@mui/material";
import { registerUser, verifyOTP, setLoggingOut } from "@/store/slices/authSlice";
import type { RootState, AppDispatch } from "@/store/store";
import Cookies from "js-cookie";
import { getUserLocation } from "@/utils/api";
import {
  SignInHeader,
  EmailForm,
  VerificationCodeForm,
  AlertMessages,
  LoadingScreen,
} from "@/components/auth";
import { isTokenExpired } from "@/utils/tokenUtils";

type EmailFormData = { email: string };
type CodeFormData = { code: string };

// Constants
const RESEND_COUNTDOWN_SECONDS = 60;

// Helper functions
const isValidToken = (token: string | undefined): boolean => {
  if (!token) return false;
  return !isTokenExpired(token);
};

const clearAuthTokens = () => {
  localStorage.removeItem("api_token");
  Cookies.remove("api_token");
};

const hasValidProfile = (profile: any): boolean => {
  return (
    profile &&
    profile !== null &&
    typeof profile === "object" &&
    Object.keys(profile).length > 0 &&
    profile.type
  );
};

const hasValidUser = (user: any): boolean => {
  return user && Object.keys(user || {}).length > 0;
};

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [postVerifyRedirect, setPostVerifyRedirect] = useState<{
    hasProfile: boolean;
    returnUrl?: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    error: reduxError,
  } = useSelector((state: RootState) => state.auth);
  const userType = useSelector((state: RootState) => state.user.userType);

  // Safe access to Redux state to prevent hydration issues
  const safeUser = isClient ? user : null;
  const safeProfile = isClient ? profile : null;
  const safeIsLoading = isClient ? isLoading : false;

  // Theme-based colors and styles
  const themeColors = {
    primary: userType === "company" ? "rgba(41, 210, 145, 0.83)" : "rgba(131, 16, 255, 0.83)",
    primaryHover: userType === "company" ? "rgba(41, 210, 145, 0.73)" : "rgba(131, 16, 255, 0.73)",
    primaryLight: userType === "company" ? "rgba(41, 210, 145, 0.93)" : "rgba(131, 16, 255, 0.93)",
    gradient: userType === "company"
      ? "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)"
      : "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
  };

  // Reusable text field styles
  const textFieldInputProps = {
    sx: {
      color: "#000",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: themeColors.primary },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: themeColors.primary },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: themeColors.primary },
    },
  };

  const textFieldLabelProps = {
    sx: {
      color: "rgba(0, 0, 0, 0.7)",
      "&.Mui-focused": { color: themeColors.primary },
    },
  };

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

  const onEmailSubmit = useCallback(async (data: EmailFormData) => {
    const emailToSend = data.email.toLowerCase().trim();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log('Attempting to register user with email:', emailToSend);
      await dispatch(registerUser(emailToSend)).unwrap();
      setShowVerification(true);
      setSuccess(
        `Please verify your email - we've sent a code to ${emailToSend}`
      );
      setCountdown(RESEND_COUNTDOWN_SECONDS);
      setCanResend(false);
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage =
        typeof err === 'string' ? err :
        err instanceof Error ? err.message :
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  const onVerifySubmit = useCallback(async (_data: CodeFormData) => {
    if (!code || !email) return;

    setError("");
    setVerifying(true);

    try {
      const userLocation = await getUserLocation();
      const response = await dispatch(
        verifyOTP({
          email: email.toLowerCase().trim(),
          otp: code,
          location: userLocation,
        })
      ).unwrap();

      if (!response.token) {
        setError("Verification successful but no token received");
        setVerifying(false);
        return;
      }

      // Save token
      clearAuthTokens();
      localStorage.setItem("api_token", response.token);
      Cookies.set("api_token", response.token, {
        expires: 30,
        path: "/",
        sameSite: "lax",
      });

      // Defer redirect until Redux user state is updated
      setPostVerifyRedirect({
        hasProfile: hasValidProfile(response.profile),
        returnUrl: router.query.returnUrl as string | undefined,
      });
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      const errorMessage =
        typeof err === 'string' ? err :
        err?.message || err?.error ||
        "OTP verification failed. Please try again.";

      setError(errorMessage);
      setVerifying(false);
    }
  }, [code, email, dispatch, router.query.returnUrl]);

  // Get redirect path based on user role
  const getRedirectPath = useCallback((role?: string): string => {
    switch (role) {
      case "Admin":
        return "/dashboard/admin";
      case "Candidate":
        return "/dashboard/candidate";
      case "Company":
        return "/dashboard/company";
      default:
        return "/dashboard/candidate";
    }
  }, []);

  // Redirect only after Redux auth.user is populated
  useEffect(() => {
    if (!isClient || !postVerifyRedirect || !hasValidUser(safeUser)) return;

    const { hasProfile, returnUrl } = postVerifyRedirect;

    const performRedirect = async () => {
      try {
        // Admin users should always go to their dashboard, never to preferences
        if (safeUser?.role === 'Admin') {
          router.replace('/dashboard/admin');
          return;
        }

        if (returnUrl) {
          router.replace(
            hasProfile
              ? decodeURIComponent(returnUrl)
              : `/preferences?returnUrl=${encodeURIComponent(returnUrl)}`
          );
        } else {
          router.replace(
            hasProfile ? getRedirectPath(safeUser?.role) : "/preferences"
          );
        }
      } finally {
        setVerifying(false);
        setPostVerifyRedirect(null);
      }
    };

    void performRedirect();
  }, [safeUser, postVerifyRedirect, router, isClient, getRedirectPath]);

  // Use Redux error if available
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Initialize client-side and clean up auth state
  useEffect(() => {
    setIsClient(true);

    // Reset redirect state to prevent infinite loops
    const { resetRedirectStateIfOnSignin } = require('@/utils/authRedirect');
    resetRedirectStateIfOnSignin();
    setLoggingOut(false);

    // Clear expired tokens
    const token = localStorage.getItem('api_token');
    if (token && !isValidToken(token)) {
      console.log('🔒 Signin: Clearing expired token on mount');
      clearAuthTokens();
    }
  }, []);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!isClient || !router.isReady) return;

    // Verify token validity before redirecting
    const token = localStorage.getItem('api_token');
    const cookieToken = Cookies.get('api_token');

    if (!token && !cookieToken) {
      setCheckingAuth(false);
      return;
    }

    // Clear expired tokens
    if (token) {
      const { isTokenExpired } = require('@/utils/tokenUtils');
      if (isTokenExpired(token)) {
        console.log('🔒 Signin: Token expired, clearing and staying on signin');
        clearAuthTokens();
        setCheckingAuth(false);
        return;
      }
    }

    // Redirect authenticated users
    if (hasValidUser(safeUser) && isAuthenticated) {
      const returnUrl = router.query.returnUrl as string | undefined;
      const userHasProfile = hasValidProfile(safeProfile);

      // Admin users should always go to their dashboard, never to preferences
      if (safeUser.role === 'Admin') {
        router.push('/dashboard/admin');
      } else if (returnUrl) {
        router.push(
          userHasProfile
            ? decodeURIComponent(returnUrl)
            : `/preferences?returnUrl=${encodeURIComponent(returnUrl)}`
        );
      } else {
        router.push(userHasProfile ? getRedirectPath(safeUser.role) : "/preferences");
      }
    } else if (!safeIsLoading) {
      setCheckingAuth(false);
    }
  }, [router.isReady, safeUser, safeProfile, router, safeIsLoading, isClient, isAuthenticated, getRedirectPath]);

  // Show loading while checking authentication or on server
  if (!isClient || (checkingAuth && (safeIsLoading || hasValidUser(safeUser)))) {
    return <LoadingScreen />;
  }

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
          <SignInHeader themeColors={themeColors.gradient} />

          <AlertMessages error={error} success={success} />

          <EmailForm
            register={registerEmail}
            errors={emailErrors}
            loading={loading}
            isLoading={isLoading}
            textFieldInputProps={textFieldInputProps}
            textFieldLabelProps={textFieldLabelProps}
            onSubmit={handleEmailSubmit(onEmailSubmit)}
          />

          <VerificationCodeForm
            register={registerCode}
            errors={codeErrors}
            loading={loading}
            isLoading={isLoading}
            showVerification={showVerification}
            verifying={verifying}
            code={code}
            email={email}
            canResend={canResend}
            countdown={countdown}
            themeColors={themeColors}
            textFieldInputProps={textFieldInputProps}
            textFieldLabelProps={textFieldLabelProps}
            userType={userType}
            onVerifySubmit={handleCodeSubmit(onVerifySubmit)}
            onResendCode={handleEmailSubmit(onEmailSubmit)}
            onBackToLanding={() => router.push(userType === "company" ? "/home/company" : "/home/candidate")}
          />
        </Card>
      </Container>
    </Box>
  );
}
