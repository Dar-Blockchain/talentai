/** Email: local@domain.tld with word boundaries */
const EMAIL_PATTERN =
  /\b[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}\b/;

const PHONE_PATTERNS: RegExp[] = [
  // International +: +216 53 508 615 / +1 234-567-8901 / +33 6 12 34 56 78
  /\+\d{1,3}(?:[\s.-]?\d){6,14}/,
  // 00 international: 00216 53 508 615
  /\b00\d{1,3}(?:[\s.-]?\d){6,14}/,
  // US/NA: (123) 456-7890
  /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  // Dashed groups: 123-456-7890
  /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/,
  // European spaced: 12 345 67 89
  /\b\d{2}[\s.-]\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/,
  // Plain 7+ digits
  /\b\d{7,}\b/,
];

export const containsEmailAddress = (text: string) => EMAIL_PATTERN.test(String(text || ""));

export const containsPhoneNumber = (text: string) =>
  PHONE_PATTERNS.some((re) => re.test(String(text || "")));

export const getBlockedMessageReason = (text: string): "email" | "phone" | null => {
  if (containsEmailAddress(text)) return "email";
  if (containsPhoneNumber(text)) return "phone";
  return null;
};
