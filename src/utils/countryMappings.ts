/**
 * ISO 3166-1 Alpha-2 Country Code to Country Name Mappings
 * Extracted from admin dashboard to improve maintainability
 */

export const COUNTRY_CODE_MAP: Record<string, string> = {
  // North America
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',

  // South America
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'EC': 'Ecuador',
  'BO': 'Bolivia',
  'PY': 'Paraguay',
  'UY': 'Uruguay',
  'GY': 'Guyana',
  'SR': 'Suriname',
  'GF': 'French Guiana',

  // Europe
  'GB': 'United Kingdom',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'PT': 'Portugal',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'IS': 'Iceland',
  'IE': 'Ireland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'SK': 'Slovakia',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'GR': 'Greece',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'RS': 'Serbia',
  'BA': 'Bosnia and Herzegovina',
  'ME': 'Montenegro',
  'MK': 'North Macedonia',
  'AL': 'Albania',
  'XK': 'Kosovo',
  'EE': 'Estonia',
  'LV': 'Latvia',
  'LT': 'Lithuania',
  'BY': 'Belarus',
  'UA': 'Ukraine',
  'MD': 'Moldova',

  // Middle East
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'SY': 'Syria',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'TR': 'Turkey',
  'IL': 'Israel',
  'PS': 'Palestine',
  'YE': 'Yemen',

  // Asia
  'CN': 'China',
  'JP': 'Japan',
  'IN': 'India',
  'PK': 'Pakistan',
  'AF': 'Afghanistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'MV': 'Maldives',
  'MM': 'Myanmar',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'LA': 'Laos',
  'KH': 'Cambodia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'KR': 'South Korea',
  'KP': 'North Korea',
  'MN': 'Mongolia',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'AZ': 'Azerbaijan',
  'GE': 'Georgia',
  'AM': 'Armenia',

  // Africa
  'EG': 'Egypt',
  'DZ': 'Algeria',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'LY': 'Libya',
  'SD': 'Sudan',
  'SS': 'South Sudan',
  'ET': 'Ethiopia',
  'KE': 'Kenya',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'RW': 'Rwanda',
  'BI': 'Burundi',
  'SO': 'Somalia',
  'DJ': 'Djibouti',
  'ER': 'Eritrea',
  'NG': 'Nigeria',
  'GH': 'Ghana',
  'CI': 'Ivory Coast',
  'SN': 'Senegal',
  'ML': 'Mali',
  'NE': 'Niger',
  'BF': 'Burkina Faso',
  'BJ': 'Benin',
  'TG': 'Togo',
  'CM': 'Cameroon',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'GA': 'Gabon',
  'CG': 'Congo',
  'CD': 'Democratic Republic of Congo',
  'AO': 'Angola',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
  'BW': 'Botswana',
  'NA': 'Namibia',
  'ZA': 'South Africa',
  'LS': 'Lesotho',
  'SZ': 'Eswatini',
  'MZ': 'Mozambique',
  'MW': 'Malawi',
  'MG': 'Madagascar',
  'MU': 'Mauritius',
  'SC': 'Seychelles',
  'KM': 'Comoros',
  'MR': 'Mauritania',
  'GM': 'Gambia',
  'GW': 'Guinea-Bissau',
  'GN': 'Guinea',
  'SL': 'Sierra Leone',
  'LR': 'Liberia',

  // Oceania
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'PG': 'Papua New Guinea',
  'FJ': 'Fiji',
  'SB': 'Solomon Islands',
  'VU': 'Vanuatu',
  'NC': 'New Caledonia',
  'PF': 'French Polynesia',
  'WS': 'Samoa',
  'TO': 'Tonga',
  'KI': 'Kiribati',
  'FM': 'Micronesia',
  'MH': 'Marshall Islands',
  'PW': 'Palau',
  'NR': 'Nauru',
  'TV': 'Tuvalu',

  // Central America & Caribbean
  'GT': 'Guatemala',
  'BZ': 'Belize',
  'SV': 'El Salvador',
  'HN': 'Honduras',
  'NI': 'Nicaragua',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'CU': 'Cuba',
  'JM': 'Jamaica',
  'HT': 'Haiti',
  'DO': 'Dominican Republic',
  'PR': 'Puerto Rico',
  'TT': 'Trinidad and Tobago',
  'BB': 'Barbados',
  'GD': 'Grenada',
  'VC': 'Saint Vincent and the Grenadines',
  'LC': 'Saint Lucia',
  'DM': 'Dominica',
  'AG': 'Antigua and Barbuda',
  'KN': 'Saint Kitts and Nevis',
  'BS': 'Bahamas',

  // Others
  'RU': 'Russia',
  'GL': 'Greenland',
  'CY': 'Cyprus',
  'MT': 'Malta',
  'LU': 'Luxembourg',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'AD': 'Andorra',
  'SM': 'San Marino',
  'VA': 'Vatican City',
};

/**
 * Convert ISO country code to full country name
 * @param code - ISO 3166-1 Alpha-2 country code (e.g., 'US', 'GB')
 * @returns Full country name or the original code if not found
 */
export const getCountryName = (code: string): string => {
  if (!code) return '';
  const upperCode = code.toUpperCase();
  return COUNTRY_CODE_MAP[upperCode] || code;
};

/**
 * Check if a country code is valid
 * @param code - ISO 3166-1 Alpha-2 country code
 * @returns true if valid, false otherwise
 */
export const isValidCountryCode = (code: string): boolean => {
  return code?.toUpperCase() in COUNTRY_CODE_MAP;
};

/**
 * Get all country codes
 * @returns Array of all supported country codes
 */
export const getAllCountryCodes = (): string[] => {
  return Object.keys(COUNTRY_CODE_MAP);
};

/**
 * Get all country names
 * @returns Array of all country names
 */
export const getAllCountryNames = (): string[] => {
  return Object.values(COUNTRY_CODE_MAP);
};

/**
 * Search countries by partial name
 * @param searchTerm - Partial country name to search for
 * @returns Array of matching country codes and names
 */
export const searchCountries = (searchTerm: string): Array<{ code: string; name: string }> => {
  const lowerSearch = searchTerm.toLowerCase();
  return Object.entries(COUNTRY_CODE_MAP)
    .filter(([_, name]) => name.toLowerCase().includes(lowerSearch))
    .map(([code, name]) => ({ code, name }));
};
