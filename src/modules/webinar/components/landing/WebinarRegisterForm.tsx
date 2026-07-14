import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useSaveWebinarProgressMutation } from "@/modules/webinar/queries";
import { validateEmail } from "@/lib/validation/email";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Checkbox } from "@/modules/shared/ui/shadcn/checkbox";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import type { WebinarContact } from "@/modules/webinar/types";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Self-contained "Reserve Your Spot" card: owns its own field state, saves
 * progress on submit, persists contact/consent to storage, then hands off to
 * the parent page to switch into the questionnaire funnel. Nothing outside
 * this component needs to know about the form's internals.
 */
export function WebinarRegisterForm({ webinarId, lang, loading, onRegistered }: {
  webinarId?: string; lang: "fr" | "en"; loading: boolean;
  onRegistered: (submissionId: string, contact: WebinarContact, isReturning: boolean) => void;
}) {
  const router = useRouter();
  const { t } = useTranslation("home");
  const isEn = lang === "en";

  const [form, setForm] = useState({ nom: "", email: "", entreprise: "" });
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A returning visitor who already finished the questionnaire — re-registering
  // would just re-run scoring and re-send the results email, so stop here
  // instead of dropping them back into the funnel.
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const saveProgress = useSaveWebinarProgressMutation();
  const submitting   = saveProgress.isPending;

  const emailVal        = form.email.trim();
  const validEmail      = validateEmail(emailVal) === true;
  const showEmailError  = emailVal.length > 0 && !validEmail;
  const canSubmit        = consent && form.nom.trim() !== "" && validEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinarId || !canSubmit || submitting) return;
    setSubmitError(null);
    try {
      const res = await saveProgress.mutateAsync({
        webinarId,
        lang,
        consent: true,
        contact: form,
        source: {
          utm_source:   (router.query.utm_source as string) || "",
          utm_campaign: (router.query.utm_campaign as string) || "",
        },
      });
      if (res.completed) {
        setAlreadyCompleted(true);
        return;
      }
      localStorage.setItem("webinar_submission_id", res.submissionId);
      sessionStorage.setItem("webinar_contact", JSON.stringify(form));
      sessionStorage.setItem("webinar_consent", "true");
      onRegistered(res.submissionId, form, res.isReturning);
    } catch {
      setSubmitError(isEn ? "Something went wrong. Please try again." : "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-[420px] text-left"
      >
        <Card className="bg-white border-[#E7E5DE] rounded-2xl"><CardContent className="p-7 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </CardContent></Card>
      </motion.div>
    );
  }

  if (alreadyCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[420px] text-left"
      >
        <Card className="bg-white border-[#E7E5DE] rounded-2xl shadow-[0_24px_50px_-20px_rgba(16,69,63,0.25)]">
          <CardContent className="p-7 md:p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto mb-4 text-[#6AD39C]" />
            <h3
              className="text-[1.2rem] text-[#10453F] mb-2"
              style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontWeight: 500 }}
            >
              {isEn ? "You're all set" : "Vous êtes déjà inscrit"}
            </h3>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">
              {isEn
                ? "You're already registered for this webinar and have already completed the questionnaire. Check your email for the webinar details."
                : "Vous êtes déjà inscrit à ce webinar et avez déjà complété le questionnaire. Consultez votre email pour les détails du webinar."}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.6, ease: EASE }}
      className="w-full max-w-[420px] text-left"
    >
    <Card className="bg-white border-[#E7E5DE] rounded-2xl shadow-[0_24px_50px_-20px_rgba(16,69,63,0.25)]">
      <CardContent className="p-7 md:p-8">
        <h3
          className="text-[1.3rem] text-[#10453F] mb-1"
          style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontWeight: 500 }}
        >
          {isEn ? "Reserve Your Spot" : "Réservez Votre Place"}
        </h3>
        <p className="text-[12.5px] text-slate-400 mb-6">
          {isEn ? "Takes less than a minute." : "Moins d'une minute."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="nom"
              className="text-[10.5px] font-semibold uppercase text-[#7E9089]"
              style={{ letterSpacing: "0.08em" }}
            >
              {isEn ? "Full name" : "Nom complet"} *
            </Label>
            <Input
              id="nom" value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder={isEn ? "Jane Doe" : "Jean Dupont"}
              className="rounded-lg border-[#E2E0D8] bg-white focus-visible:border-[#6AD39C] focus-visible:ring-[#6AD39C]/25"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="entreprise"
              className="text-[10.5px] font-semibold uppercase text-[#7E9089]"
              style={{ letterSpacing: "0.08em" }}
            >
              {isEn ? "Company" : "Entreprise"} <span className="text-slate-300 font-normal normal-case">({isEn ? "optional" : "optionnel"})</span>
            </Label>
            <Input
              id="entreprise" value={form.entreprise}
              onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))}
              placeholder={isEn ? "Acme Inc." : "Nom de la société"}
              className="rounded-lg border-[#E2E0D8] bg-white focus-visible:border-[#6AD39C] focus-visible:ring-[#6AD39C]/25"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[10.5px] font-semibold uppercase text-[#7E9089]"
              style={{ letterSpacing: "0.08em" }}
            >
              Email *
            </Label>
            <Input
              id="email" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder={isEn ? "you@company.com" : "vous@entreprise.com"}
              aria-invalid={showEmailError}
              className="rounded-lg border-[#E2E0D8] bg-white focus-visible:border-[#6AD39C] focus-visible:ring-[#6AD39C]/25"
              required
            />
            {showEmailError && (
              <p className="text-[12px] text-destructive">
                {isEn ? "Please enter a valid email address" : "Veuillez entrer une adresse email valide"}
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <Checkbox
              checked={consent}
              onCheckedChange={v => setConsent(v === true)}
              className="mt-0.5 border-[#D8D5C9] data-[state=checked]:bg-[#6AD39C] data-[state=checked]:border-[#6AD39C]"
            />
            <span className="text-[12.5px] text-slate-500 leading-relaxed">
              {isEn
                ? "I agree that my answers will be processed to personalize my experience."
                : "J'accepte que mes réponses soient traitées pour personnaliser mon expérience."}
            </span>
          </label>

          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit" size="lg"
            className="w-full rounded-lg bg-[#6AD39C] text-[#0B2A22] hover:bg-[#52C88A] font-semibold shadow-none"
            loading={submitting}
            disabled={!canSubmit || !webinarId || submitting}
          >
            {t("webinar.cta")}
            <ArrowRight size={16} />
          </Button>

          <p className="text-center text-[11.5px] text-slate-400">
            {isEn ? "No spam. Your data stays private." : "Sans spam. Vos données restent privées."}
          </p>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}
