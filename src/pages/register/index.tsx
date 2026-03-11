import { useState } from "react";
import CandidateRegisterForm from "@/components/features/register/CandidateRegisterForm";
import CompanyRegisterForm from "@/components/features/register/CompanyRegisterForm";
import SigninContainer from "@/components/features/signin/SinginContainer";
import { Box, Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";
import RegisterContainer from "@/components/features/register/RegisterContainer";

type UserType = "candidate" | "company";

const config = {
  candidate: {
    logo: "/logo-purple.svg",
    primary: "rgba(131, 16, 255, 0.83)",
    gradient: "linear-gradient(135deg, rgba(131, 16, 255, 0.33), #8310FF)",
    title: "Create your account",
    subtitle: "Join TalentAI and discover your next opportunity",
    landing: "/home/candidate",
  },
  company: {
    logo: "/logo.svg",
    primary: "rgba(41, 210, 145, 0.83)",
    gradient: "linear-gradient(135deg, rgba(41, 210, 145, 0.33), #00FF9D)",
    title: "Register your company",
    subtitle: "Start hiring top talent with AI-powered recruitment",
    landing: "/home/company",
  },
};

const Register = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const hasReturnUrl = !!returnUrl;
  const [userType, setUserType] = useState<UserType>("candidate");
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const theme = config[userType];
  const isOtpStep = formStep === 2;

  return (
    <RegisterContainer>
      {/* Logo */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          component="img"
          src={theme.logo}
          alt="TalentAI Logo"
          sx={{ height: 32, cursor: "pointer" }}
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

      {/* Type Toggle — hidden on OTP step or when coming from a returnUrl (always candidate) */}
      {!isOtpStep && !hasReturnUrl && (
        <Box
          sx={{
            display: "flex",
            background: "rgba(0,0,0,0.05)",
            borderRadius: "38px",
            p: "4px",
            mb: 3,
          }}
        >
          {(["candidate", "company"] as UserType[]).map((type) => (
            <Box
              key={type}
              onClick={() => setUserType(type)}
              sx={{
                flex: 1,
                py: 0.8,
                borderRadius: "34px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
                letterSpacing: 0.3,
                transition: "all 0.25s ease",
                background: userType === type ? config[type].primary : "transparent",
                color: userType === type ? "#fff" : "#666",
                userSelect: "none",
              }}
            >
              {type === "candidate" ? "Candidate" : "Company"}
            </Box>
          ))}
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
      <Typography
        variant="body2"
        sx={{ color: "#555", mb: 3, maxWidth: "80%", mx: "auto", lineHeight: 1.6 }}
      >
        {isOtpStep
          ? "We sent a 6-digit verification code to your email"
          : theme.subtitle}
      </Typography>

      {/* Form */}
      {userType === "candidate" ? (
        <CandidateRegisterForm onStepChange={setFormStep} />
      ) : (
        <CompanyRegisterForm onStepChange={setFormStep} />
      )}

      <Divider sx={{ my: 2 }} />

      {/* Footer */}
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
            onClick={() => router.push("/signin")}
          >
            Sign in
          </Typography>
        </Typography>
      </Box>
    </RegisterContainer>
  );
};

export default Register;
