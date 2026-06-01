import { SigninPage } from "@/modules/auth/signin";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function Signin() {
  return (
    <ErrorBoundary>
      <SigninPage />
    </ErrorBoundary>
  );
}
