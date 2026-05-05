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
import { registerMq } from "@/components/features/register/registerLayout";

type UserType = "candidate" | "company";

const ACCENT  = "#0D9488";
const ACCENT2 = "#059669";

const SignInLink = ({
  returnUrl,
  label,
  companyCompact,
}: {
  returnUrl?: string;
  label: string;
  companyCompact?: boolean;
}) => (
  <Box sx={{ pt: companyCompact ? { xs: 0.25, sm: 0.25, [registerMq.desktopUp]: 0.5 } : 0.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: companyCompact ? { xs: 1, sm: 1, [registerMq.desktopUp]: 1.5 } : 1.5, mb: companyCompact ? { xs: 1, sm: 1, [registerMq.desktopUp]: 2 } : 2 }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography sx={{
        fontSize: companyCompact ? { xs: "0.66rem", sm: "0.7rem", md: "0.73rem", [registerMq.desktopUp]: "0.75rem" } : "0.75rem",
        ...(companyCompact && { [registerMq.tabletOnly]: { fontSize: "0.66rem" } }),
        color: "#9CA3AF",
        fontFamily: "Poppins",
        whiteSpace: companyCompact ? { xs: "normal", sm: "normal", [registerMq.desktopUp]: "nowrap" } : "nowrap",
        textAlign: "center",
        lineHeight: 1.3,
        maxWidth: companyCompact ? { xs: "46%", sm: "46%", [registerMq.desktopUp]: "none" } : "none",
      }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
    <Link href={returnUrl ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}` : "/signin"} style={{ textDecoration: "none" }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "100%",
        minHeight: companyCompact ? { xs: 42, sm: 44, md: 46, [registerMq.desktopUp]: 48 } : 48,
        py: companyCompact ? { xs: 0.75, sm: 0.75, [registerMq.desktopUp]: 0 } : 0,
        px: 1,
        borderRadius: "14px",
        border: `1.5px solid ${ACCENT}44`,
        color: ACCENT, fontFamily: "Poppins", fontWeight: 700,
        fontSize: companyCompact ? { xs: "0.82rem", sm: "0.86rem", md: "0.9rem", [registerMq.desktopUp]: "0.95rem" } : "0.95rem",
        ...(companyCompact && { [registerMq.tabletOnly]: { fontSize: "0.82rem" } }),
        transition: "all 0.2s",
        "&:hover": { bgcolor: `${ACCENT}08`, borderColor: ACCENT },
      }}>
        {label}
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

  const companyMobileLayout = !!userType && !showRoleSelect;

  return (
    <RegisterContainer companyMobileLayout={companyMobileLayout}>
      {showRoleSelect ? (
        <>
          <Box sx={{ mb: 3.5, textAlign: "center" }}>
            <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Poppins", color: "#0F172A", lineHeight: 1.1, mb: 0.75, letterSpacing: "-0.03em" }}>
              {t("register.get_started")}
            </Typography>
            <Typography sx={{ fontSize: "1.05rem", color: "#6B7280", fontFamily: "Poppins", lineHeight: 1.65 }}>
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

          <SignInLink returnUrl={returnUrl} label={t("register.already_account")} />
        </>
      ) : (
        <>
          <Box sx={{
            mb: userType === "company"
              ? { xs: 2.25, sm: 2.25, [registerMq.desktopUp]: 3.5 }
              : 3,
            textAlign: "center",
          }}>
            {!isOtpStep && !hasReturnUrl && (
              <Box
                onClick={() => { setUserType(null); setFormStep(1); }}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  mb: userType === "company" ? { xs: 1.25, sm: 1.25, [registerMq.desktopUp]: 2.5 } : 2.5,
                  py: userType === "company" ? { xs: 0.5, sm: 0.5, [registerMq.desktopUp]: 0 } : 0,
                  px: userType === "company" ? { xs: 0.75, sm: 0.75, [registerMq.desktopUp]: 0 } : 0,
                  cursor: "pointer", color: "#9CA3AF", fontFamily: "Poppins",
                  fontSize: userType === "company" ? { xs: "0.72rem", sm: "0.75rem", md: "0.78rem", [registerMq.desktopUp]: "0.8rem" } : "0.8rem",
                  ...(userType === "company" && { [registerMq.tabletOnly]: { fontSize: "0.72rem" } }),
                  fontWeight: 600,
                  "&:hover": { color: ACCENT },
                  transition: "color 0.2s",
                }}
              >
                <ArrowForwardOutlined sx={{ fontSize: userType === "company" ? { xs: 15, sm: 15, [registerMq.desktopUp]: 15 } : 15, transform: "rotate(180deg)" }} />
                {t("register.change_role")}
              </Box>
            )}

            <Typography sx={{
              fontSize: userType === "company"
                ? { xs: "1.2rem", sm: "1.28rem", md: "1.55rem", [registerMq.desktopUp]: "1.9rem" }
                : "1.9rem",
              ...(userType === "company" && { [registerMq.tabletOnly]: { fontSize: "1.2rem" } }),
              fontWeight: 800, fontFamily: "Poppins", color: "#0F172A",
              lineHeight: userType === "company" ? { xs: 1.12, sm: 1.12, [registerMq.desktopUp]: 1.15 } : 1.15,
              mb: userType === "company" ? { xs: 0.4, sm: 0.4, [registerMq.desktopUp]: 0.75 } : 0.75,
              letterSpacing: "-0.025em",
            }}>
              {isOtpStep ? t("register.check_inbox") : formConfig!.title}
            </Typography>
            <Typography sx={{
              fontSize: userType === "company"
                ? { xs: "0.82rem", sm: "0.86rem", md: "0.9rem", [registerMq.desktopUp]: "0.95rem" }
                : "0.95rem",
              ...(userType === "company" && { [registerMq.tabletOnly]: { fontSize: "0.82rem" } }),
              color: "#6B7280", fontFamily: "Poppins",
              lineHeight: userType === "company" ? { xs: 1.45, sm: 1.45, [registerMq.desktopUp]: 1.6 } : 1.6,
            }}>
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

          {!isOtpStep && (
            <SignInLink returnUrl={returnUrl} label={t("register.signin_link")} companyCompact={userType === "company"} />
          )}
        </>
      )}
    </RegisterContainer>
  );
};

export default Register;
