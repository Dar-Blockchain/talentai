export const APPLICATION_SOURCE_OPTIONS = [
  { value: 'linkedin',        label: 'LinkedIn' },
  { value: 'facebook',        label: 'Facebook' },
  { value: 'twitter',         label: 'Twitter / X' },
  { value: 'instagram',       label: 'Instagram' },
  { value: 'job_board',       label: 'Job board' },
  { value: 'company_website', label: 'Company website' },
  { value: 'referral',        label: 'Friend / referral' },
  { value: 'other',           label: 'Other' },
] as const;

export const APPLICATION_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  APPLICATION_SOURCE_OPTIONS.map((opt) => [opt.value, opt.label]),
);
