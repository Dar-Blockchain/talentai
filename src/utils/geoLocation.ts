export const getUserLocation = async (signal?: AbortSignal): Promise<{
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  loc?: string;
} | null> => {
  try {
    const response = await fetch('https://ipinfo.io/json', { signal });
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        timezone: data.timezone,
        loc: data.loc,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.warn('Could not fetch location:', error);
    }
  }

  return null;
};
