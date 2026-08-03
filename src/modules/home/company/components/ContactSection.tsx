import { useState } from "react";
import { CheckCircle2, Mail, Clock, ArrowRight, MapPin } from "lucide-react";
import { useContactMutation } from "../queries/useContactMutation";
import { Button }   from "@/modules/shared/ui/shadcn/button";
import { Input }    from "@/modules/shared/ui/shadcn/input";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { Label }    from "@/modules/shared/ui/shadcn/label";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/modules/shared/ui/shadcn/select";
import { motion }         from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn }             from "@/lib/utils";
import { CONTACT_EMAIL }  from "@/modules/shared/constants";

const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];

interface FormState { name: string; email: string; company: string; teamSize: string; message: string }
type FormKey = keyof FormState;
interface Errors { name?: string; email?: string; company?: string; message?: string }
type ErrorKey = keyof Errors;

interface TextFieldDef {
  kind: "text";
  key: FormKey;
  labelKey: string;
  type?: string;
  required?: boolean;
  errorKey?: ErrorKey;
}
interface SelectFieldDef {
  kind: "select";
  key: FormKey;
  labelKey: string;
  required?: boolean;
}
type FieldDef = TextFieldDef | SelectFieldDef;

const FIELD_ROWS: FieldDef[][] = [
  [
    { kind: "text",   key: "name",     labelKey: "contact.field_name",      type: "text",  required: true, errorKey: "name"    },
    { kind: "text",   key: "email",    labelKey: "contact.field_email",     type: "email", required: true, errorKey: "email"   },
  ],
  [
    { kind: "text",   key: "company",  labelKey: "contact.field_company",   type: "text",  required: true, errorKey: "company" },
    { kind: "select", key: "teamSize", labelKey: "contact.field_team_size"                                                     },
  ],
];

const CONTACT_INFO = [
  { Icon: Mail,   value: CONTACT_EMAIL,            translationKey: null           },
  { Icon: Clock,  value: null,                     translationKey: "contact.trust_reply_desc" },
  { Icon: MapPin, value: "Global · Remote-first",  translationKey: null           },
];

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="mt-1 text-[11.5px] text-red-500">{msg}</p> : null;

const ContactSection: React.FC = () => {
  const { t } = useTranslation("home");

  const mutation = useContactMutation();

  const [form, setForm]           = useState<FormState>({ name: "", email: "", company: "", teamSize: "", message: "" });
  const [errors, setErrors]       = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim())    e.name    = t("contact.error_name");
    if (!form.company.trim()) e.company = t("contact.error_company");
    if (!form.message.trim()) e.message = t("contact.error_message");
    if (!form.email.trim())   e.email   = t("contact.error_email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("contact.error_email_invalid");
    return e;
  };

  const handleChange = (field: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as ErrorKey]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelect = (value: string) => {
    setForm((prev) => ({ ...prev, teamSize: value }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSendError(null);
    try {
      await mutation.mutateAsync({ payload: form });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("contact.error_generic");
      if      (/message/i.test(msg)) setErrors((p) => ({ ...p, message: msg }));
      else if (/email/i.test(msg))   setErrors((p) => ({ ...p, email: msg }));
      else if (/name/i.test(msg))    setErrors((p) => ({ ...p, name: msg }));
      else if (/company/i.test(msg)) setErrors((p) => ({ ...p, company: msg }));
      else setSendError(msg);
    }
  };

  const inputCls = (err?: string) => cn(
    "h-10 rounded-xl border text-[13.5px] text-gray-900 placeholder:text-gray-300 bg-gray-50 transition-all duration-150",
    "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10",
    err ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
  );

  const selectCls = cn(
    "h-10 rounded-xl border text-[13.5px] bg-gray-50 transition-all duration-150",
    "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/10",
    "border-gray-200 hover:border-gray-300"
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.65, ease }}
      >
        <div className="rounded-3xl border border-gray-200 shadow-[0_8px_48px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr]">

            {/* ══ LEFT PANEL ══ */}
            <div
              className="relative flex flex-col justify-between gap-10 px-5 sm:px-8 py-7 sm:py-10 md:px-10 md:py-12 border-b md:border-b-0 md:border-r border-gray-200"
              style={{
                backgroundColor: "#f9fafb",
                backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                style={{ background: "linear-gradient(to top, #f9fafb, transparent)" }} />

              <div className="relative flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-white border border-gray-200 px-3.5 py-1.5 shadow-sm">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1px]">
                    {t("contact.overline")}
                  </span>
                </div>

                <div>
                  <h2 className="font-extrabold text-[22px] sm:text-[26px] md:text-[34px] leading-[1.15] tracking-[-0.5px] md:tracking-[-1px] text-gray-900 mb-3">
                    {t("contact.headline_1")}{" "}
                    <span className="italic text-gray-600">{t("contact.headline_accent")}</span>
                  </h2>
                  <p className="text-[14px] text-gray-500 leading-[1.8]">{t("contact.body")}</p>
                </div>
              </div>

              <div className="relative flex flex-col gap-3.5">
                {CONTACT_INFO.map(({ Icon, value, translationKey }) => (
                  <div key={translationKey ?? value} className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className="size-3.5 text-gray-500" />
                    </div>
                    <span className="text-[13.5px] text-gray-600">
                      {translationKey ? t(translationKey) : value}
                    </span>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-1">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="block size-2 rounded-full bg-green-400"
                  />
                  <span className="text-[12px] text-gray-500">{t("contact.online")}</span>
                </div>
              </div>
            </div>

            {/* ══ RIGHT PANEL — form ══ */}
            <div className="bg-white px-5 sm:px-8 py-7 sm:py-10 md:px-10 md:py-12">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-5 text-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  >
                    <div className="size-16 rounded-full bg-primary/[0.08] border-2 border-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="size-8 text-primary" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-[20px] text-gray-900 mb-2">{t("contact.success_title")}</h3>
                    <p className="text-[13.5px] text-gray-500 max-w-[240px] leading-[1.75]">{t("contact.success_body")}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="mb-1">
                    <h3 className="font-bold text-[17px] text-gray-900 mb-0.5">{t("contact.form_headline")}</h3>
                    <p className="text-[13px] text-gray-500">{t("contact.form_subtitle")}</p>
                  </div>

                  {FIELD_ROWS.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {row.map((field) => (
                        <div key={field.key}>
                          <Label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                            {t(field.labelKey)}
                            {field.required && <span className="text-red-400 ml-0.5">*</span>}
                          </Label>

                          {field.kind === "select" ? (
                            <Select value={form.teamSize} onValueChange={handleSelect}>
                              <SelectTrigger className={selectCls}>
                                <SelectValue placeholder={t("contact.field_select")} />
                              </SelectTrigger>
                              <SelectContent>
                                {TEAM_SIZES.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <>
                              <Input
                                type={field.type}
                                value={form[field.key]}
                                onChange={handleChange(field.key)}
                                className={inputCls(field.errorKey ? errors[field.errorKey] : undefined)}
                              />
                              {field.errorKey && <FieldError msg={errors[field.errorKey]} />}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Message */}
                  <div>
                    <Label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                      {t("contact.field_message")} <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      rows={4}
                      value={form.message}
                      onChange={handleChange("message")}
                      className={cn(
                        "rounded-xl border text-[13.5px] text-gray-900 resize-none bg-gray-50 transition-all duration-150",
                        "focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10",
                        errors.message ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-gray-300"
                      )}
                    />
                    <div className="flex justify-between mt-1">
                      <FieldError msg={errors.message} />
                      <span className="text-[11px] text-gray-400 ml-auto tabular-nums">{form.message.length} / 1000</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-1">
                    <Button
                      onClick={handleSubmit}
                      disabled={mutation.isPending}
                      size="lg"
                      className="w-full rounded-xl shadow-[0_4px_16px_rgba(13,148,136,0.28)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.40)] disabled:opacity-55"
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="block size-4 rounded-full border-2 border-white/30 border-t-white"
                          />
                          {t("contact.btn_sending")}
                        </span>
                      ) : (
                        <>{t("contact.btn_send")} <ArrowRight className="size-4" /></>
                      )}
                    </Button>
                    {sendError && <p className="mt-2 text-[12px] text-red-500 text-center">{sendError}</p>}
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">{t("contact.privacy")}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactSection;
