import React from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { validators } from "@/modules/auth/shared/utils/validators";
import type { SigninFormValues } from "../../types";

interface Props {
  control:         Control<SigninFormValues>;
  errors:          FieldErrors<SigninFormValues>;
  loading:         boolean;
  invitationEmail: string;
}

const EmailStep: React.FC<Props> = ({ control, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");

  return (
    <div className="space-y-1">
      <Controller
        name="email"
        control={control}
        rules={{ required: t("signin.validation.email_required"), validate: validators.email }}
        render={({ field }) => (
          <div className="space-y-1.5">
            <Label htmlFor="signin-email" className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
              {t("signin.email_label")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="signin-email"
                type="email"
                placeholder="you@company.com"
                disabled={loading || !!invitationEmail}
                aria-invalid={!!(!invitationEmail && errors.email)}
                value={invitationEmail || field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="pl-9 h-10 text-sm font-sans"
              />
            </div>
            {invitationEmail && (
              <p className="text-xs text-primary font-sans">{t("signin.email_prefilled")}</p>
            )}
            {!invitationEmail && errors.email && (
              <p className="text-xs text-destructive font-sans">{errors.email.message}</p>
            )}
          </div>
        )}
      />
      <p className="text-xs text-muted-foreground font-sans pt-0.5">
        {t("signin.email_hint")}
      </p>
    </div>
  );
};

export default EmailStep;
