import { RegisterPage } from "@/modules/auth/register";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function Register() {
  return (
    <ErrorBoundary>
      <RegisterPage />
    </ErrorBoundary>
  );
}
