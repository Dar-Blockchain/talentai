import { SigninPage } from "@/modules/auth/signin";
import ErrorBoundary from "@/modules/shared/ui/ErrorBoundary";

export default function Signin() {
  return (
    <ErrorBoundary>
      <SigninPage />
    </ErrorBoundary>
  );
}
