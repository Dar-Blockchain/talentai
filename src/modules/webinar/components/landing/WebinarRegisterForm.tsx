import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useSaveWebinarProgressMutation } from "@/modules/webinar/queries";
import { validateEmail } from "@/lib/validation/email";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Checkbox } from "@/modules/shared/ui/shadcn/checkbox";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { WebinarSubmitButton } from "./WebinarSubmitButton";
import i18n from "@/i18n/config";
import type {
  WebinarContact, WebinarHrTeamSize, WebinarProfileType,
  WebinarSector, WebinarSourceChannel,
} from "@/modules/webinar/types";

const PROFILE_TYPES: WebinarProfileType[] = ["staffing_bpo", "enterprise_chro", "referrer"];
const PROFILE_TYPE_I18N_KEY: Record<WebinarProfileType, string> = {
  staffing_bpo: "profileTypeStaffingBpo",
  enterprise_chro: "profileTypeEnterpriseChro",
  referrer: "profileTypeReferrer",
};

const HR_TEAM_SIZES: WebinarHrTeamSize[] = ["lt10", "10_50", "50_200", "gt200"];
const HR_TEAM_SIZE_I18N_KEY: Record<WebinarHrTeamSize, string> = {
  lt10: "hrTeamSizeLt10",
  "10_50": "hrTeamSize10_50",
  "50_200": "hrTeamSize50_200",
  gt200: "hrTeamSizeGt200",
};

const SECTORS: WebinarSector[] = [
  "technology", "finance", "healthcare", "retail", "manufacturing",
  "education", "telecom", "public_sector", "other",
];
const SECTOR_I18N_KEY: Record<WebinarSector, string> = {
  technology: "sectorTechnology",
  finance: "sectorFinance",
  healthcare: "sectorHealthcare",
  retail: "sectorRetail",
  manufacturing: "sectorManufacturing",
  education: "sectorEducation",
  telecom: "sectorTelecom",
  public_sector: "sectorPublicSector",
  other: "sectorOther",
};

const SOURCE_CHANNELS: WebinarSourceChannel[] = [
  "linkedin", "instagram", "facebook", "twitter_x",
  "google_search", "referral", "newsletter", "other",
];
const SOURCE_CHANNEL_I18N_KEY: Record<WebinarSourceChannel, string> = {
  linkedin: "sourceChannelLinkedin",
  instagram: "sourceChannelInstagram",
  facebook: "sourceChannelFacebook",
  twitter_x: "sourceChannelTwitterX",
  google_search: "sourceChannelGoogleSearch",
  referral: "sourceChannelReferral",
  newsletter: "sourceChannelNewsletter",
  other: "sourceChannelOther",
};

const VP = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

const labelCn = "text-[10.5px] font-semibold uppercase text-[#7E9089]";
const inputCn = "rounded-lg border-[#E2E0D8] bg-white focus-visible:border-[#6AD39C] focus-visible:ring-[#6AD39C]/25";
const multiSelectTriggerCn =
  "group rounded-lg border border-[#E2E0D8] bg-white shadow-xs transition-all duration-200 " +
  "hover:border-[#6AD39C]/50 " +
  "focus-visible:outline-none focus-visible:border-[#6AD39C] focus-visible:ring-[3px] focus-visible:ring-[#6AD39C]/25 " +
  "data-[state=open]:border-[#6AD39C] data-[state=open]:ring-[3px] data-[state=open]:ring-[#6AD39C]/20";

/**
 * Self-contained "Reserve Your Spot" card: owns its own field state, saves
 * progress on submit, persists contact/consent to storage, then hands off to
 * the parent page to switch into the questionnaire funnel. Nothing outside
 * this component needs to know about the form's internals.
 */
export function WebinarRegisterForm({
  webinarId,
  lang,
  loading,
  onRegistered,
}: {
  webinarId?: string;
  lang: "fr" | "en";
  loading: boolean;
  onRegistered: (
    submissionId: string,
    contact: WebinarContact,
    isReturning: boolean,
  ) => void;
}) {
  const router = useRouter();
  const t = i18n.getFixedT(lang, "webinar");

  const [form, setForm] = useState<{
    nom: string; email: string; phone: string; entreprise: string;
    position: string; sector: WebinarSector[];
    hr_team_size: WebinarHrTeamSize | ""; profile_type: WebinarProfileType | "";
  }>({
    nom: "", email: "", phone: "", entreprise: "",
    position: "", sector: [],
    hr_team_size: "", profile_type: "",
  });
  const toggleSector = (v: WebinarSector) =>
    setForm((f) => ({
      ...f,
      sector: f.sector.includes(v) ? f.sector.filter((s) => s !== v) : [...f.sector, v],
    }));
  // Self-reported discovery channel — distinct from URL-based UTM tracking
  // (captured separately below), so it lives outside the WebinarContact shape.
  const [sourceChannel, setSourceChannel] = useState<WebinarSourceChannel | "">("");
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A returning visitor who already finished the questionnaire — re-registering
  // would just re-run scoring and re-send the results email, so stop here
  // instead of dropping them back into the funnel.
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const saveProgress = useSaveWebinarProgressMutation();
  const submitting = saveProgress.isPending;

  const emailVal = form.email.trim();
  const validEmail = validateEmail(emailVal) === true;
  const showEmailError = emailVal.length > 0 && !validEmail;
  const canSubmit =
    consent &&
    form.nom.trim() !== "" &&
    validEmail &&
    form.entreprise.trim() !== "" &&
    form.position.trim() !== "" &&
    form.sector.length > 0 &&
    form.hr_team_size !== "" &&
    form.profile_type !== "" &&
    form.phone.trim() !== "" &&
    sourceChannel !== "";

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
          utm_source: (router.query.utm_source as string) || "",
          utm_campaign: (router.query.utm_campaign as string) || "",
          channel: sourceChannel,
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
      setSubmitError(t("registerForm.submitError"));
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-[760px] text-left"
      >
        <Card className="bg-white border-[#E7E5DE] rounded-2xl">
          <CardContent className="p-7 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (alreadyCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[760px] text-left"
      >
        <Card className="bg-white border-[#E7E5DE] rounded-2xl shadow-[0_24px_50px_-20px_rgba(16,69,63,0.25)]">
          <CardContent className="p-7 md:p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto mb-4 text-[#6AD39C]" />
            <h3
              className="text-[1.2rem] text-[#10453F] mb-2"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              {t("registerForm.alreadyDoneTitle")}
            </h3>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">
              {t("registerForm.alreadyDoneBody")}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full max-w-[760px] text-left"
    >
      <Card className="bg-white border-[#E7E5DE] rounded-2xl shadow-[0_24px_50px_-20px_rgba(16,69,63,0.25)]">
        <CardContent className="px-6 py-5 md:px-9 md:py-7">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nom" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.fullName")} *
              </Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder={t("registerForm.fullNamePlaceholder")}
                className={inputCn}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={t("registerForm.emailPlaceholder")}
                aria-invalid={showEmailError}
                className={inputCn}
                required
              />
              {showEmailError && (
                <p className="text-[12px] text-destructive">{t("registerForm.emailInvalid")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="entreprise" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.company")} *
              </Label>
              <Input
                id="entreprise"
                value={form.entreprise}
                onChange={(e) => setForm((f) => ({ ...f, entreprise: e.target.value }))}
                placeholder={t("registerForm.companyPlaceholder")}
                className={inputCn}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.position")} *
              </Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                placeholder={t("registerForm.positionPlaceholder")}
                className={inputCn}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sector" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.sector")} *
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    id="sector"
                    className={`w-full h-9 px-3 flex items-center justify-between gap-1.5 text-[14px] ${multiSelectTriggerCn}`}
                  >
                    {form.sector.length === 0 ? (
                      <span className="truncate text-slate-400 font-normal">{t("registerForm.sectorPlaceholder")}</span>
                    ) : (
                      <span className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                        {form.sector.length <= 2 ? (
                          form.sector.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-full bg-[#6AD39C]/12 px-2 py-0.5 text-[11.5px] font-medium text-[#10453F] whitespace-nowrap"
                            >
                              {t(`registerForm.${SECTOR_I18N_KEY[s]}`)}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[#6AD39C]/12 px-2 py-0.5 text-[11.5px] font-medium text-[#10453F] whitespace-nowrap">
                            {t("registerForm.sectorSelectedCount", { count: form.sector.length })}
                          </span>
                        )}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className="text-slate-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#6AD39C]"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 rounded-xl border-[#E2E0D8] shadow-lg p-1.5"
                >
                  {SECTORS.map((v) => (
                    <DropdownMenuCheckboxItem
                      key={v}
                      checked={form.sector.includes(v)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => toggleSector(v)}
                      className="rounded-lg text-[13.5px] focus:bg-[#6AD39C]/10 focus:text-[#10453F] data-[state=checked]:bg-[#6AD39C]/10 data-[state=checked]:font-medium data-[state=checked]:text-[#10453F] [&_svg]:text-[#6AD39C]"
                    >
                      {t(`registerForm.${SECTOR_I18N_KEY[v]}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hr_team_size" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.hrTeamSize")} *
              </Label>
              <Select
                value={form.hr_team_size}
                onValueChange={(v) => setForm((f) => ({ ...f, hr_team_size: v as WebinarHrTeamSize }))}
                required
              >
                <SelectTrigger id="hr_team_size" className={`w-full ${inputCn}`}>
                  <SelectValue placeholder={t("registerForm.hrTeamSizePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {HR_TEAM_SIZES.map((v) => (
                    <SelectItem key={v} value={v}>{t(`registerForm.${HR_TEAM_SIZE_I18N_KEY[v]}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile_type" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.profileType")} *
              </Label>
              <Select
                value={form.profile_type}
                onValueChange={(v) => setForm((f) => ({ ...f, profile_type: v as WebinarProfileType }))}
              >
                <SelectTrigger id="profile_type" className={`w-full ${inputCn}`}>
                  <SelectValue placeholder={t("registerForm.profileTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map((v) => (
                    <SelectItem key={v} value={v}>{t(`registerForm.${PROFILE_TYPE_I18N_KEY[v]}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.phone")} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder={t("registerForm.phonePlaceholder")}
                className={inputCn}
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="source_channel" className={labelCn} style={{ letterSpacing: "0.08em" }}>
                {t("registerForm.sourceChannel")} *
              </Label>
              <Select
                value={sourceChannel}
                onValueChange={(v) => setSourceChannel(v as WebinarSourceChannel)}
                required
              >
                <SelectTrigger id="source_channel" className={`w-full ${inputCn}`}>
                  <SelectValue placeholder={t("registerForm.sourceChannelPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_CHANNELS.map((v) => (
                    <SelectItem key={v} value={v}>{t(`registerForm.${SOURCE_CHANNEL_I18N_KEY[v]}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1 sm:col-span-2">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5 border-[#D8D5C9] data-[state=checked]:bg-[#6AD39C] data-[state=checked]:border-[#6AD39C]"
              />
              <span className="text-[12.5px] text-slate-500 leading-relaxed">
                {t("registerForm.consent")}
              </span>
            </label>

            {submitError && (
              <div className="sm:col-span-2">
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="sm:col-span-2">
              <WebinarSubmitButton
                label={t("registerForm.submit")}
                loading={submitting}
                disabled={!canSubmit || !webinarId || submitting}
              />
            </div>

            <p className="text-center text-[11.5px] text-slate-400 sm:col-span-2">
              {t("registerForm.privacy")}
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
