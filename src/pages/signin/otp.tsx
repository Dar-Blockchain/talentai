import { useSigninOtp } from "@/modules/auth/signin/hooks";
import OtpPage from "@/modules/auth/signin/components/pages/OtpPage";

export default function SigninOtpPage() {
  const { email, otp, timer, loading, resendLoading, onVerify, onResend, changeEmail } =
    useSigninOtp();
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
}
