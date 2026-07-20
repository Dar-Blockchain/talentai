export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

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
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

export const fmtSalary = (
  s: { min?: number; max?: number; currency?: string } | null | undefined,
): string | null => {
  if (!s?.min && !s?.max) return null;
  const c = s.currency || "$";
  const f = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
  if (s.min && s.max) return `${c}${f(s.min)} – ${c}${f(s.max)}`;
  return s.max ? `≤${c}${f(s.max)}` : `${c}${f(s.min!)}+`;
};

export const scoreTier = (score: number): "high" | "mid" | "low" | "crit" =>
  score >= 80 ? "high" : score >= 60 ? "mid" : score >= 40 ? "low" : "crit";

// navigator.clipboard.writeText silently rejects in some contexts (no
// document focus, insecure origin, permissions-policy) — fall back to the
// execCommand copy trick so "copy link" buttons still work there.
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy fallback below
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};
