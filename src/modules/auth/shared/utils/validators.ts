import { validateEmail } from "@/lib/validation/email";

/** Reusable field-level validators for react-hook-form `rules.validate` */

export const validators = {
  email: validateEmail,

  url: (v: string) => {
    if (!v) return true; // optional
    try { new URL(v.startsWith("http") ? v : `https://${v}`); return true; }
    catch { return "Please enter a valid URL."; }
  },

  linkedinUrl: (v: string) => {
    if (!v) return true; // optional
    return /linkedin\.com\/(in|company)\//.test(v) || "Please enter a valid LinkedIn URL.";
  },

  phone: (v: string) => {
    if (!v) return true; // optional
    return /^[+\d\s\-().]{7,20}$/.test(v) || "Please enter a valid phone number.";
  },

  required: (label: string) => (v: string) =>
    !!v?.trim() || `${label} is required.`,
};
