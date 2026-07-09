import { useState } from "react";
import { plansApi } from "../api";
import { emailSchema } from "@/lib/validation/email";

type Status = "idle" | "sending" | "sent";

const EMPTY_FORM = { name: "", email: "", company: "", message: "" };

export function useContactForm(onClose: () => void) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");

  const setField = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const isEmailValid = emailSchema.safeParse(form.email).success;

  const handleSend = async () => {
    if (!form.name || !isEmailValid) return;
    setStatus("sending");
    try {
      await plansApi.contactEnterprise(form);
    } catch { /* show success regardless */ }
    setStatus("sent");
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setStatus("idle");
    onClose();
  };

  return {
    form, status,
    canSubmit: !!form.name && isEmailValid,
    setField, handleSend, handleClose,
  };
}
