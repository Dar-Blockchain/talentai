import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import AppButton from "@/components/ui/AppButton";
import { useContactForm } from "../hooks/useContactForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

const ContactUsModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation("dashboard");
  const { form, status, canSubmit, setField, handleSend, handleClose } = useContactForm(onClose);

  const sending = status === "sending";
  const sent    = status === "sent";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl sm:max-w-md">
        <h2 className="px-6 pb-1 pt-5 text-[1.1rem] font-extrabold text-gray-900">
          {t("pages.subscription.enterprise_modal.title")}
        </h2>

        <div className="px-6 py-4">
          {sent ? (
            <div className="py-6 text-center">
              <CheckCircle size={48} className="mx-auto mb-2 text-amber-600" />
              <p className="mb-1 text-[1rem] font-bold text-gray-900">
                {t("pages.subscription.enterprise_modal.message_sent")}
              </p>
              <p className="text-[0.85rem] text-gray-500">
                {t("pages.subscription.enterprise_modal.follow_up")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-1">
              <p className="text-[0.85rem] text-gray-500">
                {t("pages.subscription.enterprise_modal.intro")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <label className="flex-1">
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    {t("pages.subscription.enterprise_modal.full_name")}
                  </span>
                  <input className={inputCls} value={form.name} onChange={setField("name")} />
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    {t("pages.subscription.enterprise_modal.email")}
                  </span>
                  <input className={inputCls} value={form.email} onChange={setField("email")} />
                </label>
              </div>
              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {t("pages.subscription.enterprise_modal.company")}
                </span>
                <input className={inputCls} value={form.company} onChange={setField("company")} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  {t("pages.subscription.enterprise_modal.message")}
                </span>
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder={t("pages.subscription.enterprise_modal.message_placeholder")}
                  value={form.message}
                  onChange={setField("message")}
                />
              </label>
            </div>
          )}
        </div>

        {!sent && (
          <div className="flex justify-end gap-2 px-6 pb-5 pt-1">
            <AppButton
              label={t("pages.subscription.enterprise_modal.cancel")}
              variant="outlined"
              onClick={handleClose}
            />
            <AppButton
              label={t("pages.subscription.enterprise_modal.send")}
              variant="contained"
              loading={sending}
              disabled={!canSubmit}
              onClick={handleSend}
              sx={{ bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUsModal;
