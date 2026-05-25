export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const getDaysLeft = (expirationDate?: string): number | null => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

export const getPostShareLink = (jobId: string, companyId?: string): string => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/candidate/interview/hr?jobId=${jobId}${companyId ? `&companyId=${companyId}` : ""}&ref=link`;
};
