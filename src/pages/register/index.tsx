import { useState } from "react";
import CandidateRegisterForm from "@/components/features/register/CandidateRegisterForm";
import CompanyRegisterForm from "@/components/features/register/CompanyRegisterForm";
import { Box, Typography } from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/router";
import RegisterContainer from "@/components/features/register/RegisterContainer";
import Link from "next/link";

type UserType = "candidate" | "company";

const ACCENT = "#0D9488";
const ACCENT2 = "#059669";

const ROLES = [
  {
    type: "company" as UserType,
    icon: BusinessOutlined,
    label: "Register as a Company",
    description: "Hiring talent and want to streamline recruitment with AI",
    accent: "#0D9488",
    iconGradient: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
    shadowColor: "rgba(13,148,136,0.22)",
    border: "rgba(13,148,136,0.14)",
  },
  {
    type: "candidate" as UserType,
    icon: PersonOutlined,
    label: "Register as a Candidate",
    description: "Looking for opportunities and want AI-powered job matching",
    accent: "#7C3AED",
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    shadowColor: "rgba(124,58,237,0.2)",
    border: "rgba(124,58,237,0.14)",
  },
];

const FORM_TITLES = {
  company: { title: "Register your company", subtitle: "Start hiring top talent with AI-powered recruitment" },
  candidate: { title: "Create your account", subtitle: "Join TalentAI and discover your next opportunity" },
};

const SignInLink = ({ returnUrl }: { returnUrl?: string }) => (
  <Box sx={{ pt: 0.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "Poppins", whiteSpace: "nowrap" }}>
        Already have an account?
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
    <Link href={returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin"} style={{ textDecoration: "none" }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: 48, borderRadius: "14px",
        border: `1.5px solid ${ACCENT}44`,
        color: ACCENT, fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem",
        transition: "all 0.2s",
        "&:hover": { bgcolor: `${ACCENT}08`, borderColor: ACCENT },
      }}>
        Sign in to your account
      </Box>
    </Link>
  </Box>
);

const Register = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const hasReturnUrl = !!returnUrl;
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  const isOtpStep = formStep === 2;
  const showRoleSelect = !userType;
  const formConfig = userType ? FORM_TITLES[userType] : null;

  return (
    <RegisterContainer>
      {showRoleSelect ? (
        <>
          {/* Header */}
          <Box sx={{ mb: 3.5, textAlign: "center" }}>
            <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Poppins", color: "#0F172A", lineHeight: 1.1, mb: 0.75, letterSpacing: "-0.03em" }}>
              Get started
            </Typography>
            <Typography sx={{ fontSize: "1.05rem", color: "#6B7280", fontFamily: "Poppins", lineHeight: 1.65 }}>
              How will you use{" "}
              <Box component="span" sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>TalentAI</Box>?
            </Typography>
          </Box>

          {/* Role cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
            {ROLES.map(({ type, icon: Icon, label, description, accent, iconGradient, shadowColor, border }) => (
              <Box
                key={type}
                onClick={() => setUserType(type)}
                sx={{
                  display: "flex", alignItems: "center", gap: 2.5,
                  p: 2.5, borderRadius: "18px",
                  border: `1.5px solid ${border}`,
                  bgcolor: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  "&:hover": {
                    boxShadow: `0 10px 36px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.04)`,
                    transform: "translateY(-3px)",
                    borderColor: accent,
                  },
                }}
              >
                <Box sx={{
                  width: 54, height: 54, borderRadius: "15px",
                  background: iconGradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 6px 18px ${shadowColor}`,
                }}>
                  <Icon sx={{ fontSize: 26, color: "#fff" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A", mb: 0.3, fontFamily: "Poppins" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.82rem", lineHeight: 1.5, fontFamily: "Poppins" }}>
                    {description}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 32, height: 32, borderRadius: "10px",
                  bgcolor: `${accent}10`, border: `1px solid ${accent}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  <ArrowForwardOutlined sx={{ fontSize: 16, color: accent }} />
                </Box>
              </Box>
            ))}
          </Box>

          <SignInLink returnUrl={returnUrl} />
        </>
      ) : (
        <>
          {/* Form header */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            {!isOtpStep && !hasReturnUrl && (
              <Box
                onClick={() => { setUserType(null); setFormStep(1); }}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2.5,
                  cursor: "pointer", color: "#9CA3AF", fontFamily: "Poppins",
                  fontSize: "0.8rem", fontWeight: 500,
                  "&:hover": { color: ACCENT },
                  transition: "color 0.2s",
                }}
              >
                <ArrowForwardOutlined sx={{ fontSize: 15, transform: "rotate(180deg)" }} />
                Change role
              </Box>
            )}

            <Typography sx={{
              fontSize: "1.9rem", fontWeight: 800, fontFamily: "Poppins", color: "#0F172A",
              lineHeight: 1.15, mb: 0.75, letterSpacing: "-0.025em",
            }}>
              {isOtpStep ? "Check your inbox" : formConfig!.title}
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "#6B7280", fontFamily: "Poppins", lineHeight: 1.6 }}>
              {isOtpStep
                ? <>We sent a 6-digit code to <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>your email</Box></>
                : formConfig!.subtitle}
            </Typography>
          </Box>

          {userType === "candidate" ? (
            <CandidateRegisterForm key="candidate" onStepChange={setFormStep} />
          ) : (
            <CompanyRegisterForm key="company" onStepChange={setFormStep} />
          )}

          {!isOtpStep && <SignInLink returnUrl={returnUrl} />}
        </>
      )}
    </RegisterContainer>
  );
};

export default Register;
