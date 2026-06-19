/**
 * Detect email addresses and phone-like sequences in chat text.
 * Used to allow "send" but block delivery to the peer (team + legacy chat).
 */

/** Email: local@domain.tld with word boundaries (reduces false positives on "file@v1") */
const EMAIL_PATTERN =
  /\b[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}\b/;

/**
 * Phone: international (+…), US-style groups, or 10+ digits with separators.
 * Avoid matching tiny integers (e.g. "v2") by requiring length / structure.
 */
const PHONE_PATTERNS = [
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
  // Spaced/dashed groups: 216 53 508 615 / 216-53-508-615
  /\b\d{3,4}(?:[\s\-.]\d{2,4}){2,}\b/,
];

const matchesPhonePattern = (text) => PHONE_PATTERNS.some((re) => re.test(text));

// Catches +/00 prefixed numbers where digits are spread across space-separated groups.
// Extracts every +/00 sequence, strips non-digits, and checks for 7+ total digits.
const hasIntlPhoneByDigitCount = (text) => {
  const segs = String(text || "").match(/(?:\+|00)[\d\s.\-]{5,30}/g) || [];
  return segs.some((s) => (s.match(/\d/g) || []).length >= 7);
};

const detectEmail = (text) => EMAIL_PATTERN.test(String(text || ""));

const detectPhone = (text) => {
  const raw = String(text || "");
  return matchesPhonePattern(raw) || hasIntlPhoneByDigitCount(raw);
};

/**
 * @param {string} text
 * @returns {{ blocked: false } | { blocked: true, reason: 'email' | 'phone' }}
 */
const detectContactSharing = (text) => {
  const raw = String(text || "");
  if (detectEmail(raw)) return { blocked: true, reason: "email" };
  if (detectPhone(raw)) return { blocked: true, reason: "phone" };
  return { blocked: false };
};

module.exports = {
  EMAIL_PATTERN,
  detectContactSharing,
  detectEmail,
  detectPhone,
};
