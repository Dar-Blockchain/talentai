import { useState } from "react";
import { Box } from "@mui/material";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import RegisterContainer from "./RegisterContainer";
import CandidateRegisterForm from "./CandidateRegisterForm";
import CompanyRegisterForm from "./CompanyRegisterForm";
import SignInLink from "./ui/SignInLink";
import RoleCard from "./ui/RoleCard";
import RoleSelectHeader from "./ui/RoleSelectHeader";
import FormHeader from "./ui/FormHeader";

type UserType = "candidate" | "company";

// Static config — no i18n keys, just visual/structural data
const ROLE_CONFIG = [
  {
    type: "company" as UserType,
    icon: BusinessOutlined,
    tLabel: "register.company_label",
    tDesc:  "register.company_desc",
    accent: "#0D9488",
    iconGradient: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
    shadowColor: "rgba(13,148,136,0.22)",
    border: "rgba(13,148,136,0.14)",
  },
  {
    type: "candidate" as UserType,
    icon: PersonOutlined,
    tLabel: "register.candidate_label",
    tDesc:  "register.candidate_desc",
    accent: "#7C3AED",
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    shadowColor: "rgba(124,58,237,0.2)",
    border: "rgba(124,58,237,0.14)",
  },
] as const;

const FORM_TITLE_KEYS: Record<UserType, { title: string; subtitle: string }> = {
  company:   { title: "register.company_title",   subtitle: "register.company_subtitle"   },
  candidate: { title: "register.candidate_title", subtitle: "register.candidate_subtitle" },
};

const RegisterPage = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  const [userType,        setUserType]        = useState<UserType | null>(null);
  const [formStep,        setFormStep]        = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const isOtpStep  = formStep === 2;
  const formConfig = userType ? FORM_TITLE_KEYS[userType] : null;

  const handleBack = () => { setUserType(null); setFormStep(1); };

  return (
    <RegisterContainer>
      {!userType ? (
        <>
          <RoleSelectHeader />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
            {ROLE_CONFIG.map((role) => (
              <RoleCard
                key={role.type}
                icon={role.icon}
                label={t(role.tLabel)}
                description={t(role.tDesc)}
                accent={role.accent}
                iconGradient={role.iconGradient}
                shadowColor={role.shadowColor}
                border={role.border}
                onClick={() => setUserType(role.type)}
              />
            ))}
          </Box>
          <SignInLink returnUrl={returnUrl} label={t("register.already_account")} />
        </>
      ) : (
        <>
          <FormHeader
            isOtpStep={isOtpStep}
            hasReturnUrl={!!returnUrl}
            title={t(formConfig!.title)}
            subtitle={t(formConfig!.subtitle)}
            registeredEmail={registeredEmail}
            onBack={handleBack}
          />

          {userType === "candidate"
            ? <CandidateRegisterForm key="candidate" onStepChange={setFormStep} onEmailChange={setRegisteredEmail} />
            : <CompanyRegisterForm   key="company"   onStepChange={setFormStep} onEmailChange={setRegisteredEmail} />}

          {!isOtpStep && <SignInLink returnUrl={returnUrl} label={t("register.signin_link")} />}
        </>
      )}
    </RegisterContainer>
  );
};

export default RegisterPage;
