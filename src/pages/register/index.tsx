import { useState } from "react";
import CandidateRegisterForm from "@/components/features/register/CandidateRegisterForm";
import CompanyRegisterForm from "@/components/features/register/CompanyRegisterForm";
import { Box, Divider, Typography } from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/router";
import RegisterContainer from "@/components/features/register/RegisterContainer";

type UserType = "candidate" | "company";

const config = {
  candidate: {
    logo: "/logo-purple.svg",
    primary: "#8310FF",
    gradient: "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
    title: "Create your account",
    subtitle: "Join TalentAI and discover your next opportunity",
  },
  company: {
    logo: "/logo.svg",
    primary: "#0CDA8B",
    gradient: "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)",
    title: "Register your company",
    subtitle: "Start hiring top talent with AI-powered recruitment",
  },
};

const ROLES = [
  {
    type: "company" as UserType,
    icon: BusinessOutlined,
    label: "Register as a Company",
    description: "Hiring talent and want to streamline recruitment with AI",
    accent: "#0CDA8B",
    accentBg: "#F0FDF4",
    border: "#A7F3D0",
  },
  {
    type: "candidate" as UserType,
    icon: PersonOutlined,
    label: "Register as a Candidate",
    description: "Looking for opportunities and want AI-powered job matching",
    accent: "#8310FF",
    accentBg: "#F5F3FF",
    border: "#E9D5FF",
  },
];

const Register = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const hasReturnUrl = !!returnUrl;
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  const theme = config[userType ?? "candidate"];
  const isOtpStep = formStep === 2;
  const showRoleSelect = !userType;

  return (
    <RegisterContainer>
      {/* Logo */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          component="img"
          src={showRoleSelect ? "/logo-purple.svg" : theme.logo}
          alt="TalentAI Logo"
          sx={{ height: 32, cursor: "pointer" }}
          onClick={() => router.push("/")}
        />
        <Typography
          variant="caption"
          sx={{ color: "#000", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.7rem", mt: 0.5 }}
        >
          Professional Recruitment
        </Typography>
      </Box>

      {/* Role selection screen */}
      {showRoleSelect ? (
        <>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.75, color: "#111827", letterSpacing: "-0.01em" }}>
            Get started with TalentAI
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 3.5 }}>
            Tell us how you plan to use the platform
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
            {ROLES.map(({ type, icon: Icon, label, description, accent, accentBg, border }) => (
              <Box
                key={type}
                onClick={() => setUserType(type)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2.5,
                  borderRadius: "14px",
                  border: `1.5px solid ${border}`,
                  bgcolor: accentBg,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 4px 20px ${accent}25`,
                    transform: "translateY(-2px)",
                    borderColor: accent,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "12px",
                    bgcolor: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: "#fff" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", fontSize: "0.8rem", lineHeight: 1.4 }}>
                    {description}
                  </Typography>
                </Box>
                <ArrowForwardOutlined sx={{ fontSize: 20, color: accent, flexShrink: 0 }} />
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Already have an account?{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "#8310FF", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => router.push("/signin")}
              >
                Sign in
              </Typography>
            </Typography>
          </Box>
        </>
      ) : (
        <>
          {/* Back to role select */}
          {!isOtpStep && !hasReturnUrl && (
            <Box
              onClick={() => { setUserType(null); setFormStep(1); }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 2,
                cursor: "pointer",
                color: "#9CA3AF",
                fontSize: "0.8rem",
                fontWeight: 500,
                width: "fit-content",
                "&:hover": { color: "#374151" },
              }}
            >
              <ArrowForwardOutlined sx={{ fontSize: 15, transform: "rotate(180deg)" }} />
              Change role
            </Box>
          )}

          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              background: theme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {isOtpStep ? "Check your inbox" : theme.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555", mb: 3, maxWidth: "80%", mx: "auto", lineHeight: 1.6 }}>
            {isOtpStep ? "We sent a 6-digit verification code to your email" : theme.subtitle}
          </Typography>

          {/* Form */}
          {userType === "candidate" ? (
            <CandidateRegisterForm key="candidate" onStepChange={setFormStep} />
          ) : (
            <CompanyRegisterForm key="company" onStepChange={setFormStep} />
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
              Already have an account?{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: theme.primary,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => router.push(returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin")}
              >
                Sign in
              </Typography>
            </Typography>
          </Box>
        </>
      )}
    </RegisterContainer>
  );
};

export default Register;
