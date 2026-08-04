import React from "react";
import { LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthSubmitButton } from "@/modules/auth/shared/ui/AuthSubmitButton";
import { useSignin } from "../../hooks";
import EmailStep from "../ui/EmailStep";

interface SigninFormProps {
  onOtpSent?: (email: string) => void;
}

const SigninForm: React.FC<SigninFormProps> = ({ onOtpSent }) => {
  const { t } = useTranslation("auth");
  const { form, loading, emailValue, invitationEmail, onSubmit } = useSignin(onOtpSent);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
      <EmailStep
        control={form.control}
        errors={form.formState.errors}
        loading={loading}
        invitationEmail={invitationEmail}
      />

      <AuthSubmitButton
        loading={loading}
        label={t("signin.btn_send")}
        loadingLabel={t("signin.btn_sending")}
        disabled={!emailValue?.trim()}
      />

      <div className="flex items-center justify-center gap-1.5 pt-2">
        <LockKeyhole className="size-3 text-muted-foreground/60" />
        <p className="text-xs text-muted-foreground font-sans">
          {t("signin.security_note")}
        </p>
      </div>
    </form>
  );
};

export default SigninForm;
