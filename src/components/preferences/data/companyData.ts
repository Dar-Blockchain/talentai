import { getAllCountryNames } from '@/utils/countryMappings';

export const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Other",
];

export const companySizes = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501+ employees",
];

// Locations from i18n-iso-countries library (excludes Israel)
export const locations = [...getAllCountryNames(), "Other"];
