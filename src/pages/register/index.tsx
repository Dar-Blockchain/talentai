import { useState } from "react";
import RegisterContainer from "@/components/features/register/RegisterContainer";
import RegisterFormSection from "@/components/features/register/RegisterFormSection";
import RegisterRoleSelect, { type RegisterUserType } from "@/components/features/register/RegisterRoleSelect";
import { useRouter } from "next/router";

const Register = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const hasReturnUrl = !!returnUrl;
  const [userType, setUserType] = useState<RegisterUserType | null>(null);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const showRoleSelect = !userType;

  const handleChangeRole = () => {
    setUserType(null);
    setFormStep(1);
  };

  return (
    <RegisterContainer>
      {showRoleSelect ? (
        <RegisterRoleSelect returnUrl={returnUrl} onSelectRole={setUserType} />
      ) : (
        <RegisterFormSection
          userType={userType}
          formStep={formStep}
          registeredEmail={registeredEmail}
          hasReturnUrl={hasReturnUrl}
          returnUrl={returnUrl}
          onChangeRole={handleChangeRole}
          onStepChange={setFormStep}
          onEmailChange={setRegisteredEmail}
        />
      )}
    </RegisterContainer>
  );
};

export default Register;
