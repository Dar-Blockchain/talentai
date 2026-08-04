import type { TFunction } from "i18next";

/** Stored in Redux when the API returns no usable message; resolved in UI via i18n. */
export const DEPARTMENT_API_ERROR_I18N = {
  create: "talentai:department:create_failed",
  update: "talentai:department:update_failed",
  delete: "talentai:department:delete_failed",
  fetchList: "talentai:department:fetch_list_failed",
} as const;

export function extractAxiosErrorMessage(err: unknown): string | null {
  const e = err as { response?: { data?: unknown } };
  const data = e?.response?.data;
  if (data && typeof data === "object" && data !== null) {
    const rec = data as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message.trim()) return rec.message.trim();
    if (typeof rec.error === "string" && rec.error.trim()) return rec.error.trim();
  }
  if (typeof data === "string" && data.trim()) return data.trim();
  return null;
}

export function resolveDepartmentApiMessage(
  message: string | null | undefined,
  t: TFunction,
): string | null {
  if (message == null || message === "") return null;
  switch (message) {
    case DEPARTMENT_API_ERROR_I18N.create:
      return t("pages.departments.errors.create_failed");
    case DEPARTMENT_API_ERROR_I18N.update:
      return t("pages.departments.errors.update_failed");
    case DEPARTMENT_API_ERROR_I18N.delete:
      return t("pages.departments.errors.delete_failed");
    case DEPARTMENT_API_ERROR_I18N.fetchList:
      return t("pages.departments.errors.fetch_list_failed");
    default:
      return message;
  }
}
