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
import { useTranslation } from "react-i18next";

type UserType = "candidate" | "company";

const ACCENT  = "#0D9488";
const ACCENT2 = "#059669";

const SignInLink = ({ returnUrl, label }: { returnUrl?: string; label: string }) => (
  <Box sx={{ pt: 0.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography sx={{ fontSize: { xs: "0.6875rem", sm: "0.71875rem", md: "0.75rem" }, color: "#9CA3AF", fontFamily: "Poppins", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
    <Link href={returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin"} style={{ textDecoration: "none" }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "100%",
        height: { xs: 44, sm: 46, md: 48 },
        borderRadius: "14px",
        px: { xs: 1.5, sm: 2 },
        border: `1.5px solid ${ACCENT}44`,
        color: ACCENT, fontFamily: "Poppins", fontWeight: 700,
        fontSize: { xs: "0.82rem", sm: "0.88rem", md: "0.95rem" },
        transition: "all 0.2s",
        "&:hover": { bgcolor: `${ACCENT}08`, borderColor: ACCENT },
      }}>
        <Box component="span" sx={{ px: { xs: 0.25, md: 0 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: { xs: "normal", sm: "nowrap" }, textAlign: "center", lineHeight: 1.25 }}>
          {label}
        </Box>
      </Box>
    </Link>
  </Box>
);

const Register = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const hasReturnUrl = !!returnUrl;
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const isOtpStep = formStep === 2;
  const showRoleSelect = !userType;

  const ROLES = [
    {
      type: "company" as UserType,
      icon: BusinessOutlined,
      label: t("register.company_label"),
      description: t("register.company_desc"),
      accent: "#0D9488",
      iconGradient: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
      shadowColor: "rgba(13,148,136,0.22)",
      border: "rgba(13,148,136,0.14)",
    },
    {
      type: "candidate" as UserType,
      icon: PersonOutlined,
      label: t("register.candidate_label"),
      description: t("register.candidate_desc"),
      accent: "#7C3AED",
      iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
      shadowColor: "rgba(124,58,237,0.2)",
      border: "rgba(124,58,237,0.14)",
    },
  ];

  const FORM_TITLES = {
    company:   { title: t("register.company_title"),   subtitle: t("register.company_subtitle") },
    candidate: { title: t("register.candidate_title"), subtitle: t("register.candidate_subtitle") },
  };

  const formConfig = userType ? FORM_TITLES[userType] : null;

  return (
    <RegisterContainer>
      {showRoleSelect ? (
        <>
          {/* Header */}
          <Box sx={{ mb: 3.5, textAlign: "center" }}>
            <Typography sx={{
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.95rem", lg: "2.2rem" },
              fontWeight: 800,
              fontFamily: "Poppins",
              color: "#0F172A",
              lineHeight: { xs: 1.15, md: 1.1 },
              mb: 0.75,
              letterSpacing: "-0.03em",
            }}>
              {t("register.get_started")}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.875rem", sm: "0.97rem", md: "1.02rem", lg: "1.05rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: { xs: 1.58, md: 1.65 }, overflowWrap: "break-word" }}>
              {t("register.how_use_prefix")}{" "}
              <Box component="span" sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>TalentAI</Box>
              {t("register.how_use_suffix")}
            </Typography>
          </Box>

          {/* Role cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
            {ROLES.map(({ type, icon: Icon, label, description, accent, iconGradient, shadowColor, border }) => (
              <Box
                key={type}
                onClick={() => setUserType(type)}
                sx={{
                  display: "flex", alignItems: "center", gap: { xs: 2, sm: 2.25, md: 2.5 },
                  p: { xs: 2, sm: 2.25, md: 2.5 },
                  borderRadius: "18px",
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
                  width: { xs: 48, sm: 50, md: 54 }, height: { xs: 48, sm: 50, md: 54 },
                  borderRadius: "15px",
                  background: iconGradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 6px 18px ${shadowColor}`,
                }}>
                  <Icon sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, color: "#fff" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" }, color: "#0F172A", mb: 0.3, fontFamily: "Poppins", lineHeight: 1.3 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.82rem" }, lineHeight: 1.5, fontFamily: "Poppins", overflowWrap: "break-word" }}>
                    {description}
                  </Typography>
                </Box>
                <Box sx={{
                  width: { xs: 28, sm: 30, md: 32 }, height: { xs: 28, sm: 30, md: 32 },
                  borderRadius: "10px",
                  bgcolor: `${accent}10`, border: `1px solid ${accent}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  <ArrowForwardOutlined sx={{ fontSize: { xs: 14, md: 16 }, color: accent }} />
                </Box>
              </Box>
            ))}
          </Box>

          <SignInLink returnUrl={returnUrl} label={t("register.already_account")} />
        </>
      ) : (
        <>
          {/* Form header */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            {!isOtpStep && !hasReturnUrl && (
              <Box
                onClick={() => { setUserType(null); setFormStep(1); }}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5, mb: 1,
                  cursor: "pointer", color: "#9CA3AF", fontFamily: "Poppins",
                  fontSize: { xs: "0.72rem", sm: "0.76rem", md: "0.8rem" },
                  fontWeight: 500,
                  "&:hover": { color: ACCENT },
                  transition: "color 0.2s",
                }}
              >
                <ArrowForwardOutlined sx={{ fontSize: { xs: 14, md: 15 }, transform: "rotate(180deg)", flexShrink: 0 }} />
                {t("register.change_role")}
              </Box>
            )}

            <Typography sx={{
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.55rem", lg: "1.7rem" },
              fontWeight: 800,
              fontFamily: "Poppins",
              color: "#0F172A",
              lineHeight: { xs: 1.18, md: 1.15 },
              mb: 0.4,
              letterSpacing: "-0.025em",
              overflowWrap: "break-word",
            }}>
              {isOtpStep ? t("register.check_inbox") : formConfig!.title}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.87rem", lg: "0.9rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: { xs: 1.5, md: 1.55 }, overflowWrap: "break-word" }}>
              {isOtpStep
                ? <>{t("register.otp_sent_prefix")} <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{registeredEmail || t("register.otp_sent_accent")}</Box></>
                : formConfig!.subtitle}
            </Typography>
          </Box>

          {userType === "candidate" ? (
            <CandidateRegisterForm key="candidate" onStepChange={setFormStep} onEmailChange={setRegisteredEmail} />
          ) : (
            <CompanyRegisterForm key="company" onStepChange={setFormStep} onEmailChange={setRegisteredEmail} />
          )}

          {!isOtpStep && <SignInLink returnUrl={returnUrl} label={t("register.signin_link")} />}
        </>
      )}
    </RegisterContainer>
  );
};

export default Register;
