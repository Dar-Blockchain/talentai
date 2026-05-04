import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CandidateRegisterForm from "./CandidateRegisterForm";
import CompanyRegisterForm from "./CompanyRegisterForm";
import RegisterChangeRoleButton from "./RegisterChangeRoleButton";
import RegisterSignInLink from "./RegisterSignInLink";
import { REGISTER_ACCENT } from "./registerConstants";
import type { RegisterUserType } from "./RegisterRoleSelect";

type Props = {
  userType: RegisterUserType;
  formStep: 1 | 2;
  registeredEmail: string;
  hasReturnUrl: boolean;
  returnUrl?: string;
  onChangeRole: () => void;
  onStepChange: (step: 1 | 2) => void;
  onEmailChange: (email: string) => void;
};

const RegisterFormSection = ({
  userType,
  formStep,
  registeredEmail,
  hasReturnUrl,
  returnUrl,
  onChangeRole,
  onStepChange,
  onEmailChange,
}: Props) => {
  const { t } = useTranslation("auth");

  const isOtpStep = formStep === 2;

  const FORM_TITLES = {
    company: { title: t("register.company_title"), subtitle: t("register.company_subtitle") },
    candidate: { title: t("register.candidate_title"), subtitle: t("register.candidate_subtitle") },
  };

  const formConfig = FORM_TITLES[userType];

  return (
    <>
      {/* Form header spacing matches talentai-dev register page */}
      <Box
        sx={{
          mb: 3,
          textAlign: "center",
        }}
      >
        {!isOtpStep && !hasReturnUrl && (
          <RegisterChangeRoleButton
            label={t("register.change_role")}
            onClick={onChangeRole}
          />
        )}

        <Stack spacing={{ xs: 0.85, sm: 0.625 }} sx={{ alignItems: "center", width: "100%" }}>
          <Typography
            sx={{
              fontSize:
                userType === "company"
                  ? {
                      xs: "clamp(0.95rem, 3.2vw, 1.2rem)",
                      sm: "clamp(1.15rem, 2vw, 1.42rem)",
                    }
                  : {
                      xs: "clamp(1.15rem, 4vw, 1.65rem)",
                      sm: "clamp(1.5rem, 2.8vw, 1.9rem)",
                    },
              fontWeight: 800,
              fontFamily: "Poppins",
              color: "#0F172A",
              lineHeight: { xs: 1.12, sm: 1.15 },
              mb: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {isOtpStep ? t("register.check_inbox") : formConfig.title}
          </Typography>
          <Typography
            sx={{
              fontSize:
                userType === "company"
                  ? { xs: "0.75rem", sm: "0.9rem" }
                  : { xs: "0.8rem", sm: "0.95rem" },
              color: "#6B7280",
              fontFamily: "Poppins",
              lineHeight: { xs: 1.5, sm: 1.6 },
            }}
          >
            {isOtpStep ? (
              <>
                {t("register.otp_sent_prefix")}{" "}
                <Box component="span" sx={{ color: REGISTER_ACCENT, fontWeight: 600 }}>
                  {registeredEmail || t("register.otp_sent_accent")}
                </Box>
              </>
            ) : (
              formConfig.subtitle
            )}
          </Typography>
        </Stack>
      </Box>

      {userType === "candidate" ? (
        <CandidateRegisterForm key="candidate" onStepChange={onStepChange} onEmailChange={onEmailChange} />
      ) : (
        <CompanyRegisterForm key="company" onStepChange={onStepChange} onEmailChange={onEmailChange} />
      )}

      {!isOtpStep && (
        <Box sx={{ mt: { xs: 1.5, sm: 1.625 } }}>
          <RegisterSignInLink
            returnUrl={returnUrl}
            dividerLabel={t("register.signin_link")}
            buttonLabel={t("register.signin_link")}
          />
        </Box>
      )}
    </>
  );
};

export default RegisterFormSection;
