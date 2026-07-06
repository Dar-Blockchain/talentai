import { EMPLOYMENT_TYPES, COMPANY_SIZES } from "@/modules/settings/shared/constants";
import { UserProfile } from "../../shared";

type OnInputChange = (key: keyof UserProfile, value: string) => void;
type ResponsiveColumn = string | { xs?: string; sm?: string; md?: string };
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const EMP_TYPE_KEYS: Record<string, string> = {
  "Remote": "remote",
  "On-site": "onsite",
  "Hybrid": "hybrid",
};

export const CONTACT_INPUT_FIELDS: {
  key: keyof UserProfile;
  labelKey: string;
  placeholder: string;
  type?: string;
  gridColumn: ResponsiveColumn;
}[] = [
  {
    key: "linkedin",
    labelKey: "pages.settings.contact.linkedin_label",
    placeholder: "https://linkedin.com/company/yourcompany",
    type: "url",
    gridColumn: { xs: "1 / -1", sm: "1 / -1" },
  },
  {
    key: "website",
    labelKey: "pages.settings.contact.website_label",
    placeholder: "https://yourcompany.com",
    type: "url",
    gridColumn: { xs: "1 / -1", sm: "1 / -1" },
  },
];

export const CONTACT_SELECT_FIELDS: {
  key: keyof UserProfile;
  labelKey: string;
  gridColumn: ResponsiveColumn;
  getValue: (profile: UserProfile) => string;
  getOptions: (t: TranslateFn) => { label: string; value: string }[];
  onChange: (val: string, onInputChange: OnInputChange) => void;
}[] = [
  {
    key: "employmentType",
    labelKey: "pages.settings.contact.employment_label",
    gridColumn: { xs: "1 / -1", sm: "auto" },
    getValue: (profile) => profile.employmentType || "Remote",
    getOptions: (t) =>
      EMPLOYMENT_TYPES.map((v) => ({
        label: t(`pages.settings.employment_types.${EMP_TYPE_KEYS[v]}`, { defaultValue: v }),
        value: v,
      })),
    onChange: (val, onInputChange) => onInputChange("employmentType", val),
  },
  {
    key: "size",
    labelKey: "pages.settings.contact.size_label",
    gridColumn: { xs: "1 / -1", sm: "auto" },
    getValue: (profile) => profile.size || profile.companySize || "",
    getOptions: (t) =>
      COMPANY_SIZES.map((s) => ({
        label: `${s} ${t("pages.settings.employees_suffix")}`,
        value: s,
      })),
    onChange: (val, onInputChange) => {
      onInputChange("size", val);
      onInputChange("companySize", val);
    },
  },
];
