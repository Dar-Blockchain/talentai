/**
 * Toast copy when a message was saved but not delivered (shared/chat namespace).
 */
export function deliveryBlockedToastMessage(
  blockedReason: "email" | "phone" | undefined,
  t: (key: string) => string,
): string {
  return blockedReason === "phone"
    ? t("toast.contact_not_delivered_phone")
    : t("toast.contact_not_delivered_email");
}
