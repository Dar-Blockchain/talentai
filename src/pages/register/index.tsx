import { RegisterPage } from "@/modules/auth/register";
import ErrorBoundary from "@/modules/shared/ui/ErrorBoundary";

export default function Register() {
  return (
    <ErrorBoundary>
      <RegisterPage />
    </ErrorBoundary>
  );
}
