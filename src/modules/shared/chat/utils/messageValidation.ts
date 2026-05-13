const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

export const containsEmailAddress = (text: string) => EMAIL_PATTERN.test(text);

export const containsPhoneNumber = (text: string) => PHONE_PATTERN.test(text);

export const getBlockedMessageReason = (text: string): "email" | "phone" | null => {
  if (containsEmailAddress(text)) return "email";
  if (containsPhoneNumber(text)) return "phone";
  return null;
};
