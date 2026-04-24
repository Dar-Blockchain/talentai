export const formatNumber = (num: any) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // ← Use lowercase 'k'
  }
  return num.toString();
};

export const calculateTaiTokens = (price: number) => {
  return price ? Math.floor(price * 1000) : 0;
};

export const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

export const stringAvatar = (name: string) => {
  const parts = name.trim().toUpperCase().split(" ");
  return {
    sx: { bgcolor: stringToColor(name) },
    children: `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`,
  };
};

export const normalizeQueryParam = (param?: string | string[]) => {
  if (!param) return "";
  return Array.isArray(param) ? param[0] : param;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const isEmpty = (value: any) =>
  value === undefined || value === null || value === "";

export const isInvalidNumber = (value: any) =>
  isEmpty(value) || isNaN(Number(value));

export const isDeadlinePassed = (deadline?: string): boolean => {
  if (!deadline) return false;
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999); // end of day in local timezone
  return end.getTime() < Date.now();
};

export const daysLeft = (deadline?: string) => {
  if (!deadline) return null;
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999); // end of day in local timezone
  const diff = Math.ceil(
    (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};

export const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export const formatTimeLeft = (s: number) => {
  if (s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

/**
 * Formats a date into a relative time string (e.g., "3 days ago", "1 month ago")
 */
export function formatTimeAgo(date: string | Date | undefined): string {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 0) return 'just now';

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return count === 1
        ? `${count} ${interval.label} ago`
        : `${count} ${interval.label}s ago`;
    }
  }

  return 'just now';
}
