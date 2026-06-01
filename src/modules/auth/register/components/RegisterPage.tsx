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

const ROLES = (t: (key: string) => string) => [
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

const FORM_TITLES = (t: (key: string) => string) => ({
  company:   { title: t("register.company_title"),   subtitle: t("register.company_subtitle") },
  candidate: { title: t("register.candidate_title"), subtitle: t("register.candidate_subtitle") },
});

const RegisterPage = () => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  const [userType,        setUserType]        = useState<UserType | null>(null);
  const [formStep,        setFormStep]        = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const isOtpStep  = formStep === 2;
  const formConfig = userType ? FORM_TITLES(t)[userType] : null;

  const handleBack = () => { setUserType(null); setFormStep(1); };

  return (
    <RegisterContainer>
      {!userType ? (
        <>
          <RoleSelectHeader />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3.5 }}>
            {ROLES(t).map((role) => (
              <RoleCard key={role.type} {...role} onClick={() => setUserType(role.type)} />
            ))}
          </Box>
          <SignInLink returnUrl={returnUrl} label={t("register.already_account")} />
        </>
      ) : (
        <>
          <FormHeader
            isOtpStep={isOtpStep}
            hasReturnUrl={!!returnUrl}
            title={formConfig!.title}
            subtitle={formConfig!.subtitle}
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
