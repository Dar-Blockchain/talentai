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
  /\b\+\d{1,3}[\s.-]?\d{6,14}\b/,
  /\b00\d{1,3}[\s.-]?\d{6,14}\b/,
  /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/,
  /\b\d{2}[\s.-]\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/,
  /\b\d{10,11}\b/,
];

const matchesPhonePattern = (text) => PHONE_PATTERNS.some((re) => re.test(text));

const detectEmail = (text) => EMAIL_PATTERN.test(String(text || ""));

const detectPhone = (text) => matchesPhonePattern(String(text || ""));

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
