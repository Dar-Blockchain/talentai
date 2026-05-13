export const normalizeId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return normalizeId((value as { _id?: unknown })._id);
  }
  return String(value);
};
