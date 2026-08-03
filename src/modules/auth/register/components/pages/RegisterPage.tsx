import React, { useState } from "react";
import { Building2, User } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import RegisterContainer from "../layout/RegisterContainer";
import CandidateRegisterForm from "../forms/CandidateRegisterForm";
import CompanyRegisterForm from "../forms/CompanyRegisterForm";
import SignInLink from "../ui/SignInLink";
import RoleCard from "../ui/RoleCard";
import RoleSelectHeader from "../ui/RoleSelectHeader";
import FormHeader from "../ui/FormHeader";
import OtpPage from "@/modules/auth/signin/components/pages/OtpPage";
import { useRegisterOtp } from "../../hooks";
import { CANDIDATE_EXPIRY_KEY, COMPANY_EXPIRY_KEY } from "../../utils";

type UserType = "candidate" | "company";

interface RoleConfig {
  type:         UserType;
  icon:         React.ReactNode;
  tLabel:       string;
  tDesc:        string;
  accent:       string;
  iconGradient: string;
  shadowColor:  string;
  border:       string;
}

const ROLE_CONFIG: RoleConfig[] = [
  {
    type:         "company",
    icon:         <Building2 className="size-5 sm:size-6 text-white" />,
    tLabel:       "register.company_label",
    tDesc:        "register.company_desc",
    accent:       "#0D9488",
    iconGradient: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
    shadowColor:  "rgba(13,148,136,0.22)",
    border:       "rgba(13,148,136,0.14)",
  },
  {
    type:         "candidate",
    icon:         <User className="size-5 sm:size-6 text-white" />,
    tLabel:       "register.candidate_label",
    tDesc:        "register.candidate_desc",
    accent:       "#7C3AED",
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    shadowColor:  "rgba(124,58,237,0.2)",
    border:       "rgba(124,58,237,0.14)",
  },
];

const FORM_TITLE_KEYS: Record<UserType, { title: string; subtitle: string }> = {
  company:   { title: "register.company_title",   subtitle: "register.company_subtitle"   },
  candidate: { title: "register.candidate_title", subtitle: "register.candidate_subtitle" },
};

interface RegisterOtpStepProps {
  email:         string;
  userType:      UserType;
  returnUrl?:    string;
  onChangeEmail: () => void;
}

const RegisterOtpStep: React.FC<RegisterOtpStepProps> = ({ email, userType, returnUrl, onChangeEmail }) => {
  const storageKey  = userType === "candidate" ? CANDIDATE_EXPIRY_KEY : COMPANY_EXPIRY_KEY;
  const redirectPath =
    userType === "candidate"
      ? (returnUrl ? decodeURIComponent(returnUrl) : "/candidate/dashboard")
      : "/company/dashboard";

  const { otp, timer, loading, resendLoading, onVerify, onResend, changeEmail } = useRegisterOtp({
    email,
    storageKey,
    redirectPath,
    onChangeEmail,
  });

  return (
    <OtpPage
      email={email}
      otp={otp}
      timer={timer}
      loading={loading}
      resendLoading={resendLoading}
      onVerify={onVerify}
      onResend={onResend}
      onChangeEmail={changeEmail}
      tPrefix={userType === "candidate" ? "candidate_form" : "company_form"}
    />
  );
};

const RegisterPage = () => {
  const { t } = useTranslation("auth");
  const router    = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  const [userType,      setUserType]      = useState<UserType | null>(null);
  const [pendingEmail,  setPendingEmail]  = useState<string | null>(null);

  if (pendingEmail && userType) {
    return (
      <RegisterOtpStep
        email={pendingEmail}
        userType={userType}
        returnUrl={returnUrl}
        onChangeEmail={() => setPendingEmail(null)}
      />
    );
  }

  const formConfig = userType ? FORM_TITLE_KEYS[userType] : null;

  const handleBack = () => setUserType(null);

  return (
    <RegisterContainer>
      {!userType ? (
        <>
          <RoleSelectHeader />
          <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6">
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
          </div>
          <SignInLink returnUrl={returnUrl} label={t("register.already_account")} />
        </>
      ) : (
        <>
          <FormHeader
            hasReturnUrl={!!returnUrl}
            title={t(formConfig!.title)}
            subtitle={t(formConfig!.subtitle)}
            onBack={handleBack}
          />

          {userType === "candidate"
            ? <CandidateRegisterForm key="candidate" onOtpReady={setPendingEmail} />
            : <CompanyRegisterForm   key="company"   onOtpReady={setPendingEmail} />}

          <SignInLink returnUrl={returnUrl} label={t("register.signin_link")} />
        </>
      )}
    </RegisterContainer>
  );
};

export default RegisterPage;
