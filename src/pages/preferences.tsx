"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Cookies from "js-cookie";
import { usePreferences } from "@/components/preferences/hooks/usePreferences";
import { Box, Card, Typography } from "@mui/material";
import OnboardingStepper from "@/components/preferences/OnboardingStepper";

function Preferences() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const  preferences = usePreferences();
  const { userType, setUserType, setIsTestJobReturnUrl } = preferences;

  // Add effect to check traffic counter
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkProfile = async () => {
      // Check if returnUrl points to a test job
      const returnUrl = router.query.returnUrl as string;
      if (returnUrl && returnUrl.includes("/testjob/")) {
        setIsTestJobReturnUrl(true);
        setIsCheckingProfile(false);
        return;
      }

      try {
        const token = localStorage.getItem("api_token");

        if (!token) {
          // Don't redirect if already on signin page
          if (router.pathname !== "/signin") {
            router.push("/signin");
          }
          setIsCheckingProfile(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Handle 401 - token expired
        if (response.status === 401) {
          // Clear tokens and redirect
          localStorage.removeItem("api_token");
          Cookies.remove("api_token");
          if (router.pathname !== "/signin") {
            router.push("/signin");
          }
          setIsCheckingProfile(false);
          return;
        }

        // If profile exists and is valid, check returnUrl
        if (response.ok) {
          const data = await response.json();

          // Check if profile is complete
          const isProfileComplete =
            data &&
            data.type &&
            (data.type === "Candidate" || data.type === "Company");

          if (isProfileComplete) {
            // Keep showing loading while redirecting
            // Immediate redirect for existing users
            if (returnUrl) {
              router.replace(decodeURIComponent(returnUrl));
              return;
            }

            // If no returnUrl, redirect to appropriate dashboard immediately
            if (data.type === "Company") {
              router.replace("/dashboard/company");
            } else {
              router.replace("/dashboard/candidate");
            }
            return; // Keep loading state during redirect
          }
          // If profile is not complete, stay on preferences page
          setIsCheckingProfile(false);
        } else {
          // If profile doesn't exist or is invalid, stay on preferences page
          setIsCheckingProfile(false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        // Stay on preferences page to create profile
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [router, isClient, setIsTestJobReturnUrl]);

  // Add effect to check for returnUrl on component mount
  useEffect(() => {
    if (!isClient) return;

    const returnUrl = router.query.returnUrl as string;
    if (returnUrl && returnUrl.includes("/testjob/")) {
      setIsTestJobReturnUrl(true);
      setUserType("candidate");
    }
  }, [router.query.returnUrl, isClient, setIsTestJobReturnUrl, setUserType]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient || !user) {
    return null;
  }

  // Show loading state while checking profile
  if (isCheckingProfile) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: 'rgba(251, 254, 255, 1)',
          gap: 2,
        }}
      >
        <Box
          component="img"
          src="/logo.svg"
          alt="TalentAI Logo"
          sx={{ height: 45 }}
        />
        <Typography sx={{ color: "#666", fontSize: "14px" }}>
          Verifying your profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: 'rgba(251, 254, 255, 1)',
        minHeight: '100vh'
      }}
    >
      <Box
        component="img"
        src={userType === "candidate" ? "/logo-purple.svg" : "/logo.svg"}
        alt="TalentAI Logo"
        sx={{ height: 45, mt: 4, mb: 2 }}
      />
      <Card
        sx={{
          py: 6,
          px: 4,
          maxWidth: 900,
          width: "80%",
          position: "relative",
          border: "1px solid transparent",
          borderRadius: "12px",
          background:
            "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(0deg, rgba(189, 133, 255, 0.18), rgba(189, 133, 255, 0.18)) border-box",
        }}
      >
        <OnboardingStepper preferences={preferences}/>
      </Card>
      {/* <PreferencesMain /> */}
    </Box>
  );
}

// Export with dynamic import to prevent SSR hydration issues
export default dynamic(() => Promise.resolve(Preferences), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h6 style={{ color: "#666" }}>Loading...</h6>
    </div>
  ),
});
