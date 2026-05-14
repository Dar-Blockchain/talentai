/** Email: local@domain.tld with word boundaries */
const EMAIL_PATTERN =
  /\b[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}\b/;

const PHONE_PATTERNS: RegExp[] = [
  /\b\+\d{1,3}[\s.-]?\d{6,14}\b/,
  /\b00\d{1,3}[\s.-]?\d{6,14}\b/,
  /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/,
  /\b\d{2}[\s.-]\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/,
  /\b\d{10,11}\b/,
];

export const containsEmailAddress = (text: string) => EMAIL_PATTERN.test(String(text || ""));

export const containsPhoneNumber = (text: string) =>
  PHONE_PATTERNS.some((re) => re.test(String(text || "")));

export const getBlockedMessageReason = (text: string): "email" | "phone" | null => {
  if (containsEmailAddress(text)) return "email";
  if (containsPhoneNumber(text)) return "phone";
  return null;
};
