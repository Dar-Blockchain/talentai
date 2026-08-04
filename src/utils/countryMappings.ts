/**
 * Country utilities using i18n-iso-countries library
 * ISO 3166-1 Alpha-2 Country Code to Country Name Mappings
 */
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

// Register English locale
countries.registerLocale(enLocale);

// Excluded countries (e.g., for business/legal reasons)
const EXCLUDED_COUNTRIES = ["IL"]; // Israel

/**
 * Get all country names as an array (excluding specified countries)
 * @returns Array of country names sorted alphabetically
 */
export const getAllCountryNames = (): string[] => {
  const countryObj = countries.getNames("en", { select: "official" });
  return Object.entries(countryObj)
    .filter(([code]) => !EXCLUDED_COUNTRIES.includes(code))
    .map(([_, name]) => name)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Convert ISO country code to full country name
 * @param code - ISO 3166-1 Alpha-2 country code (e.g., 'US', 'GB')
 * @returns Full country name or the original code if not found
 */
export const getCountryName = (code: string): string => {
  if (!code) return "";
  const upperCode = code.toUpperCase();

  // Return empty if excluded
  if (EXCLUDED_COUNTRIES.includes(upperCode)) return "";

  return countries.getName(upperCode, "en") || code;
};
