import React, { useState } from "react";
import SigninContainer from "../layout/SigninContainer";
import SignInHeader from "../ui/SignInHeader";
import SigninForm from "../form/SigninForm";
import BackToLandingButton from "../ui/BackToLandingButton";
import OtpPage from "./OtpPage";
import { useSigninOtp } from "../../hooks";

const SigninOtpStep: React.FC<{ onChangeEmail: () => void }> = ({ onChangeEmail }) => {
  const { email, otp, timer, loading, resendLoading, onVerify, onResend, changeEmail } =
    useSigninOtp(onChangeEmail);
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
    />
  );
};

const SigninPage: React.FC = () => {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  if (pendingEmail) {
    return <SigninOtpStep onChangeEmail={() => setPendingEmail(null)} />;
  }

  return (
    <SigninContainer>
      <SignInHeader />
      <SigninForm onOtpSent={setPendingEmail} />
      <hr className="my-4 border-[#F7F8FA]" />
      <BackToLandingButton />
    </SigninContainer>
  );
};

export default SigninPage;
