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

export const daysLeft = (deadline?: string) => {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
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