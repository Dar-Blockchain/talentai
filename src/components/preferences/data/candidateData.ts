import { getAllCountryNames } from '@/utils/countryMappings';

export const genders = ["Male", "Female"];

export const contractTypes = ["Full-time", "Part-time", "Contract", "Internship"];

export const workModes = ["On-site", "Remote", "Hybrid"];

export const currencies = ["$", "€", "£", "TND"];

export const experienceLevels = [
  "Junior", "Mid-level", "Senior", "Expert"];

// Countries from i18n-iso-countries library (excludes Israel)
export const countries = [...getAllCountryNames(), "Other"];
