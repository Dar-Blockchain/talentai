/**
 * Country utilities using i18n-iso-countries library
 * ISO 3166-1 Alpha-2 Country Code to Country Name Mappings
 */
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register English locale
countries.registerLocale(enLocale);

// Excluded countries (e.g., for business/legal reasons)
const EXCLUDED_COUNTRIES = ['IL']; // Israel

/**
 * Get all country names as an array (excluding specified countries)
 * @returns Array of country names sorted alphabetically
 */
export const getAllCountryNames = (): string[] => {
  const countryObj = countries.getNames('en', { select: 'official' });
  return Object.entries(countryObj)
    .filter(([code]) => !EXCLUDED_COUNTRIES.includes(code))
    .map(([_, name]) => name)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Get all country codes (excluding specified countries)
 * @returns Array of ISO 3166-1 Alpha-2 country codes
 */
export const getAllCountryCodes = (): string[] => {
  return Object.keys(countries.getAlpha2Codes())
    .filter(code => !EXCLUDED_COUNTRIES.includes(code))
    .sort();
};

/**
 * Get country code to name mapping (excluding specified countries)
 * @returns Record of country codes to names
 */
export const getCountryCodeMap = (): Record<string, string> => {
  const countryObj = countries.getNames('en', { select: 'official' });
  const result: Record<string, string> = {};

  Object.entries(countryObj).forEach(([code, name]) => {
    if (!EXCLUDED_COUNTRIES.includes(code)) {
      result[code] = name;
    }
  });

  return result;
};

// Legacy export for backward compatibility
export const COUNTRY_CODE_MAP = getCountryCodeMap();

/**
 * Convert ISO country code to full country name
 * @param code - ISO 3166-1 Alpha-2 country code (e.g., 'US', 'GB')
 * @returns Full country name or the original code if not found
 */
export const getCountryName = (code: string): string => {
  if (!code) return '';
  const upperCode = code.toUpperCase();

  // Return empty if excluded
  if (EXCLUDED_COUNTRIES.includes(upperCode)) return '';

  return countries.getName(upperCode, 'en') || code;
};

/**
 * Convert country name to ISO country code
 * @param name - Full country name
 * @returns ISO 3166-1 Alpha-2 country code or empty string if not found
 */
export const getCountryCode = (name: string): string => {
  if (!name) return '';
  const code = countries.getAlpha2Code(name, 'en');

  // Return empty if excluded
  if (code && EXCLUDED_COUNTRIES.includes(code)) return '';

  return code || '';
};

/**
 * Check if a country code is valid
 * @param code - ISO 3166-1 Alpha-2 country code
 * @returns true if valid and not excluded, false otherwise
 */
export const isValidCountryCode = (code: string): boolean => {
  if (!code) return false;
  const upperCode = code.toUpperCase();

  if (EXCLUDED_COUNTRIES.includes(upperCode)) return false;

  return countries.isValid(upperCode);
};

/**
 * Search countries by partial name
 * @param searchTerm - Partial country name to search for
 * @returns Array of matching country codes and names
 */
export const searchCountries = (searchTerm: string): Array<{ code: string; name: string }> => {
  if (!searchTerm) return [];

  const lowerSearch = searchTerm.toLowerCase();
  const countryObj = countries.getNames('en', { select: 'official' });

  return Object.entries(countryObj)
    .filter(([code, name]) =>
      !EXCLUDED_COUNTRIES.includes(code) &&
      name.toLowerCase().includes(lowerSearch)
    )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get countries for dropdown/select (returns array of objects with value and label)
 * @returns Array of { value: string, label: string } for use in select components
 */
export const getCountriesForSelect = (): Array<{ value: string; label: string }> => {
  const countryObj = countries.getNames('en', { select: 'official' });

  return Object.entries(countryObj)
    .filter(([code]) => !EXCLUDED_COUNTRIES.includes(code))
    .map(([_, name]) => ({ value: name, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
