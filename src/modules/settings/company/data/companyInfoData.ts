import { EMPLOYMENT_TYPES } from "@/modules/settings/shared/constants";
import { UserProfile } from "../../shared";

type OnInputChange = (key: keyof UserProfile, value: string) => void;
type ResponsiveColumn = string | { xs?: string; sm?: string; md?: string };
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

// Employment Type Keys for Translation
export const EMP_TYPE_KEYS: Record<string, string> = {
  "Remote": "remote",
  "On-site": "onsite",
  "Hybrid": "hybrid",
};

// Company Experience Level Keys for Translation
export const EXP_LEVEL_KEYS: Record<string, string> = {
  "Entry Level": "entry",
  "Mid Level": "mid",
  "Senior Level": "senior",
  "Lead": "lead",
  "Executive": "executive",
};

// Company Select Fields (Size, Experience Level)
export const COMPANY_SELECT_FIELDS: {
  columns?: number;
  key: keyof UserProfile;
  labelKey: string;
  gridColumn: ResponsiveColumn;
  getValue: (profile: UserProfile) => string;
  getOptions: (t: TranslateFn, sizes: string[], levels: string[], expKeys: Record<string, string>) => { label: string; value: string }[];
  onChange: (val: string, onInputChange: OnInputChange) => void;
}[] = [
  {
    key: "size",
    labelKey: "pages.settings.company_info.size_label",
    gridColumn: { xs: "1 / -1", sm: "auto" },
    getValue: (profile) => profile.size || profile.companySize || "",
    getOptions: (t, sizes) =>
      sizes.map((s) => ({ label: `${s} ${t("pages.settings.employees_suffix")}`, value: s })),
    onChange: (val, onInputChange) => {
      onInputChange("size", val);
      onInputChange("companySize", val);
    },
  },
];

// Company Info Fields (Email, Name, Industry)
export const COMPANY_INFO_FIELDS: {
  key: keyof UserProfile;
  labelKey: string;
  placeholderKey?: string;
  helperKey?: string;
  required: boolean;
  disabled?: boolean;
  gridColumn: ResponsiveColumn;
  onChange?: (value: string, onInputChange: OnInputChange) => void;
}[] = [
  {
    key: "email",
    labelKey: "pages.settings.company_info.email_label",
    helperKey: "pages.settings.company_info.email_helper",
    required: true,
    disabled: true,
    gridColumn: "1 / -1",
  },
  {
    key: "name",
    labelKey: "pages.settings.company_info.name_label",
    placeholderKey: "pages.settings.company_info.name_placeholder",
    required: false,
    gridColumn: "1 / -1",
    onChange: (value, onInputChange) => {
      onInputChange("name", value);
      onInputChange("companyName", value);
    },
  },
  {
    key: "industry",
    labelKey: "pages.settings.company_info.industry_label",
    placeholderKey: "pages.settings.company_info.industry_placeholder",
    required: false,
    gridColumn: { xs: "1 / -1", sm: "auto" },
  },
];

// Contact Input Fields (LinkedIn, Website)
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

// Contact Select Fields (Employment Type)
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
    gridColumn: "1 / -1",
    getValue: (profile) => profile.employmentType || "Remote",
    getOptions: (t) =>
      EMPLOYMENT_TYPES.map((v) => ({
        label: t(`pages.settings.employment_types.${EMP_TYPE_KEYS[v]}`, { defaultValue: v }),
        value: v,
      })),
    onChange: (val, onInputChange) => onInputChange("employmentType", val),
  },
];
